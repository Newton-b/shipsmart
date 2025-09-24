import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, CreateDocumentDto } from '../controllers/document.controller';
import { DocumentDocument } from '../entities/document.entity';
import * as path from 'path';
import * as fs from 'fs';

export interface DocumentFilters {
  type?: string;
  category?: string;
  status?: string;
  shipmentId?: string;
  customerId?: string;
  search?: string;
  page: number;
  limit: number;
}

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel('Document') private documentModel: Model<DocumentDocument>,
  ) {}

  async getDocuments(filters: DocumentFilters) {
    const { type, category, status, shipmentId, customerId, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (shipmentId) {
      query.shipmentId = shipmentId;
    }
    
    if (customerId) {
      query.customerId = customerId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [documents, total] = await Promise.all([
      this.documentModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.documentModel.countDocuments(query).exec(),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getDocumentById(id: string): Promise<Document | null> {
    return await this.documentModel.findById(id).exec();
  }

  async uploadDocument(file: Express.Multer.File, createDocumentDto: CreateDocumentDto): Promise<Document> {
    // In a real implementation, you would upload to cloud storage (AWS S3, Google Cloud, etc.)
    // For now, we'll simulate the upload process
    
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save file to disk (in production, upload to cloud storage)
    fs.writeFileSync(filePath, file.buffer);

    const document = new this.documentModel({
      ...createDocumentDto,
      fileName: file.originalname,
      fileUrl: `/uploads/documents/${fileName}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: 'pending',
      tags: createDocumentDto.tags || [],
      metadata: createDocumentDto.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await document.save();
  }

  async updateDocument(id: string, updateDocumentDto: Partial<CreateDocumentDto>): Promise<Document | null> {
    return await this.documentModel
      .findByIdAndUpdate(
        id,
        { ...updateDocumentDto, updatedAt: new Date() },
        { new: true }
      )
      .exec();
  }

  async approveDocument(id: string, approvedBy: string, notes?: string): Promise<Document> {
    const document = await this.documentModel
      .findByIdAndUpdate(
        id,
        {
          status: 'approved',
          approvedBy,
          'metadata.approvalNotes': notes || '',
          'metadata.approvedAt': new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  async rejectDocument(id: string, rejectedBy: string, reason: string): Promise<Document> {
    const document = await this.documentModel
      .findByIdAndUpdate(
        id,
        {
          status: 'rejected',
          'metadata.rejectedBy': rejectedBy,
          'metadata.rejectionReason': reason,
          'metadata.rejectedAt': new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const document = await this.documentModel.findById(id).exec();
    if (!document) {
      return false;
    }

    // Delete physical file (in production, delete from cloud storage)
    try {
      const filePath = path.join(process.cwd(), 'uploads', 'documents', path.basename(document.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    const result = await this.documentModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getDocumentTypes() {
    return {
      types: [
        { value: 'commercial_invoice', label: 'Commercial Invoice', description: 'Invoice for goods sold' },
        { value: 'packing_list', label: 'Packing List', description: 'Detailed list of packed items' },
        { value: 'bill_of_lading', label: 'Bill of Lading', description: 'Transport document' },
        { value: 'certificate_of_origin', label: 'Certificate of Origin', description: 'Country of origin certification' },
        { value: 'customs_declaration', label: 'Customs Declaration', description: 'Customs clearance document' },
        { value: 'insurance_certificate', label: 'Insurance Certificate', description: 'Cargo insurance document' },
        { value: 'other', label: 'Other', description: 'Other document types' },
      ],
      categories: [
        { value: 'customs', label: 'Customs', description: 'Customs and border control documents' },
        { value: 'shipping', label: 'Shipping', description: 'Transportation and logistics documents' },
        { value: 'insurance', label: 'Insurance', description: 'Insurance and risk management documents' },
        { value: 'compliance', label: 'Compliance', description: 'Regulatory compliance documents' },
        { value: 'financial', label: 'Financial', description: 'Financial and payment documents' },
      ],
      statuses: [
        { value: 'pending', label: 'Pending', description: 'Awaiting review' },
        { value: 'approved', label: 'Approved', description: 'Document approved' },
        { value: 'rejected', label: 'Rejected', description: 'Document rejected' },
        { value: 'expired', label: 'Expired', description: 'Document has expired' },
      ],
    };
  }

  async getExpiringDocuments(days: number = 30): Promise<Document[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return await this.documentModel
      .find({
        expiryDate: { $exists: true, $lte: expiryDate },
        status: { $ne: 'expired' }
      })
      .sort({ expiryDate: 1 })
      .exec();
  }

  async getDocumentAnalytics() {
    // Mock analytics data - in real implementation, this would aggregate from documents collection
    return {
      totalDocuments: 1847,
      pendingApproval: 23,
      approvedDocuments: 1654,
      rejectedDocuments: 89,
      expiredDocuments: 81,
      expiringIn30Days: 15,
      typeBreakdown: [
        { type: 'Commercial Invoice', count: 542, percentage: 29.3 },
        { type: 'Packing List', count: 398, percentage: 21.6 },
        { type: 'Bill of Lading', count: 287, percentage: 15.5 },
        { type: 'Certificate of Origin', count: 234, percentage: 12.7 },
        { type: 'Customs Declaration', count: 198, percentage: 10.7 },
        { type: 'Insurance Certificate', count: 145, percentage: 7.8 },
        { type: 'Other', count: 43, percentage: 2.3 },
      ],
      categoryBreakdown: [
        { category: 'Customs', count: 678, percentage: 36.7 },
        { category: 'Shipping', count: 589, percentage: 31.9 },
        { category: 'Financial', count: 298, percentage: 16.1 },
        { category: 'Insurance', count: 187, percentage: 10.1 },
        { category: 'Compliance', count: 95, percentage: 5.1 },
      ],
      monthlyTrends: [
        { month: 'Jan', uploaded: 142, approved: 135, rejected: 7 },
        { month: 'Feb', uploaded: 156, approved: 148, rejected: 8 },
        { month: 'Mar', uploaded: 178, approved: 165, rejected: 13 },
        { month: 'Apr', uploaded: 165, approved: 158, rejected: 7 },
        { month: 'May', uploaded: 189, approved: 175, rejected: 14 },
        { month: 'Jun', uploaded: 203, approved: 192, rejected: 11 },
      ],
      processingMetrics: {
        averageApprovalTime: 2.3, // hours
        approvalRate: 94.2, // percentage
        documentsPerShipment: 4.8,
        digitalAdoption: 87.5, // percentage of digital vs paper
      },
      topUploaders: [
        { uploader: 'John Smith', count: 89 },
        { uploader: 'Sarah Johnson', count: 76 },
        { uploader: 'Mike Chen', count: 65 },
        { uploader: 'Lisa Brown', count: 58 },
        { uploader: 'David Wilson', count: 52 },
      ],
    };
  }

  async markExpiredDocuments(): Promise<number> {
    const now = new Date();
    const result = await this.documentModel
      .updateMany(
        {
          expiryDate: { $lt: now },
          status: { $ne: 'expired' }
        },
        {
          status: 'expired',
          updatedAt: now
        }
      )
      .exec();

    return result.modifiedCount;
  }

  async getDocumentsByShipment(shipmentId: string): Promise<Document[]> {
    return await this.documentModel
      .find({ shipmentId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getDocumentsByCustomer(customerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      this.documentModel
        .find({ customerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.documentModel.countDocuments({ customerId }).exec(),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async bulkApproveDocuments(documentIds: string[], approvedBy: string): Promise<number> {
    const result = await this.documentModel
      .updateMany(
        { _id: { $in: documentIds }, status: 'pending' },
        {
          status: 'approved',
          approvedBy,
          'metadata.approvedAt': new Date(),
          updatedAt: new Date(),
        }
      )
      .exec();

    return result.modifiedCount;
  }

  async getDocumentStatistics() {
    const [
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      expiredCount,
    ] = await Promise.all([
      this.documentModel.countDocuments().exec(),
      this.documentModel.countDocuments({ status: 'pending' }).exec(),
      this.documentModel.countDocuments({ status: 'approved' }).exec(),
      this.documentModel.countDocuments({ status: 'rejected' }).exec(),
      this.documentModel.countDocuments({ status: 'expired' }).exec(),
    ]);

    return {
      total: totalCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      expired: expiredCount,
      approvalRate: totalCount > 0 ? (approvedCount / totalCount) * 100 : 0,
    };
  }
}
