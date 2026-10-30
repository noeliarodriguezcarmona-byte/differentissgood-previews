> **Obsoleto desde el 22/10/2026.** La versión vigente de Javi está en `javi/prompt-conversacion.txt` y `prompts/`: resuelve dudas y lleva siempre al teléfono de Javi (654 545 650), sin recoger datos.

# Javi · skills

Cada skill es una pieza independiente del agente: cuándo se activa, qué responde, qué recoge y qué no hace. Se pueden cargar por separado o todas juntas.

| Skill | Se activa cuando el cliente habla de… |
|---|---|
| 00 Núcleo | siempre |
| 01 Horarios y fuera de horario | horario, sábados, festivos, cerrado |
| 02 Reparación | averías, mantenimiento, ITV |
| 03 Plancha y pintura | golpes, pintura, aseguradora |
| 04 Neumáticos | ruedas, pinchazos |
| 05 Taller móvil y urgencias | vehículo parado, avería en ruta |
| 06 Suministros hidráulicos | mangueras, racores |
| 07 Compraventa | comprar, vender, tasar |
| 08 Presupuesto y datos | precio, presupuesto, cierre y aviso |
| 09 Quejas y casos delicados | quejas, garantía, descuentos |
| 10 Pagos, señal y facturas | pagos, factura, promociones |

Las preguntas y respuestas literales del cliente están en `../prompt-sistema.md` (sección de respuestas de referencia) y en `docs` del cuestionario. Los 17 casos de prueba están en `../casos-de-prueba.md`.
