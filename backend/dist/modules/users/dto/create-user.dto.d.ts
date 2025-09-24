import { UserRole } from '../entities/user.entity';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}
