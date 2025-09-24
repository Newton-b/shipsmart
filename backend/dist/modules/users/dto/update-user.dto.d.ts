import { CreateUserDto } from './create-user.dto';
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    isActive?: boolean;
    emailVerified?: boolean;
    timezone?: string;
    language?: string;
    avatar?: string;
    notificationPreferences?: {
        email: boolean;
        sms: boolean;
        push: boolean;
        shipmentUpdates: boolean;
        paymentAlerts: boolean;
        marketingEmails: boolean;
    };
}
export {};
