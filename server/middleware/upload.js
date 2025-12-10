const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'general';

        // Phase 1 routes
        if (req.baseUrl.includes('resources')) folder = 'resources';
        else if (req.baseUrl.includes('submissions')) folder = 'submissions';
        else if (req.baseUrl.includes('assessments')) folder = 'assessments';
        else if (req.baseUrl.includes('certificates')) folder = 'certificates';
        else if (req.baseUrl.includes('candidates')) folder = 'candidates';
        else if (req.baseUrl.includes('internal-assessments')) folder = 'internal-assessments';

        // Phase 2 routes
        else if (req.baseUrl.includes('policies')) folder = 'policies';
        else if (req.baseUrl.includes('training')) folder = 'training';
        else if (req.baseUrl.includes('student-guides')) folder = 'student-guides';
        else if (req.baseUrl.includes('security-incidents')) folder = 'security-incidents/evidence';
        else if (req.baseUrl.includes('support')) folder = 'support-tickets';
        else if (req.baseUrl.includes('research')) folder = 'research/reports';

        const targetDir = path.join(uploadDir, folder);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        cb(null, targetDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, uniqueSuffix + '-' + sanitizedFilename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        // Archives
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        // Text
        'text/plain',
        'text/csv',
        // Video (for training resources)
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, Word, Excel, PowerPoint, images, videos, and ZIP files are allowed.`), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
    },
    fileFilter: fileFilter
});

module.exports = upload;
