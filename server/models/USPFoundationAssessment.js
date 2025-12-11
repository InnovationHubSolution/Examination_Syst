const mongoose = require('mongoose');

const USPFoundationAssessmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Programme Type
    programmeType: {
        type: String,
        enum: [
            'General Foundation',
            'Health Science Foundation',
            'Medicine Foundation'
        ],
        required: true
    },

    // Intended Pathway
    intendedPathway: {
        type: String,
        enum: [
            'General Programmes',
            'Health Science (Non-Medicine)',
            'Bachelor of Medicine and Surgery'
        ],
        required: true
    },

    // Target Institution (if Health Science or Medicine)
    targetInstitution: {
        institutionName: String,
        location: String,
        country: {
            type: String,
            enum: ['Fiji', 'Vanuatu', 'Solomon Islands', 'Other']
        },
        programmeName: String,
        specificRequirements: String
    },

    // Foundation Courses Completed
    foundationCourses: [{
        courseCode: {
            type: String,
            required: true
        },
        courseName: {
            type: String,
            required: true
        },
        courseType: {
            type: String,
            enum: ['Science', 'Arts', 'English', 'Mathematics', 'Other'],
            required: true
        },
        credits: {
            type: Number,
            default: 1
        },
        grade: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
            required: true
        },
        gradePoints: {
            type: Number,
            min: 0,
            max: 4.5
        },
        semester: String,
        yearCompleted: String
    }],

    // English A (LLF11) - Critical requirement
    englishFoundationA: {
        courseCode: {
            type: String,
            default: 'LLF11'
        },
        courseName: {
            type: String,
            default: 'Foundation English A'
        },
        grade: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
        },
        gradePoints: Number,
        meetsBRequirement: {
            type: Boolean,
            default: false
        } // B or higher
    },

    // Overall Performance
    overallPerformance: {
        totalCourses: {
            type: Number,
            default: 0
        },
        totalScienceCourses: {
            type: Number,
            default: 0
        },
        totalCredits: Number,
        totalGradePoints: Number,
        gpa: {
            type: Number,
            min: 0,
            max: 4.5
        }
    },

    // Assessment Results by Pathway
    assessmentResults: {
        // A) General Foundation (minimum 8 courses, GPA 2.5+, English B+)
        generalPathway: {
            meetsMinimumCourses: {
                type: Boolean,
                default: false
            }, // 8+ courses
            meetsGPARequirement: {
                type: Boolean,
                default: false
            }, // GPA >= 2.5
            meetsEnglishRequirement: {
                type: Boolean,
                default: false
            }, // English B or higher
            eligible: {
                type: Boolean,
                default: false
            }
        },

        // B) Health Science (minimum 10 Science courses, GPA 2.5+, English B+)
        healthSciencePathway: {
            meetsMinimumScienceCourses: {
                type: Boolean,
                default: false
            }, // 10+ Science courses
            meetsGPARequirement: {
                type: Boolean,
                default: false
            }, // GPA >= 2.5
            meetsEnglishRequirement: {
                type: Boolean,
                default: false
            }, // English B or higher
            meetsProgrammeRequirements: {
                type: Boolean,
                default: false
            }, // Specific programme GPA if higher
            programmeSpecificGPA: Number,
            eligible: {
                type: Boolean,
                default: false
            }
        },

        // C) Medicine (minimum 10 Science courses, GPA 4.0+, English B+)
        medicinePathway: {
            meetsMinimumScienceCourses: {
                type: Boolean,
                default: false
            }, // 10+ Science courses
            meetsGPARequirement: {
                type: Boolean,
                default: false
            }, // GPA >= 4.0
            meetsEnglishRequirement: {
                type: Boolean,
                default: false
            }, // English B or higher
            eligible: {
                type: Boolean,
                default: false
            }
        },

        // Overall eligibility
        overallEligible: {
            type: Boolean,
            default: false
        },
        eligiblePathways: [String],
        recommendedPathway: String
    },

    // Programme-Specific Requirements (for Health Science)
    programmeSpecificRequirements: {
        hasProgrammeSpecificGPA: {
            type: Boolean,
            default: false
        },
        requiredGPA: Number,
        requiredCourses: [String],
        additionalRequirements: String,
        meetsAllRequirements: {
            type: Boolean,
            default: false
        }
    },

    // Academic Year and Institution
    academicYear: {
        type: String,
        required: true
    },

    completionDetails: {
        completionDate: Date,
        certificateNumber: String,
        issuingInstitution: {
            type: String,
            default: 'University of the South Pacific'
        },
        campus: String
    },

    // Scholarship Application
    scholarshipApplication: {
        hasApplied: {
            type: Boolean,
            default: false
        },
        applicationDate: Date,
        targetProgramme: String,
        targetInstitution: String,
        applicationStatus: {
            type: String,
            enum: ['Not Started', 'Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
            default: 'Not Started'
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
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verificationDate: Date,
    remarks: String,

    // Documents
    documents: [{
        documentType: {
            type: String,
            enum: ['Transcript', 'Certificate', 'Course Outline', 'Other']
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

// Grade to GPA conversion
const gradeToGPA = {
    'A+': 4.5,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D': 1.0,
    'F': 0.0
};

// Pre-save middleware to calculate GPA and assess eligibility
USPFoundationAssessmentSchema.pre('save', function (next) {
    // Convert grades to grade points
    this.foundationCourses.forEach(course => {
        course.gradePoints = gradeToGPA[course.grade] || 0;
    });

    // Calculate English A grade points and check B requirement
    if (this.englishFoundationA.grade) {
        this.englishFoundationA.gradePoints = gradeToGPA[this.englishFoundationA.grade] || 0;
        this.englishFoundationA.meetsBRequirement =
            this.englishFoundationA.gradePoints >= 3.0; // B or higher
    }

    // Calculate overall performance
    const scienceCourses = this.foundationCourses.filter(c => c.courseType === 'Science');
    let totalGradePoints = 0;
    let totalCredits = 0;

    this.foundationCourses.forEach(course => {
        totalGradePoints += course.gradePoints * course.credits;
        totalCredits += course.credits;
    });

    this.overallPerformance = {
        totalCourses: this.foundationCourses.length,
        totalScienceCourses: scienceCourses.length,
        totalCredits,
        totalGradePoints,
        gpa: totalCredits > 0 ? totalGradePoints / totalCredits : 0
    };

    // Assess eligibility for all pathways
    this.assessEligibility();

    next();
});

// Method to assess eligibility across all pathways
USPFoundationAssessmentSchema.methods.assessEligibility = function () {
    const gpa = this.overallPerformance.gpa;
    const totalCourses = this.overallPerformance.totalCourses;
    const scienceCourses = this.overallPerformance.totalScienceCourses;
    const englishMeetsB = this.englishFoundationA.meetsBRequirement;

    const eligiblePathways = [];

    // A) General Foundation Pathway
    this.assessmentResults.generalPathway.meetsMinimumCourses = totalCourses >= 8;
    this.assessmentResults.generalPathway.meetsGPARequirement = gpa >= 2.5;
    this.assessmentResults.generalPathway.meetsEnglishRequirement = englishMeetsB;
    this.assessmentResults.generalPathway.eligible =
        this.assessmentResults.generalPathway.meetsMinimumCourses &&
        this.assessmentResults.generalPathway.meetsGPARequirement &&
        this.assessmentResults.generalPathway.meetsEnglishRequirement;

    if (this.assessmentResults.generalPathway.eligible) {
        eligiblePathways.push('General Programmes');
    }

    // B) Health Science Pathway (Non-Medicine)
    this.assessmentResults.healthSciencePathway.meetsMinimumScienceCourses = scienceCourses >= 10;
    this.assessmentResults.healthSciencePathway.meetsGPARequirement = gpa >= 2.5;
    this.assessmentResults.healthSciencePathway.meetsEnglishRequirement = englishMeetsB;

    // Check programme-specific requirements if applicable
    if (this.programmeSpecificRequirements.hasProgrammeSpecificGPA) {
        const requiredGPA = this.programmeSpecificRequirements.requiredGPA || 2.5;
        this.assessmentResults.healthSciencePathway.meetsProgrammeRequirements = gpa >= requiredGPA;
        this.assessmentResults.healthSciencePathway.programmeSpecificGPA = requiredGPA;
    } else {
        this.assessmentResults.healthSciencePathway.meetsProgrammeRequirements = true;
    }

    this.assessmentResults.healthSciencePathway.eligible =
        this.assessmentResults.healthSciencePathway.meetsMinimumScienceCourses &&
        this.assessmentResults.healthSciencePathway.meetsGPARequirement &&
        this.assessmentResults.healthSciencePathway.meetsEnglishRequirement &&
        this.assessmentResults.healthSciencePathway.meetsProgrammeRequirements;

    if (this.assessmentResults.healthSciencePathway.eligible) {
        eligiblePathways.push('Health Science (Non-Medicine)');
    }

    // C) Medicine Pathway (High GPA requirement: 4.0)
    this.assessmentResults.medicinePathway.meetsMinimumScienceCourses = scienceCourses >= 10;
    this.assessmentResults.medicinePathway.meetsGPARequirement = gpa >= 4.0;
    this.assessmentResults.medicinePathway.meetsEnglishRequirement = englishMeetsB;
    this.assessmentResults.medicinePathway.eligible =
        this.assessmentResults.medicinePathway.meetsMinimumScienceCourses &&
        this.assessmentResults.medicinePathway.meetsGPARequirement &&
        this.assessmentResults.medicinePathway.meetsEnglishRequirement;

    if (this.assessmentResults.medicinePathway.eligible) {
        eligiblePathways.push('Bachelor of Medicine and Surgery');
    }

    // Set overall eligibility
    this.assessmentResults.overallEligible = eligiblePathways.length > 0;
    this.assessmentResults.eligiblePathways = eligiblePathways;

    // Recommend pathway based on GPA
    if (this.assessmentResults.medicinePathway.eligible) {
        this.assessmentResults.recommendedPathway = 'Bachelor of Medicine and Surgery';
    } else if (this.assessmentResults.healthSciencePathway.eligible) {
        this.assessmentResults.recommendedPathway = 'Health Science (Non-Medicine)';
    } else if (this.assessmentResults.generalPathway.eligible) {
        this.assessmentResults.recommendedPathway = 'General Programmes';
    } else {
        this.assessmentResults.recommendedPathway = 'Not Eligible - Requirements Not Met';
    }
};

// Method to check eligibility for specific pathway
USPFoundationAssessmentSchema.methods.checkPathwayEligibility = function (pathway) {
    switch (pathway) {
        case 'General Programmes':
            return {
                eligible: this.assessmentResults.generalPathway.eligible,
                requirements: {
                    minimumCourses: 8,
                    currentCourses: this.overallPerformance.totalCourses,
                    meetsMinimumCourses: this.assessmentResults.generalPathway.meetsMinimumCourses,
                    requiredGPA: 2.5,
                    currentGPA: this.overallPerformance.gpa,
                    meetsGPA: this.assessmentResults.generalPathway.meetsGPARequirement,
                    englishGrade: this.englishFoundationA.grade,
                    meetsEnglish: this.assessmentResults.generalPathway.meetsEnglishRequirement
                }
            };

        case 'Health Science (Non-Medicine)':
            return {
                eligible: this.assessmentResults.healthSciencePathway.eligible,
                requirements: {
                    minimumScienceCourses: 10,
                    currentScienceCourses: this.overallPerformance.totalScienceCourses,
                    meetsScienceCourses: this.assessmentResults.healthSciencePathway.meetsMinimumScienceCourses,
                    requiredGPA: this.programmeSpecificRequirements.requiredGPA || 2.5,
                    currentGPA: this.overallPerformance.gpa,
                    meetsGPA: this.assessmentResults.healthSciencePathway.meetsGPARequirement,
                    englishGrade: this.englishFoundationA.grade,
                    meetsEnglish: this.assessmentResults.healthSciencePathway.meetsEnglishRequirement,
                    programmeSpecific: this.assessmentResults.healthSciencePathway.meetsProgrammeRequirements
                }
            };

        case 'Bachelor of Medicine and Surgery':
            return {
                eligible: this.assessmentResults.medicinePathway.eligible,
                requirements: {
                    minimumScienceCourses: 10,
                    currentScienceCourses: this.overallPerformance.totalScienceCourses,
                    meetsScienceCourses: this.assessmentResults.medicinePathway.meetsMinimumScienceCourses,
                    requiredGPA: 4.0,
                    currentGPA: this.overallPerformance.gpa,
                    meetsGPA: this.assessmentResults.medicinePathway.meetsGPARequirement,
                    englishGrade: this.englishFoundationA.grade,
                    meetsEnglish: this.assessmentResults.medicinePathway.meetsEnglishRequirement
                }
            };

        default:
            return { eligible: false, reason: 'Invalid pathway specified' };
    }
};

// Static method to find students by criteria
USPFoundationAssessmentSchema.statics.findByCriteria = function (criteria) {
    const query = {};

    if (criteria.minGPA) {
        query['overallPerformance.gpa'] = { $gte: criteria.minGPA };
    }

    if (criteria.pathway) {
        query[`assessmentResults.${criteria.pathway}.eligible`] = true;
    }

    if (criteria.academicYear) {
        query.academicYear = criteria.academicYear;
    }

    if (criteria.eligibleOnly) {
        query['assessmentResults.overallEligible'] = true;
    }

    return this.find(query)
        .populate('student', 'firstName lastName email studentId')
        .populate('assessedBy', 'firstName lastName')
        .sort('-overallPerformance.gpa');
};

// Static method to get medicine-eligible students
USPFoundationAssessmentSchema.statics.getMedicineEligibleStudents = function (academicYear) {
    return this.find({
        'assessmentResults.medicinePathway.eligible': true,
        ...(academicYear && { academicYear })
    })
        .populate('student', 'firstName lastName email studentId')
        .sort('-overallPerformance.gpa');
};

// Static method to get health science eligible students
USPFoundationAssessmentSchema.statics.getHealthScienceEligibleStudents = function (academicYear) {
    return this.find({
        'assessmentResults.healthSciencePathway.eligible': true,
        ...(academicYear && { academicYear })
    })
        .populate('student', 'firstName lastName email studentId')
        .sort('-overallPerformance.gpa');
};

module.exports = mongoose.model('USPFoundationAssessment', USPFoundationAssessmentSchema);
