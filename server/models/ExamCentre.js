const mongoose = require('mongoose');

const examCentreSchema = new mongoose.Schema({
  centreCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  centreName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Location
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  province: {
    type: String,
    required: true
  },
  
  // Contact Information
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  
  // Centre Capacity
  capacity: {
    totalSeats: {
      type: Number,
      required: true
    },
    regularSeats: {
      type: Number,
      required: true
    },
    specialNeedsSeats: {
      type: Number,
      default: 0
    }
  },
  
  // Facilities
  facilities: [{
    type: String,
    enum: [
      'Accessible Entrance',
      'Wheelchair Access',
      'Special Needs Room',
      'First Aid Room',
      'Backup Generator',
      'Security System',
      'CCTV',
      'Proper Ventilation',
      'Adequate Lighting'
    ]
  }],
  
  // Supervisor Information
  centreSupervisor: {
    name: {
      type: String,
      required: true
    },
    phone: String,
    email: String,
    qualifications: String
  },
  
  // Deputy Supervisors
  deputySupervisors: [{
    name: String,
    phone: String,
    email: String,
    role: String
  }],
  
  // Invigilators
  invigilators: [{
    name: String,
    phone: String,
    email: String,
    subject: String,
    trainingCompleted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Exam Scheduling
  availableFor: [{
    yearLevel: {
      type: String,
      enum: ['Y8', 'Y10', 'Y12', 'Y13']
    },
    examYear: String
  }],
  
  // Assigned Candidates
  assignedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_approval', 'maintenance'],
    default: 'pending_approval'
  },
  
  // Approval Information
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  
  // Notes
  notes: [{
    text: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
examCentreSchema.index({ centreCode: 1 });
examCentreSchema.index({ province: 1, status: 1 });

module.exports = mongoose.model('ExamCentre', examCentreSchema);
