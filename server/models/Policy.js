const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    // Policy Identification
    policyNumber: {
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

    // Policy Type
    policyType: {
        type: String,
        enum: [
            'Examination Regulation',
            'Malpractice Policy',
            'Paper Security',
            'Appeals Process',
            'Circular',
            'Memo',
            'Guideline',
            'Procedure',
            'Code of Conduct'
        ],
        required: true
    },

    // Content
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },

    // Target Audience
    targetAudience: [{
        type: String,
        enum: [
            'All',
            'Students',
            'Teachers',
            'Invigilators',
            'Exam Supervisors',
            'School Administrators',
            'Provincial Officers',
            'Parents/Guardians'
        ]
    }],

    // Document Files
    documents: [{
        title: String,
        filename: String,
        path: String,
        fileType: String,
        size: Number,
        uploadedAt: Date
    }],

    // Effective Dates
    effectiveFrom: {
        type: Date,
        required: true
    },
    effectiveTo: {
        type: Date
    },

    // Version Control
    version: {
        type: String,
        required: true,
        default: '1.0'
    },
    previousVersions: [{
        version: String,
        archivedAt: Date,
        archivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String
    }],

    // Approval & Authority
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    authorityReference: {
        type: String,
        trim: true
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'under_review', 'active', 'archived', 'superseded'],
        default: 'draft'
    },

    // Related Policies
    relatedPolicies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy'
    }],

    // Archive Information
    archiveYear: {
        type: String,
        trim: true
    },
    archiveCategory: {
        type: String,
        trim: true
    },

    // Acknowledgement Tracking
    acknowledgements: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        acknowledgedAt: Date,
        ipAddress: String
    }],

    // Important Flags
    isPinned: {
        type: Boolean,
        default: false
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    requiresAcknowledgement: {
        type: Boolean,
        default: false
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
policySchema.index({ policyNumber: 1 });
policySchema.index({ policyType: 1, status: 1 });
policySchema.index({ archiveYear: 1 });
policySchema.index({ targetAudience: 1 });

module.exports = mongoose.model('Policy', policySchema);
