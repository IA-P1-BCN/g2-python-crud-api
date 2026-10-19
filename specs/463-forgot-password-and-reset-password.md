# Spec 463: páginas de «olvidé mi contraseña» y de restablecerla

- **Tarea:** #463
- **Nivel del briefing:** Avanzado («Frontend: forgot password and reset password pages»)
- **Estado:** escrita antes del código (19 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User, Token)
- **Backend:** #412, ya en `dev` (PR #460). Esta spec no toca el backend.

## Historia de usuario

Como usuario que olvidó su contraseña, quiero pedir un enlace de recuperación y poner una
contraseña nueva desde él, para volver a entrar en mi cuenta.

## Contexto

El backend ya lo permite (#412): `POST /api/v1/auth/forgot-password` recibe un email y responde
**202 siempre**, exista o no la cuenta, para no revelar qué emails están registrados (el enlace
sale en el log del backend, en la línea `Email to …`, porque todavía no se manda correo de
verdad). `POST /api/v1/auth/reset-password` recibe el `token` del enlace y la contraseña nueva y
responde **204**; con un token caducado o ya gastado devuelve **400** («Token inválido») y si la
contraseña no cumple la regla, **422**.

En el frontend no hay nada de esto: ni rutas, ni páginas, ni el enlace en el login, ni métodos en
`authApi`. Lo que sí existe es casi todo lo necesario para componerlo: `AuthLayout` con `/login`,
`/register` y `/verify-email`; el organismo `LoginForm`; `VerifyEmailPage`, que ya lee un `token`
con `useSearchParams` y responde con `Alert`; el molde `PasswordField`, que ya trae
mostrar/ocultar y la checklist de reglas (`showRules`); `Alert`, `FormField`, `Button` y los tokens
de `src/styles/theme.css`. `toApiError` ya traduce los 400 (el `detail` de texto) y los 422 (la
primera regla de la lista), y `src/types/schema.d.ts` ya tiene las dos operaciones.

## Requisitos

1. Enlace «¿Has olvidado tu contraseña?» en la página de login.
2. `/forgot-password` con un campo de email que llama a `POST /api/v1/auth/forgot-password` y
   muestra siempre el mismo mensaje: «Si el email está registrado, te hemos enviado un enlace».
3. `/reset-password` lee el `token` de la dirección y pide la contraseña nueva con el campo de
   contraseña común (reglas visibles y mostrar u ocultar), llamando a
   `POST /api/v1/auth/reset-password`.
4. Con 204, mensaje de éxito y enlace al login; con 400, el mensaje de la API; con 422, el mensaje
   de la regla de contraseña.
5. Diseño nuevo con los tokens de `src/styles/theme.css` y componentes de `components/ui`.
6. Tests de las dos páginas.

## Decisiones

- **El éxito de `/forgot-password` se muestra en la misma página**: el formulario se sustituye por
  un `Alert` con el mensaje fijo y un enlace «Ir a iniciar sesión», en vez de navegar a una ruta
  nueva que el AC no contempla. **Aprobado por Nayeli.**
- **Sin `token` y con sesión iniciada se trata como `/verify-email`**: si falta el token,
  «El enlace no es válido o ha caducado» más un enlace al login; con la sesión abierta no se
  comprueba nada ni se redirige. **Aprobado por Nayeli.**
- **`AuthHeroCard` solo en los estados que llevan formulario**, igual que login y registro; el
  estado sin token queda como `/verify-email`, solo tarjeta. **Aprobado por Nayeli.**
- **Los errores se reparten según el código**, que es como los distingue el AC: el 422 va bajo el
  campo con `PasswordField` (junto a la checklist de reglas, que es lo que lo hace incumplible) y
  el 400 va a un `Alert`, igual que en login. Los dos salen de `toApiError`, sin mensajes propios.
- **El enlace va dentro del organismo `LoginForm`**, debajo de la contraseña, con una prop
  `forgotPasswordHref` de la misma forma que ya tiene `registerHref`: así `LoginPage` no cambia y
  el enlace se prueba en `LoginForm.test.tsx`.
- **Las dos rutas se enrutan en `AuthLayout`**, junto a `/login` y `/register`.
- **`client.ts` no se toca**: `/auth/forgot-password` y `/auth/reset-password` ya están en la lista
  de endpoints excluidos del refresco de la #432.
- **No se comprueba si el email existe**: la API responde 202 siempre y el mensaje es idéntico en
  los dos casos.
- **Sin «enviar de nuevo»** en el mensaje de éxito, ni páginas de confirmación intermedias.

## Criterios de aceptación

| Caso | Resultado esperado |
| --- | --- |
| Página de login | Bajo la contraseña, el enlace «¿Has olvidado tu contraseña?» → `/forgot-password` |
| `/forgot-password` con email válido | `POST /auth/forgot-password`; con 202 el formulario se sustituye por «Si el email está registrado, te hemos enviado un enlace» + enlace a `/login` |
| `/forgot-password` sin email o con email malo | Validación nativa del formulario (`required`, `type="email"`), igual que en login |
| `/forgot-password` con la API caída o con 500 | `Alert` de error con el mensaje de `toApiError`, sin decir si el email existía |
| `/reset-password?token=abc` | `AuthHeroCard` + formulario con `PasswordField` (mostrar/ocultar y reglas visibles) |
| `/reset-password` sin `token` | «El enlace no es válido o ha caducado» + enlace a `/login`, como `/verify-email` |
| Reset correcto (204) | `Alert` de éxito con enlace al login |
| Token caducado o gastado (400) | El mensaje del backend en el `Alert` de error |
| Contraseña débil (422) | El mensaje de la regla bajo el campo de contraseña |
| Con sesión iniciada en las dos rutas | Se ven igual que sin sesión: sin redirección |
| Tipos | `npm run api:types` no añade cambios inesperados |

## Tests

Tres archivos, ninguno se borra:

- `src/components/ui/organisms/LoginForm/LoginForm.test.tsx`: el enlace «¿Has olvidado tu
  contraseña?» apunta a `/forgot-password`.
- `tests/unit/ForgotPasswordPage.test.tsx`: envía el email y muestra el mensaje fijo con su
  enlace; con la llamada rechazada, el `Alert` de error.
- `tests/unit/ResetPasswordPage.test.tsx`: sin token → enlace inválido y enlace al login; con
  token → formulario con el campo de contraseña; 204 → éxito; 400 → mensaje de la API; 422 →
  mensaje bajo el campo.

## Fuera de alcance

- Enviar correos de verdad: el enlace sigue saliendo en el log del backend (mención de #412).
- Flujo de dos pasos para el restablecimiento (Pedir email → esperar → introducir token a mano).
- Un botón de «reenviar enlace» en la página de éxito.
- Medir o limitar los intentos de restablecimiento desde el frontend (lo lleva el backend).
- Cambiar los mensajes o códigos del backend.
