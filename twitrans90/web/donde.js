
<script>
(function () {
  /* Horarios y dónde estamos: estado del taller (hora de Madrid) y copiar dirección */
  var pill = document.getElementById("dnPill"), txt = document.getElementById("dnPillTxt");
  if (!pill) return;
  var B = [[8, 14], [15, 19]];
  function hh(x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ":" + (m < 10 ? "0" : "") + m; }
  var d = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  var dow = d.getDay(), h = d.getHours() + d.getMinutes() / 60, vac = d.getMonth() === 7 && d.getDate() >= 16, lab = dow >= 1 && dow <= 5;
  var abierto = false, msg = null;
  if (lab && !vac) {
    for (var i = 0; i < B.length; i++) {
      if (h >= B[i][0] && h < B[i][1]) { abierto = true; msg = "Abierto ahora · hasta las " + hh(B[i][1]); break; }
      if (h < B[i][0]) { msg = "Cerrado · abre hoy a las " + hh(B[i][0]); break; }
    }
  }
  if (!msg) { var n = dow, k = 0; do { n = (n + 1) % 7; k++; } while (n === 0 || n === 6); msg = "Cerrado · abre " + (k === 1 ? "mañana" : "el lunes") + " a las 8:00"; }
  txt.textContent = msg; pill.classList.toggle("closed", !abierto);
  if (lab) document.getElementById("dnWk").classList.add("today");
  var b = document.getElementById("dnCopy"), t = document.getElementById("dnCopyTxt");
  b.addEventListener("click", function () {
    var dir = "Avda. del Río Ripoll 73, 08291 Ripollet, Barcelona";
    function ok() { t.textContent = "Dirección copiada"; setTimeout(function () { t.textContent = "Copiar dirección"; }, 1800); }
    try { navigator.clipboard.writeText(dir).then(ok, function () { t.textContent = dir; }); } catch (e) { t.textContent = dir; }
  });
})();
</script>
