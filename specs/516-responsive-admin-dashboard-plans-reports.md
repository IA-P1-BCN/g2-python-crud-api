# #516 · Responsive: dashboard de admin, planes y reportes de socio

Issue #516 de la epic #509 («Responsive: adapt the app to desktop and tablet»). Depende de #513,
que ya está resuelto: el `main` llega a 1024 px en `md`, así que aquí solo hay que repartir el
contenido que hoy va todo apilado.

## Alcance

- `frontend/src/pages/admin/AdminDashboardPage.tsx`
- `frontend/src/pages/admin/PlansPage.tsx`
- `frontend/src/pages/admin/members/MemberDetail.tsx`
- `frontend/src/pages/admin/members/MovementsReport.tsx`
- `frontend/src/components/ui/organisms/PlansAdminList/PlansAdminList.tsx` (reposicionar `className`)

Fuera de alcance: el resto de clases `.page`/`.page__header`, `index.css` (salvo los dos huecos de
espaciado indicados abajo) y `AuthLayout`. Tampoco se cambia el orden de lectura de ningún
contenido.

### Correcciones de espaciado pedidas en la revisión

La revisión humana mandó arreglar de inmediato cuatro hallazgos de espaciado en este commit (el
resto de hallazgos de la auditoría quedan apuntados en la sub-issue de su área):

- `frontend/src/index.css`: `.members-list` pasa a `display:flex; flex-direction:column; gap:1rem`
  y pierde su `margin-top`; `.members-list__items` sube el `gap` de `0.75rem` a `1rem`.
- `frontend/src/pages/admin/AdminMembersPage.tsx`: el contenedor muerto `className="page"` (no
  tenía ninguna regla en el CSS) se sustituye por `flex flex-col gap-4`, y la cabecera se reordena
  según lo pedido: título solo, y debajo una fila con `justify-between` que junta los filtros de
  estado a la izquierda y las acciones a la derecha.
- `frontend/src/pages/admin/AdminUsersPage.tsx`: el mismo cambio de contenedor, para que los huecos
  de `/admin/users` queden en 16 px por todas partes.

## Ampliación de alcance: la navegación

La revisión humana decidió incluir en este mismo commit el rediseño de la navegación, aunque sus
ficheros no formaban parte del enunciado de #516. Queda constancia aquí para la revisión:

- **Diagnóstico.** El `TopNav` de admin necesita **1 094 px** (`scrollWidth`) para sus 9 ítems y
  recibía 800 px: `overflowing: true` con 294 px de más. Tampoco cabía a 1024 px (976 px
  disponibles, sobraban 118 px) ni a 1280 px. No era un menú «largo»: no cabe nunca.
- **Decisiones de la revisión humana:** hamburguesa en móvil reutilizando `Sheet` (se retira
  `BottomNav`), cabecera arriba a todo el ancho con el lateral debajo, `TopNav` reconvertido en
  `SideNav` conservando su test, y ancho completo en lugar de marco centrado a 1024 px.
- **Ficheros:** `AppLayout.tsx` (fila lateral + `main`), `AppHeader.tsx` (prop `onOpenNav` + botón
  `lg:hidden` + `md:max-w-page` → `md:max-w-none`), `Icon.tsx` (icono `menu`), `SideNav/` en lugar
  de `TopNav/`, y se retiran `TopNav/` y `BottomNav/`. Sus verificaciones pasan a `SideNav.test.tsx`
  (3) y `tests/unit/AppLayout.test.tsx` (4).
- **El lateral arranca en `lg` (1024 px)**, no en `md`: a 768 px descontaría 257 px y dejaría 463 px
  de contenido frente a los 662 px que necesita la tabla de usuarios. Por eso el botón de menú es
  `lg:hidden` y no `md:hidden`.

## Decisiones

- **El dashboard pasa a dos columnas**: los cinco paneles (`BookingsByDayChart`,
  `ExpiringMembershipsList`, `OccupancyList`, `PlansDistributionChart`, `TopClassesList`) se
  envuelven en `grid gap-6 md:grid-cols-2`. Todos renderizan un `ChartCard`, que acepta `className`
  y lo fusiona con `cn`, así que no hay que tocar ningún organismo.
- **El quinto panel ocupa las dos columnas** (`md:col-span-2`): con cinco elementos en dos columnas
  la última fila quedaría con una celda vacía. Se aplica a `TopClassesList`, que es el último del
  DOM. Si no convence, se quita y se asume la celda vacía; no afecta a nada más.
- **Las `StatCard` no se tocan**: ya es `grid-cols-2 md:grid-cols-3` con seis cifras, que son dos
  filas completas. No hay celda sobrante.
