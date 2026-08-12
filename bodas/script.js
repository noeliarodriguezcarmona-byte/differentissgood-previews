/* =========================================================
   Differentissgood · Bodas — index.html
   Slideshow de portada · scroll reveal · portfolio · vídeo ·
   blog · opiniones · volver arriba · formulario a WhatsApp
   ========================================================= */

const WHATSAPP_POR_DEFECTO = '34620004434';
const CLAVE_AVISO = 'differentissgood-bodas:aviso-oculto';
const YOUTUBE_ID = 'QNSZ45aThLs';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------------------------------------------------------
   Entrada al hacer scroll: cada bloque sube al asomar
   --------------------------------------------------------- */

function animarEntradas() {
  const bloques = $$('.sube');

  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bloques.forEach((b) => b.classList.add('visible'));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const hermanos = [...entrada.target.parentElement.children].filter((n) => n.classList.contains('sube'));
      const retraso = Math.max(0, hermanos.indexOf(entrada.target)) * 90;
      setTimeout(() => entrada.target.classList.add('visible'), retraso);
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .12 });

  bloques.forEach((b) => observador.observe(b));
}

/* ---------------------------------------------------------
   Cabecera y menú
   --------------------------------------------------------- */

function cabecera() {
  const cab = $('#cabecera');
  if (!cab) return;
  const marcar = () => cab.dataset.fija = String(window.scrollY > 8);
  marcar();
  addEventListener('scroll', marcar, { passive: true });
}

function menuMovil() {
  const boton = $('.menu__abrir');
  const cerrar = $('#menu-movil-cerrar');
  const menu  = $('#menu-movil');
  if (!boton || !menu) return;

  const alternar = (abrir) => { boton.setAttribute('aria-expanded', String(abrir)); menu.hidden = !abrir; };

  boton.addEventListener('click', () => alternar(true));
  cerrar?.addEventListener('click', () => alternar(false));
  menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') alternar(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') alternar(false); });
}

