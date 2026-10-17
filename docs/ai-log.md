# Bitácora de IA

Registro de cómo usamos agentes de IA en la parte 2 del proyecto: qué herramienta y modelo, qué se
le pidió, qué se aceptó, qué se rechazó y en qué se equivocó el agente.

> Este archivo lo abrió la primera tarea de la parte 2 (#398) con lo mínimo para poder anotar. Las
> secciones comunes (herramientas de todo el equipo, justificación, comparativa de modelos) son de
> la tarea #400.

## Herramientas y modelos

| Persona | Herramienta | Modelo | Coste | Alcance |
| --- | --- | --- | --- | --- |
| Eva | Claude Code | Claude Opus 5.5 | De pago | Solo `backend/`, `specs/` y `docs/` de las tareas de backend asignadas a Eva. No toca `frontend/` ni tareas de otras personas |
| Elena | OpenCode | Modelo gratuito (OpenCode Zen) | Gratuito | `frontend/`, `specs/` y `docs/` de sus tareas; escribe specs y PRs. Configuración en `docs/opencode.md` |
| PDguezPgr | OpenCode | Cat Jam Free (OpenCode) | Gratuito | Solo las tareas asignadas a PDguezPgr; docs, codigo de la tarea concreta y specs. |
| PDguezPgr | ChatGPT (app de escritorio) | GPT-4o | Gratuito | Consultas de apoyo y redaccion; sin escribir directamente en el repo. |

El briefing recomienda OpenCode con modelos gratuitos y permite IAs de pago si se delimita su
alcance. El resto del equipo añade aquí su fila.

## Plantilla de entrada

```markdown
### #<tarea> <título corto>

- **Fecha:** AAAA-MM-DD
- **Persona, herramienta y modelo:**
- **Spec:** `specs/<archivo>.md`
- **Prompt clave:** lo que se le pidió al agente, resumido o literal.
- **Qué generó el agente:**
- **Aceptado:**
- **Rechazado o cambiado, y por qué:**
- **Errores o alucinaciones del agente y cómo se corrigieron:**
- **Revisión humana:** quién revisó el PR y qué miró.
```

## Entradas

### #398 Login con OAuth2 Password Flow y botón Authorize

- **Fecha:** 2026-10-13
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/398-oauth2-password-flow.md`, escrita antes del código.
- **Prompt clave:** «Las tareas nuevas añádelas a Sprint 2, seguimos a tu criterio el orden […]
  con respecto a los specs sigue si Pedro y Elena no lo hacen». El agente eligió empezar por la
  #398 por ser del nivel Esencial y trabajó a partir de los criterios de aceptación del issue.
- **Qué generó el agente:** la spec; el endpoint `POST /auth/token` con el formulario estándar de
  OAuth2; el cambio del esquema de seguridad de `HTTPBearer` a `OAuth2PasswordBearer`;
  `GET /users/me`; 23 tests nuevos y dos filas en la matriz de permisos.
- **Aceptado:**
  - Mantener `POST /auth/login` con JSON sin cambios, para no tocar el frontend.
  - Una sola función `auth_service.authenticate(db, email, password)` para los dos logins, en vez
    de repetir la comprobación de credenciales.
  - Declarar `/users/me` antes de `/users/{user_id}`, para que `me` no se lea como un id.
- **Rechazado o cambiado, y por qué:**
  - Responder 400 `invalid_grant` ante credenciales incorrectas, como sugiere el estándar OAuth2.
    Se mantiene el 401 con el mensaje del login actual: es lo que ya documenta `docs/errores.md` y
    lo que espera el frontend.
  - Validar que `username` tenga forma de email antes de buscar el usuario. Se descartó: daría una
    respuesta distinta para emails mal escritos y revelaría información; ahora cualquier
    `username` desconocido recibe la misma respuesta que una contraseña incorrecta.
- **Errores o alucinaciones del agente y cómo se corrigieron:** ninguno en el código de esta
  tarea. En la misma sesión, al crear las tareas en el tablero, el primer intento falló porque el
  agente pidió añadir cada issue al proyecto a mano y el tablero ya las añade solo; se detectó por
  el error de GitHub y se repitió sin ese paso, comprobando que no quedara ninguna duplicada.
- **Revisión humana:** pendiente en el PR. Puntos de seguridad a mirar: que el token se sigue
  validando igual (`auth_service.get_user_from_token`), que el endpoint de token no distingue
  email desconocido de contraseña incorrecta, y que ninguna respuesta incluye la contraseña.

### #403 Capa de repositorios para usuarios

- **Fecha:** 2026-10-13
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/403-user-repository.md`, escrita antes del código.
- **Prompt clave:** «la 403 solo a usuarios» y «ok continua». El agente trabajó a partir de los
  criterios de aceptación del issue y de esa decisión de alcance.
- **Qué generó el agente:** la spec; `app/repositories/user_repository.py`; el cambio de
  `user_service`, `auth_service` y la exportación de socios para que usen el repositorio; 24 tests
  nuevos, entre ellos uno de arquitectura; y la frase de las capas en `AGENTS.md`.
- **Aceptado:**
  - Migrar solo los usuarios. El resto de recursos conserva sus consultas en los servicios.
  - El repositorio no lanza errores de dominio ni decide nada: devuelve datos o `None`. El «email
    ya registrado» y el «usuario no encontrado» siguen en el servicio.
  - Mantener las firmas públicas de `user_service`, para no tocar ni las rutas ni los tests.
  - Un test que recorre `app/services/` y falla si algún servicio vuelve a consultar `User` por su
    cuenta.
- **Rechazado o cambiado, y por qué:**
  - Repositorios como clases con una interfaz genérica para todos los recursos. Se descartó: para
    un solo recurso es más código que valor, y el resto del proyecto usa módulos con funciones.
  - Que el repositorio solo hiciera `flush` y el servicio confirmara la transacción. Se dejó la
    confirmación en el repositorio (`save`), que es lo que ya hacía cada operación.
- **Errores o alucinaciones del agente y cómo se corrigieron:**
  - Un test del repositorio buscaba «LUCÍA» esperando encontrar «Lucía» y falló. No era un fallo
    del código: SQLite, la base de datos de los tests, no ignora mayúsculas en letras con tilde.
    Se cambió el test a un texto sin tilde. Queda sin comprobar cómo se comporta esa búsqueda en
    PostgreSQL.
  - El agente previó un conflicto de fusión con el PR #422 en `auth_service.py` (dos cambios en
    líneas contiguas de los imports). Se confirmó al traer `dev` a la rama y se resolvió a mano
    antes de subir nada.
- **Revisión humana:** pendiente en el PR. Punto a mirar: que ningún test existente se ha
  modificado, que es la prueba de que el refactor no cambia el comportamiento.

### #402 Respuestas de error documentadas en Swagger

