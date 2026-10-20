# Spec 518: borrar los datos personales de un socio y no publicar credenciales de staff

- **Tarea:** #518
- **Estado:** escrita antes del código (20 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User, Role, Membership, Booking, Payment)

## Historia de usuario

Como socio que se va del gimnasio, quiero que se borren mis datos personales, para que no queden
guardados sin motivo. Como equipo, no queremos publicar credenciales con permisos de staff.

## Decisiones (20 de octubre, Eva)

- **Anonimizar, no borrar filas.** Se borran los datos que identifican al socio; sus reservas,
  membresías y pagos se conservan sin identificarle, para no romper el historial, las métricas ni
  las claves foráneas.
- **Acción aparte de la baja.** «Dar de baja» (`DELETE /users/{id}`) sigue siendo la baja lógica
  reversible de hoy. Borrar los datos es otra acción, solo del admin, e **irreversible**.
- **README:** se publica solo el socio de demo; admin y entrenador no. Sus contraseñas se cambian
  en producción por Swagger (`PUT /users/{id}`); no van en el código.
- El socio de demo se deja como está: si alguien lo estropea, el admin lo restablece.

## Requisitos

1. `users` gana `personal_data_erased_at` (fecha y hora, vacío por defecto), con migración.
2. `DELETE /users/{id}/personal-data`, solo admin, responde **204** y deja al usuario así:
   - `email` → `socio-eliminado-{id}@athletica.dev` (único y válido; el dominio es el del proyecto);
   - `full_name` → «Socio eliminado»;
   - contraseña → el hash de una contraseña aleatoria que nadie conoce;
   - 2FA y verificación de email borradas (`totp_secret`, `totp_enabled_at`, `email_verified_at`);
   - `personal_data_erased_at` → ahora; la auditoría registra qué admin lo hizo.
3. **Condiciones** (se comprueban en este orden):
   - usuario inexistente → **404**;
   - no es socio → **400** «Solo se pueden borrar los datos personales de un socio»;
   - sigue activo → **409** «Primero da de baja al socio»;
   - ya tiene los datos borrados → **409** «Los datos personales de este socio ya se borraron».
4. **No se puede reactivar** a un socio con los datos borrados: `PUT /users/{id}` con
   `is_active: true` → **409** «No se puede reactivar un socio con los datos personales borrados».
5. Sus reservas, membresías y pagos siguen existiendo y apuntando a su `id`.
6. `UserRead` incluye `personal_data_erased_at`, para que el panel pueda mostrarlo.
7. README: en «Demo en línea», solo `member@athletica.dev`.

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| Admin borra los datos de un socio dado de baja | 204; email, nombre, contraseña y 2FA anonimizados; reservas, membresías y pagos intactos |
| Ese socio intenta iniciar sesión con su email antiguo | 401 |
| Socio activo | 409 «Primero da de baja al socio» |
| Entrenador o admin | 400 |
| Segunda vez | 409 |
| Reactivar después | 409 |
| Sin sesión / socio / entrenador | 401 / 403 / 403 |
| README | Sin credenciales de admin ni entrenador |

## Fuera de alcance

El botón en el panel de admin (frontend), que el propio socio pida el borrado desde la web, borrar
los datos de entrenadores o admins, y bloquear cambios en la cuenta de demo.
