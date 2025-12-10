const express = require('express');
const router = express.Router();
const SecurityIncident = require('../models/SecurityIncident');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/security-incidents
// @desc    Get all security incidents
// @access  Private (Administrator, Examiner)
router.get('/', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { incidentType, severity, status, yearLevel, startDate, endDate } = req.query;

        let query = {};

        if (incidentType) query.incidentType = incidentType;
        if (severity) query.severity = severity;
        if (status) query.status = status;
        if (yearLevel) query.yearLevel = yearLevel;

        if (startDate && endDate) {
            query.incidentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const incidents = await SecurityIncident.find(query)
            .populate('location.examCentre', 'centreName centreCode')
            .populate('location.school', 'schoolName')
            .populate('assignedInvestigator', 'firstName lastName')
            .sort({ incidentDate: -1 });

        res.json({
            success: true,
            count: incidents.length,
            data: incidents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/security-incidents/:id
// @desc    Get single security incident
// @access  Private (Administrator, Examiner, Investigator)
router.get('/:id', protect, async (req, res) => {
    try {
        const incident = await SecurityIncident.findById(req.params.id)
            .populate('location.examCentre', 'centreName centreCode address')
            .populate('location.school', 'schoolName province')
            .populate('exam', 'title subject yearLevel')
            .populate('assignedInvestigator', 'firstName lastName email')
            .populate('investigationNotes.addedBy', 'firstName lastName')
            .populate('reportedBy.user', 'firstName lastName email');

        if (!incident) {
            return res.status(404).json({
                success: false,
                error: 'Security incident not found'
            });
        }

        // Check access (only admin, examiner, assigned investigator, or reporter)
        const hasAccess = req.user.role === 'administrator' ||
            req.user.role === 'examiner' ||
            (incident.assignedInvestigator && incident.assignedInvestigator._id.toString() === req.user.id) ||
            (incident.reportedBy.user && incident.reportedBy.user._id.toString() === req.user.id);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this incident'
            });
        }

        res.json({
            success: true,
            data: incident
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/security-incidents
// @desc    Report new security incident
// @access  Private (or Anonymous via special route)
router.post('/', protect, upload.array('evidence', 10), async (req, res) => {
    try {
        const incidentData = {
            ...req.body,
            reportedBy: {
                user: req.user.id,
                name: `${req.user.firstName} ${req.user.lastName}`,
                role: req.user.role,
                contactInfo: req.user.email
            },
            status: 'reported'
        };

        // Parse arrays
        if (typeof incidentData.involvedParties === 'string') {
            incidentData.involvedParties = JSON.parse(incidentData.involvedParties);
        }
        if (typeof incidentData.witnesses === 'string') {
            incidentData.witnesses = JSON.parse(incidentData.witnesses);
        }
        if (typeof incidentData.immediateActions === 'string') {
            incidentData.immediateActions = JSON.parse(incidentData.immediateActions);
        }

        // Handle evidence uploads
        if (req.files && req.files.length > 0) {
            incidentData.evidence = req.files.map((file, index) => ({
                type: req.body[`evidenceType_${index}`] || 'Document',
                description: req.body[`evidenceDesc_${index}`] || '',
                filename: file.filename,
                path: file.path,
                uploadedAt: Date.now()
            }));
        }

        const incident = await SecurityIncident.create(incidentData);

        // TODO: Send notification to administrators

        res.status(201).json({
            success: true,
            data: incident,
            message: 'Security incident reported successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/security-incidents/anonymous
// @desc    Report anonymous security incident (whistleblower)
// @access  Public
router.post('/anonymous', upload.array('evidence', 10), async (req, res) => {
    try {
        const incidentData = {
            ...req.body,
            reportedBy: {
                name: 'Anonymous',
                role: 'Whistleblower',
                contactInfo: req.body.contactInfo || 'Not provided'
            },
            isAnonymous: true,
            protectionRequired: true,
            status: 'reported',
            confidentialityLevel: 'highly_confidential'
        };

        // Parse arrays
        if (typeof incidentData.involvedParties === 'string') {
            incidentData.involvedParties = JSON.parse(incidentData.involvedParties);
        }
        if (typeof incidentData.witnesses === 'string') {
            incidentData.witnesses = JSON.parse(incidentData.witnesses);
        }

        // Handle evidence uploads
        if (req.files && req.files.length > 0) {
            incidentData.evidence = req.files.map((file, index) => ({
                type: req.body[`evidenceType_${index}`] || 'Document',
                description: req.body[`evidenceDesc_${index}`] || '',
                filename: file.filename,
                path: file.path,
                uploadedAt: Date.now()
            }));
        }

        const incident = await SecurityIncident.create(incidentData);

        res.status(201).json({
            success: true,
            incidentNumber: incident.incidentNumber,
            message: 'Anonymous report submitted successfully. Your incident number is ' + incident.incidentNumber
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/security-incidents/:id/assign-investigator
// @desc    Assign investigator to incident
// @access  Private (Administrator only)
router.put('/:id/assign-investigator', protect, authorize('administrator'), async (req, res) => {
    try {
        const { investigatorId } = req.body;

        const incident = await SecurityIncident.findByIdAndUpdate(
            req.params.id,
            {
                assignedInvestigator: investigatorId,
                investigationStatus: 'in_progress',
                investigationStartDate: Date.now(),
                status: 'under_investigation'
            },
            { new: true }
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                error: 'Security incident not found'
            });
        }

        res.json({
            success: true,
            data: incident,
            message: 'Investigator assigned successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/security-incidents/:id/investigation-note
// @desc    Add investigation note
// @access  Private (Investigator, Administrator)
router.post('/:id/investigation-note', protect, async (req, res) => {
    try {
        const { note } = req.body;

        const incident = await SecurityIncident.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    investigationNotes: {
                        note,
                        addedBy: req.user.id,
                        addedAt: Date.now()
                    }
                }
            },
            { new: true }
        ).populate('investigationNotes.addedBy', 'firstName lastName');

        if (!incident) {
            return res.status(404).json({
                success: false,
                error: 'Security incident not found'
            });
        }

        res.json({
            success: true,
            data: incident
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/security-incidents/:id/resolve
// @desc    Resolve security incident
// @access  Private (Administrator, Investigator)
router.put('/:id/resolve', protect, async (req, res) => {
    try {
        const { findings, actionsTaken, penalties, resolutionSummary } = req.body;

        const incident = await SecurityIncident.findByIdAndUpdate(
            req.params.id,
            {
                findings,
                actionsTaken: JSON.parse(actionsTaken),
                penalties: penalties ? JSON.parse(penalties) : [],
                resolutionSummary,
                resolutionStatus: 'resolved',
                resolutionDate: Date.now(),
                investigationStatus: 'completed',
                status: 'resolved',
                verified: true,
                conclusionDate: Date.now()
            },
            { new: true }
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                error: 'Security incident not found'
            });
        }

        res.json({
            success: true,
            data: incident,
            message: 'Incident resolved successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/security-incidents/stats/dashboard
// @desc    Get security incident statistics
// @access  Private (Administrator, Examiner)
router.get('/stats/dashboard', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const stats = {
            total: await SecurityIncident.countDocuments(),
            byStatus: {
                reported: await SecurityIncident.countDocuments({ status: 'reported' }),
                underInvestigation: await SecurityIncident.countDocuments({ status: 'under_investigation' }),
                resolved: await SecurityIncident.countDocuments({ status: 'resolved' }),
                closed: await SecurityIncident.countDocuments({ status: 'closed' })
            },
            bySeverity: {
                critical: await SecurityIncident.countDocuments({ severity: 'critical' }),
                high: await SecurityIncident.countDocuments({ severity: 'high' }),
                medium: await SecurityIncident.countDocuments({ severity: 'medium' }),
                low: await SecurityIncident.countDocuments({ severity: 'low' })
            },
            byType: {}
        };

        // Get count by incident type
        const typeAggregation = await SecurityIncident.aggregate([
            { $group: { _id: '$incidentType', count: { $sum: 1 } } }
        ]);

        typeAggregation.forEach(item => {
            stats.byType[item._id] = item.count;
        });

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
