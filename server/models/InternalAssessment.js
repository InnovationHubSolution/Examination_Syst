const mongoose = require('mongoose');

const internalAssessmentSchema = new mongoose.Schema({
    // School and Teacher Information
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Assessment Details
    subject: {
        type: String,
        required: true,
        trim: true
    },
    yearLevel: {
        type: String,
        enum: ['Y8', 'Y10', 'Y12', 'Y13'],
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    term: {
        type: String,
        enum: ['Term 1', 'Term 2', 'Term 3'],
        required: true
    },

    // Assessment Information
    assessmentType: {
        type: String,
        enum: ['Coursework', 'Practical', 'Portfolio', 'Project', 'Oral', 'Written'],
        required: true
    },
    assessmentTitle: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },

    // Student Submissions
    studentSubmissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        candidateId: String,
        studentName: String,
        files: [{
            filename: String,
            path: String,
            fileType: String,
            size: Number,
            uploadedAt: Date
        }],
        marks: {
            obtained: Number,
            total: Number,
            percentage: Number
        },
        teacherComments: String,
        moderatorComments: String
    }],

    // Upload Information
    uploadDate: {
        type: Date,
        default: Date.now
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Supporting Documents
    assessmentTask: {
        filename: String,
        path: String,
        uploadedAt: Date
    },
    markingRubric: {
        filename: String,
        path: String,
        uploadedAt: Date
    },
    coverSheet: {
        filename: String,
        path: String,
        uploadedAt: Date
    },

    // Moderation Process
    moderationStatus: {
        type: String,
        enum: [
            'pending_submission',
            'submitted',
            'under_review',
            'requires_correction',
            'approved',
            'rejected'
        ],
        default: 'pending_submission'
    },

    // Moderator Assignment
    assignedModerator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderationStartDate: {
        type: Date
    },
    moderationCompletionDate: {
        type: Date
    },

    // Moderation Feedback
    moderationFeedback: [{
        moderator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        feedbackType: {
            type: String,
            enum: ['general', 'marking', 'documentation', 'standards']
        },
        feedback: String,
        isResolved: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Corrections Required
    correctionsRequired: [{
        issue: String,
        description: String,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },
        isResolved: {
            type: Boolean,
            default: false
        },
        resolvedAt: Date,
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],

    // Resubmission History
    resubmissions: [{
        resubmittedAt: Date,
        resubmittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changes: String
    }],

    // Final Approval
    finalApproval: {
        approved: {
            type: Boolean,
            default: false
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: Date,
        comments: String
    },

    // Notifications
    notificationsSent: [{
        type: {
            type: String,
            enum: ['submission', 'correction_required', 'approved', 'rejected', 'reminder']
        },
        sentTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        sentAt: Date,
        message: String
    }],

    // Deadlines
    submissionDeadline: {
        type: Date,
        required: true
    },
    moderationDeadline: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
internalAssessmentSchema.index({ school: 1, academicYear: 1 });
internalAssessmentSchema.index({ teacher: 1, moderationStatus: 1 });
internalAssessmentSchema.index({ assignedModerator: 1, moderationStatus: 1 });
internalAssessmentSchema.index({ yearLevel: 1, subject: 1 });

module.exports = mongoose.model('InternalAssessment', internalAssessmentSchema);
