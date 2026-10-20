# #510 · Responsive: páginas públicas y de autenticación

Issue #510 de la epic #509 («Responsive: adapt the app to desktop and tablet»). Depende de #513,
ya resuelto: `--container-page` (1024 px) y las dos layouts ya existen.

## Alcance

- `frontend/src/layouts/PublicLayout.tsx`
- `frontend/src/components/ui/organisms/PlansSection/PlansSection.tsx`,
  `FeaturedClassesSection/FeaturedClassesSection.tsx`, `LandingFooter/LandingFooter.tsx`
  (escalar el título de sección)

Las cinco pantallas de autenticación (`AuthLayout.tsx`, `LoginPage`, `RegisterPage`,
`ForgotPasswordPage`, `ResetPasswordPage`, `VerifyEmailPage`) **acaban sin ningún cambio**: ver
más abajo.

## Decisiones

- **`PublicLayout` alinea su cabecera con el `main`**: la cabecera no tenía contenedor propio y iba
  a todo lo ancho con `px-4`, mientras que el `main` va centrado en `max-w-page`; a 1280 px el logo
  salía en 16 px y el contenido en 144 px. Se envuelve el contenido de la cabecera en
  `mx-auto w-full max-w-page px-4 md:px-6`, el mismo patrón que `AppHeader`, y se le añade `md:px-6`
  al `main` para que los dos coincidan. Medido: logo **24 px** = contenido **24 px**.
- **Los títulos de sección de la landing suben de escala en `md`**: `text-headline` (24 px) pasa a
  `md:text-display` (32 px) en `PlansSection`, `FeaturedClassesSection` y `LandingFooter`.
  `HeroSection` ya hace `sm:text-hero` (48 px medidos) y `BenefitsSection` no tiene título, así que
  no se tocan. `PlansSection` se usa también en `/plans` (`titleAs="h1"`), donde el subido también
  es correcto.
- **No se reordena ni se elimina ningún contenido**, y la landing conserva sus `sm:grid-cols-3`
  (medido a 863 px: `261px 261px 261px`).

## Autenticación: la decisión de dos columnas queda revertida

El issue decidía «two columns on desktop»: `AuthHeroCard` a la izquierda y el formulario a la
derecha en `md`, y levantar el tope de `AuthLayout`. Se implementó tal cual y se verificó en el
navegador: a 863 px la rejilla salía `395.5px 395.5px`, el hero en x=24 y el formulario en x=444,
con el tope de 448 px respetado.

**En la revisión en vivo la revisión humana pidió lo contrario** para `/login` y `/register`:
«quiero que esté encima del formulario». Preguntado por los anchos, eligió **«apilado, ambos a
448 px y centrados»**, con la consecuencia explícita de que `AuthLayout` deja de necesitar los
1024 px.

Resultado: se revierte todo lo que se había hecho en autenticación y **el diff de #510 no toca
ningún fichero de auth**.

- `AuthLayout` sigue en `max-w-app` (448 px), sin `md:max-w-page`.
- Las cuatro páginas con hero siguen en `flex w-full flex-col gap-4`: hero arriba, formulario
  debajo, ambos a 416 px de ancho útil y centrados.
- Se retiran los `div` que envolvían el formulario con `max-w-md` y el `max-w-md` de las tarjetas
  sueltas (`VerifyEmailPage`, los estados `sent`/`done`/`!token`): con el layout otra vez en 448 px
  eran redundantes.

La aceptación «All five auth pages look correct at 390 / 768 / 1280 px» queda cumplida por
construcción: es el mismo layout en los tres anchos, el que ya tenían. La segunda aceptación
(«the form never exceeds a comfortable reading width») también, porque el propio `AuthLayout` la
limita a 448 px.

## Pruebas

- `tests/unit/PublicLayout.test.tsx` (6): aserta landmark, logo dentro del `banner` y los
  enlaces. El `div` intermedio de la cabecera no cambia ninguno de ellos.
- Los tests de las cinco pantallas de auth quedan intactos, al no haber cambios en su marcado.
- `PlansSection`, `FeaturedClassesSection` y `LandingFooter`: solo cambia una clase de tamaño de
  fuente, sus tests buscan por texto y rol.

Checks en verde: `npm run lint`, `npm run format:check`, `npm run test` (107 archivos / 446 tests)
y `npm run build`.

## Riesgos

- **#510 queda reducido a la cabecera pública y a los títulos de la landing.** Si la epic espera
  que autenticación «haga algo» en desktop, habrá que abrir un issue nuevo con lo que decida la
  revisión humana; el enunciado actual (dos columnas) está anulado por su propia decisión.
- `md:text-display` en `PlansSection` afecta también a `/plans`, donde ese título es el `h1` de la
  página. Es deseable, pero si al revisar allí no convence, se limita con `titleAs`.
