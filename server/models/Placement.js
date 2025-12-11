const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    currentGrade: {
        type: String,
        required: true
    },
    placementType: {
        type: String,
        enum: ['Secondary School', 'Tertiary Institution', 'Vocational Training', 'University', 'Employment'],
        required: true
    },
    institution: {
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['Government School', 'Private School', 'University', 'College', 'TVET', 'Other']
        },
        location: String,
        country: {
            type: String,
            default: 'Vanuatu'
        }
    },
    program: {
        name: String,
        field: String,
        duration: String,
        startDate: Date
    },
    qualificationRequirements: {
        minimumGPA: Number,
        requiredSubjects: [String],
        minimumGrades: [{
            subject: String,
            minimumGrade: String
        }],
        additionalRequirements: [String]
    },
    applicationStatus: {
        type: String,
        enum: ['Not Applied', 'Applied', 'Accepted', 'Conditional', 'Rejected', 'Waitlisted', 'Confirmed'],
        default: 'Not Applied'
    },
    scholarship: {
        awarded: {
            type: Boolean,
            default: false
        },
        scholarshipName: String,
        provider: String,
        amount: Number,
        currency: {
            type: String,
            default: 'VUV'
        },
        coverage: {
            type: String,
            enum: ['Full', 'Partial', 'Tuition Only', 'Living Expenses', 'Other']
        }
    },
    counselor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    documents: [{
        documentType: String,
        documentName: String,
        uploadDate: Date,
        status: {
            type: String,
            enum: ['Pending', 'Verified', 'Rejected']
        }
    }],
    applicationDate: Date,
    decisionDate: Date,
    confirmationDate: Date,
    notes: String
}, {
    timestamps: true
});

// Index for faster queries
placementSchema.index({ student: 1, academicYear: 1 });
placementSchema.index({ 'institution.name': 1 });

module.exports = mongoose.model('Placement', placementSchema);
