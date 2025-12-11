const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        subjectCode: {
            type: String,
            required: true
        },
        subjectName: {
            type: String,
            required: true
        }
    },
    academicYear: {
        type: String,
        required: true
    },
    term: {
        type: String,
        enum: ['Term 1', 'Term 2', 'Term 3', 'Term 4', 'Annual'],
        required: true
    },
    assessments: [{
        assessmentName: String,
        assessmentType: {
            type: String,
            enum: ['Internal Assessment', 'External Exam', 'Coursework', 'Project', 'Test', 'Assignment']
        },
        maxMarks: Number,
        obtainedMarks: Number,
        percentage: Number,
        weight: Number, // Weight in final grade calculation
        date: Date,
        remarks: String
    }],
    finalGrade: {
        marks: Number,
        percentage: Number,
        grade: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'E', 'F', 'I', 'W']
        },
        gradePoint: Number, // GPA calculation
        status: {
            type: String,
            enum: ['Pass', 'Fail', 'Incomplete', 'Withdrawn']
        }
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: String,
    submittedDate: Date,
    approvedDate: Date,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Calculate percentage and grade automatically
gradeSchema.methods.calculateFinalGrade = function () {
    if (this.assessments.length === 0) return;

    let totalWeightedMarks = 0;
    let totalWeight = 0;

    this.assessments.forEach(assessment => {
        if (assessment.obtainedMarks && assessment.maxMarks && assessment.weight) {
            const percentage = (assessment.obtainedMarks / assessment.maxMarks) * 100;
            totalWeightedMarks += percentage * (assessment.weight / 100);
            totalWeight += assessment.weight;
        }
    });

    const finalPercentage = totalWeight > 0 ? totalWeightedMarks : 0;

    // Assign grade based on percentage
    let grade, gradePoint, status;

    if (finalPercentage >= 90) {
        grade = 'A+';
        gradePoint = 4.0;
        status = 'Pass';
    } else if (finalPercentage >= 85) {
        grade = 'A';
        gradePoint = 4.0;
        status = 'Pass';
    } else if (finalPercentage >= 80) {
        grade = 'A-';
        gradePoint = 3.7;
        status = 'Pass';
    } else if (finalPercentage >= 75) {
        grade = 'B+';
        gradePoint = 3.3;
        status = 'Pass';
    } else if (finalPercentage >= 70) {
        grade = 'B';
        gradePoint = 3.0;
        status = 'Pass';
    } else if (finalPercentage >= 65) {
        grade = 'B-';
        gradePoint = 2.7;
        status = 'Pass';
    } else if (finalPercentage >= 60) {
        grade = 'C+';
        gradePoint = 2.3;
        status = 'Pass';
    } else if (finalPercentage >= 55) {
        grade = 'C';
        gradePoint = 2.0;
        status = 'Pass';
    } else if (finalPercentage >= 50) {
        grade = 'C-';
        gradePoint = 1.7;
        status = 'Pass';
    } else if (finalPercentage >= 40) {
        grade = 'D';
        gradePoint = 1.0;
        status = 'Fail';
    } else {
        grade = 'F';
        gradePoint = 0.0;
        status = 'Fail';
    }

    this.finalGrade = {
        percentage: finalPercentage,
        grade,
        gradePoint,
        status
    };
};

// Index for faster queries
gradeSchema.index({ student: 1, academicYear: 1 });
gradeSchema.index({ 'subject.subjectCode': 1 });

module.exports = mongoose.model('Grade', gradeSchema);
