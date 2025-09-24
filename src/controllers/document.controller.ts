import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { DocumentService } from '../services/document.service';

export interface Document {
  id: string;
  name: string;
  type: 'commercial_invoice' | 'packing_list' | 'bill_of_lading' | 'certificate_of_origin' | 'customs_declaration' | 'insurance_certificate' | 'other';
  category: 'customs' | 'shipping' | 'insurance' | 'compliance' | 'financial';
  shipmentId?: string;
  customerId?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  uploadedBy: string;
  approvedBy?: string;
  expiryDate?: Date;
  tags: string[];
  metadata: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentDto {
  name: string;
  type: string;
  category: string;
  shipmentId?: string;
  customerId?: string;
  uploadedBy: string;
  expiryDate?: Date;
  tags?: string[];
  metadata?: { [key: string]: any };
}

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents with filtering' })
  @ApiQuery({ name: 'type', description: 'Filter by document type', required: false })
  @ApiQuery({ name: 'category', description: 'Filter by category', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false })
  @ApiQuery({ name: 'shipmentId', description: 'Filter by shipment ID', required: false })
  @ApiQuery({ name: 'customerId', description: 'Filter by customer ID', required: false })
  @ApiQuery({ name: 'search', description: 'Search by name or tags', required: false })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getDocuments(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('shipmentId') shipmentId?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      
      return await this.documentService.getDocuments({
        type,
        category,
        status,
        shipmentId,
        customerId,
        search,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocument(@Param('id') id: string): Promise<Document> {
    try {
      const document = await this.documentService.getDocumentById(id);
      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }
      return document;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to retrieve document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        type: { type: 'string' },
        category: { type: 'string' },
        shipmentId: { type: 'string' },
        customerId: { type: 'string' },
        uploadedBy: { type: 'string' },
        expiryDate: { type: 'string', format: 'date' },
        tags: { type: 'string', description: 'Comma-separated tags' },
        metadata: { type: 'string', description: 'JSON metadata' },
      },
      required: ['file', 'name', 'type', 'category', 'uploadedBy'],
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or data' })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<Document> {
    try {
      if (!file) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }

      this.validateDocumentData(createDocumentDto);
      return await this.documentService.uploadDocument(file, createDocumentDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async updateDocument(
    @Param('id') id: string,
    @Body() updateDocumentDto: Partial<CreateDocumentDto>,
  ): Promise<Document> {
    try {
      const document = await this.documentService.updateDocument(id, updateDocumentDto);
      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }
      return document;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approvedBy: { type: 'string', description: 'Approver ID' },
        notes: { type: 'string', description: 'Approval notes' },
      },
      required: ['approvedBy'],
    },
  })
  @ApiResponse({ status: 200, description: 'Document approved successfully' })
  async approveDocument(
    @Param('id') id: string,
    @Body() approvalDto: { approvedBy: string; notes?: string },
  ): Promise<Document> {
    try {
      return await this.documentService.approveDocument(id, approvalDto.approvedBy, approvalDto.notes);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to approve document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rejectedBy: { type: 'string', description: 'Rejector ID' },
        reason: { type: 'string', description: 'Rejection reason' },
      },
      required: ['rejectedBy', 'reason'],
    },
  })
  @ApiResponse({ status: 200, description: 'Document rejected successfully' })
  async rejectDocument(
    @Param('id') id: string,
    @Body() rejectionDto: { rejectedBy: string; reason: string },
  ): Promise<Document> {
    try {
      return await this.documentService.rejectDocument(id, rejectionDto.rejectedBy, rejectionDto.reason);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to reject document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.documentService.deleteDocument(id);
      if (!deleted) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Document deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('types/available')
  @ApiOperation({ summary: 'Get available document types and categories' })
  @ApiResponse({ status: 200, description: 'Document types retrieved successfully' })
  async getDocumentTypes() {
    try {
      return await this.documentService.getDocumentTypes();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve document types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('expiring/soon')
  @ApiOperation({ summary: 'Get documents expiring soon' })
  @ApiQuery({ name: 'days', description: 'Days ahead to check for expiry', required: false })
  @ApiResponse({ status: 200, description: 'Expiring documents retrieved successfully' })
  async getExpiringDocuments(@Query('days') days?: string): Promise<Document[]> {
    try {
      const daysAhead = parseInt(days) || 30;
      return await this.documentService.getExpiringDocuments(daysAhead);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve expiring documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get document analytics and statistics' })
  @ApiResponse({ status: 200, description: 'Document analytics retrieved successfully' })
  async getDocumentAnalytics() {
    try {
      return await this.documentService.getDocumentAnalytics();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve document analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateDocumentData(data: CreateDocumentDto): void {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Document name is required');
    if (!data.type?.trim()) errors.push('Document type is required');
    if (!data.category?.trim()) errors.push('Document category is required');
    if (!data.uploadedBy?.trim()) errors.push('Uploader ID is required');

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}