- **Fecha:** 2026-10-13
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/402-error-responses-in-openapi.md`, escrita antes del código.
- **Prompt clave:** «ok abre el pr» de la tarea anterior y continuar con el orden acordado. El
  agente trabajó a partir de los criterios de aceptación del issue y de `docs/errores.md`.
- **Qué generó el agente:** la spec; `app/api/responses.py`, con la descripción, el esquema y el
  ejemplo de cada código en un solo sitio; `responses=errors(...)` en las 56 rutas; el esquema
  `ValidationErrorResponse`; y 285 comprobaciones nuevas sobre el esquema OpenAPI.
- **Aceptado:**
  - Declarar los códigos ruta por ruta, pero definir su contenido una sola vez.
  - Sustituir el esquema de 422 por defecto de FastAPI (`HTTPValidationError`), que no coincidía
    con la respuesta real de la API porque le falta `code`.
  - Tests que derivan lo que debe estar documentado de datos que ya existen: la matriz de permisos
    decide qué operaciones deben declarar 401 y 403.
- **Rechazado o cambiado, y por qué:**
  - Deducir todos los códigos automáticamente al generar el esquema. Solo el 401 y el 422 se
    pueden deducir; el 400, el 403 por propiedad del dato y el 409 dependen de reglas que están
    dentro de los servicios. Se optó por declararlos a mano y vigilarlos con tests.
  - Un ejemplo distinto por endpoint. Hay uno representativo por código; el mensaje exacto de cada
    caso sigue en `docs/errores.md`.
- **Errores o alucinaciones del agente y cómo se corrigieron:**
  - La primera versión eliminaba del esquema el tipo `ValidationError`, que el frontend importa de
    los tipos generados (`frontend/src/api/client.ts`). No fallaba ningún test, porque esos tipos
    no se regeneran en la CI; se habría roto la próxima vez que alguien los regenerase. El agente
    lo detectó al revisar quién usaba ese tipo y lo conservó con el mismo nombre y la misma forma.
  - Un script de edición propio escribió saltos de línea reales donde debía escribir `\n` y quedó
    con un error de sintaxis. Se detectó al ejecutarlo, antes de tocar ningún archivo del proyecto.
- **Revisión humana:** pendiente en el PR. Punto a mirar: que la tabla de códigos por ruta es
  correcta para los endpoints que conozcáis; los tests comprueban el 401, el 403, el 404 y el 422,
  pero el 400 y el 409 de cada ruta solo los valida quien lee.

### #408 Tokens de refresco y logout con tokens revocados

- **Fecha:** 2026-10-14
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/408-refresh-tokens-and-logout.md`, escrita antes del código.
- **Prompt clave:** «continuamos con la siguiente tarea». El agente trabajó a partir de los
  criterios de aceptación del issue.
- **Qué generó el agente:** la spec; el tipo (`type`) y el identificador único (`jti`) en cada
  token; `create_refresh_token` y la validación por tipo en `core/security.py`; la tabla
  `revoked_tokens` con su modelo, su repositorio y su migración de Alembic; los endpoints
  `POST /auth/refresh` y `POST /auth/logout`; la variable `REFRESH_TOKEN_EXPIRE_DAYS`; 27 tests
  nuevos y dos filas en la matriz de permisos.
- **Aceptado:**
  - Guardar solo el identificador del token revocado, nunca el token.
  - Comprobar en cada petición protegida que el token no esté revocado; es una consulta más por
    petición, a cambio de que el logout sea real.
  - Mantener 60 minutos para el token de acceso. El briefing pide que sea «de vida corta», pero
    acortarlo echaría de la sesión a los usuarios del frontend, que todavía no renueva el token.
  - El acceso a `revoked_tokens` pasa por un repositorio, como los usuarios.
- **Rechazado o cambiado, y por qué:**
  - Rotar el token de refresco en cada uso. Es más seguro, pero la tarea pide devolver un token de
    acceso nuevo y no lo exige; queda anotado como mejora en la spec.
  - Hacer obligatorio el token de refresco en el logout. Se dejó opcional para que el frontend
    actual pueda llamar al logout sin cambios.
- **Errores o alucinaciones del agente y cómo se corrigieron:** la primera versión del endpoint de
  logout recibía el usuario actual como parámetro sin usarlo. Se cambió a una dependencia
  declarada en el decorador, que hace la misma comprobación sin dejar un parámetro muerto.
- **Sin comprobar:** la migración se ha probado arriba y abajo con SQLite (los tests), pero no
  contra PostgreSQL, porque Docker no estaba arrancado.
- **Revisión humana:** pendiente en el PR. Puntos de seguridad a mirar: que un tipo de token no
  sirve por el otro, que el logout con el token de refresco de otra persona no revoca nada, y que
  la tabla no guarda tokens completos.

### #409 Límite de intentos en el login

- **Fecha:** 2026-10-14
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/409-login-rate-limiting.md`, escrita antes del código.
- **Prompt clave:** «ok continuamos siguiente tarea». El issue tenía una decisión pendiente; el
  agente paró y preguntó dos cosas antes de escribir la spec. Eva eligió las dos opciones
  recomendadas: contar los intentos **por IP** y guardarlos **en memoria**.
- **Qué generó el agente:** la spec; `app/core/rate_limit.py`, un limitador de ventana deslizante
  con reloj inyectable; el error `TooManyRequestsError` (429) con la cabecera `Retry-After`; la
  dependencia `limit_login_attempts`, aplicada a `/auth/login` y `/auth/token`; dos variables de
  entorno; el 429 en Swagger y en `docs/errores.md`; y 21 tests nuevos.
- **Aceptado:**
  - Un solo contador para los dos logins, para que no se pueda esquivar el límite cambiando de
    endpoint.
  - Contar también los intentos correctos: es un límite de peticiones, no de fallos.
  - Escribir el limitador a mano en vez de añadir una librería (`slowapi`): son 40 líneas, sin
    dependencias nuevas, y con un reloj inyectable los tests no esperan un minuto real.
- **Rechazado o cambiado, y por qué:**
  - Límite por cuenta (fallos por email). Protege mejor cada cuenta, pero permite bloquear a
    propósito el login de otra persona; se descartó en la pregunta.
  - Guardar los intentos en la base de datos. Más robusto con varias copias del servidor, pero
    añade una tabla y una consulta por login; con un único servidor no hace falta.
- **Errores o alucinaciones del agente y cómo se corrigieron:** la primera versión de los tests
  daba por hecho el límite de 5 intentos. Habrían fallado a quien cambiase
  `LOGIN_RATE_LIMIT_ATTEMPTS` en su `.env`. Se cambiaron para leer el valor configurado, y un test
  aparte comprueba los valores por defecto sin leer ningún `.env`.
- **Limitación conocida:** detrás de un proxy, todas las peticiones llegarían con la IP del proxy y
  compartirían el límite. Si se despliega así, habrá que leer la IP real de la cabecera que ponga
  el proxy.
- **Revisión humana:** pendiente en el PR. Puntos de seguridad a mirar: que el sexto intento no
  llega a comprobar la contraseña, y que el registro y el resto de la API no tienen límite.

### #378 Página de miembros del entrenador

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Elena, OpenCode, modelo gratuito (OpenCode Zen).
- **Spec:** `specs/378-trainer-members-page.md`, escrita antes del código.
- **Prompt clave:** «tarea: Página de miembros del entrenador #378». El issue traía una decisión
  pendiente antes de empezar; el agente paró y preguntó qué socios mostrar. Elena eligió **todos
  los socios del gimnasio** (opción recomendada).
- **Qué generó el agente:** la spec; la pantalla `TrainerMembersPage` con
  `GET /users?role=member` (búsqueda y paginación en **servidor**), `SearchInput`, tarjetas con
  `Avatar` + nombre + correo y `Pagination`, más los estados de carga, vacío y error; la entrada
  **Socios** en el menú del entrenador; 4 tests unitarios y un e2e.
- **Aceptado:**
  - `GET /users?role=member` en vez de recomponer "solo los socios de mis clases": el backend ya
    fuerza `role=member` para el entrenador (`access_service.visible_user_role`) y la búsqueda y la
    paginación funcionan en servidor.
  - Reutilizar los componentes del kit (`SearchInput`, `Pagination`, `Alert`, `Avatar`) y el diseño
    de tokens (Tailwind), como en las páginas recientes.
  - Solo lectura: sin botones de alta, edición ni baja.
- **Rechazado o cambiado, y por qué:**
  - Reutilizar el organismo `MembersList`: aunque ya trae búsqueda, paginación y estados, muestra
    el plan, la membresía y el último pago de cada socio (`MemberListItem`), que quedan fuera de
    los criterios y obligarían a una consulta por socio. Se hizo una lista de solo nombre y correo.
  - Cruzar `GET /bookings` (scope del entrenador) con `GET /users`: habría exigido buscar y paginar
    en cliente; el issue ya avisaba de que hacerlo en una llamada necesitaría backend nuevo.
- **Errores o alucinaciones del agente y cómo se corrigieron:** la issue afirmaba que
  `/trainer/members` ya estaba en el menú del entrenador y **no lo estaba** (solo la ruta). El
  agente lo detectó y añadió la entrada "Socios", avisando en el resumen. También apareció un e2e
  *flaky* **preexistente** de `member.spec` (hace `goto` justo después del login y compite con el
  guardado del token); no es de esta tarea y se dejó como está, señalándolo.
- **Revisión humana:** pendiente en el PR.


### #410 Auditoría de usuarios

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/410-user-audit-trail.md`, escrita antes del código.
- **Prompt clave:** «ok continuamos con nuestras tareas». El criterio «los campos se devuelven solo
  a administradores» no decía cómo; el agente preguntó y Eva eligió un endpoint propio,
  `GET /users/{id}/audit`, en lugar de añadir campos a las respuestas de usuario según el rol.
