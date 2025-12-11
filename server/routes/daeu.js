const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const DAEUAssessment = require('../models/DAEUAssessment');

// @route   GET /api/daeu
// @desc    Get all DAEU/Baccalauréat assessments with filters
// @access  Private (Admin, Teacher, Examiner)
router.get('/', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const {
            assessmentType,
            studentTrack,
            academicYear,
            eligible,
            priority,
            exceptional,
            minAverage
        } = req.query;

        const query = {};

        if (assessmentType) query.assessmentType = assessmentType;
        if (studentTrack) query.studentTrack = studentTrack;
        if (academicYear) query.academicYear = academicYear;
        if (eligible === 'true') query['assessmentResults.eligibleForScholarship'] = true;
        if (priority === 'true') query['advancedProgramme.isPriority'] = true;
        if (exceptional === 'true') query['exceptionalCircumstances.hasExceptionalCase'] = true;
        if (minAverage) query['overallPerformance.weightedAverage'] = { $gte: parseFloat(minAverage) };

        const assessments = await DAEUAssessment.find(query)
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName')
            .populate('exceptionalCircumstances.reviewedBy', 'firstName lastName')
            .sort('-overallPerformance.weightedAverage');

        // Calculate statistics
        const stats = {
            total: assessments.length,
            eligible: assessments.filter(a => a.assessmentResults?.eligibleForScholarship).length,
            priority: assessments.filter(a => a.advancedProgramme?.isPriority).length,
            exceptional: assessments.filter(a => a.exceptionalCircumstances?.hasExceptionalCase).length,
            averageScore: assessments.reduce((sum, a) => sum + (a.overallPerformance?.weightedAverage || 0), 0) / (assessments.length || 1)
        };

        res.json({
            success: true,
            count: assessments.length,
            stats,
            data: assessments
        });
    } catch (error) {
        console.error('Error fetching DAEU assessments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/daeu/:id
// @desc    Get single DAEU assessment
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const assessment = await DAEUAssessment.findById(req.params.id)
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName')
            .populate('exceptionalCircumstances.reviewedBy', 'firstName lastName');

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'DAEU assessment not found'
            });
        }

        res.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        console.error('Error fetching DAEU assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/daeu/student/:studentId
// @desc    Get DAEU assessment for specific student
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const assessment = await DAEUAssessment.findOne({ student: req.params.studentId })
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName')
            .sort('-academicYear');

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'DAEU assessment not found for this student'
            });
        }

        res.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        console.error('Error fetching student DAEU assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/daeu
// @desc    Create new DAEU assessment
// @access  Private (Admin, Teacher, Examiner)
router.post('/', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const existingAssessment = await DAEUAssessment.findOne({
            student: req.body.student,
            academicYear: req.body.academicYear
        });

        if (existingAssessment) {
            return res.status(400).json({
                success: false,
                message: 'DAEU assessment already exists for this student and academic year'
            });
        }

        const assessment = await DAEUAssessment.create({
            ...req.body,
            assessedBy: req.user._id
        });

        const populatedAssessment = await DAEUAssessment.findById(assessment._id)
            .populate('student', 'firstName lastName email studentId');

        res.status(201).json({
            success: true,
            data: populatedAssessment,
            message: 'DAEU assessment created successfully'
        });
    } catch (error) {
        console.error('Error creating DAEU assessment:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating DAEU assessment',
            error: error.message
        });
    }
});

// @route   PUT /api/daeu/:id
// @desc    Update DAEU assessment
// @access  Private (Admin, Teacher, Examiner)
router.put('/:id', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const assessment = await DAEUAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'DAEU assessment not found'
            });
        }

        Object.assign(assessment, req.body);
        await assessment.save();

        const populatedAssessment = await DAEUAssessment.findById(assessment._id)
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName');

        res.json({
            success: true,
            data: populatedAssessment,
            message: 'DAEU assessment updated successfully'
        });
    } catch (error) {
        console.error('Error updating DAEU assessment:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating DAEU assessment',
            error: error.message
        });
    }
});

