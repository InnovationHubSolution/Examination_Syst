const mongoose = require('mongoose');

const trainingResourceSchema = new mongoose.Schema({
    // Resource Identification
    resourceCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },

    // Resource Type
    resourceType: {
        type: String,
        enum: [
            'Assessment Literacy Manual',
            'Marking Training Video',
            'Examiner Feedback Report',
            'Professional Development Course',
            'Workshop Material',
            'Webinar Recording',
            'Tutorial',
            'Best Practice Guide',
            'Case Study'
        ],
        required: true
    },

    // Content
    description: {
        type: String,
        required: true
    },
    learningObjectives: [{
        type: String
    }],
    duration: {
        hours: Number,
        minutes: Number
    },

    // Target Audience
    targetRoles: [{
        type: String,
        enum: ['teacher', 'examiner', 'moderator', 'invigilator', 'school_admin']
    }],
    subjects: [{
        type: String
    }],
    yearLevels: [{
        type: String,
        enum: ['Y8', 'Y10', 'Y12', 'Y13', 'All']
    }],

    // Media Files
    files: [{
        title: String,
        filename: String,
        path: String,
        fileType: String,
        size: Number,
        duration: Number, // for videos in seconds
        uploadedAt: Date
    }],

    // Video-specific fields
    videoUrl: {
        type: String,
        trim: true
    },
    thumbnail: {
        filename: String,
        path: String
    },

    // Assessment/Quiz
    hasAssessment: {
        type: Boolean,
        default: false
    },
    assessmentQuestions: [{
        question: String,
        questionType: {
            type: String,
            enum: ['multiple_choice', 'true_false', 'short_answer', 'essay']
        },
        options: [String],
        correctAnswer: String,
        points: Number
    }],
    passingScore: {
        type: Number,
        default: 70
    },

    // Completion Tracking
    completions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        completedAt: Date,
        assessmentScore: Number,
        certificateIssued: Boolean,
        certificateNumber: String
    }],

    // Professional Development Calendar
    scheduleType: {
        type: String,
        enum: ['self_paced', 'scheduled', 'recurring'],
        default: 'self_paced'
    },
    scheduledSessions: [{
        sessionDate: Date,
        startTime: String,
        endTime: String,
        venue: String,
        facilitator: String,
        maxParticipants: Number,
        registeredParticipants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],

    // Status
    status: {
        type: String,
        enum: ['draft', 'active', 'archived', 'under_review'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },

    // Prerequisites
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingResource'
    }],

    // Related Resources
    relatedResources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingResource'
    }],

    // Ratings & Feedback
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },

    // Statistics
    viewCount: {
        type: Number,
        default: 0
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    completionRate: {
        type: Number,
        default: 0
    },

    // Metadata
    keywords: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
trainingResourceSchema.index({ resourceCode: 1 });
trainingResourceSchema.index({ resourceType: 1, status: 1 });
trainingResourceSchema.index({ targetRoles: 1 });

module.exports = mongoose.model('TrainingResource', trainingResourceSchema);
