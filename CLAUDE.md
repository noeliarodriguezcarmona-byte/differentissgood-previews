# Differentissgood

Estudio creativo. Servicios: audiovisual (fotografía y vídeo, incluye bodas),
creación de webs, project management, producción y postproducción.

Este repositorio (`differentissgood-previews`) es donde vive el trabajo propio
de la agencia y las webs que no pertenecen a un cliente concreto con su
propio repositorio — a diferencia de repos como `Proyecto-miriam`, que son de
una clienta y no deben mezclarse con contenido de Differentissgood.

## Planes de páginas web — fuente de verdad

Todo lo relacionado con los planes de creación de páginas web se llama
**PLANES PÁGINA WEB** y vive en un único sitio:

**`docs/PLANES-PAGINA-WEB.md`**

Ese archivo es la fuente oficial de Plan Impulso, Plan Crecimiento y Plan Élite:
precios, plazos de entrega, características, funcionalidades, extras, rondas de
cambios, información legal incluida, diferencias entre planes y cualquier cambio
futuro.

**No usar `docs/PLANES.md`.** Si existiera o llegara a crearse, se traslada la
información válida a `docs/PLANES-PAGINA-WEB.md` y se usa solo este último.

Reglas al trabajar con planes:

- El orden de los cambios es siempre: **Noelia decide → se actualiza
  `docs/PLANES-PAGINA-WEB.md` → después `/planesweb/`, el cuestionario y el
  contrato.** Nunca al revés.
- Al tocar `/planesweb/` (`plan-impulso.html`, `plan-crecimiento.html`,
  `plan-elite.html`) o cualquier parte del cuestionario o del contrato que use
  datos de los planes, la referencia oficial es `docs/PLANES-PAGINA-WEB.md`.
- Si la web, el cuestionario, el contrato o cualquier otro archivo **contradicen**
  ese documento: **no inventar ni decidir por cuenta propia.** Se avisa a Noelia
  de la contradicción antes de cambiar nada de información comercial.
- No mezclar características entre planes.
- No atribuir a un plan una funcionalidad que no figure en su información oficial.
- No eliminar funcionalidades incluidas sin su autorización.
- No cambiar precios, plazos, rondas ni extras si ella no lo ha pedido.

## Convenciones al trabajar aquí

- **Fotos y vídeos para webs siempre a tamaño web antes de subir** (no
  "Original"/imprenta). Si una foto pesa más de ~2-3 MB, hay que reducirla
  antes: la subida a GitHub falla por encima de 25 MB, y una web con fotos
  pesadas carga mal en móvil de todas formas.
- **Vídeos largos van a YouTube (no listado) o Vimeo**, nunca como archivo
  suelto en el repositorio — se incrustan con iframe.
- **Despliegue**: cada carpeta de proyecto (`planesweb/`, `cuestionario/`,
  `contrato/`, `bodas/`...)
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
- **Las direcciones oficiales son las de `differentissgood.com`** y ninguna otra:
  `/planesweb/`, `/cuestionario/` y `/bodas/`. A un cliente no se le manda nunca
  una dirección de `github.io` ni ninguna que lleve el nombre de Noelia. Este
  repositorio de previews es un borrador interno y su web no se enseña a nadie.
  Ver `REGLA-MAESTRA.md`.
- **Traspaso a differentissgood.com**: los pasos están en `MIGRACION.md`. IMPORTANTE:
  esto ha dejado de ser "no tocar la web oficial" — Noelia ha autorizado
  expresamente editarla de verdad (19/08). Regla vigente desde entonces, ver
  `REGLA-MAESTRA.md`: `differentissgood.com` es la fuente de identidad visual
  (tipografía, colores, logo real, cabecera, pie, animaciones); bodas, planes
  y cuestionario son URLs propias (`/bodas/`, `/planesweb/`, `/cuestionario/`)
  que se editan cada una por separado y nunca tocan la portada. Este
  repositorio de previews sigue sirviendo como borrador/campo de pruebas, pero
  el destino final de los cambios es siempre DIG (`differentissgood/DIG`), no
  aquí — este sitio no reemplaza a differentissgood.com.
- **La web de previsualización vive en GitHub Pages, no en Cloudflare.**
  Dirección: https://noeliarodriguezcarmona-byte.github.io/differentissgood-previews/
  Se actualiza sola en cuanto se hace push a `main` (workflow
  `.github/workflows/pages.yml`). `differentissgood-previews.workers.dev` es
  una dirección de Cloudflare que en algún momento se usó, pero no está
  conectada a este repositorio: los cambios de aquí no le llegan. Si algún
  día se conecta de verdad (o se decide dejarla de usar), actualizar esta
  nota.
