/**
 * Recogida del cuestionario de Differentissgood.
 *
 * El orden importa: primero se guarda todo en R2 y solo después se intenta el
 * correo. Si el correo falla, el envío ya está a salvo y la clienta ve que se
 * ha recibido — nunca se pierde nada por un fallo del servicio de correo.
 *
 *   POST /api/subir     un archivo suelto  → devuelve su clave en R2
 *   POST /api/enviar    las respuestas     → guarda, avisa por correo
 *   GET  /d/<clave>?t=  descarga un archivo con enlace firmado
 */

const CABECERAS_BASE = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

export default {
  async fetch(peticion, entorno) {
    const url = new URL(peticion.url);
    const origen = peticion.headers.get('Origin') || '';
    const permitido = origenPermitido(origen, entorno);

    if (peticion.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(permitido) });
    }

    try {
      if (url.pathname === '/api/subir' && peticion.method === 'POST') {
        return await subirArchivo(peticion, entorno, permitido);
      }
      if (url.pathname === '/api/enviar' && peticion.method === 'POST') {
        return await recibirEnvio(peticion, entorno, permitido);
      }
      if (url.pathname.startsWith('/d/') && peticion.method === 'GET') {
        return await descargar(url, entorno);
      }
      if (url.pathname === '/api/estado') {
        return json({ ok: true, servicio: 'cuestionario' }, 200, permitido);
      }
      return json({ error: 'Ruta no encontrada' }, 404, permitido);
    } catch (e) {
      // Nunca se devuelve la traza al navegador
      console.error('Fallo no previsto:', e && e.stack ? e.stack : e);
      return json({ error: 'Error interno' }, 500, permitido);
    }
  },
};

/* ------------------------------------------------------------------ ayudas */

function origenPermitido(origen, entorno) {
  const lista = (entorno.ORIGENES || '').split(',').map((s) => s.trim()).filter(Boolean);
  return lista.includes(origen) ? origen : lista[0] || '*';
}

