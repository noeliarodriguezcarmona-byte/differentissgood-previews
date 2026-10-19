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
# 3b. fuera el botón flotante de WhatsApp (el contacto va por el formulario y por el chat de Javi)
cut(r'<a class="wa" href="https://wa.me/[^"]*"[^>]*>.*?</a>\n?')
# 4. galería: sin fotos reales no se publica
cut(r'  <section id="galeria".*?</section>\n\n')
cut(r'<li><a href="#galeria" data-sec="galeria">Galería</a></li>')
# 4b. pie con enlaces legales reales
old='<span>Aviso legal · Privacidad · Cookies</span>'
assert old in s
s=s.replace(old,'<span><a href="aviso-legal.html">Aviso legal</a> · <a href="politica-de-privacidad.html">Privacidad</a> · <a href="politica-de-cookies.html">Cookies</a> · <a href="condiciones-de-venta.html">Condiciones de venta</a> · <a href="#" id="tw-cookies-cfg">Cookies del chat</a></span>')
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
#tw-lz{position:fixed;right:16px;bottom:16px;z-index:2147483000;font:15px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
#tw-lz .btn{display:flex;align-items:center;gap:10px;min-height:52px;padding:0 20px;border:0;border-radius:999px;background:var(--brand,#1F3A5F);color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.35)}
#tw-lz .btn i{width:10px;height:10px;border-radius:50%;background:#7ED9A0;display:inline-block}
#tw-lz .pn{display:none;position:absolute;right:0;bottom:64px;width:min(320px,calc(100vw - 32px));background:var(--deep,#0E1D32);color:#fff;border-radius:14px;padding:16px;box-shadow:0 10px 40px rgba(0,0,0,.4)}
#tw-lz .pn p{margin:0 0 12px}#tw-lz .pn a{color:#fff;text-decoration:underline}
#tw-lz .pn b{display:block;font-size:16px;margin-bottom:6px}
#tw-lz .go{width:100%;min-height:44px;border-radius:10px;border:0;background:#fff;color:#0E1D32;font:600 15px system-ui,sans-serif;cursor:pointer}
#tw-lz.open .pn{display:block}
</style>
<div id="tw-lz"><div class="pn" role="dialog" aria-label="Chat con Javi"><b>Chat con Javi</b><p>Javi es nuestro asistente virtual. Para chatear se cargan cookies y almacenamiento de un tercero (LeadConnector). <a href="politica-de-cookies.html">Más información</a></p><button class="go" id="tw-go">Empezar chat</button></div><button class="btn" id="tw-open" aria-expanded="false"><i></i>Chat con Javi</button></div>
<script>
(function(){
var K='tw90_chat',lz=document.getElementById('tw-lz');
function get(){try{return localStorage.getItem(K)}catch(e){return null}}
function set(v){try{localStorage.setItem(K,v)}catch(e){}}
function del(){try{localStorage.removeItem(K)}catch(e){}}
function load(){if(window.__twChat)return;window.__twChat=1;lz.style.display='none';var s=document.createElement('script');s.src='https://widgets.leadconnectorhq.com/loader.js';s.setAttribute('data-resources-url','https://widgets.leadconnectorhq.com/chat-widget/loader.js');s.setAttribute('data-widget-id','6ad60b7de0d80451b72f85e4');document.body.appendChild(s)}
document.getElementById('tw-open').onclick=function(){var o=lz.classList.toggle('open');this.setAttribute('aria-expanded',o)};
document.getElementById('tw-go').onclick=function(){set('si');load()};
var c=document.getElementById('tw-cookies-cfg');
if(c)c.onclick=function(e){e.preventDefault();del();location.reload()};
if(get()==='si')load();
})();
</script>
'''

# 5. fotografías y vídeo reales del cliente (carpeta media/)
VIDEO='<div class="scene hero-video"><video id="heroVideo" src="media/video-home.mp4" poster="media/video-home-poster.jpg" autoplay muted loop playsinline preload="metadata" aria-label="Taller de Twitrans 90 en Ripollet: vídeo de presentación"></video></div>'
cut(r'<div class="scene".*?(?=\s*<div class="hero-text">)', VIDEO)
def slider(name,n,label):
    imgs=''.join('<img src="media/%s-%02d.jpg" alt="%s, de Twitrans 90" width="1000" height="667" decoding="async"%s%s>'%(name,k,label,' class="on"' if k==1 else '',' loading="lazy"' if k>1 else '') for k in range(1,n+1))
    return '<figure class="slider" data-slider data-delay="3600" aria-label="Fotos de %s"><div class="slides">%s</div><figcaption>%s</figcaption><span class="count mono" aria-hidden="true">1/%d</span></figure>'%(label,imgs,label,n)
TEAM='<div class="photo team">'+slider('isa',14,'Isa')+slider('javi',9,'Javi')+'</div>'
cut(r'<div class="photo">.*?(?=\s*<div class="about-body">)', TEAM)
SVC={1:('servicio-reparacion.jpg','Mecánico de Twitrans 90 reparando el motor de un vehículo industrial','60% 50%'),
     2:('servicio-plancha-pintura.jpg','Pintando una furgoneta en el taller de Twitrans 90','70% 50%'),
     3:('servicio-neumaticos.jpg','Montaje de un neumático de camión con pistola neumática','50% 50%'),
     4:('servicio-taller-movil.jpg','Furgoneta del taller móvil de Twitrans 90','50% 50%'),
     5:('servicio-suministros.jpg','Manos de un mecánico apretando racores en un motor','50% 50%'),
     6:('servicio-compraventa.jpg','Camión de ocasión revisado en el taller de Twitrans 90','50% 55%')}
for n,(f,alt,pos) in SVC.items():
    old='<article class="svc"><span class="idx">S%d</span>'%n
    assert old in s, old
    s=s.replace(old, old+'\n          <div class="svc-photo"><img src="media/%s" alt="%s" width="1000" height="667" loading="lazy" decoding="async" style="object-position:%s"></div>'%(f,alt,pos),1)
MEDIA_CSS='''
<style>
.hero{padding-block:clamp(12px,2.4svh,28px);min-height:calc(100svh - var(--navh,64px));display:flex;align-items:flex-start}
.hero-stack{width:100%;display:flex;flex-direction:column;gap:clamp(12px,2.2svh,24px)}
.hero .scene.hero-video{flex:none;aspect-ratio:16/9;min-height:0;max-height:none;width:100%;background:#000}
.hero-text{flex:none}
.hero h1{font-size:clamp(28px,min(5vw,6svh),60px)}
.hero .sub{font-size:clamp(15px,2.2svh,19px);margin-top:clamp(8px,1.6svh,16px)}
.hero .ctas{margin-top:clamp(12px,2.4svh,24px)}
.hero .status{margin-bottom:clamp(10px,2svh,20px)}
@media (min-width:960px) and (min-aspect-ratio:1/1),(min-width:700px) and (max-height:520px) and (min-aspect-ratio:1/1){
.hero .wrap{max-width:min(1400px,100%)}
.hero{align-items:center}
.hero-stack{display:grid;grid-template-columns:minmax(0,.78fr) minmax(0,1.5fr);align-items:center;gap:clamp(28px,4vw,56px)}
.hero .scene.hero-video{order:2;flex:none;align-self:center;aspect-ratio:16/9;min-height:0;max-height:calc(100svh - var(--navh,64px) - 40px);width:min(100%,calc((100svh - var(--navh,64px) - 40px)*16/9))}
.hero-text{order:1}
.hero h1{font-size:clamp(22px,min(3.8vw,6.4svh),56px);max-width:none}
}
@media (max-width:700px){.hero{padding-bottom:72px}#tw-lz .btn{min-height:46px;padding:0 15px;font-size:14px}}
@media (max-width:700px) and (min-height:700px){.hero h1{font-size:clamp(30px,8.6vw,44px)}.hero .sub{font-size:17px}.hero .scene.hero-video{margin-bottom:6px}}
@media (max-height:640px){.hero h1{font-size:clamp(23px,min(5vw,5svh),60px)}.hero .sub{font-size:14px}.hero .status{padding:5px 11px;font-size:11px}}
.hero-video video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;background:#000}
.photo.team{aspect-ratio:auto;background:none;border:0;display:grid;grid-template-columns:1fr;gap:14px;place-items:stretch}
.photo.team .slider{margin:0;position:relative;aspect-ratio:3/2;overflow:hidden;background:var(--surface);border:1px solid var(--line);cursor:pointer}
.photo.team .slides,.photo.team .slides img{position:absolute;inset:0;width:100%;height:100%}
.photo.team .slides img{object-fit:cover;display:block;opacity:0;transition:opacity .9s ease}
.photo.team .slides img.on{opacity:1}
.photo.team figcaption{position:absolute;left:0;right:0;bottom:0;padding:34px 16px 12px;color:#fff;font:700 22px var(--font-display,system-ui);letter-spacing:-.01em;background:linear-gradient(0deg,rgba(14,29,50,.85),rgba(14,29,50,0));pointer-events:none}
.photo.team .count{position:absolute;right:12px;bottom:14px;color:#fff;font-size:12px;letter-spacing:.08em;pointer-events:none}
.svc{min-height:0}
.svc-photo{margin:-28px -28px 6px;height:190px;overflow:hidden;background:var(--deep);flex:none}
.svc-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
.svc:hover .svc-photo img{transform:scale(1.05)}
.svc .idx{z-index:1;background:rgba(14,29,50,.78);color:#fff;padding:3px 8px}
@media (max-width:520px){.svc-photo{height:170px}}
@media (prefers-reduced-motion:reduce){.hero-video video{display:none}.hero .scene.hero-video{background:url(media/video-home-poster.jpg) center/cover}}
</style>
<script>
(function(){
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-slider]').forEach(function(f,n){
 var im=f.querySelectorAll('.slides img'),c=f.querySelector('.count'),k=0,t=null,seen=false,d=+f.dataset.delay||3600;
 function go(i){im[k].classList.remove('on');k=(i+im.length)%im.length;im[k].classList.add('on');if(c)c.textContent=(k+1)+'/'+im.length}
 function start(){if(rm||t)return;t=setInterval(function(){go(k+1)},d)}
 function stop(){clearInterval(t);t=null}
 f.addEventListener('click',function(){go(k+1);if(t){stop();start()}});
 if('IntersectionObserver' in window){new IntersectionObserver(function(e){e[0].isIntersecting?setTimeout(start,n*1500):stop()},{threshold:.25}).observe(f)}else{start()}
});
})();
</script>
<script>
(function(){var h=document.querySelector('header.nav');function s(){if(h)document.documentElement.style.setProperty('--navh',h.offsetHeight+'px')}s();addEventListener('resize',s);addEventListener('load',s)})();
</script>
'''
s=head+s.lstrip()+MEDIA_CSS+CHAT+'\n</body>\n</html>\n'
open(os.path.join(here,'index.html'),'w',encoding='utf-8').write(s)
open(os.path.join(here,'robots.txt'),'w').write('User-agent: *\nAllow: /\nSitemap: https://twitrans90.com/sitemap.xml\n')
open(os.path.join(here,'sitemap.xml'),'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://twitrans90.com/</loc></url><url><loc>https://twitrans90.com/aviso-legal.html</loc></url><url><loc>https://twitrans90.com/politica-de-privacidad.html</loc></url><url><loc>https://twitrans90.com/politica-de-cookies.html</loc></url><url><loc>https://twitrans90.com/condiciones-de-venta.html</loc></url></urlset>\n')
print(len(s))