- **Qué generó el agente:** la spec; tres columnas en `users` (`created_by_id`, `updated_by_id`,
  `updated_at`) con su migración de Alembic en modo *batch*; el registro automático de quién crea y
  quién cambia en `user_service`; el esquema `UserAudit` y el endpoint de auditoría; 24 tests nuevos
  y una fila en la matriz de permisos.
- **Aceptado:**
  - Guardar solo el último cambio, no un historial completo.
  - Dejar vacíos el creador y la última modificación de los usuarios anteriores a la migración, en
    vez de inventar un valor.
  - Que el servicio reciba explícitamente quién hace cada cambio; nunca sale del cuerpo de la
    petición.
- **Rechazado o cambiado, y por qué:**
  - Columnas sin clave foránea, que habrían evitado tocar los tests. Se descartó: la base de datos
    debe garantizar que el autor de un cambio es un usuario real.
- **Errores o alucinaciones del agente y cómo se corrigieron:**
  - `ruff format` lanzado sobre toda la carpeta `app/` reformateó nueve archivos que la tarea no
    tocaba. Se detectó al revisar el diff y se devolvieron a su estado original antes de seguir.
  - El administrador que simulan los tests no existía en la base de datos (id 0), y la clave
    foránea nueva lo rechazaba. Se cambió el *fixture* `client` para que actúe con un
    administrador guardado. Eso hizo que apareciera en tres tests que comparaban la lista exacta
    de usuarios; se adaptaron sus valores esperados para incluirlo. No se borró ninguna comprobación.
- **Comprobado a mano:** la migración sube, baja y vuelve a subir contra PostgreSQL, y los tres
  usuarios de demo conservan sus datos con la auditoría vacía.
- **Revisión humana:** pendiente en el PR. Puntos a mirar: el cambio del *fixture* `client` y los
  tres tests adaptados, y que el endpoint de auditoría solo responde a administradores.

