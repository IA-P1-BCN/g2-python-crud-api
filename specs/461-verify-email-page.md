# #461 · Página de verificación de correo electrónico

Depende de #412 (backend ya en `dev`): al registrarse se «envía» el enlace
`sitio/verify-email?token=...`, y `POST /api/v1/auth/verify-email` `{"token"}` responde 204 (o 400
con "El enlace no es válido o ha caducado").

## Criterios de aceptación

1. Ruta pública `/verify-email` que lee el `token` de la dirección y llama a
   `POST /auth/verify-email` con `{"token"}`.
2. Estado de carga mientras espera.
3. Si responde 204, mensaje de éxito con enlace al login (o al inicio si ya hay sesión).
4. Si responde 400, el mensaje de la API y un enlace al login.
5. Sin `token` en la dirección, el mismo mensaje de enlace no válido, **sin llamar** a la API.
6. Diseño nuevo (tokens + `components/ui`) y tests de la página.

## Alcance

- `api/auth.ts`: `authApi.verifyEmail(token)` (`POST /auth/verify-email`).
- `pages/VerifyEmailPage.tsx`: lee el token con `useSearchParams`; `useQuery` (con `enabled` y
  `retry: false`) sólo cuando hay token; estados de carga, éxito y error; enlaces según haya sesión.
- `App.tsx`: ruta pública `/verify-email` dentro de `AuthLayout`.

## Pruebas

`tests/unit/VerifyEmailPage.test.tsx`: verifica con token y enlaza al login; muestra el mensaje de la
API en el 400; sin token avisa sin llamar a la API; y enlaza al inicio del rol si ya hay sesión.
