const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/exams
// @desc    Get all exams
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { subject, grade, examType, status, academicYear } = req.query;
    const query = {};

    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (examType) query.examType = examType;
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    // Students can only see published exams
    if (req.user.role === 'student') {
      query.isPublished = true;
    }

    const exams = await Exam.find(query)
      .populate('examiner', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      count: exams.length,
      exams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exams',
      error: error.message
    });
  }
});

// @route   GET /api/exams/:id
// @desc    Get single exam
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('examiner', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if student can view unpublished exam
    if (req.user.role === 'student' && !exam.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'This exam is not yet published'
      });
    }

    res.json({
      success: true,
      exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exam',
      error: error.message
    });
  }
});

// @route   POST /api/exams
// @desc    Create new exam
// @access  Private/Teacher/Admin
router.post('/', protect, authorize('teacher', 'administrator', 'examiner'), upload.array('attachments', 5), async (req, res) => {
  try {
    const examData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      examData.attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        uploadedAt: Date.now()
      }));
    }

    const exam = await Exam.create(examData);

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating exam',
      error: error.message
    });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private/Teacher/Admin
router.put('/:id', protect, authorize('teacher', 'administrator', 'examiner'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      message: 'Exam updated successfully',
      exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating exam',
      error: error.message
    });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private/Admin
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting exam',
      error: error.message
    });
  }
});

// @route   GET /api/exams/timetable/:grade
// @desc    Get exam timetable for a grade
// @access  Private
router.get('/timetable/:grade', protect, async (req, res) => {
  try {
    const exams = await Exam.find({
      grade: req.params.grade,
      isPublished: true,
      status: { $in: ['scheduled', 'ongoing'] }
    })
      .sort({ scheduledDate: 1, startTime: 1 })
      .select('title subject scheduledDate startTime endTime venue');

    res.json({
      success: true,
      count: exams.length,
      timetable: exams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message
    });
  }
});

module.exports = router;
