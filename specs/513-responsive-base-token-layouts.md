# #513 · Responsive base: token de ancho de página, AppLayout y AppHeader

Primer issue de la epic #509 («Responsive: adapt the app to desktop and tablet»). Deja fijado el
ancho de página que heredan las seis subissues restantes (#510, #511, #512, #514, #515, #516). Sin
este issue, cada área tendría que elegir su propio ancho y luego habría que unificar.

Hoy `--container-app: 28rem` (448 px) limita el `main` de `AppLayout` y el `TopNav` en **todos** los
anchos de ventana, así que en desktop la app entera vive en una columna de móvil centrada con el
resto de la ventana vacía.

## Alcance

- `frontend/src/styles/theme.css`: añadir los tokens de ancho de página junto a `--container-app`.
- `frontend/src/layouts/AppLayout.tsx`: `main` y `TopNav` pasan a `max-w-page` en `md`.
- `frontend/src/components/ui/organisms/AppHeader/AppHeader.tsx`: el contenido se envuelve en un `div`
  centrado con `max-w-page`, para que el header comparta ancho y `padding-x` con el `main`.
- `frontend/src/layouts/PublicLayout.tsx`: `max-w-5xl` → `max-w-page` (mismo valor, una sola forma).

Fuera de alcance, deliberadamente: cualquier página. Las pantallas se reparten en las otras seis
subissues. Tampoco se toca `AuthLayout` (queda en #510) ni `index.css`.

## Decisiones

- **Dos tokens, no uno** (Q1 A): además de `--container-page: 64rem` se añade
  `--container-narrow: 20rem`. El primero da `max-w-page` (1024 px), que es el ancho que usa la
  landing hoy vía `max-w-5xl`; el segundo da `max-w-narrow` (320 px) para la columna de formulario
  que necesita #514. Se añaden aquí porque son tokens, no porque ya tengan consumidor: `--container-narrow`
  no lo usa nadie en este issue, su primer consumidor es #514.
- **El valor sale de la landing** (Q1 B): `PublicLayout.tsx` ya usa `max-w-5xl` (64 rem = 1024 px).
  Se conserva ese valor y se mueve al token, en vez de inventar un ancho nuevo. Es lo que pidió el
  equipo: «sigue las medidas de la página de inicio».
- **`--container-app` se conserva** como tope por defecto. En móvil (por debajo de `md`) el `main`
  sigue limitado a 448 px: es el diseño actual y no cambia. El salto a 1024 px ocurre solo en `md`.
- **El breakpoint es `md` (768 px)**, no `lg`. Coincide con el `md` que `AppLayout` ya usa para
  alternar `TopNav`/`BottomNav`, así tablet y desktop comparten un único punto de salto y no hay
  que mantener dos.
- **Máximo por breakpoint, no ancho fijo**: se usa `max-w-*`, que limita pero no estira. Por debajo
  de 1024 px el contenido ocupa el 100 % del ancho disponible menos el `padding-x`.
- **`padding-x` pasa de `px-4` a `px-6` en `md`** en `main`, `TopNav` y header, para que el aire a los
  lados crezca con el ancho de pantalla. En móvil se queda en `px-4`.
- **El header se centra con `mx-auto`** envolviendo su contenido, no con `max-w` en el `<header>`.
  El `<header>` debe seguir pintando `bg-surface` de borde a borde; solo su contenido se limita. Es
  el mismo truco que ya usa `AppLayout` en el `main`.
- **`md:py-8` en el `main`** sube el padding vertical en desktop respecto al `py-6` móvil. El
  `pb-28` del `BottomNav` se mantiene y sigue ganando en móvil; en `md` el `pb-6` ya existente
  manda, que es el comportamiento actual.

## Pruebas

No se añaden tests de render: no hay ningún test que aserta clases de `AppLayout` o del `AppHeader`,
y `TopNav.test.tsx` aserta por rol y texto (`navigation`, `link`), no por clase, así que el cambio de
envoltorio y de ancho no lo toca. `AppHeader.test.tsx` idem.

Se comprueba a mano en 390 / 768 / 1280 px:

- el `main` llega a 1024 px en `md` y sigue en 448 px por debajo;
- el contenido del `AppHeader`, el `TopNav` y el `main` comparten ancho y `padding-x` en desktop;
- la landing (`/`) no cambia de aspecto en ningún breakpoint;
- el `BottomNav` no se mueve en móvil y desaparece en `md` como hasta ahora.

## Riesgos

- `max-w-5xl` y `max-w-page` resuelven a lo mismo, pero si alguien cambia `--container-page` luego
  la landing se mueve sin darse cuenta. Es intencionado: una sola fuente de verdad.
- `--container-narrow` queda huérfano en este issue hasta que #514 lo consuma. Se deja definido a
  propósito para que #514 no tenga que tocar `theme.css`.