// @route   GET /api/daeu/priority/students
// @desc    Get priority students (BTS/DUT/CPGE)
// @access  Private (Admin, Examiner)
router.get('/priority/students', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;

        const priorityStudents = await DAEUAssessment.getPriorityStudents(academicYear);

        res.json({
            success: true,
            count: priorityStudents.length,
            message: 'Priority students (BTS/DUT/CPGE) who meet eligibility criteria',
            data: priorityStudents
        });
    } catch (error) {
        console.error('Error fetching priority students:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/daeu/exceptional/cases
// @desc    Get exceptional cases requiring NSTB review
// @access  Private (Admin, Examiner)
router.get('/exceptional/cases', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { status } = req.query;

        const exceptionalCases = await DAEUAssessment.getExceptionalCases(status || 'Pending');

        res.json({
            success: true,
            count: exceptionalCases.length,
            message: 'Students with exceptional circumstances (14/20 average but French < 10)',
            criteria: 'Requires NSTB discretion for approval',
            data: exceptionalCases
        });
    } catch (error) {
        console.error('Error fetching exceptional cases:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/daeu/:id/review-exception
// @desc    Review and approve/reject exceptional case
// @access  Private (Admin only - NSTB)
router.post('/:id/review-exception', protect, authorize('administrator'), async (req, res) => {
    try {
        const { approval, notes } = req.body; // approval: 'Approved' or 'Rejected'

        const assessment = await DAEUAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'DAEU assessment not found'
            });
        }

        if (!assessment.exceptionalCircumstances.hasExceptionalCase) {
            return res.status(400).json({
                success: false,
                message: 'This is not an exceptional case'
            });
        }

        assessment.exceptionalCircumstances.nstbApproval = approval;
        assessment.exceptionalCircumstances.approvalNotes = notes;
        assessment.exceptionalCircumstances.reviewedBy = req.user._id;
        assessment.exceptionalCircumstances.reviewDate = new Date();

        // Re-assess eligibility with new approval status
        assessment.assessCriteria();

        await assessment.save();

        const populatedAssessment = await DAEUAssessment.findById(assessment._id)
            .populate('student', 'firstName lastName email studentId')
            .populate('exceptionalCircumstances.reviewedBy', 'firstName lastName');

        res.json({
            success: true,
            data: populatedAssessment,
            message: `Exceptional case ${approval.toLowerCase()} by NSTB`
        });
    } catch (error) {
        console.error('Error reviewing exceptional case:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/daeu/statistics/overview
// @desc    Get DAEU statistics and analytics
// @access  Private (Admin, Teacher, Examiner)
router.get('/statistics/overview', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const { academicYear, assessmentType } = req.query;
        const query = {};

        if (academicYear) query.academicYear = academicYear;
        if (assessmentType) query.assessmentType = assessmentType;

        const assessments = await DAEUAssessment.find(query);

        const stats = {
            total: assessments.length,
            eligible: assessments.filter(a => a.assessmentResults?.eligibleForScholarship).length,
            notEligible: assessments.filter(a => !a.assessmentResults?.eligibleForScholarship).length,

            typeBreakdown: {
                DAEU: assessments.filter(a => a.assessmentType === 'DAEU').length,
                Baccalaureat: assessments.filter(a => a.assessmentType === 'Baccalaureat').length,
                BTS: assessments.filter(a => a.assessmentType === 'BTS').length,
                DUT: assessments.filter(a => a.assessmentType === 'DUT').length,
                CPGE: assessments.filter(a => a.assessmentType === 'CPGE').length
            },

            priorityStudents: {
                total: assessments.filter(a => a.advancedProgramme?.isPriority).length,
                BTS: assessments.filter(a => a.assessmentType === 'BTS' && a.advancedProgramme?.isPriority).length,
                DUT: assessments.filter(a => a.assessmentType === 'DUT' && a.advancedProgramme?.isPriority).length,
                CPGE: assessments.filter(a => a.assessmentType === 'CPGE' && a.advancedProgramme?.isPriority).length
            },

            requirements: {
                meetsAverage: assessments.filter(a => a.assessmentResults?.meetsAverageRequirement).length,
                meetsFrench: assessments.filter(a => a.assessmentResults?.meetsFrenchRequirement).length,
                meetsMath: assessments.filter(a => a.assessmentResults?.meetsMathRequirement).length
            },

            exceptionalCases: {
                total: assessments.filter(a => a.exceptionalCircumstances?.hasExceptionalCase).length,
                pending: assessments.filter(a => a.exceptionalCircumstances?.nstbApproval === 'Pending').length,
                approved: assessments.filter(a => a.exceptionalCircumstances?.nstbApproval === 'Approved').length,
                rejected: assessments.filter(a => a.exceptionalCircumstances?.nstbApproval === 'Rejected').length
            },

            averages: {
                overallAverage: assessments.reduce((sum, a) => sum + (a.overallPerformance?.weightedAverage || 0), 0) / (assessments.length || 1),
                frenchAverage: assessments.reduce((sum, a) => sum + (a.frenchScore || 0), 0) / (assessments.length || 1),
                mathAverage: assessments.filter(a => a.studentTrack === 'Science').reduce((sum, a) => sum + (a.mathematicsScore || 0), 0) / (assessments.filter(a => a.studentTrack === 'Science').length || 1)
            },

            topPerformers: await DAEUAssessment.find(query)
                .sort('-overallPerformance.weightedAverage')
                .limit(10)
                .populate('student', 'firstName lastName studentId')
                .select('student assessmentType overallPerformance assessmentResults')
        };

        res.json({
            success: true,
            academicYear: academicYear || 'All Years',
            assessmentType: assessmentType || 'All Types',
            data: stats
        });
    } catch (error) {
        console.error('Error fetching DAEU statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/daeu/:id
// @desc    Delete DAEU assessment
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const assessment = await DAEUAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'DAEU assessment not found'
            });
        }

        await assessment.deleteOne();

        res.json({
            success: true,
            message: 'DAEU assessment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting DAEU assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
