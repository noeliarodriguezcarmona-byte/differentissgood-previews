/* Datos y cálculos compartidos de Venelac (web, recetas, mayoristas y Kita).
   Productos y precios: tienda venelac.com. Recetas, usos, maridajes y repartos: sugerencias orientativas. */
window.V = (() => {
'use strict';
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const eur = n => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = n => n.toLocaleString('es-ES', { maximumFractionDigits: 1 });

const SHOP = 'https://venelac.com/product/';
const P = [
  { id: 'nata-criolla-250-g', pais: 'Venezuela',   short: 'Nata Criolla',  alias: ['nata'], name: 'Nata Criolla – 250 g.', g: 250, price: 3.19, img: 'nata-criolla.jpg', uso: ['untar', 'pan', 'arepa', 'desayuno', 'dulce', 'postre', 'crema'], idea: 'Para untar sobre pan, tostadas o arepas, y para acompañar un desayuno completo.', maridaje: 'plátano maduro, mermelada, pan tostado, arepa', mix: 'queso-de-mano-500-g' },
  { id: 'nata-criolla-400-g', pais: 'Venezuela',   short: 'Nata Criolla',  alias: ['nata'], name: 'Nata Criolla – 400 g.', g: 400, price: 5.78, sale: 5.50, img: 'nata-criolla.jpg', uso: ['untar', 'pan', 'arepa', 'desayuno', 'dulce', 'postre', 'crema'], idea: 'El formato familiar para untar sobre pan, tostadas o arepas.', maridaje: 'plátano maduro, mermelada, pan tostado, arepa', mix: 'queso-de-mano-500-g' },
  { id: 'queso-crineja-500-g', pais: 'Venezuela',  short: 'Queso Crineja', alias: ['crineja'], name: 'Queso Crineja – 500 g.', g: 500, price: 8.11, sale: 7.68, img: 'crineja.jpg', uso: ['tabla', 'aperitivo', 'picoteo'], idea: 'Para llevar a la mesa en tabla, como aperitivo para compartir.', maridaje: 'fruta fresca, frutos secos, galletas, pan', mix: 'queso-guayanes-250-g' },
  { id: 'queso-de-mano-500-g', pais: 'Venezuela',  short: 'Queso de Mano', alias: ['mano', 'de mano'], name: 'Queso de Mano – 500 g. (4x125g)', g: 500, price: 7.68, img: 'queso-de-mano.png', sq: 1, uso: ['desayuno', 'arepa', 'pan', 'fresco', 'plancha'], idea: 'Para el desayuno, en arepas o en pan, y también pasado por la plancha. Viene en 4 porciones de 125 g.', maridaje: 'nata criolla, arepa, pan, café con leche', mix: 'nata-criolla-250-g',
    label: 'Ingredientes: leche pasteurizada de vaca, estabilizador E-509, cuajo, fermento lácteo, sal y acidulante E-270. Conservar en frío entre 2 °C y 6 °C. Por 100 g: 1042 kJ / 249 kcal, grasas 18 g (saturadas 12 g), hidratos 3 g (azúcares 3 g), proteínas 20 g, sal 1 g.' },
  { id: 'queso-duro-500-g', pais: 'Venezuela',     short: 'Queso Duro',    alias: ['duro'], name: 'Queso Duro – 500 g.', g: 500, price: 8.32, sale: 7.83, img: 'duro.jpg', uso: ['rallar', 'pasta', 'gratinar', 'pizza', 'arepa'], idea: 'Para rallar sobre pasta, gratinar o acompañar arepas.', maridaje: 'pasta, salsa de tomate, verduras al horno', mix: 'queso-llanero-300-g' },
  { id: 'queso-guayanes-250-g', pais: 'Venezuela', short: 'Queso Guayanés',alias: ['guayanes'], name: 'Queso Guayanés – 250 g.', g: 250, price: 3.88, img: 'guayanes.jpg', uso: ['fresco', 'ensalada', 'desayuno', 'desmenuzar', 'arepa'], idea: 'Queso fresco para ensaladas, desayunos y arepas.', maridaje: 'tomate, aguacate, pan, aceite de oliva', mix: 'queso-paisa-300-g' },
  { id: 'queso-llanero-300-g', pais: 'Venezuela',  short: 'Queso Llanero', alias: ['llanero'], name: 'Queso Llanero – 300 g.', g: 300, price: 4.16, sale: 3.39, img: 'llanero.jpg', uso: ['freir', 'plancha', 'asar', 'arepa'], idea: 'Para freír o pasar por la plancha, y para rellenar arepas.', maridaje: 'miel, mermelada de guayaba, pan', mix: 'nata-criolla-250-g' },
  { id: 'queso-paisa-300-g', pais: 'Colombia',    short: 'Queso Paisa',   alias: ['paisa'], name: 'Queso Paisa – 300 gr', g: 300, price: 3.12, sale: 2.91, img: 'paisa.jpg', uso: ['fresco', 'ensalada', 'desayuno', 'arepa'], idea: 'Queso fresco para ensaladas y desayunos.', maridaje: 'lechuga, tomate, pan, fruta', mix: 'queso-guayanes-250-g' },
  { id: 'queso-telita-250-g', pais: 'Venezuela',   short: 'Queso Telita',  alias: ['telita'], name: 'Queso Telita – 250 g.', g: 250, price: 3.90, img: 'telita.jpg', uso: ['arepa', 'desayuno', 'derretir', 'pan'], idea: 'Para arepas y desayunos, y para fundir en un pan.', maridaje: 'arepa, pan, jamón, tomate', mix: 'nata-criolla-250-g' }
];
const byId = id => P.find(p => p.id === id);
const now = p => p.sale || p.price;
const ppk = p => now(p) / p.g * 1000;
const off = p => p.sale ? Math.round((1 - p.sale / p.price) * 100) : 0;
const RANK = [...P].sort((a, b) => ppk(a) - ppk(b)).map(p => p.id);
const PORCION = 60; // g por ración orientativa
const cRacion = (p, g = PORCION) => ppk(p) * g / 1000;

/* búsqueda de producto por nombre/alias en un texto normalizado */
function findProduct(t) {
  let best = null;
  P.forEach(p => { p.alias.concat([norm(p.short)]).forEach(a => { if (new RegExp('\\b' + a + '\\b').test(t) && (!best || a.length > best.len)) best = { p, len: a.length }; }); });
  if (!best) return null;
  let p = best.p;
  if (p.short === 'Nata Criolla') p = /400/.test(t) ? byId('nata-criolla-400-g') : byId('nata-criolla-250-g');
  return p;
}

const SYN = {
  desayuno: ['desayun', 'manana', 'brunch'], freir: ['fre', 'frit', 'tequen', 'sarten'], plancha: ['plancha', 'parrilla', 'asad', 'asar', 'bbq'],
  ensalada: ['ensalad', 'ligero'], rallar: ['rall', 'pasta', 'espagueti', 'gratin', 'pizza', 'horno'], gratinar: ['gratin', 'horno'], pasta: ['pasta'], pizza: ['pizza'],
  untar: ['untar', 'untable', 'cremos', 'tostada'], pan: ['pan', 'bocadillo', 'sandwich', 'tostada'], arepa: ['arepa', 'empanada', 'cachapa'],
  dulce: ['dulce', 'postre', 'miel', 'mermelada'], postre: ['postre', 'dulce'], crema: ['crema', 'nata'], tabla: ['tabla', 'aperitivo', 'picoteo', 'invitados'],
  aperitivo: ['aperitivo', 'picoteo', 'invitados', 'tapa'], picoteo: ['picoteo'], fresco: ['fresc'], derretir: ['derret', 'fundi', 'fundir'], desmenuzar: ['desmenuz', 'migar'], asar: ['asar']
};
function recommend(q, n = 3) {
  const t = norm(q);
  const sc = P.map(p => {
    let s = 0;
    p.uso.forEach(u => { if ((SYN[u] || [u]).some(k => t.includes(k))) s += 2; });
    if (findProduct(t) && findProduct(t).short === p.short) s += 6;
    if (/barat|econom|oferta|descuento/.test(t) && p.sale) s += 3;
    return { p, s };
  }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  const seen = new Set();
  return sc.filter(x => { if (seen.has(x.p.short)) return false; seen.add(x.p.short); return true; }).slice(0, n).map(x => x.p);
}

/* ---------- Recetas (base: 4 raciones). Sugerencias de la casa, no recetas oficiales. ---------- */
const R = [
  { id: 'arepas-telita', name: 'Arepas con queso Telita', tipos: ['desayuno', 'comida'], min: 30, nivel: 'Fácil', cheeses: [['queso-telita-250-g', 200]],
    otros: [[2, 'tazas', 'harina de maíz precocida'], [2.5, 'tazas', 'agua tibia'], [null, '', 'sal y mantequilla al gusto']],
    pasos: ['Mezcla el agua con la sal y añade la harina poco a poco, amasando hasta que no se pegue.', 'Deja reposar la masa 5 minutos y forma 4 arepas.', 'Dóralas en una plancha o sartén unos 5 minutos por lado.', 'Ábrelas, rellena con el queso Telita en lonchas y tapa un minuto para que se funda.'], tip: 'Con un poco de nata criolla por encima queda aún más cremosa.' },
  { id: 'tequenos-llanero', name: 'Tequeños de queso Llanero', tipos: ['aperitivo'], min: 40, nivel: 'Media', cheeses: [['queso-llanero-300-g', 300]],
    otros: [[1, 'paquete', 'masa para tequeños u hojaldre'], [null, '', 'aceite para freír']],
    pasos: ['Corta el queso en bastones del grosor de un dedo.', 'Envuelve cada bastón con una tira de masa sellando bien los bordes.', 'Fríe en aceite caliente hasta que estén dorados.', 'Escurre sobre papel absorbente y sirve templados.'], tip: 'Sella bien la masa para que el queso no se escape al freír.' },
  { id: 'cachapas-mano', name: 'Cachapas con Queso de Mano', tipos: ['desayuno', 'comida'], min: 35, nivel: 'Media', cheeses: [['queso-de-mano-500-g', 250]],
    otros: [[3, 'tazas', 'maíz tierno (choclo)'], [2, 'cucharadas', 'harina de maíz'], [1, 'huevo', ''], [2, 'cucharadas', 'azúcar'], [null, '', 'sal y mantequilla']],
    pasos: ['Tritura el maíz con el huevo, el azúcar, la sal y la harina hasta obtener una masa espesa.', 'Haz tortitas en una plancha con mantequilla, a fuego medio.', 'Cuando estén doradas, dóblalas con el Queso de Mano dentro.', 'Sirve calientes; el queso se funde con el calor.'], tip: 'Prueba a acompañarlas con nata criolla.' },
  { id: 'pasta-duro', name: 'Pasta gratinada con Queso Duro', tipos: ['comida'], min: 30, nivel: 'Fácil', cheeses: [['queso-duro-500-g', 150]],
    otros: [[320, 'g', 'pasta'], [1, 'taza', 'salsa de tomate'], [1, 'diente', 'de ajo'], [null, '', 'aceite de oliva']],
    pasos: ['Cuece la pasta al dente.', 'Sofríe el ajo, añade el tomate y deja unos minutos.', 'Mezcla la pasta con la salsa y colócala en una fuente.', 'Ralla el Queso Duro por encima y gratina en el horno hasta que dore.'], tip: 'Ralla el queso justo antes de gratinar.' },
  { id: 'ensalada-guayanes', name: 'Ensalada fresca con Queso Guayanés', tipos: ['comida', 'merienda'], min: 15, nivel: 'Fácil', cheeses: [['queso-guayanes-250-g', 200]],
    otros: [[1, 'bolsa', 'de lechugas variadas'], [2, 'tomates', ''], [1, 'aguacate', ''], [null, '', 'aceite, limón y sal']],
    pasos: ['Lava y trocea las lechugas, los tomates y el aguacate.', 'Desmenuza el Queso Guayanés por encima.', 'Aliña con aceite, limón y sal justo antes de servir.'], tip: 'Es la receta de ensalada que más rápido sale de la lista.' },
  { id: 'tostadas-nata', name: 'Tostadas de Nata Criolla', tipos: ['desayuno', 'merienda'], min: 10, nivel: 'Fácil', cheeses: [['nata-criolla-250-g', 125]],
    otros: [[4, 'rebanadas', 'de pan'], [null, '', 'fruta o mermelada al gusto']],
    pasos: ['Tuesta el pan.', 'Unta generosamente la Nata Criolla.', 'Termina con fruta fresca o mermelada.'], tip: 'El plátano maduro en rodajas es un clásico para acompañarla.' },
  { id: 'tabla-crineja', name: 'Tabla de aperitivo con Queso Crineja', tipos: ['aperitivo'], min: 15, nivel: 'Fácil', cheeses: [['queso-crineja-500-g', 250], ['queso-guayanes-250-g', 125]],
    otros: [[null, '', 'fruta fresca de temporada'], [null, '', 'frutos secos'], [null, '', 'panes o galletas']],
    pasos: ['Coloca el Queso Crineja en el centro de una tabla.', 'Corta el Guayanés en dados y ponlo alrededor.', 'Añade la fruta, los frutos secos y el pan.', 'Sirve fresco para compartir.'], tip: 'Una tabla se puede preparar con antelación y mantener en frío.' },
  { id: 'empanadas-paisa', name: 'Empanadas horneadas de queso Paisa', tipos: ['aperitivo', 'merienda'], min: 45, nivel: 'Media', cheeses: [['queso-paisa-300-g', 250]],
    otros: [[8, 'discos', 'de masa para empanadas'], [1, 'huevo', 'para pintar']],
    pasos: ['Calienta el horno a 200 °C.', 'Rellena cada disco con queso Paisa desmenuzado y cierra con un tenedor.', 'Píntalas con huevo batido.', 'Hornea 20 minutos o hasta que estén doradas.'], tip: 'Puedes congelarlas crudas y hornearlas cuando quieras.' },
  { id: 'llanero-plancha', name: 'Queso Llanero a la plancha', tipos: ['aperitivo', 'comida'], min: 10, nivel: 'Fácil', cheeses: [['queso-llanero-300-g', 300]],
    otros: [[null, '', 'miel o mermelada de guayaba'], [null, '', 'pan para acompañar']],
    pasos: ['Corta el Queso Llanero en lonchas gruesas.', 'Dóralas en una plancha o sartén bien caliente, un par de minutos por lado.', 'Sirve con miel o mermelada de guayaba.'], tip: 'No muevas el queso hasta que se forme costra dorada.' },
  { id: 'sandwich-telita', name: 'Sándwich fundido de queso Telita', tipos: ['desayuno', 'comida', 'merienda'], min: 10, nivel: 'Fácil', cheeses: [['queso-telita-250-g', 200]],
    otros: [[8, 'rebanadas', 'de pan'], [null, '', 'mantequilla']],
    pasos: ['Reparte el queso Telita entre 4 sándwiches.', 'Unta el exterior con mantequilla.', 'Tuesta en la plancha por ambos lados hasta que el queso se funda.'], tip: 'Un poco de tomate fresco por dentro le da frescura.' },
  { id: 'arepa-choclo', name: 'Arepas de choclo con queso Paisa', tipos: ['desayuno', 'merienda'], min: 30, nivel: 'Fácil', cheeses: [['queso-paisa-300-g', 200]],
    otros: [[2, 'tazas', 'maíz tierno (choclo) triturado'], [2, 'cucharadas', 'harina de maíz'], [2, 'cucharadas', 'azúcar'], [null, '', 'mantequilla y sal']],
    pasos: ['Tritura el maíz con el azúcar, la harina y una pizca de sal hasta obtener una masa espesa.', 'Forma discos y dóralos en una plancha con mantequilla.', 'Ábrelos o dóblalos con el queso Paisa en láminas.', 'Sirve calientes, mejor recién hechos.'], tip: 'Si la masa queda líquida, añade una cucharada más de harina.' },
  { id: 'pandebono', name: 'Pandebono con queso', tipos: ['desayuno', 'merienda'], min: 40, nivel: 'Media', cheeses: [['queso-paisa-300-g', 150], ['queso-duro-500-g', 100]],
    otros: [[1.5, 'tazas', 'almidón de yuca'], [0.5, 'taza', 'harina de maíz'], [1, 'huevo', ''], [null, '', 'sal y un poco de leche']],
    pasos: ['Mezcla el almidón, la harina de maíz y la sal.', 'Añade el queso desmenuzado y rallado y el huevo.', 'Amasa con un poco de leche hasta que la masa sea suave y forma bolitas o rosquillas.', 'Hornea a 200 °C unos 15 a 20 minutos, hasta que doren.'], tip: 'Se come mejor templado y el mismo día.' },
  { id: 'llapingachos', name: 'Llapingachos rellenos de queso', tipos: ['comida'], min: 45, nivel: 'Media', cheeses: [['queso-guayanes-250-g', 150]],
    otros: [[600, 'g', 'patatas cocidas'], [1, 'cucharada', 'mantequilla'], [null, '', 'sal; huevo y aguacate para servir']],
    pasos: ['Machaca las patatas cocidas con sal hasta obtener un puré firme.', 'Forma bolas, rellénalas con queso fresco desmenuzado y aplánalas.', 'Dóralas en una plancha con mantequilla por los dos lados.', 'Sirve con huevo frito y aguacate.'], tip: 'Deja enfriar el puré antes de formarlas para que no se rompan.' },
  { id: 'empanadas-viento', name: 'Empanadas de viento de queso', tipos: ['aperitivo', 'merienda'], min: 35, nivel: 'Media', cheeses: [['queso-paisa-300-g', 250]],
    otros: [[8, 'discos', 'de masa para empanadas'], [null, '', 'aceite para freír y azúcar para espolvorear']],
    pasos: ['Rellena cada disco con queso desmenuzado y ciérralo bien.', 'Fríe en aceite caliente hasta que estén doradas e infladas.', 'Escurre y espolvorea con un poco de azúcar si te gusta el contraste dulce y salado.'], tip: 'Cierra bien los bordes para que no se abran al freír.' },
  { id: 'quesadillas', name: 'Quesadillas con queso fundido', tipos: ['comida', 'merienda'], min: 15, nivel: 'Fácil', cheeses: [['queso-telita-250-g', 250]],
    otros: [[8, 'tortillas', 'de harina o de maíz'], [null, '', 'salsa al gusto']],
    pasos: ['Calienta la tortilla en una plancha.', 'Reparte el queso Telita por la mitad y dobla.', 'Dora por los dos lados hasta que el queso se funda.', 'Sirve con salsa.'], tip: 'En México se usa queso Oaxaca; el Telita es una alternativa para fundir.' },
  { id: 'molletes', name: 'Molletes gratinados', tipos: ['desayuno'], min: 20, nivel: 'Fácil', cheeses: [['queso-telita-250-g', 200]],
    otros: [[4, 'panes', 'tipo bolillo, partidos'], [1, 'taza', 'frijoles refritos'], [null, '', 'pico de gallo']],
    pasos: ['Tuesta ligeramente el pan abierto.', 'Unta los frijoles y cubre con queso Telita.', 'Gratina en el horno hasta que burbujee.', 'Termina con pico de gallo.'], tip: 'Un chorrito de salsa picante por encima, al gusto.' },
  { id: 'baleadas', name: 'Baleadas con queso y crema', tipos: ['desayuno', 'comida'], min: 20, nivel: 'Fácil', cheeses: [['queso-duro-500-g', 120], ['queso-guayanes-250-g', 100]],
    otros: [[8, 'tortillas', 'de harina'], [1, 'taza', 'frijoles refritos'], [0.5, 'taza', 'crema o nata'], [null, '', 'huevo revuelto, opcional']],
    pasos: ['Calienta las tortillas en una plancha.', 'Unta los frijoles y añade el queso rallado o desmenuzado.', 'Termina con crema y, si quieres, huevo.', 'Dobla por la mitad y sirve caliente.'], tip: 'La crema se puede sustituir por nata criolla.' },
  { id: 'pupusas', name: 'Pupusas de queso', tipos: ['comida'], min: 40, nivel: 'Media', cheeses: [['queso-telita-250-g', 250]],
    otros: [[2, 'tazas', 'harina de maíz'], [1.5, 'tazas', 'agua tibia'], [null, '', 'sal; curtido y salsa para acompañar']],
    pasos: ['Mezcla la harina con el agua y la sal y amasa.', 'Forma una bola, haz un hueco y rellena con queso Telita.', 'Cierra y aplana con las manos hasta formar un disco.', 'Cocina en una plancha unos 4 minutos por lado.'], tip: 'Moja las manos para que la masa no se pegue.' },
  { id: 'queso-frito', name: 'Queso frito con tostones', tipos: ['desayuno', 'aperitivo'], min: 20, nivel: 'Fácil', cheeses: [['queso-llanero-300-g', 300]],
    otros: [[2, 'plátanos', 'verdes para tostones (opcional)'], [null, '', 'aceite para freír'], [null, '', 'mangú y huevos para acompañar']],
    pasos: ['Corta el Queso Llanero en lonchas gruesas.', 'Fríelas en aceite caliente hasta que doren por los dos lados.', 'Sirve enseguida con tostones, mangú o huevos.'], tip: 'Sécalo bien con papel antes de freír.' },
  { id: 'provoleta', name: 'Queso a la plancha estilo provoleta', tipos: ['aperitivo', 'comida'], min: 10, nivel: 'Fácil', cheeses: [['queso-llanero-300-g', 300]],
    otros: [[null, '', 'orégano y ají molido'], [null, '', 'pan para acompañar'], [null, '', 'chimichurri, opcional']],
    pasos: ['Calienta bien una plancha o parrilla.', 'Pon el Queso Llanero en una loncha gruesa y dora hasta que haga costra.', 'Espolvorea orégano y ají molido.', 'Sirve caliente con pan.'], tip: 'Usa un cuchillo fino o una espátula para darle la vuelta.' }
];
const rById = id => R.find(r => r.id === id);
const recipesFor = pid => { const s = byId(pid).short; return R.filter(r => r.cheeses.some(([id]) => byId(id).short === s)); };
/* ingredientes de queso escalados a n raciones: envases necesarios y coste */
function recipeCheese(r, n) {
  const f = n / 4;
  const lines = r.cheeses.map(([id, g]) => { const p = byId(id), need = Math.round(g * f / 5) * 5, packs = Math.max(1, Math.ceil(need / p.g)); return { p, need, packs, cost: packs * now(p), exact: need / 1000 * ppk(p) }; });
  return { lines, cost: lines.reduce((s, l) => s + l.cost, 0), exact: lines.reduce((s, l) => s + l.exact, 0) };
}
function scaleQty(q, n) { if (q == null) return ''; const v = q * n / 4; const r = v >= 20 ? Math.round(v / 10) * 10 : Math.round(v * 2) / 2; return num(r); }


/* Quesos que aparecen en la foto de la familia Venelac / Campo Andino de la web. No están en la tienda: sin precio ni formato publicado. */
const FAMILY = [
  { id: 'fam-costeno', short: 'Queso Costeño', name: 'Queso Costeño (Campo Andino)', pais: 'Colombia', img: 'fam-costeno.jpg', nota: 'Receta original colombiana' },
  { id: 'fam-manaba', short: 'Queso Manabá', name: 'Queso Manabá (Campo Andino)', pais: 'Ecuador', img: 'fam-manaba.jpg', nota: 'Campo Andino' },
  { id: 'fam-oaxaca', short: 'Queso Oaxaca', name: 'Queso Oaxaca (Venelac)', pais: 'México', img: 'fam-oaxaca.jpg', nota: 'Venelac' },
  { id: 'fam-hondureno', short: 'Queso Hondureño', name: 'Queso Hondureño (Campo Andino)', pais: 'Honduras', img: 'fam-hondureno.jpg', nota: 'Campo Andino' },
  { id: 'fam-quesillo', short: 'Quesillo Jugoso', name: 'Quesillo Jugoso (Campo Andino)', pais: 'El Salvador', img: 'fam-quesillo.jpg', nota: 'Quesillo, Campo Andino' }
].map(f => Object.assign({ g: null, price: null, consulta: true, uso: [], idea: 'Producto de la familia Venelac. Disponibilidad, formato y precio: consultar con el equipo de ventas.' }, f));
const anyProd = id => byId(id) || FAMILY.find(f => f.id === id);

/* ---------- Perfil de cocina de cada queso: sabor, textura, cómo se toma y formas típicas ----------
   Guía orientativa redactada según el tipo de queso (no es ficha técnica oficial de Venelac).
   int/crem/sal: 1 (poco) a 5 (mucho). servir: 2 = mejor así, 1 = también, 0 = no recomendado. */
const PERFIL = {
  'Nata Criolla': { sabor: 'Lácteo, suave y ligeramente ácido; casi sin sal.', textura: 'Crema espesa y untable, muy cremosa.', int: 1, crem: 5, sal: 1, servir: { rallado: 0, fundido: 0, frio: 2, caliente: 1 }, formas: ['Untada en pan, tostadas o galletas.', 'Sobre arepas, cachapas o plátano maduro.', 'Con fruta o mermelada en desayunos y meriendas.', 'Por encima de platos calientes al servir.'], tip: 'Mejor fría, recién sacada de la nevera; no hace falta cocinarla.', tags: ['Cremosa', 'Suave', 'Se unta'] },
  'Queso Crineja': { sabor: 'Lácteo y suave, con un punto salado.', textura: 'Elástica y fibrosa; se deshace en hebras.', int: 2, crem: 2, sal: 3, servir: { rallado: 0, fundido: 2, frio: 1, caliente: 2 }, formas: ['Deshebrado en una tabla o en ensaladas.', 'Fundido sobre pan, pizzas y gratinados.', 'En bocadillos calientes y tostadas.'], tip: 'Funciona bien donde buscas hilos de queso fundido.', tags: ['Hilante', 'Suave', 'Se funde'] },
  'Queso de Mano': { sabor: 'Suave y lácteo, con un ligero toque ácido.', textura: 'Blanda y tierna, húmeda; se funde con facilidad.', int: 2, crem: 3, sal: 2, servir: { rallado: 0, fundido: 2, frio: 1, caliente: 2 }, formas: ['Relleno de arepas y cachapas (se funde con el calor).', 'En el desayuno, con pan fresco.', 'Pasado por la plancha en loncha.', 'Acompañado de nata criolla.'], tip: 'Viene en 4 porciones de 125 g: cómodo para repartir en cocina.', tags: ['Tierno', 'Suave', 'Se funde'] },
  'Queso Duro': { sabor: 'Intenso, salado y curado.', textura: 'Firme y seca; se ralla o se corta en lascas.', int: 5, crem: 1, sal: 5, servir: { rallado: 2, fundido: 1, frio: 1, caliente: 1 }, formas: ['Rallado sobre pasta, sopas y arepas.', 'Gratinado en el horno.', 'En lascas en una tabla.', 'En masas saladas (pandebono, buñuelos).'], tip: 'Ralla justo antes de servir y cuidado con la sal del plato.', tags: ['Intenso', 'Salado', 'Para rallar'] },
  'Queso Guayanés': { sabor: 'Fresco, lácteo y suave, con sal moderada.', textura: 'Blanda y húmeda; se desmenuza.', int: 2, crem: 2, sal: 3, servir: { rallado: 0, fundido: 0, frio: 2, caliente: 1 }, formas: ['Desmenuzado en ensaladas y sobre arepas.', 'En el desayuno, con pan y tomate.', 'De relleno (humitas, tamales, llapingachos).', 'Sobre platos calientes: se ablanda, no se funde.'], tip: 'Es el queso para tomar frío o desmenuzar sobre algo caliente.', tags: ['Fresco', 'Desmenuzable', 'Se toma frío'] },
  'Queso Llanero': { sabor: 'Marcado y salado, más intenso que los quesos frescos.', textura: 'Semifirme; se corta en lonchas y tiende a mantener la forma al calor.', int: 3, crem: 2, sal: 4, servir: { rallado: 1, fundido: 1, frio: 1, caliente: 2 }, formas: ['A la plancha o frito.', 'En tequeños y bastones.', 'De relleno de arepas.', 'Con miel o dulce de guayaba.'], tip: 'Sécalo con papel antes de freír o dorar.', tags: ['Semifirme', 'Salado', 'Plancha y fritos'] },
  'Queso Paisa': { sabor: 'Muy suave y fresco, ligeramente salado.', textura: 'Blanda y tierna; se desmenuza fácilmente.', int: 1, crem: 3, sal: 2, servir: { rallado: 0, fundido: 1, frio: 2, caliente: 1 }, formas: ['En ensaladas y desayunos.', 'En arepas de choclo y empanadas.', 'Con fruta, pan o tostadas.'], tip: 'El más suave de los quesos frescos: bueno para quien prefiere sabores discretos.', tags: ['Muy suave', 'Fresco', 'Se toma frío'] },
  'Queso Telita': { sabor: 'Suave, lácteo y delicado.', textura: 'Fina y blanda; se funde con facilidad y se estira.', int: 2, crem: 3, sal: 2, servir: { rallado: 0, fundido: 2, frio: 1, caliente: 2 }, formas: ['Fundido en arepas, sándwiches y quesadillas.', 'Gratinado sobre pan o tostadas.', 'En lonchas en el desayuno.'], tip: 'Cúbrelo con tapa un minuto en la plancha para que se funda del todo.', tags: ['Fundente', 'Suave', 'Se funde'] },
  'Queso Costeño': { sabor: 'Fresco y salado.', textura: 'Firme pero tierno; se desmenuza.', int: 3, crem: 1, sal: 4, servir: { rallado: 1, fundido: 0, frio: 2, caliente: 1 }, formas: ['Desmenuzado sobre arepas y ensaladas.', 'En buñuelos y fritos.', 'En dados con fruta.'], tip: 'Perfil orientativo del tipo de queso; formato por confirmar.', tags: ['Salado', 'Firme', 'Se toma frío'], aprox: true },
  'Queso Manabá': { sabor: 'Fresco, suave y algo salado.', textura: 'Blanda y desmenuzable.', int: 2, crem: 2, sal: 3, servir: { rallado: 0, fundido: 0, frio: 2, caliente: 1 }, formas: ['Con choclo, plátano o papa.', 'Desmenuzado en sopas y platos calientes.', 'En desayunos con pan.'], tip: 'Perfil orientativo del tipo de queso; formato por confirmar.', tags: ['Fresco', 'Suave', 'Se toma frío'], aprox: true },
  'Queso Oaxaca': { sabor: 'Suave y lácteo.', textura: 'En hilos elásticos; se deshebra y se funde.', int: 2, crem: 3, sal: 2, servir: { rallado: 0, fundido: 2, frio: 1, caliente: 2 }, formas: ['Fundido en quesadillas.', 'Deshebrado sobre antojitos.', 'En molletes y tlayudas.'], tip: 'Perfil orientativo del tipo de queso; formato por confirmar.', tags: ['Hilante', 'Suave', 'Se funde'], aprox: true },
  'Queso Hondureño': { sabor: 'Fresco y salado.', textura: 'Semiblanda y desmenuzable.', int: 3, crem: 2, sal: 4, servir: { rallado: 1, fundido: 0, frio: 2, caliente: 1 }, formas: ['En baleadas y tortillas.', 'Desmenuzado sobre frijoles.', 'Con plátano frito.'], tip: 'Perfil orientativo del tipo de queso; formato por confirmar.', tags: ['Salado', 'Fresco', 'Se desmenuza'], aprox: true },
  'Quesillo Jugoso': { sabor: 'Suave y lácteo.', textura: 'Tierna, elástica y húmeda.', int: 1, crem: 4, sal: 2, servir: { rallado: 0, fundido: 2, frio: 1, caliente: 2 }, formas: ['De relleno de pupusas.', 'Fundido en tortillas y panes.', 'En desayunos con frijoles y crema.'], tip: 'Perfil orientativo del tipo de queso; formato por confirmar.', tags: ['Cremoso', 'Suave', 'Se funde'], aprox: true }
};
[...P, ...FAMILY].forEach(p => { p.perfil = PERFIL[p.short]; });
const SERVIR_L = { rallado: 'Rallado', fundido: 'Fundido', frio: 'Frío', caliente: 'Caliente' };
/* ranking por un rasgo del perfil (para preguntas tipo «¿cuál es el más suave?») */
const topBy = (k, desc = true, n = 3) => { const seen = new Set(); return [...P].filter(p => { if (seen.has(p.short)) return false; seen.add(p.short); return true; }).sort((a, b) => desc ? b.perfil[k] - a.perfil[k] : a.perfil[k] - b.perfil[k]).slice(0, n); };
const bestFor = k => { const seen = new Set(); return P.filter(p => { if (seen.has(p.short)) return false; seen.add(p.short); return p.perfil.servir[k] === 2; }); };



/* ---------- Recetas típicas por país (7 por destino). Sugerencias de la casa con los quesos Venelac, no recetas oficiales. ----------
   ot('cantidad|unidad|texto'): ingrediente que se escala con las raciones. */
const ot = s => { const [q, u, t] = s.split('|'); return [q === '' ? null : parseFloat(q), u || '', t || '']; };
const mk = (id, name, tipos, min, nivel, cheeses, otros, pasos, tip) => ({ id, name, tipos, min, nivel, cheeses, otros: otros.map(ot), pasos, tip });
const ID = { T: 'queso-telita-250-g', G: 'queso-guayanes-250-g', L: 'queso-llanero-300-g', P: 'queso-paisa-300-g', D: 'queso-duro-500-g', M: 'queso-de-mano-500-g', C: 'queso-crineja-500-g', N: 'nata-criolla-250-g' };
const ch = (...a) => a.map(([k, g]) => [ID[k], g]);
R.push(
  /* Venezuela */
  mk('empanadas-queso-ve', 'Empanadas venezolanas de queso', ['aperitivo', 'desayuno'], 40, 'Media', ch(['P', 250]), ['2|tazas|harina de maíz precocida', '2|tazas|agua tibia', '||sal y aceite para freír'], ['Mezcla el agua con la sal, añade la harina y amasa hasta que no se pegue.', 'Forma discos finos, rellena con queso Paisa desmenuzado y cierra bien los bordes.', 'Fríe en aceite caliente hasta que estén doradas.'], 'Si la masa se agrieta al cerrar, añade un chorrito de agua tibia.'),
  /* Colombia */
  mk('bunuelos', 'Buñuelos colombianos', ['desayuno', 'merienda'], 40, 'Media', ch(['P', 150], ['D', 100]), ['1|taza|almidón de yuca', '0.5|taza|harina de maíz', '1|huevo|', '||sal, azúcar y aceite para freír'], ['Mezcla los almidones y el queso Paisa desmenuzado con el Duro rallado.', 'Añade el huevo y amasa con un poco de leche hasta una masa suave.', 'Forma bolitas y fríelas a fuego medio para que se inflen sin quemarse.'], 'El aceite no debe estar muy caliente o se doran por fuera y quedan crudos por dentro.'),
  mk('almojabanas', 'Almojábanas', ['desayuno', 'merienda'], 40, 'Media', ch(['P', 150], ['D', 100]), ['1.5|tazas|harina de maíz precocida', '1|huevo|', '2|cucharadas|mantequilla', '||leche y sal'], ['Mezcla la harina con el queso Paisa y el Duro rallado.', 'Añade mantequilla, huevo y leche hasta obtener una masa suave.', 'Forma bolas y hornea a 200 °C unos 15 a 20 minutos.'], 'Se comen mejor templadas.'),
  mk('aborrajados', 'Aborrajados de plátano y queso', ['aperitivo', 'comida'], 40, 'Media', ch(['T', 200]), ['4|plátanos|maduros', '||harina, huevo y agua para el rebozado', '||aceite para freír'], ['Fríe láminas gruesas de plátano maduro y aplástalas ligeramente.', 'Haz un «sándwich» con queso Telita entre dos láminas.', 'Rebózalo en la mezcla de harina, huevo y agua y fríe hasta dorar.'], 'Cierra bien los bordes para que el queso no se escape.'),
  mk('papas-chorreadas', 'Papas chorreadas', ['comida'], 35, 'Fácil', ch(['T', 150], ['P', 100]), ['800|g|papas cocidas', '2|tomates|', '1|cebolla|larga o puerro', '||leche y sal'], ['Cuece las papas y mantenlas calientes.', 'Sofríe la cebolla con el tomate hasta hacer un hogao.', 'Añade los quesos y un chorrito de leche hasta obtener una salsa cremosa y napa las papas.'], 'Añade la leche poco a poco para controlar el espesor.'),
  mk('chocolate-queso', 'Chocolate caliente con queso', ['desayuno', 'merienda'], 15, 'Fácil', ch(['T', 100]), ['4|tazas|leche', '100|g|chocolate para taza', '||pan para acompañar'], ['Calienta la leche y deshaz el chocolate.', 'Sirve en tazas y añade unos dados de queso Telita.', 'Espera a que se ablande y toma con cuchara, con pan.'], 'Es una costumbre colombiana: el queso se funde dentro de la taza.'),
  /* Ecuador */
  mk('humitas', 'Humitas ecuatorianas', ['desayuno', 'merienda'], 70, 'Media', ch(['G', 200]), ['6|mazorcas|de choclo tierno rallado', '2|huevos|', '50|g|mantequilla', '||hojas de choclo, sal y azúcar'], ['Mezcla el choclo rallado con los huevos, la mantequilla y la sal.', 'Añade el queso Guayanés desmenuzado.', 'Rellena las hojas, envuelve y cuece al vapor unos 45 a 60 minutos.'], 'Si no hay hojas de choclo, se puede usar papel de horno y papel de aluminio.'),
  mk('choclo-queso', 'Choclo con queso', ['merienda', 'aperitivo'], 30, 'Fácil', ch(['G', 200]), ['4|mazorcas|de choclo cocidas', '||sal y ají al gusto'], ['Cuece las mazorcas en agua con sal.', 'Sírvelas calientes con lonchas de queso Guayanés.', 'Acompaña con ají al gusto.'], 'El contraste entre el choclo caliente y el queso fresco es la gracia del plato.'),
  mk('locro-papa', 'Locro de papa', ['comida'], 45, 'Media', ch(['G', 150], ['P', 100]), ['1|kg|papas', '1|cebolla|', '1|litro|leche o caldo', '2|aguacates|para servir'], ['Sofríe la cebolla, añade las papas y el caldo y cuece hasta que estén blandas.', 'Tritura parcialmente y añade la leche.', 'Sirve con queso desmenuzado y aguacate.'], 'Añade el queso fuera del fuego para que no se pase.'),
  mk('bolones', 'Bolones de verde con queso', ['desayuno'], 40, 'Media', ch(['P', 200]), ['4|plátanos|verdes', '||sal, mantequilla y aceite para freír'], ['Cuece el plátano verde y májalo con sal y mantequilla.', 'Forma bolas y rellénalas con queso Paisa.', 'Fríe hasta que estén doradas y crujientes.'], 'Trabaja el puré todavía caliente para que no se agriete.'),
  mk('tigrillo', 'Tigrillo (verde majado con huevo y queso)', ['desayuno'], 30, 'Fácil', ch(['G', 150]), ['3|plátanos|verdes', '4|huevos|', '1|cebolla|', '||mantequilla y sal'], ['Cuece y maja los plátanos verdes.', 'Sofríe la cebolla y añade el plátano majado.', 'Incorpora los huevos revueltos y el queso Guayanés y mezcla.'], 'Se sirve caliente, en el desayuno.'),
  /* México */
  mk('chilaquiles', 'Chilaquiles con queso', ['desayuno'], 25, 'Fácil', ch(['T', 150], ['G', 100]), ['200|g|totopos o tortillas fritas', '2|tazas|salsa verde o roja', '||crema, cebolla y cilantro'], ['Calienta la salsa en una sartén.', 'Añade los totopos y cocina un par de minutos.', 'Sirve con queso desmenuzado, crema y cebolla.'], 'Sírvelos enseguida para que los totopos no se ablanden del todo.'),
  mk('queso-fundido', 'Queso fundido', ['aperitivo'], 20, 'Fácil', ch(['T', 250]), ['||chorizo o champiñones, opcional', '8|tortillas|pequeñas para acompañar'], ['Coloca el queso Telita en una cazuelita apta para horno.', 'Hornea a 200 °C hasta que burbujee y se funda.', 'Sirve muy caliente con tortillas.'], 'Añade chorizo ya cocinado si lo quieres más contundente.'),
  mk('enchiladas-queso', 'Enchiladas de queso', ['comida'], 35, 'Media', ch(['T', 150], ['G', 100]), ['8|tortillas|de maíz', '2|tazas|salsa roja o verde', '||cebolla y crema'], ['Pasa las tortillas por la salsa caliente.', 'Rellénalas con queso y enróllalas.', 'Cúbrelas con salsa y más queso y gratina unos minutos.'], 'Rellena justo antes de servir para que no se rompan.'),
  mk('chiles-rellenos', 'Chiles rellenos de queso', ['comida'], 50, 'Media', ch(['T', 200]), ['4|chiles poblanos|', '3|huevos|', '||harina, salsa de tomate y aceite'], ['Asa y pela los chiles y rellénalos con queso Telita.', 'Pásalos por harina y por huevo batido.', 'Fríe hasta dorar y sirve con salsa de tomate.'], 'Bate las claras a punto de nieve para un rebozado más ligero.'),
  mk('esquites', 'Esquites con queso', ['merienda'], 25, 'Fácil', ch(['D', 80]), ['4|tazas|granos de elote', '2|cucharadas|mayonesa', '||limón, chile en polvo y epazote'], ['Cuece el elote con epazote y sal.', 'Sírvelo en vasitos con mayonesa, limón y chile.', 'Espolvorea queso Duro rallado por encima.'], 'El queso Duro hace el papel de un queso seco y salado.'),
  /* Honduras */
  mk('anafre', 'Anafre de frijoles y queso', ['aperitivo'], 20, 'Fácil', ch(['T', 200]), ['2|tazas|frijoles refritos', '||totopos o tortillas para acompañar'], ['Calienta los frijoles refritos hasta que burbujeen.', 'Cubre con queso Telita y deja que se funda.', 'Sirve caliente con totopos.'], 'Es un plato para compartir y mojar.'),
  mk('catrachas', 'Catrachas', ['merienda'], 20, 'Fácil', ch(['D', 100], ['G', 100]), ['8|tortillas|de maíz tostadas', '1|taza|frijoles refritos', '||repollo y salsa'], ['Tuesta las tortillas hasta que queden crujientes.', 'Unta los frijoles y añade el queso desmenuzado.', 'Termina con repollo picado y salsa.'], 'Tuesta las tortillas en el momento para que estén crujientes.'),
  mk('tajadas-queso', 'Tajadas de plátano con queso y repollo', ['comida'], 25, 'Fácil', ch(['G', 150]), ['2|plátanos|verdes', '||repollo, salsa y aceite'], ['Corta los plátanos en láminas largas y fríelas.', 'Sírvelas con repollo picado.', 'Termina con queso Guayanés desmenuzado y salsa.'], 'Corta las láminas con grosor uniforme para que se frían igual.'),
  mk('enchiladas-hn', 'Enchiladas hondureñas', ['comida', 'merienda'], 40, 'Media', ch(['D', 80], ['G', 100]), ['8|tortillas|de maíz fritas', '||carne molida sazonada, repollo, salsa de tomate y huevo duro'], ['Fríe las tortillas hasta que queden crujientes.', 'Cubre con carne, repollo y salsa de tomate.', 'Termina con queso desmenuzado y huevo duro.'], 'Se monta justo antes de comer.'),
  mk('quesadilla-hn', 'Quesadilla hondureña', ['merienda'], 70, 'Media', ch(['D', 150], ['P', 100]), ['2|tazas|harina de trigo', '1|taza|azúcar', '3|huevos|', '0.5|taza|mantequilla', '||leche, polvo de hornear y ajonjolí'], ['Bate la mantequilla con el azúcar y los huevos.', 'Añade la harina, el polvo de hornear, la leche y los quesos desmenuzados.', 'Vierte en un molde, espolvorea ajonjolí y hornea a 180 °C unos 40 minutos.'], 'Es un pan dulce y salado a la vez: el queso hace de contrapunto.'),
  mk('platano-maduro', 'Plátanos maduros fritos con crema y queso', ['desayuno'], 20, 'Fácil', ch(['G', 150], ['N', 100]), ['3|plátanos|maduros', '||aceite para freír'], ['Corta los plátanos en rodajas largas y fríelos hasta dorar.', 'Sírvelos con nata criolla.', 'Termina con queso Guayanés desmenuzado.'], 'Cuanto más maduro el plátano, más dulce y caramelizado.'),
  /* El Salvador */
  mk('pupusas-loroco', 'Pupusas de queso con loroco', ['comida'], 45, 'Media', ch(['T', 250]), ['2|tazas|harina de maíz', '1.5|tazas|agua tibia', '||flor de loroco (fresca o en conserva), sal, curtido y salsa'], ['Amasa la harina con el agua y la sal.', 'Rellena una bola de masa con queso Telita y loroco y aplana.', 'Cocina en una plancha unos 4 minutos por lado.'], 'Sin loroco se pueden hacer solo de queso.'),
  mk('pupusas-revueltas', 'Pupusas revueltas (queso y frijol)', ['comida'], 45, 'Media', ch(['T', 200]), ['2|tazas|harina de maíz', '1.5|tazas|agua tibia', '1|taza|frijoles refritos', '||curtido y salsa'], ['Amasa la harina con el agua y la sal.', 'Rellena con queso Telita y frijoles refritos y aplana.', 'Cocina en plancha y sirve con curtido y salsa.'], 'Moja las manos para que la masa no se pegue.'),
  mk('quesadilla-sv', 'Quesadilla salvadoreña', ['merienda'], 70, 'Media', ch(['D', 150]), ['1.5|tazas|harina de arroz', '1|taza|azúcar', '3|huevos|', '1|taza|crema o nata', '||mantequilla, polvo de hornear y ajonjolí'], ['Bate la mantequilla con el azúcar, los huevos y la crema.', 'Añade la harina de arroz, el polvo de hornear y el queso Duro rallado.', 'Hornea a 180 °C con ajonjolí por encima hasta que dore.'], 'Se sirve con café; es un pan dulce con queso.'),
  mk('riguas', 'Riguas de elote', ['desayuno', 'merienda'], 45, 'Media', ch(['P', 100]), ['8|mazorcas|de elote', '||hojas de elote y sal', '||crema para servir'], ['Tritura los granos de elote con un poco de sal.', 'Rellena las hojas con la masa y ciérralas.', 'Cuece al vapor o a la plancha y sirve con crema y queso Paisa.'], 'Se sirven calientes, recién hechas.'),
  mk('platanos-crema-sv', 'Plátanos fritos con crema y frijoles', ['desayuno'], 20, 'Fácil', ch(['G', 150], ['N', 100]), ['3|plátanos|maduros', '1|taza|frijoles refritos'], ['Fríe los plátanos maduros en rodajas.', 'Calienta los frijoles refritos.', 'Sirve con nata criolla y queso Guayanés.'], 'Es el desayuno típico: dulce, cremoso y salado.'),
  mk('tamal-elote', 'Tamal de elote con queso', ['merienda'], 60, 'Media', ch(['G', 200]), ['8|mazorcas|de elote', '||hojas de elote, azúcar y mantequilla'], ['Tritura el elote con azúcar y mantequilla.', 'Rellena las hojas con la masa y queso Guayanés.', 'Cuece al vapor hasta que estén firmes.'], 'Se sirve con crema.'),
  /* República Dominicana */
  mk('tres-golpes', 'Mangú con los tres golpes', ['desayuno'], 35, 'Fácil', ch(['L', 200]), ['4|plátanos|verdes', '2|cebollas|rojas', '||salami, huevos, aceite y vinagre'], ['Cuece los plátanos y májalos con un poco de agua de cocción y mantequilla.', 'Fríe el queso Llanero, el salami y los huevos (los «tres golpes»).', 'Sirve con cebolla roja encurtida en vinagre.'], 'El queso se frita en lonchas gruesas hasta que forme costra.'),
  mk('maduros-queso', 'Plátanos maduros con queso frito', ['desayuno', 'comida'], 20, 'Fácil', ch(['L', 150]), ['3|plátanos|maduros', '||aceite para freír'], ['Fríe los plátanos maduros hasta caramelizar.', 'Fríe lonchas de queso Llanero hasta dorar.', 'Sirve juntos, caliente.'], 'El dulce del plátano y la sal del queso se complementan.'),
  mk('pastelitos-queso', 'Pastelitos de queso', ['aperitivo', 'merienda'], 40, 'Media', ch(['P', 250]), ['8|discos|de masa de hojaldre o empanada', '||aceite para freír'], ['Rellena cada disco con queso Paisa desmenuzado.', 'Cierra con un tenedor para sellar.', 'Fríe en aceite caliente hasta que estén dorados.'], 'Cierra bien los bordes antes de freír.'),
  mk('arepitas-yuca', 'Arepitas de yuca con queso', ['aperitivo', 'desayuno'], 40, 'Media', ch(['P', 150]), ['500|g|yuca rallada', '||sal y aceite para freír'], ['Mezcla la yuca rallada con sal y escurre bien el exceso de agua.', 'Rellena pequeñas bolas con queso Paisa y aplánalas.', 'Fríe hasta que estén doradas.'], 'Escurre bien la yuca para que queden crujientes.'),
  mk('mofongo-queso', 'Mofongo con queso frito', ['comida'], 40, 'Media', ch(['L', 200]), ['3|plátanos|verdes', '2|dientes|de ajo', '||caldo, aceite y sal'], ['Fríe trozos de plátano verde y májalos con ajo y sal en un mortero.', 'Humedece con un poco de caldo y forma un montículo.', 'Sirve con lonchas de queso Llanero frito.'], 'Májalo en caliente: frío no se ata.'),
  mk('pastelon', 'Pastelón de plátano maduro con queso', ['comida'], 60, 'Media', ch(['T', 200]), ['5|plátanos|maduros', '||carne molida sazonada y salsa de tomate', '||aceite'], ['Fríe láminas de plátano maduro y cubre el fondo de un molde.', 'Añade la carne sazonada y otra capa de plátano.', 'Cubre con queso Telita y hornea hasta que se funda y dore.'], 'Deja reposar unos minutos antes de cortar.'),
  /* Argentina */
  mk('fugazzeta', 'Fugazzeta rellena', ['comida'], 60, 'Media', ch(['C', 250]), ['500|g|masa de pizza', '3|cebollas|en pluma', '||orégano y aceite de oliva'], ['Estira dos discos de masa y cubre el primero con queso Crineja en lonchas.', 'Cierra con el segundo disco y cúbrelo de cebolla.', 'Hornea a 220 °C con aceite y orégano hasta dorar.'], 'Pasta de pizza fina para que el relleno no la reviente.'),
  mk('tostado', 'Tostado de jamón y queso', ['merienda', 'comida'], 10, 'Fácil', ch(['T', 120]), ['8|rebanadas|de pan de miga o de molde', '||jamón cocido y manteca'], ['Unta el exterior del pan con manteca.', 'Rellena con jamón y queso Telita.', 'Tuesta en plancha por ambos lados.'], 'Presiona ligeramente con una espátula para que el queso se funda.'),
  mk('milanesa-napo', 'Milanesa a la napolitana', ['comida'], 40, 'Media', ch(['T', 200]), ['4|milanesas|de ternera o pollo', '1|taza|salsa de tomate', '||jamón cocido y orégano'], ['Dora las milanesas en sartén u horno.', 'Cubre con salsa de tomate, jamón y queso Telita.', 'Gratina hasta que el queso se funda.'], 'Gratina con el horno bien caliente.'),
  mk('vigilante', 'Vigilante (queso con dulce)', ['merienda'], 10, 'Fácil', ch(['G', 200]), ['||dulce de membrillo o de batata'], ['Corta el queso Guayanés en lonchas.', 'Corta el dulce del mismo tamaño.', 'Sirve juntos, al estilo clásico de merienda.'], 'El contraste entre el dulce y el queso salado es la gracia.'),
  mk('noquis', 'Ñoquis con queso rallado', ['comida'], 40, 'Media', ch(['D', 80]), ['1|kg|ñoquis de papa', '||salsa fileto o manteca'], ['Cuece los ñoquis en agua hirviendo hasta que suban a la superficie.', 'Escúrrelos y mézclalos con la salsa.', 'Sirve con queso Duro rallado por encima.'], 'Ralla el queso en el momento.'),
  /* España */
  mk('croquetas-queso', 'Croquetas de queso', ['aperitivo'], 60, 'Media', ch(['T', 150]), ['50|g|mantequilla', '50|g|harina', '500|ml|leche', '||pan rallado, huevo y aceite para freír'], ['Haz una bechamel espesa con mantequilla, harina y leche.', 'Añade el queso Telita hasta que se funda y deja enfriar la masa.', 'Forma las croquetas, rebózalas y fríelas.'], 'La masa debe estar muy fría para poder darle forma.'),
  mk('tortilla-queso', 'Tortilla de patata con queso', ['comida', 'merienda'], 40, 'Media', ch(['T', 150]), ['5|huevos|', '500|g|patatas', '1|cebolla|', '||aceite y sal'], ['Pocha las patatas y la cebolla en aceite.', 'Mezcla con los huevos batidos y el queso Telita en trocitos.', 'Cuaja en la sartén por ambos lados.'], 'Déjala jugosa por dentro: el queso aporta cremosidad.'),
  mk('ensalada-tomate-queso', 'Ensalada de tomate y queso fresco', ['comida', 'merienda'], 10, 'Fácil', ch(['G', 200]), ['4|tomates|maduros', '||aceite de oliva, sal y orégano'], ['Corta los tomates en rodajas.', 'Añade queso Guayanés desmenuzado.', 'Aliña con aceite de oliva, sal y orégano.'], 'Con tomates de temporada es todavía mejor.'),
  mk('pimientos-rellenos', 'Pimientos rellenos de queso', ['aperitivo', 'comida'], 40, 'Media', ch(['T', 200]), ['8|pimientos|del piquillo', '||salsa de tomate o bechamel'], ['Rellena los pimientos con queso Telita.', 'Colócalos en una fuente con un poco de salsa.', 'Gratina unos minutos.'], 'Sírvelos calientes.'),
  mk('canelones', 'Canelones gratinados', ['comida'], 60, 'Media', ch(['D', 100], ['T', 100]), ['12|placas|de canelones', '||carne picada o relleno al gusto, bechamel'], ['Rellena los canelones y colócalos en una fuente.', 'Cubre con bechamel y queso Telita.', 'Gratina con queso Duro rallado hasta que dore.'], 'En Cataluña es un plato típico de las fiestas.'),
  mk('tosta-membrillo', 'Tosta de queso fresco y membrillo', ['aperitivo', 'merienda'], 10, 'Fácil', ch(['P', 150]), ['4|rebanadas|de pan', '||dulce de membrillo y un poco de aceite'], ['Tuesta el pan.', 'Cubre con queso Paisa y una loncha de membrillo.', 'Termina con un hilo de aceite.'], 'Perfecta para un picoteo rápido.'),
  mk('pa-amb-tomaquet', 'Pan con tomate y queso', ['desayuno', 'merienda'], 10, 'Fácil', ch(['G', 150]), ['4|rebanadas|de pan', '1|tomate|maduro', '||aceite y sal'], ['Tuesta el pan.', 'Frota con tomate maduro y añade aceite y sal.', 'Termina con queso Guayanés en lonchas.'], 'Al estilo catalán, con el tomate frotado.'),
  /* Europa */
  mk('lasana', 'Lasaña gratinada', ['comida'], 70, 'Media', ch(['T', 200], ['D', 100]), ['12|placas|de lasaña', '||boloñesa y bechamel'], ['Monta capas de pasta, boloñesa y bechamel.', 'Cubre con queso Telita.', 'Gratina con queso Duro rallado en el horno.'], 'Deja reposar unos minutos antes de cortar.'),
  mk('pizza-queso', 'Pizza de queso al horno', ['comida'], 30, 'Fácil', ch(['C', 250]), ['1|masa|de pizza', '||salsa de tomate, orégano y aceite'], ['Estira la masa y cubre con la salsa de tomate.', 'Añade queso Crineja deshebrado.', 'Hornea a la máxima temperatura hasta que se funda y dore.'], 'Funciona como queso hilante al estilo de una mozzarella.'),
  mk('croque-monsieur', 'Croque monsieur', ['merienda', 'comida'], 20, 'Fácil', ch(['T', 200]), ['8|rebanadas|de pan de molde', '||jamón cocido, mantequilla y bechamel'], ['Monta sándwiches con jamón y queso Telita.', 'Tuesta en sartén con mantequilla.', 'Cubre con bechamel y queso y gratina.'], 'Se sirve caliente, con una ensalada.'),
  mk('gratin', 'Patatas gratinadas', ['comida'], 60, 'Media', ch(['D', 100], ['T', 100]), ['800|g|patatas', '300|ml|nata para cocinar', '||sal, pimienta y nuez moscada'], ['Corta las patatas en láminas finas y colócalas en una fuente.', 'Cubre con nata y queso Telita.', 'Gratina con queso Duro rallado en el horno.'], 'Láminas muy finas para que se hagan a la vez.'),
  mk('quiche', 'Quiche de queso', ['comida'], 60, 'Media', ch(['D', 100], ['T', 100]), ['1|base|de masa quebrada', '3|huevos|', '200|ml|nata', '||sal y pimienta'], ['Pre-hornea la base unos minutos.', 'Bate los huevos con la nata y añade el queso.', 'Vierte y hornea a 180 °C hasta que cuaje.'], 'Deja templar antes de cortar.'),
  mk('ensalada-griega', 'Ensalada griega con queso fresco', ['comida', 'merienda'], 15, 'Fácil', ch(['G', 200]), ['4|tomates|', '1|pepino|', '1|cebolla|roja', '||aceitunas, aceite de oliva y orégano'], ['Corta los tomates, el pepino y la cebolla.', 'Añade aceitunas y el queso Guayanés en dados.', 'Aliña con aceite de oliva y orégano.'], 'El queso Guayanés puede hacer de alternativa fresca y salada.'),
  mk('welsh-rarebit', 'Tostada gratinada estilo Welsh rarebit', ['merienda'], 20, 'Fácil', ch(['T', 200]), ['4|rebanadas|de pan', '||mostaza, cerveza y mantequilla'], ['Funde el queso Telita con mostaza, un poco de cerveza y mantequilla.', 'Extiende sobre pan tostado.', 'Gratina hasta que burbujee.'], 'Se sirve caliente, en el momento.')
);

/* ---------- Destinos: 7 recetas típicas de cada país, más España y Europa ---------- */
const COUNTRIES = [
  { id: 'venezuela', n: 'Venezuela', grupo: 'latam', plato: 'Arepas, cachapas y tequeños', texto: 'El queso está en la mesa de cada día: arepas rellenas, cachapas con queso de mano y tequeños para las fiestas. Es el país de la mayoría de los quesos de la tienda Venelac.', recetas: ['arepas-telita', 'cachapas-mano', 'tequenos-llanero', 'empanadas-queso-ve', 'tostadas-nata', 'tabla-crineja', 'llanero-plancha'] },
  { id: 'colombia', n: 'Colombia', grupo: 'latam', plato: 'Pandebono, buñuelos y arepa de choclo', texto: 'Desayunos con arepa, masas de queso recién hechas y hasta chocolate caliente con queso: el queso fresco y salado es protagonista.', fam: 'fam-costeno', recetas: ['arepa-choclo', 'pandebono', 'bunuelos', 'almojabanas', 'aborrajados', 'papas-chorreadas', 'chocolate-queso'] },
  { id: 'ecuador', n: 'Ecuador', grupo: 'latam', plato: 'Llapingachos, humitas y locro', texto: 'Papa, choclo y queso fresco en las comidas de siempre, de las humitas al locro de papa.', fam: 'fam-manaba', recetas: ['llapingachos', 'empanadas-viento', 'humitas', 'choclo-queso', 'locro-papa', 'bolones', 'tigrillo'] },
  { id: 'mexico', n: 'México', grupo: 'latam', plato: 'Quesadillas, molletes y queso fundido', texto: 'Antojitos de siempre donde el queso se estira al fundirse: de las quesadillas a los chilaquiles.', fam: 'fam-oaxaca', recetas: ['quesadillas', 'molletes', 'chilaquiles', 'queso-fundido', 'enchiladas-queso', 'chiles-rellenos', 'esquites'] },
  { id: 'honduras', n: 'Honduras', grupo: 'latam', plato: 'Baleadas y anafre', texto: 'La baleada, con frijoles, queso y crema, es desayuno, cena y comida de calle, junto a muchos platos con plátano y queso.', fam: 'fam-hondureno', recetas: ['baleadas', 'anafre', 'catrachas', 'tajadas-queso', 'enchiladas-hn', 'quesadilla-hn', 'platano-maduro'] },
  { id: 'el-salvador', n: 'El Salvador', grupo: 'latam', plato: 'Pupusas de queso', texto: 'Masa de maíz rellena de quesillo y hecha en la plancha: la pupusa es el plato que todos reconocen, con curtido y salsa.', fam: 'fam-quesillo', recetas: ['pupusas', 'pupusas-loroco', 'pupusas-revueltas', 'quesadilla-sv', 'riguas', 'platanos-crema-sv', 'tamal-elote'] },
  { id: 'republica-dominicana', n: 'República Dominicana', grupo: 'latam', plato: 'Queso frito, mangú y mofongo', texto: 'El queso frito es parte del desayuno dominicano, con mangú, tostones y huevos, y aparece también en pastelitos, yuca y plátano maduro.', recetas: ['queso-frito', 'tres-golpes', 'maduros-queso', 'pastelitos-queso', 'arepitas-yuca', 'mofongo-queso', 'pastelon'] },
  { id: 'argentina', n: 'Argentina', grupo: 'latam', plato: 'Provoleta, empanadas y tostado', texto: 'Queso a la parrilla, empanadas y mucha pizza y pasta: la provoleta con orégano abre cualquier asado.', recetas: ['provoleta', 'empanadas-paisa', 'fugazzeta', 'tostado', 'milanesa-napo', 'vigilante', 'noquis'] },
  { id: 'espana', n: 'España', grupo: 'europa', plato: 'Croquetas, tortilla y canelones', texto: 'Venelac fabrica en Girona y vende también en España. Estos quesos latinos encajan en la cocina de aquí: croquetas, tortilla, canelones, tostas y ensaladas.', recetas: ['croquetas-queso', 'tortilla-queso', 'ensalada-tomate-queso', 'pimientos-rellenos', 'canelones', 'tosta-membrillo', 'pa-amb-tomaquet'] },
  { id: 'europa', n: 'Europa', grupo: 'europa', plato: 'Lasaña, pizza y gratinados', texto: 'Clásicos de la cocina europea con quesos que se funden o se rallan bien: lasaña, pizza, croque monsieur, gratinados y quiche. Son adaptaciones de uso, no recetas tradicionales con estos quesos.', recetas: ['lasana', 'pizza-queso', 'croque-monsieur', 'gratin', 'quiche', 'ensalada-griega', 'welsh-rarebit'] }
];

/* ---------- Banderas (SVG propio, se ven igual en cualquier dispositivo) ---------- */
const FLAG_STAR = (cx, cy, r, fill) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .42 : r; p.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2)); } return `<polygon points="${p.join(' ')}" fill="${fill}"/>`; };
const FLAGS = {
  venezuela: () => `<rect width="30" height="6.7" fill="#FCD116"/><rect y="6.7" width="30" height="6.6" fill="#00247D"/><rect y="13.3" width="30" height="6.7" fill="#CF142B"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = Math.PI * (1.1 + i * .114); return FLAG_STAR(15 + 9 * Math.cos(a + 0), 15.2 + 7.2 * Math.sin(a), .85, '#fff'); }).join(''),
  colombia: () => `<rect width="30" height="10" fill="#FCD116"/><rect y="10" width="30" height="5" fill="#003893"/><rect y="15" width="30" height="5" fill="#CE1126"/>`,
  ecuador: () => `<rect width="30" height="10" fill="#FFDD00"/><rect y="10" width="30" height="5" fill="#034EA2"/><rect y="15" width="30" height="5" fill="#ED1C24"/><ellipse cx="15" cy="10" rx="2.6" ry="3" fill="#8a5a2b" stroke="#fff" stroke-width=".4"/><circle cx="15" cy="9.6" r="1.2" fill="#6fa8dc"/>`,
  mexico: () => `<rect width="10" height="20" fill="#006847"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#CE1126"/><circle cx="15" cy="10" r="2.6" fill="#9a6b34" opacity=".85"/><circle cx="15" cy="10" r="1.4" fill="#4d8f3a"/>`,
  honduras: () => `<rect width="30" height="6.7" fill="#0073CF"/><rect y="6.7" width="30" height="6.6" fill="#fff"/><rect y="13.3" width="30" height="6.7" fill="#0073CF"/>` + FLAG_STAR(15, 10, 1.1, '#0073CF') + FLAG_STAR(11.2, 8.2, 1, '#0073CF') + FLAG_STAR(18.8, 8.2, 1, '#0073CF') + FLAG_STAR(11.2, 11.8, 1, '#0073CF') + FLAG_STAR(18.8, 11.8, 1, '#0073CF'),
  'el-salvador': () => `<rect width="30" height="6.7" fill="#0F47AF"/><rect y="6.7" width="30" height="6.6" fill="#fff"/><rect y="13.3" width="30" height="6.7" fill="#0F47AF"/><circle cx="15" cy="10" r="2.5" fill="#d8c27a" stroke="#4d8f3a" stroke-width=".7"/><circle cx="15" cy="10" r="1" fill="#0F47AF"/>`,
  'republica-dominicana': () => `<rect width="30" height="20" fill="#fff"/><rect width="13" height="8.5" fill="#002D62"/><rect x="17" width="13" height="8.5" fill="#CE1126"/><rect y="11.5" width="13" height="8.5" fill="#CE1126"/><rect x="17" y="11.5" width="13" height="8.5" fill="#002D62"/><circle cx="15" cy="10" r="2" fill="#fff"/><circle cx="15" cy="10" r="1.1" fill="#4d8f3a"/>`,
  argentina: () => `<rect width="30" height="20" fill="#74ACDF"/><rect y="6.7" width="30" height="6.6" fill="#fff"/><circle cx="15" cy="10" r="2.1" fill="#F6B40E"/>`,
  espana: () => `<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/><rect x="7" y="7.6" width="3.2" height="4.8" rx=".6" fill="#AA151B" opacity=".75"/>`,
  europa: () => `<rect width="30" height="20" fill="#003399"/>` + [...Array(12)].map((_, i) => FLAG_STAR(15 + 6 * Math.cos(i * Math.PI / 6), 10 + 6 * Math.sin(i * Math.PI / 6), 1, '#FFCC00')).join('')
};
const flag = (id, cls = '') => `<svg class="flag ${cls}" viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Bandera de ${(COUNTRIES.find(c => c.id === id) || {}).n || id}">${(FLAGS[id] || FLAGS.europa)()}</svg>`;
const flagOfName = n => { const c = COUNTRIES.find(x => x.n === n); return c ? flag(c.id, 'flag--s') : ''; };

