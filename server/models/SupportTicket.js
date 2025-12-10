const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    // Ticket Identification
    ticketNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Ticket Details
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },

    // Category
    category: {
        type: String,
        enum: [
            'Technical Issue',
            'Account Access',
            'Registration Problem',
            'Result Inquiry',
            'Certificate Request',
            'Payment Issue',
            'Exam Schedule',
            'Resource Access',
            'Moderation Query',
            'General Inquiry',
            'Bug Report',
            'Feature Request',
            'Other'
        ],
        required: true
    },

    // Priority
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },

    // Submitted By
    submittedBy: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String, // For non-logged in users
        email: String,
        phone: String,
        role: String
    },

    // Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedAt: {
        type: Date
    },
    department: {
        type: String,
        enum: [
            'Technical Support',
            'Examination Unit',
            'Registration',
            'Results & Certificates',
            'Finance',
            'General Inquiries'
        ]
    },

    // Status
    status: {
        type: String,
        enum: [
            'new',
            'open',
            'in_progress',
            'pending_user',
            'pending_internal',
            'resolved',
            'closed',
            'cancelled'
        ],
        default: 'new'
    },

    // Conversation Thread
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        senderName: String,
        senderType: {
            type: String,
            enum: ['user', 'support', 'system']
        },
        message: String,
        attachments: [{
            filename: String,
            path: String,
            uploadedAt: Date
        }],
        isInternal: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Attachments
    attachments: [{
        filename: String,
        path: String,
        fileType: String,
        size: Number,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Resolution
    resolution: {
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: Date,
        resolutionNotes: String,
        resolutionType: {
            type: String,
            enum: ['Solved', 'Workaround Provided', 'Duplicate', 'Not an Issue', 'Referred', 'Other']
        }
    },

    // Satisfaction
    satisfactionRating: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: String,
        ratedAt: Date
    },

    // SLA (Service Level Agreement)
    sla: {
        responseDeadline: Date,
        resolutionDeadline: Date,
        isBreached: {
            type: Boolean,
            default: false
        },
        breachReason: String
    },

    // Related Items
    relatedTickets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupportTicket'
    }],
    relatedExam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    relatedCandidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
    },

    // Tracking
    firstResponseTime: {
        type: Number // in minutes
    },
    resolutionTime: {
        type: Number // in minutes
    },
    reopenCount: {
        type: Number,
        default: 0
    },

    // Tags
    tags: [{
        type: String
    }],

    // Notifications
    notifyUser: {
        type: Boolean,
        default: true
    },
    notificationsSent: [{
        type: String,
        sentAt: Date
    }],

    // Metadata
    source: {
        type: String,
        enum: ['Web Portal', 'Email', 'Phone', 'Live Chat', 'Walk-in'],
        default: 'Web Portal'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Auto-generate ticket number
supportTicketSchema.pre('save', async function (next) {
    if (!this.ticketNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('SupportTicket').countDocuments();
        this.ticketNumber = `TKT-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Calculate SLA deadlines
supportTicketSchema.pre('save', function (next) {
    if (this.isNew && !this.sla.responseDeadline) {
        const now = new Date();
        const responseHours = this.priority === 'urgent' ? 2 :
            this.priority === 'high' ? 4 :
                this.priority === 'normal' ? 24 : 48;

        const resolutionHours = this.priority === 'urgent' ? 4 :
            this.priority === 'high' ? 8 :
                this.priority === 'normal' ? 48 : 96;

        this.sla.responseDeadline = new Date(now.getTime() + responseHours * 60 * 60 * 1000);
        this.sla.resolutionDeadline = new Date(now.getTime() + resolutionHours * 60 * 60 * 1000);
    }
    next();
});

// Indexes
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ status: 1, priority: 1 });
supportTicketSchema.index({ 'submittedBy.user': 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ category: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
