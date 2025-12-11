const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const USPFoundationAssessment = require('../models/USPFoundationAssessment');

// @route   GET /api/usp-foundation
// @desc    Get all USP Foundation assessments with filters
// @access  Private (Admin, Teacher, Examiner)
router.get('/', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const {
            programmeType,
            intendedPathway,
            academicYear,
            eligible,
            minGPA
        } = req.query;

        const query = {};

        if (programmeType) query.programmeType = programmeType;
        if (intendedPathway) query.intendedPathway = intendedPathway;
        if (academicYear) query.academicYear = academicYear;
        if (eligible === 'true') query['assessmentResults.overallEligible'] = true;
        if (minGPA) query['overallPerformance.gpa'] = { $gte: parseFloat(minGPA) };

        const assessments = await USPFoundationAssessment.find(query)
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName')
            .populate('verifiedBy', 'firstName lastName')
            .sort('-overallPerformance.gpa');

        // Calculate statistics
        const stats = {
            total: assessments.length,
            eligible: assessments.filter(a => a.assessmentResults?.overallEligible).length,
            generalPathway: assessments.filter(a => a.assessmentResults?.generalPathway?.eligible).length,
            healthSciencePathway: assessments.filter(a => a.assessmentResults?.healthSciencePathway?.eligible).length,
            medicinePathway: assessments.filter(a => a.assessmentResults?.medicinePathway?.eligible).length,
            averageGPA: assessments.reduce((sum, a) => sum + (a.overallPerformance?.gpa || 0), 0) / (assessments.length || 1),
            averageCourses: assessments.reduce((sum, a) => sum + (a.overallPerformance?.totalCourses || 0), 0) / (assessments.length || 1)
        };

        res.json({
            success: true,
            count: assessments.length,
            stats,
            data: assessments
        });
    } catch (error) {
        console.error('Error fetching USP Foundation assessments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/usp-foundation/:id
// @desc    Get single USP Foundation assessment
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const assessment = await USPFoundationAssessment.findById(req.params.id)
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName')
            .populate('verifiedBy', 'firstName lastName');

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'USP Foundation assessment not found'
            });
        }

        res.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        console.error('Error fetching USP Foundation assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/usp-foundation/student/:studentId
// @desc    Get USP Foundation assessment for specific student
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const assessment = await USPFoundationAssessment.findOne({ student: req.params.studentId })
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName')
            .sort('-academicYear');

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'USP Foundation assessment not found for this student'
            });
        }

        res.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        console.error('Error fetching student USP Foundation assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/usp-foundation
// @desc    Create new USP Foundation assessment
// @access  Private (Admin, Teacher, Examiner)
router.post('/', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const existingAssessment = await USPFoundationAssessment.findOne({
            student: req.body.student,
            academicYear: req.body.academicYear
        });

        if (existingAssessment) {
            return res.status(400).json({
                success: false,
                message: 'USP Foundation assessment already exists for this student and academic year'
            });
        }

        const assessment = await USPFoundationAssessment.create({
            ...req.body,
            assessedBy: req.user._id
        });

        const populatedAssessment = await USPFoundationAssessment.findById(assessment._id)
            .populate('student', 'firstName lastName email studentId');

        res.status(201).json({
            success: true,
            data: populatedAssessment,
            message: 'USP Foundation assessment created successfully'
        });
    } catch (error) {
        console.error('Error creating USP Foundation assessment:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating USP Foundation assessment',
            error: error.message
        });
    }
});

// @route   PUT /api/usp-foundation/:id
// @desc    Update USP Foundation assessment
// @access  Private (Admin, Teacher, Examiner)
router.put('/:id', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const assessment = await USPFoundationAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'USP Foundation assessment not found'
            });
        }

        Object.assign(assessment, req.body);
        await assessment.save();

        const populatedAssessment = await USPFoundationAssessment.findById(assessment._id)
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName');

        res.json({
            success: true,
            data: populatedAssessment,
            message: 'USP Foundation assessment updated successfully'
        });
    } catch (error) {
        console.error('Error updating USP Foundation assessment:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating USP Foundation assessment',
            error: error.message
        });
    }
});

