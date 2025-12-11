const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    school: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        required: true,
        enum: ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13']
    },
    academicYear: {
        type: String,
        required: true
    },
    subjects: [{
        subjectCode: {
            type: String,
            required: true
        },
        subjectName: {
            type: String,
            required: true
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        enrollmentDate: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'withdrawn', 'transferred'],
        default: 'active'
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    completionDate: Date
}, {
    timestamps: true
});

// Index for faster queries
enrollmentSchema.index({ student: 1, academicYear: 1 });
enrollmentSchema.index({ school: 1, grade: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
