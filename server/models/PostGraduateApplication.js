const mongoose = require('mongoose');

const PostGraduateApplicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Applicant Type
    applicantType: {
        type: String,
        enum: [
            'Current Workforce',
            'About to Complete Undergraduate',
            'Recently Completed Undergraduate'
        ],
        required: true
    },

    // Programme Level
    programmeLevel: {
        type: String,
        enum: [
            'Graduate Certificate',
            'Graduate Diploma',
            'Postgraduate Certificate',
            'Postgraduate Diploma',
            'Masters',
            'PhD'
        ],
        required: true
    },

    // Proposed Study Details
    proposedStudy: {
        institutionName: {
            type: String,
            required: true
        },
        institutionCountry: String,
        programmeName: {
            type: String,
            required: true
        },
        fieldOfStudy: String,
        startDate: Date,
        expectedDuration: String, // e.g., "2 years", "3 years"
        studyMode: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Distance/Online', 'Mixed Mode']
        }
    },

    // Institution Requirements
    institutionRequirements: {
        minimumGPA: {
            type: Number,
            required: true
        },
        applicantGPA: {
            type: Number,
            required: true
        },
        meetsGPARequirement: {
            type: Boolean,
            default: false
        },
        offerReceived: {
            type: Boolean,
            default: false
        },
        offerType: {
            type: String,
            enum: ['Conditional', 'Unconditional', 'Not Yet Received']
        },
        offerDate: Date,
        offerLetterUploaded: {
            type: Boolean,
            default: false
        },
        additionalRequirements: [String],
        meetsAllRequirements: {
            type: Boolean,
            default: false
        }
    },

    // Research Details (for Research Degrees)
    researchDetails: {
        isResearchDegree: {
            type: Boolean,
            default: false
        },
        researchTopic: String,
        researchOutline: {
            submitted: {
                type: Boolean,
                default: false
            },
            outlinePath: String,
            uploadDate: Date
        },
        alignsWithPriorityFramework: {
            type: Boolean,
            default: false
        },
        priorityArea: String, // Area from Scholarship Priority Framework
        contributionToVanuatu: String,

        // For PhD specifically
        phdSpecific: {
            status: {
                type: String,
                enum: ['Not Started', 'In Progress', 'N/A'],
                default: 'N/A'
            },
            // For new PhD applicants
            researchProposal: {
                submitted: {
                    type: Boolean,
                    default: false
                },
                proposalPath: String,
                uploadDate: Date
            },
            supervisorSupport: {
                received: {
                    type: Boolean,
                    default: false
                },
                supervisorName: String,
                supervisorEmail: String,
                supportLetterPath: String,
                uploadDate: Date
            },
            // For continuing PhD students
            progressReport: {
                submitted: {
                    type: Boolean,
                    default: false
                },
                reportPath: String,
                supervisorAgreed: {
                    type: Boolean,
                    default: false
                },
                uploadDate: Date
            }
        }
    },

    // Current Workforce Specific
    workforceDetails: {
        employer: String,
        department: String,
        position: String,
        yearsOfService: Number,
        employmentStatus: {
            type: String,
            enum: ['Permanent', 'Contract', 'Temporary', 'N/A']
        },

        // Commission Requirements
        commissionApproval: {
            required: {
                type: Boolean,
                default: false
            },
            commissionType: {
                type: String,
                enum: [
                    'Public Service Commission',
                    'Teaching Service Commission',
                    'Police Service Commission',
                    'Other Workforce Committee',
                    'Not Applicable'
                ]
            },
            approvalReceived: {
                type: Boolean,
                default: false
            },
            approvalDate: Date,
            approvalLetterPath: String,
            additionalRequirements: [String],
            meetsCommissionRequirements: {
                type: Boolean,
                default: false
            }
        }
    },

    // Recent Graduate Specific
    undergraduateDetails: {
        degreeName: String,
        institution: String,
        completionDate: Date,
        completionStatus: {
            type: String,
            enum: ['Completed', 'About to Complete', 'In Progress', 'N/A']
        },
        finalGPA: Number,

        // Award completion
        originalAwardTerm: {
            startDate: Date,
            endDate: Date,
            durationYears: Number
        },
        completedWithinTerm: {
            type: Boolean,
            default: false
        },

        // Attachments/Internships
        attachments: [{
            organizationName: String,
            organizationType: String,
            startDate: Date,
            endDate: Date,
            duration: String,
            relevantToStudy: {
                type: Boolean,
                default: false
            },
            description: String,
            certificatePath: String
        }],
        hasUndertakenAttachments: {
            type: Boolean,
            default: false
        },

        // Recommendation Letter
        recommendationLetter: {
            received: {
                type: Boolean,
                default: false
            },
            lecturerName: String,
            lecturerTitle: String,
            lecturerEmail: String,
            letterPath: String,
            uploadDate: Date
        }
    },

    // Eligibility Assessment
    eligibilityAssessment: {
        // Common requirements
        meetsInstitutionRequirements: {
            type: Boolean,
            default: false
        },
        researchAlignsPriorities: {
            type: Boolean,
            default: false
        },
        hasResearchOutline: {
            type: Boolean,
            default: false
        },

        // Workforce specific
        meetsWorkforceRequirements: {
            type: Boolean,
            default: false
        },
        hasCommissionApproval: {
            type: Boolean,
            default: false
        },

        // Recent graduate specific
        completedWithinTerm: {
            type: Boolean,
            default: false
        },
        hasRecommendationLetter: {
            type: Boolean,
            default: false
        },
        undertookAttachments: {
            type: Boolean,
            default: false
        },

        // PhD specific
        meetsPHDRequirements: {
            type: Boolean,
            default: false
        },
        hasResearchProposal: {
            type: Boolean,
            default: false
        },
        hasSupervisorSupport: {
            type: Boolean,
            default: false
        },
        hasProgressReport: {
            type: Boolean,
            default: false
        },

        // Overall
        overallEligible: {
            type: Boolean,
            default: false
        },
        eligibilityNotes: String,
        missingRequirements: [String]
    },

    // Application Status
    applicationStatus: {
        status: {
            type: String,
            enum: [
                'Draft',
                'Incomplete',
                'Complete',
                'Submitted',
                'Under Review',
                'Additional Information Required',
                'Approved',
                'Conditionally Approved',
                'Rejected',
                'Withdrawn'
            ],
            default: 'Draft'
        },
        submissionDate: Date,
        reviewDate: Date,
        decisionDate: Date,
        decisionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rejectionReason: String
    },

    // Scholarship Details (if approved)
    scholarshipAward: {
        scholarshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ScholarshipCriteria'
        },
        awarded: {
            type: Boolean,
            default: false
        },
        awardAmount: Number,
        awardCurrency: {
            type: String,
            default: 'VUV'
        },
        coverageDetails: {
            tuitionFees: Boolean,
            livingAllowance: Boolean,
            travelCosts: Boolean,
            bookAllowance: Boolean,
            researchCosts: Boolean,
            other: [String]
        },
        awardStartDate: Date,
        awardEndDate: Date,
        bondRequirements: String
    },

    // Documents
    documents: [{
        documentType: {
            type: String,
            enum: [
                'Academic Transcript',
                'Degree Certificate',
                'Offer Letter',
                'Research Outline',
                'Research Proposal',
                'Progress Report',
                'Supervisor Support Letter',
                'Recommendation Letter',
                'Commission Approval',
                'Attachment Certificate',
                'CV/Resume',
                'Other'
            ],
            required: true
        },
        fileName: String,
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
        verificationDate: Date
    }],

    // Academic Year
    academicYear: {
        type: String,
        required: true
    },

    // Assessment metadata
    assessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assessmentDate: Date,
    remarks: String,
    internalNotes: String
}, {
    timestamps: true
});

