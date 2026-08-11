# Puesta en marcha del cuestionario

**Gratis, sin tarjeta y sin terminal.** Todo se hace desde el navegador.

Cuando un cliente envía el cuestionario, aparece solo en tu repositorio de GitHub:

```
clientes/
  2026-08-11-panaderia-la-espiga/
    respuestas.md                      ← todo ordenado por bloques
    equipo/
      persona-1-foto-ana-ruiz.jpg
    servicios/
      servicio-1-fotos-pan-masa-madre.jpg
      servicio-2-fotos-bolleria.jpg
    local/
    trabajos/
    testimonios/
    logotipo-logo.svg
```

Y para hacer la web, abres Claude Code en ese repositorio y dices:
*«hazme la web de la panadería con lo que hay en su carpeta»*. Se leen las
respuestas y se ven las fotos directamente. **Tú no descargas ni ordenas nada.**

---

## Los cuatro pasos

### 1. Crear el repositorio

En GitHub → **New repository**

- Nombre: **`clientes`**
- Marca **Private**
- Marca **Add a README file** (hace falta que no esté vacío)
- **Create repository**

### 2. Crear el token

GitHub → tu foto arriba a la derecha → **Settings** → abajo del todo
**Developer settings** → **Personal access tokens** → **Fine-grained tokens**
→ **Generate new token**

- Nombre: `cuestionario`
- Expiration: **No expiration** (o un año, y lo renuevas)
- **Repository access** → *Only select repositories* → elige **`clientes`**
- **Permissions** → *Repository permissions* → busca **Contents** y ponlo en
  **Read and write**
- **Generate token** y **copia el token**. Solo se ve una vez.

> Ese token solo puede escribir en `clientes`. No da acceso a nada más tuyo.

### 3. Crear el Worker

En [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** →
**Create** → **Create Worker**

- Nombre: `cuestionario`
- **Deploy** (crea uno de ejemplo)
- Después **Edit code**: borra todo lo que haya y pega el contenido de
  **`recogida/worker.js`** de este repositorio
- **Deploy** otra vez

Te queda una dirección así, **cópiala**:

```
https://cuestionario.TU-SUBDOMINIO.workers.dev
```

Ahora, en el mismo Worker → **Settings** → **Variables and Secrets** → **Add**:

| Tipo | Nombre | Valor |
|---|---|---|
| Secret | `GITHUB_TOKEN` | el token del paso 2 |
| Text | `GITHUB_REPO` | `noeliarodriguezcarmona-byte/clientes` |
| Text | `ORIGENES` | `https://differentissgood-previews.noeliarodriguezcarmona-a7e.workers.dev` |

En `ORIGENES` van, separadas por comas, las direcciones desde las que se acepta
el cuestionario. Añade tu dominio propio cuando lo tengas.

**Deploy** para que los cambios entren.

### 4. Apuntar el cuestionario al Worker

En `repo-para-github_1/cuestionario.html`, al principio del formulario:

```html
<form id="cuestionario" novalidate
      data-api="https://TU-WORKER.workers.dev">
```

Pon ahí la dirección del paso 3. **Es lo único que se toca en el HTML.**

---

## Comprobar que va

1. Abre `https://TU-WORKER.workers.dev/api/estado` — debe responder
   `{"ok":true,"repo":"noeliarodriguezcarmona-byte/clientes","maxMB":20}`
2. Rellena el cuestionario tú misma con una foto pequeña
3. Mira el repositorio `clientes`: tiene que estar la carpeta con todo dentro

---

## Cómo está pensado para que no se pierda nada

- **Los archivos suben de uno en uno**, no en un envío gigante. Uno pesado no
  tumba el resto.
- **Tres reintentos** por archivo desde el navegador y **dos más** dentro del
  Worker. Un corte de red pasajero no cuesta un envío.
- **El aviso de tamaño salta al elegir el archivo**, no al enviar. El cliente se
  entera al momento, no después de rellenarlo todo.
- **Borrador en su navegador.** Lo que va escribiendo se guarda solo. Si cierra
  la pestaña sin querer, al volver lo encuentra igual.
- **Si algo falla**, se le dice, sus respuestas siguen escritas, puede reintentar
  sin rellenar nada y además puede **descargar sus respuestas** para mandártelas
  por otra vía.

## Límites

- **20 MB por archivo.** Es lo que admite bien la API de GitHub. Fotos,
  logotipos y documentos entran de sobra.
- **Los vídeos largos no caben.** Por eso en la pregunta de testimonios se pide
  primero el **enlace** (Instagram, Drive, YouTube), que es de donde salen casi
  siempre, y adjuntar es la segunda opción.
- GitHub gratuito no pone límite de repositorios privados ni de espacio
  razonable para esto. Si algún repositorio creciera mucho, se archivan las
  carpetas de proyectos ya cerrados.
