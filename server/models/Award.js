const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    awardType: {
        type: String,
        enum: [
            'Academic Excellence',
            'Subject Award',
            'Merit Certificate',
            'Scholarship',
            'Leadership Award',
            'Sports Award',
            'Arts Award',
            'Community Service',
            'Perfect Attendance',
            'Most Improved',
            'Dux Award',
            'Subject Dux',
            'Other'
        ],
        required: true
    },
    awardName: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    grade: String,
    subject: String,
    criteria: {
        minimumGPA: Number,
        minimumPercentage: Number,
        requiredGrades: [{
            subject: String,
            minimumGrade: String
        }],
        attendancePercentage: Number,
        behaviorRating: String,
        extracurriculars: [String],
        communityService: Boolean,
        leadershipRole: Boolean,
        customCriteria: [String]
    },
    meetsAllCriteria: {
        type: Boolean,
        default: false
    },
    qualificationDetails: {
        gpa: Number,
        overallPercentage: Number,
        subjectGrades: [{
            subject: String,
            grade: String,
            percentage: Number
        }],
        attendance: Number,
        conduct: String
    },
    awardedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    awardDate: {
        type: Date,
        default: Date.now
    },
    certificateNumber: String,
    value: {
        amount: Number,
        currency: String,
        description: String
    },
    isScholarship: {
        type: Boolean,
        default: false
    },
    scholarshipDetails: {
        provider: String,
        duration: String,
        coverage: String,
        renewalCriteria: [String],
        startDate: Date,
        endDate: Date
    },
    description: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Awarded', 'Declined', 'Revoked'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: Date,
    notes: String
}, {
    timestamps: true
});

// Method to check if student meets award criteria
awardSchema.methods.checkCriteria = async function () {
    const Grade = mongoose.model('Grade');
    const Enrollment = mongoose.model('Enrollment');

    const studentGrades = await Grade.find({
        student: this.student,
        academicYear: this.academicYear
    });

    let meetsAll = true;

    // Check minimum GPA
    if (this.criteria.minimumGPA) {
        const avgGPA = studentGrades.reduce((sum, g) => sum + (g.finalGrade?.gradePoint || 0), 0) / studentGrades.length;
        if (avgGPA < this.criteria.minimumGPA) meetsAll = false;
    }

    // Check minimum percentage
    if (this.criteria.minimumPercentage) {
        const avgPercentage = studentGrades.reduce((sum, g) => sum + (g.finalGrade?.percentage || 0), 0) / studentGrades.length;
        if (avgPercentage < this.criteria.minimumPercentage) meetsAll = false;
    }

    // Check required grades
    if (this.criteria.requiredGrades && this.criteria.requiredGrades.length > 0) {
        for (const req of this.criteria.requiredGrades) {
            const subjectGrade = studentGrades.find(g => g.subject.subjectName === req.subject);
            if (!subjectGrade || subjectGrade.finalGrade?.grade < req.minimumGrade) {
                meetsAll = false;
                break;
            }
        }
    }

    this.meetsAllCriteria = meetsAll;
    return meetsAll;
};

// Index for faster queries
awardSchema.index({ student: 1, academicYear: 1 });
awardSchema.index({ awardType: 1 });
awardSchema.index({ isScholarship: 1 });

module.exports = mongoose.model('Award', awardSchema);
