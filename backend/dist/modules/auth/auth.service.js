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
var AuthService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../users/entities/user.entity");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, role } = registerDto;
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: role || 'end_user',
            isActive: true,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const savedUser = await this.userRepository.save(user);
        this.logger.log(`New user registered: ${email}`);
        const payload = {
            sub: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                id: savedUser.id,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                role: savedUser.role,
                isActive: savedUser.isActive,
                emailVerified: savedUser.emailVerified,
                createdAt: savedUser.createdAt,
            },
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive', 'emailVerified', 'createdAt'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.logger.log(`User logged in: ${email}`);
        await this.userRepository.update(user.id, {
            lastLoginAt: new Date(),
            updatedAt: new Date(),
        });
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.isActive,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
            },
        };
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive'],
        });
        if (user && user.isActive) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }
    async validateJwtPayload(payload) {
        const user = await this.userRepository.findOne({
            where: { id: payload.sub, email: payload.email },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        return user;
    }
    async refreshToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'password'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid current password');
        }
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        await this.userRepository.update(userId, {
            password: hashedNewPassword,
            updatedAt: new Date(),
        });
        this.logger.log(`Password changed for user: ${userId}`);
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            return;
        }
        const resetToken = this.jwtService.sign({ sub: user.id, type: 'password-reset' }, { expiresIn: '1h' });
        await this.userRepository.update(user.id, {
            resetToken,
            resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
            updatedAt: new Date(),
        });
        this.logger.log(`Password reset requested for: ${email}`);
    }
    async resetPassword(token, newPassword) {
        try {
            const decoded = this.jwtService.verify(token);
            if (decoded.type !== 'password-reset') {
                throw new common_1.UnauthorizedException('Invalid reset token');
            }
            const user = await this.userRepository.findOne({
                where: {
                    id: decoded.sub,
                    resetToken: token,
                },
            });
            if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
                throw new common_1.UnauthorizedException('Invalid or expired reset token');
            }
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await this.userRepository.update(user.id, {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                updatedAt: new Date(),
            });
            this.logger.log(`Password reset completed for user: ${user.id}`);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map