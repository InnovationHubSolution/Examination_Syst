const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/results
// @desc    Get all results
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { student, subject, grade, academicYear, term, status } = req.query;
    const query = {};

    // Students can only see their own published results
    if (req.user.role === 'student') {
      query.student = req.user.id;
      query.isPublished = true;
    } else {
      if (student) query.student = student;
      if (status) query.status = status;
    }

    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const results = await Result.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('exam', 'title examType')
      .populate('enteredBy', 'firstName lastName')
      .sort({ academicYear: -1, term: -1 });

    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
});

// @route   GET /api/results/:id
// @desc    Get single result
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'firstName lastName studentId email school')
      .populate('exam', 'title subject examType scheduledDate')
      .populate('enteredBy', 'firstName lastName')
      .populate('verifiedBy', 'firstName lastName');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Check access rights
    if (req.user.role === 'student') {
      if (result.student._id.toString() !== req.user.id || !result.isPublished) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this result'
        });
      }
    }

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching result',
      error: error.message
    });
  }
});

// @route   POST /api/results
// @desc    Enter new result
// @access  Private/Teacher/Admin
router.post('/', protect, authorize('teacher', 'administrator', 'examiner'), async (req, res) => {
  try {
    const resultData = {
      ...req.body,
      enteredBy: req.user.id
    };

    // Calculate percentage
    resultData.scores.percentage = (resultData.scores.obtained / resultData.scores.total) * 100;

    // Assign letter grade
    resultData.letterGrade = calculateLetterGrade(resultData.scores.percentage);

    const result = await Result.create(resultData);

    res.status(201).json({
      success: true,
      message: 'Result entered successfully',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error entering result',
      error: error.message
    });
  }
});

// @route   POST /api/results/bulk
// @desc    Bulk enter results
// @access  Private/Teacher/Admin
router.post('/bulk', protect, authorize('teacher', 'administrator', 'examiner'), async (req, res) => {
  try {
    const { results } = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of results'
      });
    }

    const processedResults = results.map(r => ({
      ...r,
      enteredBy: req.user.id,
      scores: {
        ...r.scores,
        percentage: (r.scores.obtained / r.scores.total) * 100
      },
      letterGrade: calculateLetterGrade((r.scores.obtained / r.scores.total) * 100)
    }));

    const createdResults = await Result.insertMany(processedResults);

    res.status(201).json({
      success: true,
      message: `${createdResults.length} results entered successfully`,
      count: createdResults.length,
      results: createdResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error entering bulk results',
      error: error.message
    });
  }
});

// @route   PUT /api/results/:id
// @desc    Update result
// @access  Private/Teacher/Admin
router.put('/:id', protect, authorize('teacher', 'administrator', 'examiner'), async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Recalculate if scores changed
    if (req.body.scores) {
      req.body.scores.percentage = (req.body.scores.obtained / req.body.scores.total) * 100;
      req.body.letterGrade = calculateLetterGrade(req.body.scores.percentage);
    }

    Object.assign(result, req.body);
    await result.save();

    res.json({
      success: true,
      message: 'Result updated successfully',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating result',
      error: error.message
    });
  }
});

// @route   PUT /api/results/:id/publish
// @desc    Publish result
// @access  Private/Admin
router.put('/:id/publish', protect, authorize('administrator'), async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    result.isPublished = true;
    result.publishedAt = Date.now();
    result.status = 'published';
    await result.save();

    // Notify student via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('result_published', {
        result: result._id,
        student: result.student
      });
    }

    res.json({
      success: true,
      message: 'Result published successfully',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error publishing result',
      error: error.message
    });
  }
});

// @route   GET /api/results/student/:studentId/report
// @desc    Get student report card
// @access  Private
router.get('/student/:studentId/report', protect, async (req, res) => {
  try {
    const { academicYear, term } = req.query;

    if (!academicYear || !term) {
      return res.status(400).json({
        success: false,
        message: 'Academic year and term are required'
      });
    }

    const results = await Result.find({
      student: req.params.studentId,
      academicYear,
      term,
      isPublished: true
    }).populate('subject exam');

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No results found for this period'
      });
    }

    // Calculate overall statistics
    const totalPercentage = results.reduce((sum, r) => sum + r.scores.percentage, 0);
    const averagePercentage = totalPercentage / results.length;
    const overallGrade = calculateLetterGrade(averagePercentage);

    res.json({
      success: true,
      report: {
        student: req.params.studentId,
        academicYear,
        term,
        results,
        statistics: {
          totalSubjects: results.length,
          averagePercentage: averagePercentage.toFixed(2),
          overallGrade
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report card',
      error: error.message
    });
  }
});

// Helper function
function calculateLetterGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 40) return 'D';
  return 'F';
}

module.exports = router;
