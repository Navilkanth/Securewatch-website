import mongoose from 'mongoose';

const uploadHistorySchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    fileType: { type: String, enum: ['JSON', 'CSV'], required: true },
    totalRecords: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    errors: [{ record: mongoose.Schema.Types.Mixed, message: String }],
    status: {
      type: String,
      enum: ['completed', 'partial', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export default mongoose.model('UploadHistory', uploadHistorySchema);
