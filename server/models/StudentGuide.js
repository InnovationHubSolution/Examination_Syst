const mongoose = require('mongoose');

const studentGuideSchema = new mongoose.Schema({
    // Guide Identification
    guideCode: {
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

    // Guide Type
    guideType: {
        type: String,
        enum: [
            'How Exams Work',
            'Study Guide',
            'Preparation Tool',
            'Exam Rules',
            'Prohibited Items',
            'Appeals Procedure',
            'Re-marking Procedure',
            'Subject-specific Guide',
            'Time Management',
            'Stress Management'
        ],
        required: true
    },

    // Content
    description: {
        type: String,
        required: true
    },
    content: {
        type: String
    },

    // Target Audience
    targetYearLevels: [{
        type: String,
        enum: ['Y8', 'Y10', 'Y12', 'Y13', 'All']
    }],
    targetSubjects: [{
        type: String
    }],
    audienceType: {
        type: String,
        enum: ['Students', 'Parents', 'Both'],
        default: 'Students'
    },

    // Media Files
    files: [{
        title: String,
        filename: String,
        path: String,
        fileType: String,
        size: Number,
        uploadedAt: Date
    }],

    // Video Tutorials
    videoTutorials: [{
        title: String,
        description: String,
        videoUrl: String,
        duration: Number, // in seconds
        thumbnail: String
    }],

    // Interactive Elements
    hasInteractiveQuiz: {
        type: Boolean,
        default: false
    },
    quizQuestions: [{
        question: String,
        options: [String],
        correctAnswer: String,
        explanation: String
    }],

    // Checklist Items (for preparation)
    checklists: [{
        title: String,
        items: [{
            task: String,
            isRequired: Boolean,
            deadline: String // relative, e.g., "1 week before exam"
        }]
    }],

    // FAQ Section
    faqs: [{
        question: String,
        answer: String,
        category: String
    }],

    // Important Dates (dynamic by year)
    importantDates: [{
        eventName: String,
        description: String,
        dateType: {
            type: String,
            enum: ['fixed', 'relative']
        },
        date: Date,
        relativeDays: Number // days before/after exam
    }],

    // Exam Rules & Regulations
    examRules: [{
        rule: String,
        category: String,
        severity: {
            type: String,
            enum: ['advisory', 'important', 'critical']
        }
    }],

    // Prohibited Items List
    prohibitedItems: [{
        item: String,
        reason: String,
        consequences: String
    }],

    // Appeals & Re-marking Info
    appealsInfo: {
        eligibilityCriteria: [String],
        deadlines: String,
        requiredDocuments: [String],
        fees: {
            amount: Number,
            currency: String
        },
        process: [String],
        expectedTimeline: String
    },

    // Study Tips & Strategies
    studyTips: [{
        tip: String,
        category: String,
        effectiveness: {
            type: String,
            enum: ['high', 'medium', 'low']
        }
    }],

    // Sample Questions/Papers
    sampleQuestions: [{
        question: String,
        subject: String,
        yearLevel: String,
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard']
        },
        solutionProvided: Boolean,
        solution: String
    }],

    // External Resources
    externalLinks: [{
        title: String,
        url: String,
        description: String,
        verified: Boolean
    }],

    // Status
    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },

    // Version Control
    version: {
        type: String,
        default: '1.0'
    },
    lastReviewed: {
        type: Date
    },

    // Accessibility
    isHighContrast: {
        type: Boolean,
        default: false
    },
    hasAudioVersion: {
        type: Boolean,
        default: false
    },
    languages: [{
        type: String,
        enum: ['English', 'Bislama', 'French']
    }],

    // Engagement Metrics
    viewCount: {
        type: Number,
        default: 0
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    notHelpfulVotes: {
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
studentGuideSchema.index({ guideCode: 1 });
studentGuideSchema.index({ guideType: 1, status: 1 });
studentGuideSchema.index({ targetYearLevels: 1 });

module.exports = mongoose.model('StudentGuide', studentGuideSchema);
