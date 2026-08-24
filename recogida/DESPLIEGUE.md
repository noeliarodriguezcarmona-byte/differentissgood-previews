# Desplegar la recogida del cuestionario

El Worker recoge lo que envía el cuestionario y lo deja en el repositorio
**privado** `clientes`, dentro de la carpeta del código de proyecto:

```
proyectos/DIG-2026-001-I/
  envio.txt                 el envío tal y como llegó
  archivos/logotipo-….png
  archivos/equipo/…
```

De ahí sale el brief con `node _herramientas/generar-brief.mjs proyectos/DIG-2026-001-I/envio.txt`.

**Esto hay que hacerlo desde tu cuenta.** Yo no puedo: este entorno tiene la red
de Cloudflare bloqueada por política (`api.cloudflare.com` y `dash.cloudflare.com`
responden 403), no hay `wrangler` instalado ni credenciales tuyas, y el token de
GitHub que hace falta debes crearlo tú — no debo manejarlo yo.

Son unos 10 minutos y no hace falta terminal ni tarjeta.

---

## 1. Crear el token de GitHub

1. GitHub → foto de perfil → **Settings** → abajo del todo **Developer settings**.
2. **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
3. Rellena:
   - **Token name:** `recogida-cuestionario`
   - **Expiration:** 1 año (apúntate la fecha: hay que renovarlo)
   - **Repository access:** *Only select repositories* → **`clientes`**
     (solo ese: si el token se filtrara, no llega a ningún otro sitio)
   - **Permissions** → *Repository permissions* → **Contents: Read and write**
4. **Generate token** y **copia el token ahora** — no se vuelve a enseñar.

## 2. Crear el Worker

1. Entra en <https://dash.cloudflare.com> (cuenta gratuita, no pide tarjeta).
2. **Workers & Pages** → **Create** → **Start with Hello World!** → **Deploy**.
3. Ponle de nombre `recogida-cuestionario`.
4. **Edit code**, borra todo lo que haya y pega entero el contenido de
   `recogida/worker.js` de este repositorio. **Deploy**.
5. Apunta la dirección que te da, del estilo
   `https://recogida-cuestionario.TU-CUENTA.workers.dev`.

## 3. Configurar las variables

En el Worker → **Settings** → **Variables and Secrets** → **Add**:

| Nombre | Tipo | Valor |
|---|---|---|
| `GITHUB_TOKEN` | **Secret** | el token del paso 1 |
| `GITHUB_REPO` | Text | `noeliarodriguezcarmona-byte/clientes` |
| `ORIGENES` | Text | `https://noeliarodriguezcarmona-byte.github.io,https://differentissgood.com` |

`ORIGENES` son las direcciones desde las que se acepta un envío, separadas por
comas y **sin barra al final**. Si el cuestionario acaba en otra dirección, hay
que añadirla aquí o el navegador rechazará el envío.

**Deploy** otra vez para que las variables entren en vigor.

## 4. Comprobar que responde

Abre en el navegador:

```
https://recogida-cuestionario.TU-CUENTA.workers.dev/api/estado
```

Tiene que contestar algo así:

```json
{"ok":true,"repo":"noeliarodriguezcarmona-byte/clientes","maxMB":20}
```

Si `repo` sale `null`, las variables no se guardaron o falta volver a desplegar.

## 5. Encender la recogida en el cuestionario

Hasta aquí el cuestionario sigue funcionando **solo por correo**, exactamente
igual que ahora. Se enciende con una sola línea: en `cuestionario.html`, en la
etiqueta `<form id="cuestionario" …>`, se añade

```html
data-recogida="https://recogida-cuestionario.TU-CUENTA.workers.dev"
```

Sin ese atributo, la recogida está apagada. Es el interruptor: si algún día da
problemas, se borra el atributo y todo vuelve al correo sin tocar nada más.

---

## Qué cambia cuando está encendida

- Los archivos del cliente van al repositorio privado, no como adjuntos de
  correo. Se acaba el tope de tamaño del correo (el del Worker es 20 MB por
  archivo).
- El correo te sigue llegando siempre, con todas las respuestas en texto. Es el
  canal garantizado: **si el Worker falla, el envío sale por correo con los
  adjuntos, como hasta ahora, y el cliente no ve ningún error.**
- El bloqueo tras enviar deja de vivir solo en el navegador del cliente. El
  Worker se niega a escribir un segundo `envio.txt` para el mismo código, y el
  cuestionario consulta ese estado al meter el código. Si un cliente vuelve
  desde otro móvil, le sale la pantalla de «Cuestionario recibido».
- Ante un fallo de red al comprobar, **nunca** se bloquea a nadie: se le deja
  pasar y contestar.

## Qué NO cambia

- El repositorio `clientes` sigue siendo privado y es el único sitio donde hay
  datos personales.
- Nada de esto toca la portada, bodas, las páginas de planes ni el contrato.
- El brief se sigue generando a mano, desde tu ordenador. El Worker no genera
  ni interpreta nada: solo guarda el envío tal cual.

## Mantenimiento

- **El token caduca.** Cuando llegue la fecha, se genera otro igual y se cambia
  el secreto `GITHUB_TOKEN` en el Worker.
- Si cambia la dirección del cuestionario, hay que actualizar `ORIGENES`.
