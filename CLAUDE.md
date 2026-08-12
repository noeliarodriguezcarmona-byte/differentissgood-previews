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
