# Spec 406: filtros y paginación de usuarios

- **Tarea:** #406 (specs retroactivas de las historias ya construidas).
- **Historia de usuario:** Como administrador o entrenador, quiero filtrar y paginar la lista
  de usuarios para encontrar cuentas concretas sin cargar el listado completo.
- **Retroactiva:** esta spec se escribió **después** del código, el 16 de octubre de 2026; el
  comportamiento lleva en `dev` desde la parte 1 y la tabla de la página de usuarios se
  rediseñó con el nuevo design system.

## Requisitos

1. `GET /users` pagina con `page` y `size` (con valores por defecto y un tamaño máximo) y
   devuelve `Page`: `items`, `total`, `page`, `size`, `pages`.
2. Una página más allá de la última devuelve una lista vacía pero **conserva el `total`**;
   `pages` es el total dividido por el tamaño, redondeado hacia arriba.
3. `page` o `size` fuera de rango responden **422**.
4. Filtros disponibles: `role`, `is_active`, `search` (texto en nombre o email, sin distinguir
   mayúsculas), `created_from`/`created_to` (altas) y `deactivated_from`/`deactivated_to`
   (bajas). Los rangos de fechas **incluyen ambos extremos**.
5. Los filtros se pueden **combinar** entre sí y con la paginación; un valor inválido responde
   **422**.
6. **El entrenador solo ve socios**: su listado filtra por `member` y no puede pedir otro rol
   (si lo pide, **403**).
7. La paginación de la página `Page` es común a todos los listados del API (mismas reglas en
   membresías y reservas).

## Criterios de aceptación

- [x] Paginación por defecto, tamaño máximo y rangos fuera de rango probados.
- [x] Cada filtro y las combinaciones devuelven lo esperado; los inválidos responden 422.
- [x] Un entrenador no alcanza usuarios que no sean socios.
- [x] La página de usuarios del frontend pagina y filtra con estos parámetros.

## Vocabulario

[User](ontology.md#user) · [Role](ontology.md#role).

## Tests que la cubren

- `backend/tests/integration/test_pagination_and_filters.py`:
  `test_list_uses_the_default_page_and_size` (sobre `/users`),
  `test_list_accepts_the_maximum_size`, `test_list_rejects_pagination_out_of_range`,
  `test_a_page_past_the_last_one_is_empty_but_keeps_the_total`,
  `test_pages_is_the_total_split_by_size`, `test_an_empty_list_still_has_one_page`.
- `backend/tests/integration/test_users.py`: `test_list_users_is_paginated`,
  `test_filter_users_by_role`, `test_filter_users_by_status`,
  `test_search_users_by_name_or_email_ignoring_case`, `test_filter_users_by_signup_date`,
  `test_filter_users_by_sign_off_date`, `test_user_filters_can_be_combined_and_paginated`,
  `test_invalid_user_filters_return_422`, `test_trainer_filters_still_see_members_only`.
- Frontend: `frontend/tests/unit/AdminUsersPage.test.tsx`.

## Specs compañeras (no se repite aquí)

- `406-crud-usuarios.md` (crear, ver y actualizar) · `406-roles-y-permisos.md`
  (por qué el entrenador solo ve socios).

## Fuera de alcance

Los listados de otras entidades (clases, reservas, membresías) y el export del listado
(`export.py`), que tienen su propia historia.
