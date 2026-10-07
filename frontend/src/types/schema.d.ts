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
        /** Register */
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
        /** Login */
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
        /** Read Current User */
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
        /** List Users */
        get: operations["list_users_api_v1_users_get"];
        put?: never;
        /** Create User */
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
        /** Get User */
        get: operations["get_user_api_v1_users__user_id__get"];
        /** Update User */
        put: operations["update_user_api_v1_users__user_id__put"];
        post?: never;
        /** Delete User */
        delete: operations["delete_user_api_v1_users__user_id__delete"];
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
        /** List User Memberships */
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
        /** List User Bookings */
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
        /** List Plans */
        get: operations["list_plans_api_v1_membership_plans_get"];
        put?: never;
        /** Create Plan */
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
        /** Get Plan */
        get: operations["get_plan_api_v1_membership_plans__plan_id__get"];
        /** Update Plan */
        put: operations["update_plan_api_v1_membership_plans__plan_id__put"];
        post?: never;
        /** Delete Plan */
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
        /** List Memberships */
        get: operations["list_memberships_api_v1_memberships_get"];
        put?: never;
        /** Create Membership */
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
        /** Get Membership */
        get: operations["get_membership_api_v1_memberships__membership_id__get"];
        /** Update Membership */
        put: operations["update_membership_api_v1_memberships__membership_id__put"];
        post?: never;
        /** Delete Membership */
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
        /** List Rooms */
        get: operations["list_rooms_api_v1_rooms_get"];
        put?: never;
        /** Create Room */
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
        /** Get Room */
        get: operations["get_room_api_v1_rooms__room_id__get"];
        /** Update Room */
        put: operations["update_room_api_v1_rooms__room_id__put"];
        post?: never;
        /** Delete Room */
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
        /** List Classes */
        get: operations["list_classes_api_v1_classes_get"];
        put?: never;
        /** Create Class */
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
        /** Get Class */
        get: operations["get_class_api_v1_classes__class_id__get"];
        /** Update Class */
        put: operations["update_class_api_v1_classes__class_id__put"];
        post?: never;
        /** Delete Class */
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
        /** List Class Schedules */
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
        /** List Schedules */
        get: operations["list_schedules_api_v1_class_schedules_get"];
        put?: never;
        /** Create Schedule */
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
        /** Get Schedule */
        get: operations["get_schedule_api_v1_class_schedules__schedule_id__get"];
        /** Update Schedule */
        put: operations["update_schedule_api_v1_class_schedules__schedule_id__put"];
        post?: never;
        /** Delete Schedule */
        delete: operations["delete_schedule_api_v1_class_schedules__schedule_id__delete"];
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
        /** List Schedule Bookings */
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
        /** List Bookings */
        get: operations["list_bookings_api_v1_bookings_get"];
        put?: never;
        /** Create Booking */
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
        /** Get Booking */
        get: operations["get_booking_api_v1_bookings__booking_id__get"];
        put?: never;
        post?: never;
        /** Cancel Booking */
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
        /** List Payments */
        get: operations["list_payments_api_v1_payments_get"];
        put?: never;
        /** Create Payment */
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
        /** Get Payment */
        get: operations["get_payment_api_v1_payments__payment_id__get"];
        /** Update Payment */
        put: operations["update_payment_api_v1_payments__payment_id__put"];
        post?: never;
        /** Delete Payment */
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
        /** Export Members */
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
        /** Export Bookings */
        get: operations["export_bookings_api_v1_export_bookings_csv_get"];
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
        /** Health */
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
        /** BookingCreate */
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
        /** BookingRead */
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
        /**
         * BookingStatus
         * @enum {string}
         */
        BookingStatus: "confirmed" | "cancelled";
        /** ClassScheduleCreate */
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
        /** ClassScheduleRead */
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
        /** GymClassCreate */
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
        /** GymClassRead */
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
        /** LoginRequest */
        LoginRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Password */
            password: string;
        };
        /** MembershipCreate */
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
        /** MembershipPlanCreate */
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
        /** MembershipPlanRead */
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
        /** MembershipRead */
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
        /** PaymentCreate */
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
        /** PaymentRead */
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
        /** RegisterRequest */
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
        /** RoomCreate */
        RoomCreate: {
            /** Name */
            name: string;
            /** Capacity */
            capacity: number;
        };
        /** RoomRead */
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
        /** Token */
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
        /** UserCreate */
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
        /** UserRead */
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
            query?: {
                role?: components["schemas"]["UserRole"] | null;
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
    delete_user_api_v1_users__user_id__delete: {
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
                content?: never;
            };
        };
    };
    export_bookings_api_v1_export_bookings_csv_get: {
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
                content?: never;
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
