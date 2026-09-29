# Prompts de Javier

Un archivo por campo o automatización. Los datos concretos (servicios, horarios, condiciones) no van aquí: están en la base de conocimiento.

| Archivo | Para qué |
|---|---|
| `01-rol-y-personalidad.txt` | Rol y personalidad: Campo de personalidad o rol del agente. |
| `02-objetivo.txt` | Objetivo: Campo de objetivo o meta del agente. |
| `03-instrucciones.txt` | Instrucciones generales: Campo principal de instrucciones. Los datos concretos (servicios, horarios, condiciones) están en la base de conocimiento. |
| `04-bienvenida.txt` | Mensajes de bienvenida: Primer mensaje. Uno con el taller abierto y otro con el taller cerrado. |
| `05-captacion-de-datos.txt` | Captación de datos por tipo de consulta: Instrucciones para pedir los datos según lo que necesite el cliente. |
| `06-urgencias.txt` | Urgencias y asistencia: Protocolo para vehículos parados o inmovilizados. |
| `07-quejas.txt` | Quejas y casos delicados: Cómo actuar ante quejas, temas legales y peticiones fuera de política. |
| `08-fuera-de-horario.txt` | Fuera de horario: Mensaje y comportamiento cuando el taller está cerrado. |
| `09-cierre.txt` | Despedidas: Mensajes de cierre cuando ya están los datos. |
| `10-aviso-al-equipo.txt` | Aviso al equipo (correo y WhatsApp): Plantillas para la automatización que avisa al taller. Sustituye los corchetes por los datos que recoge el agente. |
| `11-clasificador-de-urgencia.txt` | Clasificador de urgencia (para la automatización): Prompt para un paso de la automatización que clasifica cada conversación. Devuelve solo JSON. |
| `12-resumen-para-el-equipo.txt` | Resumen para el equipo: Prompt para generar la nota que se guarda en la ficha del contacto. |
| `13-seguimiento.txt` | Seguimiento si el cliente deja de responder: OPCIONAL. Requiere aprobación del cliente antes de activarlo. |

Si cambia una regla, se cambia aquí y en `../prompt-sistema.md`.
