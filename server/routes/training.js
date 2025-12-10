const express = require('express');
const router = express.Router();
const TrainingResource = require('../models/TrainingResource');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/training
// @desc    Get all training resources
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { resourceType, targetRole, subject, yearLevel, status } = req.query;

        let query = {};

        if (resourceType) query.resourceType = resourceType;
        if (targetRole) query.targetRoles = targetRole;
        if (subject) query.subjects = subject;
        if (yearLevel) query.yearLevels = yearLevel;
        if (status) query.status = status;
        else query.status = 'active';

        const resources = await TrainingResource.find(query)
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/training/:id
// @desc    Get single training resource
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const resource = await TrainingResource.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email')
            .populate('prerequisites', 'resourceCode title')
            .populate('relatedResources', 'resourceCode title resourceType');

        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Training resource not found'
            });
        }

        // Increment view count
        resource.viewCount += 1;
        await resource.save();

        res.json({
            success: true,
            data: resource
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/training
// @desc    Create training resource
// @access  Private (Administrator, Teacher)
router.post('/', protect, authorize('administrator', 'teacher', 'examiner'), upload.array('files', 10), async (req, res) => {
    try {
        const resourceData = {
            ...req.body,
            createdBy: req.user.id,
            status: 'draft'
        };

        // Parse arrays
        if (typeof resourceData.targetRoles === 'string') {
            resourceData.targetRoles = resourceData.targetRoles.split(',').map(r => r.trim());
        }
        if (typeof resourceData.subjects === 'string') {
            resourceData.subjects = resourceData.subjects.split(',').map(s => s.trim());
        }
        if (typeof resourceData.yearLevels === 'string') {
            resourceData.yearLevels = resourceData.yearLevels.split(',').map(y => y.trim());
        }
        if (typeof resourceData.learningObjectives === 'string') {
            resourceData.learningObjectives = JSON.parse(resourceData.learningObjectives);
        }

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            resourceData.files = req.files.map((file, index) => ({
                title: req.body[`fileTitle_${index}`] || file.originalname,
                filename: file.filename,
                path: file.path,
                fileType: file.mimetype,
                size: file.size,
                uploadedAt: Date.now()
            }));
        }

        const resource = await TrainingResource.create(resourceData);

        res.status(201).json({
            success: true,
            data: resource
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/training/:id/complete
// @desc    Mark training as completed
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
    try {
        const { assessmentScore } = req.body;

        const resource = await TrainingResource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Training resource not found'
            });
        }

        // Check if already completed
        const existingCompletion = resource.completions.find(
            c => c.user.toString() === req.user.id
        );

        if (existingCompletion) {
            return res.status(400).json({
                success: false,
                error: 'Training already completed'
            });
        }

        // Check passing score if assessment required
        let certificateIssued = false;
        let certificateNumber = null;

        if (resource.hasAssessment && assessmentScore >= resource.passingScore) {
            certificateIssued = true;
            certificateNumber = `CERT-${resource.resourceCode}-${Date.now()}`;
        }

        resource.completions.push({
            user: req.user.id,
            completedAt: Date.now(),
            assessmentScore: assessmentScore || 0,
            certificateIssued,
            certificateNumber
        });

        // Update completion rate
        resource.completionRate = (resource.completions.length / resource.viewCount) * 100;

        await resource.save();

        res.json({
            success: true,
            message: 'Training completed successfully',
            certificateIssued,
            certificateNumber
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/training/:id/rate
// @desc    Rate training resource
// @access  Private
router.post('/:id/rate', protect, async (req, res) => {
    try {
        const { rating, feedback } = req.body;

        const resource = await TrainingResource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Training resource not found'
            });
        }

        // Remove existing rating if any
        resource.ratings = resource.ratings.filter(
            r => r.user.toString() !== req.user.id
        );

        // Add new rating
        resource.ratings.push({
            user: req.user.id,
            rating,
            feedback,
            createdAt: Date.now()
        });

        // Calculate average rating
        const totalRating = resource.ratings.reduce((sum, r) => sum + r.rating, 0);
        resource.averageRating = totalRating / resource.ratings.length;

        await resource.save();

        res.json({
            success: true,
            message: 'Rating submitted successfully',
            averageRating: resource.averageRating
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/training/:id/register-session
// @desc    Register for scheduled training session
// @access  Private
router.post('/:id/register-session', protect, async (req, res) => {
    try {
        const { sessionIndex } = req.body;

        const resource = await TrainingResource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Training resource not found'
            });
        }

        if (!resource.scheduledSessions || !resource.scheduledSessions[sessionIndex]) {
            return res.status(400).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const session = resource.scheduledSessions[sessionIndex];

        // Check capacity
        if (session.registeredParticipants.length >= session.maxParticipants) {
            return res.status(400).json({
                success: false,
                error: 'Session is full'
            });
        }

        // Check if already registered
        if (session.registeredParticipants.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                error: 'Already registered for this session'
            });
        }

        session.registeredParticipants.push(req.user.id);
        await resource.save();

        res.json({
            success: true,
            message: 'Successfully registered for training session'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/training/user/my-trainings
// @desc    Get user's completed and in-progress trainings
// @access  Private
router.get('/user/my-trainings', protect, async (req, res) => {
    try {
        const completed = await TrainingResource.find({
            'completions.user': req.user.id
        }).select('resourceCode title resourceType completions.$');

        const inProgress = await TrainingResource.find({
            viewCount: { $gt: 0 },
            'completions.user': { $ne: req.user.id }
        }).select('resourceCode title resourceType');

        res.json({
            success: true,
            data: {
                completed,
                inProgress
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/training/calendar
// @desc    Get professional development calendar
// @access  Private
router.get('/calendar', protect, async (req, res) => {
    try {
        const upcomingTrainings = await TrainingResource.find({
            scheduleType: { $in: ['scheduled', 'recurring'] },
            status: 'active',
            'scheduledSessions.sessionDate': { $gte: new Date() }
        }).populate('createdBy', 'firstName lastName');

        res.json({
            success: true,
            count: upcomingTrainings.length,
            data: upcomingTrainings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
