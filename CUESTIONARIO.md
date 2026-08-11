# Puesta en marcha del cuestionario

**Gratis, sin tarjeta y sin terminal.** Dos pasos y ya está en marcha.

## Cómo funciona

1. El cliente rellena el cuestionario. Al enviarlo, **las respuestas te
   llegan por correo** a `projectmanager@differentissgood.com` — sin fallos,
   porque es solo texto y el texto nunca pesa demasiado.
2. Si el cliente tiene fotos, logotipo o vídeos, en la misma pantalla de
   confirmación le sale un botón — **«Subir mis fotos y vídeos»** — que lo
   lleva a una carpeta compartida donde los arrastra, sin registrarse en
   nada y sin límite de tamaño.
3. Debajo del botón ve la **lista exacta de lo que tiene que subir**, con el
   nombre que le hemos puesto a cada archivo (por ejemplo
   `2026-08-11-panaderia-la-espiga-equipo-ana-ruiz`). Esa misma lista te
   llega también a ti por correo, así sabes qué buscar en la carpeta.
4. Tú entras en la carpeta, te descargas lo que haya y lo arrastras a tu
   repositorio de GitHub. Abres Claude Code ahí y dices *«hazme la web con
   lo que hay en esta carpeta»*.

---

## Los dos pasos

### 1. Crear la carpeta para subir archivos

Recomendamos **Dropbox** — es gratis, no pide tarjeta y el cliente no
necesita cuenta para dejar archivos ahí.

1. Entra en [dropbox.com](https://www.dropbox.com) y crea una cuenta
   gratuita (con tu correo, sin tarjeta).
2. En el panel, busca **«Solicitudes de archivos»** (*File requests*) →
   **Crear una solicitud de archivos**.
3. Ponle un nombre, por ejemplo `Cuestionario Differentissgood`, y **crea la
   solicitud**.
4. Te da un enlace del tipo `https://www.dropbox.com/request/XXXXXXXXXX`.
   **Cópialo.**

Con el plan gratuito te avisa por correo cada vez que alguien sube algo, y
puedes ver y descargar los archivos en cualquier momento desde Dropbox.

> Si prefieres otra cosa (Google Drive con «cualquiera con el enlace puede
> subir», WeTransfer...), vale igual: solo hace falta un enlace donde se
> pueda dejar un archivo sin cuenta.

### 2. Pegar el enlace en el cuestionario

Abre **`repo-para-github_1/cuestionario.html`**, busca el `<form>` (al
principio del archivo, justo después del aviso de las «tres cosas») y
rellena `data-archivos` con el enlace del paso 1:

```html
<form id="cuestionario" novalidate
      data-correo="projectmanager@differentissgood.com"
      data-archivos="https://www.dropbox.com/request/XXXXXXXXXX">
```

Guarda, sube el cambio a GitHub y ya está — no hace falta tocar nada más.

Mientras `data-archivos` esté vacío, si el cliente tiene algo que subir, la
pantalla final le pide que te lo mande por correo en vez de darle el botón.
El cuestionario funciona igual de bien sin este paso; solo que sin la
carpeta el cliente tiene que mandarte las fotos aparte.

---

## Comprobar que va

1. Rellena el cuestionario tú misma con un par de respuestas.
2. Al enviarlo debe aparecer la pantalla «Respuestas recibidas» con el
   botón de subir archivos (si marcaste alguno) y su lista.
3. Revisa que te llegue el correo a `projectmanager@differentissgood.com`.

## Por qué es así de simple

- **Nada que instalar ni configurar en un servidor.** El correo lo manda un
  servicio externo (formsubmit.co) que ya está conectado; la carpeta de
  archivos es Dropbox, con cuenta gratuita.
- **No hay límite de tamaño que pueda fallar.** El correo solo lleva texto;
  los archivos, sean del tamaño que sean, van a la carpeta.
- **Borrador en su navegador.** Lo que el cliente va escribiendo se guarda
  solo. Si cierra la pestaña sin querer, al volver lo encuentra igual.
- **Si el envío del correo falla**, se le dice, sus respuestas siguen
  escritas, puede reintentar sin rellenar nada y además puede **descargar
  sus respuestas** para mandártelas por otra vía.

## La ruta automática, para más adelante

En la carpeta `recogida/` queda montado un sistema más avanzado: un Worker
de Cloudflare que, en vez de mandar un correo, deja las respuestas **y los
archivos** ya ordenados dentro de un repositorio de GitHub, listos para que
Claude Code los lea directamente. Es gratis y sin tarjeta, pero tiene más
pasos de configuración (crear un token, crear el Worker, apuntarlo). Si más
adelante quieres automatizarlo del todo, esa pieza ya está lista — dímelo y
retomamos esos pasos.
