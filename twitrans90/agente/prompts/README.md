# Prompts de Javi

Javi de Twitrans resuelve dudas frecuentes y lleva siempre al teléfono de Javi (654 545 650). No recoge datos, no agenda citas y no decide cómo se atiende un vehículo. Los datos concretos (servicios, horarios, condiciones) están en la base de conocimiento.

| Archivo | Para qué |
|---|---|
| `../javi/prompt-conversacion.txt` | Prompt principal: misión, límites, tono y ejemplos. |
| `../javi/prompt-base-de-conocimiento.txt` | Base de conocimiento en texto plano. |
| `01-rol-y-personalidad.txt` | Campo de personalidad o rol del agente. |
| `02-objetivo.txt` | Campo de objetivo del agente. |
| `03-instrucciones.txt` | Campo de instrucciones generales. |
| `04-bienvenida.txt` | Primer mensaje, con el taller abierto y cerrado. |

Desde el 22/10/2026 ya no hay captación de datos, protocolo de urgencias, aviso al equipo, clasificador, resumen ni seguimiento: todo eso lo hace Javi por teléfono.

pagina.html se genera con `python3 build.py`.
