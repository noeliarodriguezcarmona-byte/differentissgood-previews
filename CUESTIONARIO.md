# Puesta en marcha del cuestionario

**Gratis, sin tarjeta, sin terminal y sin nada que configurar.** Ya está en
marcha tal cual está en este repositorio.

## Cómo funciona

1. El cliente rellena el cuestionario. Cada foto o archivo se adjunta **en
   su propia pregunta** — el logotipo en «Logotipo», el retrato de cada
   persona en su ficha, la foto de cada servicio en la suya, etc. No hay que
   escribir ningún nombre de archivo: el campo ya dice qué es.
2. Al enviar, **te llega un único correo** a `info.differentissgood@gmail.com`
   con todas las respuestas en texto y todos los archivos adjuntos — sin
   pasos intermedios, sin carpetas compartidas y sin depender de que el
   cliente suba nada por su cuenta.
3. Al final del correo hay un listado «ARCHIVOS ADJUNTOS EN ESTE CORREO» con
   la etiqueta de cada uno (de qué pregunta viene), así sabes qué es cada
   imagen de un vistazo.
4. Con eso ya tienes todo para construir la web: le pasas el correo (texto e
   imágenes) a Claude Code y le dices que arranque con lo que hay ahí.

---

## Los archivos pesados (vídeos, muchas fotos juntas)

El correo tiene un límite de peso razonable — cada archivo debería pesar
menos de 8 MB. Si un archivo pasa de ahí, el cuestionario avisa al cliente
antes de enviar, y si el envío falla por peso, se lo dice claramente y le
pide que:

- Suba el archivo a **Google Drive o WeTransfer** (gratis, sin cuenta) y
  pegue el enlace en el campo «¿Algo más que no encaje arriba, o que pese
  demasiado para adjuntar?».
- Para vídeos de testimonios, el cuestionario ya pide directamente un
  enlace en vez de subir el archivo.

## Comprobar que va

1. Rellena el cuestionario tú misma, con un par de fotos de prueba.
2. Al enviarlo debe aparecer la pantalla «Respuestas recibidas» con la
   lista de archivos enviados.
3. Revisa que te llegue el correo a `info.differentissgood@gmail.com`, con
   las respuestas y las fotos adjuntas.

## Por qué es así de simple

- **Nada que instalar ni configurar.** El correo, con archivos adjuntos
  incluidos, lo manda un servicio externo (formsubmit.co) que ya está
  conectado.
- **Un único sitio donde mirar.** Todo llega junto, en el mismo correo — no
  hay que entrar en Dropbox ni ninguna otra carpeta a buscar qué ha subido
  cada cliente.
- **Sin ambigüedad.** Cada archivo va pegado a la pregunta que lo pide, así
  que no hace falta que el cliente adivine cómo llamarlo ni tú adivines de
  qué foto se trata.
- **Borrador en su navegador.** Lo que el cliente va escribiendo se guarda
  solo. Si cierra la pestaña sin querer, al volver lo encuentra igual (los
  archivos adjuntados no se recuperan si cierra sin enviar, pero sí el
  texto).
- **Si el envío falla**, se le dice, sus respuestas siguen escritas, puede
  reintentar sin rellenar nada y además puede **descargar sus respuestas**
  para mandártelas por otra vía.

## La ruta automática, para más adelante

En la carpeta `recogida/` queda montado un sistema más avanzado: un Worker
de Cloudflare que, en vez de mandar un correo, deja las respuestas y los
archivos ya ordenados dentro de un repositorio de GitHub, listos para que
Claude Code los lea directamente sin que tengas que descargar nada a mano.
Es gratis y sin tarjeta, pero tiene más pasos de configuración (crear un
token, crear el Worker, apuntarlo) y solo merece la pena si el volumen de
cuestionarios crece mucho. Si más adelante te interesa, dímelo y retomamos
esos pasos.
