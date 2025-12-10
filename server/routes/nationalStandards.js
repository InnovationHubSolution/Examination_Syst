const express = require('express');
const router = express.Router();
const NationalStandard = require('../models/NationalStandard');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/national-standards
// @desc    Get all national standards
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { subject, yearLevel, standardType, status } = req.query;

        let query = {};

        if (subject) query.subject = subject;
        if (yearLevel) query.yearLevel = yearLevel;
        if (standardType) query.standardType = standardType;
        if (status) query.status = status;
        else query.status = 'active'; // Default to active standards

        const standards = await NationalStandard.find(query)
            .populate('approvedBy', 'firstName lastName')
            .populate('relatedStandards', 'standardCode title')
            .sort({ subject: 1, yearLevel: 1, standardCode: 1 });

        res.json({
            success: true,
            count: standards.length,
            data: standards
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/national-standards/:id
// @desc    Get single national standard
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const standard = await NationalStandard.findById(req.params.id)
            .populate('approvedBy', 'firstName lastName email')
            .populate('relatedStandards', 'standardCode title subject yearLevel');

        if (!standard) {
            return res.status(404).json({
                success: false,
                error: 'National standard not found'
            });
        }

        // Increment usage counter
        standard.timesUsed += 1;
        standard.lastUsed = Date.now();
        await standard.save();

        res.json({
            success: true,
            data: standard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/national-standards
// @desc    Create new national standard
// @access  Private (Administrator only)
router.post('/', protect, authorize('administrator'), upload.fields([
    { name: 'teachingResources', maxCount: 10 },
    { name: 'exemplars', maxCount: 10 }
]), async (req, res) => {
    try {
        const standardData = {
            ...req.body,
            status: 'draft'
        };

        // Parse arrays if sent as strings
        if (typeof standardData.learningOutcomes === 'string') {
            standardData.learningOutcomes = JSON.parse(standardData.learningOutcomes);
        }
        if (typeof standardData.gradingDescriptors === 'string') {
            standardData.gradingDescriptors = JSON.parse(standardData.gradingDescriptors);
        }
        if (typeof standardData.assessmentCriteria === 'string') {
            standardData.assessmentCriteria = JSON.parse(standardData.assessmentCriteria);
        }
        if (typeof standardData.keywords === 'string') {
            standardData.keywords = standardData.keywords.split(',').map(k => k.trim());
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.teachingResources) {
                standardData.teachingResources = req.files.teachingResources.map((file, index) => ({
                    title: req.body[`resourceTitle_${index}`] || file.originalname,
                    description: req.body[`resourceDesc_${index}`] || '',
                    fileType: file.mimetype,
                    file: {
                        filename: file.filename,
                        path: file.path
                    }
                }));
            }

            if (req.files.exemplars) {
                standardData.exemplars = req.files.exemplars.map((file, index) => ({
                    title: req.body[`exemplarTitle_${index}`] || file.originalname,
                    description: req.body[`exemplarDesc_${index}`] || '',
                    gradeLevel: req.body[`exemplarGrade_${index}`] || '',
                    annotations: req.body[`exemplarAnnotations_${index}`] || '',
                    file: {
                        filename: file.filename,
                        path: file.path
                    },
                    uploadedAt: Date.now()
                }));
            }
        }

        const standard = await NationalStandard.create(standardData);

        res.status(201).json({
            success: true,
            data: standard
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/national-standards/:id
// @desc    Update national standard
// @access  Private (Administrator only)
router.put('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const standard = await NationalStandard.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!standard) {
            return res.status(404).json({
                success: false,
                error: 'National standard not found'
            });
        }

        res.json({
            success: true,
            data: standard
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/national-standards/:id/approve
// @desc    Approve national standard
// @access  Private (Administrator only)
router.put('/:id/approve', protect, authorize('administrator'), async (req, res) => {
    try {
        const standard = await NationalStandard.findByIdAndUpdate(
            req.params.id,
            {
                status: 'active',
                approvedBy: req.user.id,
                approvedAt: Date.now()
            },
            { new: true }
        );

        if (!standard) {
            return res.status(404).json({
                success: false,
                error: 'National standard not found'
            });
        }

        res.json({
            success: true,
            data: standard,
            message: 'National standard approved and activated'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/national-standards/subject/:subject
// @desc    Get standards by subject
// @access  Private
router.get('/subject/:subject', protect, async (req, res) => {
    try {
        const standards = await NationalStandard.find({
            subject: req.params.subject,
            status: 'active'
        }).sort({ yearLevel: 1, standardCode: 1 });

        res.json({
            success: true,
            count: standards.length,
            data: standards
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/national-standards/:id/exemplars
// @desc    Get exemplars for a standard
// @access  Private
router.get('/:id/exemplars', protect, async (req, res) => {
    try {
        const standard = await NationalStandard.findById(req.params.id).select('exemplars');

        if (!standard) {
            return res.status(404).json({
                success: false,
                error: 'National standard not found'
            });
        }

        res.json({
            success: true,
            count: standard.exemplars.length,
            data: standard.exemplars
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
