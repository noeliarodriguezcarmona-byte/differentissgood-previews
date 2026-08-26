# Desplegar la recogida en Netlify

Alternativa a Cloudflare (`DESPLIEGUE.md`). Hace exactamente lo mismo: recoge
los envíos del cuestionario y los deja en el repositorio **privado** `clientes`.

El código está en `recogida/netlify/`.

## Lo que ya está hecho

- **Sitio creado**: `differentissgood-recogida`
  → <https://app.netlify.com/projects/differentissgood-recogida>
  → dirección pública: `https://differentissgood-recogida.netlify.app`
- **Acceso abierto**: venía con «SSO team login» activado, que habría bloqueado
  las llamadas del cuestionario. Desactivado.
- **Variables puestas**:
  - `GITHUB_REPO` = `noeliarodriguezcarmona-byte/clientes`
  - `ORIGENES` = `https://noeliarodriguezcarmona-byte.github.io,https://differentissgood.com`

## Lo que falta (dos pasos, unos 10 minutos)

### 1. Enlazar el sitio con el repositorio

Los archivos no se pueden subir desde la sesión de Claude: la red de ese
entorno bloquea `api.netlify.com`. La solución es mejor que subirlos a mano —
que Netlify los coja del repositorio y se despliegue solo con cada cambio.

En <https://app.netlify.com/projects/differentissgood-recogida>:

1. **Project configuration → Build & deploy → Continuous deployment → Link repository**
2. Elegir **GitHub** → repositorio **`differentissgood-previews`** → rama **`main`**
3. Ajustes de build:
   - **Base directory:** `recogida/netlify`
   - **Build command:** *(vacío)*
   - **Publish directory:** `recogida/netlify/public`
   - **Functions directory:** `recogida/netlify/netlify/functions`
4. **Deploy**

A partir de ahí, cada push a `main` que toque esa carpeta se despliega solo.

### 2. El token de GitHub

Es lo único que no puede hacer nadie más que Noelia: es una llave de escritura
sobre el repositorio privado.

1. Crear el token siguiendo el paso 1 de `DESPLIEGUE.md` (fine-grained, solo el
   repositorio `clientes`, permiso **Contents: Read and write**).
2. En Netlify: **Project configuration → Environment variables → Add a variable**
   - **Key:** `GITHUB_TOKEN`
   - **Value:** el token
   - Marcar **«Contains secret values»**
3. Volver a desplegar (**Deploys → Trigger deploy**) para que la variable entre
   en vigor.

## Comprobar que funciona

Abrir en el navegador:

```
https://differentissgood-recogida.netlify.app/api/estado
```

Tiene que contestar:

```json
{"ok":true,"repo":"noeliarodriguezcarmona-byte/clientes","maxMB":20}
```

Si `repo` sale `null`, faltan variables o falta volver a desplegar.

## Encender la recogida en el cuestionario

Hasta aquí el cuestionario sigue funcionando **solo por correo**. Se enciende
añadiendo al `<form id="cuestionario">` de `cuestionario/index.html`:

```html
data-recogida="https://differentissgood-recogida.netlify.app"
```

Sin ese atributo, la recogida está apagada. Es el interruptor: si algún día da
problemas, se borra el atributo y todo vuelve al correo sin tocar nada más.

## Qué cambia cuando está encendida

- Los archivos del cliente van al repositorio privado, no como adjuntos de
  correo. Se acaba el tope de tamaño del correo (el de la función es 20 MB por
  archivo).
- El correo sigue llegando siempre con todas las respuestas en texto. Es el
  canal garantizado: **si la función falla o tarda, el envío sale por correo con
  los adjuntos y el cliente no ve ningún error.**
- El bloqueo tras enviar deja de vivir solo en el navegador del cliente: la
  función se niega a escribir un segundo `envio.txt` para el mismo código.

## Mantenimiento

- **El token caduca.** Cuando llegue la fecha, se genera otro igual y se cambia
  la variable `GITHUB_TOKEN`.
- Si cambia la dirección del cuestionario, actualizar `ORIGENES`.
- El plan gratuito de Netlify tiene un límite mensual de invocaciones de
  funciones. Para el volumen de un estudio pequeño sobra de largo.