function menuActivo() {
  const enlaces = $$('.menu a[href^="#"]');
  const secciones = enlaces.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if (!secciones.length || !('IntersectionObserver' in window)) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      enlaces.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${entrada.target.id}`)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  secciones.forEach((s) => observador.observe(s));
}

/* ---------------------------------------------------------
   Aviso de contenido provisional
   --------------------------------------------------------- */

function avisoProvisional() {
  const aviso = $('#pendiente');
  if (!aviso) return;
  if (localStorage.getItem(CLAVE_AVISO) === 'si') { aviso.remove(); return; }
  $('[data-cerrar-aviso]')?.addEventListener('click', () => {
    localStorage.setItem(CLAVE_AVISO, 'si');
    aviso.remove();
  });
}

function huecoSvg(nombreArchivo, carpeta = 'media/fotos/') {
  return `
    <div class="hueco" hidden>
      <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="11" width="36" height="26" rx="3"/><circle cx="18" cy="21" r="3.5"/><path d="m6 32 10-8 8 6 6-5 12 9"/></svg>
      <p>Foto pendiente</p>
      <small>Sube <code>${nombreArchivo}</code> a <code>bodas/${carpeta}</code></small>
    </div>`;
}

function protegerImagenes(raiz) {
  $$('img', raiz).forEach((img) => {
    const hueco = img.nextElementSibling;
    if (!hueco || !hueco.classList.contains('hueco')) return;
    hueco.hidden = true;
    img.addEventListener('error', () => { img.style.display = 'none'; hueco.hidden = false; });
  });
}

/* ---------------------------------------------------------
   Portada: slideshow automático de FOTOS_HERO
   --------------------------------------------------------- */

function heroSlideshow() {
  const contenedor = $('#hero-diapositivas');
  const puntos = $('#hero-puntos');
  if (!contenedor || typeof FOTOS_HERO === 'undefined') return;

  contenedor.innerHTML = FOTOS_HERO.map((archivo, i) => `
    <figure class="hero__diapositiva${i === 0 ? ' activa' : ''}" style="margin:0;">
      <img src="media/fotos/${archivo}" alt="Boda ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}">
      ${huecoSvg(archivo)}
    </figure>`).join('');
  protegerImagenes(contenedor);

  puntos.innerHTML = FOTOS_HERO.map((_, i) => `<button type="button" aria-current="${i === 0}" aria-label="Foto ${i + 1}"></button>`).join('');

  const diapositivas = $$('.hero__diapositiva', contenedor);
  const botones = $$('button', puntos);
  let actual = 0;
  let temporizador;

  function mostrar(i) {
    diapositivas[actual].classList.remove('activa');
    botones[actual].setAttribute('aria-current', 'false');
    actual = i;
    diapositivas[actual].classList.add('activa');
    botones[actual].setAttribute('aria-current', 'true');
  }

  function siguiente() { mostrar((actual + 1) % diapositivas.length); }

  function reiniciar() {
    clearInterval(temporizador);
    if (diapositivas.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      temporizador = setInterval(siguiente, 3000);
    }
  }

  botones.forEach((b, i) => b.addEventListener('click', () => { mostrar(i); reiniciar(); }));
  reiniciar();
}

/* ---------------------------------------------------------
   Portfolio: selección destacada en la portada (bento)
   --------------------------------------------------------- */

function pintarPortfolioDestacado() {
  const cont = $('#portfolio-destacado');
  if (!cont || typeof PORTFOLIO_DESTACADO === 'undefined') return;

  const piezas = PORTFOLIO_DESTACADO.map((archivo) => `
    <figure class="portfolio__pieza sube">
      <img src="media/fotos/${archivo}" alt="Foto de boda" loading="lazy">
      ${huecoSvg(archivo)}
    </figure>`).join('');

  const cta = `
    <a class="portfolio__cta sube" href="portfolio.html">
      <img src="media/fotos/${PORTFOLIO_DESTACADO[PORTFOLIO_DESTACADO.length - 1]}" alt="" loading="lazy">
      <span class="portfolio__cta__texto">
        <p>Todas las bodas</p>
        <span>Ver portfolio completo →</span>
      </span>
    </a>`;

  cont.innerHTML = piezas + cta;
  protegerImagenes(cont);
}

/* ---------------------------------------------------------
   Presupuesto: servicios seleccionables + envío por WhatsApp
   --------------------------------------------------------- */

function pintarServicios() {
  const fila = $('#servicios-fila');
  if (!fila || typeof SERVICIOS === 'undefined') return;

  fila.innerHTML = SERVICIOS.map(({ id, nombre, detalles }) => `
    <label class="servicio-carta sube">
      <input type="checkbox" name="servicio" value="${nombre}" id="servicio-${id}">
      <span>
        <h3>${nombre}</h3>
        <ul>${detalles.map((d) => `<li>${d}</li>`).join('')}</ul>
      </span>
    </label>`).join('');
}

function formularioPresupuesto() {
  const form = $('#formulario-presupuesto');
  const aviso = $('#aviso-presupuesto');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const elegidos = $$('input[name="servicio"]:checked', form).map((el) => el.value);

    if (!elegidos.length) {
      aviso.textContent = 'Marca al menos un servicio para pedir presupuesto';
      aviso.dataset.estado = 'error';
      return;
    }

    const mensaje = [
      '¡Hola Differentissgood! Nos gustaría pedir presupuesto para nuestra boda 💍',
      '',
      'Nos interesa:',
      ...elegidos.map((s) => `• ${s}`),
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_POR_DEFECTO}?text=${encodeURIComponent(mensaje)}`;
    const ventana = window.open(url, '_blank', 'noopener');
    if (!ventana || ventana.closed) { location.href = url; return; }

    aviso.textContent = 'Se ha abierto WhatsApp con vuestra selección. Pulsa enviar para que nos llegue.';
    aviso.dataset.estado = 'ok';
  });
}

/* ---------------------------------------------------------
   Otros servicios: tarjetas que rotan sus fotos cada 2 s
   --------------------------------------------------------- */

function otrosServicios() {
  const fila = $('#otros-servicios-fila');
  if (!fila || typeof OTROS_SERVICIOS === 'undefined') return;

  fila.innerHTML = OTROS_SERVICIOS.map(({ id, nombre, fotos }) => `
    <div class="servicio-visual sube" data-servicio="${id}">
      ${fotos.length
        ? fotos.map((archivo, i) => `<img src="media/fotos/${archivo}" alt="${nombre}" loading="lazy" class="${i === 0 ? 'activa' : ''}">`).join('')
        : `<div class="hueco"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="11" width="36" height="26" rx="3"/><circle cx="18" cy="21" r="3.5"/><path d="m6 32 10-8 8 6 6-5 12 9"/></svg><p>Próximamente</p><small>Añade fotos en <code>OTROS_SERVICIOS</code></small></div>`}
      <span class="servicio-visual__etiqueta">${nombre}</span>
    </div>`).join('');

  $$('.servicio-visual', fila).forEach((tarjeta) => {
    const imgs = $$('img', tarjeta);
    if (imgs.length < 2) return;
    let actual = 0;
    setInterval(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      imgs[actual].classList.remove('activa');
      actual = (actual + 1) % imgs.length;
      imgs[actual].classList.add('activa');
    }, 2000);
  });
}

/* ---------------------------------------------------------
   Vídeo: incrusta el vídeo de YouTube
   --------------------------------------------------------- */

