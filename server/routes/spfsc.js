const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const SPFSCAssessment = require('../models/SPFSCAssessment');

// @route   GET /api/spfsc
// @desc    Get all SPFSC assessments with filters
// @access  Private (Admin, Teacher, Examiner)
router.get('/', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const {
            academicYear,
            school,
            meetsMinimum,
            minMerits,
            minDistinctions,
            certificateStatus
        } = req.query;

        const query = {};

        if (academicYear) query.academicYear = academicYear;
        if (school) query.school = new RegExp(school, 'i');
        if (meetsMinimum === 'true') query['assessmentSummary.meetsMinimumCriteria'] = true;
        if (minMerits) query['assessmentSummary.meritCount'] = { $gte: parseInt(minMerits) };
        if (minDistinctions) query['assessmentSummary.distinctionCount'] = { $gte: parseInt(minDistinctions) };
        if (certificateStatus) query.certificateStatus = certificateStatus;

        const assessments = await SPFSCAssessment.find(query)
            .populate('student', 'firstName lastName email studentId')
            .populate('verifiedBy', 'firstName lastName')
            .sort('-overallPerformance.averagePercentage');

        // Calculate statistics
        const stats = {
            total: assessments.length,
            meetsCriteria: assessments.filter(a => a.assessmentSummary?.meetsMinimumCriteria).length,
            averageGPA: assessments.reduce((sum, a) => sum + (a.overallPerformance?.gradePointAverage || 0), 0) / (assessments.length || 1),
            topPerformers: assessments.filter(a => (a.overallPerformance?.averagePercentage || 0) >= 75).length
        };

        res.json({
            success: true,
            count: assessments.length,
            stats,
            data: assessments
        });
    } catch (error) {
        console.error('Error fetching SPFSC assessments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/spfsc/:id
// @desc    Get single SPFSC assessment
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const assessment = await SPFSCAssessment.findById(req.params.id)
            .populate('student', 'firstName lastName email studentId school grade')
            .populate('verifiedBy', 'firstName lastName')
            .populate('eligibility.scholarships.scholarshipId');

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'SPFSC assessment not found'
            });
        }

        res.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        console.error('Error fetching SPFSC assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/spfsc/student/:studentId
// @desc    Get SPFSC assessment for specific student
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const assessment = await SPFSCAssessment.findOne({ student: req.params.studentId })
            .populate('student', 'firstName lastName email studentId')
            .populate('verifiedBy', 'firstName lastName')
            .populate('eligibility.scholarships.scholarshipId')
            .sort('-academicYear');

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'SPFSC assessment not found for this student'
            });
        }

        res.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        console.error('Error fetching student SPFSC assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/spfsc
// @desc    Create new SPFSC assessment
// @access  Private (Admin, Teacher, Examiner)
router.post('/', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        // Check if assessment already exists for this student and year
        const existingAssessment = await SPFSCAssessment.findOne({
            student: req.body.student,
            academicYear: req.body.academicYear
        });

        if (existingAssessment) {
            return res.status(400).json({
                success: false,
                message: 'SPFSC assessment already exists for this student and academic year'
            });
        }

        const assessment = await SPFSCAssessment.create(req.body);

        // Assess criteria
        assessment.assessCriteria();

        // Check scholarship eligibility
        await assessment.checkScholarshipEligibility();

        await assessment.save();

        const populatedAssessment = await SPFSCAssessment.findById(assessment._id)
            .populate('student', 'firstName lastName email studentId')
            .populate('eligibility.scholarships.scholarshipId');

        res.status(201).json({
            success: true,
            data: populatedAssessment,
            message: 'SPFSC assessment created successfully'
        });
    } catch (error) {
        console.error('Error creating SPFSC assessment:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating SPFSC assessment',
            error: error.message
        });
    }
});

// @route   PUT /api/spfsc/:id
// @desc    Update SPFSC assessment
// @access  Private (Admin, Teacher, Examiner)
router.put('/:id', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const assessment = await SPFSCAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'SPFSC assessment not found'
            });
        }

        // Update fields
        Object.assign(assessment, req.body);

        // Re-assess criteria
        assessment.assessCriteria();

        // Re-check scholarship eligibility
        await assessment.checkScholarshipEligibility();

        await assessment.save();

        const populatedAssessment = await SPFSCAssessment.findById(assessment._id)
            .populate('student', 'firstName lastName email studentId')
            .populate('verifiedBy', 'firstName lastName')
            .populate('eligibility.scholarships.scholarshipId');

        res.json({
            success: true,
            data: populatedAssessment,
            message: 'SPFSC assessment updated successfully'
        });
    } catch (error) {
        console.error('Error updating SPFSC assessment:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating SPFSC assessment',
            error: error.message
        });
    }
});

