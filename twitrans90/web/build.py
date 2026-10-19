import re, os, json
here=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(here,'..','simulacion.html'),encoding='utf-8').read()
def cut(pat,new='',flags=re.S,count=1):
    global s
    assert re.search(pat,s,flags), pat[:60]
    s=re.sub(pat,new,s,count=count,flags=flags)
# 1. título propio de la web (el <title> del artefacto) y cabecera HTML completa
s=re.sub(r'^<title>.*?</title>\n','',s,count=1)
# 2. fuera la barra de simulación y las etiquetas provisionales
cut(r'<div class="simbar">.*?</div>\n')
cut(r'\s*<span class="tag br">Foto de empresa · pendiente</span>')
cut(r'\s*<span class="tag tl">Plano 01 · Furgoneta de taller</span>')
cut(r'\s*<span class="mono">Foto pendiente</span>',count=3)
cut(r'\s*<p class="ba-note mono">Ilustración provisional.*?</p>')
# 3. bloque de foto de "Quiénes somos": logotipo en lugar del texto de pendiente
logo=re.search(r'<img src="(data:image/png;base64,[A-Za-z0-9+/=]+)" alt="Twitrans 90 S.L."',s).group(1)
cut(r'<div class="cap"><b>Foto del taller</b>.*?</div>','<div class="cap"><img src="%s" alt="Twitrans 90 S.L." style="width:min(300px,80%%);height:auto;mix-blend-mode:multiply"></div>'%logo)
# 4. galería: sin fotos reales no se publica
cut(r'  <section id="galeria".*?</section>\n\n')
cut(r'<li><a href="#galeria" data-sec="galeria">Galería</a></li>')
# 4b. pie con enlaces legales reales
old='<span>Aviso legal · Privacidad · Cookies</span>'
assert old in s
s=s.replace(old,'<span><a href="aviso-legal.html">Aviso legal</a> · <a href="politica-de-privacidad.html">Privacidad</a> · <a href="politica-de-cookies.html">Cookies</a> · <a href="condiciones-de-venta.html">Condiciones de venta</a> · <a href="#" id="tw-cookies-cfg">Configurar cookies</a></span>')
# 5. documento completo con SEO
head=('''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Twitrans 90 · Taller de vehículos industriales en Ripollet, Barcelona</title>
<meta name="description" content="Taller de confianza para vehículos industriales en Barcelona y Cataluña: reparación, taller móvil, neumáticos, plancha y pintura, suministros hidráulicos y compraventa. Presupuesto personalizado y sin compromiso.">
<link rel="canonical" href="https://twitrans90.com/">
<meta name="theme-color" content="#0E1D32">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="Twitrans 90 · Taller de vehículos industriales">
<meta property="og:description" content="Reparación, taller móvil, neumáticos, plancha y pintura, hidráulica y compraventa de vehículos industriales en Barcelona y Cataluña.">
<meta property="og:url" content="https://twitrans90.com/">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-22 -22 44 44'%3E%3Cpath fill='%23A33B3B' fill-rule='evenodd' d='M20 0 L10 17.32 L-10 17.32 L-20 0 L-10 -17.32 L10 -17.32 Z M9 0 a9 9 0 1 0 -18 0 a9 9 0 1 0 18 0 Z'/%3E%3C/svg%3E">
<script type="application/ld+json">__LD__</script>
<style>:root{color-scheme:light}html{-webkit-text-size-adjust:100%}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
''').replace('__LD__',json.dumps({
 "@context":"https://schema.org","@type":"AutoRepair","name":"TWITRANS 90 SL","url":"https://twitrans90.com/",
 "description":"Taller de reparación de vehículos industriales, taller móvil, neumáticos, plancha y pintura, suministros hidráulicos y compraventa.",
 "email":"twitrans90@gmail.com","foundingDate":"2014",
 "address":{"@type":"PostalAddress","streetAddress":"Avda. del Río Ripoll, 73, nave","postalCode":"08291","addressLocality":"Ripollet","addressRegion":"Barcelona","addressCountry":"ES"},
 "areaServed":["Cataluña","España"],
 "openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"08:00","closes":"14:00"},{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"15:00","closes":"19:00"}],
 "hasMap":"https://maps.app.goo.gl/JANJiKN5tRn9K9n86"},ensure_ascii=False))

CHAT='''
<style>
#tw-cb{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:560px;margin:0 auto;background:var(--deep,#0E1D32);color:#fff;border-radius:14px;padding:18px 18px 16px;box-shadow:0 10px 40px rgba(0,0,0,.35);font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:none}
#tw-cb p{margin:0 0 12px}#tw-cb a{color:#fff;text-decoration:underline}
#tw-cb .b{display:flex;gap:10px;flex-wrap:wrap}
#tw-cb button{flex:1 1 140px;min-height:44px;border-radius:10px;border:2px solid #fff;font:600 15px system-ui,sans-serif;cursor:pointer}
#tw-cb .ok{background:#fff;color:#0E1D32}#tw-cb .no{background:transparent;color:#fff}
</style>
<div id="tw-cb" role="dialog" aria-label="Chat y cookies"><p>Para usar el chat con Javi, nuestro asistente virtual, se cargan cookies y almacenamiento de un tercero (LeadConnector). Si lo rechazas, no se carga y puedes escribirnos por WhatsApp. <a href="politica-de-cookies.html">Más información</a></p><div class="b"><button class="ok" id="tw-ok">Aceptar el chat</button><button class="no" id="tw-no">Rechazar</button></div></div>
<script>
(function(){
var K='tw90_chat',cb=document.getElementById('tw-cb');
function get(){try{return localStorage.getItem(K)}catch(e){return null}}
function set(v){try{localStorage.setItem(K,v)}catch(e){}}
function load(){if(window.__twChat)return;window.__twChat=1;var s=document.createElement('script');s.src='https://widgets.leadconnectorhq.com/loader.js';s.setAttribute('data-resources-url','https://widgets.leadconnectorhq.com/chat-widget/loader.js');s.setAttribute('data-widget-id','6ad60b7de0d80451b72f85e4');document.body.appendChild(s)}
function show(){cb.style.display='block'}
function hide(){cb.style.display='none'}
document.getElementById('tw-ok').onclick=function(){set('si');hide();load()};
document.getElementById('tw-no').onclick=function(){set('no');hide()};
document.getElementById('tw-cookies-cfg').onclick=function(e){e.preventDefault();show()};
var v=get();if(v==='si')load();else if(v!=='no')show();
})();
</script>
'''
s=head+s.lstrip()+CHAT+'\n</body>\n</html>\n'
open(os.path.join(here,'index.html'),'w',encoding='utf-8').write(s)
open(os.path.join(here,'robots.txt'),'w').write('User-agent: *\nAllow: /\nSitemap: https://twitrans90.com/sitemap.xml\n')
open(os.path.join(here,'sitemap.xml'),'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://twitrans90.com/</loc></url><url><loc>https://twitrans90.com/aviso-legal.html</loc></url><url><loc>https://twitrans90.com/politica-de-privacidad.html</loc></url><url><loc>https://twitrans90.com/politica-de-cookies.html</loc></url><url><loc>https://twitrans90.com/condiciones-de-venta.html</loc></url></urlset>\n')
print(len(s))
