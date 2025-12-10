const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  schoolCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  schoolName: {
    type: String,
    required: true,
    trim: true
  },
  schoolType: {
    type: String,
    enum: ['Primary', 'Secondary', 'Combined', 'College'],
    required: true
  },
  
  // Location
  province: {
    type: String,
    required: true,
    enum: [
      'Malampa',
      'Penama',
      'Sanma',
      'Shefa',
      'Tafea',
      'Torba'
    ]
  },
  island: {
    type: String,
    required: true
  },
  area: {
    type: String,
    trim: true
  },
  
  // Contact Information
  address: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // School Administration
  principal: {
    name: String,
    email: String,
    phone: String
  },
  examCoordinator: {
    name: String,
    email: String,
    phone: String
  },
  
  // School Status
  isActive: {
    type: Boolean,
    default: true
  },
  isExamCentre: {
    type: Boolean,
    default: false
  },
  
  // Capacity and Facilities
  studentCapacity: {
    type: Number
  },
  examCapacity: {
    type: Number
  },
  facilities: [{
    type: String,
    enum: [
      'Computer Lab',
      'Science Lab',
      'Library',
      'Sports Facilities',
      'Special Needs Facilities',
      'Electricity',
      'Internet Access'
    ]
  }],
  
  // Registration Details
  registrationNumber: {
    type: String,
    trim: true
  },
  
  // Statistics
  totalStudents: {
    type: Number,
    default: 0
  },
  totalTeachers: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
schoolSchema.index({ schoolCode: 1 });
schoolSchema.index({ province: 1 });
schoolSchema.index({ isActive: 1, isExamCentre: 1 });

module.exports = mongoose.model('School', schoolSchema);
