const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ScholarshipCriteria = require('../models/ScholarshipCriteria');

// @route   GET /api/scholarships
// @desc    Get all scholarship criteria
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            level,
            scholarshipType,
            provider,
            isOpen,
            isActive
        } = req.query;

        const query = {};

        if (level) query.level = level;
        if (scholarshipType) query.scholarshipType = scholarshipType;
        if (provider) query['provider.name'] = new RegExp(provider, 'i');
        if (isOpen !== undefined) query['applicationPeriod.isOpen'] = isOpen === 'true';
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const scholarships = await ScholarshipCriteria.find(query)
            .sort('-createdAt');

        res.json({
            success: true,
            count: scholarships.length,
            data: scholarships
        });
    } catch (error) {
        console.error('Error fetching scholarships:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/scholarships/:id
// @desc    Get single scholarship criteria
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const scholarship = await ScholarshipCriteria.findById(req.params.id)
            .populate('createdBy', 'firstName lastName')
            .populate('lastUpdatedBy', 'firstName lastName');

        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }

        res.json({
            success: true,
            data: scholarship
        });
    } catch (error) {
        console.error('Error fetching scholarship:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/scholarships
// @desc    Create new scholarship criteria
// @access  Private (Admin only)
router.post('/', protect, authorize('administrator'), async (req, res) => {
    try {
        const scholarship = await ScholarshipCriteria.create({
            ...req.body,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: scholarship
        });
    } catch (error) {
        console.error('Error creating scholarship:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating scholarship',
            error: error.message
        });
    }
});

// @route   PUT /api/scholarships/:id
// @desc    Update scholarship criteria
// @access  Private (Admin only)
router.put('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const scholarship = await ScholarshipCriteria.findById(req.params.id);

        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }

        Object.assign(scholarship, req.body);
        scholarship.lastUpdatedBy = req.user._id;
        await scholarship.save();

        res.json({
            success: true,
            data: scholarship
        });
    } catch (error) {
        console.error('Error updating scholarship:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating scholarship',
            error: error.message
        });
    }
});

// @route   DELETE /api/scholarships/:id
// @desc    Delete scholarship criteria
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const scholarship = await ScholarshipCriteria.findById(req.params.id);

        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }

        await scholarship.deleteOne();

        res.json({
            success: true,
            message: 'Scholarship deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting scholarship:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/scholarships/:id/check-eligibility
// @desc    Check if student is eligible for scholarship
// @access  Private
router.post('/:id/check-eligibility', protect, async (req, res) => {
    try {
        const scholarship = await ScholarshipCriteria.findById(req.params.id);

        if (!scholarship) {
            return res.status(404).json({
                success: false,
                message: 'Scholarship not found'
            });
        }

        const { studentId } = req.body;
        const eligibilityCheck = await scholarship.checkEligibility(studentId || req.user._id);

        res.json({
            success: true,
            ...eligibilityCheck
        });
    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/scholarships/student/:studentId/eligible
// @desc    Get all scholarships student is eligible for
// @access  Private
router.get('/student/:studentId/eligible', protect, async (req, res) => {
    try {
        const scholarships = await ScholarshipCriteria.find({
            isActive: true,
            'applicationPeriod.isOpen': true
        });

        const eligibleScholarships = [];

        for (const scholarship of scholarships) {
            const eligibility = await scholarship.checkEligibility(req.params.studentId);
            if (eligibility.eligible) {
                eligibleScholarships.push({
                    scholarship,
                    eligibilityDetails: eligibility
                });
            }
        }

        res.json({
            success: true,
            count: eligibleScholarships.length,
            data: eligibleScholarships
        });
    } catch (error) {
        console.error('Error finding eligible scholarships:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/scholarships/types
// @desc    Get scholarship types and statistics
// @access  Public
router.get('/stats/types', async (req, res) => {
    try {
        const types = await ScholarshipCriteria.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$scholarshipType',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$value.amount' },
                    providers: { $addToSet: '$provider.name' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        console.error('Error fetching scholarship stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
