# Diagrama ER de Athletica

Base de datos PostgreSQL con **9 tablas**, a fecha del 15 de octubre de 2026. Este diagrama
sustituye al de la parte 1 (`docs/er-diagram.pdf` y `docs/screenshots/er-diagram.png`), que no
tiene la tabla `revoked_tokens` ni las columnas de auditoría de `users`.

Está escrito en [Mermaid](https://mermaid.js.org/), así que se puede editar como texto y GitHub lo
dibuja al abrir este archivo. Coincide con las migraciones de Alembic hasta la `d7e2b5a9c1f3`.

```mermaid
erDiagram
    users {
        int id PK
        string email UK "único"
        string hashed_password "Argon2, nunca en claro"
        string full_name
        enum role "admin, trainer o member"
        bool is_active
        datetime created_at
        datetime deactivated_at "fecha de baja; vacío si está activo"
        int created_by_id FK "auditoría: quién lo creó"
        int updated_by_id FK "auditoría: quién lo cambió por última vez"
        datetime updated_at "auditoría: cuándo"
    }
    revoked_tokens {
        int id PK
        string jti UK "identificador del token, nunca el token"
        int user_id FK
        datetime expires_at
        datetime revoked_at
    }
    membership_plans {
        int id PK
        string name UK
        text description
        int price_cents
        int duration_days
        bool is_active
        datetime created_at
    }
    memberships {
        int id PK
        int user_id FK
        int plan_id FK
        date start_date
        date end_date
        enum status "active, expired o cancelled"
        datetime created_at
    }
    payments {
        int id PK
        int user_id FK
        int membership_id FK
        int amount_cents
        enum status "pending, paid o failed"
        datetime created_at
    }
    rooms {
        int id PK
        string name UK
        int capacity
    }
    gym_classes {
        int id PK
        string name
        int capacity "plazas por sesión"
        int trainer_id FK
        int room_id FK
        bool is_active
        datetime created_at
    }
    class_schedules {
        int id PK
        int class_id FK
        int day_of_week "0 lunes ... 6 domingo"
        time start_time
        time end_time
        int room_id FK
        datetime created_at
    }
    bookings {
        int id PK
        int member_id FK
        int schedule_id FK
        date booking_date
        enum status "confirmed o cancelled"
        datetime created_at
    }

    users ||--o{ memberships : "contrata"
    membership_plans ||--o{ memberships : "se contrata como"
    memberships ||--o{ payments : "se paga con"
    users ||--o{ payments : "paga"
    users ||--o{ gym_classes : "imparte (entrenador)"
    rooms |o--o{ gym_classes : "sala habitual"
    gym_classes ||--o{ class_schedules : "se da en"
    rooms |o--o{ class_schedules : "se da en"
    class_schedules ||--o{ bookings : "se reserva en"
    users ||--o{ bookings : "reserva (socio)"
    users ||--o{ revoked_tokens : "cierra sesión"
    users |o--o{ users : "crea o modifica (auditoría)"
```

## Relaciones

| De | A | Tipo | Columna |
| --- | --- | --- | --- |
| `users` | `memberships` | 1 a N | `memberships.user_id` |
| `membership_plans` | `memberships` | 1 a N | `memberships.plan_id` |
| `memberships` | `payments` | 1 a N | `payments.membership_id` |
| `users` | `payments` | 1 a N | `payments.user_id` |
| `users` (entrenador) | `gym_classes` | 1 a N | `gym_classes.trainer_id` |
| `rooms` | `gym_classes` | 0..1 a N | `gym_classes.room_id` (opcional) |
| `gym_classes` | `class_schedules` | 1 a N | `class_schedules.class_id` |
| `rooms` | `class_schedules` | 0..1 a N | `class_schedules.room_id` |
| `class_schedules` | `bookings` | 1 a N | `bookings.schedule_id` |
| `users` (socio) | `bookings` | 1 a N | `bookings.member_id` |
| `users` | `revoked_tokens` | 1 a N | `revoked_tokens.user_id` |
| `users` | `users` | 0..1 a N | `users.created_by_id` y `users.updated_by_id` (auditoría) |

## Reglas que no se ven en el diagrama

Las garantiza el código, no la base de datos:

- **Un horario siempre tiene sala.** En la tabla `class_schedules.room_id` admite vacío, pero la
  API no deja crear ni dejar un horario sin sala.
- **El rol del entrenador.** `gym_classes.trainer_id` debe apuntar a un usuario con rol
  `trainer`; lo comprueba el servicio de clases.
- **Un pago es de la membresía de su usuario.** `payments.user_id` repite el usuario que ya se
  deduce de `payments.membership_id`; el servicio de pagos comprueba que coincidan. Es la única
  redundancia del modelo.
- **No se borra nada de lo que dependan otros datos** (planes con membresías, salas en uso, clases
  con horarios, horarios con reservas, membresías con pagos): la API responde 409.
- **Los usuarios no se borran**, se desactivan con fecha de baja.

## Cambios respecto a la parte 1

| Cambio | Tarea | Migración |
| --- | --- | --- |
| Tabla nueva `revoked_tokens` | #408 | `c41f8a2d9b07` |
| Columnas de auditoría en `users`: `created_by_id`, `updated_by_id`, `updated_at` | #410 | `d7e2b5a9c1f3` |
