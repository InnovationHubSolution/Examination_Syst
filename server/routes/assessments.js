const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/assessments
// @desc    Get all assessments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { subject, grade, type, status } = req.query;
    const query = {};

    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (type) query.type = type;
    if (status) query.status = status;

    // Students see only published assessments assigned to them
    if (req.user.role === 'student') {
      query.isPublished = true;
      query.assignedTo = req.user.id;
    } else if (req.user.role === 'teacher') {
      // Teachers see their own assessments
      query.teacher = req.user.id;
    }

    const assessments = await Assessment.find(query)
      .populate('teacher', 'firstName lastName')
      .sort({ dueDate: -1 });

    res.json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assessments',
      error: error.message
    });
  }
});

// @route   POST /api/assessments
// @desc    Create new assessment
// @access  Private/Teacher/Admin
router.post('/', protect, authorize('teacher', 'administrator'), upload.array('attachments', 10), async (req, res) => {
  try {
    const assessmentData = {
      ...req.body,
      teacher: req.user.id
    };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      assessmentData.attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        fileType: file.mimetype,
        uploadedAt: Date.now()
      }));
    }

    const assessment = await Assessment.create(assessmentData);

    // Send notification to assigned students via socket
    const io = req.app.get('io');
    if (assessment.isPublished && io) {
      io.emit('new_assessment', {
        assessment: assessment._id,
        title: assessment.title,
        dueDate: assessment.dueDate
      });
    }

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating assessment',
      error: error.message
    });
  }
});

// @route   GET /api/assessments/:id
// @desc    Get single assessment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName studentId');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assessment',
      error: error.message
    });
  }
});

// @route   PUT /api/assessments/:id
// @desc    Update assessment
// @access  Private/Teacher/Admin
router.put('/:id', protect, authorize('teacher', 'administrator'), async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assessment updated successfully',
      assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating assessment',
      error: error.message
    });
  }
});

// @route   DELETE /api/assessments/:id
// @desc    Delete assessment
// @access  Private/Teacher/Admin
router.delete('/:id', protect, authorize('teacher', 'administrator'), async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting assessment',
      error: error.message
    });
  }
});

module.exports = router;
