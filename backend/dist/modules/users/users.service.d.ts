import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    deactivate(id: string): Promise<User>;
    activate(id: string): Promise<User>;
    updateLastLogin(id: string): Promise<void>;
    getUserStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        verified: number;
        unverified: number;
        byRole: Record<string, number>;
    }>;
    getRecentUsers(limit?: number): Promise<User[]>;
}
