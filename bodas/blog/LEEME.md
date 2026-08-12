# Cómo editar el blog tú misma

El blog no tiene panel de administración porque la web no tiene servidor
(es una web estática, más rápida y sin costes de mantenimiento). En su lugar,
todo el contenido vive en **un solo archivo de texto**: `blog/posts.js`.
Editarlo es como rellenar una ficha — no hace falta saber programar.

## Crear una publicación nueva

1. Sube la foto de portada de la entrada a `bodas/media/fotos/` (con
   cualquier nombre, por ejemplo `blog-mi-entrada.jpg`), siguiendo las mismas
   reglas de siempre: tamaño web, no el archivo "Original" de la cámara.
2. Abre `blog/posts.js` en GitHub (botón del lápiz ✏️ para editar).
3. Justo después de `const POSTS = [`, pega este bloque:

   ```js
   {
     slug: 'un-nombre-corto-sin-espacios',
     titulo: 'El título que verá la pareja',
     fecha: '2026-09-01',
     resumen: 'Una frase corta que aparece en la tarjeta de la portada.',
     foto: 'media/fotos/blog-mi-entrada.jpg',
     cuerpo: [
       'Primer párrafo del texto.',
       'Segundo párrafo. Puedes añadir tantos como quieras.',
     ],
   },
   ```

4. Rellena cada campo:
   - `slug`: identifica la entrada en la URL. Sin espacios ni acentos,
     con guiones (`boda-en-otono`, no `Boda en Otoño`).
   - `titulo`, `resumen`, `fecha` (formato `AAAA-MM-DD`): tal cual se ven.
   - `foto`: la ruta a la imagen que subiste en el paso 1.
   - `cuerpo`: cada línea entre comillas es un párrafo. Separa cada
     párrafo con una coma al final.
5. **No olvides la coma** al final del bloque anterior si añades el tuyo
   después de otro (cada entrada termina en `},`).
6. Guarda los cambios ("Commit changes") directamente en la rama.

La entrada aparece sola en `blog.html` y tiene su propia página en
`blog/post.html?post=un-nombre-corto-sin-espacios`.

## Editar una publicación existente

Busca su bloque en `posts.js` por el `titulo` o el `slug`, cambia lo que
haga falta y guarda.

## Eliminar una publicación

Borra su bloque completo (desde la `{` hasta la `},`) y guarda.

## Si algo se rompe

Lo más habitual es olvidar una coma o una comilla. Si el blog deja de
cargar entradas, revisa que cada bloque tenga exactamente esta forma y que
no falte ninguna coma entre campos ni entre bloques.
