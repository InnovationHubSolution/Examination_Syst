const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificateType: {
    type: String,
    enum: ['completion', 'achievement', 'merit', 'distinction', 'participation', 'transcript'],
    required: true
  },
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  academicYear: {
    type: String,
    required: true
  },
  grade: {
    type: String
  },
  subject: {
    type: String
  },
  results: [{
    subject: String,
    grade: String,
    score: Number
  }],
  overallGrade: {
    type: String
  },
  gpa: {
    type: Number
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  issuedBy: {
    name: String,
    title: String,
    signature: String
  },
  verificationCode: {
    type: String,
    unique: true,
    required: true
  },
  pdfPath: {
    type: String
  },
  qrCode: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  lastVerified: {
    type: Date
  },
  metadata: {
    school: String,
    principal: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ student: 1, academicYear: 1 });

// Auto-generate certificate number
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Certificate').countDocuments();
    this.certificateNumber = `VU-CERT-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  if (!this.verificationCode) {
    this.verificationCode = require('crypto').randomBytes(16).toString('hex').toUpperCase();
  }
  
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
