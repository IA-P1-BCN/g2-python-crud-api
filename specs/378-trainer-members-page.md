# #378 · Página de miembros del entrenador

## Historia de usuario

Como entrenador, quiero ver a los miembros que vienen a mis clases para saber a quién entreno.

## Decisión previa

**Qué socios mostrar.** Se descartó componer "solo los socios de mis clases" (cruzar `GET /bookings`
con `GET /users`): obligaría a buscar y paginar en cliente y a resolver los datos de cada socio sin
un endpoint dedicado. Se usa `GET /users?role=member`, que ya devuelve los socios del gimnasio con
búsqueda y paginación en servidor. El backend fuerza `role=member` para el entrenador
(`access_service.visible_user_role`), así que no hace falta filtrar en el cliente.

## Criterios de aceptación

1. Lista de socios con **nombre y correo electrónico**, con el diseño nuevo (tokens y componentes de
   `components/ui`).
2. Estados de **carga**, **lista vacía** y **error**.
3. **Búsqueda** por nombre o correo y **paginación** (ambas en servidor).
4. **Solo lectura**: el entrenador no crea, edita ni da de baja socios.
5. **Tests** de la pantalla.

## Alcance

- `pages/trainer/TrainerMembersPage.tsx`: `useQuery` con
  `usersApi.list({ role: 'member', page, size, search })` y `placeholderData: keepPreviousData`;
  `SearchInput` (búsqueda con debounce), lista de tarjetas con `Avatar` + nombre + correo,
  `Alert` para el error y `Pagination`.
- `lib/navigation.ts`: entrada **Socios** (`/trainer/members`, icono `users`) en el menú del
  entrenador. La ruta ya existía en `App.tsx`, pero no estaba en el menú (la issue asumía que sí).
- Sin botones de alta, edición ni baja: la pantalla es de solo lectura.

## Pruebas

`tests/unit/TrainerMembersPage.test.tsx`: lista con nombre y correo, estado vacío, estado de error y
búsqueda (llama a la API con `search`). `navigation.test.ts`: el menú del entrenador incluye Socios.
