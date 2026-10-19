# Spec 432: renovar la sesión con el token de refresco y revocarla en el logout

- **Tarea:** #432
- **Nivel del briefing:** Avanzado («Frontend: renew the session with the refresh token and revoke it on logout»)
- **Estado:** escrita antes del código (19 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User, Token)
- **Backend:** #408, ya en `dev` (PR #433). Esta spec no toca el backend.

## Historia de usuario

Como usuario, quiero que mi sesión se renueve sola y que al cerrarla se cierre de verdad, para no
ser echado cada hora y para que nadie pueda reutilizar mi sesión.

## Contexto

El backend ya lo permite (#408): el registro y el login devuelven `access_token` y `refresh_token`,
`POST /api/v1/auth/refresh` cambia un refresco válido por un acceso nuevo, y
`POST /api/v1/auth/logout` revoca el acceso con el que se llama y, si se envía, el refresco.

El frontend lo ignora. `auth/tokenStorage.ts` solo guarda `gym.token` y `gym.user`, así que el
`refresh_token` se tira en cuanto el login devuelve. `api/client.ts` responde a cualquier 401
borrando la sesión y avisando a `AuthContext`, que navega al login: al cumplirse los 60 minutos del
token de acceso, al usuario lo echan. Y `logout` solo hace `tokenStorage.clear()`: la sesión sigue
válida en el servidor hasta que caduca, con lo que un token copiado sigue sirviendo.

## Requisitos

1. `tokenStorage` guarda el `refresh_token` junto al acceso y al usuario, y los tres se borran
   juntos.
2. Si una petición responde 401, el cliente llama a `/auth/refresh` una vez, guarda el token de
   acceso nuevo y repite la petición original. Si el refresco falla, se comporta como hoy: borra la
   sesión y avisa para ir al login.
3. Varias peticiones que fallan a la vez provocan **un solo** refresco.
4. «Cerrar sesión» llama a `POST /auth/logout` enviando el `refresh_token` en el cuerpo y después
   borra los dos tokens del navegador, **aunque la llamada falle**.
5. Tipos de la API regenerados (`npm run api:types`).
6. Tests del cliente de la API y del contexto de sesión.

## Decisiones

- **Se refresca ante cualquier 401 de un endpoint protegido, no solo cuando el cuerpo dice
  «caducado».** El backend distingue los casos con mensajes propios («El token ha caducado», «El
  token ha sido revocado», «Token inválido»); compararlos por texto en el frontend se rompería si
  alguien cambia una cadena. Intentar el refresco una vez es inocuo: en el peor caso falla y se
  cierra la sesión como ahora. De paso cubre el token **revocado** (sesión cerrada en otra pestaña),
  que el AC no contempla.
- **Quedan fuera del refresco `/auth/login`, `/auth/register`, `/auth/refresh`,
  `/auth/forgot-password`, `/auth/reset-password` y `/auth/verify-email`.** En los dos primeros un
  401 es una contraseña equivocada, en `/auth/refresh` provocaría un bucle y los de enlaces no
  tienen sesión. Todo lo demás, incluido `/auth/logout`, se trata como protegido.
- **La llamada de refresco vive en `api/client.ts`, no en `authApi`.** `auth.ts` importa
  `apiClient` de `client.ts`; si `client.ts` importara `authApi` al revés habría una importación
  circular. El cliente marca la petición de refresco para que su propio 401 no dispare otro.
- **Sin `refresh_token` guardado no se intenta refrescar.** Se va directo al comportamiento actual,
  que es además el caso del login fallido.
- **El logout borra siempre en local.** `POST /auth/logout` es best-effort: si no hay red o el
  backend falla, el usuario igualmente sale de la sesión; si no, se quedaría sin poder cerrar.
- **El refresco es reactivo, no proactivo.** No se adelanta la renovación antes de la caducidad;
  ocurre cuando llega el 401.

## Criterios de aceptación

| Caso | Resultado esperado |
| --- | --- |
| Login o registro correctos | Se guardan `access_token`, `refresh_token` y `user` |
| 401 de un endpoint protegido con refresco válido | Una llamada a `/auth/refresh`, se guarda el acceso nuevo y se repite la petición original con éxito |
| 401 con el refresco caducado o revocado | No se reintenta; se borra la sesión y se va al login, como hoy |
| 401 en `/auth/login` (contraseña mala) | No se intenta refrescar; el error llega al formulario |
| 401 en `/auth/refresh` | No se intenta refrescar otra vez: sin bucle |
| Cinco peticiones que fallan a la vez | Una sola llamada a `/auth/refresh`; las cinco se repiten |
| Recarga con el acceso caducado y el refresco válido | `/auth/me` se repite tras el refresco y la sesión se restaura |
| Sin `refresh_token` guardado | 401 → se borra la sesión y se avisa, como hoy |
| Logout correcto | `POST /auth/logout` con el `refresh_token`; se borran los dos tokens; a `/login` |
| Logout sin red o con 500 | Se borran los dos tokens igualmente y se va a `/login` |
| Logout sin `refresh_token` guardado | `POST /auth/logout` sin cuerpo; se borra el acceso |
| Refresco caducado a los 7 días | Como hoy: al login |
| Tipos | `npm run api:types` no añade cambios inesperados |

## Tests

Se amplían los dos archivos que ya existen, sin borrar ninguna prueba:

- `tests/unit/api.client.test.ts`: refresco y reintento; un solo refresco ante varios 401
  simultáneos; sin refresco en `/auth/login` ni en `/auth/refresh`; refresco fallido → borra y
  avisa una sola vez. La prueba actual «un 401 borra la sesión y avisa al handler» se conserva
  ajustando la firma de `setSession`.
- `tests/unit/AuthContext.test.tsx`: `logout` llama al backend con el refresco y después borra;
  también con la llamada fallida. Se ajusta la llamada a `setSession`, cuya firma cambia.

## Fuera de alcance

- Rotación de tokens de refresco (el backend devuelve el mismo; anotada como mejora en #408).
- Refresco proactivo antes de que caduque el acceso.
- Compartir la sesión entre pestañas (`localStorage` y el evento `storage`).
- El callback de GitHub OAuth: el frontend todavía no tiene la ruta `/auth/callback` que espera el
  backend, así que no hay otro sitio que guarde tokens.
- Bajar la duración del token de acceso por debajo de 60 minutos, que en #408 se dejó para cuando
  el frontend usara el refresco.
