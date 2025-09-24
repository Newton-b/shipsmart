"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const user = this.userRepository.create(createUserDto);
        return this.userRepository.save(user);
    }
    async findAll(page = 1, limit = 10, search) {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        if (search) {
            queryBuilder.where('user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.company ILIKE :search', { search: `%${search}%` });
        }
        const [users, total] = await queryBuilder
            .orderBy('user.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            users,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepository.findOne({
            where: { email },
        });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email is already taken');
            }
        }
        Object.assign(user, updateUserDto);
        user.updatedAt = new Date();
        return this.userRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
    async deactivate(id) {
        const user = await this.findOne(id);
        user.isActive = false;
        user.updatedAt = new Date();
        return this.userRepository.save(user);
    }
    async activate(id) {
        const user = await this.findOne(id);
        user.isActive = true;
        user.updatedAt = new Date();
        return this.userRepository.save(user);
    }
    async updateLastLogin(id) {
        await this.userRepository.update(id, {
            lastLoginAt: new Date(),
            updatedAt: new Date(),
        });
    }
    async getUserStats() {
        const [total, active, inactive, verified, unverified,] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { isActive: true } }),
            this.userRepository.count({ where: { isActive: false } }),
            this.userRepository.count({ where: { emailVerified: true } }),
            this.userRepository.count({ where: { emailVerified: false } }),
        ]);
        const roleStats = await this.userRepository
            .createQueryBuilder('user')
            .select('user.role', 'role')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.role')
            .getRawMany();
        const byRole = roleStats.reduce((acc, stat) => {
            acc[stat.role] = parseInt(stat.count);
            return acc;
        }, {});
        return {
            total,
            active,
            inactive,
            verified,
            unverified,
            byRole,
        };
    }
    async getRecentUsers(limit = 10) {
        return this.userRepository.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], UsersService);
//# sourceMappingURL=users.service.js.map