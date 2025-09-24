import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocumentType = 
  | 'commercial_invoice' 
  | 'packing_list' 
  | 'bill_of_lading' 
  | 'certificate_of_origin' 
  | 'customs_declaration' 
  | 'insurance_certificate' 
  | 'other';

export type DocumentCategory = 'customs' | 'shipping' | 'insurance' | 'compliance' | 'financial';
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type DocumentDocument = DocumentEntity & Document & {
  isExpired: boolean;
  fileExtension: string;
};

@Schema({ 
  collection: 'documents',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class DocumentEntity {
  @Prop({ 
    type: String, 
    required: true, 
    trim: true,
    index: 'text',
  })
  name: string;

  @Prop({ 
    type: String,
    enum: ['commercial_invoice', 'packing_list', 'bill_of_lading', 'certificate_of_origin', 'customs_declaration', 'insurance_certificate', 'other'], 
    required: true,
    index: true,
  })
  type: DocumentType;

  @Prop({ 
    type: String,
    enum: ['customs', 'shipping', 'insurance', 'compliance', 'financial'], 
    required: true,
    index: true,
  })
  category: DocumentCategory;

  @Prop({ 
    type: String,
    index: true,
  })
  shipmentId?: string;

  @Prop({ 
    type: String,
    index: true,
  })
  customerId?: string;

  @Prop({ 
    type: String, 
    required: true,
  })
  fileUrl: string;

  @Prop({ 
    type: String, 
    required: true,
    trim: true,
  })
  fileName: string;

  @Prop({ 
    type: Number, 
    required: true, 
    min: 0,
    set: (v: number) => Math.round(v),
  })
  fileSize: number;

  @Prop({ 
    type: String, 
    required: true,
    trim: true,
  })
  mimeType: string;

  @Prop({ 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'expired'], 
    default: 'pending',
    index: true,
  })
  status: DocumentStatus;

  @Prop({ 
    type: String, 
    required: true,
    index: true,
  })
  uploadedBy: string;

  @Prop({ 
    type: String,
    index: true,
  })
  approvedBy?: string;

  @Prop({ 
    type: Date,
    index: true,
  })
  expiryDate?: Date;

  @Prop({ 
    type: [String], 
    default: [],
    index: true,
  })
  tags: string[];

  @Prop({ 
    type: Object, 
    default: {},
  })
  metadata: {
    rejectionReason?: string;
    approvedAt?: Date;
    rejectedAt?: Date;
    [key: string]: any;
  };

  @Prop({ 
    type: Date, 
    default: Date.now,
    index: true,
  })
  createdAt: Date;

  @Prop({ 
    type: Date, 
    default: Date.now,
  })
  updatedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);

// Add indexes for common queries
DocumentSchema.index({ customerId: 1, status: 1 });
DocumentSchema.index({ shipmentId: 1, type: 1 });
DocumentSchema.index({ type: 1, category: 1 });
DocumentSchema.index({ expiryDate: 1, status: 1 });
DocumentSchema.index({ 'metadata.rejectedAt': 1 });
DocumentSchema.index({ 'metadata.approvedAt': 1 });
DocumentSchema.index({ uploadedBy: 1, status: 1 });
DocumentSchema.index({ approvedBy: 1, status: 1 });
DocumentSchema.index({ tags: 1, status: 1 });

// Add virtual for isExpired
DocumentSchema.virtual('isExpired').get(function() {
  return this.expiryDate ? this.expiryDate < new Date() : false;
});

// Add virtual for file extension
DocumentSchema.virtual('fileExtension').get(function() {
  return this.fileName ? this.fileName.split('.').pop().toLowerCase() : '';
});

// Add pre-save hook to update timestamps
DocumentSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

// Add method to get public document data
DocumentSchema.methods.toJSON = function() {
  const doc = this.toObject();
  
  // Remove sensitive data
  delete doc.__v;
  
  return doc;
};
