const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/policies
// @desc    Get all policies with filters
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { policyType, status, archiveYear, targetAudience } = req.query;

        let query = {};

        if (policyType) query.policyType = policyType;
        if (status) query.status = status;
        else query.status = 'active'; // Default to active policies
        if (archiveYear) query.archiveYear = archiveYear;
        if (targetAudience) query.targetAudience = targetAudience;

        const policies = await Policy.find(query)
            .populate('approvedBy', 'firstName lastName')
            .populate('createdBy', 'firstName lastName')
            .sort({ isPinned: -1, isUrgent: -1, createdAt: -1 });

        res.json({
            success: true,
            count: policies.length,
            data: policies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/policies/archive/:year
// @desc    Get archived policies by year
// @access  Private
router.get('/archive/:year', protect, async (req, res) => {
    try {
        const policies = await Policy.find({
            archiveYear: req.params.year,
            status: 'archived'
        }).sort({ policyType: 1, createdAt: -1 });

        res.json({
            success: true,
            count: policies.length,
            year: req.params.year,
            data: policies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/policies/:id
// @desc    Get single policy
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id)
            .populate('approvedBy', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName')
            .populate('relatedPolicies', 'policyNumber title policyType');

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'Policy not found'
            });
        }

        // Increment view count
        policy.viewCount += 1;
        await policy.save();

        res.json({
            success: true,
            data: policy
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/policies
// @desc    Create new policy
// @access  Private (Administrator only)
router.post('/', protect, authorize('administrator'), upload.array('documents', 10), async (req, res) => {
    try {
        const policyData = {
            ...req.body,
            createdBy: req.user.id,
            status: 'draft'
        };

        // Parse arrays if sent as strings
        if (typeof policyData.targetAudience === 'string') {
            policyData.targetAudience = policyData.targetAudience.split(',').map(a => a.trim());
        }
        if (typeof policyData.keywords === 'string') {
            policyData.keywords = policyData.keywords.split(',').map(k => k.trim());
        }

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            policyData.documents = req.files.map((file, index) => ({
                title: req.body[`docTitle_${index}`] || file.originalname,
                filename: file.filename,
                path: file.path,
                fileType: file.mimetype,
                size: file.size,
                uploadedAt: Date.now()
            }));
        }

        const policy = await Policy.create(policyData);

        res.status(201).json({
            success: true,
            data: policy
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/policies/:id
// @desc    Update policy
// @access  Private (Administrator only)
router.put('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const policy = await Policy.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'Policy not found'
            });
        }

        res.json({
            success: true,
            data: policy
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/policies/:id/approve
// @desc    Approve and activate policy
// @access  Private (Administrator only)
router.put('/:id/approve', protect, authorize('administrator'), async (req, res) => {
    try {
        const policy = await Policy.findByIdAndUpdate(
            req.params.id,
            {
                status: 'active',
                approvedBy: req.user.id,
                approvedAt: Date.now()
            },
            { new: true }
        );

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'Policy not found'
            });
        }

        res.json({
            success: true,
            data: policy,
            message: 'Policy approved and activated'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/policies/:id/archive
// @desc    Archive policy
// @access  Private (Administrator only)
router.put('/:id/archive', protect, authorize('administrator'), async (req, res) => {
    try {
        const { archiveYear, reason } = req.body;

        const policy = await Policy.findByIdAndUpdate(
            req.params.id,
            {
                status: 'archived',
                archiveYear: archiveYear || new Date().getFullYear().toString(),
                $push: {
                    previousVersions: {
                        version: policy.version,
                        archivedAt: Date.now(),
                        archivedBy: req.user.id,
                        reason
                    }
                }
            },
            { new: true }
        );

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'Policy not found'
            });
        }

        res.json({
            success: true,
            data: policy,
            message: 'Policy archived successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/policies/:id/acknowledge
// @desc    Acknowledge policy reading
// @access  Private
router.post('/:id/acknowledge', protect, async (req, res) => {
    try {
        const policy = await Policy.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    acknowledgements: {
                        user: req.user.id,
                        acknowledgedAt: Date.now(),
                        ipAddress: req.ip
                    }
                }
            },
            { new: true }
        );

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'Policy not found'
            });
        }

        res.json({
            success: true,
            message: 'Policy acknowledged successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/policies/user/pending-acknowledgements
// @desc    Get policies requiring user acknowledgement
// @access  Private
router.get('/user/pending-acknowledgements', protect, async (req, res) => {
    try {
        const policies = await Policy.find({
            status: 'active',
            requiresAcknowledgement: true,
            'acknowledgements.user': { $ne: req.user.id }
        }).select('policyNumber title policyType effectiveFrom');

        res.json({
            success: true,
            count: policies.length,
            data: policies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
