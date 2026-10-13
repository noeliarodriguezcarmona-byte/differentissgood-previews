(() => {
'use strict';
const { norm, eur, esc, clamp, num, SHOP, P, R, FAMILY, COUNTRIES, flag, flagOfName, countryCheeses, SERVIR_L, TIPOS, FREQ, GPR, byId, anyProd, countryOf, countriesOfRecipe, now, ppk, off, RANK, PORCION, cRacion, recommend, rById, recipesFor, recipeCheese, scaleQty, whLine, whTotals, whText, whTSV, whRef } = window.V;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const fmt1 = n => num(Math.round(n * 10) / 10);
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const APP = window.APP = {};
/* Propuesta de demostración: no hay servidor, ni pasarela de pago, ni envío de correos. Todo se simula en el navegador. */
APP.cfg = { stripe: true, stripeMode: 'demo', mail: true, loaded: true };
const DEMO_MS = 900;
async function api(path, body) {
  await new Promise(r => setTimeout(r, REDUCED_DEMO ? 0 : DEMO_MS));
  if (path === 'checkout' || path === 'presupuesto') return { ok: true, ref: (body && body.ref) || whRef() };
  return { ok: true };
}
const REDUCED_DEMO = matchMedia('(prefers-reduced-motion: reduce)').matches;
APP.api = api;

/* ============================================================
   Utilidades
   ============================================================ */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2400); }
function copyText(text, ok) {
  const fb = () => { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); let r = false; try { r = document.execCommand('copy'); } catch (e) {} ta.remove(); toast(r ? ok : 'No se pudo copiar. Selecciona el texto manualmente'); };
  try { navigator.clipboard.writeText(text).then(() => toast(ok), fb); } catch (e) { fb(); }
}
function typeInto(el, text, done, speed = 14) {
  const plain = text.replace(/<[^>]+>/g, '');
  if (REDUCED) { el.innerHTML = text; return done && done(); }
  let i = 0;
  const iv = setInterval(() => { i += 2; el.textContent = plain.slice(0, i); if (i >= plain.length) { clearInterval(iv); el.innerHTML = text; done && done(); } }, speed);
}
Object.assign(APP, { toast, copyText, typeInto });

