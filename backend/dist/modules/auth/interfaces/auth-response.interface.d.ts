import { UserRole } from '../../users/entities/user.entity';
export declare class AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
}
export declare class AuthResponse {
    accessToken: string;
    user: AuthUser;
}
