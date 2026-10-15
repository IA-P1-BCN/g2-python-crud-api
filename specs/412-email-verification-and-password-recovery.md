# Spec 412: verificación de email y recuperación de contraseña

- **Tarea:** #412
- **Nivel del briefing:** Avanzado
- **Estado:** escrita antes del código (15 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User, Token)

## Historias de usuario

- Como persona que se registra, quiero confirmar que el email es mío, para que la cuenta quede
  verificada.
- Como usuario que ha olvidado su contraseña, quiero poner una nueva desde un enlace temporal.

## Decisión (15 de octubre)

**No se envían correos de verdad.** Un único punto de envío escribe el mensaje y su enlace en el
log del backend. Conectar un proveedor real más adelante es cambiar solo ese punto.

## Requisitos

1. `users` gana `email_verified_at` (vacía si no está verificado), con migración. Las cuentas que
   ya existían quedan sin verificar.
2. Dos tokens temporales nuevos, de tipos distintos a los de sesión:
   - **verificación de email**: dura `EMAIL_VERIFICATION_EXPIRE_HOURS` (24).
   - **recuperación de contraseña**: dura `PASSWORD_RESET_EXPIRE_MINUTES` (30) y vale **una vez**.
3. **Registro:** se «envía» el enlace `{FRONTEND_URL}/verify-email?token=...`.
4. **`POST /auth/verify-email`** `{"token"}` → 204 y marca el email como verificado. Repetirlo no
   es un error.
5. **`POST /auth/forgot-password`** `{"email"}` → **202 siempre**, exista o no la cuenta. Si existe
   y está activa, se «envía» `{FRONTEND_URL}/reset-password?token=...`.
6. **`POST /auth/reset-password`** `{"token", "new_password"}` → 204. Contraseña fuerte. El token
   queda gastado.
7. Enlace caducado, manipulado, de otro tipo o ya usado → **400** (no 401, para que el frontend
   no lo trate como sesión caducada).
8. El cambio por recuperación queda en la auditoría (#410), hecho por el propio usuario.

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| Registro | 201 como antes; el log tiene el enlace de verificación |
| Verificar con el token del correo | 204; `email_verified_at` rellena |
| Verificar dos veces | 204; se conserva la primera fecha |
| Token de verificación caducado, manipulado o de otro tipo | 400 |
| Recuperación de una cuenta activa | 202; el log tiene el enlace |
| Recuperación de un email inexistente o de una cuenta dada de baja | 202; no se envía nada |
| Restablecer con token válido | 204; la contraseña nueva entra y la antigua no |
| Restablecer dos veces con el mismo token | La segunda, 400 |
| Restablecer con contraseña débil | 422 y no cambia nada |
| Restablecer con token caducado o manipulado, o de una cuenta dada de baja | 400 |
| Token de verificación o recuperación usado como token de sesión | 401 |
| Duraciones y `FRONTEND_URL` | Variables de entorno, en `.env.example` |

## Fuera de alcance

- Envío real de correos; reenviar la verificación.
- Bloquear el login a quien no ha verificado (rompería las cuentas de demo y el frontend).
- Mostrar en la API si un email está verificado; cerrar sesiones al restablecer.
- Las pantallas del frontend.
