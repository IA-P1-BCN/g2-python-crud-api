# Spec 406: login

- **Tarea:** #406 (specs retroactivas de las historias ya construidas).
- **Historia de usuario:** Como socio o entrenador, quiero iniciar sesión con mi email y mi
  contraseña para acceder a mi zona de la aplicación.
- **Retroactiva:** esta spec se escribió **después** del código, el 16 de octubre de 2026. El
  comportamiento descrito es el que ya está en `dev`: el backend de autenticación es de la
  parte 1 y se fue ampliando (refresh/logout #408, límite de intentos #409, 2FA #415/PR #471);
  el frontend se rediseñó en la epic de login #247 (`LoginForm` #249, `LoginPage` #251).

## Requisitos

1. `POST /auth/login` recibe JSON `{ email, password, totp_code? }` y devuelve **200** con
   `{ access_token, refresh_token, token_type: "bearer", user }`.
2. `POST /auth/token` es el mismo login en formato OAuth2 Password Flow (`username` = email,
   formulario), para el botón **Authorize** de `/docs`; aplica las mismas reglas.
3. Una cuenta con verificación en dos pasos activa debe enviar `totp_code` de 6 cifras en
   `/auth/login`; `/auth/token` no admite el código y responde 403 indicando que use
   `/auth/login`.
4. Credenciales incorrectas: **401** «Email o contraseña incorrectos». El mensaje es **el mismo**
   para email inexistente y contraseña errónea (no se revela cuál falló).
5. Cuenta desactivada (`is_active = false`): **403** «La cuenta está desactivada». Una baja no
   borra la cuenta; solo impide el acceso (ver spec de baja).
6. Validación de entrada: **422** si falta `email`/`password`, el email no tiene formato válido
   o `totp_code` no son 6 cifras.
7. Límite de intentos: tras varios intentos fallidos se responde **429**; el contador lo
   comparten `/auth/login` y `/auth/token` y también cuenta los logins correctos (spec #409).
8. La respuesta **nunca** expone la contraseña: se guarda como hash Argon2 (`hashed_password`).
9. Devuelve también el `refresh_token`, que sirve para renovar el access token sin repetir el
   login (spec #408).

## Criterios de aceptación

- [x] Login correcto con JSON y con el formulario OAuth2 devuelve token de acceso y de refresco.
- [x] Email inexistente y contraseña incorrecta devuelven el mismo 401.
- [x] Una cuenta dada de baja recibe 403 y no puede entrar.
- [x] Con 2FA activo, el login pide el código de 6 cifras.
- [x] El límite de intentos responde 429 y es común a ambos endpoints.
- [x] Ninguna respuesta incluye la contraseña ni su hash.

## Vocabulario

[User](ontology.md#user) · [Token](ontology.md#token) ·
[Autenticación vs. autorización](ontology.md#glosario-términos-que-no-se-deben-confundir).

## Tests que la cubren

- `backend/tests/integration/test_auth.py`: `test_login_returns_a_token_for_the_user`,
  `test_login_after_register`, `test_login_with_wrong_password_returns_401`,
  `test_login_with_unknown_email_returns_401`,
  `test_login_gives_the_same_error_for_unknown_email_and_wrong_password`,
  `test_login_with_a_deactivated_account_returns_403`,
  `test_login_requires_email_and_password`.
- `backend/tests/integration/test_oauth2_token.py`: credenciales válidas, mismo 401, 403 de
  cuenta desactivada, y que el token abre un endpoint protegido.
- `backend/tests/integration/test_login_rate_limit.py`: 429 al superar el límite, incluso con
  la contraseña correcta, y contador compartido entre los dos endpoints.
- `backend/tests/integration/test_two_factor.py`: login que exige el código TOTP.
- Frontend: `frontend/tests/unit/LoginPage.test.tsx` y
  `frontend/src/components/ui/organisms/LoginForm/LoginForm.test.tsx`.

## Specs compañeras (no se repite aquí)

- #398 `398-oauth2-password-flow.md` · #408 `408-refresh-tokens-and-logout.md` ·
  #409 `409-login-rate-limiting.md` · #415 `415-two-factor-authentication.md`.

## Fuera de alcance

Registro (spec propia `406-registro.md`), refresh/logout, rate limiting, 2FA, verificación de
email y recuperación de contraseña (specs compañeras) y login con GitHub (en desarrollo en #414,
todavía no en `dev`).
