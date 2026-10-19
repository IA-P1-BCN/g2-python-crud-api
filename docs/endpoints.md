# Endpoints y reglas de negocio

Documentación en español del API. La especificación completa y tipada está en
`/openapi.json` y en Swagger (`/docs`).

## Base

- **API base:** `http://localhost:8000/api/v1`
- **Health check:** `GET http://localhost:8000/health`
- **Autenticación:** `Authorization: Bearer <access_token>` (JWT, obtenido en
  `POST /api/v1/auth/login` o `POST /api/v1/auth/token`).

## Endpoints

### Health

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/health` | Estado del servicio (`{ "status": "ok" }`) |

### Auth

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/register` | Registrar socio |
| GET | `/auth/me` | Usuario autenticado |
| POST | `/auth/token` | Obtener token (OAuth2 password flow) |

### Usuarios

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/users` | Listar usuarios |
| POST | `/users` | Crear usuario |
| GET | `/users/me` | Mi usuario |
| GET | `/users/{user_id}` | Obtener usuario |
| PUT | `/users/{user_id}` | Actualizar usuario |
| DELETE | `/users/{user_id}` | Desactivar usuario |
| GET | `/users/{user_id}/bookings` | Reservas de un usuario |
| GET | `/users/{user_id}/memberships` | Membresías de un usuario |
| PUT | `/users/{user_id}/password` | Cambiar contraseña |
| PUT | `/users/{user_id}/profile` | Actualizar perfil propio |

### Planes de membresía

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/membership-plans` | Listar planes |
| POST | `/membership-plans` | Crear plan |
| GET | `/membership-plans/{plan_id}` | Obtener plan |
| PUT | `/membership-plans/{plan_id}` | Actualizar plan |
| DELETE | `/membership-plans/{plan_id}` | Eliminar plan |

### Membresías

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/memberships` | Listar membresías |
| POST | `/memberships` | Asignar membresía |
| GET | `/memberships/{membership_id}` | Obtener membresía |
| PUT | `/memberships/{membership_id}` | Actualizar membresía |
| DELETE | `/memberships/{membership_id}` | Eliminar membresía |

### Salas

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/rooms` | Listar salas |
| POST | `/rooms` | Crear sala |
| GET | `/rooms/{room_id}` | Obtener sala |
| PUT | `/rooms/{room_id}` | Actualizar sala |
| DELETE | `/rooms/{room_id}` | Eliminar sala |

### Clases

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/classes` | Listar clases |
| POST | `/classes` | Crear clase |
| GET | `/classes/{class_id}` | Obtener clase |
| PUT | `/classes/{class_id}` | Actualizar clase |
| DELETE | `/classes/{class_id}` | Eliminar clase |
| GET | `/classes/{class_id}/schedules` | Horarios de una clase |

### Horarios de clase (class schedules)

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/class-schedules` | Listar horarios |
| POST | `/class-schedules` | Crear horario |
| GET | `/class-schedules/{schedule_id}` | Obtener horario |
| PUT | `/class-schedules/{schedule_id}` | Actualizar horario |
| DELETE | `/class-schedules/{schedule_id}` | Eliminar horario |
| GET | `/class-schedules/{schedule_id}/availability` | Plazas libres de una sesión |
| GET | `/class-schedules/{schedule_id}/bookings` | Reservas de un horario |

### Reservas (bookings)

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/bookings` | Listar reservas |
| POST | `/bookings` | Crear reserva |
| GET | `/bookings/{booking_id}` | Obtener reserva |
| DELETE | `/bookings/{booking_id}` | Cancelar reserva |

### Pagos

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/payments` | Listar pagos |
| POST | `/payments` | Crear pago |
| GET | `/payments/{payment_id}` | Obtener pago |
| PUT | `/payments/{payment_id}` | Actualizar pago |
| DELETE | `/payments/{payment_id}` | Eliminar pago |

### Exportación

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/export/bookings.csv` | Exportar reservas a CSV |
| GET | `/export/members.csv` | Exportar socios a CSV |

### Panel del socio

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/me/dashboard` | Resumen del socio |

### Panel del administrador

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/admin/dashboard` | Resumen del panel de administración |
| GET | `/admin/members` | Socios con su plan y su último pago |

## Reglas de negocio

1. **Clase activa:** solo se puede reservar en clases activas.
2. **Membresía activa:** el socio debe tener una membresía activa en la fecha
   de la clase.
3. **Capacidad:** no se supera la capacidad de la clase; si no hay plazas, la
   reserva se rechaza.
4. **Sin solapes:** un socio no puede tener dos reservas solapadas el mismo día.
5. **Cancelación:** las reservas se pueden cancelar hasta 2 horas antes del inicio
   de la clase; los administradores pueden cancelar siempre.

## Validaciones de datos relacionadas

Aunque suelen devolver error de validación y no regla de negocio, también se
aplican las siguientes:

- La fecha de la reserva debe corresponder al día de la semana del horario.
- La sesión debe ser futura; no se reservan sesiones ya empezadas o pasadas.

## Convención de errores

Los errores siguen el formato normalizado de la API. Ver más detalle en
[docs/errores.md](errores.md). Las clases y códigos usados incluyen:

- `404` para recursos no encontrados.
- `409` para conflictos (plazas, solapes).
- `400` para reglas de negocio y datos inválidos.
