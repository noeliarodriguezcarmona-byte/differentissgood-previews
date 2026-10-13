/* Kita, la vaca de Venelac. Asistente local de reglas (sin servidor).
   Para usar un modelo real, sustituir reply() por una llamada a una API con las mismas acciones. */
(() => {
'use strict';
const { norm, eur, esc, clamp, num, P, R, FAMILY, COUNTRIES, countryCheeses, SERVIR_L, topBy, bestFor, byId, anyProd, countryOf, countriesOfRecipe, now, ppk, off, RANK, PORCION, cRacion, findProduct, recommend, rById, recipesFor, recipeCheese, whLine, whTotals } = window.V;
const A = window.APP;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const msgs = $('#aiMsgs'), sugg = $('#aiSugg'), drawer = $('#kita');
const K = { greeted: false, quiz: null, lastPlan: null, ctxRecipe: null, hintShown: false };
const TIPO_L = { desayuno: 'desayuno', aperitivo: 'aperitivo', comida: 'comida', merienda: 'merienda' };
const mayo = () => A.getMode() === 'mayorista';
const kg = p => `${num(ppk(p))} €/kg`;
const nm = p => p.name.replace(/\.$/, '');

/* ---------- piezas de mensaje ---------- */
const mini = p => `<div class="mc"><img src="assets/${p.img}" alt=""><span><b>${p.name}</b><small>${eur(now(p))}${p.sale ? ' · oferta' : ''} · ${kg(p)}</small></span><button data-add="${p.id}">Añadir</button></div>`;
const rmini = r => { const c = recipeCheese(r, 4); return `<div class="mc mc--r"><img src="assets/${byId(r.cheeses[0][0]).img}" alt=""><span><b>${esc(r.name)}</b><small>${r.min} min · ${r.nivel} · queso por ración ${eur(c.exact / 4)}</small></span><button data-recipe="${r.id}">Ver</button></div>`; };
const acts = arr => `<div class="row-act">${arr.map(([a, l, v]) => `<button data-${a}="${esc(v || '')}">${l}</button>`).join('')}</div>`;
function bubble(cls, html) { const el = document.createElement('div'); el.className = 'msg ' + cls; el.innerHTML = html; msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight; return el; }
function chips(list) { sugg.innerHTML = list.map(c => `<button type="button">${esc(c)}</button>`).join(''); sugg.scrollLeft = 0; }
function say(text, extra = '', ch) {
  const el = bubble('msg--bot', '<span class="typing"><i></i><i></i><i></i></span>');
  setTimeout(() => {
    el.textContent = ''; const keep = setInterval(() => { msgs.scrollTop = msgs.scrollHeight; }, 90);
    A.typeInto(el, text, () => { if (extra) el.insertAdjacentHTML('beforeend', extra); msgs.scrollTop = msgs.scrollHeight; if (ch) chips(ch); setTimeout(() => clearInterval(keep), 200); });
  }, REDUCED ? 0 : 550);
}
const baseChips = () => mayo()
  ? ['200 raciones de queso telita de 80 g', '50 kg de queso llanero', '¿Qué llevo en mi presupuesto?', 'Envía mi presupuesto a ventas', '¿Condiciones y mínimos?']
  : ['Soy de Colombia, ¿qué recetas?', '¿Cuál es el más suave?', '¿Cómo se toma el queso Telita?', 'Hazme el test del queso', 'Menú para 8 personas, aperitivo'];

/* ---------- abrir / cerrar ---------- */
function open(q) {
  A.openDrawer(drawer);
  if (!K.greeted) {
    K.greeted = true;
    say(mayo() ? 'Hola, soy Kita, la vaca de Venelac. Te ayudo a montar tu presupuesto mayorista: tú eliges los quesos y las raciones de cada uno, y yo calculo kilos, envases y porciones. Dime, por ejemplo, «200 raciones de queso telita de 80 g».'
      : 'Hola, soy Kita, la vaca de Venelac. Te recomiendo quesos, te enseño recetas, calculo cantidades para tus invitados y comparo precios por kilo. ¿Qué vas a cocinar?', '', baseChips());
  }
  if (q) ask(q);
  setTimeout(() => $('#aiInput').focus({ preventScroll: true }), 500);
}
function ask(q) { if (!q || !q.trim()) return; bubble('msg--me', esc(q)); reply(q); }
A.kita = open;
document.addEventListener('click', e => { const b = e.target.closest('[data-open-kita]'); if (b) { e.preventDefault(); if (nav_open()) $('#burger').click(); open(b.dataset.kitaQ); } });
const nav_open = () => $('#nav').classList.contains('open');
$('#aiForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#aiInput').value.trim(); if (!v) return; $('#aiInput').value = ''; ask(v); });
sugg.addEventListener('click', e => { const b = e.target.closest('button'); if (b) ask(b.textContent); });
A.onMode = (m, o) => { if (K.greeted && !o.silent) { say(m === 'mayorista' ? 'Perfecto, paso a modo mayorista: te hablaré de precio por kilo, volúmenes y presupuestos.' : 'Vuelvo al modo particular: recetas, menús para tus invitados y formatos pequeños.', '', baseChips()); } };
A.onProduct = id => { K.ctxProduct = id; };
A.onRecipe = id => { K.ctxRecipe = id; };

/* acciones dentro del chat */
msgs.addEventListener('click', e => {
  const t = e.target;
  const a = t.closest('[data-add]'); if (a) A.addToCart(a.dataset.add);
  const r = t.closest('[data-recipe]'); if (r) { A.closeDrawer(drawer); A.go('recetas', { recipe: r.dataset.recipe }); }
  const rp = t.closest('[data-recipeadd]'); if (rp) { A.addRecipe(rp.dataset.recipeadd, K.n || 4); }
  const pr = t.closest('[data-prod]'); if (pr) { A.closeDrawer(drawer); A.go('quesos', { product: pr.dataset.prod }); }
  const pg = t.closest('[data-page]'); if (pg) { A.closeDrawer(drawer); A.go(pg.dataset.page); }
  const pa = t.closest('[data-planadd]'); if (pa && K.lastPlan) { K.lastPlan.lines.forEach(l => A.addToCart(l.p.id, l.packs, true)); A.toast('Menú añadido'); }
  const wc = t.closest('[data-whcopy]'); if (wc) { sendQuoteChat(); }
  const cko = t.closest('[data-checkout]'); if (cko) { A.closeDrawer(drawer); A.checkout(); }
  const ct = t.closest('[data-country]'); if (ct) { A.closeDrawer(drawer); A.go('recetas', { country: ct.dataset.country }); }
  const md = t.closest('[data-setmode]'); if (md) A.setMode(md.dataset.setmode, { view: false });
  const qz = t.closest('[data-quiz]'); if (qz) { ask('Hazme el test del queso'); }
});

