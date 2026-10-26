
<script>
(function () {
  /* Menú transparente mientras la portada está a la vista */
  var nav = document.querySelector("header.nav"), hero = document.getElementById("portada");
  if (nav && hero) {
    var over = function () { nav.classList.toggle("nav--over", window.scrollY < hero.offsetHeight - nav.offsetHeight - 10); };
    over(); addEventListener("scroll", over, { passive: true }); addEventListener("resize", over);
  }
  /* Vídeo de portada: que arranque siempre solo, también al volver desde el buscador */
  var v = document.getElementById("heroVideo");
  if (v) {
    var play = function () {
      v.muted = true; v.defaultMuted = true; v.setAttribute("muted", "");
      if (!v.paused) return;
      try { var p = v.play(); if (p && p.catch) p.catch(function () { arm(); }); } catch (e) { arm(); }
    };
    var armed = false, arm = function () {
      if (armed) return; armed = true;
      var once = function () { armed = false; ["touchstart", "pointerdown", "scroll", "keydown"].forEach(function (ev) { removeEventListener(ev, once, true); }); play(); };
      ["touchstart", "pointerdown", "scroll", "keydown"].forEach(function (ev) { addEventListener(ev, once, { capture: true, passive: true }); });
    };
    ["loadedmetadata", "loadeddata", "canplay"].forEach(function (ev) { v.addEventListener(ev, play); });
    /* móvil en vertical: versión vertical con las caras centradas; al girar el móvil se cambia sin perder el punto */
    var mq = matchMedia("(max-aspect-ratio: 1/1)"), swap = function () {
      var vert = mq.matches ? "1" : "0"; if (v.dataset.vertical === vert) return;
      var t = v.currentTime || 0; v.dataset.vertical = vert;
      v.poster = mq.matches ? "media/video-home-poster-vertical.jpg" : "media/video-home-poster.jpg";
      v.src = mq.matches ? "media/video-home-vertical.mp4" : "media/video-home.mp4";
      v.addEventListener("loadedmetadata", function () { try { v.currentTime = t; } catch (e) {} play(); }, { once: true });
    };
    if (mq.addEventListener) mq.addEventListener("change", swap); else if (mq.addListener) mq.addListener(swap);
    addEventListener("pageshow", play);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) play(); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) play(); }).observe(v);
    play();
  }
  /* Pantalla de carga: logo, barra y persiana */
  var pre = document.getElementById("tw-pre"), root = document.documentElement;
  if (!pre || !root.classList.contains("pt-loading")) { if (hero) hero.classList.add("pt-noload"); return; }
  var dur = 2800;
  requestAnimationFrame(function () { pre.classList.add("run"); });
  setTimeout(function () {
    pre.classList.add("done"); root.classList.remove("pt-loading");
    setTimeout(function () { if (hero) hero.classList.add("pt-ready"); if (v) v.play && v.paused && v.play().catch(function () {}); }, 300);
    setTimeout(function () { pre.parentNode && pre.parentNode.removeChild(pre); }, 1500);
  }, dur);
})();
</script>
