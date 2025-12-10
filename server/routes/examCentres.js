const express = require('express');
const router = express.Router();
const ExamCentre = require('../models/ExamCentre');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/exam-centres
// @desc    Get all exam centres
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { province, status, yearLevel } = req.query;
    
    let query = {};
    
    if (province) query.province = province;
    if (status) query.status = status;
    if (yearLevel) {
      query['availableFor.yearLevel'] = yearLevel;
    }
    
    const examCentres = await ExamCentre.find(query)
      .populate('school', 'schoolName address')
      .populate('approvedBy', 'firstName lastName')
      .sort({ centreName: 1 });
    
    res.json({
      success: true,
      count: examCentres.length,
      data: examCentres
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/exam-centres/:id
// @desc    Get single exam centre
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const examCentre = await ExamCentre.findById(req.params.id)
      .populate('school', 'schoolName address phoneNumber')
      .populate('assignedCandidates', 'candidateId firstName lastName')
      .populate('approvedBy', 'firstName lastName email')
      .populate('notes.createdBy', 'firstName lastName');
    
    if (!examCentre) {
      return res.status(404).json({
        success: false,
        error: 'Exam centre not found'
      });
    }
    
    res.json({
      success: true,
      data: examCentre
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/exam-centres
// @desc    Create new exam centre
// @access  Private (Administrator, Examiner)
router.post('/', protect, authorize('administrator', 'examiner'), async (req, res) => {
  try {
    const examCentre = await ExamCentre.create(req.body);
    
    res.status(201).json({
      success: true,
      data: examCentre
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/exam-centres/:id
// @desc    Update exam centre
// @access  Private (Administrator, Examiner)
router.put('/:id', protect, authorize('administrator', 'examiner'), async (req, res) => {
  try {
    const examCentre = await ExamCentre.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!examCentre) {
      return res.status(404).json({
        success: false,
        error: 'Exam centre not found'
      });
    }
    
    res.json({
      success: true,
      data: examCentre
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/exam-centres/:id/approve
// @desc    Approve exam centre
// @access  Private (Administrator only)
router.put('/:id/approve', protect, authorize('administrator'), async (req, res) => {
  try {
    const examCentre = await ExamCentre.findByIdAndUpdate(
      req.params.id,
      {
        status: 'active',
        approvedBy: req.user.id,
        approvedAt: Date.now()
      },
      { new: true }
    );
    
    if (!examCentre) {
      return res.status(404).json({
        success: false,
        error: 'Exam centre not found'
      });
    }
    
    res.json({
      success: true,
      data: examCentre,
      message: 'Exam centre approved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/exam-centres/:id/notes
// @desc    Add note to exam centre
// @access  Private
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const examCentre = await ExamCentre.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            text: req.body.text,
            createdBy: req.user.id,
            createdAt: Date.now()
          }
        }
      },
      { new: true }
    ).populate('notes.createdBy', 'firstName lastName');
    
    res.json({
      success: true,
      data: examCentre
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/exam-centres/:id/capacity
// @desc    Get exam centre capacity details
// @access  Private
router.get('/:id/capacity', protect, async (req, res) => {
  try {
    const examCentre = await ExamCentre.findById(req.params.id);
    
    if (!examCentre) {
      return res.status(404).json({
        success: false,
        error: 'Exam centre not found'
      });
    }
    
    const assignedCount = examCentre.assignedCandidates.length;
    const availableSeats = examCentre.capacity.totalSeats - assignedCount;
    
    res.json({
      success: true,
      data: {
        totalSeats: examCentre.capacity.totalSeats,
        assignedSeats: assignedCount,
        availableSeats: availableSeats,
        capacityPercentage: ((assignedCount / examCentre.capacity.totalSeats) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
