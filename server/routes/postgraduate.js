const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const PostGraduateApplication = require('../models/PostGraduateApplication');

// @route   GET /api/postgraduate
// @desc    Get all post-graduate applications with filters
// @access  Private (Admin, Examiner)
router.get('/', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const {
            applicantType,
            programmeLevel,
            academicYear,
            status,
            eligible
        } = req.query;

        const query = {};

        if (applicantType) query.applicantType = applicantType;
        if (programmeLevel) query.programmeLevel = programmeLevel;
        if (academicYear) query.academicYear = academicYear;
        if (status) query['applicationStatus.status'] = status;
        if (eligible === 'true') query['eligibilityAssessment.overallEligible'] = true;

        const applications = await PostGraduateApplication.find(query)
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName')
            .populate('applicationStatus.decisionBy', 'firstName lastName')
            .sort('-createdAt');

        // Calculate statistics
        const stats = {
            total: applications.length,
            eligible: applications.filter(a => a.eligibilityAssessment?.overallEligible).length,
            submitted: applications.filter(a => a.applicationStatus?.status === 'Submitted').length,
            approved: applications.filter(a => a.applicationStatus?.status === 'Approved').length,
            byType: {
                workforce: applications.filter(a => a.applicantType === 'Current Workforce').length,
                recentGrad: applications.filter(a =>
                    a.applicantType === 'Recently Completed Undergraduate' ||
                    a.applicantType === 'About to Complete Undergraduate'
                ).length
            },
            byLevel: {
                certificate: applications.filter(a =>
                    a.programmeLevel.includes('Certificate')
                ).length,
                diploma: applications.filter(a =>
                    a.programmeLevel.includes('Diploma')
                ).length,
                masters: applications.filter(a => a.programmeLevel === 'Masters').length,
                phd: applications.filter(a => a.programmeLevel === 'PhD').length
            }
        };

        res.json({
            success: true,
            count: applications.length,
            stats,
            data: applications
        });
    } catch (error) {
        console.error('Error fetching post-graduate applications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/postgraduate/:id
// @desc    Get single post-graduate application
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const application = await PostGraduateApplication.findById(req.params.id)
            .populate('student', 'firstName lastName email studentId')
            .populate('assessedBy', 'firstName lastName')
            .populate('applicationStatus.decisionBy', 'firstName lastName')
            .populate('scholarshipAward.scholarshipId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Post-graduate application not found'
            });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Error fetching post-graduate application:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/postgraduate/student/:studentId
// @desc    Get post-graduate application for specific student
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const application = await PostGraduateApplication.findOne({ student: req.params.studentId })
            .populate('student', 'firstName lastName email studentId')
            .sort('-academicYear');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Post-graduate application not found for this student'
            });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Error fetching student post-graduate application:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/postgraduate
// @desc    Create new post-graduate application
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        // Check GPA requirements
        if (req.body.institutionRequirements) {
            req.body.institutionRequirements.meetsGPARequirement =
                req.body.institutionRequirements.applicantGPA >=
                req.body.institutionRequirements.minimumGPA;
        }

        const application = await PostGraduateApplication.create({
            ...req.body,
            student: req.body.student || req.user._id
        });

        const populatedApplication = await PostGraduateApplication.findById(application._id)
            .populate('student', 'firstName lastName email studentId');

        res.status(201).json({
            success: true,
            data: populatedApplication,
            message: 'Post-graduate application created successfully'
        });
    } catch (error) {
        console.error('Error creating post-graduate application:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating post-graduate application',
            error: error.message
        });
    }
});

// @route   PUT /api/postgraduate/:id
// @desc    Update post-graduate application
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const application = await PostGraduateApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Post-graduate application not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'administrator' &&
            req.user.role !== 'examiner' &&
            application.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        Object.assign(application, req.body);
        await application.save();

        const populatedApplication = await PostGraduateApplication.findById(application._id)
            .populate('student', 'firstName lastName email studentId');

        res.json({
            success: true,
            data: populatedApplication,
            message: 'Post-graduate application updated successfully'
        });
    } catch (error) {
        console.error('Error updating post-graduate application:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating post-graduate application',
            error: error.message
        });
    }
});

