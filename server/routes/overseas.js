const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const OverseasStudent = require('../models/OverseasStudent');

// @route   GET /api/overseas
// @desc    Get all overseas students with filters
// @access  Private (Admin, Teacher, Examiner)
router.get('/', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const {
            studyCountry,
            yearLevel,
            academicYear,
            applicationStatus,
            eligibilityStatus
        } = req.query;

        const query = {};

        if (studyCountry) query['currentStudy.studyCountry'] = studyCountry;
        if (yearLevel) query['currentStudy.yearLevel'] = yearLevel;
        if (academicYear) query.academicYear = academicYear;
        if (applicationStatus) query['scholarshipApplication.applicationStatus'] = applicationStatus;
        if (eligibilityStatus) query['scholarshipApplication.eligibilityStatus'] = eligibilityStatus;

        const students = await OverseasStudent.find(query)
            .populate('student', 'firstName lastName email')
            .populate('scholarshipApplication.scholarshipId')
            .sort('-createdAt');

        // Calculate statistics
        const stats = {
            total: students.length,
            byCountry: {
                Fiji: students.filter(s => s.currentStudy.studyCountry === 'Fiji').length,
                'New Caledonia': students.filter(s => s.currentStudy.studyCountry === 'New Caledonia').length,
                'New Zealand': students.filter(s => s.currentStudy.studyCountry === 'New Zealand').length,
                Australia: students.filter(s => s.currentStudy.studyCountry === 'Australia').length,
                Other: students.filter(s => s.currentStudy.studyCountry === 'Other').length
            },
            byYearLevel: {
                'Year 12': students.filter(s => s.currentStudy.yearLevel === 'Year 12').length,
                'Year 13': students.filter(s => s.currentStudy.yearLevel === 'Year 13').length
            },
            applications: {
                applied: students.filter(s => s.scholarshipApplication.hasApplied).length,
                submitted: students.filter(s => s.scholarshipApplication.applicationStatus === 'Submitted').length,
                underReview: students.filter(s => s.scholarshipApplication.applicationStatus === 'Under Review').length,
                approved: students.filter(s => s.scholarshipApplication.applicationStatus === 'Approved').length
            }
        };

        res.json({
            success: true,
            count: students.length,
            stats,
            data: students
        });
    } catch (error) {
        console.error('Error fetching overseas students:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/overseas/:id
// @desc    Get single overseas student
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const student = await OverseasStudent.findById(req.params.id)
            .populate('student', 'firstName lastName email studentId')
            .populate('scholarshipApplication.scholarshipId')
            .populate('documents.verifiedBy', 'firstName lastName')
            .populate('communications.handledBy', 'firstName lastName');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Overseas student record not found'
            });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Error fetching overseas student:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/overseas
// @desc    Create new overseas student information form
// @access  Private (Student, Admin)
router.post('/', protect, async (req, res) => {
    try {
        // Check if student already has a record for this academic year
        const existingRecord = await OverseasStudent.findOne({
            student: req.body.student || req.user._id,
            academicYear: req.body.academicYear
        });

        if (existingRecord) {
            return res.status(400).json({
                success: false,
                message: 'Information form already exists for this academic year'
            });
        }

        const overseasStudent = await OverseasStudent.create({
            ...req.body,
            student: req.body.student || req.user._id
        });

        const populatedStudent = await OverseasStudent.findById(overseasStudent._id)
            .populate('student', 'firstName lastName email');

        res.status(201).json({
            success: true,
            data: populatedStudent,
            message: 'Overseas student information form created successfully'
        });
    } catch (error) {
        console.error('Error creating overseas student record:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating overseas student record',
            error: error.message
        });
    }
});

// @route   PUT /api/overseas/:id
// @desc    Update overseas student information
// @access  Private (Student owns, Admin)
router.put('/:id', protect, async (req, res) => {
    try {
        const student = await OverseasStudent.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Overseas student record not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'administrator' &&
            student.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this record'
            });
        }

        Object.assign(student, req.body);
        await student.save();

        const populatedStudent = await OverseasStudent.findById(student._id)
            .populate('student', 'firstName lastName email');

        res.json({
            success: true,
            data: populatedStudent,
            message: 'Overseas student information updated successfully'
        });
    } catch (error) {
        console.error('Error updating overseas student record:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating overseas student record',
            error: error.message
        });
    }
});

// @route   POST /api/overseas/:id/submit
// @desc    Submit information form
// @access  Private (Student owns, Admin)
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const student = await OverseasStudent.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Overseas student record not found'
            });
        }

        // Check completeness
        const completeness = student.checkCompleteness();

        if (!completeness.isComplete) {
            return res.status(400).json({
                success: false,
                message: 'Information form is incomplete',
                missingItems: completeness.missingItems
            });
        }

        student.submissionStatus.formSubmitted = true;
        student.submissionStatus.submissionDate = new Date();

        await student.save();

        res.json({
            success: true,
            data: student,
            message: 'Information form submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/overseas/:id/check-completeness
// @desc    Check if form is complete
// @access  Private
router.post('/:id/check-completeness', protect, async (req, res) => {
    try {
        const student = await OverseasStudent.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Overseas student record not found'
            });
        }

        const completeness = student.checkCompleteness();

        student.submissionStatus.completenessCheck.checkedBy = req.user._id;
        student.submissionStatus.completenessCheck.checkDate = new Date();
        await student.save();

        res.json({
            success: true,
            data: completeness
        });
    } catch (error) {
        console.error('Error checking completeness:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/overseas/:id/assess-eligibility
// @desc    Assess scholarship eligibility based on results
// @access  Private (Admin, Examiner)
router.post('/:id/assess-eligibility', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const student = await OverseasStudent.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Overseas student record not found'
            });
        }

        const eligibility = await student.assessEligibility();
        await student.save();

        res.json({
            success: true,
            data: {
                student: student,
                eligibility: eligibility
            },
            message: 'Eligibility assessment completed'
        });
    } catch (error) {
        console.error('Error assessing eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/overseas/country/:country
// @desc    Get students by study country
// @access  Private (Admin, Teacher, Examiner)
router.get('/country/:country', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;

        const students = await OverseasStudent.getByCountry(req.params.country, academicYear);

        res.json({
            success: true,
            count: students.length,
            country: req.params.country,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students by country:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/overseas/applications/pending
// @desc    Get pending scholarship applications
// @access  Private (Admin, Examiner)
router.get('/applications/pending', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear } = req.query;

        const applications = await OverseasStudent.getPendingApplications(academicYear);

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error('Error fetching pending applications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/overseas/:id/communication
// @desc    Add communication log entry
// @access  Private (Admin, Teacher, Examiner)
router.post('/:id/communication', protect, authorize('administrator', 'teacher', 'examiner'), async (req, res) => {
    try {
        const student = await OverseasStudent.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Overseas student record not found'
            });
        }

        student.communications.push({
            ...req.body,
            handledBy: req.user._id,
            date: new Date()
        });

        await student.save();

        const populatedStudent = await OverseasStudent.findById(student._id)
            .populate('communications.handledBy', 'firstName lastName');

        res.json({
            success: true,
            data: populatedStudent,
            message: 'Communication log added successfully'
        });
    } catch (error) {
        console.error('Error adding communication log:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/overseas/:id
// @desc    Delete overseas student record
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('administrator'), async (req, res) => {
    try {
        const student = await OverseasStudent.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Overseas student record not found'
            });
        }

        await student.deleteOne();

        res.json({
            success: true,
            message: 'Overseas student record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting overseas student record:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