const countryOf = id => COUNTRIES.find(c => c.id === id);
const countriesOfRecipe = rid => COUNTRIES.filter(c => c.recetas.includes(rid)).map(c => c.n);
/* quesos de un destino: los que usan sus 7 recetas (por frecuencia) y el de la familia Venelac/Campo Andino de ese país */
const countryCheeses = c => { const cnt = {}; c.recetas.forEach(r => (rById(r) || { cheeses: [] }).cheeses.forEach(([id]) => { cnt[id] = (cnt[id] || 0) + 1; })); const ids = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]); return (c.fam ? [c.fam] : []).concat(ids); };

/* ---------- Mayoristas: el cliente elige los quesos y las raciones ---------- */
const TIPOS = ['Restaurante / hostelería', 'Catering / eventos', 'Tienda / supermercado', 'Distribuidor', 'Otro'];
const FREQ = { semanal: ['semana', 1], quincenal: ['quincena', 2], mensual: ['mes', 4.33] };
const GPR = [30, 40, 50, 60, 80, 100, 125, 150];
/* línea del presupuesto: { id, qty, unit: 'raciones' | 'kg' | 'envases', gpr } */
function whLine(l) {
  const p = anyProd(l.id), gpr = clamp(+l.gpr || PORCION, 10, 500), qty = Math.max(0, +l.qty || 0), pack = p.g || null;
  let grams = l.unit === 'kg' ? qty * 1000 : l.unit === 'envases' ? (pack ? qty * pack : 0) : qty * gpr;
  const packs = pack ? Math.ceil(grams / pack - 1e-9) : null;
  const servedG = pack ? packs * pack : grams;
  const raciones = l.unit === 'raciones' ? qty : Math.floor(servedG / gpr);
  const cost = pack && p.price ? packs * now(p) : null;
  return { p, gpr, qty, unit: l.unit, pack, grams, packs, kgReq: grams / 1000, kgServed: servedG / 1000, raciones, porcPorEnvase: pack ? pack / gpr : null, cost, perRacion: cost != null && raciones ? cost / raciones : null };
}
function whTotals(lines) {
  const L = lines.map(whLine), priced = L.filter(l => l.cost != null);
  return { L, kg: L.reduce((s, l) => s + l.kgServed, 0), packs: L.reduce((s, l) => s + (l.packs || 0), 0), raciones: L.reduce((s, l) => s + l.raciones, 0), cost: priced.reduce((s, l) => s + l.cost, 0), pending: L.filter(l => l.cost == null).length, avgPpk: (() => { const k = priced.reduce((s, l) => s + l.kgServed, 0); return k ? priced.reduce((s, l) => s + l.cost, 0) / k : 0; })() };
}
function whRef() { const d = new Date(), p = n => String(n).padStart(2, '0'); return `VNL-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`; }
function whText(lines, c = {}) {
  const T = whTotals(lines), f = FREQ[c.freq || 'semanal'], fmt = n => num(Math.round(n * 10) / 10), d = new Date();
  const rows = T.L.map((l, i) => `${i + 1}. ${l.p.short}${l.pack ? ' ' + l.pack + ' g' : ''}: ${num(l.raciones)} raciones de ${l.gpr} g = ${fmt(l.kgServed)} kg${l.pack ? ` → ${l.packs} envases de ${l.pack} g (${num(Math.round(l.porcPorEnvase * 10) / 10)} porciones por envase)` : ' (formato por confirmar)'} · ${l.cost != null ? eur(l.cost) + ' a tarifa pública' : 'precio a consultar'}`).join('\n');
  return `SOLICITUD DE PRESUPUESTO MAYORISTA · VENELAC\nRef.: ${c.ref || '—'} · Fecha: ${d.toLocaleDateString('es-ES')}\n\nCliente: ${c.empresa || '—'}${c.tipo ? ' (' + c.tipo + ')' : ''}\nContacto: ${c.nombre || '—'} · ${c.email || '—'}${c.tel ? ' · ' + c.tel : ''}${c.ciudad ? ' · ' + c.ciudad : ''}\nFrecuencia de pedido: ${c.freq || 'semanal'}${c.fecha ? ' · Fecha deseada: ' + c.fecha : ''}\n\nQUESOS ELEGIDOS (por ${f[0]})\n${rows || '(sin líneas)'}\n\nTOTAL por ${f[0]}: ${fmt(T.kg)} kg · ${T.packs} envases · ${num(T.raciones)} raciones · ${eur(T.cost)} a tarifa pública${T.pending ? ` (+ ${T.pending} ${T.pending === 1 ? 'línea' : 'líneas'} a consultar)` : ''}\n${c.obs ? '\nObservaciones del cliente: ' + c.obs + '\n' : ''}\nNOTA PARA VENTAS: precios a tarifa pública de la tienda. Pendiente enviar la oferta mayorista (precio por kilo, mínimos, transporte y plazos).`;
}
function whTSV(lines) {
  const T = whTotals(lines);
  return ['Queso', 'Formato (g)', 'Raciones', 'g por ración', 'Kg', 'Envases', 'Porciones por envase', 'Precio envase (€)', 'Total (€)'].join('\t') + '\n' + T.L.map(l => [l.p.short, l.pack || '', l.raciones, l.gpr, num(Math.round(l.kgServed * 10) / 10), l.packs ?? '', l.porcPorEnvase ? num(Math.round(l.porcPorEnvase * 10) / 10) : '', l.p.price ? now(l.p).toFixed(2).replace('.', ',') : 'consultar', l.cost != null ? l.cost.toFixed(2).replace('.', ',') : 'consultar'].join('\t')).join('\n');
}

return { norm, eur, esc, clamp, num, SHOP, P, R, FAMILY, COUNTRIES, flag, flagOfName, countryCheeses, PERFIL, SERVIR_L, topBy, bestFor, TIPOS, FREQ, GPR, byId, anyProd, countryOf, countriesOfRecipe, now, ppk, off, RANK, PORCION, cRacion, findProduct, recommend, rById, recipesFor, recipeCheese, scaleQty, whLine, whTotals, whText, whTSV, whRef };
})();
