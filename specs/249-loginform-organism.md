# #249 · Formulario de inicio de sesión (organismo)

Parte de #247 (Página de inicio de sesión). El rediseño de la página ya está en `dev`; esta tarea
**extrae el formulario** de `pages/LoginPage.tsx` a un organismo reutilizable, sin cambiar su
comportamiento.

## Alcance

- `components/ui/organisms/LoginForm`: correo, contraseña (mostrar/ocultar), enviar, enlace a
  **Registrarse**, y estados de **error** (Alert, cerrable) y **carga**. Usa `FormField`, `Button` y
  `Alert` (y `PasswordField` para el campo de contraseña).
- `pages/LoginPage.tsx` se queda con la lógica: `useAuth` (login, `isLoading`, `error`), la
  redirección por rol y el `Navigate` si ya hay sesión; delega el formulario en `LoginForm`.

## Decisiones

- El organismo es **presentacional**: guarda el estado local de los campos y el descartado del error,
  y llama a `onSubmit(credentials)`. La página es la que hace login y navega.
- `LoginForm` conserva los mismos textos, nombres accesibles y `aria-label` que antes, para no tocar
  la suite existente de `LoginPage` ni los e2e.

## Pruebas

`LoginForm.test.tsx`: envía las credenciales, muestra/oculta la contraseña, pinta y cierra el error,
deshabilita el envío mientras carga y enlaza con el registro. La suite de `LoginPage` y los e2e de
auth no cambian.
