# Regla maestra del proyecto Differentissgood

Fijada por Noelia el 19/08. Rige para todo trabajo futuro sobre
`differentissgood.com`, en cualquier sesión que tenga acceso al repositorio
real (`differentissgood/DIG`) — no a este repo de previews.

## La arquitectura

```
differentissgood.com          ← REFERENCIA MAESTRA de identidad visual
├── /                          (home) — nunca se toca para resolver algo de
│                               bodas, planes o cuestionario
├── /bodas/                    — todo lo de bodas, exclusivamente aquí
├── /planesweb/                — todo lo de los planes, exclusivamente aquí
├── /cuestionario/             — página propia, nueva; no está en el menú
                                 (se envía el enlace en privado a cada
                                 cliente, igual que se decidió antes)
└── /contrato/                 — el contrato; tampoco está en el menú
                                 y no se indexa
```

**Regla de enrutado**: "cambia algo de bodas" → `/bodas/`. "Cambia los
planes" → `/planesweb/`. "Cambia el cuestionario" → `/cuestionario/`. "Cambia
la web principal" → `/`. Nunca se traslada un cambio de una URL a otra sin
que se pida explícitamente.

## Contenido distinto, identidad única

Las tres páginas secundarias no son una copia de la home, pero tienen que
sentirse hechas por el mismo estudio. Antes de tocar cualquiera de las tres,
inspeccionar primero `differentissgood.com` y sacar de ahí (no inventar ni
reutilizar lo que ya hubiera en bodas/planes antes de esta regla, que tenía
un lenguaje visual más simple):

- Tipografía exacta (`font-family`, pesos, tamaños, `letter-spacing`,
  `line-height`) — no sustituir ni añadir fuentes nuevas sin motivo.
- Paleta, fondos, espaciados grandes ("que respiren"), márgenes generosos.
- Titulares con protagonismo real, jerarquía número/categoría → título →
  descripción → contenido.
- El mismo lenguaje de animación (reveal, fade, scroll, parallax sutil,
  hover) — con elegancia, nunca "porque sí". Respetar
  `prefers-reduced-motion`, usar `transform`/`opacity`.
- Cabecera y pie con el mismo lenguaje que la home (logo, posición, menú,
  comportamiento al hacer scroll, versión móvil) — pero sin que un
  componente compartido rompa una página al tocar otra.

## Logo: nunca se recrea

Usar el archivo real de la web oficial (SVG o PNG, con sus variantes de
color/tamaño si las hay), sacado del repositorio DIG. No volver a
escribirlo con una fuente parecida, no redibujarlo, no crear una versión
alternativa "que se parezca".

## Cuestionario

Experiencia interactiva paso a paso (progreso, transiciones, validación,
resumen final), nunca un formulario tipo Google Forms. Perfecto en móvil.
Sigue sin enlazarse desde el menú de ningún sitio — se manda por privado.

## Antes de programar cualquier cambio

1. Inspeccionar `differentissgood.com`.
2. Inspeccionar la página secundaria que se va a tocar.
3. Localizar en el repositorio: logo, fuentes, CSS, componentes,
   animaciones, assets, estructura de navegación.
4. Ver qué se puede reutilizar sin arriesgar romper otra página.
5. Desarrollar.
6. Comprobar: ¿esto parece Differentissgood? ¿misma tipografía, mismo
   logo, mismos espacios, mismo nivel de diseño, misma cabecera, mismo
   pie, buena experiencia en móvil? Si la respuesta es no en algo, seguir
   ajustando antes de dar por terminado.

## Nota sobre esta sesión

Esta regla se fijó en una sesión que no tiene acceso ni a
`differentissgood.com` ni al repositorio `differentissgood/DIG` (solo a
`differentissgood-previews`). La ejecución real de esta regla ocurre en
la sesión de Claude Code que sí tiene DIG como fuente — actualmente:
`session_01JkTo5Kv93FMwBDoouifer5` ("Differentissgood — llevar planes,
cuestionario y bodas a DIG"). Este archivo queda aquí como registro, no
como sitio de trabajo.
