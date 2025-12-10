const express = require('express');
const router = express.Router();
const StudentGuide = require('../models/StudentGuide');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/student-guides
// @desc    Get all student guides
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { guideType, yearLevel, subject, audienceType } = req.query;

        let query = { status: 'active' };

        if (guideType) query.guideType = guideType;
        if (yearLevel) query.targetYearLevels = yearLevel;
        if (subject) query.targetSubjects = subject;
        if (audienceType) query.audienceType = audienceType;

        const guides = await StudentGuide.find(query)
            .select('-quizQuestions.correctAnswer') // Hide answers
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: guides.length,
            data: guides
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/student-guides/:id
// @desc    Get single student guide
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const guide = await StudentGuide.findById(req.params.id)
            .select('-quizQuestions.correctAnswer')
            .populate('createdBy', 'firstName lastName');

        if (!guide) {
            return res.status(404).json({
                success: false,
                error: 'Student guide not found'
            });
        }

        // Increment view count
        guide.viewCount += 1;
        await guide.save();

        res.json({
            success: true,
            data: guide
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/student-guides
// @desc    Create student guide
// @access  Private (Administrator only)
router.post('/', protect, upload.array('files', 10), async (req, res) => {
    try {
        const guideData = {
            ...req.body,
            createdBy: req.user.id,
            status: 'draft'
        };

        // Parse arrays and objects
        if (typeof guideData.targetYearLevels === 'string') {
            guideData.targetYearLevels = guideData.targetYearLevels.split(',').map(y => y.trim());
        }
        if (typeof guideData.faqs === 'string') {
            guideData.faqs = JSON.parse(guideData.faqs);
        }
        if (typeof guideData.examRules === 'string') {
            guideData.examRules = JSON.parse(guideData.examRules);
        }
        if (typeof guideData.prohibitedItems === 'string') {
            guideData.prohibitedItems = JSON.parse(guideData.prohibitedItems);
        }

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            guideData.files = req.files.map((file, index) => ({
                title: req.body[`fileTitle_${index}`] || file.originalname,
                filename: file.filename,
                path: file.path,
                fileType: file.mimetype,
                size: file.size,
                uploadedAt: Date.now()
            }));
        }

        const guide = await StudentGuide.create(guideData);

        res.status(201).json({
            success: true,
            data: guide
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/student-guides/:id/vote
// @desc    Vote if guide is helpful
// @access  Public
router.post('/:id/vote', async (req, res) => {
    try {
        const { helpful } = req.body;

        const guide = await StudentGuide.findById(req.params.id);

        if (!guide) {
            return res.status(404).json({
                success: false,
                error: 'Student guide not found'
            });
        }

        if (helpful) {
            guide.helpfulVotes += 1;
        } else {
            guide.notHelpfulVotes += 1;
        }

        await guide.save();

        res.json({
            success: true,
            message: 'Vote recorded successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/student-guides/type/exam-rules
// @desc    Get exam rules and prohibited items
// @access  Public
router.get('/type/exam-rules', async (req, res) => {
    try {
        const guide = await StudentGuide.findOne({
            guideType: 'Exam Rules',
            status: 'active'
        });

        if (!guide) {
            return res.status(404).json({
                success: false,
                error: 'Exam rules guide not found'
            });
        }

        res.json({
            success: true,
            data: {
                examRules: guide.examRules,
                prohibitedItems: guide.prohibitedItems
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/student-guides/type/appeals
// @desc    Get appeals and re-marking procedures
// @access  Public
router.get('/type/appeals', async (req, res) => {
    try {
        const guide = await StudentGuide.findOne({
            guideType: 'Appeals Procedure',
            status: 'active'
        });

        if (!guide) {
            return res.status(404).json({
                success: false,
                error: 'Appeals procedure guide not found'
            });
        }

        res.json({
            success: true,
            data: {
                appealsInfo: guide.appealsInfo,
                faqs: guide.faqs
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/student-guides/year/:yearLevel
// @desc    Get all guides for specific year level
// @access  Public
router.get('/year/:yearLevel', async (req, res) => {
    try {
        const guides = await StudentGuide.find({
            targetYearLevels: req.params.yearLevel,
            status: 'active'
        }).select('guideCode title guideType description');

        res.json({
            success: true,
            count: guides.length,
            data: guides
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
