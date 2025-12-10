const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/submissions
// @desc    Get all submissions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { assessment, student, status } = req.query;
        const query = {};

        if (assessment) query.assessment = assessment;
        if (status) query.status = status;

        // Students can only see their own submissions
        if (req.user.role === 'student') {
            query.student = req.user.id;
        } else if (student) {
            query.student = student;
        }

        const submissions = await Submission.find(query)
            .populate('assessment', 'title dueDate totalMarks')
            .populate('student', 'firstName lastName studentId')
            .populate('grade.gradedBy', 'firstName lastName')
            .sort({ submittedAt: -1 });

        res.json({
            success: true,
            count: submissions.length,
            submissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching submissions',
            error: error.message
        });
    }
});

// @route   GET /api/submissions/:id
// @desc    Get single submission
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('assessment', 'title dueDate totalMarks rubric')
            .populate('student', 'firstName lastName studentId email')
            .populate('grade.gradedBy', 'firstName lastName');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Check access rights
        if (req.user.role === 'student' && submission.student._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this submission'
            });
        }

        res.json({
            success: true,
            submission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching submission',
            error: error.message
        });
    }
});

// @route   POST /api/submissions
// @desc    Submit assessment
// @access  Private/Student
router.post('/', protect, authorize('student'), upload.array('files', 5), async (req, res) => {
    try {
        const { assessmentId, textContent } = req.body;

        // Check if assessment exists
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }

        // Check if already submitted
        const existingSubmission = await Submission.findOne({
            assessment: assessmentId,
            student: req.user.id
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted this assessment'
            });
        }

        // Check if late
        const isLate = new Date() > new Date(assessment.dueDate);
        if (isLate && !assessment.allowLateSubmission) {
            return res.status(400).json({
                success: false,
                message: 'Late submissions are not allowed for this assessment'
            });
        }

        const submissionData = {
            assessment: assessmentId,
            student: req.user.id,
            textContent,
            isLate,
            status: isLate ? 'late' : 'submitted'
        };

        // Apply late penalty if applicable
        if (isLate && assessment.lateSubmissionPenalty > 0) {
            submissionData.penaltyApplied = assessment.lateSubmissionPenalty;
        }

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            submissionData.files = req.files.map(file => ({
                filename: file.originalname,
                path: file.path,
                fileType: file.mimetype,
                size: file.size,
                uploadedAt: Date.now()
            }));
        }

        const submission = await Submission.create(submissionData);

        // Notify teacher via socket
        const io = req.app.get('io');
        if (io) {
            io.emit('new_submission', {
                submission: submission._id,
                assessment: assessment.title,
                student: req.user.firstName + ' ' + req.user.lastName
            });
        }

        res.status(201).json({
            success: true,
            message: 'Submission successful',
            submission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting assessment',
            error: error.message
        });
    }
});

// @route   PUT /api/submissions/:id/grade
// @desc    Grade submission
// @access  Private/Teacher/Admin
router.put('/:id/grade', protect, authorize('teacher', 'administrator'), async (req, res) => {
    try {
        const { score, feedback, rubricScores, letterGrade } = req.body;

        const submission = await Submission.findById(req.params.id)
            .populate('assessment');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Calculate percentage
        const totalMarks = submission.assessment.totalMarks;
        let finalScore = score;

        // Apply penalty if late
        if (submission.penaltyApplied > 0) {
            finalScore = score - (score * submission.penaltyApplied / 100);
        }

        const percentage = (finalScore / totalMarks) * 100;

        submission.grade = {
            score: finalScore,
            percentage,
            letterGrade: letterGrade || calculateLetterGrade(percentage),
            feedback,
            rubricScores,
            gradedBy: req.user.id,
            gradedAt: Date.now()
        };

        submission.status = 'graded';
        await submission.save();

        // Notify student via socket
        const io = req.app.get('io');
        if (io) {
            io.emit('submission_graded', {
                submission: submission._id,
                student: submission.student
            });
        }

        res.json({
            success: true,
            message: 'Submission graded successfully',
            submission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error grading submission',
            error: error.message
        });
    }
});

// @route   GET /api/submissions/student/:studentId/progress
// @desc    Get student submission progress
// @access  Private
router.get('/student/:studentId/progress', protect, async (req, res) => {
    try {
        const submissions = await Submission.find({ student: req.params.studentId })
            .populate('assessment', 'title subject grade dueDate totalMarks')
            .sort({ submittedAt: -1 });

        const stats = {
            total: submissions.length,
            graded: submissions.filter(s => s.status === 'graded').length,
            pending: submissions.filter(s => s.status === 'submitted').length,
            late: submissions.filter(s => s.isLate).length,
            averageScore: 0
        };

        const gradedSubmissions = submissions.filter(s => s.grade && s.grade.percentage);
        if (gradedSubmissions.length > 0) {
            const total = gradedSubmissions.reduce((sum, s) => sum + s.grade.percentage, 0);
            stats.averageScore = (total / gradedSubmissions.length).toFixed(2);
        }

        res.json({
            success: true,
            stats,
            submissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching progress',
            error: error.message
        });
    }
});

// Helper function to calculate letter grade
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
