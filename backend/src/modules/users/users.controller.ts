import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Get,
  Param,
  Put,
  Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

// Define the file type for uploaded files
interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Simple user interface for demo
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  avatar?: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

// In-memory user storage for demo (replace with database)
const users: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Demo Company',
    role: 'shipper',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  }
];

@Controller('users')
export class UsersController {
  
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), 'uploads', 'avatars');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadAvatar(@UploadedFile() file: UploadedFileType) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // In a real app, you'd get the user ID from JWT token
    const userId = '1'; // Demo user ID
    
    // Generate avatar URL
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    
    // Update user avatar in database (demo with in-memory storage)
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      // Delete old avatar file if exists
      if (users[userIndex].avatar) {
        const oldAvatarPath = join(process.cwd(), users[userIndex].avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      users[userIndex].avatar = avatarUrl;
    }

    return {
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully'
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    return {
      success: true,
      user: {
        ...user,
        // Don't return sensitive data
      }
    };
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: Partial<User>) {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new BadRequestException('User not found');
    }

    // Update user data
    users[userIndex] = { ...users[userIndex], ...updateData };

    return {
      success: true,
      user: users[userIndex],
      message: 'Profile updated successfully'
    };
  }
}
