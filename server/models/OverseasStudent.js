const mongoose = require('mongoose');

const OverseasStudentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Student Information
    personalDetails: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        dateOfBirth: Date,
        nationality: {
            type: String,
            default: 'Vanuatu'
        },
        passportNumber: String,
        vanuatuID: String
    },

    // Contact Information
    contactDetails: {
        email: {
            type: String,
            required: true
        },
        phone: String,
        alternatePhone: String,
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String,
            email: String
        }
    },

    // Current Study Information
    currentStudy: {
        yearLevel: {
            type: String,
            enum: ['Year 12', 'Year 13'],
            required: true
        },
        // Year 12 for NZ/Australia, Year 13 for others
        equivalentLevel: String,

        studyCountry: {
            type: String,
            enum: ['Fiji', 'New Caledonia', 'New Zealand', 'Australia', 'Other'],
            required: true
        },

        institutionName: {
            type: String,
            required: true
        },

        institutionAddress: {
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String
        },

        courseOfStudy: String,
        majorSubjects: [String],
        startDate: Date,
        expectedCompletionDate: Date
    },

    // Examination Information
    examinationInfo: {
        examinationBody: {
            type: String,
            required: true
        }, // e.g., NZQA, VCAA, SPBEA, etc.

        examinationType: {
            type: String,
            required: true
        }, // e.g., NCEA, VCE, SPFSC, Baccalauréat, etc.

        examYear: {
            type: String,
            required: true
        },

        subjectsEnrolled: [{
            subjectName: String,
            subjectCode: String,
            level: String,
            credits: Number,
            expectedExamDate: Date
        }],

        examSchedule: [{
            subjectName: String,
            examDate: Date,
            examTime: String,
            venue: String
        }],

        expectedResultsDate: Date
    },

    // Results (to be updated after exams)
    examinationResults: {
        overallResult: String,
        gradeAchieved: String,
        subjects: [{
            subjectName: String,
            grade: String,
            score: Number,
            credits: Number,
            remarks: String
        }],

        // Linked to specific assessment type
        linkedAssessment: {
            assessmentType: {
                type: String,
                enum: ['SPFSC', 'DAEU', 'Baccalaureat', 'NCEA', 'VCE', 'Other']
            },
            assessmentId: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'examinationResults.linkedAssessment.assessmentModel'
            },
            assessmentModel: {
                type: String,
                enum: ['SPFSCAssessment', 'DAEUAssessment', 'OverseasAssessment']
            }
        },

        resultsReceived: {
            type: Boolean,
            default: false
        },
        resultsReceivedDate: Date,
        certificateNumber: String
    },

    // Scholarship Application Status
    scholarshipApplication: {
        hasApplied: {
            type: Boolean,
            default: false
        },
        applicationDate: Date,
        applicationStatus: {
            type: String,
            enum: ['Not Started', 'Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Pending Results'],
            default: 'Not Started'
        },

        // Eligibility check
        eligibilityChecked: {
            type: Boolean,
            default: false
        },
        eligibilityCheckDate: Date,
        eligibilityStatus: {
            type: String,
            enum: ['Pending Results', 'Eligible', 'Not Eligible', 'Conditional'],
            default: 'Pending Results'
        },
        eligibilityNotes: String,

        // Scholarship details
        scholarshipType: String,
        scholarshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ScholarshipCriteria'
        },
        awardStatus: {
            type: String,
            enum: ['Pending', 'Awarded', 'Not Awarded', 'Waitlisted'],
            default: 'Pending'
        },
        awardAmount: Number,
        awardDate: Date
    },

    // Guardian/Sponsor Information (if studying overseas as minor)
    guardianInfo: {
        hasGuardian: {
            type: Boolean,
            default: false
        },
        guardianName: String,
        guardianRelationship: String,
        guardianAddress: String,
        guardianPhone: String,
        guardianEmail: String,

        // Financial sponsor
        sponsorName: String,
        sponsorRelationship: String,
        sponsorContact: String
    },

    // Document Submission
    documents: [{
        documentType: {
            type: String,
            enum: [
                'Information Form',
                'Transcript',
                'Student ID',
                'Passport Copy',
                'Enrollment Certificate',
                'Exam Registration',
                'Results Certificate',
                'Other'
            ],
            required: true
        },
        documentName: String,
        filePath: String,
        uploadDate: {
            type: Date,
            default: Date.now
        },
        verificationStatus: {
            type: String,
            enum: ['Pending', 'Verified', 'Rejected'],
            default: 'Pending'
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verificationDate: Date,
        verificationNotes: String
    }],

    // Form Submission Status
    submissionStatus: {
        formSubmitted: {
            type: Boolean,
            default: false
        },
        submissionDate: Date,

        completenessCheck: {
            isComplete: {
                type: Boolean,
                default: false
            },
            missingItems: [String],
            checkedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            checkDate: Date
        }
    },

    // Academic Year
    academicYear: {
        type: String,
        required: true
    },

    // Communication Log
    communications: [{
        date: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['Email', 'Phone', 'SMS', 'Letter', 'Meeting', 'Other']
        },
        subject: String,
        details: String,
        handledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],

    // Notes and Remarks
    remarks: String,
    internalNotes: String,

    // Status tracking
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Withdrawn', 'On Hold'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Index for efficient queries
OverseasStudentSchema.index({ 'contactDetails.email': 1 });
OverseasStudentSchema.index({ academicYear: 1, 'currentStudy.studyCountry': 1 });
OverseasStudentSchema.index({ 'scholarshipApplication.applicationStatus': 1 });

// Method to check if form is complete
OverseasStudentSchema.methods.checkCompleteness = function () {
    const missingItems = [];

    // Check required personal details
    if (!this.personalDetails.firstName) missingItems.push('First Name');
    if (!this.personalDetails.lastName) missingItems.push('Last Name');
    if (!this.personalDetails.dateOfBirth) missingItems.push('Date of Birth');

    // Check contact details
    if (!this.contactDetails.email) missingItems.push('Email');
    if (!this.contactDetails.phone) missingItems.push('Phone Number');

    // Check current study information
    if (!this.currentStudy.yearLevel) missingItems.push('Year Level');
    if (!this.currentStudy.studyCountry) missingItems.push('Study Country');
    if (!this.currentStudy.institutionName) missingItems.push('Institution Name');

    // Check examination information
    if (!this.examinationInfo.examinationBody) missingItems.push('Examination Body');
    if (!this.examinationInfo.examinationType) missingItems.push('Examination Type');
    if (!this.examinationInfo.examYear) missingItems.push('Examination Year');
    if (!this.examinationInfo.subjectsEnrolled || this.examinationInfo.subjectsEnrolled.length === 0) {
        missingItems.push('Subjects Enrolled');
    }

    // Check required documents
    const hasInfoForm = this.documents.some(d => d.documentType === 'Information Form');
    const hasEnrollment = this.documents.some(d => d.documentType === 'Enrollment Certificate');

    if (!hasInfoForm) missingItems.push('Information Form');
    if (!hasEnrollment) missingItems.push('Enrollment Certificate');

    this.submissionStatus.completenessCheck.isComplete = missingItems.length === 0;
    this.submissionStatus.completenessCheck.missingItems = missingItems;

    return {
        isComplete: missingItems.length === 0,
        missingItems
    };
};

// Method to assess scholarship eligibility based on results
OverseasStudentSchema.methods.assessEligibility = async function () {
    if (!this.examinationResults.resultsReceived) {
        this.scholarshipApplication.eligibilityStatus = 'Pending Results';
        return {
            eligible: false,
            reason: 'Results not yet received'
        };
    }

    // Check if linked assessment exists
    if (this.examinationResults.linkedAssessment.assessmentId) {
        const AssessmentModel = mongoose.model(this.examinationResults.linkedAssessment.assessmentModel);
        const assessment = await AssessmentModel.findById(this.examinationResults.linkedAssessment.assessmentId);

        if (assessment) {
            const eligibility = assessment.assessmentResults?.eligibleForScholarship ||
                assessment.assessmentResults?.meetsMinimumCriteria || false;

            this.scholarshipApplication.eligibilityStatus = eligibility ? 'Eligible' : 'Not Eligible';
            this.scholarshipApplication.eligibilityChecked = true;
            this.scholarshipApplication.eligibilityCheckDate = new Date();

            return {
                eligible: eligibility,
                assessmentDetails: assessment
            };
        }
    }

    // Default to conditional if no assessment linked yet
    this.scholarshipApplication.eligibilityStatus = 'Conditional';
    return {
        eligible: false,
        reason: 'Assessment pending review'
    };
};

// Static method to get students by country
OverseasStudentSchema.statics.getByCountry = function (country, academicYear) {
    const query = { 'currentStudy.studyCountry': country };
    if (academicYear) query.academicYear = academicYear;

    return this.find(query)
        .populate('student', 'firstName lastName email')
        .sort('personalDetails.lastName');
};

// Static method to get pending applications
OverseasStudentSchema.statics.getPendingApplications = function (academicYear) {
    const query = {
        'scholarshipApplication.hasApplied': true,
        'scholarshipApplication.applicationStatus': { $in: ['Submitted', 'Under Review'] }
    };
    if (academicYear) query.academicYear = academicYear;

    return this.find(query)
        .populate('student', 'firstName lastName email')
        .populate('scholarshipApplication.scholarshipId')
        .sort('scholarshipApplication.applicationDate');
};

module.exports = mongoose.model('OverseasStudent', OverseasStudentSchema);
