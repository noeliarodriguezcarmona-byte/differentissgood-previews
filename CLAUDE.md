# Differentissgood

Estudio creativo. Servicios: audiovisual (fotografía y vídeo, incluye bodas),
creación de webs, project management, producción y postproducción.

Este repositorio (`differentissgood-previews`) es donde vive el trabajo propio
de la agencia y las webs que no pertenecen a un cliente concreto con su
propio repositorio — a diferencia de repos como `Proyecto-miriam`, que son de
una clienta y no deben mezclarse con contenido de Differentissgood.

## Convenciones al trabajar aquí

- **Fotos y vídeos para webs siempre a tamaño web antes de subir** (no
  "Original"/imprenta). Si una foto pesa más de ~2-3 MB, hay que reducirla
  antes: la subida a GitHub falla por encima de 25 MB, y una web con fotos
  pesadas carga mal en móvil de todas formas.
- **Vídeos largos van a YouTube (no listado) o Vimeo**, nunca como archivo
  suelto en el repositorio — se incrustan con iframe.
- **Despliegue**: cada carpeta de proyecto (`repo-para-github_1/`, `bodas/`...)
  es una web estática independiente. Si lleva su propio flujo de GitHub
  Actions para GitHub Pages, la primera vez hay que activar
  Settings → Pages → Source: GitHub Actions a mano (no se puede automatizar,
  requiere permisos de administración del repositorio).
- **La marca vive en `assets/marca.css`.** Tipografías, colores, barra superior
  y pie son de ahí y de ningún otro sitio. Si una página necesita un color o una
  tipografía, los coge con `var(--dig-…)`; no se escriben valores sueltos en el
  `<style>` de la página. Para cambiar la marca entera se toca el bloque
  `TOKENS DE MARCA` de ese archivo, y ya.
- **Cabeceras fijas**: la barra compartida ocupa `--dig-barra-h` arriba del todo.
  Cualquier elemento con `position:fixed;top:0` tiene que bajar esa altura, y las
  portadas a pantalla completa restarla (`calc(100svh - var(--dig-barra-h))`).
- **El logotipo también sale de `assets/marca.css`** (`--dig-logo`). Hay dos
  archivos: `assets/logo.png` (tinta negra, para fondo claro) y
  `assets/logo-claro.png` (tinta color papel, para fondo oscuro). En modo
  oscuro se cambia solo; en páginas que son oscuras siempre se fuerza con la
  clase `.dig-logo--claro`. Nunca se enlaza el logotipo desde otra web ni se
  vuelve a dibujar con CSS.
- **Traspaso a differentissgood.com**: los pasos están en `MIGRACION.md`.
- **La web de previsualización vive en GitHub Pages, no en Cloudflare.**
  Dirección: https://noeliarodriguezcarmona-byte.github.io/differentissgood-previews/
  Se actualiza sola en cuanto se hace push a `main` (workflow
  `.github/workflows/pages.yml`). `differentissgood-previews.workers.dev` es
  una dirección de Cloudflare que en algún momento se usó, pero no está
  conectada a este repositorio: los cambios de aquí no le llegan. Si algún
  día se conecta de verdad (o se decide dejarla de usar), actualizar esta
  nota.
