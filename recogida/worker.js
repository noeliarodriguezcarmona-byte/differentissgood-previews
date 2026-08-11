/**
 * Recogida del cuestionario de Differentissgood.
 *
 * Deja cada envío dentro de un repositorio de GitHub, listo para abrirlo con
 * Claude Code y construir la web sin mover un archivo:
 *
 *   clientes/2026-08-11-panaderia-la-espiga/
 *     respuestas.md
 *     equipo/…  servicios/…  local/…  logotipo…
 *
 * Se pega tal cual en el editor de Workers de Cloudflare. No hace falta
 * terminal ni tarjeta: el plan gratuito de Workers no pide método de pago.
 *
 * Variables a definir en Settings → Variables and Secrets:
 *   GITHUB_TOKEN   (secreto)  token con permiso de escritura solo en ese repo
 *   GITHUB_REPO               p. ej. noeliarodriguezcarmona-byte/clientes
 *   ORIGENES                  direcciones desde las que se aceptan envíos
 */

const MAX_MB = 20;              // tope por archivo que admite bien la API de GitHub
const CABECERAS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export default {
  async fetch(peticion, entorno) {
    const url = new URL(peticion.url);
    const origen = permitido(peticion.headers.get('Origin') || '', entorno);

    if (peticion.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origen) });

    try {
      if (url.pathname === '/api/estado') {
        return json({ ok: true, repo: entorno.GITHUB_REPO || null, maxMB: MAX_MB }, 200, origen);
      }
      if (url.pathname === '/api/archivo' && peticion.method === 'POST') {
        return await guardarArchivo(peticion, entorno, origen);
      }
      if (url.pathname === '/api/enviar' && peticion.method === 'POST') {
        return await guardarCuestionario(peticion, entorno, origen);
      }
      return json({ error: 'Ruta no encontrada' }, 404, origen);
    } catch (e) {
      console.error('Fallo:', e && e.stack ? e.stack : e);
      return json({ error: 'Error interno' }, 500, origen);
    }
  },
};

/* ------------------------------------------------------------------ ayudas */

function permitido(origen, entorno) {
  const lista = (entorno.ORIGENES || '').split(',').map((s) => s.trim()).filter(Boolean);
  return lista.includes(origen) ? origen : (lista[0] || '*');
}

function cors(origen) {
  return {
    ...CABECERAS,
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

/** Convierte un texto en algo válido para una ruta: sin tildes ni signos. */
function ruta(texto, largo = 70) {
  return String(texto || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, largo) || 'sin-nombre';
}

/** Carpeta a la que va cada archivo según de qué pregunta venga. */
function carpetaDe(campo) {
  const c = String(campo || '').toLowerCase();
  if (c.includes('persona')) return 'equipo';
  if (c.includes('servicio')) return 'servicios';
  if (c.includes('logotipo')) return '';
  if (c.includes('local')) return 'local';
  if (c.includes('trabajo')) return 'trabajos';
  if (c.includes('vídeo') || c.includes('video') || c.includes('testimonio')) return 'testimonios';
  return 'otros';
}

function base64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binario = '';
  const trozo = 0x8000; // por trozos, para no reventar la pila
  for (let i = 0; i < bytes.length; i += trozo) {
    binario += String.fromCharCode.apply(null, bytes.subarray(i, i + trozo));
  }
  return btoa(binario);
}

/* -------------------------------------------------------------- GitHub */

async function escribirEnGitHub(entorno, camino, contenidoB64, mensaje) {
  if (!entorno.GITHUB_TOKEN || !entorno.GITHUB_REPO) {
    throw new Error('Falta configurar GITHUB_TOKEN o GITHUB_REPO');
  }
  const url = `https://api.github.com/repos/${entorno.GITHUB_REPO}/contents/${
    camino.split('/').map(encodeURIComponent).join('/')}`;

  // Dos intentos: un tropiezo de red no debe costar un archivo
  let ultimo = '';
  for (let intento = 1; intento <= 2; intento++) {
    const r = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${entorno.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'cuestionario-differentissgood',
      },
      body: JSON.stringify({ message: mensaje, content: contenidoB64 }),
    });
    if (r.ok) return (await r.json()).content.path;
    ultimo = `${r.status} ${(await r.text()).slice(0, 300)}`;
    if (r.status >= 400 && r.status < 500 && r.status !== 429) break; // error nuestro: no insistir
    await new Promise((s) => setTimeout(s, 800));
  }
  throw new Error('GitHub: ' + ultimo);
}

