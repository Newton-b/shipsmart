export declare enum UserRole {
    ADMIN = "administrator",
    END_USER = "end_user",
    CARRIER = "carrier",
    DRIVER = "driver",
    DISPATCHER = "dispatcher",
    CUSTOMER_SERVICE = "customer_service",
    FINANCE = "finance"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    avatar?: string;
    isActive: boolean;
    emailVerified: boolean;
    timezone: string;
    language: string;
    notificationPreferences?: {
        email: boolean;
        sms: boolean;
        push: boolean;
        shipmentUpdates: boolean;
        paymentAlerts: boolean;
        marketingEmails: boolean;
    };
    resetToken?: string;
    resetTokenExpiry?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
    toJSON(): Omit<this, "password" | "resetToken" | "resetTokenExpiry" | "fullName" | "toJSON">;
}
