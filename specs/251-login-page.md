# #251 · Página de inicio de sesión

Parte de #247. Compone la página con el diseño nuevo: `AuthLayout` (ya lo aplica la ruta en
`App.tsx`) + **`AuthHeroCard`** + **`LoginForm`** (#249). El formulario ya estaba extraído; esta
tarea añade la tarjeta y deja la página como su composición.

## Contexto

- `AuthLayout` (#233) da la cabecera con el logo, el contenedor centrado y el pie.
- `LoginForm` (#249) es el formulario: correo, contraseña (mostrar/ocultar), enviar, enlace a
  Registrarse y estados de error y carga.
- `AuthHeroCard` (#248) estaba **cerrado como completado pero no existía en el código**; se crea
  aquí.

## Alcance

- `components/ui/molecules/AuthHeroCard`: tarjeta azul (`bg-secondary`) con el **eslogan** y el
  **subtítulo**. Sin chips (como pide el issue). Insignia opcional.
- `pages/LoginPage.tsx`: mantiene la lógica (`useAuth`, redirección por rol, `Navigate` si ya hay
  sesión) y renderiza `AuthHeroCard` + `LoginForm`. Se reutiliza el eslogan de la landing.

## Pruebas

`AuthHeroCard.test.tsx` y la suite de `LoginPage` y los e2e de auth (sin cambios) siguen pasando.
