
<script>
(function () {
  /* Menú transparente mientras la portada está a la vista */
  var nav = document.querySelector("header.nav"), hero = document.getElementById("portada");
  if (nav && hero) {
    var over = function () { nav.classList.toggle("nav--over", window.scrollY < hero.offsetHeight - nav.offsetHeight - 10); };
    over(); addEventListener("scroll", over, { passive: true }); addEventListener("resize", over);
  }
  /* Pantalla de carga: logo, barra y persiana */
  var pre = document.getElementById("tw-pre"), root = document.documentElement;
  if (!pre || !root.classList.contains("pt-loading")) { if (hero) hero.classList.add("pt-noload"); return; }
  var dur = 2800;
  requestAnimationFrame(function () { pre.classList.add("run"); });
  setTimeout(function () {
    pre.classList.add("done"); root.classList.remove("pt-loading");
    setTimeout(function () { if (hero) hero.classList.add("pt-ready"); }, 300);
    setTimeout(function () { pre.parentNode && pre.parentNode.removeChild(pre); }, 1500);
  }, dur);
})();
</script>
