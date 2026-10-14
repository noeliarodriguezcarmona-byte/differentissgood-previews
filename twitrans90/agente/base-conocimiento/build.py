import csv, os
here=os.path.dirname(os.path.abspath(__file__))
rows=list(csv.reader(open(os.path.join(here,'faq.csv'),encoding='utf-8')))[1:]
G=[('latiguillo / latiguillos hidráulicos','manguera hidráulica o suministros hidráulicos. Javi no usa «latiguillo»; en la web sí aparece como palabra de búsqueda.'),
('taller mecánico de camiones','reparación de vehículos industriales'),
('cambio de ruedas','cambio y reparación de neumáticos industriales'),
('asistencia en carretera / auxilio','taller móvil (no es servicio de grúa)'),
('coche / turismo / auto','no atendemos; solo vehículos industriales. Javi no repite estas palabras.'),
('chapa y pintura','plancha y pintura de vehículos industriales'),
('camión de segunda mano','vehículo industrial de ocasión revisado en taller'),
('precio / tarifa','presupuesto personalizado (Javi no dice «tarifa plana»)')]
FIJOS=['Razón social: TWITRANS 90 SL · CIF B66394149','Dirección: Avda. del Río Ripoll, nave 73, 08291 Ripollet (Barcelona)','Correo: twitrans90@gmail.com','En el negocio desde 2014','Horario: lunes a viernes, 8:00-14:00 y 15:00-19:00. Cerrado sábados, domingos, festivos y la segunda quincena de agosto.']
NOESTA='Javi no inventa. Dice que lo confirma el equipo, y recoge nombre, teléfono, empresa, qué necesita, cuándo lo necesita y vehículo (o ubicación si es asistencia).'
PEND=['Teléfono para llamadas. La tarjeta impresa lleva el 654545650 (con CIF B-66394149 y código postal 08291 Ripollet), el cuestionario habla de 654545650-654545653 y el WhatsApp del agente es el 654545653. Confirmar cuál es el público. Mientras tanto, Javi no da ningún número y ofrece que el equipo llame.','Criterio de la señal o anticipo (¿a partir de qué importe o trabajo?).','Fechas exactas de vacaciones de agosto y calendario de festivos.','Rotulación: la web la menciona en plancha y pintura y el agente dice que no la incluye.','Si el taller móvil sale dentro del mismo horario del taller.']
# --- markdown (fuente de las fichas en texto enriquecido)
md=['# TWITRANS 90 SL · Base de conocimiento de Javi\n','Fuente única de información que Javi puede usar. Todo lo que no esté aquí lo confirma el equipo. Se genera a partir de las respuestas del cuestionario `DIG-2026-001` (29/09/2026), de la tarjeta de visita y del horario confirmado por Noelia (lunes a viernes, 8-14 y 15-19).\n',f'Entradas: {len(rows)}. Mismo contenido en `faq.csv` para importarlo como preguntas y respuestas.\n']
cur=None
for t,q,a,kw in rows:
    if t!=cur: md.append(f'\n## {t}\n'); cur=t
    md.append(f'### {q}\n{a}\n'+(f'*Palabras clave: {kw}*\n' if kw else ''))
md.append('\n## Glosario: cómo lo dice el cliente y cómo lo dice Twitrans\n\n| El cliente dice | Twitrans lo llama |\n|---|---|\n'+'\n'.join(f'| {a} | {b} |' for a,b in G)+'\n')
md.append('\n## Datos fijos de la empresa\n'+'\n'.join('- '+x for x in FIJOS)+'\n')
md.append('\n## Si la respuesta no está aquí\n'+NOESTA+'\n')
md.append('\n## Pendiente de confirmar con el cliente\n'+'\n'.join(f'{i}. {x}' for i,x in enumerate(PEND,1))+'\n')
open(os.path.join(here,'base-de-conocimiento.md'),'w',encoding='utf-8').write('\n'.join(md))
# --- texto plano para pegar en un campo de prompt
tx=['BASE DE CONOCIMIENTO DE TWITRANS (TWITRANS 90 SL)','Esta es tu única fuente de información sobre la empresa. Responde solo con lo que aparece aquí. Si algo no está, no lo inventes: di que lo confirma el equipo y ofrece tomar los datos. Las respuestas están escritas con la voz de Javi; adáptalas a la conversación sin cambiar los datos.','','DATOS DE LA EMPRESA']+['- '+x for x in FIJOS]
cur=None
for t,q,a,kw in rows:
    if t!=cur: tx+=['',t.upper()]; cur=t
    tx+=['P: '+q,'R: '+a+(f'  [También se pregunta: {kw}]' if kw else ''),'']
tx+=['GLOSARIO (el cliente dice / Twitrans lo llama)']+[f'- {a} = {b}' for a,b in G]+['','SI LA RESPUESTA NO ESTÁ AQUÍ',NOESTA]
open(os.path.join(here,'..','javi','prompt-base-de-conocimiento.txt'),'w',encoding='utf-8').write('\n'.join(tx).replace('\n\n\n','\n\n').strip()+'\n')
print(len(rows),'entradas')
