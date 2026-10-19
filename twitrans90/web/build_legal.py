import os, html
here=os.path.dirname(os.path.abspath(__file__))
FECHA='19 de octubre de 2026'
EMPRESA='TWITRANS 90 SL'; CIF='B66394149'
DOM='Avda. del Río Ripoll, nave 73, 08291 Ripollet (Barcelona)'; MAIL='twitrans90@gmail.com'; WEB='twitrans90.com'
# Datos del Registro Mercantil: se escriben en registro-mercantil.txt (una línea). Si el archivo no existe, la línea no se muestra.
_rp=os.path.join(here,'registro-mercantil.txt')
REG=open(_rp,encoding='utf-8').read().strip() if os.path.exists(_rp) else ''
NAV=[('aviso-legal.html','Aviso legal'),('politica-de-privacidad.html','Política de privacidad'),('politica-de-cookies.html','Política de cookies'),('condiciones-de-venta.html','Condiciones de venta')]
CSS='''*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:17px;line-height:1.65;color:#0F1D30;background:#D6D6D3}
a{color:#7E2A2A}header{background:#0E1D32;color:#EAF0F7}header .w{max-width:820px;margin:auto;padding:14px 20px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center}header a{color:#EAF0F7;text-decoration:none;font-weight:700}
main{max-width:820px;margin:auto;padding:36px 20px 56px;background:#fff;min-height:70vh}h1{font-size:clamp(28px,5vw,40px);line-height:1.1;margin:0 0 6px}h2{font-size:21px;margin:30px 0 6px}p,li{margin:8px 0}ul{padding-left:22px}
.upd{color:#4a5568;font-size:14px;margin:0 0 20px}mark{background:#F3D2D2;color:#5E1010;padding:1px 4px;border-radius:3px}
table{border-collapse:collapse;width:100%;font-size:15px}td,th{border:1px solid #bbb;padding:7px 9px;text-align:left;vertical-align:top}
footer{background:#0E1D32;color:#9FB0C6;font-size:14px}footer .w{max-width:820px;margin:auto;padding:20px;display:flex;flex-wrap:wrap;gap:8px 18px}footer a{color:#EAF0F7}'''
def page(fn,title,body):
    nav=' · '.join(f'<a href="{f}">{t}</a>' for f,t in NAV if f!=fn)
    return f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · Twitrans 90</title><meta name="robots" content="index,follow"><link rel="canonical" href="https://{WEB}/{fn}">
