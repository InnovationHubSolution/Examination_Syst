const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Assessment title is required'],
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['assignment', 'project', 'quiz', 'presentation', 'practical', 'coursework'],
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        required: true,
        trim: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dueDate: {
        type: Date,
        required: true
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
    attachments: [{
        filename: String,
        path: String,
        fileType: String,
        uploadedAt: Date
    }],
    rubric: [{
        criteria: String,
        maxPoints: Number,
        description: String
    }],
    allowLateSubmission: {
        type: Boolean,
        default: false
    },
    lateSubmissionPenalty: {
        type: Number, // percentage deduction
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'closed', 'archived'],
        default: 'draft'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    publishDate: {
        type: Date
    }
}, {
    timestamps: true
});

assessmentSchema.index({ subject: 1, grade: 1, teacher: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