- **`TrainersSummaryCard` sigue fuera del grid**: va después del fragmento condicional porque
  tiene su propia query (`useTrainersSummary`) y se pinta aunque falle el dashboard. Meterlo dentro
  del `data ?` cambiaría ese comportamiento, que no es de este issue.
- **Los dos paneles de tabla pasan a dos columnas, pero en `xl`**: en `MemberDetail` y en
  `MovementsReport` cada bloque (`<h3>` + `Alert` + `Table`) se envuelve en un `div` y los dos van
  en `grid gap-4 xl:grid-cols-2`. Además esto arreglia el espaciado actual: con el preflight de
  Tailwind los `h3` tienen `margin: 0` y hoy el segundo título queda pegado a la tabla anterior; el
  `gap` del grid lo separa.
- **`xl` y no `lg` en estas dos tablas, decisión confirmada midiendo en el navegador con el lateral
  de navegación puesto.** El ancho mínimo real medido es: altas **397 px**, membresías **353 px**,
  movimientos **308 px**, y la tabla de usuarios **662 px**. Para partir en dos hacen falta
  `397×2 + 16 = 810 px` de contenido. Como el lateral de navegación ocupa **257 px** (256 + 1 px de
  borde), con `lg` el contenido serían 719 px a 1024 px de viewport y 463 px a 768 px: ni para dos
  columnas (810) ni para una sola de usuarios (662). Por eso el lateral arranca en `lg` y las tablas
  en `xl`: a 1024–1279 px quedan apiladas a ancho completo (719–974 px, todas por encima de su
  mínimo), y a **1280 px** el contenido da 975 px y cada columna 479 px, por encima de los 397 px de
  la tabla de altas. El dashboard y `PlansPage` sí se quedan en `md`: sus paneles son fluidos y no
  tienen ancho mínimo, así que a 768 px salen a 348 y 332 px sin problemas.
- **`PlansAdminList` recibe el `className` en la lista, en las tres ramas**: hoy el esqueleto lo
  pone en el `div` contenedor. Si `PlansPage` pasa `md:grid md:grid-cols-2`, en móvil iría «Cargando…»
  y la `ul` de esqueletos lado a lado. Al moverlo a la `ul`, la carga se mantiene en columna y los
  tres esqueletos se reparten en dos columnas en `md`.
- **`PlansPage` pide `md:grid md:grid-cols-2 md:items-start`**: `flex flex-col` sigue mandando por
  debajo de `md`; en `md` el `md:grid` lo sustituye. `items-start` evita que las `PlanCard` se
  estiren todas a la altura de la más alta.
- **No se reordena ningún panel ni ninguna tabla**: se conserva el orden del DOM.

## Pruebas

Tests existentes que deben seguir en verde, y lo que mira cada uno:

- `tests/unit/AdminDashboardPage.test.tsx` (8): usa `heading.closest('article, section')`. Envolver
  los paneles en un `div` no lo afecta, porque el `heading` sigue descendiendo del `section` del
  `ChartCard`.
- `src/components/ui/organisms/PlansAdminList/PlansAdminList.test.tsx` (7): aserte estructura
  (`li`, headings, textos) y no clases. El caso de esqueleto cuenta tres `li` y comprueba que no
  hay ningún `heading`; mover el `className` no cambia eso.
- `ChartCard`, `PlanCard` y los seis organismos del dashboard: no se tocan.

Se añaden tests mínimos para `MemberDetail` y `MovementsReport`, que no tienen ninguno: comprueban
que aparecen los dos encabezados y las dos tablas, que es justo lo que este issue reestructura.

## Riesgos

- **Resuelto el desbordamiento de las tablas.** La primera versión usaba `md:grid-cols-2` en
  `MemberDetail` y `MovementsReport` y, medido en el navegador a 800 px, la tabla de altas se
  salía 50 px de su columna (397 px frente a 347 px) y la de membresías 6 px, con scroll horizontal
  dentro de la columna. Se pasó a `lg` y, cuando el lateral de navegación se añadió a este mismo
  commit, a `xl`: con el lateral descontando 257 px, a 1280 px la columna mide 479 px y las dos
  caben, y por debajo se quedan apiladas a ancho completo. No queda ninguna tabla desbordada en
  ningún punto del rango.
- `Column` no admite clases ni anchos, así que no había forma de estrechar la columna de email sin
  tocar el organismo `Table`, que comparten `AdminUsersPage` y `Sandbox`. Fuera del alcance de #516.
- `md:col-span-2` en `TopClassesList` es una decisión puramente visual.