function cors(origen) {
  return {
    ...CABECERAS_BASE,
    'Access-Control-Allow-Origin': origen,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(cuerpo, estado, origen) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...cors(origen), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** Deja un texto en algo seguro para usar como nombre de archivo. */
function limpiar(texto, largo = 80) {
  return String(texto || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._ -]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, largo) || 'sin-nombre';
}

function escapar(texto) {
  return String(texto == null ? '' : texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Identificador del envío: ordena por fecha y no se repite. */
function nuevoId() {
  const f = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `${f}-${crypto.randomUUID().slice(0, 8)}`;
}

/* --------------------------------------------------- firma de las descargas */

async function firmar(clave, secreto) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const firma = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(clave));
  return [...new Uint8Array(firma)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Comparación en tiempo constante: no delata el fallo por lo que tarda. */
function igual(a, b) {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}

/* ------------------------------------------------------- subir un archivo */

async function subirArchivo(peticion, entorno, origen) {
  const url = new URL(peticion.url);
  const envio = limpiar(url.searchParams.get('envio'), 60);
  const campo = limpiar(url.searchParams.get('campo'), 60);
  const nombre = limpiar(url.searchParams.get('archivo'), 90);

  if (!envio || !campo) return json({ error: 'Faltan datos del archivo' }, 400, origen);

  const maxBytes = Number(entorno.MAX_MB || 95) * 1024 * 1024;
  const declarado = Number(peticion.headers.get('Content-Length') || 0);
  if (declarado > maxBytes) {
    return json({ error: `El archivo pasa de ${entorno.MAX_MB} MB` }, 413, origen);
  }

  const clave = `envios/${envio}/archivos/${campo}/${Date.now()}-${nombre}`;
  await entorno.ARCHIVOS.put(clave, peticion.body, {
    httpMetadata: {
      contentType: peticion.headers.get('Content-Type') || 'application/octet-stream',
      contentDisposition: `attachment; filename="${nombre}"`,
    },
    customMetadata: { envio, campo, nombre },
  });

  return json({ ok: true, clave, nombre }, 200, origen);
}

/* ------------------------------------------------- recibir las respuestas */

async function recibirEnvio(peticion, entorno, origen) {
  let datos;
  try {
    datos = await peticion.json();
  } catch {
    return json({ error: 'No se han podido leer las respuestas' }, 400, origen);
  }

  const envio = limpiar(datos.envio, 60) || nuevoId();
  const respuestas = Array.isArray(datos.respuestas) ? datos.respuestas : [];
  const archivos = Array.isArray(datos.archivos) ? datos.archivos : [];

  if (!respuestas.length) return json({ error: 'El cuestionario venía vacío' }, 400, origen);

  const recibido = new Date().toISOString();
  const registro = { envio, recibido, respuestas, archivos };

  // 1. Guardar primero. A partir de aquí el envío ya no se puede perder.
  await entorno.ARCHIVOS.put(`envios/${envio}/respuestas.json`, JSON.stringify(registro, null, 2), {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
  });

  const base = new URL(peticion.url).origin;
  const html = await construirCorreo(registro, base, entorno);

  await entorno.ARCHIVOS.put(`envios/${envio}/resumen.html`, html, {
    httpMetadata: { contentType: 'text/html; charset=utf-8' },
  });

  // 2. Avisar. Si esto falla, el envío sigue guardado y se deja constancia.
  let correo = { enviado: false };
  try {
    correo = await avisarPorCorreo(registro, html, entorno);
  } catch (e) {
    correo = { enviado: false, motivo: String(e && e.message ? e.message : e) };
  }
  if (!correo.enviado) {
    console.error('Aviso por correo no entregado:', envio, correo.motivo);
    await entorno.ARCHIVOS.put(`envios/${envio}/correo-fallido.json`,
      JSON.stringify({ ...correo, recibido }, null, 2),
      { httpMetadata: { contentType: 'application/json; charset=utf-8' } });
  }

  // Se responde bien igualmente: el cuestionario está a salvo.
  return json({ ok: true, envio, aviso: correo.enviado }, 200, origen);
}

/* ---------------------------------------------------- el correo de aviso */

async function construirCorreo(registro, base, entorno) {
  const secreto = entorno.FIRMA || 'sin-firma';

  const filas = registro.respuestas.map((r) => `
    <tr>
      <td style="padding:9px 14px;border-bottom:1px solid #e8e2d6;vertical-align:top;width:34%;
                 font:600 13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#5a5145;">
        ${escapar(r.campo)}
      </td>
      <td style="padding:9px 14px;border-bottom:1px solid #e8e2d6;
                 font:400 14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#1c1712;
                 white-space:pre-wrap;">${escapar(r.valor)}</td>
    </tr>`).join('');

  const enlaces = [];
  for (const a of registro.archivos) {
    const t = await firmar(a.clave, secreto);
    enlaces.push(`
      <li style="margin-bottom:7px;font:400 13.5px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;">
        <span style="color:#5a5145;">${escapar(a.campo)}:</span>
        <a href="${base}/d/${encodeURIComponent(a.clave)}?t=${t}"
           style="color:#DD6B3A;font-weight:600;">${escapar(a.nombre)}</a>
      </li>`);
  }

  const bloqueArchivos = enlaces.length
    ? `<h3 style="font:600 15px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;color:#1c1712;margin:26px 0 10px;">
         Archivos adjuntos (${enlaces.length})</h3>
       <ul style="margin:0;padding-left:18px;">${enlaces.join('')}</ul>
       <p style="font:400 12px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#8a8073;margin-top:10px;">
         Los enlaces llevan al almacén propio, no caducan y solo funcionan con esta firma.</p>`
    : `<p style="font:400 13px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#8a8073;margin-top:22px;">
         No se adjuntó ningún archivo.</p>`;

  return `<!doctype html><html><body style="margin:0;background:#f7f2e9;padding:26px;">
  <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;
              border:1px solid #e8e2d6;">
    <div style="background:#1c1712;padding:24px 26px;">
      <p style="margin:0;font:700 11px/1 -apple-system,Segoe UI,Roboto,sans-serif;
                letter-spacing:.18em;text-transform:uppercase;color:#DD6B3A;">Differentissgood</p>
      <h1 style="margin:9px 0 0;font:500 24px/1.2 Georgia,serif;color:#F5EFE4;">
        Nuevo cuestionario recibido</h1>
      <p style="margin:8px 0 0;font:400 13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#a99f91;">
        ${escapar(registro.envio)}</p>
    </div>
    <div style="padding:24px 26px;">
      <table style="width:100%;border-collapse:collapse;">${filas}</table>
      ${bloqueArchivos}
    </div>
  </div></body></html>`;
}

async function avisarPorCorreo(registro, html, entorno) {
  if (!entorno.RESEND_API_KEY) {
    return { enviado: false, motivo: 'Falta la clave RESEND_API_KEY' };
  }

  const quien = registro.respuestas.find((r) => /Nombre del negocio/i.test(r.campo));
  const asunto = quien && quien.valor
    ? `Cuestionario nuevo — ${quien.valor}`
    : 'Cuestionario nuevo — Differentissgood';

  const responder = registro.respuestas.find((r) => /Correo de contacto/i.test(r.campo));

  // Dos intentos: un fallo de red pasajero no debe costar un aviso
  let ultimo = '';
  for (let intento = 1; intento <= 2; intento++) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${entorno.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: entorno.CORREO_ORIGEN,
        to: [entorno.CORREO_DESTINO],
        subject: asunto,
        html,
        ...(responder && responder.valor ? { reply_to: responder.valor } : {}),
      }),
    });
    if (r.ok) return { enviado: true };
    ultimo = `${r.status} ${await r.text()}`;
    if (r.status >= 400 && r.status < 500 && r.status !== 429) break; // no se reintenta un error nuestro
    await new Promise((s) => setTimeout(s, 700));
  }
  return { enviado: false, motivo: ultimo };
}

/* ------------------------------------------------------ descargar archivo */

async function descargar(url, entorno) {
  const clave = decodeURIComponent(url.pathname.slice(3));
  const t = url.searchParams.get('t') || '';
  const esperado = await firmar(clave, entorno.FIRMA || 'sin-firma');

  if (!igual(t, esperado)) {
    return new Response('Enlace no válido', { status: 403, headers: CABECERAS_BASE });
  }

  const objeto = await entorno.ARCHIVOS.get(clave);
  if (!objeto) return new Response('Archivo no encontrado', { status: 404, headers: CABECERAS_BASE });

  const cabeceras = new Headers(CABECERAS_BASE);
  objeto.writeHttpMetadata(cabeceras);
  cabeceras.set('etag', objeto.httpEtag);
  return new Response(objeto.body, { headers: cabeceras });
}
