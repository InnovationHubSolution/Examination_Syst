const mongoose = require('mongoose');

const scholarshipCriteriaSchema = new mongoose.Schema({
    scholarshipName: {
        type: String,
        required: true,
        unique: true
    },
    provider: {
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['Government', 'Private', 'NGO', 'University', 'Corporate', 'International', 'Other']
        },
        country: String
    },
    scholarshipType: {
        type: String,
        enum: ['Merit-Based', 'Need-Based', 'Sports', 'Arts', 'STEM', 'Mixed', 'Other'],
        required: true
    },
    level: {
        type: String,
        enum: ['Secondary', 'Tertiary', 'Undergraduate', 'Postgraduate', 'Vocational', 'All Levels'],
        required: true
    },
    value: {
        amount: Number,
        currency: {
            type: String,
            default: 'VUV'
        },
        coverage: {
            type: String,
            enum: ['Full Tuition', 'Partial Tuition', 'Tuition + Living', 'Living Expenses Only', 'Books & Supplies', 'Other']
        },
        duration: String
    },
    academicCriteria: {
        minimumGPA: {
            type: Number,
            min: 0,
            max: 4.0
        },
        minimumPercentage: {
            type: Number,
            min: 0,
            max: 100
        },
        requiredGrades: [{
            subject: String,
            minimumGrade: {
                type: String,
                enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D']
            }
        }],
        minimumSubjectsPassed: Number,
        specificSubjectsRequired: [String]
    },
    eligibilityCriteria: {
        citizenship: [String], // e.g., ['Vanuatu', 'Pacific Islander']
        residency: String,
        ageRange: {
            minimum: Number,
            maximum: Number
        },
        gender: {
            type: String,
            enum: ['Any', 'Male', 'Female', 'Other']
        },
        region: [String], // Specific regions/provinces eligible
        schoolType: [String], // e.g., ['Government', 'Private']
    },
    financialCriteria: {
        maximumFamilyIncome: Number,
        requiresFinancialNeed: Boolean,
        considerHouseholdSize: Boolean
    },
    additionalRequirements: {
        leadershipExperience: Boolean,
        communityService: Boolean,
        minimumCommunityServiceHours: Number,
        extracurricularActivities: Boolean,
        specificTalents: [String], // e.g., ['Sports', 'Arts', 'Music']
        languageProficiency: [{
            language: String,
            level: String
        }],
        essayRequired: Boolean,
        interviewRequired: Boolean,
        recommendationLetters: Number
    },
    applicationPeriod: {
        openDate: Date,
        closeDate: Date,
        isOpen: {
            type: Boolean,
            default: true
        }
    },
    numberOfAwards: {
        total: Number,
        perYear: Number,
        available: Number
    },
    renewalCriteria: {
        renewable: Boolean,
        renewalPeriod: String,
        minimumGPAForRenewal: Number,
        otherConditions: [String]
    },
    targetFields: [String], // Specific fields of study
    targetInstitutions: [String], // Specific institutions
    selectionProcess: {
        automatic: Boolean, // Based on grades only
        competitive: Boolean, // Application and selection committee
        firstComeFirstServe: Boolean
    },
    contactInformation: {
        email: String,
        phone: String,
        website: String,
        address: String
    },
    description: String,
    terms: String,
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Method to check if a student is eligible
scholarshipCriteriaSchema.methods.checkEligibility = async function (studentId) {
    const User = mongoose.model('User');
    const Grade = mongoose.model('Grade');
    const Enrollment = mongoose.model('Enrollment');

    const student = await User.findById(studentId);
    if (!student) return { eligible: false, reasons: ['Student not found'] };

    const reasons = [];
    let eligible = true;

    // Check academic criteria
    if (this.academicCriteria.minimumGPA || this.academicCriteria.minimumPercentage) {
        const grades = await Grade.find({ student: studentId });

        if (this.academicCriteria.minimumGPA) {
            const avgGPA = grades.reduce((sum, g) => sum + (g.finalGrade?.gradePoint || 0), 0) / grades.length;
            if (avgGPA < this.academicCriteria.minimumGPA) {
                eligible = false;
                reasons.push(`Minimum GPA required: ${this.academicCriteria.minimumGPA}, Student GPA: ${avgGPA.toFixed(2)}`);
            }
        }

        if (this.academicCriteria.minimumPercentage) {
            const avgPercentage = grades.reduce((sum, g) => sum + (g.finalGrade?.percentage || 0), 0) / grades.length;
            if (avgPercentage < this.academicCriteria.minimumPercentage) {
                eligible = false;
                reasons.push(`Minimum percentage required: ${this.academicCriteria.minimumPercentage}%, Student average: ${avgPercentage.toFixed(2)}%`);
            }
        }
    }

    // Check age range
    if (this.eligibilityCriteria.ageRange) {
        // Calculate age (would need student's date of birth)
        // Implementation depends on User model having dateOfBirth field
    }

    return { eligible, reasons, scholarship: this };
};

// Index for faster queries
scholarshipCriteriaSchema.index({ scholarshipName: 1 });
scholarshipCriteriaSchema.index({ provider: 1 });
scholarshipCriteriaSchema.index({ isActive: 1 });
scholarshipCriteriaSchema.index({ 'applicationPeriod.isOpen': 1 });

module.exports = mongoose.model('ScholarshipCriteria', scholarshipCriteriaSchema);