// @route   POST /api/usp-foundation/:id/check-pathway
// @desc    Check eligibility for specific pathway
// @access  Private
router.post('/:id/check-pathway', protect, async (req, res) => {
    try {
        const { pathway } = req.body;

        const assessment = await USPFoundationAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'USP Foundation assessment not found'
            });
        }

        const eligibility = assessment.checkPathwayEligibility(pathway);

        res.json({
            success: true,
            pathway,
            data: eligibility
        });
    } catch (error) {
        console.error('Error checking pathway eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/usp-foundation/eligible/medicine
// @desc    Get students eligible for Medicine programmes
// @access  Private (Admin, Examiner)
router.get('/eligible/medicine', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;

        const students = await USPFoundationAssessment.getMedicineEligibleStudents(academicYear);

        res.json({
            success: true,
            count: students.length,
            message: 'Students eligible for Bachelor of Medicine and Surgery (GPA 4.0+)',
            requirements: {
                minimumScienceCourses: 10,
                minimumGPA: 4.0,
                englishRequirement: 'B or higher in Foundation English A (LLF11)'
            },
            data: students
        });
    } catch (error) {
        console.error('Error fetching medicine-eligible students:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/usp-foundation/eligible/health-science
// @desc    Get students eligible for Health Science programmes
// @access  Private (Admin, Examiner)
router.get('/eligible/health-science', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;

        const students = await USPFoundationAssessment.getHealthScienceEligibleStudents(academicYear);

        res.json({
            success: true,
            count: students.length,
            message: 'Students eligible for Health Science programmes (Non-Medicine)',
            requirements: {
                minimumScienceCourses: 10,
                minimumGPA: 2.5,
                englishRequirement: 'B or higher in Foundation English A (LLF11)',
                note: 'Some programmes may require higher GPA'
            },
            data: students
        });
    } catch (error) {
        console.error('Error fetching health science-eligible students:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/usp-foundation/statistics/overview
// @desc    Get USP Foundation statistics and analytics
// @access  Private (Admin, Teacher, Examiner)
router.get('/statistics/overview', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;
        const query = {};

        if (academicYear) query.academicYear = academicYear;

        const assessments = await USPFoundationAssessment.find(query);

        const stats = {
            total: assessments.length,
            overallEligible: assessments.filter(a => a.assessmentResults?.overallEligible).length,
            notEligible: assessments.filter(a => !a.assessmentResults?.overallEligible).length,

            pathwayBreakdown: {
                generalEligible: assessments.filter(a => a.assessmentResults?.generalPathway?.eligible).length,
                healthScienceEligible: assessments.filter(a => a.assessmentResults?.healthSciencePathway?.eligible).length,
                medicineEligible: assessments.filter(a => a.assessmentResults?.medicinePathway?.eligible).length
            },

            requirements: {
                meetsMinimum8Courses: assessments.filter(a => a.overallPerformance?.totalCourses >= 8).length,
                meetsMinimum10ScienceCourses: assessments.filter(a => a.overallPerformance?.totalScienceCourses >= 10).length,
                meetsGPA25: assessments.filter(a => a.overallPerformance?.gpa >= 2.5).length,
                meetsGPA40: assessments.filter(a => a.overallPerformance?.gpa >= 4.0).length,
                meetsEnglishB: assessments.filter(a => a.englishFoundationA?.meetsBRequirement).length
            },

            gpaDistribution: {
                gpa40Plus: assessments.filter(a => (a.overallPerformance?.gpa || 0) >= 4.0).length,
                gpa35to40: assessments.filter(a => (a.overallPerformance?.gpa || 0) >= 3.5 && (a.overallPerformance?.gpa || 0) < 4.0).length,
                gpa30to35: assessments.filter(a => (a.overallPerformance?.gpa || 0) >= 3.0 && (a.overallPerformance?.gpa || 0) < 3.5).length,
                gpa25to30: assessments.filter(a => (a.overallPerformance?.gpa || 0) >= 2.5 && (a.overallPerformance?.gpa || 0) < 3.0).length,
                gpaBelow25: assessments.filter(a => (a.overallPerformance?.gpa || 0) < 2.5).length
            },

            averages: {
                gpa: assessments.reduce((sum, a) => sum + (a.overallPerformance?.gpa || 0), 0) / (assessments.length || 1),
                totalCourses: assessments.reduce((sum, a) => sum + (a.overallPerformance?.totalCourses || 0), 0) / (assessments.length || 1),
                scienceCourses: assessments.reduce((sum, a) => sum + (a.overallPerformance?.totalScienceCourses || 0), 0) / (assessments.length || 1)
            },

            topPerformers: await USPFoundationAssessment.find(query)
                .sort('-overallPerformance.gpa')
                .limit(10)
                .populate('student', 'firstName lastName studentId')
                .select('student overallPerformance assessmentResults intendedPathway')
        };

        res.json({
            success: true,
            academicYear: academicYear || 'All Years',
            data: stats
        });
    } catch (error) {
        console.error('Error fetching USP Foundation statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/usp-foundation/:id/verify
// @desc    Verify USP Foundation certificate
// @access  Private (Admin, Examiner)
router.post('/:id/verify', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const assessment = await USPFoundationAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'USP Foundation assessment not found'
            });
        }

        assessment.verifiedBy = req.user._id;
        assessment.verificationDate = new Date();

        await assessment.save();

        const populatedAssessment = await USPFoundationAssessment.findById(assessment._id)
            .populate('student', 'firstName lastName email studentId')
            .populate('verifiedBy', 'firstName lastName');

        res.json({
            success: true,
            data: populatedAssessment,
            message: 'USP Foundation certificate verified successfully'
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/usp-foundation/:id
// @desc    Delete USP Foundation assessment
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const assessment = await USPFoundationAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'USP Foundation assessment not found'
            });
        }

        await assessment.deleteOne();

        res.json({
            success: true,
            message: 'USP Foundation assessment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting USP Foundation assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