// @route   POST /api/spfsc/:id/verify
// @desc    Verify SPFSC certificate
// @access  Private (Admin, Examiner)
router.post('/:id/verify', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const assessment = await SPFSCAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'SPFSC assessment not found'
            });
        }

        assessment.certificateStatus = 'Verified';
        assessment.verifiedBy = req.user._id;
        assessment.verificationDate = new Date();

        await assessment.save();

        const populatedAssessment = await SPFSCAssessment.findById(assessment._id)
            .populate('student', 'firstName lastName email studentId')
            .populate('verifiedBy', 'firstName lastName');

        res.json({
            success: true,
            data: populatedAssessment,
            message: 'SPFSC certificate verified successfully'
        });
    } catch (error) {
        console.error('Error verifying SPFSC certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/spfsc/statistics/overview
// @desc    Get SPFSC statistics and analytics
// @access  Private (Admin, Teacher, Examiner)
router.get('/statistics/overview', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const { academicYear, school } = req.query;
        const query = {};

        if (academicYear) query.academicYear = academicYear;
        if (school) query.school = school;

        const assessments = await SPFSCAssessment.find(query);

        // Calculate comprehensive statistics
        const stats = {
            total: assessments.length,
            meetsCriteria: assessments.filter(a => a.assessmentSummary?.meetsMinimumCriteria).length,
            notMeetsCriteria: assessments.filter(a => !a.assessmentSummary?.meetsMinimumCriteria).length,

            gradeDistribution: {
                allDistinctions: assessments.filter(a => (a.assessmentSummary?.distinctionCount || 0) === 4).length,
                threeDistinctions: assessments.filter(a => (a.assessmentSummary?.distinctionCount || 0) === 3).length,
                twoDistinctions: assessments.filter(a => (a.assessmentSummary?.distinctionCount || 0) === 2).length,
                fourMerits: assessments.filter(a => (a.assessmentSummary?.meritCount || 0) === 4).length,
                threeMerits: assessments.filter(a => (a.assessmentSummary?.meritCount || 0) === 3).length
            },

            englishPerformance: {
                distinction: assessments.filter(a => a.assessmentSummary?.englishGrade === 'Distinction').length,
                merit: assessments.filter(a => a.assessmentSummary?.englishGrade === 'Merit').length,
                pass: assessments.filter(a => a.assessmentSummary?.englishGrade === 'Pass').length,
                fail: assessments.filter(a => a.assessmentSummary?.englishGrade === 'Fail').length,
                notTaken: assessments.filter(a => !a.assessmentSummary?.hasEnglish).length
            },

            averages: {
                gpa: assessments.reduce((sum, a) => sum + (a.overallPerformance?.gradePointAverage || 0), 0) / (assessments.length || 1),
                percentage: assessments.reduce((sum, a) => sum + (a.overallPerformance?.averagePercentage || 0), 0) / (assessments.length || 1),
                meritsPerStudent: assessments.reduce((sum, a) => sum + (a.assessmentSummary?.meritCount || 0), 0) / (assessments.length || 1),
                distinctionsPerStudent: assessments.reduce((sum, a) => sum + (a.assessmentSummary?.distinctionCount || 0), 0) / (assessments.length || 1)
            },

            eligibility: {
                tertiaryEligible: assessments.filter(a => a.assessmentSummary?.criteriaDetails?.eligibleForTertiary).length,
                scholarshipEligible: assessments.filter(a => a.assessmentSummary?.criteriaDetails?.eligibleForScholarship).length
            },

            certificateStatus: {
                pending: assessments.filter(a => a.certificateStatus === 'Pending').length,
                issued: assessments.filter(a => a.certificateStatus === 'Issued').length,
                verified: assessments.filter(a => a.certificateStatus === 'Verified').length,
                revoked: assessments.filter(a => a.certificateStatus === 'Revoked').length
            },

            topPerformers: await SPFSCAssessment.find(query)
                .sort('-overallPerformance.averagePercentage')
                .limit(10)
                .populate('student', 'firstName lastName studentId school')
                .select('student overallPerformance assessmentSummary')
        };

        res.json({
            success: true,
            academicYear: academicYear || 'All Years',
            school: school || 'All Schools',
            data: stats
        });
    } catch (error) {
        console.error('Error fetching SPFSC statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/spfsc/eligible/scholarships
// @desc    Get students eligible for scholarships based on SPFSC
// @access  Private (Admin)
router.get('/eligible/scholarships', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear, minDistinctions = 2 } = req.query;

        const criteria = {
            meetsMinimum: true,
            minDistinctions: parseInt(minDistinctions)
        };

        if (academicYear) criteria.academicYear = academicYear;

        const eligibleStudents = await SPFSCAssessment.findByCriteria(criteria);

        res.json({
            success: true,
            count: eligibleStudents.length,
            criteria: {
                minimumCriteria: 'Met (3 Merits including English)',
                minimumDistinctions: minDistinctions
            },
            data: eligibleStudents
        });
    } catch (error) {
        console.error('Error fetching eligible students:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/spfsc/:id
// @desc    Delete SPFSC assessment
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const assessment = await SPFSCAssessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'SPFSC assessment not found'
            });
        }

        await assessment.deleteOne();

        res.json({
            success: true,
            message: 'SPFSC assessment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting SPFSC assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