/* ---------- menús y cantidades ---------- */
const RULES = {
  desayuno: { n: 'un desayuno', i: [['queso-telita-250-g', 40], ['nata-criolla-250-g', 20]] },
  aperitivo: { n: 'un aperitivo', i: [['queso-crineja-500-g', 40], ['queso-guayanes-250-g', 30]] },
  arepas: { n: 'arepas en casa', i: [['queso-de-mano-500-g', 50], ['queso-llanero-300-g', 40]] },
  ensalada: { n: 'una ensalada', i: [['queso-paisa-300-g', 40], ['queso-guayanes-250-g', 25]] },
  pasta: { n: 'una pasta', i: [['queso-duro-500-g', 35]] }
};
function plan(people, occ) { const r = RULES[occ], lines = r.i.map(([id, g]) => { const p = byId(id); return { p, packs: Math.max(1, Math.ceil(people * g / p.g)) }; }); return { lines, total: lines.reduce((s, l) => s + now(l.p) * l.packs, 0), perPerson: r.i.reduce((s, x) => s + x[1], 0), occ: r.n, people }; }
const occFrom = t => /desayun/.test(t) ? 'desayuno' : /aperitiv|picoteo|tabla|invitad|tapas/.test(t) ? 'aperitivo' : /arepa/.test(t) ? 'arepas' : /ensalad/.test(t) ? 'ensalada' : /pasta|espagueti|rall|lasana/.test(t) ? 'pasta' : null;

/* ---------- test del queso ---------- */
const QUIZ = [
  { q: '¿Para qué momento es?', o: ['Desayuno', 'Aperitivo', 'Comida', 'Merienda'], k: [['desayun'], ['aperitiv', 'tapa', 'picoteo'], ['comida', 'cena', 'almuerzo'], ['merienda', 'postre']] },
  { q: '¿Cómo lo prefieres?', o: ['Fresco y suave', 'A la plancha o frito', 'Para rallar y gratinar', 'Para untar'], k: [['fresc', 'suave'], ['plancha', 'frit', 'freir'], ['rall', 'gratin'], ['untar', 'untable']] },
  { q: '¿Para cuántas personas?', o: ['1 o 2', '3 a 5', '6 a 10', 'Más de 10'], k: [['1 o 2', 'uno', 'dos', 'pareja'], ['3 a 5', 'tres', 'cuatro'], ['6 a 10', 'seis', 'ocho'], ['mas de 10', 'muchos', '12', '15', '20']] }
];
function quizStart() { K.quiz = { step: 0, a: [] }; say('Vamos con el test del queso: tres preguntas y te digo qué queso y qué receta te encajan. ' + QUIZ[0].q, '', QUIZ[0].o); }
function quizAnswer(txt) {
  const z = K.quiz, o = QUIZ[z.step].o, tt = norm(txt); let i = o.findIndex(x => norm(x) === tt); if (i < 0) i = QUIZ[z.step].k.findIndex(ks => ks.some(w => tt.includes(w)));
  if (i < 0 && z.step === 2) { const nn = parseInt((tt.match(/\d+/) || [])[0], 10); if (nn) i = nn <= 2 ? 0 : nn <= 5 ? 1 : nn <= 10 ? 2 : 3; }
  if (i < 0) { K.quiz = null; return reply(txt); } /* no era una respuesta: salimos del test y contestamos */
  z.a.push(i); z.step++;
  if (z.step < QUIZ.length) return say(QUIZ[z.step].q, '', QUIZ[z.step].o);
  K.quiz = null;
  const [mom, est, gente] = z.a, momento = ['desayuno', 'aperitivo', 'comida', 'merienda'][mom];
  let pid = est === 0 ? ['queso-telita-250-g', 'queso-crineja-500-g', 'queso-guayanes-250-g', 'queso-paisa-300-g'][mom] : est === 1 ? ['queso-de-mano-500-g', 'queso-llanero-300-g', 'queso-llanero-300-g', 'queso-telita-250-g'][mom] : est === 2 ? 'queso-duro-500-g' : 'nata-criolla-250-g';
  const p = byId(pid), n = [2, 4, 8, 12][gente], rec = recipesFor(pid).find(r => r.tipos.includes(momento)) || recipesFor(pid)[0];
  const c = rec ? recipeCheese(rec, n) : null, packs = Math.max(1, Math.ceil(n * PORCION / p.g));
  say(`Tu queso es el ${p.short}. ${p.idea} Para ${n} personas calcula ${packs} ${packs === 1 ? 'envase' : 'envases'} de ${p.g} g (${eur(packs * now(p))}).`,
    mini(p) + (rec ? `<p class="msg__sub">Receta que te propongo:</p>` + rmini(rec) : '') + acts([['quiz', 'Repetir el test', '1']]), ['Receta con ' + p.short.replace('Queso ', ''), '¿Con qué lo combino?', 'Hazme el test del queso', 'Ofertas']);
  K.ctxProduct = pid; A.ctx = pid;
}

/* Simula el envío del presupuesto mayorista a ventas (propuesta de demostración) */
function sendQuoteChat() {
  if (!A.wh.lines().length) return say('Tu presupuesto aún está vacío. Dime, por ejemplo, «200 raciones de queso telita de 80 g».', '', baseChips());
  A.sendQuote().then(r => say(`Simulación hecha: en la web real tu presupuesto ${r.ref} llegaría directamente a ventas, con copia a tu email, y el equipo te responderá con la oferta mayorista. Aquí no se envía ningún correo.`, '', baseChips()))
    .catch(e => say(`${e.message} Completa tus datos en la página Mayoristas y lo envío.`, acts([['page', 'Completar mis datos', 'mayoristas']]), baseChips()));
}

