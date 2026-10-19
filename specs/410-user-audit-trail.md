# Spec 410: auditoría de usuarios

- **Tarea:** #410
- **Nivel del briefing:** Avanzado («Soft delete y auditoría: quién creó/modificó cada usuario y
  cuándo»)
- **Estado:** escrita antes del código (15 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User, Role)

## Historia de usuario

Como administrador, quiero saber quién creó y quién modificó por última vez cada usuario, y cuándo,
para que los cambios en las cuentas sean trazables.

## Contexto

La baja sin borrado ya existe (`is_active` y `deactivated_at`) y cada usuario guarda su fecha de
alta (`created_at`). Falta saber **quién** hizo cada cosa y **cuándo** fue el último cambio.

## Decisión (15 de octubre)

La auditoría se consulta en un endpoint propio, `GET /api/v1/users/{id}/audit`, solo para
administradores. Las respuestas de usuario que ya existen no cambian: así no afecta al frontend ni
a lo que ven socios y entrenadores.

## Requisitos

1. La tabla `users` gana tres columnas, con migración de Alembic:
   - `created_by_id`: el usuario que creó la cuenta.
   - `updated_by_id`: el usuario que la modificó por última vez.
   - `updated_at`: cuándo fue esa última modificación.
   Las dos primeras son claves foráneas a `users` y admiten vacío.
2. Se rellenan solas, nunca desde el cuerpo de la petición:

   | Operación | `created_by_id` | `updated_by_id` y `updated_at` |
   | --- | --- | --- |
   | Un administrador crea un usuario | El administrador | Vacíos |
   | Alguien se registra (`/auth/register`) | El propio usuario | Vacíos |
   | Un administrador edita un usuario | Sin cambios | El administrador, ahora |
   | Alguien edita su perfil o el de otro (admin) | Sin cambios | Quien lo edita, ahora |
   | Alguien cambia su contraseña | Sin cambios | Quien la cambia, ahora |
   | Un administrador da de baja a un usuario | Sin cambios | El administrador, ahora |

3. `GET /api/v1/users/{id}/audit` devuelve: id del usuario, fecha de alta y quién lo creó, fecha de
   la última modificación y quién la hizo. De cada persona, su id, su nombre y su email.
4. Solo lo puede pedir un administrador (403 para el resto, 401 sin sesión, 404 si el usuario no
   existe).
5. Los usuarios que ya existían antes de la migración quedan con creador y última modificación
   vacíos: no se inventa ese dato.

## Criterios de aceptación

| Caso | Resultado esperado |
| --- | --- |
| Admin crea un usuario y consulta su auditoría | `created_by` es el admin; `updated_at` y `updated_by` vacíos |
| Un socio se registra | `created_by` es el propio socio |
| Admin edita a un usuario | `updated_by` es el admin y `updated_at` es la hora del cambio |
| Un socio edita su perfil | `updated_by` es el propio socio |
| Un socio cambia su contraseña | `updated_by` es el propio socio |
| Admin da de baja a un usuario | `updated_by` es el admin |
| Un cambio que falla (email repetido, contraseña actual incorrecta) | La auditoría no cambia |
| Usuario creado antes de la migración (por ejemplo, los de demo) | 200 con creador y modificación vacíos |
| Socio o entrenador piden la auditoría | 403 |
| Sin sesión | 401 |
| Usuario que no existe | 404 |
| `GET /users`, `GET /users/{id}` y el resto de respuestas de usuario | Igual que antes: sin campos nuevos |
| Migración | `alembic upgrade head` añade las columnas sin tocar los datos; `downgrade` las quita |

## Fuera de alcance

- Historial completo de cambios (solo se guarda el último).
- Auditoría de otros recursos (reservas, pagos, planes...).
- Mostrar la auditoría en el panel de administración del frontend.
