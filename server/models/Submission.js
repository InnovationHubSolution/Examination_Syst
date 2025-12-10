const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['submitted', 'late', 'graded', 'returned', 'resubmitted'],
        default: 'submitted'
    },
    files: [{
        filename: String,
        path: String,
        fileType: String,
        size: Number,
        uploadedAt: Date
    }],
    textContent: {
        type: String
    },
    grade: {
        score: {
            type: Number
        },
        percentage: {
            type: Number
        },
        letterGrade: {
            type: String
        },
        feedback: {
            type: String
        },
        rubricScores: [{
            criteria: String,
            score: Number,
            comment: String
        }],
        gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        gradedAt: {
            type: Date
        }
    },
    isLate: {
        type: Boolean,
        default: false
    },
    penaltyApplied: {
        type: Number,
        default: 0
    },
    attempts: {
        type: Number,
        default: 1
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

submissionSchema.index({ assessment: 1, student: 1 });
submissionSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
