# Recogida del cuestionario — puesta en marcha

Todo lo que envían los clientes se guarda en **tu propio almacén de Cloudflare (R2)**
y a ti te llega un correo con las respuestas y los enlaces a los archivos.

Sin límite de tamaño por servicios de terceros, sin cuota de envíos y sin que los
datos de tus clientes pasen por nadie más.

---

## Lo que hay que hacer una sola vez

### 1. Crear el almacén

En [dash.cloudflare.com](https://dash.cloudflare.com) → **R2** → **Create bucket**

- Nombre: **`cuestionarios`**
- Ubicación: la que te ofrezca por defecto

Si es la primera vez que usas R2 te pedirá activar el servicio. El plan gratuito
da 10 GB de almacenamiento, de sobra para esto.

### 2. Preparar el correo de aviso

El aviso se manda con **Resend**, que da 3.000 correos al mes gratis.

1. Crea la cuenta en [resend.com](https://resend.com)
2. **Domains** → **Add domain** → escribe `differentissgood.com`
3. Te da tres registros DNS. Añádelos en Cloudflare → tu dominio → **DNS**
4. Cuando Resend marque el dominio como *Verified*, ve a **API Keys** → **Create**
   y copia la clave (empieza por `re_`)

> Si prefieres no tocar el DNS todavía, cambia `CORREO_ORIGEN` en `wrangler.toml`
> por `onboarding@resend.dev`. Funciona sin verificar nada, pero **solo puede
> enviarte correo a ti misma** y acaba en spam con más facilidad. Para trabajar
> en serio, verifica el dominio.

### 3. Desplegar el Worker

Desde esta carpeta, en un terminal:

```bash
npx wrangler login       # abre el navegador y te identifica
npx wrangler deploy
```

Al terminar te da una dirección parecida a:

```
https://cuestionario-differentissgood.TU-SUBDOMINIO.workers.dev
```

**Cópiala, la necesitas en el paso 5.**

### 4. Guardar las dos claves secretas

```bash
npx wrangler secret put RESEND_API_KEY
# pega la clave de Resend y pulsa Enter

npx wrangler secret put FIRMA
# inventa una frase larga, cualquiera, y guárdala por si acaso
# ej: "la panaderia de la esquina abre a las siete y media"
```

`FIRMA` es lo que hace que los enlaces de descarga solo funcionen para ti: quien
no tenga la firma correcta no puede bajar los archivos aunque adivine la dirección.

### 5. Apuntar el cuestionario al Worker

En `repo-para-github_1/cuestionario.html`, busca esta línea (está al principio
del formulario, señalada con un comentario):

```html
<form id="cuestionario" novalidate
      data-api="https://cuestionario-differentissgood.TU-SUBDOMINIO.workers.dev">
```

Sustituye la dirección por la tuya del paso 3. **Es lo único que hay que tocar.**

---

## Comprobar que funciona

Abre en el navegador:

```
https://TU-WORKER.workers.dev/api/estado
```

Tiene que responder `{"ok":true,"servicio":"cuestionario"}`.

Después rellena el cuestionario tú misma con un archivo pequeño y mira que te
llega el correo.

---

## Dónde queda todo

En R2, dentro del bucket `cuestionarios`:

```
envios/
  2026-08-11-09-14-22-a1b2c3d4/
    respuestas.json          ← todas las respuestas
    resumen.html             ← lo mismo, para leerlo cómodo
    archivos/
      Persona 1 · Foto/…
      Servicio 1 · Fotos/…
```

Puedes verlo y descargarlo también desde el panel de Cloudflare → R2 →
`cuestionarios`, sin depender del correo.

---

## Cómo está pensado para que no se pierda nada

- **Se guarda antes de avisar.** Primero entra en R2, después se intenta el
  correo. Si el correo falla, el cuestionario ya está a salvo y queda anotado en
  `correo-fallido.json` dentro de la carpeta del envío.
- **Reintentos.** Cada subida se reintenta tres veces con pausas crecientes, y el
  correo dos. Un corte de red pasajero no cuesta un envío.
- **Borrador en el navegador del cliente.** Lo que va escribiendo se guarda solo.
  Si cierra la pestaña sin querer, al volver lo encuentra tal como lo dejó.
- **Si algo falla, se dice.** El cliente ve el aviso, sus respuestas siguen ahí y
  puede reintentar sin rellenar nada de nuevo.
- **Los archivos van de uno en uno**, no en un envío gigante. Así un archivo
  pesado no tumba el resto.

## Límites

- **95 MB por archivo.** Se cambia en `MAX_MB` dentro de `wrangler.toml`.
  El tope del Worker gratuito es 100 MB por petición.
- Solo se aceptan envíos desde las direcciones listadas en `ORIGENES`. Añade ahí
  tu dominio propio cuando lo tengas.