/* ---------- respuestas ---------- */
const FAM_ALIAS = { 'fam-costeno': ['costeno'], 'fam-manaba': ['manaba'], 'fam-oaxaca': ['oaxaca'], 'fam-hondureno': ['hondureno'], 'fam-quesillo': ['quesillo', 'jugoso'] };
const findFamily = t => FAMILY.find(f => FAM_ALIAS[f.id].some(a => new RegExp('\\b' + a + '\\b').test(t)));
const findAny = t => findProduct(t) || findFamily(t);
const CTRY_RE = [['venezuela', /venezuel/], ['colombia', /colombi/], ['ecuador', /ecuator|ecuador/], ['mexico', /mexic/], ['honduras', /hondure|honduras/], ['el-salvador', /salvador/], ['republica-dominicana', /dominican/], ['argentina', /argentin/], ['espana', /\bespana\b|espanol|espanola|spain|catalun|cataluna/], ['europa', /europ|italia|franc[eé]s|francia|grecia|alemania|reino unido|inglaterra|portugal/]];
const fmt1 = n => num(Math.round(n * 10) / 10);
const countryOfName = n => (COUNTRIES.find(c => c.n === n) || {}).id || 'venezuela';
function lineSay(l) { const r = whLine(l); return `${num(r.raciones)} raciones de ${r.gpr} g = ${fmt1(r.kgServed)} kg${r.pack ? ` → ${r.packs} envases de ${r.pack} g (${fmt1(r.porcPorEnvase)} porciones por envase)` : ' (formato por confirmar)'}${r.cost != null ? ' · ' + eur(r.cost) + ' a tarifa pública' : ' · precio a consultar'}`; }
function reply(q) {
  const t = norm(q).trim();
  if (K.quiz) return quizAnswer(q);

  const people = (t.match(/(\d{1,3})\s*(personas|comensales|invitados|amigos|pax|cubiertos)/) || t.match(/\bpara\s+(\d{1,3})\b/) || [])[1];
  const raciones = (t.match(/(\d{1,5})\s*(raciones|racion|menus|platos|servicios)/) || [])[1];
  const gramos = (t.match(/(\d{2,3})\s*(g|gr|gramos)\b/) || [])[1];
  const kilos = (t.match(/(\d{1,5}(?:[.,]\d+)?)\s*(kg|kilos?)\b/) || [])[1];
  const prod = findProduct(t), oc = occFrom(t);
  const cp = prod || (A.ctx && byId(A.ctx));

  /* saludo, gracias, identidad */
  if (/^(hola|buenas|hey|buenos|ey|que tal)/.test(t) && t.length < 25) return say(mayo() ? 'Hola. Dime qué quesos quieres para tu negocio y cuántas raciones de cada uno.' : 'Hola. Cuéntame qué vas a preparar, para cuántos, o pregúntame por recetas, precios y ofertas.', '', baseChips());
  if (/^(gracias|genial|perfecto|vale|ok|muchas gracias)/.test(t) && t.length < 28) return say('De nada. Si quieres, seguimos con otra cosa.', '', baseChips());
  if (/quien eres|como te llamas|que eres|que haces|que sabes|que puedes|ayuda|funciones/.test(t)) return say('Soy Kita, la vaca de Venelac. Puedo: recomendarte un queso, enseñarte recetas con cantidades, calcular un menú para tus invitados, comparar el precio por kilo y la ración, hacerte un test para elegir, y si tienes un negocio, calcular volúmenes y preparar tu solicitud de tarifa mayorista. No tengo datos de stock ni de envíos: eso lo confirma el equipo de ventas.', '', baseChips());

  /* test */
  if (/test|adivin|no se (cual|que) (queso|elegir|comprar)|ayudame a elegir|juguemos|jugar|quiz|recomiendame un queso$|que queso (me|elijo|compro)/.test(t) && !prod) return quizStart();

  if (mayo() && /(que|cuanto|ver|muestra|resumen|como va).*(presupuesto|llevo|pedido)|mi presupuesto|que llevo/.test(t) && !/copia|copiar|genera|prepara|manda|envia|vacia|borra|quita/.test(t)) {
    const ls = A.wh.lines(); if (!ls.length) return say('Tu presupuesto mayorista está vacío. Elige los quesos en la página Mayoristas o dime «200 raciones de queso telita de 80 g».', acts([['page', 'Abrir Mayoristas', 'mayoristas']]), baseChips());
    const T = A.wh.totals(); return say(`Tu presupuesto: ${T.L.length} ${T.L.length === 1 ? 'queso' : 'quesos'}, ${fmt1(T.kg)} kg, ${T.packs} envases y ${num(T.raciones)} raciones. Total a tarifa pública: ${eur(T.cost)}${T.pending ? ` (+ ${T.pending} a consultar)` : ''}.`, T.L.map(r => `<div class="mc"><img src="assets/${r.p.img}" alt=""><span><b>${r.p.short}</b><small>${num(r.raciones)} raciones de ${r.gpr} g · ${fmt1(r.kgServed)} kg${r.packs ? ' · ' + r.packs + ' envases' : ''}</small></span><span></span></div>`).join('') + acts([['checkout', 'Ver mi presupuesto y pagar'], ['page', 'Editar presupuesto', 'mayoristas'], ['whcopy', 'Enviar presupuesto a ventas']]), baseChips());
  }
  /* presupuesto mayorista: el cliente elige quesos y raciones */
  const aw = findAny(t), wl = t.match(/(\d{1,5}(?:[.,]\d+)?)\s*(raciones?|kg|kilos?|envases?|paquetes?)\b/);
  const wantsW = /mayorista|por mayor|profesional|negocio|empresa|restaurante|hosteler|catering|distribuidor|revend|supermercado|\bbar\b|cafeteria|\bhotel|tarifa|presupuesto/.test(t);
  const gpr = (t.match(/\bde\s+(\d{2,3})\s*(g|gr|gramos)\b/) || t.match(/(\d{2,3})\s*(g|gr|gramos)\s*(por|la|cada)\s*racion/) || [])[1];
  if (/modo particular|soy particular|cliente particular|para casa|uso personal|para mi casa/.test(t)) { A.setMode('particular', { silent: true }); return say('Hecho: modo particular. ¿Qué vas a cocinar?', '', baseChips()); }
  if (/(quita|elimina|borra|saca)/.test(t) && aw && A.wh.lines().some(l => l.id === aw.id)) { A.wh.remove(aw.id); return say(`Quitado ${aw.short} de tu presupuesto.`, '', baseChips()); }
  if (/(vacia|borra todo|empezar de nuevo|limpiar)/.test(t) && /presupuesto/.test(t)) { A.wh.clear(); return say('He vaciado tu presupuesto mayorista. Dime qué quesos quieres y cuántas raciones.', '', baseChips()); }
  if (/(copia|copiar|genera|prepara|manda|mandar|enviar|envia|envialo|mandalo)/.test(t) && /presupuesto/.test(t)) { sendQuoteChat(); return; }
  const byWord = wl && (/raciones?/.test(wl[2]) ? +String(wl[1]).replace(',', '.') >= 30 : /kg|kilos?/.test(wl[2]) ? +String(wl[1]).replace(',', '.') >= 10 : false);
  if (aw && wl && (mayo() || wantsW || byWord) && !/receta/.test(t)) {
    if (!mayo()) A.setMode('mayorista', { silent: true });
    const u = /raciones?/.test(wl[2]) ? 'raciones' : /kg|kilos?/.test(wl[2]) ? 'kg' : 'envases';
    if (u === 'envases' && !aw.g) return say(`${aw.short} no tiene formato publicado, así que no puedo contar envases. Dime las raciones o los kilos.`, '', baseChips());
    const l = A.wh.add(aw.id, { qty: +String(wl[1]).replace(',', '.'), unit: u, gpr: gpr ? clamp(+gpr, 10, 200) : undefined });
    return say(`Apuntado en tu presupuesto: ${aw.short}, ${lineSay(l)}.`, acts([['checkout', 'Ver mi presupuesto y pagar'], ['whcopy', 'Enviar presupuesto a ventas']]), ['Añade 100 raciones de queso guayanés de 50 g', '¿Qué llevo en mi presupuesto?', 'Envía mi presupuesto a ventas', '¿Condiciones y mínimos?']);
  }
  if (aw && /(anade|agrega|pon|mete|apunta|quiero|necesito)/.test(t) && (mayo() || wantsW) && !/receta/.test(t)) {
    if (!mayo()) A.setMode('mayorista', { silent: true });
    const l = A.wh.add(aw.id, { gpr: gpr ? clamp(+gpr, 10, 200) : undefined });
    return say(`He añadido ${aw.short} a tu presupuesto con ${lineSay(l)}. Dime la cantidad que quieres de verdad, por ejemplo «200 raciones de ${aw.short.replace('Queso ', '').toLowerCase()}», y lo ajusto.`, acts([['checkout', 'Ver mi presupuesto y pagar']]), baseChips());
  }
  if (wl && !aw && (mayo() || wantsW)) {
    if (!mayo()) A.setMode('mayorista', { silent: true });
    return say(`${wl[1]} ${wl[2]}: ¿de qué queso? Tú eliges cuáles quieres en tu negocio y las raciones de cada uno. Dime el queso y lo apunto.`, '', P.filter((p, i, arr) => arr.findIndex(q => q.short === p.short) === i).slice(0, 6).map(p => `${wl[1]} ${/raciones?/.test(wl[2]) ? 'raciones' : wl[2]} de ${p.short.replace('Queso ', '').toLowerCase()}`));
  }
  if (wantsW && !/condicion|minimo|plazo|entrega|transporte|factura|pago|palet/.test(t)) {
    if (!mayo()) A.setMode('mayorista', { silent: true });
    return say('Perfecto, paso a modo mayorista. En la página Mayoristas tú eliges los quesos de tu negocio y cuántas raciones quieres de cada uno, con el gramaje que prefieras; yo calculo kilos, envases y porciones por envase. Así el equipo de ventas recibe el presupuesto ya hecho y solo tiene que analizarlo y enviarte la oferta. Dime, por ejemplo: «200 raciones de queso telita de 80 g».', acts([['page', 'Abrir mi presupuesto', 'mayoristas']]), baseChips());
  }

  /* condiciones mayoristas y logística: no inventar */
  if (/condicion|minimo|plazo|entrega|transporte|portes|palet|factura|iva|forma de pago|pagar|devoluc|muestra|catalogo pdf|ficha tecnica|certificado|alergeno/.test(t) && !/receta/.test(t)) {
    return say(`Eso lo confirma el equipo de ventas de Venelac: ${/muestra/.test(t) ? 'las muestras' : /ficha|certificado|alerg/.test(t) ? 'fichas técnicas, certificados y alérgenos' : 'mínimos de pedido, plazos, transporte, facturación y formas de pago'} no los tengo publicados. Escríbeles a ventas@venelac.es o llama al 640 698 254. Si quieres, te dejo la solicitud preparada con tus volúmenes.`, acts([['page', 'Preparar solicitud', 'mayoristas'], ['page', 'Ir a Contacto', 'contacto']]), baseChips());
  }

  /* precio por kilo, ración, caro/barato */
  if (/kilo|€\/kg|euros por kg|precio por kg|por kg|mas barat|mas econom|mas caro|barato|economico|racion|cuanto sale|cuanto cuesta/.test(t) && !/receta/.test(t) && !(people && !/racion/.test(t))) {
    if (/racion/.test(t) || (/cuanto (sale|cuesta)/.test(t) && !prod && mayo())) {
      const g = gramos ? +gramos : PORCION, top = RANK.slice(0, 4).map(byId);
      return say(`Una ración de ${g} g de queso sale entre ${eur(cRacion(byId(RANK[0]), g))} (${byId(RANK[0]).short}) y ${eur(cRacion(byId(RANK[RANK.length - 1]), g))} (${byId(RANK[RANK.length - 1]).short}). Las cuatro más económicas:`,
        top.map(p => `<div class="mc"><img src="assets/${p.img}" alt=""><span><b>${p.short} ${p.g} g</b><small>${eur(cRacion(p, g))} por ración · ${kg(p)}</small></span><button data-add="${p.id}">Añadir</button></div>`).join('') + acts([['page', 'Ver todo por kilo', 'quesos']]), ['¿Precio por kilo de todo?', 'Calcula para 100 raciones', 'Compara telita y paisa']);
    }
    if (prod && !/barat|econom|caro/.test(t)) return say(`${nm(prod)} cuesta ${eur(now(prod))}: ${kg(prod)}, el puesto ${RANK.indexOf(prod.id) + 1} de ${P.length} en precio por kilo. Una ración de ${PORCION} g sale a ${eur(cRacion(prod))}.`, mini(prod), ['Receta con ' + prod.short.replace('Queso ', ''), 'Compárame con otro', '¿Cuál es el más barato por kilo?']);
    const caro = /mas caro/.test(t), list = (caro ? [...RANK].reverse() : RANK).slice(0, 3).map(byId);
    if (/todo|todos|lista|catalogo|cada/.test(t)) return say('Este es el precio por kilo de todos los productos, del más económico al más caro:', RANK.map(id => { const p = byId(id); return `<div class="mc"><img src="assets/${p.img}" alt=""><span><b>${p.short} ${p.g} g</b><small>${kg(p)} · ${eur(now(p))}</small></span><button data-add="${p.id}">Añadir</button></div>`; }).join(''), ['¿Cuánto cuesta una ración?', 'Solo ofertas', 'Compara telita y paisa']);
    return say(`${caro ? 'Los más caros' : 'Los más económicos'} por kilo, hoy, son:`, list.map(p => `<div class="mc"><img src="assets/${p.img}" alt=""><span><b>${p.short} ${p.g} g</b><small>${kg(p)} · ${eur(now(p))}</small></span><button data-add="${p.id}">Añadir</button></div>`).join('') + acts([['page', 'Ver todo por kilo', 'quesos']]), ['¿Precio por kilo de todo?', '¿Cuánto cuesta una ración?', 'Ofertas']);
  }

  /* comparar dos productos */
  const found = []; P.forEach(p => { const pp = findProduct(norm(p.short)); if (pp && !found.some(f => f.short === pp.short)) { const hit = [norm(p.short), ...p.alias].some(a => new RegExp('\\b' + a + '\\b').test(t)); if (hit) found.push(pp); } });
  if ((found.length >= 2 && /compar|diferenc|versus|\bvs\b|mejor|entre|\bo\b|frente/.test(t)) || (/compar|diferenc|versus|\bvs\b/.test(t) && found.length >= 1 && A.ctx)) {
    const a = found[0], b = found[1] || byId(A.ctx);
    const row = (p) => `<div class="cmpc"><b>${p.short} ${p.g} g</b><span>${eur(now(p))} · ${kg(p)}</span><span>Ración: ${eur(cRacion(p))}</span><small>${p.idea}</small></div>`;
    const cheaper = ppk(a) <= ppk(b) ? a : b;
    return say(`${a.short} frente a ${b.short}: por kilo sale más económico ${cheaper.short} (${kg(cheaper)}). Cada uno tiene su uso: ${a.short}, ${a.idea.charAt(0).toLowerCase() + a.idea.slice(1)} ${b.short}, ${b.idea.charAt(0).toLowerCase() + b.idea.slice(1)}`, `<div class="cmpc-wrap">${row(a)}${row(b)}</div>` + mini(a) + mini(b), ['Receta con ' + a.short.replace('Queso ', ''), 'Receta con ' + b.short.replace('Queso ', ''), '¿Precio por kilo de todo?']);
  }


  /* perfil de cocina: sabor, textura, cómo se toma, formas típicas */
  const lv = (n, a) => a[Math.max(0, Math.min(4, n - 1))];
  const perfilTxt = p => { const f = p.perfil, sv = k => ['rallado', 'fundido', 'frio', 'caliente'].filter(x => f.servir[x] === k).map(x => SERVIR_L[x].toLowerCase());
    return `${nm(p)}: sabor ${f.sabor.replace(/\.$/, '').toLowerCase()}; textura ${f.textura.replace(/\.$/, '').toLowerCase()}. Intensidad ${lv(f.int, ['muy suave', 'suave', 'media', 'fuerte', 'muy fuerte'])}, ${lv(f.crem, ['poco cremoso', 'algo cremoso', 'cremosidad media', 'cremoso', 'muy cremoso'])} y ${lv(f.sal, ['casi sin sal', 'poco salado', 'salado medio', 'salado', 'muy salado'])}. Se toma ${sv(2).length ? 'mejor ' + sv(2).join(' o ') : 'de varias formas'}${sv(1).length ? '; también ' + sv(1).join(', ') : ''}${sv(0).length ? '; no recomendado ' + sv(0).join(', ') : ''}. Formas típicas de cocinarlo: ${f.formas.join(' ').replace(/\.\s/g, '; ').replace(/\.$/, '')}. Consejo: ${f.tip}`; };
  const rk2 = (k, desc, lbl) => { const l = topBy(k, desc, 3); return say(lbl, l.map(p => `<div class="mc"><img src="assets/${p.img}" alt=""><span><b>${p.short}</b><small>${p.perfil.tags.join(' · ')} · ${kg(p)}</small></span><button data-prod="${p.id}">Ficha</button></div>`).join(''), ['¿Cuál es el más fuerte?', '¿Cuál funde mejor?', '¿Cuál es el más cremoso?', '¿Cuál se ralla?']); };
  const bf = (k, lbl) => { const l = bestFor(k); return say(lbl, l.map(p => `<div class="mc"><img src="assets/${p.img}" alt=""><span><b>${p.short}</b><small>${p.perfil.tags.join(' · ')}</small></span><button data-prod="${p.id}">Ficha</button></div>`).join(''), ['¿Cuál es el más suave?', '¿Cuál se toma frío?', '¿Cuál se ralla?', '¿Cuál funde mejor?']); };
  if (!/receta|precio|cuesta|kilo/.test(t)) {
    if (/(cual|que queso|cuales).*(mas|el mas)?.*(suave|poco fuerte|delicado)/.test(t) && !prod) return rk2('int', false, 'Los quesos más suaves de Venelac:');
    if (/(cual|que queso|cuales).*(fuerte|intenso|curado|potente)/.test(t) && !prod) return rk2('int', true, 'Los quesos de sabor más intenso:');
    if (/(cual|que queso|cuales).*(cremoso|untable|untar)/.test(t) && !prod) return rk2('crem', true, 'Los más cremosos:');
    if (/(cual|que queso|cuales).*(menos salado|poco salado|sin sal)/.test(t) && !prod) return rk2('sal', false, 'Los menos salados:');
    if (/(cual|que queso|cuales).*(mas salado|muy salado)/.test(t) && !prod) return rk2('sal', true, 'Los más salados:');
    if (/(cual|que queso|cuales).*(funde|fundir|fundido|derrite|derretir|hilo|estira|gratina)/.test(t) && !prod) return bf('fundido', 'Los que mejor se funden (para gratinar, rellenar o estirar):');
    if (/(cual|que queso|cuales).*(rall|gratinar con|para pasta)/.test(t) && !prod) return bf('rallado', 'El que mejor se ralla:');
    if (/(cual|que queso|cuales).*(frio|ensalada|tabla|crudo)/.test(t) && !prod) return bf('frio', 'Los mejores para tomar en frío:');
    if (/(cual|que queso|cuales).*(caliente|plancha|frito|freir|horno)/.test(t) && !prod) return bf('caliente', 'Los que mejor funcionan en caliente:');
    const kw = /sabor|textura|a que sabe|como (es|sabe)|suave|fuerte|intens|cremos|salad|funde|fundir|fundido|ralla|frio|caliente|como se (toma|come|sirve|cocina|usa|tomo|como|cocino|prepara)|se toma|se come|formas? (de|tipicas)|tipic|se puede (rallar|fundir|freir|tomar)/.test(t);
    const pf = prod || (kw && A.ctx && byId(A.ctx));
    if (kw && pf) return say(perfilTxt(pf), mini(pf) + acts([['prod', 'Ver la ficha', pf.id]]), ['Receta con ' + pf.short.replace('Queso ', ''), '¿Con qué lo combino?', '¿Cuál es el más suave?', '¿Cuál funde mejor?']);
    const fm = findFamily(t);
    if (kw && fm) return say(`${fm.name}: perfil orientativo del tipo de queso (formato por confirmar). Sabor ${fm.perfil.sabor.replace(/\.$/, '').toLowerCase()}; textura ${fm.perfil.textura.replace(/\.$/, '').toLowerCase()}. Formas típicas: ${fm.perfil.formas.join(' ').replace(/\.\s/g, '; ').replace(/\.$/, '')}.`, '', baseChips());
  }

  /* países y quesos de la familia */
  const ctry = CTRY_RE.find(([, re]) => re.test(t));
  if (/\bpaises\b|latinoamerica|latam|de donde (son|vienen)|en que paises/.test(t) && !ctry) return say('Tengo 7 recetas típicas de cada uno de estos destinos: Venezuela, Colombia, Ecuador, México, Honduras, El Salvador, República Dominicana, Argentina, España y Europa. En la tienda de Venelac los quesos con precio están en la categoría Venezuela. Dime tu país y te cuento su queso y sus recetas.', acts([['page', 'Ver recetas por países', 'recetas']]), COUNTRIES.map(c => 'Soy de ' + c.n));
  if (ctry && !/mayorista|presupuesto|envio|enviais|transporte|entrega|precio|tarifa|oficina|fabric/.test(t)) {
    const c = countryOf(ctry[0]), all = countryCheeses(c).map(anyProd), shop = all.filter(p => !p.consulta), fam = all.filter(p => p.consulta), nx = COUNTRIES[(COUNTRIES.indexOf(c) + 1) % COUNTRIES.length];
    return say(`${c.n}: ${c.plato}. ${c.texto} Sus 7 recetas típicas con quesos Venelac: ${c.recetas.map(r => rById(r).name).join('; ')}.${fam.length ? ' De la familia Venelac y Campo Andino aparece: ' + fam.map(f => f.short).join(', ') + ' (formato y precio a consultar).' : ''}`,
      c.recetas.slice(0, 3).map(r => rmini(rById(r))).join('') + shop.slice(0, 3).map(mini).join('') + acts([['country', 'Ver las 7 recetas de ' + c.n, c.id]]), ['Recetas de ' + nx.n, '¿Cuál es el más suave?', '¿Cuál funde mejor?', '¿De qué países tenéis quesos?']);
  }
  const fam = findFamily(t);
  if (fam && !wl) return say(`${fam.name}: ${fam.nota}. Aparece en la foto de la familia Venelac y Campo Andino de la web, pero no tiene precio ni formato publicado. Disponibilidad y tarifa: equipo de ventas (ventas@venelac.es · 640 698 254).`, (mayo() ? `<div class="mc"><img src="assets/${fam.img}" alt=""><span><b>${fam.short}</b><small>Consultar formato y precio · ${fam.pais}</small></span><button data-add="${fam.id}">Añadir</button></div>` : `<div class="mc"><img src="assets/${fam.img}" alt=""><span><b>${fam.short}</b><small>${fam.pais} · consultar con ventas</small></span><span></span></div>`) + acts([['country', 'Ver ' + fam.pais, countryOfName(fam.pais)], ['page', 'Contacto', 'contacto']]), baseChips());

  /* recetas */
  const RK = [['arepa', 'arepas-telita'], ['tequen', 'tequenos-llanero'], ['cachapa', 'cachapas-mano'], ['pasta|gratin', 'pasta-duro'], ['ensalad', 'ensalada-guayanes'], ['tostada', 'tostadas-nata'], ['tabla', 'tabla-crineja'], ['empanada', 'empanadas-paisa'], ['plancha', 'llanero-plancha'], ['sandwich|bocadillo|fundid', 'sandwich-telita'], ['pupusa', 'pupusas'], ['baleada', 'baleadas'], ['quesadilla', 'quesadillas'], ['mollete', 'molletes'], ['llapingacho', 'llapingachos'], ['pandebono|pan de bono', 'pandebono'], ['queso frito|tostone|mangu', 'queso-frito'], ['provoleta', 'provoleta'], ['empanada.*viento|viento', 'empanadas-viento'], ['choclo', 'arepa-choclo']];
  const rk = RK.find(([re]) => new RegExp(re).test(t));
  if (/receta|como (se )?(hace|hago|preparo|cocino)|paso a paso|cocina conmigo|que (hago|cocino|preparo|puedo (hacer|cocinar|preparar))|ideas|plato|usos?\b|para que sirve|que hago con/.test(t) || (rk && /hacer|preparar|cocinar/.test(t))) {
    const nm = t.match(/cocina conmigo:?\s*(.+)/);
    let rec = null; if (nm) rec = R.find(r => norm(r.name).includes(norm(nm[1]).slice(0, 14))); if (!rec && rk && !prod) rec = rById(rk[1]); if (!rec && prod && /como (se )?(hace|hago|preparo)|paso a paso/.test(t)) rec = recipesFor(prod.id)[0];
    if (rec) {
      K.ctxRecipe = rec.id; const n = people ? clamp(+people, 1, 100) : 4; K.n = n; const c = recipeCheese(rec, n);
      return say(`${rec.name} (${n} raciones, ${rec.min} min, ${rec.nivel.toLowerCase()}). Quesos: ${c.lines.map(l => `${l.p.short} ${l.need} g`).join(' y ')} (queso por ración ${eur(c.exact / n)}). Pasos: ${rec.pasos.map((s, i) => `${i + 1}. ${s}`).join(' ')} Truco: ${rec.tip}`,
        c.lines.map(l => mini(l.p)).join('') + acts([['recipe', 'Ver receta completa', rec.id], ['recipeadd', 'Añadir los quesos', rec.id]]), ['Otra receta', 'Para 8 personas', '¿Con qué lo combino?', 'Hazme el test del queso']);
    }
    const tp = /desayun/.test(t) ? 'desayuno' : /aperitiv|tapa|picoteo/.test(t) ? 'aperitivo' : /comida|cena|almuerzo|plato principal/.test(t) ? 'comida' : /merienda|postre|dulce/.test(t) ? 'merienda' : null;
    const list = prod ? recipesFor(prod.id) : tp ? R.filter(r => r.tipos.includes(tp)) : R.slice(0, 4);
    if (!list.length) return say(`Con ${prod.short} no tengo una receta propia, pero va bien para: ${prod.idea.charAt(0).toLowerCase() + prod.idea.slice(1)}`, mini(prod), baseChips());
    return say(prod ? `Recetas con ${prod.short}:` : tp ? `Recetas para ${TIPO_L[tp]}:` : 'Estas son algunas recetas con queso latino. Pídeme cualquiera y te la explico paso a paso:', list.slice(0, 4).map(rmini).join('') + acts([['page', 'Ver todas las recetas', 'recetas']]), ['Receta de arepas', 'Receta de tequeños', 'Recetas de desayuno', 'Recetas de aperitivo']);
  }

  /* menú para N personas */
  if (people || (oc && /menu|prepar|cocin|organiz|cuanto|cantidad/.test(t))) {
    const n = clamp(+people || 4, 1, 80), pl = K.lastPlan = plan(n, oc || 'aperitivo');
    return say(`Para ${n} personas y ${pl.occ}, calculo unos ${pl.perPerson} g de queso por persona (estimación orientativa). Mi propuesta (${eur(pl.total)}):`, pl.lines.map(l => `<div class="mc"><img src="assets/${l.p.img}" alt=""><span><b>${l.packs} × ${l.p.name}</b><small>${eur(now(l.p) * l.packs)}</small></span><span></span></div>`).join('') + acts([['planadd', 'Añadir todo al ' + (mayo() ? 'presupuesto' : 'pedido')]]), ['Para 12 personas', 'Receta para ese menú', 'Ofertas']);
  }

  if (rk && !prod) { const rec = rById(rk[1]); return say(`Te cuento ${rec.name}:`, rmini(rec) + acts([['recipe', 'Ver receta completa', rec.id]]), ['Cómo se hace ' + rec.name.split(' ')[0], 'Para 8 personas']); }

  /* ofertas */
  if (/oferta|descuento|rebaja|promo/.test(t)) return say('Estos quesos tienen precio rebajado en la tienda:', P.filter(p => p.sale).map(p => `<div class="mc"><img src="assets/${p.img}" alt=""><span><b>${p.name}</b><small>${eur(now(p))} <s>${eur(p.price)}</s> · −${off(p)}% · ${kg(p)}</small></span><button data-add="${p.id}">Añadir</button></div>`).join(''), ['¿Cuál es el más barato por kilo?', 'Menú para 8 personas, aperitivo']);

  /* pedido */
  const cart = A.getCart();
  if (/(anade|agrega|pon|mete|quiero|comprar|apunta)/.test(t) && (prod || /este|esto/.test(t))) {
    const q = (t.match(/\b(\d{1,3})\b/) || [])[1], target = prod || cp;
    if (target) { A.addToCart(target.id, q ? clamp(+q, 1, 99) : 1, true); return say(`Hecho: añadido ${q ? q + ' × ' : ''}${nm(target)}. Total actual: ${eur(A.cartTotal())}.`, acts([['checkout', 'Ver mi pedido y pagar'], ['page', 'Ver quesos', 'quesos']]), baseChips()); }
  }
  if (/pedido|carrito|cesta|presupuesto/.test(t)) {
    const ids = Object.keys(cart); if (!ids.length) return say(`Tu ${mayo() ? 'presupuesto' : 'pedido'} está vacío. Dime qué vas a preparar o cuántas raciones usas y te lo preparo.`, '', baseChips());
    return say(`Llevas ${A.cartCount()} ${A.cartCount() === 1 ? 'unidad' : 'unidades'}, total estimado ${eur(A.cartTotal())}:`, ids.map(id => `<div class="mc"><img src="assets/${byId(id).img}" alt=""><span><b>${nm(byId(id))}</b><small>${cart[id]} × ${eur(now(byId(id)))}</small></span><span></span></div>`).join('') + acts([['checkout', 'Ver mi pedido y pagar']]), baseChips());
  }

  /* etiqueta / conservación / nutrición */
  if (/conserv|caduc|nevera|frio|congel|ingred|calor|nutri|grasa|proteina|sal\b|etiqueta|alergen|lactosa|pasteuriz|que (tiene|lleva)|composicion|hecho de|hecho con/.test(t) && cp) {
    if (cp.label) return say(`${cp.short}, según su etiqueta: ${cp.label}`, mini(cp), baseChips());
    return say(`No tengo publicada la etiqueta de ${cp.short} (ingredientes, nutrición, conservación). Está en el envase, o puedes pedirla a ventas@venelac.es. Del Queso de Mano sí la tengo.`, acts([['prod', 'Ver Queso de Mano', 'queso-de-mano-500-g'], ['page', 'Contacto', 'contacto']]), baseChips());
  }

  /* combinar / maridaje */
  if (/combin|acompan|maridaj|va bien con|con que (lo )?(como|sirvo|tomo)/.test(t) && cp) { const mx = byId(cp.mix); return say(`${cp.short} va bien con ${cp.maridaje}. Entre nuestros quesos, combínalo con ${mx.short}. Son sugerencias, no reglas.`, mini(cp) + mini(mx), ['Receta con ' + cp.short.replace('Queso ', ''), 'Compara ' + cp.short.replace('Queso ', '').toLowerCase() + ' y ' + mx.short.replace('Queso ', '').toLowerCase()]); }

  /* ficha de producto */
  if (prod && (/cuentame|hablame|informacion|info|que es|como es|sobre el|sobre la/.test(t) || t.split(' ').length <= 4 || A.ctx)) {
    const rs = recipesFor(prod.id);
    return say(`${nm(prod)}: ${prod.idea} Cuesta ${eur(now(prod))} (${kg(prod)}, ración de ${PORCION} g: ${eur(cRacion(prod))}). Combina con ${prod.maridaje}.`, mini(prod) + (rs.length ? `<p class="msg__sub">Recetas con este queso:</p>` + rs.slice(0, 2).map(rmini).join('') : ''), ['Receta con ' + prod.short.replace('Queso ', ''), '¿Con qué lo combino?', 'Compárame con otro', mayo() ? '¿Cuánto cuesta una ración?' : 'Para 6 personas']);
  }

  /* marca */
  if (/mision|vision|quienes sois|quienes somos|historia|sobre vosotros|sobre venelac/.test(t)) return say('Venelac Food lleva más de 10 años trayendo el sabor auténtico del queso latino a los hogares de España. Misión: llevar ese sabor a cada rincón de España y que te sientas cada vez más cerca de casa. Visión: ser el referente número uno de quesos latinoamericanos en Europa. VENELAC con sabor de Hogar.', acts([['page', 'Conocer más', 'nosotros']]), baseChips());
  if (/calidad|higiene|laboratorio|control|pasteurizaci/.test(t)) return say('La calidad descansa en tres pilares: control de la pasteurización, pruebas de laboratorio y procesos cuidadosos, con la higiene siempre presente.', '', baseChips());
  if (/hectarea|ganado|litros|cifra|vacas|leche|origen/.test(t)) return say('Cifras de Venelac: 34.000 hectáreas de pasto, 2.790 cabezas de ganado y 18.195 litros de leche al mes. En la etiqueta del Queso de Mano figura «origen de la leche: España», y se fabrica en Castelló d´Empúries (Girona).', '', baseChips());
  if (/familia|marcas|surena|andino|venelac blanco/.test(t)) return say('La familia de marcas: La Surena, Venelac Blanco y Campo Andino.', acts([['page', 'Ver familia', 'nosotros']]), baseChips());
  if (/donde|direccion|ubic|telefono|llam|email|correo|contact|horario|redes|instagram|facebook|youtube/.test(t)) return say('Escríbenos a ventas@venelac.es o llama al 640 698 254. Estamos en C/ Selva 15, 17486, Castelló d´Empúries (Girona). También en Instagram y Facebook como @venelacoficial. No tengo publicado el horario de atención.', acts([['page', 'Ir a Contacto', 'contacto']]), baseChips());
  if (/tienda|comprar|envio|enviais|domicilio|reparto/.test(t)) return say(mayo() ? 'Para volúmenes profesionales, lo mejor es pedir la tarifa mayorista: te la prepara el equipo de ventas.' : 'Puedes comprar aquí mismo: añade quesos a tu pedido y paga con tarjeta. Los envíos y plazos los confirma el equipo de ventas; yo no tengo esos datos.', acts([['page', mayo() ? 'Pedir tarifa' : 'Ver quesos', mayo() ? 'mayoristas' : 'quesos']]), baseChips());

  /* recomendación por uso */
  const r = recommend(q);
  if (r.length) return say('Para eso yo probaría:', r.map(mini).join('') + acts([['page', 'Ver todos los quesos', 'quesos']]), ['Receta con ' + r[0].short.replace('Queso ', ''), '¿Con qué lo combino?', 'Hazme el test del queso']);

  say('No estoy segura de haberte entendido. Prueba con «receta de arepas», «menú para 8 personas», «precio por kilo» o «soy restaurante». Para otras dudas, escribe a ventas@venelac.es.', '', baseChips());
}

/* sugerencia inicial: burbuja de Kita una vez */
setTimeout(() => { const f = $('#kitaFab'); if (!K.hintShown && f && !drawer.classList.contains('open')) { K.hintShown = true; f.classList.add('hint'); setTimeout(() => f.classList.remove('hint'), 5200); } }, 3500);
})();
