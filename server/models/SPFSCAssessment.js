const mongoose = require('mongoose');

const spfscAssessmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    certificateNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    subjects: [{
        subjectName: {
            type: String,
            required: true
        },
        subjectCode: String,
        grade: {
            type: String,
            enum: ['Distinction', 'Merit', 'Pass', 'Fail'],
            required: true
        },
        marks: Number,
        percentage: Number,
        examBoard: {
            type: String,
            default: 'South Pacific Board of Educational Assessment (SPBEA)'
        },
        examDate: Date
    }],
    // Assessment for highest 4 subjects
    assessmentSummary: {
        highestFourSubjects: [{
            subjectName: String,
            grade: String,
            marks: Number,
            percentage: Number
        }],
        meetsMinimumCriteria: {
            type: Boolean,
            default: false
        },
        hasEnglish: {
            type: Boolean,
            default: false
        },
        englishGrade: String,
        meritCount: {
            type: Number,
            default: 0
        },
        distinctionCount: {
            type: Number,
            default: 0
        },
        criteriaDetails: {
            hasThreeMerits: Boolean,
            includesEnglishMerit: Boolean,
            eligibleForTertiary: Boolean,
            eligibleForScholarship: Boolean
        }
    },
    // Overall performance
    overallPerformance: {
        totalSubjects: Number,
        averagePercentage: Number,
        gradePointAverage: Number,
        rank: String, // e.g., "Top 10%", "Top 25%"
        schoolRank: Number,
        nationalRank: Number
    },
    // Certificate status
    certificateStatus: {
        type: String,
        enum: ['Pending', 'Issued', 'Verified', 'Revoked'],
        default: 'Pending'
    },
    issueDate: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verificationDate: Date,
    school: {
        type: String,
        required: true
    },
    // For scholarship and tertiary placement eligibility
    eligibility: {
        tertiaryEducation: {
            eligible: Boolean,
            institutions: [String],
            programs: [String]
        },
        scholarships: [{
            scholarshipId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ScholarshipCriteria'
            },
            eligible: Boolean,
            reason: String
        }],
        recommendations: [String]
    },
    notes: String,
    documents: [{
        documentType: {
            type: String,
            enum: ['Official Transcript', 'Certificate', 'Verification Letter', 'Other']
        },
        fileName: String,
        uploadDate: Date,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

// Method to assess if student meets SPFSC criteria
spfscAssessmentSchema.methods.assessCriteria = function () {
    // Sort subjects by marks/percentage to get highest 4
    const sortedSubjects = [...this.subjects].sort((a, b) => {
        const markA = a.percentage || a.marks || 0;
        const markB = b.percentage || b.marks || 0;
        return markB - markA;
    });

    // Get highest 4 subjects
    const highestFour = sortedSubjects.slice(0, 4);

    // Check for English subject
    const englishSubject = highestFour.find(s =>
        s.subjectName.toLowerCase().includes('english')
    );

    // Count merits and distinctions in top 4
    let meritCount = 0;
    let distinctionCount = 0;

    highestFour.forEach(subject => {
        if (subject.grade === 'Merit') meritCount++;
        if (subject.grade === 'Distinction') {
            distinctionCount++;
            meritCount++; // Distinction counts as Merit for criteria
        }
    });

    // Check if criteria is met:
    // Must have at least 3 Merits (or Distinctions) in top 4 subjects
    // Must include English with Merit or better
    const hasThreeMerits = meritCount >= 3;
    const hasEnglish = englishSubject !== undefined;
    const includesEnglishMerit = hasEnglish &&
        (englishSubject.grade === 'Merit' || englishSubject.grade === 'Distinction');

    const meetsMinimumCriteria = hasThreeMerits && includesEnglishMerit;

    // Update assessment summary
    this.assessmentSummary = {
        highestFourSubjects: highestFour.map(s => ({
            subjectName: s.subjectName,
            grade: s.grade,
            marks: s.marks,
            percentage: s.percentage
        })),
        meetsMinimumCriteria,
        hasEnglish,
        englishGrade: englishSubject?.grade || 'Not Found',
        meritCount,
        distinctionCount,
        criteriaDetails: {
            hasThreeMerits,
            includesEnglishMerit,
            eligibleForTertiary: meetsMinimumCriteria,
            eligibleForScholarship: meetsMinimumCriteria && distinctionCount >= 2
        }
    };

    // Calculate overall performance
    const totalSubjects = this.subjects.length;
    const totalPercentage = this.subjects.reduce((sum, s) => sum + (s.percentage || 0), 0);
    const averagePercentage = totalSubjects > 0 ? totalPercentage / totalSubjects : 0;

    this.overallPerformance = {
        totalSubjects,
        averagePercentage: Math.round(averagePercentage * 10) / 10,
        gradePointAverage: this.calculateGPA(),
        rank: this.determineRank(averagePercentage)
    };

    return meetsMinimumCriteria;
};

// Method to calculate GPA based on SPFSC grades
spfscAssessmentSchema.methods.calculateGPA = function () {
    const gradePoints = {
        'Distinction': 4.0,
        'Merit': 3.0,
        'Pass': 2.0,
        'Fail': 0.0
    };

    const totalPoints = this.subjects.reduce((sum, subject) => {
        return sum + (gradePoints[subject.grade] || 0);
    }, 0);

    return this.subjects.length > 0 ?
        Math.round((totalPoints / this.subjects.length) * 100) / 100 : 0;
};

// Method to determine rank based on average percentage
spfscAssessmentSchema.methods.determineRank = function (averagePercentage) {
    if (averagePercentage >= 85) return 'Top 5%';
    if (averagePercentage >= 75) return 'Top 10%';
    if (averagePercentage >= 65) return 'Top 25%';
    if (averagePercentage >= 50) return 'Top 50%';
    return 'Below 50%';
};

// Method to check scholarship eligibility
spfscAssessmentSchema.methods.checkScholarshipEligibility = async function () {
    const ScholarshipCriteria = mongoose.model('ScholarshipCriteria');

    // Get active scholarships
    const scholarships = await ScholarshipCriteria.find({
        isActive: true,
        level: { $in: ['Tertiary', 'Undergraduate', 'All Levels'] }
    });

    const eligibleScholarships = [];
    const gpa = this.calculateGPA();

    for (const scholarship of scholarships) {
        let eligible = true;
        let reason = '';

        // Check if meets SPFSC minimum criteria first
        if (!this.assessmentSummary.meetsMinimumCriteria) {
            eligible = false;
            reason = 'Does not meet SPFSC minimum criteria (3 Merits including English)';
        }
        // Check GPA requirement
        else if (scholarship.academicCriteria?.minimumGPA && gpa < scholarship.academicCriteria.minimumGPA) {
            eligible = false;
            reason = `GPA ${gpa} below required ${scholarship.academicCriteria.minimumGPA}`;
        }
        // Check percentage requirement
        else if (scholarship.academicCriteria?.minimumPercentage &&
            this.overallPerformance.averagePercentage < scholarship.academicCriteria.minimumPercentage) {
            eligible = false;
            reason = `Average ${this.overallPerformance.averagePercentage}% below required ${scholarship.academicCriteria.minimumPercentage}%`;
        }

        eligibleScholarships.push({
            scholarshipId: scholarship._id,
            eligible,
            reason: eligible ? 'Meets all criteria' : reason
        });
    }

    this.eligibility.scholarships = eligibleScholarships;
    return eligibleScholarships;
};

// Static method to get students by criteria
spfscAssessmentSchema.statics.findByCriteria = async function (criteria = {}) {
    const query = {};

    if (criteria.meetsMinimum) {
        query['assessmentSummary.meetsMinimumCriteria'] = true;
    }

    if (criteria.minMerits) {
        query['assessmentSummary.meritCount'] = { $gte: criteria.minMerits };
    }

    if (criteria.minDistinctions) {
        query['assessmentSummary.distinctionCount'] = { $gte: criteria.minDistinctions };
    }

    if (criteria.academicYear) {
        query.academicYear = criteria.academicYear;
    }

    if (criteria.school) {
        query.school = criteria.school;
    }

    return this.find(query)
        .populate('student', 'firstName lastName email studentId')
        .populate('verifiedBy', 'firstName lastName')
        .sort('-overallPerformance.averagePercentage');
};

// Index for faster queries
spfscAssessmentSchema.index({ student: 1, academicYear: 1 });
spfscAssessmentSchema.index({ 'assessmentSummary.meetsMinimumCriteria': 1 });
spfscAssessmentSchema.index({ certificateNumber: 1 });
spfscAssessmentSchema.index({ school: 1, academicYear: 1 });

module.exports = mongoose.model('SPFSCAssessment', spfscAssessmentSchema);
