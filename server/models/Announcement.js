const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required']
  },
  category: {
    type: String,
    enum: ['general', 'exam', 'assessment', 'policy', 'event', 'urgent', 'maintenance'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  targetAudience: [{
    type: String,
    enum: ['all', 'students', 'teachers', 'administrators', 'examiners']
  }],
  targetGrades: [{
    type: String
  }],
  targetSubjects: [{
    type: String
  }],
  attachments: [{
    filename: String,
    path: String,
    fileType: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: Date
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

announcementSchema.index({ isPublished: 1, publishDate: -1 });
announcementSchema.index({ category: 1, priority: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