/* ------------------------------------------------------- guardar archivo */

async function guardarArchivo(peticion, entorno, origen) {
  const url = new URL(peticion.url);
  const carpetaEnvio = ruta(url.searchParams.get('envio'), 90);
  const campo = url.searchParams.get('campo') || '';
  const nombre = url.searchParams.get('archivo') || 'archivo';

  if (!carpetaEnvio) return json({ error: 'Falta la carpeta del envío' }, 400, origen);

  const datos = await peticion.arrayBuffer();
  if (datos.byteLength > MAX_MB * 1024 * 1024) {
    return json({ error: `«${nombre}» pasa de ${MAX_MB} MB` }, 413, origen);
  }

  const punto = nombre.lastIndexOf('.');
  const extension = punto > 0 ? ruta(nombre.slice(punto + 1), 8) : 'bin';
  const base = ruta(punto > 0 ? nombre.slice(0, punto) : nombre, 50);
  const sub = carpetaDe(campo);

  // El nombre del campo va delante: así se sabe de qué persona o servicio es
  const etiqueta = ruta(campo, 40);
  const archivo = `${etiqueta}-${base}.${extension}`;
  const camino = `clientes/${carpetaEnvio}/${sub ? sub + '/' : ''}${archivo}`;

  const guardado = await escribirEnGitHub(
    entorno, camino, base64(datos), `Cuestionario ${carpetaEnvio}: ${archivo}`
  );
  return json({ ok: true, camino: guardado }, 200, origen);
}

/* --------------------------------------------------- guardar respuestas */

async function guardarCuestionario(peticion, entorno, origen) {
  let d;
  try { d = await peticion.json(); } catch { return json({ error: 'No se han podido leer las respuestas' }, 400, origen); }

  const carpetaEnvio = ruta(d.envio, 90);
  const respuestas = Array.isArray(d.respuestas) ? d.respuestas : [];
  const archivos = Array.isArray(d.archivos) ? d.archivos : [];
  if (!carpetaEnvio || !respuestas.length) return json({ error: 'El cuestionario venía vacío' }, 400, origen);

  const md = componerMarkdown(carpetaEnvio, respuestas, archivos);
  const camino = `clientes/${carpetaEnvio}/respuestas.md`;
  const contenido = base64(new TextEncoder().encode(md).buffer);

  await escribirEnGitHub(entorno, camino, contenido, `Cuestionario ${carpetaEnvio}: respuestas`);
  return json({ ok: true, envio: carpetaEnvio, camino }, 200, origen);
}

/** El documento que después se lee para construir la web. */
function componerMarkdown(carpetaEnvio, respuestas, archivos) {
  const negocio = (respuestas.find((r) => /Nombre del negocio/i.test(r.campo)) || {}).valor || carpetaEnvio;
  const plan = (respuestas.find((r) => /^Plan$/i.test(r.campo)) || {}).valor || 'sin especificar';

  let t = `# ${negocio}\n\n`;
  t += `- **Plan:** ${plan}\n`;
  t += `- **Recibido:** ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}\n`;
  t += `- **Carpeta:** \`${carpetaEnvio}\`\n\n---\n`;

  // Agrupado por bloques, en el orden en que se rellenó
  let bloqueActual = null;
  for (const r of respuestas) {
    const bloque = r.bloque || 'Otras respuestas';
    if (bloque !== bloqueActual) {
      t += `\n## ${bloque}\n\n`;
      bloqueActual = bloque;
    }
    const valor = String(r.valor || '').trim();
    t += `**${r.campo}**\n\n${valor.includes('\n') ? valor : valor}\n\n`;
  }

  if (archivos.length) {
    t += `\n---\n\n## Archivos adjuntos\n\n`;
    const porCarpeta = {};
    for (const a of archivos) {
      const c = a.camino.split('/').slice(2, -1).join('/') || '(raíz)';
      (porCarpeta[c] = porCarpeta[c] || []).push(a);
    }
    for (const c of Object.keys(porCarpeta).sort()) {
      t += `### ${c}\n\n`;
      for (const a of porCarpeta[c]) {
        t += `- **${a.campo}** — \`${a.camino.split('/').slice(2).join('/')}\`\n`;
      }
      t += '\n';
    }
  } else {
    t += `\n---\n\n_No se adjuntó ningún archivo._\n`;
  }
  return t;
}
