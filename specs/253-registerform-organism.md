# #253 · Formulario de registro (organismo)

Parte de #252 (Página de registro). Extrae el formulario de `pages/RegisterPage.tsx` a un organismo
reutilizable, sin cambiar su comportamiento.

## Alcance

- `components/ui/organisms/RegisterForm`: nombre, correo y contraseña (con la regla de fortaleza),
  enviar y enlace a **Iniciar sesión**, más los estados de **error** (Alert cerrable) y **carga**.
  Usa `FormField`, `PasswordField`, `Button` y `Alert`.
- `pages/RegisterPage.tsx` se queda con la lógica: `useAuth` (register, `isLoading`, `error`), el
  `Navigate` si ya hay sesión y la redirección por rol tras registrarse; delega el formulario.

## Decisiones

- Organismo **presentacional**: guarda los campos, valida la contraseña con `passwordErrorMessage` y
  llama a `onSubmit(values)`; la página hace el registro y navega.
- Se conservan textos, `aria-label` y nombres accesibles, para no tocar la suite de `RegisterPage`
  ni el e2e de auth.

## Pruebas

`RegisterForm.test.tsx`: envía los valores, no envía si la contraseña no cumple la regla, pinta y
cierra el error, deshabilita el envío mientras carga y enlaza con el login. La suite de
`RegisterPage` y el e2e no cambian.