function pintarVideo() {
  const marco = $('#video-marco');
  if (!marco) return;
  marco.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}" title="Highlight de boda"
    loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>`;
}

/* ---------------------------------------------------------
   Blog: últimas 3 entradas en portada
   --------------------------------------------------------- */

function pintarBlog() {
  const fila = $('#blog-fila');
  if (!fila || typeof POSTS === 'undefined') return;

  const ultimas = [...POSTS].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 3);
  fila.innerHTML = ultimas.map(({ slug, titulo, fecha, resumen, foto }) => `
    <a class="tarjeta-post sube" href="blog/post.html?post=${slug}">
      <figure class="tarjeta-post__foto">
        <img src="${foto}" alt="${titulo}" loading="lazy">
      </figure>
      <p class="tarjeta-post__fecha">${new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <h3>${titulo}</h3>
      <p class="tarjeta-post__resumen">${resumen}</p>
    </a>`).join('');
}

/* ---------------------------------------------------------
   Opiniones: carrusel que muestra una detrás de otra
   --------------------------------------------------------- */

function opinionesCarrusel() {
  const carrusel = $('#opiniones-carrusel');
  const puntosCont = $('#opiniones-puntos');
  if (!carrusel || !puntosCont) return;

  const slides = $$('.opinion-slide', carrusel);
  puntosCont.innerHTML = slides.map((_, i) => `<button type="button" aria-current="${i === 0}" aria-label="Opinión ${i + 1}"></button>`).join('');
  const puntos = $$('button', puntosCont);
  let actual = 0;
  let temporizador;

  function mostrar(i) {
    slides[actual].classList.remove('activa');
    puntos[actual].setAttribute('aria-current', 'false');
    actual = i;
    slides[actual].classList.add('activa');
    puntos[actual].setAttribute('aria-current', 'true');
  }

  function reiniciar() {
    clearInterval(temporizador);
    if (slides.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      temporizador = setInterval(() => mostrar((actual + 1) % slides.length), 5000);
    }
  }

  puntos.forEach((b, i) => b.addEventListener('click', () => { mostrar(i); reiniciar(); }));
  reiniciar();
}

/* ---------------------------------------------------------
   Botón volver arriba
   --------------------------------------------------------- */

function volverArriba() {
  const boton = $('#volver-arriba');
  if (!boton) return;
  addEventListener('scroll', () => boton.classList.toggle('visible', window.scrollY > 600), { passive: true });
  boton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
}

/* ---------------------------------------------------------
   Formulario de contacto a WhatsApp
   --------------------------------------------------------- */

function formularioWhatsApp() {
  const form  = $('#formulario');
  const aviso = $('#aviso');
  if (!form) return;

  const campos = [
    { el: $('#f-nombre'),   texto: 'Escribe vuestros nombres para poder contestaros' },
    { el: $('#f-telefono'), texto: 'Necesitamos un teléfono de contacto' },
    { el: $('#f-mensaje'),  texto: 'Contadnos brevemente qué necesitáis' },
  ];
  const consiento = $('#f-consiento');

  const decir = (texto, estado) => { aviso.textContent = texto; aviso.dataset.estado = estado; };

  const mensaje = () => [
    '¡Hola Differentissgood! Nos gustaría pedir presupuesto para nuestra boda 💍',
    '',
    `• Nombres: ${$('#f-nombre').value.trim()}`,
    `• Teléfono: ${$('#f-telefono').value.trim()}`,
    `• Fecha de la boda: ${$('#f-fecha').value || 'por confirmar'}`,
    `• Nos interesa: ${$('#f-servicio').value}`,
    '',
    $('#f-mensaje').value.trim(),
  ].join('\n');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const falta = campos.find(({ el }) => !el.value.trim());
    if (falta) {
      falta.el.setAttribute('aria-invalid', 'true');
      falta.el.focus();
      decir(falta.texto, 'error');
      return;
    }

    if (consiento && !consiento.checked) {
      consiento.parentElement.dataset.invalido = 'true';
      consiento.focus();
      decir('Acepta la política de privacidad para poder enviarlo', 'error');
      return;
    }

    const url = `https://wa.me/${WHATSAPP_POR_DEFECTO}?text=${encodeURIComponent(mensaje())}`;
    const ventana = window.open(url, '_blank', 'noopener');
    if (!ventana || ventana.closed) { location.href = url; return; }

    decir('Se ha abierto WhatsApp con vuestro mensaje. Pulsa enviar para que nos llegue.', 'ok');
  });

  campos.forEach(({ el }) => el.addEventListener('input', () => {
    el.removeAttribute('aria-invalid');
    if (aviso.dataset.estado === 'error') decir('', 'ok');
  }));

  consiento?.addEventListener('change', () => {
    delete consiento.parentElement.dataset.invalido;
    if (aviso.dataset.estado === 'error') decir('', 'ok');
  });
}

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */

heroSlideshow();
pintarPortfolioDestacado();
pintarServicios();
pintarVideo();
otrosServicios();
pintarBlog();
opinionesCarrusel();
avisoProvisional();
cabecera();
menuMovil();
menuActivo();
volverArriba();
formularioWhatsApp();
formularioPresupuesto();
animarEntradas();
