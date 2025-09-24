import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        verified: number;
        unverified: number;
        byRole: Record<string, number>;
    }>;
    getRecentUsers(limit?: number): Promise<User[]>;
    getProfile(req: any): Promise<User>;
    findOne(id: string): Promise<User>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    deactivate(id: string): Promise<User>;
    activate(id: string): Promise<User>;
    remove(id: string): Promise<void>;
}
