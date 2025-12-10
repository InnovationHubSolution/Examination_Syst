const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/resources
// @desc    Get all resources
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { category, subject, grade, tags, search } = req.query;
        const query = { isActive: true };

        // Filter by access level
        if (req.user.role === 'student') {
            query.accessLevel = { $in: ['public', 'students'] };
        } else if (req.user.role === 'teacher') {
            query.accessLevel = { $in: ['public', 'students', 'teachers'] };
        }

        if (category) query.category = category;
        if (subject) query.subject = subject;
        if (grade) query.grade = grade;
        if (tags) query.tags = { $in: tags.split(',') };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const resources = await Resource.find(query)
            .populate('uploadedBy', 'firstName lastName')
            .sort({ isFeatured: -1, createdAt: -1 });

        res.json({
            success: true,
            count: resources.length,
            resources
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching resources',
            error: error.message
        });
    }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'firstName lastName email');

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Increment view count
        resource.viewCount += 1;
        await resource.save();

        res.json({
            success: true,
            resource
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching resource',
            error: error.message
        });
    }
});

// @route   POST /api/resources
// @desc    Upload new resource
// @access  Private/Teacher/Admin
router.post('/', protect, authorize('teacher', 'administrator', 'examiner'), upload.single('file'), async (req, res) => {
    try {
        const resourceData = {
            ...req.body,
            uploadedBy: req.user.id
        };

        // Handle file upload
        if (req.file) {
            resourceData.file = {
                filename: req.file.originalname,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype
            };

            // Set file type based on extension
            const ext = req.file.originalname.split('.').pop().toLowerCase();
            resourceData.fileType = ext;
        }

        // Parse tags if it's a string
        if (typeof req.body.tags === 'string') {
            resourceData.tags = req.body.tags.split(',').map(tag => tag.trim());
        }

        const resource = await Resource.create(resourceData);

        res.status(201).json({
            success: true,
            message: 'Resource uploaded successfully',
            resource
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading resource',
            error: error.message
        });
    }
});

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Private/Teacher/Admin
router.put('/:id', protect, authorize('teacher', 'administrator', 'examiner'), async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        res.json({
            success: true,
            message: 'Resource updated successfully',
            resource
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating resource',
            error: error.message
        });
    }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private/Admin
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        res.json({
            success: true,
            message: 'Resource deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting resource',
            error: error.message
        });
    }
});

// @route   GET /api/resources/download/:id
// @desc    Download resource
// @access  Private
router.get('/download/:id', protect, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Increment download count
        resource.downloadCount += 1;
        await resource.save();

        // Send file
        res.download(resource.file.path, resource.file.filename);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error downloading resource',
            error: error.message
        });
    }
});

module.exports = router;