/* Perfil de cocina de un queso: sabor, intensidad, cremosidad, cómo se toma y formas típicas */
const SV = { 2: ['mejor', 'Mejor así'], 1: ['tambien', 'También'], 0: ['no', 'No recomendado'] };
function meter(l1, l2, v) { return `<div class="mt"><span>${l1}</span><i><b style="left:${(v - 1) * 25}%"></b></i><span>${l2}</span></div>`; }
function perfilHTML(p, full = true) {
  const f = p.perfil; if (!f) return '';
  return `<div class="pf">
    <div class="pf__top"><h4>Cómo es</h4>${f.aprox ? '<small class="pf__ap">Perfil orientativo del tipo de queso</small>' : ''}</div>
    <p class="pf__sab"><b>Sabor:</b> ${esc(f.sabor)} <b>Textura:</b> ${esc(f.textura)}</p>
    <div class="pf__ms">${meter('Suave', 'Fuerte', f.int)}${meter('Poco cremoso', 'Muy cremoso', f.crem)}${meter('Poco salado', 'Muy salado', f.sal)}</div>
    <h4>Cómo se toma</h4>
    <ul class="pf__sv">${['rallado', 'fundido', 'frio', 'caliente'].map(k => `<li class="sv sv--${SV[f.servir[k]][0]}"><b>${SERVIR_L[k]}</b><span>${SV[f.servir[k]][1]}</span></li>`).join('')}</ul>
    ${full ? `<h4>Formas típicas de cocinarlo</h4><ul class="pf__fm">${f.formas.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="pf__tip"><b>Consejo:</b> ${esc(f.tip)}</p>` : ''}
  </div>`;
}

/* palabras que suben */
$$('[data-split]').forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span class="wi" style="--i:${Math.min(i, 14)}">${w}</span></span>`).join(' ');
});
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .3 });
$$('[data-split]:not(.slide [data-split])').forEach(el => io.observe(el));

/* ============================================================
   Modo: cliente particular / mayorista
   ============================================================ */
let mode = store.get('venelac4-mode') === 'mayorista' ? 'mayorista' : 'particular';
let view = 'fotos';
function setMode(m, opts = {}) {
  mode = m; store.set('venelac4-mode', m); document.body.dataset.mode = m;
  $$('.mode-sw button').forEach(b => b.classList.toggle('is-on', b.dataset.mode === m));
  const may = m === 'mayorista';
  renderCart();
  $('#qTitle').textContent = may ? 'Catálogo profesional' : 'nuestros Quesos';
  $('#qEyebrow').textContent = may ? 'Precio por kilo y formatos' : 'Nuestros productos estrellas';
  $('#finderInput').placeholder = may ? '¿Qué necesitas? Ej. aperitivo para 80' : '¿Qué quieres cocinar?';
  $('#kitaModeTxt').textContent = may ? 'Hablas como cliente mayorista' : 'Hablas como cliente particular';
  if (opts.view !== false) setView(may ? 'kilo' : 'fotos');
  if (APP.onMode) APP.onMode(m, opts);
}
document.addEventListener('click', e => { const b = e.target.closest('.mode-sw button'); if (b) { setMode(b.dataset.mode); toast(b.dataset.mode === 'mayorista' ? 'Modo mayorista: precios por kilo y presupuestos' : 'Modo particular'); } });
$('#kitaModeBtn').addEventListener('click', () => { setMode(mode === 'mayorista' ? 'particular' : 'mayorista'); });

/* ============================================================
   Pedido (particular) y presupuesto (mayorista)
   ============================================================ */
let cart = {};
try { cart = JSON.parse(store.get('venelac4-cart') || '{}') || {}; } catch (e) { cart = {}; }
Object.keys(cart).forEach(k => { if (!byId(k) || !(cart[k] > 0)) delete cart[k]; });
const cartTotal = () => Object.entries(cart).reduce((s, [id, q]) => s + now(byId(id)) * q, 0);
const cartCount = () => Object.values(cart).reduce((s, q) => s + q, 0);
function saveCart() { store.set('venelac4-cart', JSON.stringify(cart)); renderCart(); }

/* presupuesto mayorista: el cliente elige quesos, cantidad, unidad y gramos por ración */
let wh = { lines: [], freq: 'semanal', ref: '', c: {} };
try { const s = JSON.parse(store.get('venelac4-wh') || 'null'); if (s && Array.isArray(s.lines)) wh = Object.assign(wh, s); } catch (e) {}
wh.lines = wh.lines.filter(l => anyProd(l.id));
if (!wh.ref) wh.ref = whRef();
function saveWh() { store.set('venelac4-wh', JSON.stringify(wh)); renderCart(); renderMW(); }
function whAdd(id, o = {}) {
  const p = anyProd(id); let l = wh.lines.find(x => x.id === id);
  if (!l) { l = { id, qty: o.qty != null ? o.qty : 1, unit: o.unit || (p.g ? 'envases' : 'kg'), gpr: o.gpr || PORCION }; wh.lines.push(l); }
  else if (o.add) { if (l.unit === (o.unit || l.unit)) l.qty = (+l.qty || 0) + (o.qty || 1); }
  else { Object.assign(l, o.qty != null ? { qty: o.qty } : {}, o.unit ? { unit: o.unit } : {}, o.gpr ? { gpr: o.gpr } : {}); }
  saveWh(); return l;
}
/* Añade lo que corresponde: q unidades (envases) del queso. Nunca cantidades inventadas. */
function addToCart(id, q = 1, silent) {
  const p = anyProd(id);
  if (mode === 'mayorista') { whAdd(id, { qty: q, unit: p.g ? 'envases' : 'kg', add: true }); if (!silent) toast(`${q} × ${p.short} añadido al presupuesto`); }
  else { if (!byId(id)) { toast('Este queso no tiene precio publicado: consulta con ventas'); return; } cart[id] = clamp((cart[id] || 0) + q, 1, 999); saveCart(); if (!silent) toast(`${q} × ${byId(id).short} añadido al pedido`); }
  $('.tool--cart').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 450 });
}
/* Añade los quesos de una receta para n personas (los que necesite: 1 o varios) */
function addRecipe(rid, n = 4) {
  const r = rById(rid), c = recipeCheese(r, n);
  c.lines.forEach(l => addToCart(l.p.id, l.packs, true));
  toast(`Para ${n} personas: ${c.lines.map(l => `${l.packs} × ${l.p.short}`).join(' + ')}`);
  return c;
}
function renderCart() {
  const may = mode === 'mayorista', list = $('#cartList');
  $('#cartTitle').textContent = may ? 'Mi presupuesto' : 'Mi pedido';
  $('#cartCopy').hidden = !may; $('#cartCopy span').textContent = 'Enviar presupuesto a ventas';
  $('#cartTotL').textContent = may ? 'Total a tarifa pública' : 'Total estimado';
  const shop = $('#cartShop'); shop.textContent = may ? 'Editar en Mayoristas' : 'Seguir comprando'; $('#cartPay span').textContent = may ? 'Ver mi presupuesto y pagar' : 'Ir a pagar';
  shop.setAttribute('href', may ? '#mayoristas' : '#quesos'); shop.setAttribute('data-link', '');
  $('#cartNote').textContent = may ? 'Precios de tarifa pública. La oferta mayorista, los mínimos y el transporte los confirma ventas.' : 'Demostración: el pago se simula, no se cobra nada. Los precios son los de la tienda.';
  if (may) {
    const T = whTotals(wh.lines);
    $('#cartCount').textContent = wh.lines.length;
    $('#cartSub').textContent = wh.lines.length ? `${wh.lines.length} ${wh.lines.length === 1 ? 'queso' : 'quesos'} · ${num(Math.round(T.kg * 10) / 10)} kg` : 'Vacío';
    $('#cartTot').textContent = eur(T.cost);
    list.innerHTML = T.L.length ? T.L.map(l => `<div class="ci"><img src="assets/${l.p.img}" alt=""><div><b>${esc(l.p.short)}</b><small>${num(l.raciones)} raciones de ${l.gpr} g · ${num(Math.round(l.kgServed * 10) / 10)} kg${l.packs ? ' · ' + l.packs + ' envases' : ''}</small></div><div class="ci__r">${l.cost != null ? eur(l.cost) : 'consultar'}<button data-whrm="${l.p.id}">Quitar</button></div></div>`).join('')
      : '<div class="empty"><b>Tu presupuesto está vacío</b>Elige los quesos de tu negocio en la página Mayoristas.</div>';
    return;
  }
  const ids = Object.keys(cart);
  $('#cartCount').textContent = cartCount();
  $('#cartSub').textContent = ids.length ? `${cartCount()} ${cartCount() === 1 ? 'unidad' : 'unidades'}` : 'Vacío';
  $('#cartTot').textContent = eur(cartTotal());
  list.innerHTML = ids.length ? ids.map(id => { const p = byId(id), q = cart[id]; return `<div class="ci"><img src="assets/${p.img}" alt=""><div><b>${p.name}</b><small>${eur(now(p))} · ${eur(ppk(p))}/kg</small><div class="qty"><button data-cq="${id}" data-d="-1" aria-label="Menos">−</button><output>${q}</output><button data-cq="${id}" data-d="1" aria-label="Más">+</button></div></div><div class="ci__r">${eur(now(p) * q)}<button data-rm="${id}">Quitar</button></div></div>`; }).join('')
    : '<div class="empty"><b>Tu pedido está vacío</b>Añade quesos, mira una receta o pídele un menú a Kita.</div>';
}
$('#cartList').addEventListener('click', e => {
  const q = e.target.closest('[data-cq]'), r = e.target.closest('[data-rm]'), w = e.target.closest('[data-whrm]');
  if (q) { const id = q.dataset.cq; cart[id] += +q.dataset.d; if (cart[id] < 1) delete cart[id]; saveCart(); }
  if (r) { delete cart[r.dataset.rm]; saveCart(); }
  if (w) { wh.lines = wh.lines.filter(l => l.id !== w.dataset.whrm); saveWh(); }
});
function cartText() {
  if (mode === 'mayorista') return whText(wh.lines, custData());
  const ids = Object.keys(cart);
  return 'Pedido Venelac\n' + ids.map(id => `${cart[id]} × ${byId(id).name} — ${eur(now(byId(id)) * cart[id])}`).join('\n') + `\nTotal estimado: ${eur(cartTotal())}\n\nContacto: ventas@venelac.es · 640 698 254`;
}
$('#cartCopy').addEventListener('click', () => { closeDrawer($('#cart')); go('mayoristas'); setTimeout(() => $('#mform').scrollIntoView({ behavior: 'smooth', block: 'center' }), 900); });

/* cajones */
const scrim = $('#scrim');
function openDrawer(el) { $$('.drawer.open').forEach(d => d !== el && closeDrawer(d)); el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); scrim.classList.add('on'); $('#kitaFab').classList.add('hide'); }
function closeDrawer(el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); if (!$('.drawer.open')) { scrim.classList.remove('on'); $('#kitaFab').classList.remove('hide'); } }
scrim.addEventListener('click', () => $$('.drawer.open').forEach(closeDrawer));
$$('.drawer [data-close]').forEach(b => b.addEventListener('click', () => closeDrawer(b.closest('.drawer'))));
$$('[data-open-cart]').forEach(b => b.addEventListener('click', () => openDrawer($('#cart'))));

/* ============================================================
   Pago y envío de presupuesto: simulación de demostración (sin pasarela ni correo)
   ============================================================ */
const co = $('#co'), coBody = $('#coBody');
function coItems() {
  if (mode === 'mayorista') return whTotals(wh.lines).L.map(r => ({ id: r.p.id, img: r.p.img, name: r.p.name.replace(/\.$/, ''), qty: r.packs || 0, qtyTxt: r.pack ? `${r.packs} × ${r.pack} g` : `${fmt1(r.kgServed)} kg`, unit: r.p.price ? now(r.p) : null, cost: r.cost, sub: r.pack ? `${fmt1(r.kgServed)} kg · ${num(r.raciones)} raciones de ${r.gpr} g` : 'Precio y formato a confirmar por ventas' }));
  return Object.keys(cart).map(id => { const p = byId(id), q = cart[id]; return { id, img: p.img, name: p.name.replace(/\.$/, ''), qty: q, qtyTxt: `${q} ×`, unit: now(p), cost: now(p) * q, sub: `${num(ppk(p))} €/kg` }; });
}
function coTotals() { const it = coItems(); return { it, total: it.reduce((s, x) => s + (x.cost || 0), 0), pend: it.filter(x => x.cost == null).length }; }
function quotePayload() { const c = custData(); return { ref: wh.ref, freq: wh.freq, customer: { empresa: c.empresa, tipo: c.tipo, nombre: c.nombre, email: c.email, tel: c.tel, ciudad: c.ciudad, fecha: c.fecha, obs: c.obs }, lines: wh.lines.map(l => ({ id: l.id, qty: l.qty, unit: l.unit, gpr: l.gpr })) }; }
/* Envía el presupuesto mayorista directamente al correo de ventas (y copia al cliente) */
async function sendQuote() {
  if (!wh.lines.length) throw new Error('Elige primero los quesos de tu negocio.');
  const c = custData(); if (!c.empresa || !c.nombre || !/\S+@\S+\.\S+/.test(c.email)) throw new Error('Completa empresa, persona de contacto y email.');
  return api('presupuesto', quotePayload());
}
APP.sendQuote = sendQuote;
const coBanner = () => '<b>PROPUESTA DE DEMOSTRACIÓN</b> No se cobra nada ni se envía ningún correo: es una simulación de cómo funcionaría.';
function openCheckout() {
  const may = mode === 'mayorista', { it, total, pend } = coTotals();
  if (!it.length) { toast(may ? 'Tu presupuesto está vacío: elige primero los quesos' : 'Tu pedido está vacío'); return; }
  $$('.drawer.open').forEach(closeDrawer); closeModals();
  const f = (id, l, ph = '', o = {}) => `<label for="${id}">${l}</label><input id="${id}" name="${id}" placeholder="${ph}" autocomplete="${o.ac || 'off'}" ${o.req === false ? '' : 'required'} ${o.type ? `type="${o.type}"` : ''} ${o.v ? `value="${esc(o.v)}"` : ''}>`;
  const c = wh.c || {}, bn = coBanner();
  $('.co__demo').innerHTML = bn; $('.co__demo').hidden = !bn;
  coBody.innerHTML = `<section class="co__sum"><h2 id="coTitle">${may ? 'Tu presupuesto' : 'Tu pedido'}</h2><ul class="co__lines">${it.map(x => `<li><img src="assets/${x.img}" alt=""><span><b>${esc(x.name)}</b><small>${esc(x.sub)}</small></span><em>${x.qtyTxt}${x.unit != null ? ' · ' + eur(x.unit) : ''}</em><strong>${x.cost != null ? eur(x.cost) : 'a consultar'}</strong></li>`).join('')}</ul>
      <div class="co__tot"><div><span>Productos</span><b>${eur(total)}</b></div><div><span>Envío y portes</span><b>Se confirman tras el pedido</b></div><div class="co__t"><span>Total a pagar hoy</span><b>${eur(total)}</b></div></div>
      ${pend ? `<p class="co__pend">${pend} ${pend === 1 ? 'producto' : 'productos'} sin precio publicado: ventas te lo confirma y no se cobra ahora.</p>` : ''}
      ${may ? '<p class="co__pend">Precios a tarifa pública de la tienda. Si prefieres una oferta mayorista, envía el presupuesto a ventas sin pagar.</p>' : ''}</section>
    <form class="co__form" id="coForm" autocomplete="on" novalidate>
      <h3>Tus datos</h3>
      <div class="co__r2"><div>${f('coNom', 'Nombre y apellidos', 'Tu nombre', { v: c.nombre || '', ac: 'name' })}</div><div>${f('coEm', 'Email', 'tu@email.com', { type: 'email', v: c.email || '', ac: 'email' })}</div></div>
      <div class="co__r2"><div>${f('coEmp', may ? 'Empresa' : 'Empresa (opcional)', 'Nombre del negocio', { req: may, v: c.empresa || '', ac: 'organization' })}</div><div>${f('coTel', 'Teléfono (opcional)', 'Para el reparto', { req: false, v: c.tel || '', ac: 'tel' })}</div></div>
      <label for="coNotas">Notas para el pedido (opcional)</label><textarea id="coNotas" rows="2" placeholder="Horarios de entrega, dudas…"></textarea>
      <input type="text" id="coWeb" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0">
      <p class="co__hint">En la web real, aquí se abriría la pasarela de pago segura para la dirección de entrega y la tarjeta. En esta propuesta no se pide ni se guarda ningún dato de pago.</p>
      <label class="co__ck"><input type="checkbox" id="coTer" required> Acepto las condiciones de compra y el tratamiento de mis datos para gestionar el pedido</label>
      <p class="co__err" id="coErr" role="alert"></p>
      <button class="btn btn--gold co__pay" type="submit" ${total > 0 && APP.cfg.stripe ? '' : 'disabled'}><span id="coPayT">Simular el pago de ${eur(total)}</span><i class="arr"></i></button>
      ${total > 0 ? '' : '<p class="co__hint">Solo hay productos a consultar: envía el presupuesto a ventas.</p>'}
      ${may ? '<button type="button" class="btn btn--line-d" id="coQuote"><span>Simular el envío a ventas (sin pagar)</span></button>' : ''}
    </form>`;
  $('#coForm').addEventListener('submit', coSubmit);
  const q = $('#coQuote'); if (q) q.addEventListener('click', coQuoteSend);
  co.hidden = false; co.scrollTop = 0; setTimeout(() => $('#coNom') && $('#coNom').focus({ preventScroll: true }), 300);
}
function coCustomer() { return { nombre: $('#coNom').value.trim(), email: $('#coEm').value.trim(), empresa: $('#coEmp').value.trim(), tel: $('#coTel').value.trim(), notas: $('#coNotas').value.trim() }; }
async function coSubmit(e) {
  e.preventDefault(); const err = $('#coErr'), form = e.target; err.textContent = '';
  const miss = $$('input[required]', form).find(i => i.type === 'checkbox' ? !i.checked : !i.value.trim());
  if (miss) { err.textContent = miss.type === 'checkbox' ? 'Acepta los términos para continuar.' : 'Completa los campos obligatorios.'; miss.focus(); return; }
  if (!/\S+@\S+\.\S+/.test($('#coEm').value)) { err.textContent = 'El email no es válido.'; $('#coEm').focus(); return; }
  const btn = $('.co__pay', form); btn.disabled = true; btn.classList.add('busy'); $('#coPayT').textContent = 'Simulando el pago…';
  const c = coCustomer(), may = mode === 'mayorista', it = coItems().filter(x => x.cost != null && x.qty > 0);
  const detalle = may ? it.map(x => `${x.name.replace(/ – .*$/, '')}: ${x.sub}`).join(' | ') : '';
  try {
    const r = await api('checkout', { items: it.map(x => ({ id: x.id, qty: x.qty })), customer: c, mode, ref: wh.ref, detalle, website: $('#coWeb').value });
    if (may) { wh.lines = []; wh.ref = whRef(); store.set('venelac4-wh', JSON.stringify(wh)); } else { cart = {}; store.set('venelac4-cart', '{}'); }
    renderCart(); renderMW && renderMW();
    showSent('Simulación completada', `Así terminaría el pedido <b>${esc(r.ref)}</b>: pago con tarjeta y correo de confirmación a ${esc(c.email)} y a ventas. <b>En esta propuesta no se ha cobrado nada ni se ha enviado ningún correo.</b>`);
  } catch (ex) { err.textContent = ex.message; btn.disabled = false; btn.classList.remove('busy'); $('#coPayT').textContent = `Simular el pago de ${eur(coTotals().total)}`; }
}
async function coQuoteSend() {
  const err = $('#coErr'); err.textContent = '';
  const c = coCustomer(); wh.c = Object.assign(wh.c || {}, { empresa: c.empresa, nombre: c.nombre, email: c.email, tel: c.tel, obs: c.notas }); store.set('venelac4-wh', JSON.stringify(wh));
  const b = $('#coQuote'); b.disabled = true; $('span', b).textContent = 'Enviando…';
  try { const r = await sendQuote(); showSent('Simulación completada', `En la web real, tu presupuesto <b>${esc(r.ref)}</b> llegaría directamente a ventas, con copia a ${esc(c.email)}, y el equipo te responderá con la oferta mayorista. <b>En esta propuesta no se ha enviado ningún correo.</b>`); wh.lines = []; saveWh(); }
  catch (ex) { err.textContent = ex.message; b.disabled = false; $('span', b).textContent = 'Simular el envío a ventas (sin pagar)'; }
}
function showSent(title, html) {
  $('.co__demo').hidden = true;
  coBody.innerHTML = `<section class="co__ok"><div class="co__tick"><svg viewBox="0 0 24 24"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg></div><h2>${title}</h2><p>${html}</p><div class="co__okb"><button class="btn btn--navy" id="coClose"><span>Cerrar</span></button></div></section>`;
  $('#coClose').addEventListener('click', closeCheckout); co.hidden = false;
}
function closeCheckout() { co.hidden = true; }
$('#coX').addEventListener('click', closeCheckout);
co.addEventListener('mousedown', e => { if (e.target === co) closeCheckout(); });
$('#cartPay').addEventListener('click', openCheckout);
addEventListener('keydown', e => { if (e.key === 'Escape' && !co.hidden) closeCheckout(); });
Object.assign(APP, { checkout: openCheckout });
/* ============================================================
   Páginas (router con cortina)
   ============================================================ */
const PAGES = ['inicio', 'quesos', 'recetas', 'nosotros', 'mayoristas', 'contacto'];
let page = 'inicio', busy = false;
const curtain = $('#curtain'), header = $('#header'), burger = $('#burger'), nav = $('#nav');
function show(name, opts = {}) {
  $$('.page').forEach(p => p.classList.toggle('is-active', p.id === 'p-' + name));
  page = name; document.body.dataset.page = name;
  window.scrollTo(0, 0);
  $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === name));
  const el = $('#p-' + name); el.classList.remove('entering'); void el.offsetWidth; el.classList.add('entering');
  if (name === 'nosotros') { setTab(opts.tab || 'somos'); runCounters(); }
  if (name === 'quesos' && opts.product) openPM(opts.product);
  if (name === 'recetas' && opts.country) showCountry(opts.country);
  if (name === 'recetas' && opts.recipe) openRecipe(opts.recipe);
  if (name === 'mayoristas') renderMW();
  if (name === 'inicio') measure();
  updateHeader();
}
function go(name, opts = {}) {
  if (!PAGES.includes(name) || busy) return;
  try { if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name); } catch (e) {}
  closeModals(); $$('.drawer.open').forEach(closeDrawer);
  if (name === page) { if (name === 'nosotros' && opts.tab) setTab(opts.tab); if (name === 'quesos' && opts.product) openPM(opts.product); if (name === 'recetas' && opts.country) showCountry(opts.country); if (name === 'recetas' && opts.recipe) openRecipe(opts.recipe); window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); return; }
  if (REDUCED) return show(name, opts);
  busy = true; curtain.classList.add('cover');
  setTimeout(() => { show(name, opts); curtain.classList.add('leave'); setTimeout(() => { curtain.classList.remove('cover', 'leave'); busy = false; }, 720); }, 640);
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-link]'); if (!a) return;
  e.preventDefault(); const n = a.getAttribute('href').slice(1);
  if (a.dataset.modeSet) setMode(a.dataset.modeSet, { view: a.dataset.modeSet === 'mayorista' ? undefined : undefined });
  if (nav.classList.contains('open')) burger.click();
  go(n, { tab: a.dataset.tab });
});
addEventListener('hashchange', () => { const n = location.hash.slice(1); if (PAGES.includes(n) && n !== page) go(n); });
Object.assign(APP, { go, addToCart, setMode, getMode: () => mode, openDrawer, closeDrawer, getCart: () => cart, cartTotal, cartCount, saveCart });

/* cabecera */
let lastY = 0;
function updateHeader() {
  const y = scrollY; header.classList.toggle('scrolled', y > 40);
  let light = false;
  if (page === 'inicio') { const s = $$('#p-inicio .scene').find(s => { const r = s.getBoundingClientRect(); return r.top <= 40 && r.bottom > 40; }); light = !!s && s.dataset.hdr === 'light'; }
  else light = $('#p-' + page).dataset.hdr === 'light';
  header.classList.toggle('light', light);
  header.classList.toggle('hide', page !== 'inicio' && y > lastY && y > 400 && !nav.classList.contains('open'));
  lastY = y;
}
addEventListener('scroll', updateHeader, { passive: true });
burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); header.classList.toggle('nav-open', o); document.body.style.overflow = o ? 'hidden' : ''; });

/* ============================================================
   Slider de inicio
   ============================================================ */
const hero = $('#hero'), slides = $$('.slide'), dotsEl = $('#slDots'), DUR = 6500;
let cur = 0, anim = false, elapsed = 0, lastT = performance.now(), hover = false;
dotsEl.innerHTML = slides.map((_, i) => `<button aria-label="Ir a la imagen ${i + 1}" data-i="${i}"></button>`).join('');
const dots = $$('button', dotsEl);
function setDots() { dots.forEach((d, i) => { d.classList.toggle('is-on', i === cur); d.classList.toggle('done', i < cur); if (i !== cur) d.style.removeProperty('--p'); }); $('#slNum').textContent = String(cur + 1).padStart(2, '0'); }
function slideTo(n, dir = 1) {
  n = (n + slides.length) % slides.length; if (anim || n === cur) return;
  anim = true; const old = slides[cur], nx = slides[n];
  nx.classList.toggle('from-left', dir < 0); void nx.offsetWidth;
  old.classList.remove('is-active'); old.classList.add('is-leaving'); nx.classList.add('is-active');
  cur = n; elapsed = 0; setDots();
  setTimeout(() => { old.classList.remove('is-leaving'); anim = false; }, REDUCED ? 50 : 1450);
}
$('#slNext').addEventListener('click', () => slideTo(cur + 1, 1));
$('#slPrev').addEventListener('click', () => slideTo(cur - 1, -1));
dotsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) slideTo(+b.dataset.i, +b.dataset.i > cur ? 1 : -1); });
hero.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
hero.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = false; hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); } });
hero.addEventListener('mousemove', e => { if (!FINE || REDUCED) return; const r = hero.getBoundingClientRect(); hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3)); hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
let sx = null; hero.addEventListener('pointerdown', e => { sx = e.clientX; }); hero.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 60 && !e.target.closest('a,button')) slideTo(cur + (e.clientX < sx ? 1 : -1), e.clientX < sx ? 1 : -1); sx = null; });
addEventListener('keydown', e => { if (page === 'inicio' && scrollY < innerHeight * .5 && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { if (e.key === 'ArrowRight') slideTo(cur + 1, 1); if (e.key === 'ArrowLeft') slideTo(cur - 1, -1); } });
setDots();

/* ============================================================
   Favoritos: cinta animada que también se arrastra
   ============================================================ */
const reelTrack = $('#reelTrack'), reel = $('#reel');
const favCard = (p, i) => `<article class="rc" style="--i:${i}" data-id="${p.id}"><div class="rc__img ${p.sq ? 'sq' : ''}"><img src="assets/${p.img}" alt="${esc(p.name)}" loading="lazy" draggable="false"></div><div class="rc__t"><b>${p.short}</b><span>${p.g} g · ${eur(now(p))}</span></div></article>`;
const FAVS = ['queso-telita-250-g', 'queso-guayanes-250-g', 'queso-llanero-300-g', 'queso-de-mano-500-g', 'queso-paisa-300-g', 'nata-criolla-250-g', 'queso-crineja-500-g', 'queso-duro-500-g'].map(byId);
reelTrack.innerHTML = FAVS.map(favCard).join('');
let rx = 0, runit = 0, rhover = false, rvel = 0, drag = null, moved = false, lastX = 0;
reelTrack.addEventListener('click', e => { if (moved) { moved = false; return; } const c = e.target.closest('.rc'); if (c) go('quesos', { product: c.dataset.id }); });
reel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') rhover = true; }); reel.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') rhover = false; });
reel.addEventListener('pointerdown', e => { drag = { x: e.clientX, rx }; lastX = e.clientX; rvel = 0; moved = false; reel.classList.add('grab'); });
addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 6) moved = true; rx = drag.rx + dx; rvel = e.clientX - lastX; lastX = e.clientX; });
const endDrag = () => { if (!drag) return; drag = null; reel.classList.remove('grab'); if (moved) setTimeout(() => { moved = false; }, 60); };
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { reel.classList.add('in'); o.disconnect(); } }), { threshold: .2 }).observe(reel);

/* bucle: parallax, cinta, autoplay */
const par = $$('[data-speed]').map(el => ({ el, s: +el.dataset.speed, base: 0 }));
let vh = innerHeight, last = scrollY, vel = 0;
function setHH() { document.documentElement.style.setProperty('--hh', Math.max(480, innerHeight) + 'px'); }
setHH(); addEventListener('resize', setHH); addEventListener('orientationchange', setHH);
function measure() {
  vh = innerHeight;
  if (page === 'inicio') {
    par.forEach(p => { p.el.style.translate = ''; const r = p.el.getBoundingClientRect(); p.base = r.top + scrollY + r.height / 2; });
    if (!reelTrack.dataset.c) { runit = reelTrack.scrollWidth + 26; reelTrack.insertAdjacentHTML('beforeend', reelTrack.innerHTML.replace(/ style="--i:\d+"/g, ' style="--i:0"')); reelTrack.dataset.c = 1; }
  }
}
addEventListener('resize', () => { clearTimeout(measure.t); measure.t = setTimeout(measure, 120); });
addEventListener('load', measure); document.fonts && document.fonts.ready.then(measure);
function frame(t) {
  const dt = Math.min(64, t - lastT); lastT = t;
  vel += ((scrollY - last) - vel) * .12; last = scrollY;
  if (page === 'inicio') {
    if (!REDUCED) par.forEach(p => { p.el.style.translate = `0 ${((p.base - (scrollY + vh / 2)) * p.s).toFixed(1)}px`; });
    if (runit) {
      if (!drag) { rx += rvel; rvel *= .94; if (Math.abs(rvel) < .05) rvel = 0; if (!rhover && !REDUCED) rx -= .55 + Math.abs(vel) * .35; }
      while (rx <= -runit) rx += runit; while (rx > 0) rx -= runit;
      reelTrack.style.transform = `translate3d(${rx.toFixed(1)}px,0,0)`;
    }
    if (!hover && scrollY < vh * .6 && !document.hidden && !anim) { elapsed += dt; if (elapsed >= DUR) slideTo(cur + 1, 1); }
    const d = dots[cur]; if (d) d.style.setProperty('--p', clamp(elapsed / DUR, 0, 1).toFixed(3));
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   Quesos: fotos y vista € por kilo
   ============================================================ */
const pgrid = $('#pgrid'), klist = $('#klist');
const kg = p => `${num(ppk(p))} €/kg`;
pgrid.innerHTML = P.map((p, i) => `<article class="pc" data-id="${p.id}" style="--d:${i * 50}ms" tabindex="0" role="button" aria-label="${esc(p.name)}">
  <div class="pc__img ${p.sq ? 'sq' : ''}">${p.sale ? `<span class="pc__off">−${off(p)}%</span>` : ''}<span class="pc__pais">${flagOfName(p.pais)}${p.pais}</span><img src="assets/${p.img}" alt="" loading="lazy" draggable="false"></div>
  <div class="pc__b"><b>${p.short}</b><small>${p.g} g · <i class="pc__kg">${kg(p)}</i></small><small class="pc__tg">${p.perfil.tags.slice(0, 2).join(' · ')}</small><div class="pc__row"><span class="pc__p">${p.sale ? `<s>${eur(p.price)}</s>` : ''}${eur(now(p))}</span><button class="pc__add" data-add="${p.id}" aria-label="Añadir ${esc(p.short)}">+</button></div></div></article>`).join('')
  + `<article class="pc pc--ai"><span class="cow-ico cow-ico--gold"></span><h3>¿No sabes cuál elegir?</h3><p>Kita te recomienda el queso según lo que vayas a cocinar.</p><button class="btn btn--gold btn--sm" data-open-kita><span>Pregúntale a Kita</span></button></article>`;
const cards = $$('.pc[data-id]', pgrid);
pgrid.addEventListener('click', e => {
  const a = e.target.closest('[data-add]'); if (a) { e.stopPropagation(); return addToCart(a.dataset.add); }
  const c = e.target.closest('.pc[data-id]'); if (c) { if (pmId === c.dataset.id) return closeModals(); openPM(c.dataset.id); }
});
pgrid.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.pc[data-id]')) openPM(e.target.dataset.id); });

let filter = 'all', ksort = { k: 'def', d: 1 };
const USO_L = { untar: 'Untar', pan: 'Pan', arepa: 'Arepas', desayuno: 'Desayuno', dulce: 'Dulce', postre: 'Postre', crema: 'Crema', tabla: 'Tabla', aperitivo: 'Aperitivo', picoteo: 'Picoteo', fresco: 'Fresco', plancha: 'Plancha', rallar: 'Rallar', pasta: 'Pasta', gratinar: 'Gratinar', pizza: 'Pizza', ensalada: 'Ensalada', desmenuzar: 'Desmenuzar', freir: 'Freír', asar: 'Asar', derretir: 'Fundir' };
function renderKilo() {
  const rows = P.filter(p => filter !== 'sale' || p.sale), maxK = Math.max(...P.map(ppk)), best = byId(RANK[0]), minP = Math.min(...P.map(now));
  const key = { name: p => p.short + p.g, g: p => p.g, price: p => now(p), ppk: p => ppk(p), rac: p => ppk(p) }[ksort.k];
  if (key) rows.sort((a, b) => { const x = key(a), y = key(b); return (typeof x === 'string' ? x.localeCompare(y, 'es') : x - y) * ksort.d; });
  const th = (k, l) => `<button data-s="${k}" class="${ksort.k === k ? 'sorted' : ''}">${l}${ksort.k === k ? (ksort.d > 0 ? ' ↑' : ' ↓') : ''}</button>`;
  klist.innerHTML = `<div class="kr kr--h">${th('name', 'Producto')}${th('g', 'Peso')}${th('price', 'Precio')}${th('ppk', '€ por kg')}${th('rac', 'Ración 60 g')}<span class="u">Perfil</span><span></span></div>` +
    (rows.map(p => `<div class="kr"><a class="kr__p" href="#quesos" data-open="${p.id}"><img src="assets/${p.img}" alt=""><span>${esc(p.short)}<small>${p.g} g</small></span></a><span class="kr__g">${p.g} g</span><span class="kr__pr ${now(p) === minP ? 'low' : ''}">${p.sale ? `<s>${eur(p.price)}</s>` : ''}${eur(now(p))}${p.sale ? `<span class="off">−${off(p)}%</span>` : ''}</span><span class="kr__k ${p.id === RANK[0] ? 'low' : ''}"><span>${kg(p)}${p.id === RANK[0] ? '<span class="best">MEJOR</span>' : ''}</span><span class="bar"><i style="width:${(ppk(p) / maxK * 100).toFixed(0)}%"></i></span></span><span class="kr__r">${eur(cRacion(p))}</span><span class="kr__u">${p.perfil.tags.map(u => `<span>${u}</span>`).join('')}</span><button class="mini-add" data-add="${p.id}" aria-label="Añadir ${esc(p.short)}">+</button></div>`).join(''));
  $('#finderSay').innerHTML = `Más económico por kilo: <b>${best.short} · ${kg(best)}</b>`;
}
function setView(v) {
  view = v; $$('#views button').forEach(b => b.classList.toggle('is-on', b.dataset.v === v));
  pgrid.hidden = v === 'kilo'; klist.hidden = v !== 'kilo';
  if (v === 'kilo') renderKilo(); else $('#finderSay').textContent = 'Porque si el queso no viene con un toque de nostalgia y alegría, no es de Venelac';
}
$('#views').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setView(b.dataset.v); });
klist.addEventListener('click', e => {
  const s = e.target.closest('[data-s]'), a = e.target.closest('[data-add]'), o = e.target.closest('[data-open]');
  if (s) { ksort = { k: s.dataset.s, d: ksort.k === s.dataset.s ? -ksort.d : 1 }; renderKilo(); }
  if (a) addToCart(a.dataset.add);
  if (o) { e.preventDefault(); openPM(o.dataset.open); }
});
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; filter = b.dataset.f;
  $$('#filters button').forEach(x => x.classList.toggle('is-on', x === b));
  cards.forEach(c => { c.classList.toggle('hide', filter === 'sale' && !byId(c.dataset.id).sale); c.classList.remove('match'); });
  if (view === 'kilo') renderKilo();
});
$('#finderForm').addEventListener('submit', e => {
  e.preventDefault(); const q = $('#finderInput').value.trim(); if (!q) return;
  const list = recommend(q), say = $('#finderSay');
  if (view === 'kilo') setView('fotos');
  cards.forEach(c => c.classList.remove('match', 'hide'));
  $$('#filters button').forEach(x => x.classList.toggle('is-on', x.dataset.f === 'all')); filter = 'all';
  if (!list.length) { say.innerHTML = 'No encuentro una coincidencia clara. Prueba con «desayuno», «freír» o «ensalada», o <a href="#" data-kita-q="' + esc(q) + '" data-open-kita><b>pregúntale a Kita</b></a>.'; return; }
  say.innerHTML = `Te recomiendo: ${list.map(p => `<b>${p.short}</b>`).join(', ')}`;
  [...list].reverse().forEach(p => { const c = $(`.pc[data-id="${p.id}"]`); c.classList.add('match'); pgrid.prepend(c); });
});

/* ============================================================
   Fichas: producto y receta
   ============================================================ */
const pm = document.createElement('div'); pm.className = 'pdet'; pm.setAttribute('role', 'region'); pm.setAttribute('aria-label', 'Ficha de producto');
pm.innerHTML = '<button class="pm__x" data-pm-close aria-label="Cerrar">×</button><div class="pm__img" id="pmImg"></div><div class="pm__info" id="pmInfo"></div><button class="pm__nav pm__nav--l" data-pm="-1" aria-label="Anterior">←</button><button class="pm__nav pm__nav--r" data-pm="1" aria-label="Siguiente">→</button>';
let pmId = null, pmQty = 1, pmN = 4;
function closeModals() { pm.remove(); pmId = null; $$('.pc.is-open', pgrid).forEach(c => c.classList.remove('is-open')); }
function placePM() {
  const c = $(`.pc[data-id="${pmId}"]`, pgrid); if (!c) return;
  pm.remove(); const row = $$('.pc', pgrid).filter(x => !x.classList.contains('hide') && x.offsetTop === c.offsetTop);
  row[row.length - 1].insertAdjacentElement('afterend', pm);
  $$('.pc.is-open', pgrid).forEach(x => x.classList.toggle('is-open', x === c)); c.classList.add('is-open');
}
addEventListener('resize', () => { if (pmId) placePM(); });
function pmCalc(p) {
  if (mode === 'mayorista') {
    const r = cRacion(p), kgs = 100 * PORCION / 1000, packs = Math.ceil(kgs * 1000 / p.g);
    return `<div class="pm__box2"><h4>Para tu negocio</h4><p>Una ración de ${PORCION} g sale a <b>${eur(r)}</b>. Para 100 raciones necesitas ${num(kgs)} kg: ${packs} ${packs === 1 ? 'envase' : 'envases'} de ${p.g} g, unos <b>${eur(packs * now(p))}</b> a tarifa pública.</p><button class="link-u" data-pm-wh>Añadir a mi presupuesto mayorista</button></div>`;
  }
  const need = pmN * PORCION, packs = Math.max(1, Math.ceil(need / p.g));
  return `<div class="pm__box2"><h4>¿Para cuántos?</h4><div class="pm__calc"><div class="qty"><button data-n="-1" aria-label="Menos personas">−</button><output id="pmN">${pmN}</output><button data-n="1" aria-label="Más personas">+</button></div><p><b>${pmN} personas</b>: unos ${need} g, es decir <b>${packs} ${packs === 1 ? 'envase' : 'envases'}</b> de ${p.g} g (${eur(packs * now(p))}).</p></div></div>`;
}
function openPM(id) {
  if (page !== 'quesos') return go('quesos', { product: id });
  if (view === 'kilo') setView('fotos');
  const card = $(`.pc[data-id="${id}"]`, pgrid); if (!card) return;
  if (card.classList.contains('hide')) { filter = 'all'; $$('#filters button').forEach(x => x.classList.toggle('is-on', x.dataset.f === 'all')); cards.forEach(c => c.classList.remove('hide')); }
  pmId = id; pmQty = 1; const p = byId(id), mix = byId(p.mix), rk = RANK.indexOf(p.id) + 1, recs = recipesFor(id);
  pm.querySelector('#pmImg').className = 'pm__img' + (p.sq ? ' sq' : '');
  pm.querySelector('#pmImg').innerHTML = `<img src="assets/${p.img}" alt="${esc(p.name)}">`;
  pm.querySelector('#pmInfo').innerHTML = `<span class="tag">${p.g} g${mode === 'mayorista' ? '' : ' · ' + flagOfName(p.pais) + p.pais}</span><h2>${p.short}</h2>
    <div class="pm__price"><b>${eur(now(p))}</b>${p.sale ? `<s>${eur(p.price)}</s><span class="off">−${off(p)}%</span>` : ''}<small>${kg(p)} · puesto ${rk} de ${P.length} en precio por kilo · ración de ${PORCION} g: ${eur(cRacion(p))}</small></div>
    <p class="pm__idea">${p.idea}</p>
    ${perfilHTML(p)}
    ${recs.length ? `<div class="pm__rec"><span>Recetas con este queso (${recs.length})</span>${recs.slice(0, 8).map(r => `<button data-pm-rec="${r.id}">${esc(r.name)}</button>`).join('')}</div>` : ''}
    <p class="pm__mar"><b>Combina con:</b> ${p.maridaje}</p>
    ${pmCalc(p)}
    ${p.label ? `<p class="pm__label">${esc(p.label)}</p>` : ''}
    <div class="pm__buy"><div class="qty"><button data-q="-1" aria-label="Menos">−</button><output id="pmQty">1</output><button data-q="1" aria-label="Más">+</button></div><button class="btn btn--navy" data-pm-add><span>Añadir al ${mode === 'mayorista' ? 'presupuesto' : 'pedido'}</span></button></div>
    <div class="pm__links"><button data-pm-ai><span class="cow-ico cow-ico--navy"></span>Pregúntale a Kita</button><button data-pm-mix="${mix.id}">Combínalo con ${mix.short}</button><button data-pm-country="${(COUNTRIES.find(c => c.n === p.pais) || {}).id || ''}">Recetas de ${p.pais}</button></div>`;
  placePM(); APP.ctx = id; if (APP.onProduct) APP.onProduct(id);
  setTimeout(() => pm.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' }), 60);
}
function refreshPmCalc() { const p = byId(pmId); const el = $('.pm__box2', pm.querySelector('#pmInfo')); if (el) el.outerHTML = pmCalc(p); }
document.addEventListener('click', e => {
  if (!e.target.closest('.pdet')) return;
  if (e.target.closest('[data-pm-close]')) return closeModals();
  {
    const n = e.target.closest('[data-pm]'), q = e.target.closest('[data-q]'), pn = e.target.closest('[data-n]');
    if (n) openPM(P[(P.indexOf(byId(pmId)) + +n.dataset.pm + P.length) % P.length].id);
    if (q) { pmQty = clamp(pmQty + +q.dataset.q, 1, 99); pm.querySelector('#pmQty').textContent = pmQty; }
    if (pn) { pmN = clamp(pmN + +pn.dataset.n, 1, 60); refreshPmCalc(); }
    if (e.target.closest('[data-pm-add]')) addToCart(pmId, pmQty);
    if (e.target.closest('[data-pm-ai]')) { closeModals(); APP.kita && APP.kita(`Cuéntame sobre el ${byId(pmId).short}`); }
    const m = e.target.closest('[data-pm-mix]'); if (m) openPM(m.dataset.pmMix);
    const rc = e.target.closest('[data-pm-rec]'); if (rc) { closeModals(); go('recetas', { recipe: rc.dataset.pmRec }); }
    if (e.target.closest('[data-pm-wh]')) { closeModals(); setMode('mayorista', { view: false }); whAdd(pmId); toast('Añadido: indica las raciones en tu presupuesto'); go('mayoristas'); }
    const pc = e.target.closest('[data-pm-country]'); if (pc && pc.dataset.pmCountry) { closeModals(); go('recetas', { country: pc.dataset.pmCountry }); }
  }
});
addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModals(); $$('.drawer.open').forEach(closeDrawer); }
  if (pmId && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) openPM(P[(P.indexOf(byId(pmId)) + (e.key === 'ArrowRight' ? 1 : -1) + P.length) % P.length].id);
});
Object.assign(APP, { openPM });

/* ============================================================
   Recetas: país → desayuno / comida / cena → agrupadas por queso, con la receta abierta en la misma página
   ============================================================ */
const TIPO_L = { desayuno: 'Desayuno', aperitivo: 'Aperitivo', comida: 'Comida', merienda: 'Merienda' };
const MEALS = { desayuno: 'Desayuno', comida: 'Comida', cena: 'Cena' };
const mealOK = (r, m) => m === 'cena' ? (r.tipos.includes('aperitivo') || r.tipos.includes('merienda')) : r.tipos.includes(m);
let ctyId = store.get('venelac4-country') || 'venezuela', meal = 'comida', openR = null, rN = 4;
if (!countryOf(ctyId)) ctyId = 'venezuela';
const ctyChips = $('#ctyChips'), rGroups = $('#rGroups'), rHead = $('#rHead');
const chipsFor = (g, l) => `<div class="cty__grp"><span>${l}</span>${COUNTRIES.filter(c => c.grupo === g).map(c => `<button role="tab" data-c="${c.id}">${flag(c.id)}${c.n}</button>`).join('')}</div>`;
ctyChips.innerHTML = chipsFor('latam', 'Latinoamérica') + chipsFor('europa', 'España y Europa');
const countryOfRecipeId = rid => COUNTRIES.find(c => c.recetas.includes(rid));
function recDetail(r, n) {
  const c = recipeCheese(r, n);
  return `<div class="rd__cols"><div>
      <div class="rm__n"><span>Personas</span><div class="qty"><button data-rn="-1" aria-label="Menos">−</button><output>${n}</output><button data-rn="1" aria-label="Más">+</button></div><small>Queso por ración: <b>${eur(c.exact / n)}</b></small></div>
      <h4>Quesos Venelac para ${n} personas</h4>
      <ul class="rm__ch">${c.lines.map(l => `<li><img src="assets/${l.p.img}" alt=""><span><b>${l.p.short}</b> ${l.need} g<small>${l.packs} ${l.packs === 1 ? 'envase' : 'envases'} de ${l.p.g} g · ${eur(l.cost)}</small></span></li>`).join('')}</ul>
      <h4>También necesitas</h4>
      <ul class="rm__ot">${r.otros.map(([q, u, t]) => `<li>${q == null ? '' : `<b>${scaleQty(q, n)}${u ? ' ' + u : ''}</b> `}${esc(t)}</li>`).join('')}</ul>
    </div><div>
      <h4>Cómo se hace</h4>
      <ol class="rm__st">${r.pasos.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <p class="rm__tip"><b>Truco:</b> ${esc(r.tip)}</p>
      <p class="pm__label">Receta orientativa de la casa; ajusta cantidades y tiempos a tu gusto.</p>
      <div class="pm__buy"><button class="btn btn--navy" data-rm-add><span>Añadir ${c.lines.map(l => `${l.packs} × ${l.p.short.replace('Queso ', '')}`).join(' + ')} · ${eur(c.cost)}</span></button><button class="btn btn--line-d" data-rm-kita><span class="cow-ico cow-ico--navy"></span><span>Cocinar con Kita</span></button></div>
    </div></div>`;
}
function recRow(r) {
  const open = openR === r.id, extra = r.cheeses.length > 1 ? ' · con ' + r.cheeses.slice(1).map(([id]) => byId(id).short.replace('Queso ', '')).join(' y ') : '';
  return `<div class="rr ${open ? 'is-open' : ''}" data-rr="${r.id}"><button class="rr__h" aria-expanded="${open}"><span><b>${esc(r.name)}</b><small>${r.min} min · ${r.nivel}${extra}</small></span><i aria-hidden="true"></i></button>${open ? `<div class="rr__b">${recDetail(r, rN)}</div>` : ''}</div>`;
}
function groupHTML(id, rs) {
  const p = anyProd(id), c = rs.length;
  return `<section class="rg"><div class="rg__c"><div class="rg__img ${p.sq ? 'sq' : ''}"><img src="assets/${p.img}" alt="${esc(p.name)}" draggable="false"></div><div><h3>${esc(p.short)}</h3><small>${p.perfil.tags.join(' · ')}</small><small>${c} ${c === 1 ? 'receta' : 'recetas'}${p.consulta ? ' · consultar formato' : ` · ${p.g} g · ${eur(now(p))}`}</small>${p.consulta ? '' : `<button class="rg__add" data-cq-add="${p.id}">+ Añadir queso</button>`}</div></div><div class="rg__l">${rs.map(recRow).join('')}</div></section>`;
}
function renderCountry(id, keepOpen) {
  const c = countryOf(id) || COUNTRIES[0]; ctyId = c.id; store.set('venelac4-country', c.id);
  $$('button', ctyChips).forEach(b => { const on = b.dataset.c === c.id; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
  $$('#rMeal [data-m]').forEach(b => { const n = c.recetas.map(rById).filter(r => mealOK(r, b.dataset.m)).length; b.classList.toggle('is-on', b.dataset.m === meal); b.dataset.n = n; b.classList.toggle('is-empty', !n); });
  if (!keepOpen) openR = null;
  rHead.innerHTML = `<div class="cty__flag">${flag(c.id, 'flag--xl')}</div><div class="cty__txt"><h2>${c.n}</h2><p class="cty__plato">${esc(c.plato)}</p><p>${esc(c.texto)}</p></div><button class="btn btn--navy btn--sm" data-open-kita data-kita-q="Háblame de los quesos y las recetas de ${c.n}"><span class="cow-ico"></span><span>Pregúntale a Kita</span></button>`;
  const rs = c.recetas.map(rById).filter(r => mealOK(r, meal)), groups = new Map();
  rs.forEach(r => { const k = r.cheeses[0][0]; (groups.get(k) || groups.set(k, []).get(k)).push(r); });
  if (openR && !rs.some(r => r.id === openR)) { const r = rById(openR); if (r) { const k = r.cheeses[0][0]; (groups.get(k) || groups.set(k, []).get(k)).unshift(r); } }
  rGroups.innerHTML = groups.size ? [...groups].map(([k, l]) => groupHTML(k, l)).join('') : `<p class="rg__empty">${c.n} no tiene ${MEALS[meal].toLowerCase()} típico en mi lista. Prueba con ${Object.keys(MEALS).filter(m => m !== meal && c.recetas.map(rById).some(r => mealOK(r, m))).map(m => MEALS[m].toLowerCase()).join(' o ')}.</p>`;
  $('#rNote').textContent = 'Recetas y usos por país: sugerencias de la casa con los quesos Venelac, no recetas oficiales.' + (c.grupo === 'europa' ? ' Las europeas son adaptaciones de uso.' : '') + ' La cena reúne aperitivos y platos ligeros.';
  rGroups.classList.remove('swap'); void rGroups.offsetWidth; rGroups.classList.add('swap');
}
function openRecipe(id) {
  const r = rById(id); if (!r) return;
  if (page !== 'recetas') return go('recetas', { recipe: id });
  const home = countryOf(ctyId).recetas.includes(id) ? countryOf(ctyId) : (countryOfRecipeId(id) || countryOf(ctyId));
  ctyId = home.id;
  if (!mealOK(r, meal)) meal = ['comida', 'desayuno', 'cena'].find(m => mealOK(r, m));
  const same = openR === id; openR = same ? null : id; rN = 4;
  renderCountry(ctyId, true);
  if (openR) { const el = $(`[data-rr="${id}"]`); if (el) setTimeout(() => el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' }), 60); if (APP.onRecipe) APP.onRecipe(id); }
}
function showCountry(id) { if (!countryOf(id)) return; const c = countryOf(id); if (!c.recetas.map(rById).some(r => mealOK(r, meal))) meal = Object.keys(MEALS).find(m => c.recetas.map(rById).some(r => mealOK(r, m))) || meal; renderCountry(id); }
ctyChips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showCountry(b.dataset.c); });
$('#rMeal').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; meal = b.dataset.m; renderCountry(ctyId); });
rGroups.addEventListener('click', e => {
  const n = e.target.closest('[data-rn]'), ad = e.target.closest('[data-cq-add]');
  if (ad) return addToCart(ad.dataset.cqAdd);
  const row = e.target.closest('[data-rr]'); if (!row) return;
  const id = row.dataset.rr;
  if (n) { rN = clamp(rN + +n.dataset.rn, 1, 100); const b = row.querySelector('.rr__b'); if (b) b.innerHTML = recDetail(rById(id), rN); return; }
  if (e.target.closest('[data-rm-add]')) { addRecipe(id, rN); openDrawer($('#cart')); return; }
  if (e.target.closest('[data-rm-kita]')) { APP.kita && APP.kita(`Cocina conmigo: ${rById(id).name}`); return; }
  if (e.target.closest('.rr__h')) openRecipe(id);
});
$('#whereGrid').innerHTML = COUNTRIES.map((c, i) => `<button class="wf" data-wc="${c.id}" style="--i:${i}" title="${c.n}: ${esc(c.plato)}">${flag(c.id, 'flag--l')}<b>${c.n}</b></button>`).join('');
$('#whereGrid').addEventListener('click', e => { const b = e.target.closest('[data-wc]'); if (b) go('recetas', { country: b.dataset.wc }); });
Object.assign(APP, { openRecipe, showCountry, addRecipe, countryId: () => ctyId });

/* ============================================================
   Sobre nosotros: pestañas
   ============================================================ */
const TABS = ['somos', 'receta', 'mision', 'vision', 'calidad', 'familia'];
const nimgs = $$('#nImg img');
function setTab(t) {
  const i = TABS.indexOf(t); if (i < 0) return;
  $$('#nTabs button').forEach(b => b.classList.toggle('is-on', b.dataset.t === t));
  $$('.pane').forEach(p => p.classList.toggle('is-on', p.dataset.p === t));
  nimgs.forEach((im, k) => im.classList.toggle('on', k === i));
}
$('#nTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setTab(b.dataset.t); });
function runCounters() {
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count; if (REDUCED) { el.textContent = to.toLocaleString('de-DE'); return; }
    const t0 = performance.now() + 500;
    (function tick(t) { const k = clamp((t - t0) / 2000, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))).toLocaleString('de-DE'); if (k < 1 && page === 'nosotros') requestAnimationFrame(tick); })(performance.now());
  });
}

/* ============================================================
   Mayoristas: el cliente elige los quesos y las raciones
   ============================================================ */
const pickEl = $('#pick'), linesEl = $('#lines'), quoteEl = $('#quote');
const ALLP = [...P, ...FAMILY];
$('#mTipo').innerHTML = TIPOS.map(t => `<option>${t}</option>`).join('');
function custData() { return { ref: wh.ref, empresa: $('#mEmp').value.trim(), tipo: $('#mTipo').value, nombre: $('#mNom').value.trim(), email: $('#mEm').value.trim(), tel: $('#mTel').value.trim(), ciudad: $('#mCiu').value.trim(), fecha: $('#mFec').value, obs: $('#mObs').value.trim(), freq: wh.freq }; }
const CF = { mEmp: 'empresa', mTipo: 'tipo', mNom: 'nombre', mEm: 'email', mTel: 'tel', mCiu: 'ciudad', mFec: 'fecha', mObs: 'obs' };
Object.entries(CF).forEach(([id, k]) => { if (wh.c && wh.c[k] != null) $('#' + id).value = wh.c[k]; });
function pickHTML() {
  return ALLP.map(p => { const on = wh.lines.some(l => l.id === p.id); return `<button type="button" class="pk ${on ? 'is-on' : ''} ${p.consulta ? 'pk--c' : ''}" data-pk="${p.id}" aria-pressed="${on}"><img src="assets/${p.img}" alt="" draggable="false"><span><b>${esc(p.short)}</b><small>${p.consulta ? 'Consultar formato y precio' : `${p.g} g · ${num(ppk(p))} €/kg`}</small><small class="pk__tg">${p.perfil.tags.join(' · ')}</small></span><em class="pk__tick" aria-hidden="true">✓</em></button>`; }).join('');
}
function lineHTML(l) {
  const p = anyProd(l.id), r = whLine(l);
  return `<div class="ln" data-id="${p.id}"><div class="ln__p"><img src="assets/${p.img}" alt=""><span><b>${esc(p.short)}</b><small>${p.consulta ? 'Formato por confirmar' : p.g + ' g por envase'}</small><small class="ln__tg">${p.perfil.tags.join(' · ')} · ${['rallado', 'fundido', 'frio', 'caliente'].filter(k => p.perfil.servir[k] === 2).map(k => SERVIR_L[k].toLowerCase()).join(', ') || 'versátil'}</small></span></div>
    <div class="ln__q"><label>Cantidad</label><div class="ln__qq"><input type="number" min="0" step="1" inputmode="numeric" value="${l.qty}" data-f="qty" aria-label="Cantidad de ${esc(p.short)}"><select data-f="unit" aria-label="Unidad"><option value="raciones" ${l.unit === 'raciones' ? 'selected' : ''}>raciones</option><option value="kg" ${l.unit === 'kg' ? 'selected' : ''}>kilos</option>${p.g ? `<option value="envases" ${l.unit === 'envases' ? 'selected' : ''}>envases</option>` : ''}</select></div></div>
    <div class="ln__g"><label>Gramos por ración</label><div class="ln__gg"><input type="number" min="10" max="500" step="5" inputmode="numeric" value="${l.gpr}" data-f="gpr" aria-label="Gramos por ración"><div class="gchips">${[30, 50, 60, 80, 100, 125].map(g => `<button type="button" data-g="${g}" class="${l.gpr === g ? 'is-on' : ''}">${g}</button>`).join('')}</div></div></div>
    <div class="ln__res" data-res></div><button type="button" class="ln__x" data-rm="${p.id}" aria-label="Quitar ${esc(p.short)}">×</button></div>`;
}
function resHTML(r) {
  return `<div><b>${num(r.raciones)}</b><span>raciones</span></div><div><b>${fmt1(r.kgServed)} kg</b><span>kilos</span></div>${r.pack ? `<div><b>${r.packs}</b><span>envases de ${r.pack} g</span></div><div><b>${fmt1(r.porcPorEnvase)}</b><span>porciones por envase</span></div>` : '<div class="ln__nf"><span>Formato y precio: ventas lo confirma</span></div>'}<div class="ln__c"><b>${r.cost != null ? eur(r.cost) : 'consultar'}</b><span>${r.perRacion != null ? eur(r.perRacion) + ' / ración' : 'tarifa pública'}</span></div>`;
}
function renderLines() {
  linesEl.innerHTML = wh.lines.length ? wh.lines.map(lineHTML).join('') : '<div class="lines__empty"><b>Aún no has elegido ningún queso</b><span>Pulsa los quesos de arriba para añadirlos a tu presupuesto.</span></div>';
  updateResults();
}
function updateResults() {
  const T = whTotals(wh.lines), per = FREQ[wh.freq][0];
  T.L.forEach(r => { const row = linesEl.querySelector(`.ln[data-id="${r.p.id}"] [data-res]`); if (row) row.innerHTML = resHTML(r); });
  const ok = wh.lines.length > 0, c = custData(), ready = ok && c.empresa && c.nombre && /\S+@\S+\.\S+/.test(c.email);
  quoteEl.innerHTML = `<div class="quote__h"><h3>Tu presupuesto</h3><small>Ref. ${wh.ref}</small></div>
    <div class="pills quote__f" id="freq">${Object.keys(FREQ).map(f => `<button type="button" data-fq="${f}" class="${wh.freq === f ? 'is-on' : ''}">${f[0].toUpperCase() + f.slice(1)}</button>`).join('')}</div>
    <p class="quote__per">Las cantidades son <b>por ${per}</b>.</p>
    <div class="quote__big"><div><b>${fmt1(T.kg)} kg</b><span>de queso</span></div><div><b>${T.packs}</b><span>envases</span></div><div><b>${num(T.raciones)}</b><span>raciones</span></div><div><b>${eur(T.cost)}</b><span>tarifa pública${T.pending ? ' + ' + T.pending + ' a consultar' : ''}</span></div></div>
    <p class="quote__st ${ready ? 'ok' : ''}">${!ok ? 'Elige tus quesos para empezar.' : ready ? 'Listo: copia el presupuesto y envíalo a ventas.' : 'Completa empresa, contacto y email para enviarlo.'}</p>`;
  const steps = $$('#steps3 li'), s = !ok ? 0 : ready ? 2 : 1;
  steps.forEach((li, i) => { li.classList.toggle('is-on', i === s); li.classList.toggle('done', i < s); });
  $('#mPrev').textContent = ok ? whText(wh.lines, c) : 'Aún no hay líneas en el presupuesto.';
}
function renderMW() { pickEl.innerHTML = pickHTML(); renderLines(); }
pickEl.addEventListener('click', e => {
  const b = e.target.closest('[data-pk]'); if (!b) return;
  const id = b.dataset.pk; if (wh.lines.some(l => l.id === id)) wh.lines = wh.lines.filter(l => l.id !== id); else wh.lines.push({ id, qty: 1, unit: anyProd(id).g ? 'envases' : 'kg', gpr: PORCION });
  saveWh();
});
linesEl.addEventListener('input', e => {
  const f = e.target.dataset.f, row = e.target.closest('.ln'); if (!f || !row) return; const l = wh.lines.find(x => x.id === row.dataset.id);
  l[f] = f === 'unit' ? e.target.value : Math.max(0, +e.target.value || 0);
  if (f === 'gpr') $$('.gchips button', row).forEach(g => g.classList.toggle('is-on', +g.dataset.g === l.gpr));
  store.set('venelac4-wh', JSON.stringify(wh)); renderCart(); updateResults();
});
linesEl.addEventListener('click', e => {
  const g = e.target.closest('[data-g]'), x = e.target.closest('[data-rm]'), row = e.target.closest('.ln');
  if (g && row) { const l = wh.lines.find(y => y.id === row.dataset.id); l.gpr = +g.dataset.g; $('[data-f=gpr]', row).value = l.gpr; $$('.gchips button', row).forEach(b => b.classList.toggle('is-on', b === g)); store.set('venelac4-wh', JSON.stringify(wh)); renderCart(); updateResults(); }
  if (x) { wh.lines = wh.lines.filter(l => l.id !== x.dataset.rm); saveWh(); }
});
quoteEl.addEventListener('click', e => { const f = e.target.closest('[data-fq]'); if (f) { wh.freq = f.dataset.fq; store.set('venelac4-wh', JSON.stringify(wh)); updateResults(); } });
$('#mform').addEventListener('input', e => { const k = CF[e.target.id]; if (k) { wh.c = wh.c || {}; wh.c[k] = e.target.value; store.set('venelac4-wh', JSON.stringify(wh)); } updateResults(); });
$('#mform').addEventListener('submit', async e => {
  e.preventDefault(); const btn = $('button[type=submit]', e.target), note = $('#mNote'); btn.disabled = true; $('span', btn).textContent = 'Enviando…'; note.textContent = '';
  try { const r = await sendQuote(); note.textContent = `Simulación: en la web real, ${r.ref} llegaría directamente a ventas con copia a tu email. Aquí no se envía ningún correo.`; toast('Demo: presupuesto simulado'); wh.lines = []; saveWh(); }
  catch (ex) { note.textContent = ex.message; toast(ex.message); }
  finally { btn.disabled = false; $('span', btn).textContent = 'Enviar presupuesto a ventas'; }
});
Object.assign(APP, { wh: { add: whAdd, lines: () => wh.lines, totals: () => whTotals(wh.lines), remove: id => { wh.lines = wh.lines.filter(l => l.id !== id); saveWh(); }, clear: () => { wh.lines = []; saveWh(); }, text: () => whText(wh.lines, custData()), setFreq: f => { if (FREQ[f]) { wh.freq = f; saveWh(); } } } });

/* ============================================================
   Contacto
   ============================================================ */
$$('[data-copy]').forEach(b => b.addEventListener('click', () => copyText(b.dataset.copy, 'Copiado')));
$('#aiWrite').addEventListener('click', () => {
  const ids = Object.keys(cart), ta = $('#fm'), n = $('#fn').value.trim();
  if (mode === 'mayorista' && wh.lines.length) { const msg = whText(wh.lines, custData()); ta.value = ''; let k = 0; const iv = setInterval(() => { k += 8; ta.value = msg.slice(0, k); if (k >= msg.length) { clearInterval(iv); ta.value = msg; } }, REDUCED ? 0 : 8); return; }
  const msg = ids.length
    ? `Hola, me gustaría información para hacer este ${mode === 'mayorista' ? 'presupuesto' : 'pedido'}:\n${ids.map(id => `- ${cart[id]} × ${byId(id).name}`).join('\n')}\n\n¿Podéis confirmarme disponibilidad y condiciones de envío? Gracias.${n ? '\n\n' + n : ''}`
    : `Hola, me gustaría recibir información sobre vuestros quesos y cómo hacer un pedido. ¿Podéis ayudarme?\n\nGracias.${n ? '\n\n' + n : ''}`;
  ta.value = ''; let i = 0; const iv = setInterval(() => { i += 3; ta.value = msg.slice(0, i); if (i >= msg.length) { clearInterval(iv); ta.value = msg; } }, REDUCED ? 0 : 14);
});
$('#form').addEventListener('submit', async e => {
  e.preventDefault(); const f = new FormData(e.target), btn = $('button[type=submit]', e.target), note = $('#formNote'); btn.disabled = true; $('span', btn).textContent = 'Enviando…'; note.textContent = '';
  try { await api('contacto', { nombre: f.get('n'), email: f.get('e'), mensaje: f.get('m'), website: f.get('website') || '' }); note.textContent = 'Simulación: en la web real el mensaje llegaría directamente a ventas. Aquí no se envía ningún correo.'; toast('Demo: mensaje simulado'); e.target.reset(); }
  catch (ex) { note.textContent = ex.message; toast(ex.message); }
  finally { btn.disabled = false; $('span', btn).textContent = 'Enviar mensaje'; }
});

/* ============================================================
   Arranque
   ============================================================ */
setMode(mode, { view: false });
renderCart(); renderMW(); showCountry(ctyId);
if (mode === 'mayorista') setView('kilo');
const first = location.hash.slice(1);
show(PAGES.includes(first) ? first : 'inicio');
measure(); setTimeout(measure, 1200);
requestAnimationFrame(frame);
})();
