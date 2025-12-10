const express = require('express');
const router = express.Router();
const InternalAssessment = require('../models/InternalAssessment');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/internal-assessments
// @desc    Get all internal assessments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { school, teacher, yearLevel, subject, academicYear, moderationStatus } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'teacher') {
      query.teacher = req.user.id;
    } else if (req.user.role === 'moderator') {
      query.assignedModerator = req.user.id;
    }
    
    if (school) query.school = school;
    if (teacher) query.teacher = teacher;
    if (yearLevel) query.yearLevel = yearLevel;
    if (subject) query.subject = subject;
    if (academicYear) query.academicYear = academicYear;
    if (moderationStatus) query.moderationStatus = moderationStatus;
    
    const assessments = await InternalAssessment.find(query)
      .populate('school', 'schoolName province')
      .populate('teacher', 'firstName lastName email')
      .populate('assignedModerator', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/internal-assessments/:id
// @desc    Get single internal assessment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const assessment = await InternalAssessment.findById(req.params.id)
      .populate('school', 'schoolName province')
      .populate('teacher', 'firstName lastName email phoneNumber')
      .populate('uploadedBy', 'firstName lastName')
      .populate('assignedModerator', 'firstName lastName email')
      .populate('studentSubmissions.student', 'firstName lastName')
      .populate('moderationFeedback.moderator', 'firstName lastName')
      .populate('correctionsRequired.resolvedBy', 'firstName lastName');
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Internal assessment not found'
      });
    }
    
    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/internal-assessments
// @desc    Submit new internal assessment
// @access  Private (Teacher, School Admin)
router.post('/', protect, authorize('teacher', 'school_admin'), upload.fields([
  { name: 'assessmentTask', maxCount: 1 },
  { name: 'markingRubric', maxCount: 1 },
  { name: 'coverSheet', maxCount: 1 },
  { name: 'studentWork', maxCount: 50 }
]), async (req, res) => {
  try {
    const assessmentData = {
      ...req.body,
      teacher: req.user.id,
      uploadedBy: req.user.id,
      moderationStatus: 'submitted',
      uploadDate: Date.now()
    };
    
    // Parse student submissions if sent as string
    if (typeof assessmentData.studentSubmissions === 'string') {
      assessmentData.studentSubmissions = JSON.parse(assessmentData.studentSubmissions);
    }
    
    // Handle file uploads
    if (req.files) {
      if (req.files.assessmentTask) {
        assessmentData.assessmentTask = {
          filename: req.files.assessmentTask[0].filename,
          path: req.files.assessmentTask[0].path,
          uploadedAt: Date.now()
        };
      }
      
      if (req.files.markingRubric) {
        assessmentData.markingRubric = {
          filename: req.files.markingRubric[0].filename,
          path: req.files.markingRubric[0].path,
          uploadedAt: Date.now()
        };
      }
      
      if (req.files.coverSheet) {
        assessmentData.coverSheet = {
          filename: req.files.coverSheet[0].filename,
          path: req.files.coverSheet[0].path,
          uploadedAt: Date.now()
        };
      }
    }
    
    const assessment = await InternalAssessment.create(assessmentData);
    
    // Send notification to admin for moderator assignment
    // Socket.io notification would go here
    
    res.status(201).json({
      success: true,
      data: assessment,
      message: 'Internal assessment submitted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/internal-assessments/:id/assign-moderator
// @desc    Assign moderator to internal assessment
// @access  Private (Administrator only)
router.put('/:id/assign-moderator', protect, authorize('administrator'), async (req, res) => {
  try {
    const { moderatorId } = req.body;
    
    const assessment = await InternalAssessment.findByIdAndUpdate(
      req.params.id,
      {
        assignedModerator: moderatorId,
        moderationStatus: 'under_review',
        moderationStartDate: Date.now()
      },
      { new: true }
    ).populate('assignedModerator', 'firstName lastName email');
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }
    
    // Send notification to moderator
    // Socket.io notification would go here
    
    res.json({
      success: true,
      data: assessment,
      message: 'Moderator assigned successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/internal-assessments/:id/feedback
// @desc    Add moderation feedback
// @access  Private (Moderator, Administrator)
router.post('/:id/feedback', protect, authorize('moderator', 'administrator'), async (req, res) => {
  try {
    const { feedbackType, feedback } = req.body;
    
    const assessment = await InternalAssessment.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          moderationFeedback: {
            moderator: req.user.id,
            feedbackType,
            feedback,
            isResolved: false,
            createdAt: Date.now()
          }
        }
      },
      { new: true }
    ).populate('moderationFeedback.moderator', 'firstName lastName');
    
    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/internal-assessments/:id/corrections
// @desc    Request corrections
// @access  Private (Moderator, Administrator)
router.post('/:id/corrections', protect, authorize('moderator', 'administrator'), async (req, res) => {
  try {
    const { corrections } = req.body; // Array of correction items
    
    const assessment = await InternalAssessment.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: 'requires_correction',
        $push: {
          correctionsRequired: {
            $each: corrections.map(c => ({
              ...c,
              isResolved: false
            }))
          }
        }
      },
      { new: true }
    );
    
    // Send notification to teacher
    // Socket.io notification would go here
    
    res.json({
      success: true,
      data: assessment,
      message: 'Corrections requested successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/internal-assessments/:id/resubmit
// @desc    Resubmit after corrections
// @access  Private (Teacher)
router.put('/:id/resubmit', protect, authorize('teacher'), async (req, res) => {
  try {
    const { changes } = req.body;
    
    const assessment = await InternalAssessment.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: 'under_review',
        $push: {
          resubmissions: {
            resubmittedAt: Date.now(),
            resubmittedBy: req.user.id,
            changes
          }
        }
      },
      { new: true }
    );
    
    // Send notification to moderator
    // Socket.io notification would go here
    
    res.json({
      success: true,
      data: assessment,
      message: 'Assessment resubmitted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/internal-assessments/:id/approve
// @desc    Approve internal assessment
// @access  Private (Administrator)
router.put('/:id/approve', protect, authorize('administrator'), async (req, res) => {
  try {
    const { comments } = req.body;
    
    const assessment = await InternalAssessment.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: 'approved',
        moderationCompletionDate: Date.now(),
        'finalApproval.approved': true,
        'finalApproval.approvedBy': req.user.id,
        'finalApproval.approvedAt': Date.now(),
        'finalApproval.comments': comments
      },
      { new: true }
    );
    
    // Send notification to teacher
    // Socket.io notification would go here
    
    res.json({
      success: true,
      data: assessment,
      message: 'Assessment approved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/internal-assessments/stats/dashboard
// @desc    Get moderation dashboard statistics
// @access  Private (Administrator, Moderator)
router.get('/stats/dashboard', protect, authorize('administrator', 'moderator'), async (req, res) => {
  try {
    const stats = {
      totalSubmissions: await InternalAssessment.countDocuments(),
      pendingReview: await InternalAssessment.countDocuments({ moderationStatus: 'submitted' }),
      underReview: await InternalAssessment.countDocuments({ moderationStatus: 'under_review' }),
      requiresCorrection: await InternalAssessment.countDocuments({ moderationStatus: 'requires_correction' }),
      approved: await InternalAssessment.countDocuments({ moderationStatus: 'approved' })
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
