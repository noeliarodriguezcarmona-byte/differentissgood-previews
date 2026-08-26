/**
 * Recogida del cuestionario de Differentissgood — versión Netlify.
 *
 * Hace lo mismo que `recogida/worker.js` (la versión de Cloudflare): deja cada
 * envío en el repositorio PRIVADO `clientes`, en la carpeta de su código:
 *
 *   proyectos/DIG-2026-001-I/
 *     envio.txt          el envío tal y como llegó, sin tocar
 *     archivos/
 *       equipo/…  servicios/…  local/…  logotipo…
 *
 * Después, en local:
 *   node _herramientas/generar-brief.mjs proyectos/DIG-2026-001-I/envio.txt
 *
 * Variables de entorno (Project configuration → Environment variables):
 *   GITHUB_TOKEN   (secreto)  token con permiso de escritura SOLO en `clientes`
 *   GITHUB_REPO               p. ej. noeliarodriguezcarmona-byte/clientes
 *   ORIGENES                  direcciones desde las que se aceptan envíos
 *
 * Lleva cabeceras CORS a propósito: el cuestionario se sirve desde otro
 * dominio (GitHub Pages hoy, differentissgood.com después) y sin ellas el
 * navegador rechazaría el envío.
 */

import type { Config } from '@netlify/functions';

const MAX_MB = 20;                              // tope por archivo que admite bien la API de GitHub
const RE_CODIGO = /^DIG-\d{4}-\d{3}-[ICE]$/;    // mismo formato que el cuestionario y el contrato

export default async (peticion: Request) => {
  const url = new URL(peticion.url);
  const origen = permitido(peticion.headers.get('Origin') || '');

  if (peticion.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors(origen) });
  }

  try {
    if (url.pathname === '/api/estado') {
      return await estado(url, origen);
    }
    if (url.pathname === '/api/archivo' && peticion.method === 'POST') {
      return await guardarArchivo(peticion, origen);
    }
    if (url.pathname === '/api/enviar' && peticion.method === 'POST') {
      return await guardarCuestionario(peticion, origen);
    }
    return json({ error: 'Ruta no encontrada' }, 404, origen);
  } catch (e) {
    console.error('Fallo:', e instanceof Error ? e.stack : e);
    return json({ error: 'Error interno' }, 500, origen);
  }
};

export const config: Config = {
  path: ['/api/estado', '/api/archivo', '/api/enviar'],
};

/* ------------------------------------------------------------------ ayudas */

function entorno(clave: string): string {
  return Netlify.env.get(clave) || '';
}

function permitido(origen: string): string {
  const lista = entorno('ORIGENES').split(',').map((s) => s.trim()).filter(Boolean);
  return lista.includes(origen) ? origen : (lista[0] || '*');
}