// Pre-save middleware to assess eligibility
PostGraduateApplicationSchema.pre('save', function (next) {
    this.assessEligibility();
    next();
});

// Method to assess eligibility based on applicant type
PostGraduateApplicationSchema.methods.assessEligibility = function () {
    const missing = [];

    // Common requirements for all applicants
    this.eligibilityAssessment.meetsInstitutionRequirements =
        this.institutionRequirements.meetsGPARequirement &&
        this.institutionRequirements.meetsAllRequirements;

    if (!this.eligibilityAssessment.meetsInstitutionRequirements) {
        missing.push('Institution minimum requirements not met');
    }

    // Research degree requirements
    if (this.researchDetails.isResearchDegree) {
        this.eligibilityAssessment.hasResearchOutline =
            this.researchDetails.researchOutline.submitted;
        this.eligibilityAssessment.researchAlignsPriorities =
            this.researchDetails.alignsWithPriorityFramework;

        if (!this.eligibilityAssessment.hasResearchOutline) {
            missing.push('Research outline (1 page) required');
        }
        if (!this.eligibilityAssessment.researchAlignsPriorities) {
            missing.push('Research must align with Scholarship Priority Framework');
        }
    }

    // PhD specific requirements
    if (this.programmeLevel === 'PhD') {
        if (this.researchDetails.phdSpecific.status === 'Not Started') {
            // New PhD applicant
            this.eligibilityAssessment.hasResearchProposal =
                this.researchDetails.phdSpecific.researchProposal.submitted;
            this.eligibilityAssessment.hasSupervisorSupport =
                this.researchDetails.phdSpecific.supervisorSupport.received;

            if (!this.eligibilityAssessment.hasResearchProposal) {
                missing.push('PhD research proposal required');
            }
            if (!this.eligibilityAssessment.hasSupervisorSupport) {
                missing.push('Supervisor support letter required');
            }

            this.eligibilityAssessment.meetsPHDRequirements =
                this.eligibilityAssessment.hasResearchProposal &&
                this.eligibilityAssessment.hasSupervisorSupport;
        } else if (this.researchDetails.phdSpecific.status === 'In Progress') {
            // Continuing PhD student
            this.eligibilityAssessment.hasProgressReport =
                this.researchDetails.phdSpecific.progressReport.submitted &&
                this.researchDetails.phdSpecific.progressReport.supervisorAgreed;
            this.eligibilityAssessment.hasSupervisorSupport =
                this.researchDetails.phdSpecific.supervisorSupport.received;

            if (!this.eligibilityAssessment.hasProgressReport) {
                missing.push('PhD progress report (supervisor-agreed) required');
            }
            if (!this.eligibilityAssessment.hasSupervisorSupport) {
                missing.push('Supervisor support letter required');
            }

            this.eligibilityAssessment.meetsPHDRequirements =
                this.eligibilityAssessment.hasProgressReport &&
                this.eligibilityAssessment.hasSupervisorSupport;
        }

        if (!this.eligibilityAssessment.meetsPHDRequirements) {
            missing.push('PhD-specific requirements not met');
        }
    }

    // Applicant type specific requirements
    if (this.applicantType === 'Current Workforce') {
        // Check commission approval if required
        if (this.workforceDetails.commissionApproval.required) {
            this.eligibilityAssessment.hasCommissionApproval =
                this.workforceDetails.commissionApproval.approvalReceived &&
                this.workforceDetails.commissionApproval.meetsCommissionRequirements;

            if (!this.eligibilityAssessment.hasCommissionApproval) {
                missing.push(`${this.workforceDetails.commissionApproval.commissionType} approval required`);
            }
        }

        this.eligibilityAssessment.meetsWorkforceRequirements =
            !this.workforceDetails.commissionApproval.required ||
            this.eligibilityAssessment.hasCommissionApproval;
    }

    if (this.applicantType === 'About to Complete Undergraduate' ||
        this.applicantType === 'Recently Completed Undergraduate') {

        // Check completed within term
        this.eligibilityAssessment.completedWithinTerm =
            this.undergraduateDetails.completedWithinTerm;

        if (!this.eligibilityAssessment.completedWithinTerm) {
            missing.push('Must have completed degree within original award term');
        }

        // Check attachments
        this.eligibilityAssessment.undertookAttachments =
            this.undergraduateDetails.hasUndertakenAttachments &&
            this.undergraduateDetails.attachments.length > 0;

        if (!this.eligibilityAssessment.undertookAttachments) {
            missing.push('Regular attachments with relevant organizations required');
        }

        // Check recommendation letter
        this.eligibilityAssessment.hasRecommendationLetter =
            this.undergraduateDetails.recommendationLetter.received;

        if (!this.eligibilityAssessment.hasRecommendationLetter) {
            missing.push('Recommendation letter from university lecturer required');
        }
    }

    // Overall eligibility determination
    let eligible = this.eligibilityAssessment.meetsInstitutionRequirements;

    if (this.researchDetails.isResearchDegree) {
        eligible = eligible &&
            this.eligibilityAssessment.hasResearchOutline &&
            this.eligibilityAssessment.researchAlignsPriorities;
    }

    if (this.programmeLevel === 'PhD') {
        eligible = eligible && this.eligibilityAssessment.meetsPHDRequirements;
    }

    if (this.applicantType === 'Current Workforce') {
        eligible = eligible && this.eligibilityAssessment.meetsWorkforceRequirements;
    }

    if (this.applicantType === 'About to Complete Undergraduate' ||
        this.applicantType === 'Recently Completed Undergraduate') {
        eligible = eligible &&
            this.eligibilityAssessment.completedWithinTerm &&
            this.eligibilityAssessment.hasRecommendationLetter &&
            this.eligibilityAssessment.undertookAttachments;
    }

    this.eligibilityAssessment.overallEligible = eligible;
    this.eligibilityAssessment.missingRequirements = missing;

    // Update application status based on eligibility
    if (this.applicationStatus.status === 'Draft' ||
        this.applicationStatus.status === 'Incomplete') {
        this.applicationStatus.status = eligible ? 'Complete' : 'Incomplete';
    }
};

