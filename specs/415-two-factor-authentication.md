# Spec 415: autenticación en dos pasos (2FA con TOTP)

- **Tarea:** #415
- **Nivel del briefing:** Experto
- **Estado:** escrita antes del código (15 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User, Token)

## Historia de usuario

Como usuario, quiero que entrar en mi cuenta pida, además de la contraseña, un código de mi móvil,
para que una contraseña robada no baste.

## Decisiones (15 de octubre)

- El código va en un **campo opcional del login** (`totp_code` en `POST /auth/login`).
- Los códigos se calculan con la librería **`pyotp`** (TOTP estándar: 6 cifras cada 30 segundos).

## Requisitos

1. `users` gana `totp_secret` y `totp_enabled_at` (vacío si está desactivado), con migración.
2. **Activar**, en dos pasos para no dejar a nadie fuera con un secreto mal copiado:
   - `POST /auth/2fa/setup` (con sesión) genera un secreto y lo devuelve con su enlace
     `otpauth://`, que las apps de códigos leen como QR. Aún no está activo.
   - `POST /auth/2fa/enable` (con sesión) con `{"code"}`: si el código vale, queda activo. 204.
3. **Desactivar:** `POST /auth/2fa/disable` (con sesión) con `{"code"}`. 204 y se borra el secreto.
4. **Login con 2FA activo:** sin código → 401 `totp_required`; código incorrecto → 401
   `totp_invalid`; código correcto → sesión. La contraseña se comprueba antes, así que con una
   contraseña mala la respuesta es la de siempre y no revela si la cuenta tiene 2FA.
5. **Login de Swagger** (`/auth/token`): el formulario OAuth2 no tiene campo para el código. Con
   2FA activo responde 401 `totp_required` e indica usar `/auth/login`.
6. **El secreto no se devuelve nunca tras activarlo:** no aparece en respuestas de usuario, y
   `setup` responde 409 si el 2FA ya está activo.
7. Se acepta el código actual y el de ±30 segundos, por si el reloj del móvil va algo desfasado.
8. Activar y desactivar queda en la auditoría de usuarios (#410).

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| `setup` | 200 con `secret` y `otpauth_url`; aún no activo |
| `enable` con código correcto / incorrecto / sin `setup` previo | 204 / 400 / 400 |
| `setup` con 2FA ya activo | 409, sin secreto |
| Login sin 2FA | Igual que antes |
| Login con 2FA: sin código / código malo / código bueno | 401 `totp_required` / 401 `totp_invalid` / 200 |
| Login con 2FA y contraseña mala | 401 «Email o contraseña incorrectos» |
| `/auth/token` con 2FA | 401 `totp_required` |
| `disable` con código correcto / incorrecto | 204 / 400 y sigue activo |
| `setup`, `enable` o `disable` sin sesión | 401 |
| Respuestas de usuario | Nunca incluyen el secreto |
| Tests | Generan los códigos con el secreto y una hora fija, sin el reloj real |

## Fuera de alcance

Códigos de recuperación, que un admin desactive el 2FA de otra persona, cifrar el secreto en la
base de datos, y las pantallas del frontend.
