const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Grade = require('../models/Grade');
const Award = require('../models/Award');
const Placement = require('../models/Placement');

// @route   GET /api/students/:id/enrollment
// @desc    Get student enrollment information
// @access  Private
router.get('/:id/enrollment', protect, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.params.id })
            .populate('student', 'firstName lastName email studentId')
            .populate('subjects.teacher', 'firstName lastName')
            .sort('-academicYear');

        res.json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/students/enrollment
// @desc    Create student enrollment
// @access  Private (Admin, Teacher)
router.post('/enrollment', protect, authorize('administrator', 'teacher'), async (req, res) => {
    try {
        const enrollment = await Enrollment.create(req.body);

        res.status(201).json({
            success: true,
            data: enrollment
        });
    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating enrollment',
            error: error.message
        });
    }
});

// @route   GET /api/students/:id/grades
// @desc    Get student grades
// @access  Private
router.get('/:id/grades', protect, async (req, res) => {
    try {
        const { academicYear, term, subject } = req.query;
        const query = { student: req.params.id };

        if (academicYear) query.academicYear = academicYear;
        if (term) query.term = term;
        if (subject) query['subject.subjectCode'] = subject;

        const grades = await Grade.find(query)
            .populate('student', 'firstName lastName studentId')
            .populate('teacher', 'firstName lastName')
            .populate('moderator', 'firstName lastName')
            .sort('-academicYear term');

        // Calculate GPA
        const gpa = grades.reduce((sum, grade) =>
            sum + (grade.finalGrade?.gradePoint || 0), 0
        ) / (grades.length || 1);

        res.json({
            success: true,
            count: grades.length,
            gpa: gpa.toFixed(2),
            data: grades
        });
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/students/grades
// @desc    Create or update student grade
// @access  Private (Teacher, Examiner)
router.post('/grades', protect, authorize('teacher', 'examiner', 'administrator'), async (req, res) => {
    try {
        let grade = await Grade.findOne({
            student: req.body.student,
            'subject.subjectCode': req.body.subject.subjectCode,
            academicYear: req.body.academicYear,
            term: req.body.term
        });

        if (grade) {
            // Update existing grade
            Object.assign(grade, req.body);
            grade.calculateFinalGrade();
            await grade.save();
        } else {
            // Create new grade
            grade = await Grade.create(req.body);
            grade.calculateFinalGrade();
            await grade.save();
        }

        res.status(grade.isNew ? 201 : 200).json({
            success: true,
            data: grade
        });
    } catch (error) {
        console.error('Error creating/updating grade:', error);
        res.status(400).json({
            success: false,
            message: 'Error processing grade',
            error: error.message
        });
    }
});

// @route   GET /api/students/:id/transcript
// @desc    Get student transcript (comprehensive academic record)
// @access  Private
router.get('/:id/transcript', protect, async (req, res) => {
    try {
        const { academicYear } = req.query;

        // Get student info
        const User = require('../models/User');
        const student = await User.findById(req.params.id).select('-password');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get enrollments
        const enrollmentQuery = { student: req.params.id };
        if (academicYear) enrollmentQuery.academicYear = academicYear;

        const enrollments = await Enrollment.find(enrollmentQuery)
            .sort('-academicYear');

        // Get all grades
        const gradeQuery = { student: req.params.id };
        if (academicYear) gradeQuery.academicYear = academicYear;

        const grades = await Grade.find(gradeQuery)
            .populate('teacher', 'firstName lastName')
            .sort('-academicYear term');

        // Get awards
        const awardQuery = { student: req.params.id, status: 'Awarded' };
        if (academicYear) awardQuery.academicYear = academicYear;

        const awards = await Award.find(awardQuery)
            .sort('-awardDate');

        // Get placements
        const placementQuery = { student: req.params.id };
        if (academicYear) placementQuery.academicYear = academicYear;

        const placements = await Placement.find(placementQuery)
            .sort('-academicYear');

        // Calculate overall GPA
        const overallGPA = grades.reduce((sum, grade) =>
            sum + (grade.finalGrade?.gradePoint || 0), 0
        ) / (grades.length || 1);

        // Calculate GPA by academic year
        const gpaByYear = {};
        grades.forEach(grade => {
            if (!gpaByYear[grade.academicYear]) {
                gpaByYear[grade.academicYear] = { total: 0, count: 0 };
            }
            gpaByYear[grade.academicYear].total += grade.finalGrade?.gradePoint || 0;
            gpaByYear[grade.academicYear].count += 1;
        });

        Object.keys(gpaByYear).forEach(year => {
            gpaByYear[year] = (gpaByYear[year].total / gpaByYear[year].count).toFixed(2);
        });

        // Group grades by subject
        const subjectSummary = {};
        grades.forEach(grade => {
            const subjectCode = grade.subject.subjectCode;
            if (!subjectSummary[subjectCode]) {
                subjectSummary[subjectCode] = {
                    subjectName: grade.subject.subjectName,
                    grades: []
                };
            }
            subjectSummary[subjectCode].grades.push({
                term: grade.term,
                year: grade.academicYear,
                grade: grade.finalGrade?.grade,
                percentage: grade.finalGrade?.percentage,
                status: grade.finalGrade?.status
            });
        });

        res.json({
            success: true,
            transcript: {
                student: {
                    id: student._id,
                    name: `${student.firstName} ${student.lastName}`,
                    email: student.email,
                    studentId: student.studentId,
                    grade: student.grade,
                    school: student.school
                },
                academicSummary: {
                    overallGPA: overallGPA.toFixed(2),
                    gpaByYear,
                    totalCredits: grades.length,
                    subjectsCompleted: Object.keys(subjectSummary).length
                },
                enrollments,
                grades,
                subjectSummary,
                awards,
                placements,
                generatedDate: new Date()
            }
        });
    } catch (error) {
        console.error('Error generating transcript:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/students/:id/placement
// @desc    Get student placement information
// @access  Private
router.get('/:id/placement', protect, async (req, res) => {
    try {
        const placements = await Placement.find({ student: req.params.id })
            .populate('student', 'firstName lastName studentId')
            .populate('counselor', 'firstName lastName')
            .sort('-academicYear');

        res.json({
            success: true,
            count: placements.length,
            data: placements
        });
    } catch (error) {
        console.error('Error fetching placements:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/students/placement
// @desc    Create student placement record
// @access  Private (Admin, Counselor)
router.post('/placement', protect, authorize('administrator', 'teacher'), async (req, res) => {
    try {
        const placement = await Placement.create(req.body);

        res.status(201).json({
            success: true,
            data: placement
        });
    } catch (error) {
        console.error('Error creating placement:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating placement',
            error: error.message
        });
    }
});

// @route   GET /api/students/:id/awards
// @desc    Get student awards
// @access  Private
router.get('/:id/awards', protect, async (req, res) => {
    try {
        const { academicYear, awardType } = req.query;
        const query = { student: req.params.id };

        if (academicYear) query.academicYear = academicYear;
        if (awardType) query.awardType = awardType;

        const awards = await Award.find(query)
            .populate('student', 'firstName lastName studentId')
            .populate('awardedBy', 'firstName lastName')
            .populate('approvedBy', 'firstName lastName')
            .sort('-awardDate');

        res.json({
            success: true,
            count: awards.length,
            data: awards
        });
    } catch (error) {
        console.error('Error fetching awards:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/students/awards
// @desc    Create student award
// @access  Private (Admin, Teacher)
router.post('/awards', protect, authorize('administrator', 'teacher'), async (req, res) => {
    try {
        const award = await Award.create({
            ...req.body,
            awardedBy: req.user._id
        });

        // Check if student meets criteria
        await award.checkCriteria();
        await award.save();

        res.status(201).json({
            success: true,
            data: award
        });
    } catch (error) {
        console.error('Error creating award:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating award',
            error: error.message
        });
    }
});

module.exports = router;
