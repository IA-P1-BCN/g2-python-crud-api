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
         * @description Cancela una reserva. Solo el socio propietario o un administrador.
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
            members: components["schemas"]["MemberStats"];
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
         *       "trainer_id": 2
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
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /**
         * LoginRequest
         * @example {
         *       "email": "socio@example.com",
         *       "password": "gymflow123"
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
        };
        /** MemberStats */
        MemberStats: {
            /** Active */
            active: number;
            /** Signups */
            signups: number;
            /** Sign Offs */
            sign_offs: number;
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
            /** New Password */
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
         * RegisterRequest
         * @example {
         *       "email": "nuevo@example.com",
         *       "full_name": "Nuevo Socio",
         *       "password": "gymflow123"
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
            /** Password */
            password: string;
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
            /**
             * Token Type
             * @default bearer
             */
            token_type: string;
            user: components["schemas"]["UserRead"];
        };
        /**
         * UserCreate
         * @example {
         *       "email": "socio@example.com",
         *       "full_name": "Socio Uno",
         *       "is_active": true,
         *       "password": "gymflow123",
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
            /** Password */
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
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
            /** Input */
            input?: unknown;
            /** Context */
            ctx?: Record<string, never>;
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
