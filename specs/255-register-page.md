# #255 · Página de registro

Parte de #252. Compone la página con el diseño nuevo: `AuthLayout` (ya lo aplica la ruta) +
`AuthHeroCard` + `RegisterForm` (#253), igual que se hizo en el login (#251).

## Alcance

- `pages/RegisterPage.tsx`: mantiene la lógica (`useAuth`, `Navigate` si ya hay sesión y redirección
  por rol tras registrarse) y renderiza `AuthHeroCard` + `RegisterForm`.
- El copy del hero (eslogan y subtítulo) se extrae a `lib/auth-copy.ts` y lo comparten
  `LoginPage` y `RegisterPage` (DRY).

## Extra (acordado aparte)

- Arreglo del *flake* de `tests/e2e/member.spec.ts`: `loginAs` en `fixtures.ts` ahora espera a que
  termine el login (`waitForURL` fuera de `/login`) antes de devolver, para que un `goto` inmediato
  después no pierda el token. El e2e **sí** corre en CI, así que el flake podía tumbar PRs.

## Pruebas

Se añade a `RegisterPage.test.tsx` que se muestra la tarjeta de bienvenida; el resto de la suite de
`RegisterPage` y el e2e siguen pasando.
