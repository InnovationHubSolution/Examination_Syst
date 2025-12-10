const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        required: true,
        trim: true
    },
    academicYear: {
        type: String,
        required: true
    },
    term: {
        type: String,
        required: true
    },
    scores: {
        obtained: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        },
        percentage: {
            type: Number,
            required: true
        }
    },
    letterGrade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
        required: true
    },
    gpa: {
        type: Number
    },
    rank: {
        classRank: Number,
        totalStudents: Number
    },
    remarks: {
        type: String
    },
    teacherComments: {
        type: String
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    enteredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'verified', 'published'],
        default: 'draft'
    }
}, {
    timestamps: true
});

resultSchema.index({ student: 1, academicYear: 1, term: 1 });
resultSchema.index({ exam: 1 });
resultSchema.index({ subject: 1, grade: 1 });

module.exports = mongoose.model('Result', resultSchema);
