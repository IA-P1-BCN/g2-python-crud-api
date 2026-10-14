# Spec 408: tokens de refresco y logout con tokens revocados

- **Tarea:** #408
- **Nivel del briefing:** Avanzado («Refresh tokens y logout: lista de tokens revocados»)
- **Estado:** escrita antes del código (14 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User, Token)

## Historia de usuario

Como usuario, quiero que mi sesión se renueve sin volver a escribir la contraseña y poder cerrarla
de verdad, para que sea cómoda y segura a la vez.

## Contexto

Hoy el login devuelve un solo token JWT que dura 60 minutos. No hay forma de renovarlo: al caducar
hay que volver a entrar. Y cerrar sesión solo borra el token del navegador: si alguien lo copió,
sigue valiendo hasta que caduca.

## Requisitos

1. Hay dos tipos de token, los dos JWT firmados con la `SECRET_KEY`:
   - **de acceso**: de vida corta, abre los endpoints protegidos. Su duración sigue siendo
     `ACCESS_TOKEN_EXPIRE_MINUTES` (60 por defecto).
   - **de refresco**: de vida larga, solo sirve para pedir un token de acceso nuevo. Su duración
     es `REFRESH_TOKEN_EXPIRE_DAYS` (7 por defecto).
2. Cada token lleva su tipo y un identificador único (`jti`), para poder revocarlo de uno en uno.
3. El registro, el login con JSON y el login OAuth2 devuelven también `refresh_token`. Lo que ya
   devolvían no cambia.
4. `POST /api/v1/auth/refresh` recibe `{"refresh_token": "..."}` y devuelve un token de acceso
   nuevo, el mismo token de refresco y el usuario.
5. `POST /api/v1/auth/logout` requiere sesión. Revoca el token de acceso con el que se llama y,
   si se envía `{"refresh_token": "..."}`, también ese. Responde 204.
6. Los tokens revocados se guardan en la tabla `revoked_tokens` (identificador del token, usuario,
   fecha de caducidad y fecha de revocación), creada con una migración de Alembic.
7. Un token revocado deja de valer aunque no haya caducado.
8. El acceso a esa tabla pasa por un repositorio, como los usuarios.

## Decisiones

- **La duración del token de acceso no se acorta.** Bajarla a 15 minutos echaría de la sesión a los
  usuarios del frontend, que todavía no usa el refresco. Se puede bajar cuando el front lo use.
- **El refresco no rota el token de refresco.** Devuelve el mismo, como pide el criterio de la
  tarea. Rotarlo (un token de refresco nuevo en cada uso) es más seguro y queda como mejora.
- **El token de refresco en el logout es opcional**, para que el frontend actual pueda llamar al
  logout sin cambios. Sin él, el token de refresco sigue vivo hasta caducar; el frontend debería
  enviarlo cuando lo guarde.

## Criterios de aceptación

| Caso | Resultado esperado |
| --- | --- |
| Login (JSON u OAuth2) o registro correctos | 200 o 201 con `access_token`, `refresh_token`, `token_type` y `user` |
| Refresco con un token de refresco válido | 200 con un `access_token` nuevo que abre los endpoints protegidos |
| Refresco con un token de refresco caducado | 401, «El token ha caducado» |
| Refresco con un token de refresco revocado | 401, «El token ha sido revocado» |
| Refresco con un token de acceso en lugar de uno de refresco | 401, «Token inválido» |
| Refresco de un usuario dado de baja | 401, «La cuenta está desactivada» |
| Refresco sin cuerpo o con el campo vacío | 422 |
| Token de refresco usado como token de acceso en un endpoint protegido | 401, «Token inválido» |
| Logout con sesión | 204; el token de acceso usado deja de valer (401 «El token ha sido revocado») |
| Logout enviando también el token de refresco | 204; ese token de refresco tampoco sirve para refrescar |
| Logout enviando el token de refresco de otro usuario | 401 y no se revoca nada |
| Logout sin sesión | 401 |
| Logout dos veces con el mismo token | La segunda vez, 401: el token ya está revocado |
| Otros usuarios tras un logout | Sus tokens siguen funcionando |
| Duraciones | Configurables por variables de entorno, con valores en `.env.example` |
| Migración | `alembic upgrade head` crea `revoked_tokens` y `alembic downgrade` la quita |

## Seguridad

- Los tokens se guardan en la base de datos solo cuando se revocan, y solo su identificador, nunca
  el token entero.
- Un tipo de token no sirve en lugar del otro.
- No cambia cómo se firman los tokens ni la clave.

## Fuera de alcance

- Que el frontend guarde y use el token de refresco: es una tarea de front aparte.
- Rotación de tokens de refresco y detección de reutilización.
- Borrar de la tabla los tokens revocados que ya han caducado.
- Revocar todas las sesiones de un usuario a la vez.
