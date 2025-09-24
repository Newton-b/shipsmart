import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { NotificationStatus, NotificationType } from './schemas/notification.schema';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: NotificationStatus })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async findAll(
    @GetUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: NotificationStatus,
    @Query('type') type?: NotificationType,
  ) {
    return this.notificationsService.findAll(user.id, page, limit, status, type);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
  })
  async getUnreadCount(@GetUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { unreadCount: count };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  async markAllAsRead(@GetUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete('all')
  @ApiOperation({ summary: 'Delete all notifications' })
  @ApiQuery({ name: 'status', required: false, enum: NotificationStatus })
  @ApiResponse({
    status: 200,
    description: 'Notifications deleted successfully',
  })
  async deleteAll(
    @GetUser() user: User,
    @Query('status') status?: NotificationStatus,
  ) {
    return this.notificationsService.deleteAll(user.id, status);
  }

  @Get('mock/:count')
  @ApiOperation({ summary: 'Generate mock notifications for testing' })
  @ApiResponse({
    status: 200,
    description: 'Mock notifications generated',
  })
  async generateMockNotifications(
    @GetUser() user: User,
    @Param('count', ParseIntPipe) count: number,
  ) {
    return this.notificationsService.generateMockNotifications(user.id, count);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
  })
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.findOne(id, user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  async markAsRead(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark notification as unread' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as unread',
  })
  async markAsUnread(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.markAsUnread(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.notificationsService.delete(id, user.id);
    return { message: 'Notification deleted successfully' };
  }
}