// @route   POST /api/postgraduate/:id/submit
// @desc    Submit post-graduate application
// @access  Private
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const application = await PostGraduateApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Post-graduate application not found'
            });
        }

        // Check completeness
        const completeness = application.checkCompleteness();

        if (!completeness.isComplete) {
            return res.status(400).json({
                success: false,
                message: 'Application is incomplete',
                issues: completeness.issues
            });
        }

        // Check eligibility
        if (!application.eligibilityAssessment.overallEligible) {
            return res.status(400).json({
                success: false,
                message: 'Application does not meet eligibility requirements',
                missingRequirements: application.eligibilityAssessment.missingRequirements
            });
        }

        application.applicationStatus.status = 'Submitted';
        application.applicationStatus.submissionDate = new Date();

        await application.save();

        res.json({
            success: true,
            data: application,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/postgraduate/:id/check-completeness
// @desc    Check if application is complete
// @access  Private
router.post('/:id/check-completeness', protect, async (req, res) => {
    try {
        const application = await PostGraduateApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Post-graduate application not found'
            });
        }

        const completeness = application.checkCompleteness();

        res.json({
            success: true,
            data: {
                isComplete: completeness.isComplete,
                issues: completeness.issues,
                eligibility: {
                    isEligible: application.eligibilityAssessment.overallEligible,
                    missingRequirements: application.eligibilityAssessment.missingRequirements
                }
            }
        });
    } catch (error) {
        console.error('Error checking completeness:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/postgraduate/type/:applicantType
// @desc    Get applications by applicant type
// @access  Private (Admin, Examiner)
router.get('/type/:applicantType', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;

        const applications = await PostGraduateApplication.getByApplicantType(
            req.params.applicantType,
            academicYear
        );

        res.json({
            success: true,
            count: applications.length,
            applicantType: req.params.applicantType,
            data: applications
        });
    } catch (error) {
        console.error('Error fetching applications by type:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/postgraduate/level/phd
// @desc    Get PhD applications
// @access  Private (Admin, Examiner)
router.get('/level/phd', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;

        const applications = await PostGraduateApplication.getPHDApplications(academicYear);

        res.json({
            success: true,
            count: applications.length,
            message: 'PhD applications',
            data: applications
        });
    } catch (error) {
        console.error('Error fetching PhD applications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/postgraduate/eligible/all
// @desc    Get all eligible applications
// @access  Private (Admin, Examiner)
router.get('/eligible/all', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;

        const applications = await PostGraduateApplication.getEligibleApplications(academicYear);

        res.json({
            success: true,
            count: applications.length,
            message: 'Applications meeting all eligibility requirements',
            data: applications
        });
    } catch (error) {
        console.error('Error fetching eligible applications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/postgraduate/:id/approve
// @desc    Approve post-graduate application
// @access  Private (Admin only)
router.post('/:id/approve', protect, authorize('administrator'), async (req, res) => {
    try {
        const { conditional, scholarshipDetails } = req.body;

        const application = await PostGraduateApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Post-graduate application not found'
            });
        }

        application.applicationStatus.status = conditional ? 'Conditionally Approved' : 'Approved';
        application.applicationStatus.decisionDate = new Date();
        application.applicationStatus.decisionBy = req.user._id;

        if (scholarshipDetails) {
            application.scholarshipAward = {
                ...application.scholarshipAward,
                ...scholarshipDetails,
                awarded: true
            };
        }

        await application.save();

        const populatedApplication = await PostGraduateApplication.findById(application._id)
            .populate('student', 'firstName lastName email studentId')
            .populate('applicationStatus.decisionBy', 'firstName lastName');

        res.json({
            success: true,
            data: populatedApplication,
            message: `Application ${conditional ? 'conditionally approved' : 'approved'} successfully`
        });
    } catch (error) {
        console.error('Error approving application:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/postgraduate/:id/reject
// @desc    Reject post-graduate application
// @access  Private (Admin only)
router.post('/:id/reject', protect, authorize('administrator'), async (req, res) => {
    try {
        const { reason } = req.body;

        const application = await PostGraduateApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Post-graduate application not found'
            });
        }

        application.applicationStatus.status = 'Rejected';
        application.applicationStatus.decisionDate = new Date();
        application.applicationStatus.decisionBy = req.user._id;
        application.applicationStatus.rejectionReason = reason;

        await application.save();

        const populatedApplication = await PostGraduateApplication.findById(application._id)
            .populate('student', 'firstName lastName email studentId')
            .populate('applicationStatus.decisionBy', 'firstName lastName');

        res.json({
            success: true,
            data: populatedApplication,
            message: 'Application rejected'
        });
    } catch (error) {
        console.error('Error rejecting application:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/postgraduate/statistics/overview
// @desc    Get post-graduate application statistics
// @access  Private (Admin, Examiner)
router.get('/statistics/overview', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;
        const query = {};

        if (academicYear) query.academicYear = academicYear;

        const applications = await PostGraduateApplication.find(query);

        const stats = {
            total: applications.length,

            byApplicantType: {
                workforce: applications.filter(a => a.applicantType === 'Current Workforce').length,
                aboutToComplete: applications.filter(a => a.applicantType === 'About to Complete Undergraduate').length,
                recentlyCompleted: applications.filter(a => a.applicantType === 'Recently Completed Undergraduate').length
            },

            byProgrammeLevel: {
                certificate: applications.filter(a => a.programmeLevel.includes('Certificate')).length,
                diploma: applications.filter(a => a.programmeLevel.includes('Diploma')).length,
                masters: applications.filter(a => a.programmeLevel === 'Masters').length,
                phd: applications.filter(a => a.programmeLevel === 'PhD').length
            },

            byStatus: {
                draft: applications.filter(a => a.applicationStatus.status === 'Draft').length,
                incomplete: applications.filter(a => a.applicationStatus.status === 'Incomplete').length,
                complete: applications.filter(a => a.applicationStatus.status === 'Complete').length,
                submitted: applications.filter(a => a.applicationStatus.status === 'Submitted').length,
                underReview: applications.filter(a => a.applicationStatus.status === 'Under Review').length,
                approved: applications.filter(a => a.applicationStatus.status === 'Approved').length,
                rejected: applications.filter(a => a.applicationStatus.status === 'Rejected').length
            },

            eligibility: {
                eligible: applications.filter(a => a.eligibilityAssessment.overallEligible).length,
                notEligible: applications.filter(a => !a.eligibilityAssessment.overallEligible).length
            },

            researchDegrees: {
                total: applications.filter(a => a.researchDetails.isResearchDegree).length,
                alignsPriorities: applications.filter(a => a.researchDetails.alignsWithPriorityFramework).length
            },

            averageGPA: applications.reduce((sum, a) =>
                sum + (a.institutionRequirements?.applicantGPA || 0), 0
            ) / (applications.length || 1)
        };

        res.json({
            success: true,
            academicYear: academicYear || 'All Years',
            data: stats
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/postgraduate/:id
// @desc    Delete post-graduate application
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const application = await PostGraduateApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Post-graduate application not found'
            });
        }

        await application.deleteOne();

        res.json({
            success: true,
            message: 'Post-graduate application deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
