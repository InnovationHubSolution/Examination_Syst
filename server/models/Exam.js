const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Exam title is required'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    grade: {
        type: String,
        required: [true, 'Grade level is required'],
        trim: true
    },
    examType: {
        type: String,
        enum: ['midterm', 'final', 'quarterly', 'national', 'mock', 'practice'],
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    term: {
        type: String,
        enum: ['Term 1', 'Term 2', 'Term 3', 'Full Year'],
        required: true
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Exam date is required']
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    venue: {
        type: String,
        trim: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingMarks: {
        type: Number,
        required: true
    },
    instructions: {
        type: String
    },
    syllabus: [{
        topic: String,
        subtopics: [String]
    }],
    examiner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'draft'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    attachments: [{
        filename: String,
        path: String,
        uploadedAt: Date
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
examSchema.index({ subject: 1, grade: 1, scheduledDate: 1 });

module.exports = mongoose.model('Exam', examSchema);
