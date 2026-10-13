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
