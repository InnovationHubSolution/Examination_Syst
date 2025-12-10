const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/support
// @desc    Get all support tickets
// @access  Private (Support staff, Admin)
router.get('/', protect, authorize('administrator', 'support_staff'), async (req, res) => {
    try {
        const { status, priority, category, assignedTo, department } = req.query;

        let query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        if (assignedTo) query.assignedTo = assignedTo;
        if (department) query.department = department;

        const tickets = await SupportTicket.find(query)
            .populate('submittedBy.user', 'firstName lastName email')
            .populate('assignedTo', 'firstName lastName')
            .sort({ priority: -1, createdAt: -1 });

        res.json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/support/my-tickets
// @desc    Get user's support tickets
// @access  Private
router.get('/my-tickets', protect, async (req, res) => {
    try {
        const tickets = await SupportTicket.find({
            'submittedBy.user': req.user.id
        })
            .populate('assignedTo', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/support/:id
// @desc    Get single support ticket
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('submittedBy.user', 'firstName lastName email phoneNumber')
            .populate('assignedTo', 'firstName lastName email')
            .populate('messages.sender', 'firstName lastName')
            .populate('resolution.resolvedBy', 'firstName lastName');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Support ticket not found'
            });
        }

        // Check access
        const hasAccess = req.user.role === 'administrator' ||
            req.user.role === 'support_staff' ||
            (ticket.submittedBy.user && ticket.submittedBy.user._id.toString() === req.user.id) ||
            (ticket.assignedTo && ticket.assignedTo._id.toString() === req.user.id);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this ticket'
            });
        }

        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/support
// @desc    Create new support ticket
// @access  Private
router.post('/', protect, upload.array('attachments', 5), async (req, res) => {
    try {
        const ticketData = {
            ...req.body,
            submittedBy: {
                user: req.user.id,
                name: `${req.user.firstName} ${req.user.lastName}`,
                email: req.user.email,
                phone: req.user.phoneNumber,
                role: req.user.role
            },
            status: 'new',
            source: 'Web Portal',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Handle attachments
        if (req.files && req.files.length > 0) {
            ticketData.attachments = req.files.map(file => ({
                filename: file.filename,
                path: file.path,
                fileType: file.mimetype,
                size: file.size,
                uploadedBy: req.user.id,
                uploadedAt: Date.now()
            }));
        }

        const ticket = await SupportTicket.create(ticketData);

        // TODO: Send notification to support team

        res.status(201).json({
            success: true,
            data: ticket,
            message: `Support ticket created successfully. Your ticket number is ${ticket.ticketNumber}`
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/support/:id/message
// @desc    Add message to ticket
// @access  Private
router.post('/:id/message', protect, upload.array('attachments', 5), async (req, res) => {
    try {
        const { message, isInternal } = req.body;

        const messageData = {
            sender: req.user.id,
            senderName: `${req.user.firstName} ${req.user.lastName}`,
            senderType: req.user.role === 'administrator' || req.user.role === 'support_staff' ? 'support' : 'user',
            message,
            isInternal: isInternal === 'true',
            createdAt: Date.now()
        };

        // Handle attachments
        if (req.files && req.files.length > 0) {
            messageData.attachments = req.files.map(file => ({
                filename: file.filename,
                path: file.path,
                uploadedAt: Date.now()
            }));
        }

        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            {
                $push: { messages: messageData },
                status: messageData.senderType === 'support' ? 'pending_user' : 'open'
            },
            { new: true }
        ).populate('messages.sender', 'firstName lastName');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Support ticket not found'
            });
        }

        // Calculate first response time if this is the first support message
        if (messageData.senderType === 'support' && !ticket.firstResponseTime) {
            const createdTime = new Date(ticket.createdAt).getTime();
            const responseTime = Date.now();
            ticket.firstResponseTime = Math.floor((responseTime - createdTime) / 60000); // in minutes
            await ticket.save();
        }

        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/support/:id/assign
// @desc    Assign ticket to support staff
// @access  Private (Administrator, Support Staff)
router.put('/:id/assign', protect, authorize('administrator', 'support_staff'), async (req, res) => {
    try {
        const { assignedTo, department } = req.body;

        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            {
                assignedTo,
                department,
                assignedAt: Date.now(),
                status: 'in_progress'
            },
            { new: true }
        ).populate('assignedTo', 'firstName lastName email');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Support ticket not found'
            });
        }

        res.json({
            success: true,
            data: ticket,
            message: 'Ticket assigned successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/support/:id/resolve
// @desc    Resolve support ticket
// @access  Private (Support Staff, Administrator)
router.put('/:id/resolve', protect, authorize('administrator', 'support_staff'), async (req, res) => {
    try {
        const { resolutionNotes, resolutionType } = req.body;

        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Support ticket not found'
            });
        }

        // Calculate resolution time
        const createdTime = new Date(ticket.createdAt).getTime();
        const resolutionTime = Date.now();
        const resolutionMinutes = Math.floor((resolutionTime - createdTime) / 60000);

        ticket.resolution = {
            resolvedBy: req.user.id,
            resolvedAt: Date.now(),
            resolutionNotes,
            resolutionType
        };
        ticket.status = 'resolved';
        ticket.resolutionTime = resolutionMinutes;

        await ticket.save();

        res.json({
            success: true,
            data: ticket,
            message: 'Ticket resolved successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/support/:id/close
// @desc    Close support ticket
// @access  Private (Support Staff, Administrator)
router.put('/:id/close', protect, authorize('administrator', 'support_staff'), async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            { status: 'closed' },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Support ticket not found'
            });
        }

        res.json({
            success: true,
            data: ticket,
            message: 'Ticket closed successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/support/:id/rate
// @desc    Rate support ticket satisfaction
// @access  Private
router.post('/:id/rate', protect, async (req, res) => {
    try {
        const { rating, feedback } = req.body;

        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Support ticket not found'
            });
        }

        // Check if user is the ticket submitter
        if (ticket.submittedBy.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Only the ticket submitter can rate the support'
            });
        }

        ticket.satisfactionRating = {
            rating,
            feedback,
            ratedAt: Date.now()
        };

        await ticket.save();

        res.json({
            success: true,
            message: 'Thank you for your feedback'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/support/stats/dashboard
// @desc    Get support ticket statistics
// @access  Private (Administrator, Support Staff)
router.get('/stats/dashboard', protect, authorize('administrator', 'support_staff'), async (req, res) => {
    try {
        const now = new Date();
        const stats = {
            total: await SupportTicket.countDocuments(),
            byStatus: {
                new: await SupportTicket.countDocuments({ status: 'new' }),
                open: await SupportTicket.countDocuments({ status: 'open' }),
                inProgress: await SupportTicket.countDocuments({ status: 'in_progress' }),
                pending: await SupportTicket.countDocuments({ status: { $in: ['pending_user', 'pending_internal'] } }),
                resolved: await SupportTicket.countDocuments({ status: 'resolved' }),
                closed: await SupportTicket.countDocuments({ status: 'closed' })
            },
            byPriority: {
                urgent: await SupportTicket.countDocuments({ priority: 'urgent', status: { $nin: ['resolved', 'closed'] } }),
                high: await SupportTicket.countDocuments({ priority: 'high', status: { $nin: ['resolved', 'closed'] } }),
                normal: await SupportTicket.countDocuments({ priority: 'normal', status: { $nin: ['resolved', 'closed'] } }),
                low: await SupportTicket.countDocuments({ priority: 'low', status: { $nin: ['resolved', 'closed'] } })
            },
            slaBreached: await SupportTicket.countDocuments({
                'sla.isBreached': true,
                status: { $nin: ['resolved', 'closed'] }
            }),
            avgResolutionTime: 0,
            avgSatisfactionRating: 0
        };

        // Calculate average resolution time
        const resolvedTickets = await SupportTicket.find({
            status: { $in: ['resolved', 'closed'] },
            resolutionTime: { $exists: true }
        }).select('resolutionTime');

        if (resolvedTickets.length > 0) {
            const totalTime = resolvedTickets.reduce((sum, t) => sum + t.resolutionTime, 0);
            stats.avgResolutionTime = Math.round(totalTime / resolvedTickets.length);
        }

        // Calculate average satisfaction rating
        const ratedTickets = await SupportTicket.find({
            'satisfactionRating.rating': { $exists: true }
        }).select('satisfactionRating.rating');

        if (ratedTickets.length > 0) {
            const totalRating = ratedTickets.reduce((sum, t) => sum + t.satisfactionRating.rating, 0);
            stats.avgSatisfactionRating = (totalRating / ratedTickets.length).toFixed(2);
        }

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
