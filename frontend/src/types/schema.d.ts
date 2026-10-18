export interface paths {
    "/api/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registrar socio
         * @description Crea una cuenta de socio y devuelve el token JWT de acceso.
         */
        post: operations["register_api_v1_auth_register_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Iniciar sesión
         * @description Autentica con email y contraseña y devuelve un token JWT de acceso.
         */
        post: operations["login_api_v1_auth_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Obtener token (OAuth2)
         * @description Login estándar de OAuth2 Password Flow: recibe un formulario con `username` (el email) y `password`, y devuelve el token JWT. Es el endpoint que usa el botón **Authorize** de esta documentación. Aplica las mismas reglas que `/auth/login`.
         */
        post: operations["issue_oauth2_token_api_v1_auth_token_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Renovar el token de acceso
         * @description Cambia un token de refresco válido por un token de acceso nuevo, sin volver a pedir la contraseña. Devuelve el mismo token de refresco. Un token de refresco revocado o caducado responde 401.
         */
        post: operations["refresh_token_api_v1_auth_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cerrar sesión
         * @description Revoca el token de acceso con el que se llama, que deja de valer aunque no haya caducado. Si se envía `refresh_token`, también se revoca y ya no sirve para renovar.
         */
        post: operations["logout_api_v1_auth_logout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/verify-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verificar email
         * @description Confirma el email con el token del enlace que se envía al registrarse. Repetirlo no es un error. Por ahora los correos no se envían: el enlace aparece en el log del backend.
         */
        post: operations["verify_email_api_v1_auth_verify_email_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * He olvidado mi contraseña
         * @description Si el email es de una cuenta activa, envía un enlace para crear una contraseña nueva. Responde 202 siempre, exista o no la cuenta, para no revelar qué emails están registrados. Por ahora el enlace aparece en el log del backend.
         */
        post: operations["forgot_password_api_v1_auth_forgot_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Restablecer contraseña
         * @description Cambia la contraseña con el token del enlace de recuperación. El enlace caduca y solo vale una vez. La contraseña nueva debe cumplir la regla de contraseña fuerte.
         */
        post: operations["reset_password_api_v1_auth_reset_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/2fa/setup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Preparar la verificación en dos pasos
         * @description Genera un secreto nuevo y su enlace `otpauth://` para la app de códigos (Google Authenticator, Authy...). Todavía no queda activa: hay que confirmarla con `/auth/2fa/enable`. Si ya está activa responde 409 y no devuelve ningún secreto.
         */
        post: operations["setup_two_factor_api_v1_auth_2fa_setup_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/2fa/enable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Activar la verificación en dos pasos
         * @description Activa la verificación en dos pasos con un código de la app. Desde ese momento el login pide el código en `totp_code`.
         */
        post: operations["enable_two_factor_api_v1_auth_2fa_enable_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/2fa/disable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Desactivar la verificación en dos pasos
         * @description Desactiva la verificación en dos pasos con un código de la app y borra el secreto.
         */
        post: operations["disable_two_factor_api_v1_auth_2fa_disable_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Usuario autenticado
         * @description Devuelve el usuario actual a partir del token Bearer.
         */
        get: operations["read_current_user_api_v1_auth_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/github/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Entrar con GitHub
         * @description Redirige a GitHub para autorizar a Athletica. Al volver, `/auth/github/callback` lleva a la web con la sesión abierta. Ábrelo en el navegador, no desde Swagger.
         */
        get: operations["github_login_api_v1_auth_github_login_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/github/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Vuelta de GitHub
         * @description GitHub vuelve aquí tras autorizar. Redirige a `FRONTEND_URL/auth/callback` con los tokens en el fragmento (`#access_token=...&refresh_token=...`), o con `#error=` y el motivo. Crea la cuenta de socio si el email no existe, o entra en la que ya lo tiene.
         */
        get: operations["github_callback_api_v1_auth_github_callback_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar usuarios
         * @description Lista usuarios paginados. Un entrenador solo ve socios; el administrador ve todos. Se puede filtrar por `role`, por `is_active`, por texto en el nombre o el email (`search`) y por fechas de alta (`created_from`, `created_to`) y de baja (`deactivated_from`, `deactivated_to`).
         */
        get: operations["list_users_api_v1_users_get"];
        put?: never;
        /**
         * Crear usuario
         * @description Crea un usuario. Requiere rol administrador.
         */
        post: operations["create_user_api_v1_users_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Mi usuario
         * @description Devuelve el usuario del token. Disponible para cualquier rol.
         */
        get: operations["read_own_user_api_v1_users_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtener usuario
         * @description Devuelve un usuario por id. Solo el propio usuario o un administrador.
         */
        get: operations["get_user_api_v1_users__user_id__get"];
        /**
         * Actualizar usuario
         * @description Actualiza un usuario. Requiere rol administrador; no permite desactivarse a sí mismo.
         */
        put: operations["update_user_api_v1_users__user_id__put"];
        post?: never;
        /**
         * Desactivar usuario
         * @description Da de baja a un usuario: la cuenta se desactiva, nunca se borra, para conservar su historial. Requiere rol administrador.
         */
        delete: operations["deactivate_user_api_v1_users__user_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{user_id}/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Actualizar perfil propio
         * @description Actualiza el email y nombre del propio usuario.
         */
        put: operations["update_profile_api_v1_users__user_id__profile_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{user_id}/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Cambiar contraseña
         * @description Cambia la contraseña del propio usuario.
         */
        put: operations["change_password_api_v1_users__user_id__password_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{user_id}/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Auditoría de un usuario
         * @description Quién creó el usuario y cuándo, y quién lo modificó por última vez y cuándo. Los usuarios anteriores a la auditoría tienen estos datos vacíos. Solo administradores.
         */
        get: operations["get_user_audit_api_v1_users__user_id__audit_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{user_id}/memberships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Membresías de un usuario
         * @description Lista las membresías de un usuario. Solo el propio usuario o un administrador.
         */
        get: operations["list_user_memberships_api_v1_users__user_id__memberships_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{user_id}/bookings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Reservas de un usuario
         * @description Lista las reservas de un usuario. Solo el propio usuario o un administrador.
         */
        get: operations["list_user_bookings_api_v1_users__user_id__bookings_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/membership-plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar planes
         * @description Lista los planes de membresía. Con `active_only=true` solo devuelve los activos.
         */
        get: operations["list_plans_api_v1_membership_plans_get"];
        put?: never;
        /**
         * Crear plan
         * @description Crea un plan de membresía. Requiere rol administrador.
         */
        post: operations["create_plan_api_v1_membership_plans_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/membership-plans/{plan_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtener plan
         * @description Devuelve un plan de membresía por id.
         */
        get: operations["get_plan_api_v1_membership_plans__plan_id__get"];
        /**
         * Actualizar plan
         * @description Actualiza un plan de membresía. Requiere rol administrador.
         */
        put: operations["update_plan_api_v1_membership_plans__plan_id__put"];
        post?: never;
        /**
         * Eliminar plan
         * @description Elimina un plan de membresía. Requiere rol administrador.
         */
        delete: operations["delete_plan_api_v1_membership_plans__plan_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/memberships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar membresías
         * @description Lista todas las membresías. Se puede filtrar por `user_id` y `status_filter`. Requiere rol administrador.
         */
        get: operations["list_memberships_api_v1_memberships_get"];
        put?: never;
        /**
         * Asignar membresía
         * @description Asigna un plan a un socio. La fecha de fin se calcula como `start_date + plan.duration_days`. Requiere rol administrador.
         */
        post: operations["create_membership_api_v1_memberships_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/memberships/{membership_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtener membresía
         * @description Devuelve una membresía por id. Solo el socio propietario o un administrador.
         */
        get: operations["get_membership_api_v1_memberships__membership_id__get"];
        /**
         * Actualizar membresía
         * @description Actualiza la fecha de inicio o el estado de una membresía. Requiere rol administrador.
         */
        put: operations["update_membership_api_v1_memberships__membership_id__put"];
        post?: never;
        /**
         * Eliminar membresía
         * @description Elimina una membresía. Requiere rol administrador.
         */
        delete: operations["delete_membership_api_v1_memberships__membership_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rooms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar salas
         * @description Lista las salas del gimnasio. Requiere sesión.
         */
        get: operations["list_rooms_api_v1_rooms_get"];
        put?: never;
        /**
         * Crear sala
         * @description Crea una sala. Requiere rol administrador.
         */
        post: operations["create_room_api_v1_rooms_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rooms/{room_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtener sala
         * @description Devuelve una sala por id. Requiere sesión.
         */
        get: operations["get_room_api_v1_rooms__room_id__get"];
        /**
         * Actualizar sala
         * @description Actualiza una sala. Requiere rol administrador.
         */
        put: operations["update_room_api_v1_rooms__room_id__put"];
        post?: never;
        /**
         * Eliminar sala
         * @description Elimina una sala. Requiere rol administrador.
         */
        delete: operations["delete_room_api_v1_rooms__room_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/classes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar clases
         * @description Lista las clases paginadas. Se puede filtrar por `trainer_id` y `active_only`. Un entrenador solo ve las suyas.
         */
        get: operations["list_classes_api_v1_classes_get"];
        put?: never;
        /**
         * Crear clase
         * @description Crea una clase asignando un entrenador. Requiere rol administrador o entrenador.
         */
        post: operations["create_class_api_v1_classes_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/classes/{class_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtener clase
         * @description Devuelve una clase por id.
         */
        get: operations["get_class_api_v1_classes__class_id__get"];
        /**
         * Actualizar clase
         * @description Actualiza una clase. Requiere rol administrador o ser el entrenador asignado.
         */
        put: operations["update_class_api_v1_classes__class_id__put"];
        post?: never;
        /**
         * Eliminar clase
         * @description Elimina una clase. Requiere rol administrador o ser el entrenador asignado.
         */
        delete: operations["delete_class_api_v1_classes__class_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/classes/{class_id}/schedules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Horarios de una clase
         * @description Lista los horarios semanales de una clase.
         */
        get: operations["list_class_schedules_api_v1_classes__class_id__schedules_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/class-schedules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar horarios
         * @description Lista los horarios semanales. Se puede filtrar por `class_id` y `day_of_week` (0 = lunes, 6 = domingo).
         */
        get: operations["list_schedules_api_v1_class_schedules_get"];
        put?: never;
        /**
         * Crear horario
         * @description Crea un horario semanal para una clase. Requiere rol administrador o entrenador.
         */
        post: operations["create_schedule_api_v1_class_schedules_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/class-schedules/{schedule_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtener horario
         * @description Devuelve un horario por id.
         */
        get: operations["get_schedule_api_v1_class_schedules__schedule_id__get"];
        /**
         * Actualizar horario
         * @description Actualiza un horario. Requiere rol administrador o ser el entrenador de la clase.
         */
        put: operations["update_schedule_api_v1_class_schedules__schedule_id__put"];
        post?: never;
        /**
         * Eliminar horario
         * @description Elimina un horario. Requiere rol administrador o ser el entrenador de la clase.
         */
        delete: operations["delete_schedule_api_v1_class_schedules__schedule_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/class-schedules/{schedule_id}/availability": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Plazas libres de una sesión
         * @description Devuelve el aforo, las plazas reservadas y las libres de un horario en una fecha. Las reservas canceladas no cuentan. Es público.
         */
        get: operations["get_schedule_availability_api_v1_class_schedules__schedule_id__availability_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/class-schedules/{schedule_id}/bookings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Reservas de un horario
         * @description Lista las reservas de un horario. Requiere rol administrador o entrenador.
         */
        get: operations["list_schedule_bookings_api_v1_class_schedules__schedule_id__bookings_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/bookings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar reservas
         * @description Lista las reservas paginadas. Filtros: `member_id`, `schedule_id`, `status_filter` y `on_date`. Un entrenador solo ve las reservas de sus clases.
         */
        get: operations["list_bookings_api_v1_bookings_get"];
        put?: never;
        /**
         * Crear reserva
         * @description Reserva una plaza en un horario para un socio. Valida membresía activa, aforo y solapamiento de horarios.
         */
        post: operations["create_booking_api_v1_bookings_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/bookings/{booking_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtener reserva
         * @description Devuelve una reserva por id. Solo el socio propietario, su entrenador o un admin.
         */
        get: operations["get_booking_api_v1_bookings__booking_id__get"];
        put?: never;
        post?: never;
        /**
         * Cancelar reserva
         * @description Cancela una reserva. Solo el socio propietario o un administrador. El socio puede cancelar hasta 2 horas antes del inicio de la sesión; el administrador, siempre.
         */
        delete: operations["cancel_booking_api_v1_bookings__booking_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar pagos
         * @description Lista los pagos paginados. Filtros: `status_filter` y `user_id`. Requiere rol administrador.
         */
        get: operations["list_payments_api_v1_payments_get"];
        put?: never;
        /**
         * Crear pago
         * @description Registra un pago asociado a una membresía. Requiere rol administrador.
         */
        post: operations["create_payment_api_v1_payments_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/payments/{payment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Obtener pago
         * @description Devuelve un pago por id. Requiere rol administrador.
         */
        get: operations["get_payment_api_v1_payments__payment_id__get"];
        /**
         * Actualizar pago
         * @description Actualiza el importe o el estado de un pago. Requiere rol administrador.
         */
        put: operations["update_payment_api_v1_payments__payment_id__put"];
        post?: never;
        /**
         * Eliminar pago
         * @description Elimina un pago. Requiere rol administrador.
         */
        delete: operations["delete_payment_api_v1_payments__payment_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/export/members.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Exportar socios a CSV
         * @description Descarga los socios en formato CSV (UTF-8). Se puede filtrar por `role`. Requiere rol administrador.
         */
        get: operations["export_members_api_v1_export_members_csv_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/export/bookings.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Exportar reservas a CSV
         * @description Descarga las reservas en formato CSV (UTF-8). Filtros: `member_id`, `schedule_id`, `status_filter` y `on_date`. Requiere rol administrador.
         */
        get: operations["export_bookings_api_v1_export_bookings_csv_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Resumen del panel de administración
         * @description Cifras del gimnasio para el periodo elegido (`today`, `7d` o `30d`): socios activos, altas y bajas, reservas por día, ocupación de clases, membresías que vencen en 7 días, planes más contratados y clases más populares. Solo administradores.
         */
        get: operations["get_dashboard_api_v1_admin_dashboard_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Socios con su plan y su último pago
         * @description Lista los socios paginados, cada uno con su membresía en vigor (o la última que tuvo) y su pago más reciente, en una sola llamada. Acepta los filtros de `GET /users` (`search`, `is_active` y fechas de alta y de baja); `role` se ignora porque siempre devuelve socios. Solo administradores.
         */
        get: operations["list_members_api_v1_admin_members_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Resumen del socio
         * @description Lo que necesita la pantalla de inicio del usuario con sesión, en una sola llamada: membresía en vigor con días restantes, próximas reservas confirmadas (con clase, horario, sala y entrenador) y reservas del mes. Solo devuelve datos propios.
         */
        get: operations["get_my_dashboard_api_v1_me_dashboard_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Estado del servicio
         * @description Comprobación de salud: devuelve `{"status": "ok"}`.
         */
        get: operations["health_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * AdminMember
         * @description A member as the admin panel lists them: user data, plan and last payment.
         * @example {
         *       "created_at": "2026-01-01T10:00:00Z",
         *       "email": "socio@example.com",
         *       "full_name": "Socio Uno",
         *       "id": 1,
         *       "is_active": true,
         *       "last_payment": {
         *         "amount_cents": 3999,
         *         "created_at": "2026-01-01T10:00:00Z",
         *         "payment_id": 1,
         *         "status": "paid"
         *       },
         *       "membership": {
         *         "end_date": "2026-01-31",
         *         "membership_id": 1,
         *         "plan_id": 1,
         *         "plan_name": "Mensual",
         *         "start_date": "2026-01-01",
         *         "status": "active"
         *       },
         *       "role": "member"
         *     }
         */
        AdminMember: {
            /** Id */
            id: number;
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Full Name */
            full_name: string;
            role: components["schemas"]["UserRole"];
            /** Is Active */
            is_active: boolean;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Deactivated At */
            deactivated_at: string | null;
            membership: components["schemas"]["MembershipSummary"] | null;
            last_payment: components["schemas"]["MemberLastPayment"] | null;
        };
        /** Body_issue_oauth2_token_api_v1_auth_token_post */
        Body_issue_oauth2_token_api_v1_auth_token_post: {
            /** Grant Type */
            grant_type?: string | null;
            /** Username */
            username: string;
            /**
             * Password
             * Format: password
             */
            password: string;
            /**
             * Scope
             * @default
             */
            scope: string;
            /** Client Id */
            client_id?: string | null;
            /**
             * Client Secret
             * Format: password
             */
            client_secret?: string | null;
        };
        /**
         * BookingCreate
         * @example {
         *       "booking_date": "2026-01-05",
         *       "member_id": 1,
         *       "schedule_id": 1
         *     }
         */
        BookingCreate: {
            /** Member Id */
            member_id: number;
            /** Schedule Id */
            schedule_id: number;
            /**
             * Booking Date
             * Format: date
             */
            booking_date: string;
        };
        /**
         * BookingRead
         * @example {
         *       "booking_date": "2026-01-05",
         *       "created_at": "2026-01-01T10:00:00Z",
         *       "id": 1,
         *       "member_id": 1,
         *       "schedule_id": 1,
         *       "status": "confirmed"
         *     }
         */
        BookingRead: {
            /** Id */
            id: number;
            /** Member Id */
            member_id: number;
            /** Schedule Id */
            schedule_id: number;
            /**
             * Booking Date
             * Format: date
             */
            booking_date: string;
            status: components["schemas"]["BookingStatus"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /** BookingStats */
        BookingStats: {
            /** Total */
            total: number;
            /** By Day */
            by_day: components["schemas"]["DailyBookings"][];
        };
        /**
         * BookingStatus
         * @enum {string}
         */
        BookingStatus: "confirmed" | "cancelled";
        /** ClassOccupancy */
        ClassOccupancy: {
            /** Class Id */
            class_id: number;
            /** Name */
            name: string;
            /** Booked */
            booked: number;
            /** Capacity */
            capacity: number;
            /** Rate */
            rate: number;
        };
        /**
         * ClassScheduleCreate
         * @example {
         *       "class_id": 1,
         *       "day_of_week": 0,
         *       "end_time": "11:00:00",
         *       "room_id": 1,
         *       "start_time": "10:00:00"
         *     }
         */
        ClassScheduleCreate: {
            /** Class Id */
            class_id: number;
            /**
             * Day Of Week
             * @description 0 = lunes, 6 = domingo
             */
            day_of_week: number;
            /**
             * Start Time
             * Format: time
             */
            start_time: string;
            /**
             * End Time
             * Format: time
             */
            end_time: string;
            /** Room Id */
            room_id: number;
        };
        /**
         * ClassScheduleRead
         * @example {
         *       "class_id": 1,
         *       "created_at": "2026-01-01T10:00:00Z",
         *       "day_of_week": 0,
         *       "end_time": "11:00:00",
         *       "id": 1,
         *       "room_id": 1,
         *       "start_time": "10:00:00"
         *     }
         */
        ClassScheduleRead: {
            /** Id */
            id: number;
            /** Class Id */
            class_id: number;
            /** Day Of Week */
            day_of_week: number;
            /**
             * Start Time
             * Format: time
             */
            start_time: string;
            /**
             * End Time
             * Format: time
             */
            end_time: string;
            /** Room Id */
            room_id: number | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /** ClassScheduleUpdate */
        ClassScheduleUpdate: {
            /** Class Id */
            class_id?: number | null;
            /** Day Of Week */
            day_of_week?: number | null;
            /** Start Time */
            start_time?: string | null;
            /** End Time */
            end_time?: string | null;
            /** Room Id */
            room_id?: number | null;
        };
        /** CurrentMembership */
        CurrentMembership: {
            /** Membership Id */
            membership_id: number;
            /** Plan Id */
            plan_id: number;
            /** Plan Name */
            plan_name: string;
            /**
             * Start Date
             * Format: date
             */
            start_date: string;
            /**
             * End Date
             * Format: date
             */
            end_date: string;
            status: components["schemas"]["MembershipStatus"];
            /** Days Left */
            days_left: number;
        };
        /** DailyBookings */
        DailyBookings: {
            /**
             * Day
             * Format: date
             */
            day: string;
            /** Count */
            count: number;
        };
        /** DashboardSummary */
        DashboardSummary: {
            period: components["schemas"]["PeriodRange"];
            members: components["schemas"]["app__schemas__dashboard__MemberStats"];
            /** Weekly Movements */
            weekly_movements: components["schemas"]["WeeklyMovement"][];
            bookings: components["schemas"]["BookingStats"];
            occupancy: components["schemas"]["OccupancyStats"];
            /** Expiring Memberships */
            expiring_memberships: components["schemas"]["ExpiringMembership"][];
            plans: components["schemas"]["PlanStats"];
            /** Popular Classes */
            popular_classes: components["schemas"]["PopularClass"][];
        };
        /**
         * ErrorResponse
         * @description Formato de error común: `detail` con el mensaje y `code` de dominio.
         * @example {
         *       "code": "not_found",
         *       "detail": "Recurso no encontrado"
         *     }
         */
        ErrorResponse: {
            /** Detail */
            detail: string;
            /** Code */
            code: string;
        };
        /** ExpiringMembership */
        ExpiringMembership: {
            /** Membership Id */
            membership_id: number;
            /** User Id */
            user_id: number;
            /** Full Name */
            full_name: string;
            /** Plan Name */
            plan_name: string;
            /**
             * End Date
             * Format: date
             */
            end_date: string;
            /** Days Left */
            days_left: number;
        };
        /**
         * ForgotPasswordRequest
         * @example {
         *       "email": "socio@example.com"
         *     }
         */
        ForgotPasswordRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
        };
        /**
         * GymClassCreate
         * @example {
         *       "capacity": 15,
         *       "is_active": true,
         *       "name": "Yoga",
         *       "room_id": 1,
         *       "trainer_id": 2
         *     }
         */
        GymClassCreate: {
            /** Name */
            name: string;
            /** Capacity */
            capacity: number;
            /** Trainer Id */
            trainer_id: number;
            /** Room Id */
            room_id?: number | null;
            /**
             * Is Active
             * @default true
             */
            is_active: boolean;
        };
        /**
         * GymClassRead
         * @example {
         *       "capacity": 15,
         *       "created_at": "2026-01-01T10:00:00Z",
         *       "id": 1,
         *       "is_active": true,
         *       "name": "Yoga",
         *       "room_id": 1,
         *       "trainer_id": 2,
         *       "trainer_name": "Laura Entrenadora"
         *     }
         */
        GymClassRead: {
            /** Id */
            id: number;
            /** Name */
            name: string;
            /** Capacity */
            capacity: number;
            /** Trainer Id */
            trainer_id: number;
            /** Trainer Name */
            trainer_name: string;
            /** Room Id */
            room_id: number | null;
            /** Is Active */
            is_active: boolean;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /** GymClassUpdate */
        GymClassUpdate: {
            /** Name */
            name?: string | null;
            /** Capacity */
            capacity?: number | null;
            /** Trainer Id */
            trainer_id?: number | null;
            /** Room Id */
            room_id?: number | null;
            /** Is Active */
            is_active?: boolean | null;
        };
        /**
         * LoginRequest
         * @example {
         *       "email": "socio@example.com",
         *       "password": "Athletica123!"
         *     }
         */
        LoginRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Password */
            password: string;
            /**
             * Totp Code
             * @description Código de 6 cifras de la app; solo si la cuenta tiene verificación en dos pasos
             */
            totp_code?: string | null;
        };
        /**
         * LogoutRequest
         * @description The refresh token is optional: send it so it is revoked too.
         * @example {
         *       "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
         *     }
         */
        LogoutRequest: {
            /** Refresh Token */
            refresh_token?: string | null;
        };
        /** MemberDashboard */
        MemberDashboard: {
            membership: components["schemas"]["CurrentMembership"] | null;
            /** Upcoming Bookings */
            upcoming_bookings: components["schemas"]["UpcomingBooking"][];
            stats: components["schemas"]["app__schemas__member_dashboard__MemberStats"];
        };
        /** MemberLastPayment */
        MemberLastPayment: {
            /** Payment Id */
            payment_id: number;
            /** Amount Cents */
            amount_cents: number;
            status: components["schemas"]["PaymentStatus"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /**
         * MembershipCreate
         * @example {
         *       "plan_id": 1,
         *       "start_date": "2026-01-01",
         *       "user_id": 1
         *     }
         */
        MembershipCreate: {
            /** User Id */
            user_id: number;
            /** Plan Id */
            plan_id: number;
            /**
             * Start Date
             * Format: date
             */
            start_date: string;
        };
        /**
         * MembershipPlanCreate
         * @example {
         *       "description": "Acceso completo durante 30 días",
         *       "duration_days": 30,
         *       "is_active": true,
         *       "name": "Mensual",
         *       "price_cents": 3999
         *     }
         */
        MembershipPlanCreate: {
            /** Name */
            name: string;
            /** Description */
            description?: string | null;
            /** Price Cents */
            price_cents: number;
            /** Duration Days */
            duration_days: number;
            /**
             * Is Active
             * @default true
             */
            is_active: boolean;
        };
        /**
         * MembershipPlanRead
         * @example {
         *       "created_at": "2026-01-01T10:00:00Z",
         *       "description": "Acceso completo durante 30 días",
         *       "duration_days": 30,
         *       "id": 1,
         *       "is_active": true,
         *       "name": "Mensual",
         *       "price_cents": 3999
         *     }
         */
        MembershipPlanRead: {
            /** Id */
            id: number;
            /** Name */
            name: string;
            /** Description */
            description: string | null;
            /** Price Cents */
            price_cents: number;
            /** Duration Days */
            duration_days: number;
            /** Is Active */
            is_active: boolean;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /** MembershipPlanUpdate */
        MembershipPlanUpdate: {
            /** Name */
            name?: string | null;
            /** Description */
            description?: string | null;
            /** Price Cents */
            price_cents?: number | null;
            /** Duration Days */
            duration_days?: number | null;
            /** Is Active */
            is_active?: boolean | null;
        };
        /**
         * MembershipRead
         * @example {
         *       "created_at": "2026-01-01T10:00:00Z",
         *       "end_date": "2026-01-31",
         *       "id": 1,
         *       "plan_id": 1,
         *       "start_date": "2026-01-01",
         *       "status": "active",
         *       "user_id": 1
         *     }
         */
        MembershipRead: {
            /** Id */
            id: number;
            /** User Id */
            user_id: number;
            /** Plan Id */
            plan_id: number;
            /**
             * Start Date
             * Format: date
             */
            start_date: string;
            /**
             * End Date
             * Format: date
             */
            end_date: string;
            status: components["schemas"]["MembershipStatus"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /**
         * MembershipStatus
         * @enum {string}
         */
        MembershipStatus: "active" | "expired" | "cancelled";
        /**
         * MembershipSummary
         * @description A membership with the name of its plan, as the member and admin screens show it.
         */
        MembershipSummary: {
            /** Membership Id */
            membership_id: number;
            /** Plan Id */
            plan_id: number;
            /** Plan Name */
            plan_name: string;
            /**
             * Start Date
             * Format: date
             */
            start_date: string;
            /**
             * End Date
             * Format: date
             */
            end_date: string;
            status: components["schemas"]["MembershipStatus"];
        };
        /** MembershipUpdate */
        MembershipUpdate: {
            /** Start Date */
            start_date?: string | null;
            status?: components["schemas"]["MembershipStatus"] | null;
        };
        /** OccupancyStats */
        OccupancyStats: {
            /** Average Rate */
            average_rate: number;
            /** By Class */
            by_class: components["schemas"]["ClassOccupancy"][];
        };
        /** Page[AdminMember] */
        Page_AdminMember_: {
            /** Items */
            items: components["schemas"]["AdminMember"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Size */
            size: number;
            /** Pages */
            pages: number;
        };
        /** Page[BookingRead] */
        Page_BookingRead_: {
            /** Items */
            items: components["schemas"]["BookingRead"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Size */
            size: number;
            /** Pages */
            pages: number;
        };
        /** Page[ClassScheduleRead] */
        Page_ClassScheduleRead_: {
            /** Items */
            items: components["schemas"]["ClassScheduleRead"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Size */
            size: number;
            /** Pages */
            pages: number;
        };
        /** Page[GymClassRead] */
        Page_GymClassRead_: {
            /** Items */
            items: components["schemas"]["GymClassRead"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Size */
            size: number;
            /** Pages */
            pages: number;
        };
        /** Page[MembershipPlanRead] */
        Page_MembershipPlanRead_: {
            /** Items */
            items: components["schemas"]["MembershipPlanRead"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Size */
            size: number;
            /** Pages */
            pages: number;
        };
        /** Page[MembershipRead] */
        Page_MembershipRead_: {
            /** Items */
            items: components["schemas"]["MembershipRead"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Size */
            size: number;
            /** Pages */
            pages: number;
        };
        /** Page[PaymentRead] */
        Page_PaymentRead_: {
            /** Items */
            items: components["schemas"]["PaymentRead"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Size */
            size: number;
            /** Pages */
            pages: number;
        };
        /** Page[RoomRead] */
        Page_RoomRead_: {
            /** Items */
            items: components["schemas"]["RoomRead"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Size */
            size: number;
            /** Pages */
            pages: number;
        };
        /** Page[UserRead] */
        Page_UserRead_: {
            /** Items */
            items: components["schemas"]["UserRead"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Size */
            size: number;
            /** Pages */
            pages: number;
        };
        /** PasswordChange */
        PasswordChange: {
            /** Current Password */
            current_password: string;
            /**
             * New Password
             * @description La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
             */
            new_password: string;
        };
        /**
         * PaymentCreate
         * @example {
         *       "amount_cents": 3999,
         *       "membership_id": 1,
         *       "status": "paid",
         *       "user_id": 1
         *     }
         */
        PaymentCreate: {
            /** User Id */
            user_id: number;
            /** Membership Id */
            membership_id: number;
            /** Amount Cents */
            amount_cents: number;
            /** @default pending */
            status: components["schemas"]["PaymentStatus"];
        };
        /**
         * PaymentRead
         * @example {
         *       "amount_cents": 3999,
         *       "created_at": "2026-01-01T10:00:00Z",
         *       "id": 1,
         *       "membership_id": 1,
         *       "status": "paid",
         *       "user_id": 1
         *     }
         */
        PaymentRead: {
            /** Id */
            id: number;
            /** User Id */
            user_id: number;
            /** Membership Id */
            membership_id: number;
            /** Amount Cents */
            amount_cents: number;
            status: components["schemas"]["PaymentStatus"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /**
         * PaymentStatus
         * @enum {string}
         */
        PaymentStatus: "pending" | "paid" | "failed";
        /** PaymentUpdate */
        PaymentUpdate: {
            /** Amount Cents */
            amount_cents?: number | null;
            status?: components["schemas"]["PaymentStatus"] | null;
        };
        /** PeriodRange */
        PeriodRange: {
            /**
             * Key
             * @enum {string}
             */
            key: "today" | "7d" | "30d";
            /**
             * Start
             * Format: date
             */
            start: string;
            /**
             * End
             * Format: date
             */
            end: string;
        };
        /** PlanShare */
        PlanShare: {
            /** Plan Id */
            plan_id: number;
            /** Name */
            name: string;
            /** Price Cents */
            price_cents: number;
            /** Members */
            members: number;
            /** Share */
            share: number;
        };
        /** PlanStats */
        PlanStats: {
            /** Active Memberships */
            active_memberships: number;
            /** Monthly Recurring Cents */
            monthly_recurring_cents: number;
            /** By Plan */
            by_plan: components["schemas"]["PlanShare"][];
        };
        /** PopularClass */
        PopularClass: {
            /** Class Id */
            class_id: number;
            /** Name */
            name: string;
            /** Bookings */
            bookings: number;
        };
        /** ProfileUpdate */
        ProfileUpdate: {
            /** Email */
            email?: string | null;
            /** Full Name */
            full_name?: string | null;
        };
        /**
         * RefreshRequest
         * @example {
         *       "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
         *     }
         */
        RefreshRequest: {
            /** Refresh Token */
            refresh_token: string;
        };
        /**
         * RegisterRequest
         * @example {
         *       "email": "nuevo@example.com",
         *       "full_name": "Nuevo Socio",
         *       "password": "Athletica123!"
         *     }
         */
        RegisterRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Full Name */
            full_name: string;
            /**
             * Password
             * @description La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
             */
            password: string;
        };
        /**
         * ResetPasswordRequest
         * @example {
         *       "new_password": "Nueva123!",
         *       "token": "eyJhbGciOiJIUzI1NiIs..."
         *     }
         */
        ResetPasswordRequest: {
            /** Token */
            token: string;
            /**
             * New Password
             * @description La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
             */
            new_password: string;
        };
        /**
         * RoomCreate
         * @example {
         *       "capacity": 20,
         *       "name": "Sala 1"
         *     }
         */
        RoomCreate: {
            /** Name */
            name: string;
            /** Capacity */
            capacity: number;
        };
        /**
         * RoomRead
         * @example {
         *       "capacity": 20,
         *       "id": 1,
         *       "name": "Sala 1"
         *     }
         */
        RoomRead: {
            /** Id */
            id: number;
            /** Name */
            name: string;
            /** Capacity */
            capacity: number;
        };
        /** RoomUpdate */
        RoomUpdate: {
            /** Name */
            name?: string | null;
            /** Capacity */
            capacity?: number | null;
        };
        /**
         * ScheduleAvailability
         * @description Spots of one session: a schedule on a given date.
         */
        ScheduleAvailability: {
            /** Schedule Id */
            schedule_id: number;
            /**
             * On Date
             * Format: date
             */
            on_date: string;
            /** Capacity */
            capacity: number;
            /** Booked */
            booked: number;
            /** Available */
            available: number;
        };
        /**
         * Token
         * @example {
         *       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
         *       "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
         *       "token_type": "bearer",
         *       "user": {
         *         "created_at": "2026-01-01T10:00:00Z",
         *         "email": "socio@example.com",
         *         "full_name": "Socio Uno",
         *         "id": 1,
         *         "is_active": true,
         *         "role": "member"
         *       }
         *     }
         */
        Token: {
            /** Access Token */
            access_token: string;
            /** Refresh Token */
            refresh_token: string;
            /**
             * Token Type
             * @default bearer
             */
            token_type: string;
            user: components["schemas"]["UserRead"];
        };
        /**
         * TotpCode
         * @example {
         *       "code": "123456"
         *     }
         */
        TotpCode: {
            /**
             * Code
             * @description Código de 6 cifras de la app
             */
            code: string;
        };
        /**
         * TotpSetup
         * @description Shown once, while two-factor authentication is being turned on.
         * @example {
         *       "otpauth_url": "otpauth://totp/Athletica:socio%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Athletica",
         *       "secret": "JBSWY3DPEHPK3PXP"
         *     }
         */
        TotpSetup: {
            /** Secret */
            secret: string;
            /** Otpauth Url */
            otpauth_url: string;
        };
        /** UpcomingBooking */
        UpcomingBooking: {
            /** Booking Id */
            booking_id: number;
            /**
             * Booking Date
             * Format: date
             */
            booking_date: string;
            /** Schedule Id */
            schedule_id: number;
            /** Class Id */
            class_id: number;
            /** Class Name */
            class_name: string;
            /**
             * Start Time
             * Format: time
             */
            start_time: string;
            /**
             * End Time
             * Format: time
             */
            end_time: string;
            /** Room Name */
            room_name: string | null;
            /** Trainer Name */
            trainer_name: string;
        };
        /**
         * UserAudit
         * @description Who created and last changed a user, and when. Empty values: unknown (older accounts).
         * @example {
         *       "created_at": "2026-10-15T09:30:00Z",
         *       "created_by": {
         *         "email": "admin@example.com",
         *         "full_name": "Admin",
         *         "id": 1
         *       },
         *       "updated_at": "2026-10-15T11:02:00Z",
         *       "updated_by": {
         *         "email": "socia@example.com",
         *         "full_name": "Socia Uno",
         *         "id": 7
         *       },
         *       "user_id": 7
         *     }
         */
        UserAudit: {
            /** User Id */
            user_id: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            created_by: components["schemas"]["UserRef"] | null;
            /** Updated At */
            updated_at: string | null;
            updated_by: components["schemas"]["UserRef"] | null;
        };
        /**
         * UserCreate
         * @example {
         *       "email": "socio@example.com",
         *       "full_name": "Socio Uno",
         *       "is_active": true,
         *       "password": "Athletica123!",
         *       "role": "member"
         *     }
         */
        UserCreate: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Full Name */
            full_name: string;
            /** @default member */
            role: components["schemas"]["UserRole"];
            /**
             * Is Active
             * @default true
             */
            is_active: boolean;
            /**
             * Password
             * @description La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
             */
            password: string;
        };
        /**
         * UserFilters
         * @description Query filters of the users listing. Date ranges include both ends.
         */
        UserFilters: {
            role?: components["schemas"]["UserRole"] | null;
            /** Is Active */
            is_active?: boolean | null;
            /**
             * Search
             * @description Texto en el nombre o el email
             */
            search?: string | null;
            /**
             * Created From
             * @description Altas desde esta fecha
             */
            created_from?: string | null;
            /**
             * Created To
             * @description Altas hasta esta fecha
             */
            created_to?: string | null;
            /**
             * Deactivated From
             * @description Bajas desde esta fecha
             */
            deactivated_from?: string | null;
            /**
             * Deactivated To
             * @description Bajas hasta esta fecha
             */
            deactivated_to?: string | null;
        };
        /**
         * UserRead
         * @example {
         *       "created_at": "2026-01-01T10:00:00Z",
         *       "email": "socio@example.com",
         *       "full_name": "Socio Uno",
         *       "id": 1,
         *       "is_active": true,
         *       "role": "member"
         *     }
         */
        UserRead: {
            /** Id */
            id: number;
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Full Name */
            full_name: string;
            role: components["schemas"]["UserRole"];
            /** Is Active */
            is_active: boolean;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Deactivated At */
            deactivated_at: string | null;
        };
        /**
         * UserRef
         * @description A person named in the audit trail.
         */
        UserRef: {
            /** Id */
            id: number;
            /** Full Name */
            full_name: string;
            /**
             * Email
             * Format: email
             */
            email: string;
        };
        /**
         * UserRole
         * @enum {string}
         */
        UserRole: "admin" | "trainer" | "member";
        /** UserUpdate */
        UserUpdate: {
            /** Email */
            email?: string | null;
            /** Full Name */
            full_name?: string | null;
            role?: components["schemas"]["UserRole"] | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Password */
            password?: string | null;
        };
        /**
         * ValidationError
         * @description One field that failed validation. Same name and shape FastAPI gives it, so API clients
         *     generated from the schema keep their `ValidationError` type.
         */
        ValidationError: {
            /** Loc */
            loc: (string | number)[];
            /** Msg */
            msg: string;
            /** Type */
            type: string;
        } & {
            [key: string]: unknown;
        };
        /**
         * ValidationErrorResponse
         * @description A 422: `detail` is a message, or the list of fields that failed validation.
         * @example {
         *       "code": "validation_error",
         *       "detail": [
         *         {
         *           "loc": [
         *             "body",
         *             "email"
         *           ],
         *           "msg": "Field required",
         *           "type": "missing"
         *         }
         *       ]
         *     }
         */
        ValidationErrorResponse: {
            /** Detail */
            detail: string | components["schemas"]["ValidationError"][];
            /** Code */
            code: string;
        };
        /**
         * VerifyEmailRequest
         * @example {
         *       "token": "eyJhbGciOiJIUzI1NiIs..."
         *     }
         */
        VerifyEmailRequest: {
            /** Token */
            token: string;
        };
        /**
         * WeeklyMovement
         * @description Signups and sign-offs of one week (seven days, both ends included).
         */
        WeeklyMovement: {
            /**
             * Start
             * Format: date
             */
            start: string;
            /**
             * End
             * Format: date
             */
            end: string;
            /** Signups */
            signups: number;
            /** Sign Offs */
            sign_offs: number;
        };
        /** MemberStats */
        app__schemas__dashboard__MemberStats: {
            /** Active */
            active: number;
            /** Signups */
            signups: number;
            /** Sign Offs */
            sign_offs: number;
        };
        /** MemberStats */
        app__schemas__member_dashboard__MemberStats: {
            /** Bookings This Month */
            bookings_this_month: number;
            /** Total Bookings */
            total_bookings: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    register_api_v1_auth_register_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Token"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    login_api_v1_auth_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Token"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
            /** @description Demasiados intentos en poco tiempo. La cabecera `Retry-After` indica cuántos segundos esperar. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Demasiados intentos de inicio de sesión. Vuelve a intentarlo en 42 segundos",
                     *       "code": "too_many_requests"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    issue_oauth2_token_api_v1_auth_token_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/x-www-form-urlencoded": components["schemas"]["Body_issue_oauth2_token_api_v1_auth_token_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Token"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
            /** @description Demasiados intentos en poco tiempo. La cabecera `Retry-After` indica cuántos segundos esperar. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Demasiados intentos de inicio de sesión. Vuelve a intentarlo en 42 segundos",
                     *       "code": "too_many_requests"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    refresh_token_api_v1_auth_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Token"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    logout_api_v1_auth_logout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["LogoutRequest"] | null;
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    verify_email_api_v1_auth_verify_email_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyEmailRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    forgot_password_api_v1_auth_forgot_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ForgotPasswordRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    reset_password_api_v1_auth_reset_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    setup_two_factor_api_v1_auth_2fa_setup_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TotpSetup"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    enable_two_factor_api_v1_auth_2fa_enable_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TotpCode"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    disable_two_factor_api_v1_auth_2fa_disable_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TotpCode"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    read_current_user_api_v1_auth_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    github_login_api_v1_auth_github_login_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            307: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    github_callback_api_v1_auth_github_callback_get: {
        parameters: {
            query?: {
                code?: string | null;
                state?: string | null;
                error?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: {
                github_oauth_state?: string | null;
            };
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            307: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_users_api_v1_users_get: {
        parameters: {
            query: {
                filters: components["schemas"]["UserFilters"];
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_UserRead_"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    create_user_api_v1_users_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    read_own_user_api_v1_users_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_user_api_v1_users__user_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    update_user_api_v1_users__user_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    deactivate_user_api_v1_users__user_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    update_profile_api_v1_users__user_id__profile_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    change_password_api_v1_users__user_id__password_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordChange"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_user_audit_api_v1_users__user_id__audit_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserAudit"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_user_memberships_api_v1_users__user_id__memberships_get: {
        parameters: {
            query?: {
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_MembershipRead_"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_user_bookings_api_v1_users__user_id__bookings_get: {
        parameters: {
            query?: {
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path: {
                user_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_BookingRead_"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_plans_api_v1_membership_plans_get: {
        parameters: {
            query?: {
                active_only?: boolean;
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_MembershipPlanRead_"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    create_plan_api_v1_membership_plans_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MembershipPlanCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipPlanRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_plan_api_v1_membership_plans__plan_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                plan_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipPlanRead"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    update_plan_api_v1_membership_plans__plan_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                plan_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MembershipPlanUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipPlanRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    delete_plan_api_v1_membership_plans__plan_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                plan_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_memberships_api_v1_memberships_get: {
        parameters: {
            query?: {
                status_filter?: components["schemas"]["MembershipStatus"] | null;
                user_id?: number | null;
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_MembershipRead_"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    create_membership_api_v1_memberships_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MembershipCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipRead"];
                };
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_membership_api_v1_memberships__membership_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                membership_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    update_membership_api_v1_memberships__membership_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                membership_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MembershipUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MembershipRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    delete_membership_api_v1_memberships__membership_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                membership_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_rooms_api_v1_rooms_get: {
        parameters: {
            query?: {
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_RoomRead_"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    create_room_api_v1_rooms_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoomCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoomRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_room_api_v1_rooms__room_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                room_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoomRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    update_room_api_v1_rooms__room_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                room_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoomUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoomRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    delete_room_api_v1_rooms__room_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                room_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_classes_api_v1_classes_get: {
        parameters: {
            query?: {
                trainer_id?: number | null;
                active_only?: boolean;
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_GymClassRead_"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    create_class_api_v1_classes_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GymClassCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GymClassRead"];
                };
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_class_api_v1_classes__class_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GymClassRead"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    update_class_api_v1_classes__class_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GymClassUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GymClassRead"];
                };
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    delete_class_api_v1_classes__class_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_class_schedules_api_v1_classes__class_id__schedules_get: {
        parameters: {
            query?: {
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path: {
                class_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ClassScheduleRead_"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_schedules_api_v1_class_schedules_get: {
        parameters: {
            query?: {
                class_id?: number | null;
                day_of_week?: number | null;
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ClassScheduleRead_"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    create_schedule_api_v1_class_schedules_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClassScheduleCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClassScheduleRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_schedule_api_v1_class_schedules__schedule_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                schedule_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClassScheduleRead"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    update_schedule_api_v1_class_schedules__schedule_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                schedule_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClassScheduleUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClassScheduleRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    delete_schedule_api_v1_class_schedules__schedule_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                schedule_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_schedule_availability_api_v1_class_schedules__schedule_id__availability_get: {
        parameters: {
            query: {
                on_date: string;
            };
            header?: never;
            path: {
                schedule_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScheduleAvailability"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_schedule_bookings_api_v1_class_schedules__schedule_id__bookings_get: {
        parameters: {
            query?: {
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path: {
                schedule_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_BookingRead_"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_bookings_api_v1_bookings_get: {
        parameters: {
            query?: {
                member_id?: number | null;
                schedule_id?: number | null;
                status_filter?: components["schemas"]["BookingStatus"] | null;
                on_date?: string | null;
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_BookingRead_"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    create_booking_api_v1_bookings_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BookingCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BookingRead"];
                };
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_booking_api_v1_bookings__booking_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                booking_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BookingRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    cancel_booking_api_v1_bookings__booking_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                booking_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Los datos son correctos, pero una regla de negocio lo impide. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El socio no tiene una membresía activa en esa fecha",
                     *       "code": "business_rule"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description La petición choca con datos que ya existen. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "El email ya está registrado",
                     *       "code": "conflict"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_payments_api_v1_payments_get: {
        parameters: {
            query?: {
                status_filter?: components["schemas"]["PaymentStatus"] | null;
                user_id?: number | null;
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_PaymentRead_"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    create_payment_api_v1_payments_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PaymentCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_payment_api_v1_payments__payment_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                payment_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    update_payment_api_v1_payments__payment_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                payment_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PaymentUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentRead"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    delete_payment_api_v1_payments__payment_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                payment_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description El recurso indicado no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Usuario 999 no encontrado",
                     *       "code": "not_found"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    export_members_api_v1_export_members_csv_get: {
        parameters: {
            query?: {
                role?: components["schemas"]["UserRole"] | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    export_bookings_api_v1_export_bookings_csv_get: {
        parameters: {
            query?: {
                member_id?: number | null;
                schedule_id?: number | null;
                status_filter?: components["schemas"]["BookingStatus"] | null;
                on_date?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_dashboard_api_v1_admin_dashboard_get: {
        parameters: {
            query?: {
                period?: "today" | "7d" | "30d";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DashboardSummary"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    list_members_api_v1_admin_members_get: {
        parameters: {
            query: {
                filters: components["schemas"]["UserFilters"];
                /** @description Número de página (empieza en 1) */
                page?: number;
                /** @description Elementos por página */
                size?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_AdminMember_"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Hay sesión, pero ese rol o ese usuario no tiene permiso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "No tienes permiso para realizar esta acción",
                     *       "code": "forbidden"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": [
                     *         {
                     *           "type": "missing",
                     *           "loc": [
                     *             "body",
                     *             "email"
                     *           ],
                     *           "msg": "Field required",
                     *           "input": {}
                     *         }
                     *       ],
                     *       "code": "validation_error"
                     *     }
                     */
                    "application/json": components["schemas"]["ValidationErrorResponse"];
                };
            };
        };
    };
    get_my_dashboard_api_v1_me_dashboard_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberDashboard"];
                };
            };
            /** @description Falta el token, ha caducado o no es válido; o las credenciales son incorrectas. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": "Falta el token de acceso",
                     *       "code": "unauthorized"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    health_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
        };
    };
}
