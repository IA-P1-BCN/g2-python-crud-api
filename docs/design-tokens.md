# Design tokens del frontend

Fichero de tokens: `src/styles/theme.css` (Tailwind CSS v4, un único sitio donde viven los valores de diseño).

**Origen:** archivo de Figma «Wireframes-Athletica (Copia)». Ese archivo no tiene variables de Figma: Stitch dejó todos los valores escritos a mano. Por eso estos tokens se han extraído de los valores usados y se han normalizado. Se leyeron valor a valor las pantallas Login, Inicio entrenador y Dashboard admin. Inicio socio y Sesiones se comprobaron solo visualmente.

## Cómo usarlos

```tsx
<div className="bg-surface rounded-card p-6 text-text">
  <p className="font-display text-metric text-primary">248</p>
  <p className="text-caption text-text-muted uppercase tracking-wide">Socios</p>
</div>
```

Reglas:

- Nada de colores hex ni valores arbitrarios (`p-[10px]`, `text-[#d4f55a]`) en componentes.
- Si falta un valor, se añade al `theme.css` y se documenta aquí.
- Solo hay modo oscuro.

## Colores

| Token | Valor | Uso |
|---|---|---|
| `canvas` | `#17181A` | Fondo de la app |
| `surface` | `#26282B` | Tarjetas y paneles |
| `surface-sunken` | `#1B1C1E` | Inputs y bloques anidados |
| `line` | `#33363A` | Bordes y pistas de barras de progreso |
| `ink` | `#121315` | Texto e iconos sobre `primary` |
| `text` / `text-soft` / `text-muted` | `#FFFFFF` / `#E3E2E4` / `#9A9CA1` | Texto |
| `primary` / `primary-soft` | `#D4F55A` / 15 % | Estados activos, acción principal |
| `secondary` | `#4B63E0` | Tarjetas destacadas |
| `secondary-mid` / `secondary-strong` | `#3A50C7` / `#233391` | Chips sobre tarjetas azules |
| `secondary-soft` | `#BAC3FF` | Segunda serie de gráficos |
| `success` | `#4ADE80` | Positivo, en curso |
| `danger` / `danger-soft` / `danger-surface` | `#F87171` / 20 % / `#241517` | Errores y avisos |
| `warning` | `#FBBF24` | Avisos y estados de atención |
| `glow` / `scrim` | `#3A4420` / negro 25 % | Decoración |

### Unificación de las dos paletas

Las pantallas usan dos paletas distintas. Se ha elegido la de Login, Inicio entrenador, Inicio socio y Sesiones (4 de 5 pantallas) y se normaliza el Dashboard admin a ella:

| Dashboard admin (original) | Token final |
|---|---|
| `#121315` fondo | `canvas` |
| `#292A2C`, `#343537` | `surface`, `line` |
| `#1F2022` | `surface-sunken` |
| `#CFF056` | `primary` |
| `#1C39B8` | `secondary` |
| `#BAC3FF` | `secondary-soft` |
| `#C6C9B0`, `#8F937D` | `text-muted` |
| `#FFB4AB` | `danger` |
| `#93000A` con texto `#FFDAD6` | `danger-soft` con texto `danger` |

## Tipografía

Familias: **Space Grotesk** (`font-display`: números, títulos y etiquetas) e **Inter** (`font-sans`: texto corrido).

| Token | Tamaño / interlínea | Valores originales agrupados |
|---|---|---|
| `text-caption` | 11 / 16 | 10, 11 |
| `text-small` | 12 / 16 | 12 |
| `text-body` | 14 / 20 | 13, 14 |
| `text-lead` | 18 / 24 | 18 |
| `text-title` | 20 / 28 | 20, 22 |
| `text-headline` | 24 / 32 | 24, 26 |
| `text-display` | 32 / 40 | 28, 32 |
| `text-metric` | 36 / 44 | 36 |
| `text-hero` | 48 / 48 | 48 |

Pesos: 400, 600 y 700. Espaciado de letras: `tracking-tight` en títulos grandes y `tracking-wide` (0,05 em) en etiquetas en mayúsculas.

## Espaciado, márgenes y padding

Escala permitida (paso de 4 px): **4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64** (`1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16` en clases Tailwind).

Regla de normalización: se redondea al valor más cercano de esa escala y los empates suben. Los valores menores de 2 px son restos de Stitch y se eliminan.

| Valor en Figma | Valor final |
|---|---|
| 0.6 / 0.75 / 1 | 0 (o `border`) |
| 2 / 2.9 / 3.5 / 4 / 5.25 | 4 |
| 6 / 8 / 9.5 / 10 | 8 / 8 / 8 / 12 |
| 11.75 / 12 / 12.5 | 12 |
| 14 / 15.25 / 16 / 17 | 16 |
| 20 / 25 | 20 / 24 |
| 28 / 32 | 32 |
| 45 (relleno izquierdo de inputs con icono) | 44 |

Tamaños de iconos: 16 (`size-4`), 20 (`size-5`) y 24 (`size-6`). Avatares: 32, 40 y 56 (`size-8`, `size-10`, `size-14`). Altura mínima táctil: 44 px (`min-h-11`).

## Formas

| Token | Valor | Uso |
|---|---|---|
| `rounded-tile` | 16 px | Teselas pequeñas y barras de gráficos |
| `rounded-card` | 32 px | Tarjetas, paneles y hojas inferiores |
| `rounded-full` | pill | Botones, inputs, chips y avatares (agrupa los 48 px y 9999 px originales) |

Sombras: se usan las de Tailwind por defecto. Se añade `shadow-glow-primary` para el botón principal.

## Inconsistencias del Figma para resolver

1. **Dos paletas** (arriba). Ya unificadas en los tokens, pero hay que repintar el Dashboard admin en Figma.
2. **Navegación inferior distinta por rol.** Admin y socio muestran icono sobre etiqueta; entrenador muestra una píldora con etiqueta en línea. Propuesta: icono sobre etiqueta en los tres roles, con una altura de 80 px (hoy hay 64 y 80).
3. **Naranja en Sesiones.** Las barras de aforo y los bordes laterales usan degradados naranja que no pertenecen a la paleta. Sustituir por `primary` y `secondary`.
4. **Radios en Login.** Sus tarjetas usan 16 px; el resto de la app usa 32 px. Unificar a `rounded-card`.
5. **Padding horizontal del header.** 16 px en admin y login, 20 px en entrenador. Usar 16.
6. **Tipografía de cuerpo.** El Dashboard admin usa Space Grotesk en texto corrido. El resto usa Inter. Se aplica la regla de arriba.
7. **Restos de Stitch.** Una tipografía «Nimbus Sans» suelta (en un chip que se elimina) y nombres de capa como «Overlay+Shadow».

## Dependencias a añadir (en `package.json` y lockfile)

- `tailwindcss` y `@tailwindcss/vite` (v4), y registrar el plugin en `vite.config.ts`.
- `@fontsource-variable/space-grotesk` y `@fontsource-variable/inter`.
- `clsx` y `tailwind-merge` para el helper `cn`.
- Librería de iconos: **lucide-react** (decidida en #206; wrapper `Icon` en `components/atoms/Icon`).