const express = require('express');
const router = express.Router();
const School = require('../models/School');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/schools
// @desc    Get all schools with filters
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { province, schoolType, isActive, isExamCentre } = req.query;

        let query = {};

        if (province) query.province = province;
        if (schoolType) query.schoolType = schoolType;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (isExamCentre !== undefined) query.isExamCentre = isExamCentre === 'true';

        const schools = await School.find(query).sort({ schoolName: 1 });

        res.json({
            success: true,
            count: schools.length,
            data: schools
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/schools/:id
// @desc    Get single school
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const school = await School.findById(req.params.id);

        if (!school) {
            return res.status(404).json({
                success: false,
                error: 'School not found'
            });
        }

        res.json({
            success: true,
            data: school
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/schools
// @desc    Create new school
// @access  Private (Administrator only)
router.post('/', protect, authorize('administrator'), async (req, res) => {
    try {
        const school = await School.create(req.body);

        res.status(201).json({
            success: true,
            data: school
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/schools/:id
// @desc    Update school
// @access  Private (Administrator only)
router.put('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const school = await School.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!school) {
            return res.status(404).json({
                success: false,
                error: 'School not found'
            });
        }

        res.json({
            success: true,
            data: school
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   DELETE /api/schools/:id
// @desc    Delete school
// @access  Private (Administrator only)
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const school = await School.findByIdAndDelete(req.params.id);

        if (!school) {
            return res.status(404).json({
                success: false,
                error: 'School not found'
            });
        }

        res.json({
            success: true,
            message: 'School deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/schools/province/:province
// @desc    Get schools by province
// @access  Private
router.get('/province/:province', protect, async (req, res) => {
    try {
        const schools = await School.find({
            province: req.params.province,
            isActive: true
        }).sort({ schoolName: 1 });

        res.json({
            success: true,
            count: schools.length,
            data: schools
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