### #299 Página del panel de administración

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Elena, OpenCode, modelo gratuito (OpenCode Zen).
- **Spec:** `specs/299-admin-dashboard-page.md`, escrita antes del código.
- **Prompt clave:** «Tarea: Página del panel de administración #299». El issue traía varias
  decisiones pendientes; el agente paró y preguntó dos cosas. Elena eligió las dos recomendadas:
  **solo los criterios de aceptación** (#300–#306 + #311, sin #307/#308/#309) y **gráficos a mano
  con SVG/CSS y los tokens** (sin librerías).
- **Qué generó el agente:** la spec; las moléculas `DateRangeFilter` y `ChartCard`; los organismos
  `BookingsByDayChart`, `OccupancyList`, `ExpiringMembershipsList`, `PlansDistributionChart` y
  `TopClassesList`; la reescritura de `AdminDashboardPage` con el diseño nuevo; `formatPercent` en
  `lib/format.ts`; y tests de cada pieza.
- **Aceptado:**
  - Reutilizar el kit y los tokens (Tailwind) en vez de las clases CSS antiguas, manteniendo el
    comportamiento y los tests actuales de la página (sin tocarlos).
  - Gráficos con SVG/CSS y `--color-chart-1..4`: sin dependencias nuevas y fáciles de testear.
  - Convertir la etiqueta de `StatCard` en encabezado y añadir `hint`, en vez de cambiar los tests
    de la página.
- **Rechazado o cambiado, y por qué:**
  - Añadir una librería de gráficos (recharts): nueva dependencia para dos gráficos que caben en
    SVG/CSS con los tokens de gráfico que ya existían.
  - Implementar #307 (altas vs bajas por semana) reutilizando `weekly_movements`: el issue lo deja
    como decisión pendiente (la cancelación de membresías no está definida en el proyecto).
  - Convertir el texto de plan y fecha de "membresías por vencer" en un solo nodo: rompía el
    `getByText('Plan Anual')` del test existente; se dejaron en elementos separados.
- **Errores o alucinaciones del agente y cómo se corrigieron:** el primer test del gráfico de barras
  usaba `getByRole('listitem')` esperando uno solo cuando hay varios; se cambió a `getAllByRole`.
  Volvió a aparecer el *flake* **preexistente** de `member.spec` (login + `goto` sin esperar);
  aislado pasa, no es de esta tarea y sigue señalado.
- **Revisión humana:** pendiente en el PR.

### #249 Formulario de inicio de sesión (organismo)

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Elena, OpenCode, modelo gratuito (OpenCode Zen).
- **Spec:** `specs/249-loginform-organism.md`, escrita antes del código.
- **Prompt clave:** «tarea: Formulario de inicio de sesión (organismo) #249».
- **Qué generó el agente:** la spec; el organismo `LoginForm` (correo, contraseña con
  mostrar/ocultar, enviar, enlace a Registrarse y estados de error y carga) usando `FormField`,
  `PasswordField`, `Button` y `Alert`; y `LoginPage` reducida a la lógica de `useAuth`, redirección
  por rol y `Navigate`. Cinco tests del organismo.
- **Aceptado:**
  - Organismo **presentacional**: guarda los campos y el descarte del error, y llama a
    `onSubmit(credentials)`; la página hace el login y navega.
  - Mantener textos, `aria-label` y nombres accesibles, para no tocar la suite de `LoginPage` ni los
    e2e de auth (que siguen pasando sin cambios).
- **Rechazado o cambiado, y por qué:** crear también `RegisterForm` en esta tarea. El issue solo
  pide el formulario de login; el de registro iría en su propia tarea.
- **Errores o alucinaciones del agente y cómo se corrigieron:** ninguno relevante; los avisos de
  *future flags* de React Router en la salida de los tests son preexistentes y benignos.
- **Revisión humana:** pendiente en el PR.

### #251 Página de inicio de sesión

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Elena, OpenCode, modelo gratuito (OpenCode Zen).
- **Spec:** `specs/251-login-page.md`, escrita antes del código.
- **Prompt clave:** «Página de inicio de sesión #251». El enunciado pedía `AuthLayout` +
  `AuthHeroCard` + `LoginForm`, pero el `AuthHeroCard` (#248) estaba **cerrado como completado sin
  existir en el código**. El agente paró y preguntó; Elena eligió **crearlo y componer la página** y
  **reutilizar el eslogan de la landing**.
- **Qué generó el agente:** la spec; la molécula `AuthHeroCard` (tarjeta azul con eslogan y subtítulo,
  sin chips) y su test; y la `LoginPage` compuesta por `AuthHeroCard` + `LoginForm`, manteniendo su
  lógica (`useAuth`, redirección por rol, `Navigate`).
- **Aceptado:** reutilizar el copy de la landing ("Entrena a tu ritmo" y su subtítulo); no crear
  `RegisterForm` (fuera del alcance).
- **Rechazado o cambiado, y por qué:** reproducir los *chips* del frame de Figma: el propio issue de
  #248 pide quitarlos, así que la tarjeta queda con eslogan y subtítulo.
- **Errores o alucinaciones del agente y cómo se corrigieron:** el agente detectó que el enunciado
  ("todavía con las clases CSS antiguas") estaba **desactualizado**: la página ya se había rediseñado
  en #233 y #249. Lo señaló en la pregunta antes de seguir.
- **Revisión humana:** pendiente en el PR.

### #412 Verificación de email y recuperación de contraseña

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/412-email-verification-and-password-recovery.md`, escrita antes del código.
- **Prompt clave:** «sí, tal cual arranca 412 con tu recomendación». La recomendación era no enviar
  correos de verdad: escribir el mensaje y su enlace en el log del backend, con un único punto de
  envío que se pueda cambiar por un proveedor real.
- **Qué generó el agente:** la spec; dos tipos de token nuevos (verificación y recuperación);
  `app/services/email_service.py`; la columna `users.email_verified_at` con su migración; los
  endpoints `POST /auth/verify-email`, `/auth/forgot-password` y `/auth/reset-password`; tres
  variables de entorno; dos filas en `docs/errores.md`; y 23 tests nuevos.
- **Aceptado:**
  - «He olvidado mi contraseña» responde 202 siempre, exista o no la cuenta.
  - Los enlaces de recuperación valen una sola vez: al usarse se guardan como revocados en la tabla
    de #408, sin crear otra.
  - Un enlace malo responde 400 y no 401, para que el frontend no lo confunda con una sesión
    caducada y cierre la sesión.
  - La recuperación queda en la auditoría de #410 como un cambio hecho por el propio usuario.
- **Rechazado o cambiado, y por qué:**
  - Bloquear el login a quien no ha verificado el email: rompería las cuentas de demo y el
    frontend, que no tiene pantalla de verificación.
  - Un endpoint para reenviar la verificación: no lo pide la tarea; queda fuera de alcance.
- **Errores o alucinaciones del agente y cómo se corrigieron:** la primera versión de los tests
  importaba el modelo `User` dentro de cada función; se movió arriba al revisarlo. El *linter*
  marcó además el orden de los imports del servicio de autenticación, corregido con `ruff --fix`.
- **Comprobado a mano:** la migración sube, baja y vuelve a subir contra PostgreSQL; las cuentas de
  demo quedan sin verificar.
- **Revisión humana:** pendiente en el PR. Puntos de seguridad a mirar: que «he olvidado mi
  contraseña» no revela si el email existe, que el enlace de recuperación no se puede usar dos
  veces, y que ningún token de enlace abre la API.

### #50 Write README

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** PDguezPgr, OpenCode (Cat Jam Free) y ChatGPT app de escritorio (GPT-4o, consultas).
- **Spec:** `docs` / README.
- **Prompt clave:** “dado lo que hay en la carpeta del proyecto, ¿cómo sería un README para presentar en GitHub?” y posteriores correcciones: “el borrador debe usar Athletica”, “añade capturas en `docs/screenshots/`”, “expande la estructura de `frontend/`”, “añade enlace a `docs/er-diagram.md` y avisa de que el PDF es Parte 1”, “añade sección de equipo”.
- **Aceptado:**
  - README con casos de uso por rol, stack, arquitectura, instalación, variables de entorno, tests, CI y Docker.
  - Referencias válidas a capturas reales en `docs/screenshots/`.
  - Referencias a `docs/er-diagram.pdf` (Parte 1) y `docs/er-diagram.md` (Parte 2).
  - Sección “Equipo” con los contribuidores de GitHub.
- **Rechazado o cambiado, y por qué:**
  - Versión inicial con “GymFlow” corregida a “Athletica” para alinearla con el proyecto.
  - Referencias a imágenes inexistentes se retiraron y luego se restauraron al añadir las capturas reales.
  - Estructura de `frontend/` inicialmente colapsada se amplió para mostrar sus directorios.
- **Errores o alucinaciones del agente y cómo se corrigieron:**
  - Se detectaron ramas/commits incoherentes y referencias rotas; se resolvió con revisión de Git, `fetch`, `merge` y edición dirigida del README.
  - Inconsistencias de nombre se corrigieron antes del merge.
- **Revisión humana:** revisado por el equipo en PRs asociadas (429, 443 y siguientes).

### #51 Document endpoints and business rules in `/docs`

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** PDguezPgr, OpenCode (Cat Jam Free) y ChatGPT app de escritorio (GPT-4o, consultas).
- **Spec:** sin spec previa; basado en el issue #51 y en el router/OpenAPI actual.
- **Prompt clave:** “Document endpoints and business rules in /docs” + “Markdown table of endpoints and the 5 business rules”.
- **Aceptado:**
  - Creación de `docs/endpoints.md`.
  - Tabla de endpoints por recurso y las 5 reglas de negocio principales.
  - Enlace a `docs/errores.md`.
- **Rechazado o cambiado, y por qué:** no se inventaron reglas nuevas; se usó la lógica de `booking_service` y el catálogo de errores.
- **Errores o alucinaciones del agente y cómo se corrigieron:** solo documentación; sin cambios en código backend/frontend.
- **Revisión humana:** revisado por el equipo en PR asociado.

### #400 AI log: herramientas y modelos

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** PDguezPgr, OpenCode (Cat Jam Free) y ChatGPT app de escritorio (GPT-4o, consultas).
- **Spec:** issue #400.
- **Prompt clave:** “Añadir mi fila al equipo en `docs/ai-log.md` con las herramientas y modelos gratuitos usados”.
- **Aceptado:**
  - Fila de OpenCode Cat Jam Free (Gratuito).
  - Fila de ChatGPT desktop GPT-4o (Gratuito).
- **Rechazado o cambiado, y por qué:** si el plan de ChatGPT pasa a pago, debe actualizarse el coste.
- **Errores o alucinaciones del agente y cómo se corrigieron:** ninguno relevante.
- **Revisión humana:** revisado por el equipo en PR asociado.

### #253 Formulario de registro (organismo)

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Elena, OpenCode, modelo gratuito (OpenCode Zen).
- **Spec:** `specs/253-registerform-organism.md`, escrita antes del código.
- **Prompt clave:** «tarea: Formulario de registro (organismo) #253».
- **Qué generó el agente:** la spec; el organismo `RegisterForm` (nombre, correo y contraseña con la
  regla de fortaleza, enviar, enlace a Iniciar sesión y estados de error y carga) con `FormField`,
  `PasswordField`, `Button` y `Alert`; `RegisterPage` reducida a la lógica; y cinco tests.
- **Aceptado:** organismo presentacional con `onSubmit(values)`; mantener textos y nombres accesibles
  para no tocar la suite de `RegisterPage` ni el e2e.
- **Rechazado o cambiado, y por qué:** extraer también un hero (`AuthHeroCard`) aquí: fuera del
  alcance de #253, que es solo el formulario.
- **Errores o alucinaciones del agente y cómo se corrigieron:** la rama estaba **9 commits por detrás
  de `dev`**, así que añadir la entrada al `ai-log` habría chocado con la de #251; el agente actualizó
  la rama con `dev` (merge) antes de continuar. Reapareció el *flake* de `member.spec`; el e2e **sí**
  corre en CI, así que puede fallar PRs.
- **Revisión humana:** pendiente en el PR.

### #255 Página de registro

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Elena, OpenCode, modelo gratuito (OpenCode Zen).
- **Spec:** `specs/255-register-page.md`, escrita antes del código.
- **Prompt clave:** «tarea: Página de registro #255». El enunciado estaba desactualizado (el
  formulario ya estaba en `dev` por #253); el agente lo completó componiendo la página.
- **Qué generó el agente:** la spec; `RegisterPage` compuesta por `AuthHeroCard` + `RegisterForm`
  (dentro del `AuthLayout`), manteniendo su lógica; el copy del hero extraído a `lib/auth-copy.ts`
  para compartirlo con `LoginPage` (DRY); y un test del hero.
- **Aceptado:** reutilizar el copy de la landing para el hero, igual que en el login (#251);
  extraer el copy a un módulo compartido en vez de duplicarlo.
- **Rechazado o cambiado, y por qué:** nada fuera del alcance; no se añadió hero distinto para el
  registro.
- **Errores o alucinaciones del agente y cómo se corrigieron:** el agente arrastraba el *flake* de
  `member.spec`; **acordado con Elena**, se arregló aquí: `loginAs` ahora espera a terminar el login
  (`waitForURL` fuera de `/login`) antes de devolver, y el e2e (que **sí** corre en CI) pasó dos
  veces seguidas.
- **Revisión humana:** pendiente en el PR.

### #275 Lista de beneficios del plan (molécula)

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Elena, OpenCode, modelo gratuito (OpenCode Zen).
- **Spec:** `specs/275-plan-benefits-list.md`, escrita antes del código.
- **Prompt clave:** «tarea: Lista de beneficios del plan (molécula) #275». El plan en la API no tiene
  beneficios (solo nombre, descripción, precio y duración), así que el agente paró y preguntó de
  dónde salía "lo que incluye el plan". Elena eligió la **lista fija del gimnasio**.
- **Qué generó el agente:** la spec; `lib/plan-benefits.ts` (tipo `PlanBenefit` y `PLAN_BENEFITS`) y
  la molécula `PlanBenefitsList` (un `Icon` por beneficio, con `items` y `title` por defecto); y su
  test.
- **Aceptado:** lista fija compartida en `lib` y organismo que la pinta pero admite otra lista, en
  vez de inventar beneficios por plan.
- **Rechazado o cambiado, y por qué:** derivar los beneficios de los campos del plan ("Válido 30
  días", etc.): no es lo que muestra el diseño y mezcla datos con copy.
- **Errores o alucinaciones del agente y cómo se corrigieron:** el primer test de la molécula usaba
  `getByRole('listitem')` esperando uno solo cuando hay varios; se cambió a `getAllByRole`. Otra vez
  la rama iba por detrás en `ai-log`; se actualizó con `dev` antes de añadir esta entrada.
- **Revisión humana:** pendiente en el PR.




### #415 Autenticación en dos pasos (2FA con TOTP)

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/415-two-factor-authentication.md`, escrita antes del código.
- **Prompt clave:** «si ya no tenemos tareas pendientes, pilla por orden las de backend sin
  asignar». El agente explicó que la #414 (login social) necesitaba que Eva registrase una app en
  GitHub, empezó por la #415 y preguntó dos decisiones antes de escribir la spec. Eva eligió las
  recomendadas: el código va en un campo opcional del login, y se usa la librería `pyotp`.
- **Qué generó el agente:** la spec; la dependencia `pyotp`; las columnas `users.totp_secret` y
  `users.totp_enabled_at` con su migración; `app/services/two_factor_service.py`; los endpoints
  `POST /auth/2fa/setup`, `/auth/2fa/enable` y `/auth/2fa/disable`; el campo `totp_code` del
  login; los errores `totp_required` y `totp_invalid`; y 29 tests nuevos.
- **Aceptado:**
  - Activar en dos pasos (preparar y confirmar con un código), para que nadie quede fuera de su
    cuenta por un secreto mal copiado.
  - Comprobar la contraseña antes que el código, para no revelar qué cuentas tienen 2FA.
  - Aceptar el código de los 30 segundos anteriores y siguientes, por si el reloj del móvil va
    algo desfasado.
  - Rechazar en el login de Swagger (`/auth/token`) a las cuentas con 2FA, con un mensaje que
    indica usar `/auth/login`, porque el formulario estándar de OAuth2 no tiene campo para el código.
- **Rechazado o cambiado, y por qué:**
  - Escribir el cálculo TOTP a mano: es código de seguridad y `pyotp` es la implementación habitual.
  - Cifrar el secreto en la base de datos y los códigos de recuperación: quedan fuera de alcance.
- **Errores o alucinaciones del agente y cómo se corrigieron:** dos líneas pasaban de los 100
  caracteres que permite el *linter*; se partieron. Además, la sesión se cortó justo al guardar el
  archivo de tests y hubo que volver a escribirlo.
- **Comprobado a mano:** la migración sube, baja y vuelve a subir contra PostgreSQL.
- **Revisión humana:** pendiente en el PR. Puntos de seguridad a mirar: que con contraseña mala la
  respuesta no cambia, que el secreto no aparece en ninguna respuesta tras activarlo, y que el
  login de Swagger no se salta el segundo paso.
### #318 Sheet (molécula)

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Nayeli, OpenCode, modelo gratuito (MiMo Flash).
- **Spec:** `specs/318-sheet.md`, escrita antes del código.
- **Prompt clave:** «tarea: Sheet (molécula) #318». La issue no enlaza diseño, así que
  Nayeli confirmó partir del enunciado (sin Figma).
- **Qué generó el agente:** la spec; la molécula `Sheet` (portal a `document.body`, bottom
  sheet en móvil y diálogo centrado en `md:`, focus trap manual, Escape, backdrop que cierra,
  scroll del body bloqueado y `IconButton` de cerrar) con los tokens `--color-scrim` y
  `rounded-card`; y ocho tests.
- **Aceptado:** API controlada (`isOpen`/`onClose`), focus trap manual sin dependencias
  nuevas, `z-50` como primera capa superpuesta, backdrop que cierra y scroll bloqueado
  (confirmado por Nayeli en la revisión de la spec).
- **Rechazado o cambiado, y por qué:** animaciones (la issue no las pide); usar una
  biblioteca de foco (sin dependencias nuevas sin consultar al equipo).
- **Errores o alucinaciones del agente y cómo se corrigieron:** ninguno en esta tarea;
  `lint`, `format`, los 369 tests unitarios y `build` pasaron a la primera.
- **Revisión humana:** pendiente en el PR.

### #320 Lista de planes de admin (organismo)

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Nayeli, OpenCode, modelo gratuito (MiMo Flash).
- **Spec:** `specs/320-plans-admin-list.md`, escrita antes del código.
- **Prompt clave:** «tarea: PlansAdminList (organismo) #320». Sin Figma; Nayeli eligió
  conservar todas las acciones de la tabla (opción B: Editar, Activar/Desactivar y Borrar)
  y el badge de estado junto a los botones.
- **Qué generó el agente:** la spec; el organismo `PlansAdminList` (lista `ul`/`li` con una
  `PlanCard` por plan, `Badge` de estado, las tres acciones emitidas como callbacks,
  esqueletos con «Cargando…» y `EmptyState`); y siete tests.
- **Aceptado:** organismo presentacional (la página conserva `window.confirm` y las
  mutaciones); variantes de botón idénticas a la tabla; «Nuevo plan» fuera de la lista
  (se decide en #317).
- **Rechazado o cambiado, y por qué:** quitar toggle y borrar por los criterios de la epic —
  Nayeli optó por la opción B, conservarlos; paginación dentro del organismo — es decisión
  de la página, va a #317.
- **Errores o alucinaciones del agente y cómo se corrigieron:** dos tests fallaron: (1) el
  assert del precio usaba `getByText(formatPrice(…))`, pero `Intl` es-ES inserta un NBSP y
  testing-library v10 normaliza el texto del DOM y no el matcher → se convierte el NBSP a
  espacio normal en el expected; (2) el conteo de esqueletos esperaba 3 nodos
  `.animate-pulse` cuando hay 9 (3 tarjetas × 3 líneas) → se cuentan los `li`. `lint`,
  `format`, los 376 tests y `build` en verde tras corregir.
- **Revisión humana:** pendiente en el PR.

### #319 PlanEditForm (organismo)

- **Fecha:** 2026-10-16
- **Persona, herramienta y modelo:** Nayeli, OpenCode, modelo gratuito (MiMo Flash).
- **Spec:** `specs/319-plan-edit-form.md`, escrita antes del código.
- **Prompt clave:** «tarea: PlanEditForm (organismo) #319». Nayeli respondió a las dudas del agente:
  la descripción se queda (opción A), patrón presentacional nuevo, organismo solo sin tocar la
  página y «Cancelar» conservado.
- **Qué generó el agente:** la spec; el organismo `PlanEditForm` (`FormField` para nombre,
  descripción, precio y duración, `Toggle` de activo, «Guardar cambios» y «Cancelar»; validación
  de precio y duración con los mensajes actuales; `error` de servidor en `Alert`); y nueve tests.
- **Aceptado:** patrón presentacional (`onSubmit`, `isLoading`, `error`, `onCancel`) como
  `LoginForm`/`RegisterForm`; descripción conservada; `PlansPage` intocada hasta #317; copys
  idénticos a los del formulario actual.
- **Rechazado o cambiado, y por qué:** descripción fuera del formulario — Nayeli la conserva
  porque la `PlanCard` la muestra y nadie podría editarla; modo «crear» en el organismo — se
  queda en el `PlanForm` viejo hasta #317.
- **Errores o alucinaciones del agente y cómo se corrigieron:** cuatro tests fallaron: (1) el
  `input type="number"` devuelve valor numérico en jsdom, no cadena; (2) y (3) la validación
  nativa del navegador (`required` y `min`) bloqueaba el envío antes de la lógica propia y
  destapó que los mensajes «mayor que 0»/«entero de días» no llegan a aparecer nunca en el
  navegador real → se añade `noValidate` al formulario para que la validación propia sea la
  visible (documentado en la spec); (4) con `isLoading` el nombre accesible del botón es
  «Cargando…», como en `RegisterForm.test`. `lint`, `format`, los 385 tests y `build` en verde
  tras corregir.
- **Revisión humana:** pendiente en el PR.

### #317 PlansPage de admin (composición)

- **Fecha:** 2026-10-16
- **Persona, herramienta y modelo:** Nayeli, OpenCode, modelo gratuito (MiMo Flash).
- **Spec:** `specs/317-admin-plans-page.md`, escrita antes del código.
- **Prompt clave:** «tarea: PlansPage (composición) #317». Nayeli decidió con el equipo conservar
  «Nuevo plan» (opción A) y la paginación actual (opción A), y aprobó el formulario dentro del
  `Sheet` con `title` + `hideTitle`; también confirmó borrar el `PlanForm` viejo tras explicarle
  por qué quedaba sin consumidores.
- **Qué generó el agente:** la spec; la `PlansPage` nueva (`Sheet` + `PlansAdminList` +
  `PlanEditForm`, una única mutación `save` que crea o edita, invalida y cierra; paginación y
  confirms intactos); `PlanEditForm` en modo creación (`plan` opcional) y con `hideTitle`; el
  borrado de `pages/admin/plans/PlanForm.tsx`; y los tests: 8 de página (7 reescritas contra el
  nuevo DOM + paginación) y 3 nuevos del organismo.
- **Aceptado:** crear se queda (decisión del equipo frente a los AC, que lo dejan fuera);
  payload de `update` con `is_active`; container + `page__header` como las páginas admin
  hermanas; el bloque `parsePriceCents` conservado donde estaba.
- **Rechazado o cambiado, y por qué:** borrar «Nuevo plan» — la epic manda decidir con el equipo
  antes de quitarlo y el equipo lo conserva; traer todos los planes de golpe — se mantiene la
  paginación de 10 por página; duplicar el encabezado del formulario — el `Sheet` pone el título
  y el form oculta el suyo con `hideTitle`.
- **Errores o alucinaciones del agente y cómo se corrigieron:** tres: (1) el test de paginación
  buscaba el botón por «Siguiente», pero el `Pagination` pone `aria-label="Página siguiente"`
  que pisa el texto visible → se usa el nombre accesible real; (2) el build falló con
  `save.isLoading`: en TanStack Query v5 las mutaciones usan `isPending`; (3) un edit del test
  del organismo no encontraba su texto porque una corrección previa ya había cambiado el assert.
  `lint`, `format`, los 389 tests y `build` en verde tras corregir.

### #113 Despliegue en Render (también #111 y #112)

- **Fecha:** 2026-10-16
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/113-deploy-to-render.md`, escrita antes del código.
- **Prompt clave:** «ya tengo cuenta en render y vercel y cloudfare… nosotros seguimos a tu
  criterio». El agente revisó el tablero, propuso lo mínimo para desplegar el lunes y eligió Render
  porque da gratis las tres piezas (API en Docker, PostgreSQL y web estática) y se configura con un
  archivo versionado.
- **Qué generó el agente:** la spec; `render.yaml` (Blueprint con base de datos, API y web);
  cambios en `backend/Dockerfile` (puerto de la plataforma, `--proxy-headers`, seed opcional con
  `SEED_DEMO_DATA`); la conversión de la `DATABASE_URL` de Render al driver psycopg en
  `app/core/config.py` con 4 tests; y `docs/deploy.md` con los pasos y la prueba de humo.
- **Aceptado:**
  - `--proxy-headers`: sin él, todas las peticiones llegan con la IP del proxy y el límite de
    intentos de login (#409) bloquearía a todos los usuarios a la vez.
  - El seed al arrancar solo si `SEED_DEMO_DATA=true`, porque el plan gratuito no tiene consola
    para lanzarlo a mano; el seed ya no hace nada si hay usuarios.
  - No tocar código del frontend: la URL de la API va en `VITE_API_URL` y las rutas se reescriben
    a `index.html` en `render.yaml`.
- **Rechazado o cambiado, y por qué:** Vercel para la web y Cloudflare delante: funcionan, pero
  añaden una segunda plataforma y otra configuración de CORS sin ganar nada para la demo.
- **Errores o alucinaciones del agente y cómo se corrigieron:** un *docstring* pasaba de los 100
  caracteres; se acortó.
- **Comprobado a mano:** se construyó la imagen y se arrancó contra un PostgreSQL vacío con una URL
  `postgresql://` como la de Render y `PORT=10000`: migraciones, seed, `/health`, login y estado
  `healthy`. Con `X-Forwarded-For` distintos el login nunca dio 429; con el mismo, al sexto
  intento. Tras reiniciar seguía habiendo 3 usuarios (el seed no duplica).
- **Revisión humana:** pendiente en el PR.

### #414 Login con GitHub (OAuth2)

- **Fecha:** 2026-10-16
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/414-social-login-with-github.md`, escrita antes del código.
- **Prompt clave:** «seguimos con las tareas a tu criterio». El agente preguntó cómo entregar la
  sesión al volver de GitHub. Eva eligió la opción recomendada: la API redirige a la web con los
  tokens en el fragmento de la URL (`#access_token=...`), que el navegador no envía a ningún
  servidor.
- **Qué generó el agente:** la spec; `app/services/social_login_service.py`; los endpoints
  `GET /auth/github/login` y `GET /auth/github/callback`; las variables `GITHUB_CLIENT_ID`,
  `GITHUB_CLIENT_SECRET` y `GITHUB_REDIRECT_URI` (con valores falsos en `.env.example` y pedidas en
  el panel de Render); 21 tests; y las filas de `docs/errores.md` y `docs/deploy.md`.
- **Aceptado:**
  - Sin dependencias nuevas: `httpx` ya viene con `fastapi[standard]`.
  - Sin columnas nuevas: la cuenta se identifica por el email principal **verificado** de GitHub.
    Si existe, se enlaza; si no, se crea un socio con el email ya verificado.
  - Protección CSRF con un `state` aleatorio en una cookie `HttpOnly` y `SameSite=Lax`, limitada
    a la ruta del callback.
  - Las cuentas con 2FA (#415) no pueden entrar por GitHub, para que no se salten el segundo paso.
  - Los tests nunca llaman a GitHub: el intercambio se prueba con `httpx.MockTransport`.
- **Rechazado o cambiado, y por qué:**
  - Firmar el `state` como JWT sin cookie: no lo ata al navegador que empezó el login.
  - Google: con un proveedor se cumple el criterio, y Eva ya tiene cuenta de GitHub para registrar
    la app. El agente eligió GitHub por lo fácil que es registrar la app, sin pensar en quién usa
    un gimnasio.
  - **El botón en la web.** Eva preguntó qué pinta «Entrar con GitHub» en la app de un gimnasio,
    con razón: un socio no tiene cuenta de GitHub. Se decidió dejarlo solo en el backend, como
    integración OAuth2 demostrable, y se cerró la tarea de frontend #476. Con socios reales se
    usaría Google con el mismo flujo.
- **Errores o alucinaciones del agente y cómo se corrigieron:**
  - Un `sed` para acortar el *docstring* del módulo borró las comillas de cierre; se corrigió con
    una edición directa.
  - Los tests usaban emails `@github.test`, que la validación de email rechaza. Eso destapó un
    fallo real: un email de GitHub que no pasara la validación habría dado un 500. Ahora vuelve a
    la web con un mensaje, y hay un test para ese caso.
  - Se olvidó declarar el 422 del callback en OpenAPI; lo detectaron los tests de la #402.
- **Revisión humana:** pendiente en el PR.

### #308 Tarjeta resumen de entrenadores (organismo)

- **Fecha:** 2026-10-15
- **Persona, herramienta y modelo:** Elena, OpenCode, modelo gratuito (OpenCode Zen).
- **Spec:** `specs/308-trainers-summary-card.md`, escrita antes del código.
- **Prompt clave:** «Tarjeta resumen de entrenadores (organismo) #308». Era una decisión pendiente
  (no estaba en Figma) y no había datos en la API; el agente paró y preguntó. Elena eligió
  **componer en cliente**.
- **Qué generó el agente:** la spec; el hook `useTrainersSummary` (compone `GET /users?role=trainer`
  activos con `GET /classes?trainer_id=` y `GET /class-schedules?class_id=` para contar sesiones
  semanales); el organismo `TrainersSummaryCard` con `ChartCard`; su enganche en `AdminDashboardPage`;
  y tests del hook, del organismo y de la página.
- **Aceptado:** composición en cliente sin backend nuevo; la tarjeta al final del panel.
- **Rechazado o cambiado, y por qué:** pedir un endpoint de backend (como planteaba #310): se cerró
  como innecesario; para dos cifras, componer las llamadas existentes es suficiente.
- **Errores o alucinaciones del agente y cómo se corrigieron:** ninguno relevante. El mock de
  `AdminDashboardPage.test` se amplió con el hook para no romper sus tests.
- **Revisión humana:** pendiente en el PR.

### #461 Página de verificación de correo electrónico

- **Fecha:** 2026-10-16
- **Persona, herramienta y modelo:** Elena, OpenCode, modelo gratuito (OpenCode Zen).
- **Spec:** `specs/461-verify-email-page.md`, escrita antes del código.
- **Prompt clave:** «tarea: Interfaz de usuario: página de verificación de correo electrónico #461».
- **Qué generó el agente:** la spec; `authApi.verifyEmail(token)`; la página `VerifyEmailPage` (lee
  el `token` de la URL, `useQuery` con `enabled` y `retry: false`, estados de carga/éxito/error y
  enlaces al login o al inicio del rol); la ruta pública `/verify-email` en el `AuthLayout`; y cuatro
  tests.
- **Aceptado:** ruta pública dentro del `AuthLayout`; sin token no se llama a la API (mismo mensaje);
  enlace al inicio del rol cuando ya hay sesión.
- **Rechazado o cambiado, y por qué:** nada fuera del alcance; el envío real de correos es del
  backend, aquí solo el enlace del log.
- **Errores o alucinaciones del agente y cómo se corrigieron:** React Query v5 no admite que la
  `queryFn` devuelva `undefined` (usaba el 204 como éxito); se cambió para devolver `true` tras el
  `await`. Lo detectaron los propios tests.
- **Revisión humana:** pendiente en el PR.

### #407 Comparativa de dos modelos gratuitos

- **Fecha:** 2026-10-16
- **Persona, herramienta y modelo:** Nayeli, OpenCode, modelo gratuito (MiMo Flash).
- **Spec:** `docs/comparativa-modelos-407.md`, con la mini-spec de la tarea (molécula
  `ConfirmDialog`) y el prompt exacto, idéntico para ambos modelos.
- **Prompt clave:** la misma spec y el mismo prompt, con la restricción de no tocar nada fuera
  de la carpeta del componente; dos subagentes en paralelo, cada uno en su worktree con las
  dependencias ya instaladas.
- **Qué generó el agente:** la comparativa completa; la molécula `ConfirmDialog` ejecutada dos
  veces (MiMo Flash y DeepSeek V4.1 Flash); la tabla de resultados (calidad, checks, tiempo,
  alucinaciones, correcciones) y la conclusión.
- **Aceptado:** ambos entregaron código listo para merge con **0 correcciones** y checks
  verificados de nuevo por la revisión humana; MiMo añadió 11 tests y fue más exhaustivo,
  DeepSeek fue ≈3× más rápido con 9 tests. Conclusión: se mantiene MiMo como modelo del
  proyecto y DeepSeek queda como alternativa para tareas pequeñas y bien cerradas.
- **Rechazado o cambiado, y por qué:** comparar con Claude — no es gratuito y la #407 exige
  modelos gratuitos (y no estaba configurado en OpenCode); se compara con DeepSeek.
- **Errores o alucinaciones del agente y cómo se corrigieron:** ninguno de los dos modelos:
  solo usaron tokens de theme.css existentes (se verificó `text-text-soft` contra el archivo)
  y copiaron bien el patrógn del `Sheet`. La revisión humana re-ejecutó los checks por sí misma
  en lugar de fiarse del autocertificado de cada agente.
- **Revisión humana:** pendiente en el PR.

### #139 Tests E2E de los flujos principales

- **Fecha:** 2026-10-16
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/139-e2e-main-flows.md`, escrita antes del código.
- **Prompt clave:** «asígnanos la tarea 139». Antes de escribir, el agente revisó lo que ya
  había en `frontend/tests/e2e/`: login, reservar y cancelar ya estaban cubiertos (`auth.spec.ts`
  y `member.spec.ts`), así que solo faltaba el acceso prohibido por rol, y no duplicó lo demás.
- **Qué generó el agente:** la spec y `frontend/tests/e2e/access.spec.ts`, con 8 tests: una ruta
  protegida sin sesión lleva al login; seis combinaciones de rol equivocado acaban en «403 · Acceso
  denegado»; y el rol correcto entra sin bloqueo. Usa el `mockApi` existente, sin backend real.
- **Aceptado:** no tocar el código de la aplicación ni los tests existentes; los permisos de la
  API ya los cubre `backend/tests/integration/test_permissions.py`.
- **Comprobado a mano:** se desactivó un momento la comprobación de rol de `ProtectedRoute` y
  fallaron justo los 6 tests de rol equivocado, así que los tests detectan el fallo; después se
  restauró el archivo. `lint`, `test` (399), `build` y los 18 tests E2E en verde.
- **Errores o alucinaciones del agente y cómo se corrigieron:** ninguno en el código. En local,
  `format:check` avisa de 8 archivos de configuración que no son de esta tarea: en el repositorio
  tienen finales de línea LF, pero Windows los deja en CRLF (`core.autocrlf`). En la CI, con
  Linux, pasan.
- **Revisión humana:** pendiente en el PR.

### #486 Nombre del entrenador en las respuestas de clases

- **Fecha:** 2026-10-17
- **Persona, herramienta y modelo:** Eva, Claude Code, Claude Opus 5.5.
- **Spec:** `specs/486-trainer-name-in-class-responses.md`, escrita antes del código.
- **Prompt clave:** Eva vio en la web el mensaje «Input should be less than or equal to 100» y
  preguntó qué era. El agente encontró que las pantallas del socio pedían 200 elementos y, al
  revisarlas, que además llamaban a `GET /users` y `GET /bookings`, que un socio no puede usar
  (403). Preguntó de dónde sacar el nombre del entrenador; Eva eligió añadirlo a la API. Se
  abrieron dos tareas: esta (backend) y la #487 (frontend).
- **Qué generó el agente:** la spec; la propiedad `GymClass.trainer_name`; el campo
  `trainer_name` en `GymClassRead`; la carga de los entrenadores junto con la lista
  (`selectinload`); y 6 tests.
- **Aceptado:** exponer solo el nombre completo del entrenador, nunca su email; sin migración.
- **Errores o alucinaciones del agente y cómo se corrigieron:** el test que comprueba que la lista
  no hace una consulta por clase **pasaba también sin el arreglo**: la sesión de los tests ya tenía
  los entrenadores en memoria. El agente lo vio al quitar a propósito la carga conjunta; vació esa
  memoria en el test y ahora falla sin el arreglo (4 consultas en vez de 3) y pasa con él.
- **Comprobado a mano:** `ruff` y `pytest` (1352 tests, 98,9 %).
- **Revisión humana:** pendiente en el PR.
