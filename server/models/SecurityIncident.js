const mongoose = require('mongoose');

const securityIncidentSchema = new mongoose.Schema({
    // Incident Identification
    incidentNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Incident Type
    incidentType: {
        type: String,
        enum: [
            'Paper Security Breach',
            'Malpractice - Student',
            'Malpractice - Invigilator',
            'Malpractice - Teacher',
            'Transport Security',
            'Storage Security',
            'Unauthorized Access',
            'Impersonation',
            'Cheating',
            'Collusion',
            'Leaked Paper',
            'Technical Issue',
            'Other'
        ],
        required: true
    },

    // Incident Details
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },

    // When & Where
    incidentDate: {
        type: Date,
        required: true
    },
    incidentTime: {
        type: String,
        trim: true
    },
    location: {
        examCentre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ExamCentre'
        },
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School'
        },
        specificLocation: String
    },

    // Related Exam
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    subject: {
        type: String,
        trim: true
    },
    yearLevel: {
        type: String,
        enum: ['Y8', 'Y10', 'Y12', 'Y13']
    },

    // People Involved
    reportedBy: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String, // For anonymous reports
        role: String,
        contactInfo: String
    },
    involvedParties: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        role: {
            type: String,
            enum: ['Student', 'Teacher', 'Invigilator', 'Supervisor', 'Administrator', 'Other']
        },
        candidateId: String,
        allegation: String
    }],
    witnesses: [{
        name: String,
        role: String,
        contactInfo: String,
        statement: String
    }],

    // Evidence
    evidence: [{
        type: {
            type: String,
            enum: ['Photo', 'Video', 'Document', 'Written Statement', 'Physical Item', 'Other']
        },
        description: String,
        filename: String,
        path: String,
        uploadedAt: Date
    }],

    // Immediate Actions Taken
    immediateActions: [{
        action: String,
        takenBy: String,
        timestamp: Date
    }],

    // Investigation
    investigationStatus: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'closed'],
        default: 'pending'
    },
    assignedInvestigator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    investigationStartDate: {
        type: Date
    },
    investigationNotes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Findings & Conclusion
    findings: {
        type: String
    },
    conclusionDate: {
        type: Date
    },
    verified: {
        type: Boolean
    },

    // Actions & Consequences
    actionsTaken: [{
        action: String,
        targetPerson: String,
        actionDate: Date,
        authority: String
    }],
    penalties: [{
        personAffected: String,
        penaltyType: String,
        description: String,
        duration: String,
        effectiveDate: Date
    }],

    // Resolution
    resolutionStatus: {
        type: String,
        enum: ['unresolved', 'resolved', 'ongoing', 'escalated'],
        default: 'unresolved'
    },
    resolutionDate: {
        type: Date
    },
    resolutionSummary: {
        type: String
    },

    // Whistleblower Protection
    isAnonymous: {
        type: Boolean,
        default: false
    },
    protectionRequired: {
        type: Boolean,
        default: false
    },

    // Follow-up
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },
    followUpNotes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: Date
    }],

    // Confidentiality
    confidentialityLevel: {
        type: String,
        enum: ['public', 'restricted', 'confidential', 'highly_confidential'],
        default: 'restricted'
    },

    // Status
    status: {
        type: String,
        enum: ['reported', 'under_investigation', 'resolved', 'closed', 'dismissed'],
        default: 'reported'
    },

    // Notifications Sent
    notificationsSent: [{
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notificationType: String,
        sentAt: Date
    }],

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Auto-generate incident number
securityIncidentSchema.pre('save', async function (next) {
    if (!this.incidentNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('SecurityIncident').countDocuments();
        this.incidentNumber = `INC-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Indexes
securityIncidentSchema.index({ incidentNumber: 1 });
securityIncidentSchema.index({ incidentType: 1, status: 1 });
securityIncidentSchema.index({ severity: 1 });
securityIncidentSchema.index({ incidentDate: -1 });

module.exports = mongoose.model('SecurityIncident', securityIncidentSchema);