<style>{CSS}</style></head><body>
<header><div class="w"><a href="/">TWITRANS 90</a><a href="/">← Volver a la web</a></div></header>
<main><h1>{title}</h1><p class="upd">Última actualización: {FECHA}</p>
{body}
</main><footer><div class="w">{nav}</div></footer></body></html>
'''
ID=f'<strong>{EMPRESA}</strong>, con CIF {CIF}, domicilio en {DOM}'
aviso=f'''<h2>1. Titular del sitio web</h2>
<p>En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de que el sitio web <strong>{WEB}</strong> es titularidad de:</p>
<ul><li>Denominación social: {EMPRESA}</li><li>CIF: {CIF}</li><li>Domicilio: {DOM}</li><li>Correo electrónico: <a href="mailto:{MAIL}">{MAIL}</a></li>{('<li>Datos registrales: '+REG+'</li>') if REG else ''}<li>Actividad: taller de reparación de vehículos industriales, taller móvil, neumáticos, plancha y pintura, suministros hidráulicos y neumáticos, y compraventa de vehículos industriales.</li></ul>
<h2>2. Objeto y aceptación</h2>
<p>Este sitio web ofrece información sobre los servicios de {EMPRESA} y facilita el contacto con la empresa. Navegar por él implica aceptar este aviso legal. Si no estás de acuerdo con su contenido, te pedimos que no uses el sitio.</p>
<h2>3. Condiciones de uso</h2>
<p>Te comprometes a usar el sitio de forma lícita y conforme a la buena fe, sin causar daños en el sitio ni en sus sistemas, sin intentar acceder a zonas no autorizadas y sin utilizarlo para fines contrarios a la ley o a los derechos de terceros.</p>
<h2>4. Contenidos e información</h2>
<p>Hacemos lo posible por que la información sea exacta y esté actualizada, pero puede contener errores u omisiones. La información sobre servicios y horarios es orientativa. Los precios no se publican: cada trabajo se presupuesta de forma personalizada y sin compromiso. {EMPRESA} puede modificar el contenido del sitio en cualquier momento y sin previo aviso.</p>
<h2>5. Propiedad intelectual e industrial</h2>
<p>Los textos, imágenes, ilustraciones, logotipos, marcas, diseño y código del sitio pertenecen a {EMPRESA} o a sus legítimos titulares y están protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o transformación sin autorización expresa. El diseño del sitio ha sido realizado por Differentissgood (<a href="https://differentissgood.com" target="_blank" rel="noopener">differentissgood.com</a>).</p>
<h2>6. Enlaces a terceros</h2>
<p>El sitio incluye enlaces a servicios de terceros (por ejemplo WhatsApp o Google Maps). {EMPRESA} no controla esos sitios ni se hace responsable de su contenido ni de sus políticas. Su uso se rige por las condiciones y políticas de privacidad de cada servicio.</p>
<h2>7. Responsabilidad</h2>
<p>{EMPRESA} no garantiza la disponibilidad continua del sitio y no responde de los daños derivados de interrupciones, fallos técnicos o virus ajenos a su control, ni del uso indebido que otros hagan de la información publicada.</p>
<h2>8. Protección de datos y cookies</h2>
<p>El tratamiento de datos personales se explica en la <a href="politica-de-privacidad.html">política de privacidad</a> y el uso de cookies en la <a href="politica-de-cookies.html">política de cookies</a>.</p>
<h2>9. Legislación aplicable y jurisdicción</h2>
<p>Este aviso se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a la ley; cuando el usuario sea consumidor, serán los de su domicilio.</p>'''
priv=f'''<h2>1. Responsable del tratamiento</h2>
<ul><li>Responsable: {EMPRESA}</li><li>CIF: {CIF}</li><li>Domicilio: {DOM}</li><li>Correo electrónico: <a href="mailto:{MAIL}">{MAIL}</a></li></ul>
<h2>2. Qué datos tratamos y cómo los recogemos</h2>
<p>Este sitio web <strong>no almacena en sus servidores</strong> los datos que escribas en el cuestionario de presupuesto. Al pulsar «Enviar», se abre WhatsApp con un mensaje ya redactado con lo que has escrito, y es tu decisión enviarlo o no. Tratamos los datos cuando nos escribes por WhatsApp, por el chat de la web (si lo aceptas), por correo electrónico o por cualquier otro medio:</p>
<ul><li>Datos identificativos y de contacto: nombre, empresa, teléfono y correo electrónico.</li><li>Datos de tu consulta: qué necesitas, cuándo lo necesitas, matrícula o modelo del vehículo industrial y, si pides asistencia, tu ubicación.</li><li>El contenido de los mensajes que nos envías.</li></ul>
<p>No te pedimos datos bancarios, números de tarjeta, DNI ni datos de salud, y te rogamos que no nos los envíes.</p>
<h2>3. Asistente virtual</h2>
<p>Parte de las conversaciones por WhatsApp y por el chat de la web las atiende «Javi», un asistente virtual con inteligencia artificial que responde dudas sobre la empresa y recoge los datos necesarios para que el equipo prepare un presupuesto o gestione una asistencia. Javi no toma decisiones automatizadas con efectos jurídicos sobre ti: los presupuestos, los precios y los plazos los decide siempre el equipo de {EMPRESA}. Puedes pedir en cualquier momento hablar con una persona del equipo. El chat de la web solo se activa si aceptas su uso en el aviso de cookies; consulta la <a href="politica-de-cookies.html">política de cookies</a>.</p>
<h2>4. Para qué usamos tus datos y con qué base legal</h2>
<table><tr><th>Finalidad</th><th>Base legal (RGPD)</th></tr>
<tr><td>Atender tu consulta o tu solicitud de presupuesto o asistencia.</td><td>Aplicación de medidas precontractuales a petición tuya (art. 6.1.b) y, en su caso, tu consentimiento al escribirnos (art. 6.1.a).</td></tr>
<tr><td>Gestionar la relación comercial si contratas un servicio o compras un producto: trabajos, entregas, facturación, garantías.</td><td>Ejecución del contrato (art. 6.1.b).</td></tr>
<tr><td>Cumplir obligaciones legales, como las fiscales y contables.</td><td>Obligación legal (art. 6.1.c).</td></tr></table>
<p>No usamos tus datos para enviarte publicidad si no nos lo has pedido o autorizado.</p>
<h2>5. Cuánto tiempo los conservamos</h2>
<p>Conservamos tus datos mientras sean necesarios para atender tu consulta y, si hay relación comercial, mientras dure y durante los plazos de conservación y prescripción que marca la ley. Después los suprimimos o los bloqueamos.</p>
<h2>6. A quién podemos comunicarlos</h2>
<p>Solo accede a tus datos el equipo de {EMPRESA}. Para prestar el servicio utilizamos proveedores que actúan como encargados del tratamiento y con los que tenemos contrato: servicios de mensajería (WhatsApp), gestión de clientes y automatización, alojamiento web y el servicio de inteligencia artificial del asistente virtual. También podemos comunicar datos a las administraciones públicas cuando una ley lo exija. Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo; en ese caso exigimos garantías adecuadas, como cláusulas contractuales tipo de la Comisión Europea u otros mecanismos reconocidos por el RGPD.</p>
<h2>7. Tus derechos</h2>
<p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a <a href="mailto:{MAIL}">{MAIL}</a> e indicando el derecho que quieres ejercer y un modo de identificarte. Si consideras que no hemos atendido bien tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>
<h2>8. Menores</h2>
<p>Nuestros servicios están dirigidos a empresas y profesionales. No recogemos conscientemente datos de menores de 14 años.</p>
<h2>9. Cambios en esta política</h2>
<p>Podemos actualizar esta política para adaptarla a cambios legales o del servicio. La fecha de la última actualización figura al principio de la página.</p>'''
cook=f'''<h2>1. Qué son las cookies</h2>
<p>Las cookies son pequeños archivos que un sitio web guarda en tu dispositivo para recordar información sobre tu visita.</p>
<h2>2. Qué cookies usa este sitio</h2>
<p>Al entrar en el sitio <strong>no se instala ninguna cookie</strong> ni se guarda información en tu navegador con fines de análisis, personalización o publicidad, salvo lo que se indica a continuación.</p>
<h2>3. Chat con el asistente virtual (solo si lo aceptas)</h2>
<p>El sitio incluye un chat con «Javi», nuestro asistente virtual. Está proporcionado por <strong>LeadConnector / HighLevel</strong> (a través de la plataforma de gestión que utilizamos) y <strong>solo se carga si pulsas «Aceptar» en el aviso que te mostramos</strong>. Si pulsas «Rechazar», el chat no se carga y puedes escribirnos por WhatsApp.</p>
<table><tr><th>Qué</th><th>Para qué</th><th>Quién</th></tr>
<tr><td>Cookies y almacenamiento local del chat (identificador del visitante y de la conversación)</td><td>Mantener tu conversación con el asistente y que no se pierda al cambiar de página.</td><td>LeadConnector / HighLevel (tercero)</td></tr>
<tr><td>Recuerdo de tu elección (aceptar o rechazar), guardado en tu navegador</td><td>No volver a preguntarte en cada visita. Es técnico y necesario.</td><td>Este sitio</td></tr></table>
<p>Puedes cambiar de opinión en cualquier momento pulsando «Configurar cookies» al pie de la página, o borrando los datos del sitio en tu navegador.</p>
<h2>4. Otros servicios de terceros</h2>
<ul><li><strong>Tipografías de Google Fonts:</strong> para mostrar las letras del sitio, tu navegador las descarga de los servidores de Google, que reciben tu dirección IP. Google Fonts no instala cookies en tu dispositivo.</li><li><strong>WhatsApp y Google Maps:</strong> son enlaces a servicios externos. Si los abres, se aplican las cookies y las políticas de esos servicios.</li></ul>
<p>Si en el futuro incorporamos herramientas de analítica de visitas, publicidad u otras que usen cookies, te lo informaremos en esta página y te pediremos tu consentimiento antes de activarlas, salvo las cookies estrictamente necesarias.</p>
<h2>5. Cómo gestionar las cookies en tu navegador</h2>
<p>Puedes bloquear o borrar cookies desde la configuración de tu navegador. Consulta la ayuda de Chrome, Safari, Firefox o Edge.</p>
<p>Más información sobre el tratamiento de datos en nuestra <a href="politica-de-privacidad.html">política de privacidad</a>.</p>'''
cond=f'''<p>Estas condiciones se aplican a la compra de productos y a la contratación de servicios con {EMPRESA}. Los precios no son fijos: se acuerdan en un presupuesto personalizado y sin compromiso, que se te entrega antes de realizar el trabajo.</p>
<h2>1. Formas de pago</h2>
<p>Aceptamos pago con tarjeta, transferencia bancaria y efectivo. En función de la avería, del presupuesto o de la venta, puede solicitarse una señal; se te indicará en el presupuesto.</p>
<h2>2. Facturación</h2>
<p>Emitimos factura detallada a nombre de la empresa o del autónomo, con los datos fiscales que nos facilites.</p>
<h2>3. Devoluciones</h2>
<p>Dispones de <strong>14 días</strong> para devolver un producto, que es el plazo mínimo que fija la ley. Los gastos de la devolución corren a cargo del cliente.</p>
<h2>4. Productos y servicios que no admiten devolución</h2>
<ul><li>Mangueras y suministros hidráulicos fabricados a medida.</li><li>Piezas encargadas bajo pedido específico.</li><li>Suministros ya instalados o usados.</li><li>La mano de obra de reparación y los trabajos de plancha y pintura.</li></ul>
<h2>5. Garantía</h2>
<p>Los recambios, componentes y la mano de obra tienen la garantía legal que establece la normativa aplicable. Si tienes un problema con un trabajo o un producto, escríbenos a <a href="mailto:{MAIL}">{MAIL}</a> y lo revisaremos.</p>
<h2>6. Plazos</h2>
<p>El diagnóstico habitual de una avería está entre 24 y 48 horas. El plazo de reparación depende de la avería y se confirma después del diagnóstico.</p>
<h2>7. Atención y legislación aplicable</h2>
<p>Estas condiciones se rigen por la legislación española. Puedes contactar con nosotros en <a href="mailto:{MAIL}">{MAIL}</a>.</p>'''
for fn,t,b in [('aviso-legal.html','Aviso legal',aviso),('politica-de-privacidad.html','Política de privacidad',priv),('politica-de-cookies.html','Política de cookies',cook),('condiciones-de-venta.html','Condiciones de venta',cond)]:
    open(os.path.join(here,fn),'w',encoding='utf-8').write(page(fn,t,b))
print('ok')
