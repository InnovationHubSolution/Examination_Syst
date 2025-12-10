const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    // Personal Information
    candidateId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },

    // Contact Information
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },

    // School Information
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    yearLevel: {
        type: String,
        enum: ['Y8', 'Y10', 'Y12', 'Y13'],
        required: true
    },

    // Examination Details
    examYear: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        enum: ['National Exam', 'Provincial Exam', 'School Exam'],
        default: 'National Exam'
    },
    subjects: [{
        subject: String,
        level: {
            type: String,
            enum: ['Standard', 'Advanced', 'Foundation']
        }
    }],

    // Exam Centre Assignment
    examCentre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamCentre'
    },

    // Special Needs
    specialNeeds: {
        hasSpecialNeeds: {
            type: Boolean,
            default: false
        },
        needsType: [{
            type: String,
            enum: [
                'Visual Impairment',
                'Hearing Impairment',
                'Physical Disability',
                'Learning Disability',
                'Medical Condition',
                'Other'
            ]
        }],
        accommodations: [{
            type: String
        }],
        supportingDocuments: [{
            filename: String,
            path: String,
            uploadedAt: Date
        }]
    },

    // Registration Status
    registrationStatus: {
        type: String,
        enum: ['draft', 'submitted', 'verified', 'approved', 'rejected'],
        default: 'draft'
    },
    registrationDate: {
        type: Date
    },
    verificationDate: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Photo and Documents
    candidatePhoto: {
        filename: String,
        path: String
    },
    identificationDocument: {
        filename: String,
        path: String
    },

    // Payment Information
    registrationFee: {
        amount: Number,
        currency: { type: String, default: 'VUV' },
        paid: { type: Boolean, default: false },
        paymentDate: Date,
        receiptNumber: String
    },

    // Notes and Comments
    notes: [{
        text: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Timestamps
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
candidateSchema.index({ candidateId: 1 });
candidateSchema.index({ school: 1, yearLevel: 1 });
candidateSchema.index({ examYear: 1, yearLevel: 1 });
candidateSchema.index({ registrationStatus: 1 });

// Auto-generate candidate ID
candidateSchema.pre('save', async function (next) {
    if (!this.candidateId) {
        const year = this.examYear;
        const count = await mongoose.model('Candidate').countDocuments({ examYear: year });
        this.candidateId = `VU-${year}-${this.yearLevel}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Candidate', candidateSchema);
