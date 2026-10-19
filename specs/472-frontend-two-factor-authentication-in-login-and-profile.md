# Spec 472: Frontend: two-factor authentication in the login and the profile

## Objetivo
Implementar la 2FA en el front: pedir código al hacer login si el backend responde
`401 code: "totp_required"`, y gestionar activación/desactivación en el perfil.

## Criterios de aceptación
- Login: si `POST /api/v1/auth/login` responde 401 con `code: "totp_required"`, pedir código de 6 dígitos y repetir el login enviando `totp_code`. Si responde `totp_invalid`, mostrar el mensaje de la API.
- Perfil: sección "Verificación en dos pasos" para activarla con `/2fa/setup` + `/2fa/enable`.
- Perfil: si está activa, botón para desactivarla con `/2fa/disable`.
- Mensajes de error visibles (400, 409).
- Diseño nuevo (tokens y componentes de `components/ui`).
- Tipos regenerados y tests para login y perfil.

## Dependencias de backend
- `POST /api/v1/auth/login` admite `totp_code` opcional.
- `POST /api/v1/auth/2fa/setup`
- `POST /api/v1/auth/2fa/enable`
- `POST /api/v1/auth/2fa/disable`

## Plan
1. Regenerar tipos.
2. Añadir métodos en `authApi`.
3. Ajustar `LoginPage` para el segundo paso.
4. Añadir sección de 2FA a `ProfilePage`.
5. Escribir tests unitarios y comprobar lint/test/build.