function cors(origen: string): Record<string, string> {
  return {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': origen,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(cuerpo: unknown, estado: number, origen: string): Response {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...cors(origen), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * Normaliza y valida el código de proyecto. Todo lo que guarda esta función
 * cuelga de él: si no es un código válido, no se escribe nada en ningún sitio.
 */
function codigoDe(valor: unknown): string {
  const c = String(valor || '').trim().toUpperCase();
  return RE_CODIGO.test(c) ? c : '';
}

/** Convierte un texto en algo válido para una ruta: sin tildes ni signos. */
function ruta(texto: unknown, largo = 70): string {
  return String(texto || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, largo) || 'sin-nombre';
}

/** Carpeta a la que va cada archivo según de qué pregunta venga. */
function carpetaDe(campo: string): string {
  const c = String(campo || '').toLowerCase();
  if (c.includes('persona')) return 'equipo';
  if (c.includes('servicio')) return 'servicios';
  if (c.includes('logotipo')) return '';
  if (c.includes('local')) return 'local';
  if (c.includes('trabajo')) return 'trabajos';
  if (c.includes('vídeo') || c.includes('video') || c.includes('testimonio')) return 'testimonios';
  return 'otros';
}

function base64(datos: ArrayBuffer): string {
  return Buffer.from(datos).toString('base64');
}

/* -------------------------------------------------------------- GitHub */

function urlContenidos(camino: string): string {
  return `https://api.github.com/repos/${entorno('GITHUB_REPO')}/contents/${
    camino.split('/').map(encodeURIComponent).join('/')}`;
}

function cabecerasGitHub(): Record<string, string> {
  return {
    Authorization: `Bearer ${entorno('GITHUB_TOKEN')}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'cuestionario-differentissgood',
  };
}

function exigirConfiguracion(): void {
  if (!entorno('GITHUB_TOKEN') || !entorno('GITHUB_REPO')) {
    throw new Error('Falta configurar GITHUB_TOKEN o GITHUB_REPO');
  }
}

/** ¿Existe ya ese archivo en el repositorio? */
async function existeEnGitHub(camino: string): Promise<boolean> {
  exigirConfiguracion();
  const r = await fetch(urlContenidos(camino), { headers: cabecerasGitHub() });
  if (r.status === 404) return false;
  if (r.ok) return true;
  throw new Error('GitHub: ' + r.status + ' ' + (await r.text()).slice(0, 300));
}

async function escribirEnGitHub(camino: string, contenidoB64: string, mensaje: string): Promise<string> {
  exigirConfiguracion();

  // Dos intentos: un tropiezo de red no debe costar un archivo
  let ultimo = '';
  for (let intento = 1; intento <= 2; intento++) {
    const r = await fetch(urlContenidos(camino), {
      method: 'PUT',
      headers: cabecerasGitHub(),
      body: JSON.stringify({ message: mensaje, content: contenidoB64 }),
    });
    if (r.ok) return (await r.json()).content.path;
    ultimo = `${r.status} ${(await r.text()).slice(0, 300)}`;
    if (r.status >= 400 && r.status < 500 && r.status !== 429) break; // error nuestro: no insistir
    await new Promise((s) => setTimeout(s, 800));
  }
  throw new Error('GitHub: ' + ultimo);
}

/* ------------------------------------------------------------------ estado */

/**
 * Sin código: comprobación de vida, para saber si la recogida está configurada.
 * Con código: dice si ese proyecto YA tiene un envío definitivo registrado.
 * Esto es lo que convierte el bloqueo del cuestionario en algo real — si no,
 * solo vive en el navegador del cliente.
 */
async function estado(url: URL, origen: string): Promise<Response> {
  const pedido = url.searchParams.get('codigo');
  if (!pedido) {
    return json({ ok: true, repo: entorno('GITHUB_REPO') || null, maxMB: MAX_MB }, 200, origen);
  }
  const codigo = codigoDe(pedido);
  if (!codigo) return json({ error: 'Código de proyecto no válido' }, 400, origen);

  const enviado = await existeEnGitHub(`proyectos/${codigo}/envio.txt`);
  return json({ ok: true, codigo, enviado, maxMB: MAX_MB }, 200, origen);
}

/* ------------------------------------------------------- guardar archivo */

async function guardarArchivo(peticion: Request, origen: string): Promise<Response> {
  const url = new URL(peticion.url);
  const codigo = codigoDe(url.searchParams.get('codigo'));
  const campo = url.searchParams.get('campo') || '';
  const nombre = url.searchParams.get('archivo') || 'archivo';

  if (!codigo) return json({ error: 'Código de proyecto no válido' }, 400, origen);

  const datos = await peticion.arrayBuffer();
  if (datos.byteLength > MAX_MB * 1024 * 1024) {
    return json({ error: `«${nombre}» pasa de ${MAX_MB} MB` }, 413, origen);
  }

  const punto = nombre.lastIndexOf('.');
  const extension = punto > 0 ? ruta(nombre.slice(punto + 1), 8) : 'bin';
  const base = ruta(punto > 0 ? nombre.slice(0, punto) : nombre, 50);
  const sub = carpetaDe(campo);

  // El nombre del campo va delante: así se sabe de qué persona o servicio es
  const archivo = `${ruta(campo, 40)}-${base}.${extension}`;
  const camino = `proyectos/${codigo}/archivos/${sub ? sub + '/' : ''}${archivo}`;

  const guardado = await escribirEnGitHub(camino, base64(datos), `${codigo}: ${archivo}`);
  return json({ ok: true, camino: guardado }, 200, origen);
}

/* --------------------------------------------------- guardar respuestas */

/**
 * Guarda el envío tal y como llegó, en `proyectos/<CÓDIGO>/envio.txt`.
 * No reescribe el texto ni interpreta nada: ese archivo es la fuente, y quien
 * lo convierte en brief es `generar-brief.mjs`, en local y a mano.
 */
async function guardarCuestionario(peticion: Request, origen: string): Promise<Response> {
  let d: { codigo?: unknown; texto?: unknown };
  try {
    d = await peticion.json();
  } catch {
    return json({ error: 'No se han podido leer las respuestas' }, 400, origen);
  }

  const codigo = codigoDe(d.codigo);
  const texto = typeof d.texto === 'string' ? d.texto : '';
  if (!codigo) return json({ error: 'Código de proyecto no válido' }, 400, origen);
  if (!texto.trim()) return json({ error: 'El cuestionario venía vacío' }, 400, origen);

  const camino = `proyectos/${codigo}/envio.txt`;

  // El envío es definitivo: si ya hay uno, no se pisa
  if (await existeEnGitHub(camino)) {
    return json({ error: 'Este proyecto ya tiene un cuestionario enviado', yaEnviado: true }, 409, origen);
  }

  await escribirEnGitHub(camino, Buffer.from(texto, 'utf-8').toString('base64'), `${codigo}: cuestionario`);
  return json({ ok: true, codigo, camino }, 200, origen);
}
