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
