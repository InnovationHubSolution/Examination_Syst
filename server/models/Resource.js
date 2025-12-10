const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            'past_papers',
            'marking_schemes',
            'sample_tasks',
            'study_guides',
            'curriculum_documents',
            'syllabus',
            'teacher_resources',
            'revision_materials',
            'policies',
            'guidelines'
        ],
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        trim: true
    },
    academicYear: {
        type: String
    },
    fileType: {
        type: String,
        enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'other']
    },
    file: {
        filename: String,
        path: String,
        size: Number,
        mimetype: String
    },
    externalLink: {
        type: String
    },
    tags: [{
        type: String,
        trim: true
    }],
    accessLevel: {
        type: String,
        enum: ['public', 'students', 'teachers', 'administrators'],
        default: 'students'
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

resourceSchema.index({ category: 1, subject: 1, grade: 1 });
resourceSchema.index({ tags: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
