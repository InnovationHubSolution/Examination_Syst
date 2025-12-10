const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const School = require('../models/School');
const ExamCentre = require('../models/ExamCentre');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/candidates
// @desc    Get all candidates with filters
// @access  Private (Administrator, Examiner, Provincial Officer)
router.get('/', protect, authorize('administrator', 'examiner', 'provincial_officer'), async (req, res) => {
    try {
        const { school, yearLevel, examYear, registrationStatus, province, specialNeeds } = req.query;

        let query = {};

        if (school) query.school = school;
        if (yearLevel) query.yearLevel = yearLevel;
        if (examYear) query.examYear = examYear;
        if (registrationStatus) query.registrationStatus = registrationStatus;
        if (specialNeeds === 'true') query['specialNeeds.hasSpecialNeeds'] = true;

        // Provincial officers can only see candidates from their province
        if (req.user.role === 'provincial_officer' && req.user.province) {
            const schools = await School.find({ province: req.user.province });
            query.school = { $in: schools.map(s => s._id) };
        }

        const candidates = await Candidate.find(query)
            .populate('school', 'schoolName province')
            .populate('examCentre', 'centreName centreCode')
            .populate('verifiedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: candidates.length,
            data: candidates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/candidates/:id
// @desc    Get single candidate
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id)
            .populate('school', 'schoolName province island')
            .populate('examCentre', 'centreName centreCode address')
            .populate('verifiedBy', 'firstName lastName email')
            .populate('notes.createdBy', 'firstName lastName');

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        res.json({
            success: true,
            data: candidate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/candidates
// @desc    Register new candidate
// @access  Private (Teacher, School Admin)
router.post('/', protect, authorize('teacher', 'administrator', 'school_admin'), upload.fields([
    { name: 'candidatePhoto', maxCount: 1 },
    { name: 'identificationDocument', maxCount: 1 },
    { name: 'supportingDocuments', maxCount: 5 }
]), async (req, res) => {
    try {
        const candidateData = {
            ...req.body,
            createdBy: req.user.id
        };

        // Parse subjects array if sent as string
        if (typeof candidateData.subjects === 'string') {
            candidateData.subjects = JSON.parse(candidateData.subjects);
        }

        // Handle special needs
        if (req.body.hasSpecialNeeds === 'true') {
            candidateData.specialNeeds = {
                hasSpecialNeeds: true,
                needsType: Array.isArray(req.body.needsType) ? req.body.needsType : [req.body.needsType],
                accommodations: Array.isArray(req.body.accommodations) ? req.body.accommodations : [req.body.accommodations]
            };
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.candidatePhoto) {
                candidateData.candidatePhoto = {
                    filename: req.files.candidatePhoto[0].filename,
                    path: req.files.candidatePhoto[0].path
                };
            }

            if (req.files.identificationDocument) {
                candidateData.identificationDocument = {
                    filename: req.files.identificationDocument[0].filename,
                    path: req.files.identificationDocument[0].path
                };
            }

            if (req.files.supportingDocuments) {
                candidateData.specialNeeds.supportingDocuments = req.files.supportingDocuments.map(file => ({
                    filename: file.filename,
                    path: file.path,
                    uploadedAt: new Date()
                }));
            }
        }

        const candidate = await Candidate.create(candidateData);

        res.status(201).json({
            success: true,
            data: candidate
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/candidates/:id
// @desc    Update candidate
// @access  Private
router.put('/:id', protect, upload.fields([
    { name: 'candidatePhoto', maxCount: 1 },
    { name: 'identificationDocument', maxCount: 1 }
]), async (req, res) => {
    try {
        let candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.candidatePhoto) {
                req.body.candidatePhoto = {
                    filename: req.files.candidatePhoto[0].filename,
                    path: req.files.candidatePhoto[0].path
                };
            }

            if (req.files.identificationDocument) {
                req.body.identificationDocument = {
                    filename: req.files.identificationDocument[0].filename,
                    path: req.files.identificationDocument[0].path
                };
            }
        }

        candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: candidate
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/candidates/:id/verify
// @desc    Verify candidate registration
// @access  Private (Administrator, Provincial Officer)
router.put('/:id/verify', protect, authorize('administrator', 'provincial_officer'), async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            {
                registrationStatus: 'verified',
                verificationDate: Date.now(),
                verifiedBy: req.user.id
            },
            { new: true }
        );

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        res.json({
            success: true,
            data: candidate,
            message: 'Candidate registration verified successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/candidates/:id/assign-centre
// @desc    Assign candidate to exam centre
// @access  Private (Administrator, Examiner)
router.put('/:id/assign-centre', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { examCentreId } = req.body;

        const examCentre = await ExamCentre.findById(examCentreId);
        if (!examCentre) {
            return res.status(404).json({
                success: false,
                error: 'Exam centre not found'
            });
        }

        // Check capacity
        const assignedCount = await Candidate.countDocuments({ examCentre: examCentreId });
        if (assignedCount >= examCentre.capacity.totalSeats) {
            return res.status(400).json({
                success: false,
                error: 'Exam centre is at full capacity'
            });
        }

        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { examCentre: examCentreId },
            { new: true }
        );

        // Add candidate to exam centre's assigned candidates
        await ExamCentre.findByIdAndUpdate(
            examCentreId,
            { $addToSet: { assignedCandidates: candidate._id } }
        );

        res.json({
            success: true,
            data: candidate,
            message: 'Candidate assigned to exam centre successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/candidates/:id/notes
// @desc    Add note to candidate
// @access  Private
router.post('/:id/notes', protect, async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(
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
            data: candidate
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/candidates/export/list
// @desc    Export candidates list
// @access  Private (Administrator, Examiner)
router.get('/export/list', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { yearLevel, examYear } = req.query;

        const candidates = await Candidate.find({ yearLevel, examYear })
            .populate('school', 'schoolName')
            .populate('examCentre', 'centreName')
            .sort({ candidateId: 1 });

        res.json({
            success: true,
            count: candidates.length,
            data: candidates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
