# Base de conocimiento de Javi

- `base-de-conocimiento.md`: documento completo, agrupado por tema. Sirve para cargarlo como archivo o texto en la plataforma del agente.
- `faq.csv`: las mismas entradas como preguntas y respuestas (columnas: tema, pregunta, respuesta, palabras_clave), para importar como FAQ.

**Regla:** si el cliente cambia un dato (horario, servicios, condiciones), se cambia aquí primero (`faq.csv` y `build.py`) y después en `../javi/prompt-conversacion.txt` y `../prompts/`. Nada de datos sueltos en otro sitio.
