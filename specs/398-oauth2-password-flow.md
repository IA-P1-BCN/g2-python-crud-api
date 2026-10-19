# Spec 398: login con OAuth2 Password Flow y botón Authorize

- **Tarea:** #398
- **Nivel del briefing:** Esencial
- **Estado:** escrita antes del código (13 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User, Role, Token)

## Historia de usuario

Como persona que integra otro producto con el servicio de usuarios, quiero iniciar sesión desde
Swagger con mi email y mi contraseña, para probar los endpoints protegidos sin copiar tokens a mano.

## Contexto

Hoy `POST /auth/login` recibe JSON y devuelve un JWT. La documentación declara el esquema de
seguridad como «Bearer»: el botón **Authorize** de `/docs` pide pegar el token. Funciona, pero no es
el flujo estándar *OAuth2 Password Flow* que pide el briefing, en el que Swagger pide usuario y
contraseña y obtiene el token solo.

## Requisitos

1. Existe `POST /api/v1/auth/token`, que recibe un formulario (`application/x-www-form-urlencoded`)
   con los campos estándar de OAuth2: `username` y `password`. En `username` va el email.
2. La respuesta incluye `access_token` y `token_type: "bearer"`, como exige OAuth2. Puede incluir
   además el usuario, igual que el login actual.
3. El esquema de seguridad de la API pasa a ser OAuth2 Password Flow apuntando a ese endpoint.
4. `POST /api/v1/auth/login` con JSON no cambia: el frontend lo usa.
5. Existe `GET /api/v1/users/me`, que devuelve el usuario del token. `GET /api/v1/auth/me` se
   mantiene y devuelve lo mismo.
6. Las reglas de acceso son las mismas en los dos logins. No se escribe dos veces la comprobación
   de credenciales.

## Criterios de aceptación

| Caso | Resultado esperado |
| --- | --- |
| Formulario con email y contraseña correctos | 200 con `access_token` y `token_type: "bearer"`; el token sirve en un endpoint protegido |
| Contraseña incorrecta | 401, `code: unauthorized`, «Email o contraseña incorrectos» |
| Email que no existe | 401 con la misma respuesta exacta que el caso anterior |
| `username` que no tiene forma de email | 401 con esa misma respuesta, nunca un 500 |
| Cuenta dada de baja | 403, `code: forbidden`, «La cuenta está desactivada» |
| Falta `username` o `password` | 422 |
| Mismo cuerpo enviado como JSON a `/auth/token` | 422: el endpoint solo acepta formulario |
| `POST /auth/login` con JSON | Igual que antes de esta tarea |
| `GET /users/me` con token válido | 200 con el usuario, sin contraseña |
| `GET /users/me` sin token, o con token caducado o manipulado | 401, `code: unauthorized` |
| `GET /users/me` con cualquier rol | 200: no depende del rol |
| `GET /users/{id}` con un id numérico | Igual que antes: `me` no se confunde con un id |
| `/openapi.json` | El esquema de seguridad es de tipo `oauth2`, flujo `password`, con `tokenUrl` en `/api/v1/auth/token` |
| Petición protegida sin token | Sigue respondiendo 401 con el formato de error de la API, no el de FastAPI por defecto |

## Seguridad

- El endpoint de token no revela si un email existe: misma respuesta para email desconocido y
  contraseña incorrecta.
- La contraseña nunca aparece en una respuesta ni en los logs.
- No cambia cómo se firma ni cómo se valida el JWT.

## Fuera de alcance

- Tokens de refresco y logout (#408).
- Límite de intentos de login (#409).
- Cambios en el frontend: sigue usando `POST /auth/login`.
- Otros flujos de OAuth2 (authorization code, login social).
