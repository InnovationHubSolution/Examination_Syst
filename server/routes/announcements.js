const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, priority } = req.query;
    const query = {
      isPublished: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: new Date() } }
      ]
    };

    // Filter by target audience
    query.$or.push(
      { targetAudience: 'all' },
      { targetAudience: req.user.role }
    );

    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Filter by grade if student
    if (req.user.role === 'student' && req.user.grade) {
      query.$or.push(
        { targetGrades: { $size: 0 } },
        { targetGrades: req.user.grade }
      );
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ isPinned: -1, publishDate: -1 });

    res.json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Mark as read
    const alreadyRead = announcement.readBy.some(
      r => r.user.toString() === req.user.id
    );

    if (!alreadyRead) {
      announcement.readBy.push({
        user: req.user.id,
        readAt: Date.now()
      });
      await announcement.save();
    }

    // Increment view count
    announcement.viewCount += 1;
    await announcement.save();

    res.json({
      success: true,
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
});

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private/Admin/Teacher
router.post('/', protect, authorize('administrator', 'teacher'), upload.array('attachments', 5), async (req, res) => {
  try {
    const announcementData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      announcementData.attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        fileType: file.mimetype
      }));
    }

    // Parse arrays if they're strings
    if (typeof req.body.targetAudience === 'string') {
      announcementData.targetAudience = req.body.targetAudience.split(',');
    }
    if (typeof req.body.targetGrades === 'string') {
      announcementData.targetGrades = req.body.targetGrades.split(',');
    }
    if (typeof req.body.targetSubjects === 'string') {
      announcementData.targetSubjects = req.body.targetSubjects.split(',');
    }

    const announcement = await Announcement.create(announcementData);

    // Send real-time notification
    const io = req.app.get('io');
    if (announcement.isPublished && io) {
      io.emit('new_announcement', {
        id: announcement._id,
        title: announcement.title,
        category: announcement.category,
        priority: announcement.priority
      });
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private/Admin
router.put('/:id', protect, authorize('administrator', 'teacher'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private/Admin
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
});

// @route   GET /api/announcements/user/unread
// @desc    Get unread announcements count
// @access  Private
router.get('/user/unread', protect, async (req, res) => {
  try {
    const count = await Announcement.countDocuments({
      isPublished: true,
      readBy: { $not: { $elemMatch: { user: req.user.id } } },
      $or: [
        { targetAudience: 'all' },
        { targetAudience: req.user.role }
      ]
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

module.exports = router;
