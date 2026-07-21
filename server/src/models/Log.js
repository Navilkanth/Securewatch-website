import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true, index: true },
    role: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    resourceType: { type: String, required: true, index: true },
    ipAddress: { type: String, required: true, index: true },
    region: { type: String, required: true, index: true },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Resolved', 'Unresolved', 'Investigating'],
      default: 'Unresolved',
      index: true,
    },
    timestamp: { type: Date, required: true, index: true },
    riskScore: { type: Number, default: 0, index: true },
    investigationNotes: { type: String, default: '' },
    assignedTo: { type: String, default: '' },
    aiSummary: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
logSchema.index({ severity: 1, status: 1, timestamp: -1 });
logSchema.index({ actor: 1, timestamp: -1 });
logSchema.index({ region: 1, severity: 1 });
logSchema.index({ action: 1, timestamp: -1 });

// Text index for global search
logSchema.index({
  actor: 'text',
  action: 'text',
  resource: 'text',
  ipAddress: 'text',
  region: 'text',
});

export default mongoose.model('Log', logSchema);
