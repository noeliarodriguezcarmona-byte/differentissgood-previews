# Differentissgood — Previews de clientes

Repositorio para previsualizar webs de clientes antes de entregarlas.

## Estructura
- `index.html` — portada; desde el 04/09/2026 solo remite a
  `differentissgood.com/planesweb/`, que es donde vive la información de verdad
- `assets/` — imágenes y vídeos (nunca en base64 dentro del código)
- cada proyecto de cliente = un archivo .html propio (o una carpeta si tiene varias páginas)

## Reglas para que las previews nunca se rompan
- Imágenes/vídeos siempre como archivo en `assets/`, con ruta relativa (`assets/foto.jpg`)
- Nunca enviar el .html suelto por WhatsApp/email — enviar siempre el link de Netlify
- Probar el link en incógnito antes de mandarlo al cliente

