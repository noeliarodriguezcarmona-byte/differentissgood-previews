# Llevar estas webs a differentissgood.com

Objetivo: que los planes, el cuestionario y bodas dejen de vivir en una
dirección aparte (`…workers.dev`) y pasen a servirse desde el mismo sitio y el
mismo dominio que la web oficial, con su misma tipografía y sus mismos colores.

El trabajo va en dos mitades. **La primera ya está hecha en este repositorio.**

---

## Mitad 1 — hecha aquí (repositorio `differentissgood-previews`)

Todas las páginas se han dejado preparadas para encajar en la web oficial sin
tocarlas una a una:

- **`assets/marca.css` es ahora la única hoja de marca.** Define tipografías,
  paleta, la barra superior y el pie. Todas las páginas la cargan.
- **Las paletas sueltas han desaparecido.** Cada página traduce sus variables
  internas (`--bg`, `--ink`, `--accent`, `--serif`…) a los tokens `--dig-*` de
  la hoja de marca. Ya no hay colores repetidos en cinco sitios.
- **Una sola tipografía en todo:** Fraunces para titulares, Inter para texto.
  Se han retirado Iowan Old Style (bodas) y Playfair Display (plan Élite).
  *Excepción a propósito:* en el cuestionario, los borradores de estilo web
  (`.borrador-web--clasica/moderna/artesanal`) siguen con tipografías distintas,
  porque ahí la tipografía **es** lo que se le está enseñando al cliente.
- **Barra superior compartida (`.dig-barra`)** en las 12 páginas: la marca
  siempre lleva a `differentissgood.com`, y al lado están Inicio, Planes, Bodas
  y Cuestionario. Es el hilo que las convierte en una sola web.
- **Pie compartido (`.dig-pie`)** en las 12 páginas, con los mismos enlaces y
  los mismos datos de contacto.
- **Las cabeceras fijas de cada página se han bajado `--dig-barra-h`** para no
  quedar debajo de la barra, y las portadas a pantalla completa le restan esa
  altura. Comprobado en Chromium en las 8 páginas principales: sin errores de
  JavaScript y sin desbordamiento horizontal.

### Lo que queda pendiente y por qué

**La paleta actual es provisional.** Desde la sesión donde se preparó esto no se
podía abrir `differentissgood.com` (el proxy de red la bloquea) ni leer el
repositorio `differentissgood/DIG` (sólo admitía repositorios de
`noeliarodriguezcarmona-byte`). Así que los valores de color que hay ahora son
los que ya usaba `plan-impulso.html`, que era la página más parecida a la web
oficial — no están copiados de ella.

Cambiarlos es **una sola edición**: el bloque `TOKENS DE MARCA` al principio de
`assets/marca.css`. Nada más. Todo lo demás lo hereda.

---

## Mitad 2 — a hacer desde una sesión con el repositorio `differentissgood/DIG`

### 1. Sacar la marca real de la web oficial

En el CSS de DIG, buscar y apuntar:

- Las familias tipográficas reales (y de dónde se cargan: Google Fonts, archivos
  propios en `/assets/fonts`…).
- El color de fondo, el de texto, el de acento y el de las líneas.
- Si la web oficial es clara, oscura, o tiene interruptor.

### 2. Traer estas webs al repositorio de DIG

El repositorio de previews es público, así que se puede clonar sin permisos
especiales:

```bash
git clone https://github.com/noeliarodriguezcarmona-byte/differentissgood-previews /tmp/previews
```

Y colocarlo dentro de DIG conservando la profundidad de carpetas, que es de lo
que dependen las rutas relativas (`../assets/marca.css`):

| De (previews)          | A (DIG)         |
|------------------------|-----------------|
| `repo-para-github_1/`  | `planes/`       |
| `bodas/`               | `bodas/`        |
| `assets/marca.css`     | `assets/marca.css` |
| `assets/logo.png`      | `assets/logo.png` (¡ojo, ver abajo!) |
| `assets/logo-claro.png`| `assets/logo-claro.png` |

`assets/` de DIG ya existe (ahí están `logo.png`, `og-cover.jpg`, `clients/…`),
así que `marca.css` se suma a esa carpeta; no la sustituye.

**Cuidado con `logo.png`**: en DIG ya hay un archivo con ese nombre. El de aquí
es el logotipo recortado sin fondo. NO sobreescribas el de DIG. Si chocan,
renombra los de aquí (por ejemplo `logo-web.png` y `logo-web-claro.png`) y
cambia las dos líneas `--dig-logo` de `assets/marca.css`. Comprueba también si
el `logo.png` que ya tiene DIG es transparente: si lo es y se ve bien sobre
fondo claro y oscuro, mejor usar ése y borrar los de aquí.

El `index.html` de la raíz de previews **no se copia**: en DIG la portada es la
de la web oficial. Sus enlaces se reparten entre la navegación de DIG y la barra
compartida.

### 3. Rellenar los tokens con los valores reales

Sustituir el bloque `TOKENS DE MARCA` de `assets/marca.css` por los valores
sacados en el paso 1. Con eso, planes, cuestionario y bodas quedan con la letra
y los colores de la web oficial de golpe.

Si la web oficial es oscura, basta con poner los valores oscuros en el bloque
principal y los claros en el de `data-tema="claro"`: la estructura ya está.

### 4. Repasar las rutas

Al pasar `repo-para-github_1/` a `planes/`, hay que actualizar los `href` que
nombran la carpeta vieja:

```bash
grep -rn "repo-para-github_1" planes/ bodas/ assets/
```

Y comprobar que la barra apunta a las direcciones definitivas
(`/planesweb/`, `/bodas/`, `/cuestionario/`).

### 5. Enganchar la navegación de la web oficial

Añadir en el menú de DIG los enlaces a Planes y a Bodas, para que se llegue
desde la portada y no sólo desde la barra.

### 6. Lo que hay que dejar de usar

- La dirección `…workers.dev` deja de ser la que se enseña a los clientes.
- El flujo `.github/workflows/pages.yml` de previews sobra en cuanto las
  páginas se sirvan desde DIG.
- El Worker de `recogida/` **sí sigue haciendo falta**: es el que recoge los
  envíos del cuestionario. Hay que añadir el dominio nuevo a su variable
  `ORIGENES`, o dejará de aceptar los envíos por CORS.

---

## Comprobación final

Con las páginas ya en DIG:

1. Que la barra y el pie se vean iguales en las 12 páginas.
2. Que los titulares usen la tipografía de la web oficial, no la de reserva.
3. Que la marca de la barra lleve a la portada oficial desde todas.
4. Que el cuestionario envíe de verdad (paso 6: `ORIGENES` del Worker).
5. En móvil: que la barra no tape la cabecera de cada página.
