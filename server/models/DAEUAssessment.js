const mongoose = require('mongoose');

const DAEUAssessmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Assessment Type
    assessmentType: {
        type: String,
        enum: ['DAEU', 'Baccalaureat', 'BTS', 'DUT', 'CPGE'],
        required: true
    },

    // Student Track
    studentTrack: {
        type: String,
        enum: ['Science', 'Arts', 'Technical', 'General'],
        required: true
    },

    // All subjects enrolled
    subjectsEnrolled: [{
        subjectName: {
            type: String,
            required: true
        },
        subjectCode: String,
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 20
        },
        coefficient: {
            type: Number,
            default: 1
        },
        isMandatory: {
            type: Boolean,
            default: false
        }
    }],

    // Key subject scores
    frenchScore: {
        type: Number,
        min: 0,
        max: 20
    },

    mathematicsScore: {
        type: Number,
        min: 0,
        max: 20
    },

    // Overall performance
    overallPerformance: {
        totalPoints: Number,
        totalCoefficients: Number,
        averageScore: {
            type: Number,
            min: 0,
            max: 20
        },
        weightedAverage: {
            type: Number,
            min: 0,
            max: 20
        }
    },

    // Assessment Results
    assessmentResults: {
        meetsAverageRequirement: {
            type: Boolean,
            default: false
        }, // 12/20 or above
        meetsFrenchRequirement: {
            type: Boolean,
            default: false
        }, // 10 or above
        meetsMathRequirement: {
            type: Boolean,
            default: false
        }, // 10 or above (for Science students)
        meetsMinimumCriteria: {
            type: Boolean,
            default: false
        },
        isExceptionalCase: {
            type: Boolean,
            default: false
        }, // 14/20 average but French < 10
        eligibleForScholarship: {
            type: Boolean,
            default: false
        }
    },

    // BTS/DUT/CPGE specific (if applicable)
    advancedProgramme: {
        isPriority: {
            type: Boolean,
            default: false
        }, // BTS/DUT/CPGE priority
        programmeType: {
            type: String,
            enum: ['BTS', 'DUT', 'CPGE', 'N/A'],
            default: 'N/A'
        },
        acceptanceDetails: {
            institutionName: String,
            programmeName: String,
            acceptanceDate: Date,
            startDate: Date
        }
    },

    // Exception handling
    exceptionalCircumstances: {
        hasExceptionalCase: {
            type: Boolean,
            default: false
        },
        averageScore: Number, // Must be 14/20 or above
        frenchScore: Number, // Below 10
        justification: String,
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewDate: Date,
        nstbApproval: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'N/A'],
            default: 'N/A'
        },
        approvalNotes: String
    },

    // Academic Year and Institution
    academicYear: {
        type: String,
        required: true
    },

    institutionDetails: {
        name: String,
        country: {
            type: String,
            enum: ['Vanuatu', 'France', 'New Caledonia', 'Other'],
            required: true
        },
        location: String
    },

    // Certificate Information
    certificateDetails: {
        certificateNumber: String,
        dateIssued: Date,
        issuingAuthority: String,
        verificationStatus: {
            type: String,
            enum: ['Pending', 'Verified', 'Rejected'],
            default: 'Pending'
        }
    },

    // Assessment metadata
    assessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assessmentDate: {
        type: Date,
        default: Date.now
    },
    remarks: String,

    // Document uploads
    documents: [{
        documentType: {
            type: String,
            enum: ['Transcript', 'Certificate', 'ID', 'Other']
        },
        fileName: String,
        filePath: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Pre-save middleware to calculate scores and eligibility
DAEUAssessmentSchema.pre('save', function (next) {
    // Calculate overall performance
    if (this.subjectsEnrolled && this.subjectsEnrolled.length > 0) {
        let totalPoints = 0;
        let totalCoefficients = 0;
        let simpleTotal = 0;

        this.subjectsEnrolled.forEach(subject => {
            const coefficient = subject.coefficient || 1;
            totalPoints += subject.score * coefficient;
            totalCoefficients += coefficient;
            simpleTotal += subject.score;
        });

        this.overallPerformance = {
            totalPoints,
            totalCoefficients,
            averageScore: simpleTotal / this.subjectsEnrolled.length,
            weightedAverage: totalPoints / totalCoefficients
        };
    }

    // Extract French and Mathematics scores
    const frenchSubject = this.subjectsEnrolled.find(s =>
        s.subjectName.toLowerCase().includes('french') ||
        s.subjectName.toLowerCase().includes('français')
    );
    if (frenchSubject) {
        this.frenchScore = frenchSubject.score;
    }

    const mathSubject = this.subjectsEnrolled.find(s =>
        s.subjectName.toLowerCase().includes('math') ||
        s.subjectName.toLowerCase().includes('mathématiques')
    );
    if (mathSubject) {
        this.mathematicsScore = mathSubject.score;
    }

    // Assess eligibility criteria
    this.assessCriteria();

    next();
});

// Method to assess scholarship eligibility
DAEUAssessmentSchema.methods.assessCriteria = function () {
    const avgScore = this.overallPerformance?.weightedAverage || this.overallPerformance?.averageScore || 0;

    // Check average requirement (12/20)
    this.assessmentResults.meetsAverageRequirement = avgScore >= 12;

    // Check French requirement (10/20)
    this.assessmentResults.meetsFrenchRequirement = this.frenchScore >= 10;

    // Check Mathematics requirement (10/20) - only for Science students
    if (this.studentTrack === 'Science') {
        this.assessmentResults.meetsMathRequirement = this.mathematicsScore >= 10;
    } else {
        this.assessmentResults.meetsMathRequirement = true; // N/A for non-science
    }

    // Check for exceptional case (14/20 average but French < 10)
    if (avgScore >= 14 && this.frenchScore < 10) {
        this.assessmentResults.isExceptionalCase = true;
        this.exceptionalCircumstances.hasExceptionalCase = true;
        this.exceptionalCircumstances.averageScore = avgScore;
        this.exceptionalCircumstances.frenchScore = this.frenchScore;

        // Exceptional cases require NSTB discretion
        if (this.exceptionalCircumstances.nstbApproval === 'Approved') {
            this.assessmentResults.meetsMinimumCriteria = true;
        } else {
            this.assessmentResults.meetsMinimumCriteria = false;
        }
    } else {
        // Normal case: must meet all requirements
        this.assessmentResults.meetsMinimumCriteria =
            this.assessmentResults.meetsAverageRequirement &&
            this.assessmentResults.meetsFrenchRequirement &&
            this.assessmentResults.meetsMathRequirement;
    }

    // Check BTS/DUT/CPGE priority
    if (['BTS', 'DUT', 'CPGE'].includes(this.assessmentType)) {
        this.advancedProgramme.isPriority = this.assessmentResults.meetsMinimumCriteria;
        this.advancedProgramme.programmeType = this.assessmentType;
    }

    // Final eligibility determination
    this.assessmentResults.eligibleForScholarship =
        this.assessmentResults.meetsMinimumCriteria ||
        (this.assessmentResults.isExceptionalCase &&
            this.exceptionalCircumstances.nstbApproval === 'Approved');
};

// Method to calculate eligibility for specific scholarship
DAEUAssessmentSchema.methods.checkScholarshipEligibility = function () {
    return {
        eligible: this.assessmentResults.eligibleForScholarship,
        isPriority: this.advancedProgramme?.isPriority || false,
        averageScore: this.overallPerformance?.weightedAverage || this.overallPerformance?.averageScore,
        frenchScore: this.frenchScore,
        mathScore: this.mathematicsScore,
        meetsStandardCriteria: this.assessmentResults.meetsMinimumCriteria,
        isExceptionalCase: this.assessmentResults.isExceptionalCase,
        requiresNSTBApproval: this.assessmentResults.isExceptionalCase &&
            this.exceptionalCircumstances.nstbApproval === 'Pending'
    };
};

// Static method to find students by criteria
DAEUAssessmentSchema.statics.findByCriteria = function (criteria) {
    const query = {};

    if (criteria.minAverage) {
        query['overallPerformance.weightedAverage'] = { $gte: criteria.minAverage };
    }

    if (criteria.assessmentType) {
        query.assessmentType = criteria.assessmentType;
    }

    if (criteria.eligibleOnly) {
        query['assessmentResults.eligibleForScholarship'] = true;
    }

    if (criteria.priorityOnly) {
        query['advancedProgramme.isPriority'] = true;
    }

    if (criteria.academicYear) {
        query.academicYear = criteria.academicYear;
    }

    return this.find(query)
        .populate('student', 'firstName lastName email studentId')
        .populate('assessedBy', 'firstName lastName')
        .sort('-overallPerformance.weightedAverage');
};

// Static method to get priority students (BTS/DUT/CPGE)
DAEUAssessmentSchema.statics.getPriorityStudents = function (academicYear) {
    return this.find({
        'advancedProgramme.isPriority': true,
        'assessmentResults.eligibleForScholarship': true,
        ...(academicYear && { academicYear })
    })
        .populate('student', 'firstName lastName email studentId')
        .sort('-overallPerformance.weightedAverage');
};

// Static method to get exceptional cases requiring NSTB review
DAEUAssessmentSchema.statics.getExceptionalCases = function (status = 'Pending') {
    return this.find({
        'exceptionalCircumstances.hasExceptionalCase': true,
        'exceptionalCircumstances.nstbApproval': status
    })
        .populate('student', 'firstName lastName email studentId')
        .populate('exceptionalCircumstances.reviewedBy', 'firstName lastName')
        .sort('-exceptionalCircumstances.averageScore');
};

module.exports = mongoose.model('DAEUAssessment', DAEUAssessmentSchema);