// Method to check completeness for submission
PostGraduateApplicationSchema.methods.checkCompleteness = function () {
    const issues = [];

    // Check basic information
    if (!this.proposedStudy.institutionName) issues.push('Institution name required');
    if (!this.proposedStudy.programmeName) issues.push('Programme name required');

    // Check institution requirements
    if (!this.institutionRequirements.minimumGPA) issues.push('Institution minimum GPA required');
    if (!this.institutionRequirements.applicantGPA) issues.push('Your GPA required');

    // Check required documents
    const hasTranscript = this.documents.some(d => d.documentType === 'Academic Transcript');
    if (!hasTranscript) issues.push('Academic transcript required');

    if (this.researchDetails.isResearchDegree) {
        const hasOutline = this.documents.some(d => d.documentType === 'Research Outline');
        if (!hasOutline) issues.push('Research outline required');
    }

    return {
        isComplete: issues.length === 0,
        issues
    };
};

// Static method to get applications by type
PostGraduateApplicationSchema.statics.getByApplicantType = function (type, academicYear) {
    const query = { applicantType: type };
    if (academicYear) query.academicYear = academicYear;

    return this.find(query)
        .populate('student', 'firstName lastName email studentId')
        .populate('assessedBy', 'firstName lastName')
        .sort('-createdAt');
};

// Static method to get PhD applications
PostGraduateApplicationSchema.statics.getPHDApplications = function (academicYear) {
    const query = { programmeLevel: 'PhD' };
    if (academicYear) query.academicYear = academicYear;

    return this.find(query)
        .populate('student', 'firstName lastName email studentId')
        .sort('-createdAt');
};

// Static method to get eligible applications
PostGraduateApplicationSchema.statics.getEligibleApplications = function (academicYear) {
    const query = { 'eligibilityAssessment.overallEligible': true };
    if (academicYear) query.academicYear = academicYear;

    return this.find(query)
        .populate('student', 'firstName lastName email studentId')
        .sort('-institutionRequirements.applicantGPA');
};

module.exports = mongoose.model('PostGraduateApplication', PostGraduateApplicationSchema);
