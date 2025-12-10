const mongoose = require('mongoose');

const nationalStandardSchema = new mongoose.Schema({
    // Standard Identification
    standardCode: {
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

    // Subject and Level
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

    // Standard Type
    standardType: {
        type: String,
        enum: ['Achievement Standard', 'Unit Standard', 'Learning Outcome'],
        required: true
    },

    // Description
    description: {
        type: String,
        required: true
    },
    learningOutcomes: [{
        outcome: String,
        level: {
            type: String,
            enum: ['Foundation', 'Standard', 'Advanced']
        }
    }],

    // Credits and Points
    credits: {
        type: Number,
        default: 0
    },
    totalPoints: {
        type: Number,
        default: 100
    },

    // Grading Descriptors
    gradingDescriptors: [{
        grade: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
        },
        minPercentage: Number,
        maxPercentage: Number,
        descriptor: String,
        criteria: [String]
    }],

    // Assessment Criteria
    assessmentCriteria: [{
        criterion: String,
        weight: Number,
        description: String,
        indicators: [String]
    }],

    // Resources
    teachingResources: [{
        title: String,
        description: String,
        fileType: String,
        file: {
            filename: String,
            path: String
        }
    }],

    // Exemplars
    exemplars: [{
        title: String,
        description: String,
        gradeLevel: String,
        annotations: String,
        file: {
            filename: String,
            path: String
        },
        uploadedAt: Date
    }],

    // Version Control
    version: {
        type: String,
        required: true
    },
    effectiveFrom: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'active', 'archived', 'under_review'],
        default: 'draft'
    },

    // Approval
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },

    // Related Standards
    relatedStandards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NationalStandard'
    }],

    // Metadata
    keywords: [String],
    curriculum: String,

    // Usage Statistics
    timesUsed: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
nationalStandardSchema.index({ standardCode: 1 });
nationalStandardSchema.index({ subject: 1, yearLevel: 1 });
nationalStandardSchema.index({ status: 1 });

module.exports = mongoose.model('NationalStandard', nationalStandardSchema);
