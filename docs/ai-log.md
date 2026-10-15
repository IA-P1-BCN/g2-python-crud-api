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
