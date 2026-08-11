# Puesta en marcha del cuestionario

**Gratis, sin tarjeta y sin que en ningún momento tengas que pagar.**

Los archivos que suben los clientes van a **Cloudinary** y a ti te llega un correo
a `projectmanager@differentissgood.com` con todas las respuestas y un enlace por
cada archivo.

---

## Por qué así y no con adjuntos

El correo tiene un tope duro de 25 MB por mensaje. Un cuestionario con fotos del
equipo, fotos de cada servicio y vídeos de testimonios se va fácilmente a 200 MB:
por correo **nunca** iba a llegar, se pagara lo que se pagara.

Por eso los archivos van a un almacén y el correo lleva solo los enlaces. Así el
correo pesa unos kilobytes y llega siempre.

---

## Lo que hay que hacer, una sola vez (5 minutos)

### 1. Crear la cuenta

Entra en **[cloudinary.com](https://cloudinary.com)** → *Sign up for free*.

No pide tarjeta. El plan gratuito da **25 GB de almacenamiento** y 25 GB de
tráfico al mes, que para esto sobra de largo.

### 2. Copiar tu «cloud name»

Nada más entrar, en el panel verás **Cloud Name**. Es una palabra corta, algo como
`dq8x2vabc`. Cópiala.

### 3. Crear el preset de subida

Este es el paso que permite que los clientes suban archivos **sin tener cuenta**.

1. Arriba a la derecha, el engranaje → **Settings**
2. Pestaña **Upload**
3. Baja hasta **Upload presets** → **Add upload preset**
4. Ponle de nombre `cuestionario`
5. En **Signing Mode** elige **Unsigned** ← importante
6. En **Folder** escribe `cuestionarios`
7. **Save**

### 4. Pegar los dos datos en el cuestionario

En `repo-para-github_1/cuestionario.html`, al principio del formulario:

```html
<form id="cuestionario" novalidate
      data-cloud="TU-CLOUD-NAME"
      data-preset="TU-UPLOAD-PRESET"
      data-correo="projectmanager@differentissgood.com">
```

Sustituye `TU-CLOUD-NAME` por lo del paso 2 y `TU-UPLOAD-PRESET` por `cuestionario`.
**Es lo único que hay que tocar en todo el archivo.**

### 5. Activar el correo

La primera vez que se envíe el cuestionario, formsubmit te manda un correo de
confirmación a `projectmanager@differentissgood.com`. Ábrelo y pulsa el enlace.
A partir de ahí ya llegan todos, sin cuenta ni configuración.

---

## Cómo comprobar que va

Rellena el cuestionario tú misma con una foto pequeña y mira que:

1. Sale la pantalla de «Recibido»
2. Te llega el correo con las respuestas y los enlaces
3. En Cloudinary → **Media Library** → carpeta `cuestionarios` está todo

---

## Dónde queda cada cosa

En Cloudinary, dentro de `cuestionarios`:

```
cuestionarios/
  2026-08-11-09-14-22-a1b2c3/
    Persona 1  Foto/       ← el retrato de cada persona
    Servicio 1  Fotos/     ← las fotos de cada servicio
    Vídeos de testimonios/
    respuestas/            ← copia del cuestionario en texto
```

Cada envío en su carpeta, con la fecha delante para que salgan ordenados.

---

## Cómo está pensado para que no se pierda nada

- **Los archivos suben de uno en uno**, no en un envío gigante. Uno pesado no
  tumba el resto.
- **Tres reintentos** por archivo, con pausas crecientes. Un corte de red
  pasajero no cuesta un envío.
- **Copia de seguridad automática.** Además de los archivos, se sube el
  cuestionario entero en texto. Aunque el correo fallara, la información sigue
  estando en tu Cloudinary.
- **Si el correo falla**, al cliente se le dice, se le da el envío por recibido
  (sus archivos ya están) y se le ofrece **descargar sus respuestas** para
  mandártelas por otra vía.
- **Borrador en su navegador.** Lo que va escribiendo se guarda solo. Si cierra
  la pestaña sin querer, al volver lo encuentra tal como lo dejó.
- **Si algo falla del todo**, sus respuestas siguen escritas y puede reintentar
  sin rellenar nada de nuevo.

---

## Lo que conviene saber

**El preset sin firma es público.** Va escrito en la página, así que alguien que
lo mirase podría subir archivos a tu Cloudinary. En la práctica el riesgo es bajo
—la dirección del cuestionario no está indexada—, pero si quieres cerrarlo más:
en el preset puedes limitar los formatos permitidos y el tamaño máximo por
archivo, dentro de *Settings → Upload → tu preset*.

**Si algún día se llenan los 25 GB**, entra en Media Library y borra las carpetas
de proyectos ya cerrados. Nunca te va a cobrar sin que tú lo autorices: el plan
gratuito no se convierte solo en uno de pago.
