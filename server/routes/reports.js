const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// @route   GET /api/reports/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin/Teacher
router.get('/dashboard', protect, authorize('administrator', 'teacher'), async (req, res) => {
    try {
        const stats = {
            users: {
                total: await User.countDocuments(),
                students: await User.countDocuments({ role: 'student' }),
                teachers: await User.countDocuments({ role: 'teacher' }),
                administrators: await User.countDocuments({ role: 'administrator' })
            },
            exams: {
                total: await Exam.countDocuments(),
                scheduled: await Exam.countDocuments({ status: 'scheduled' }),
                ongoing: await Exam.countDocuments({ status: 'ongoing' }),
                completed: await Exam.countDocuments({ status: 'completed' })
            },
            submissions: {
                total: await Submission.countDocuments(),
                pending: await Submission.countDocuments({ status: 'submitted' }),
                graded: await Submission.countDocuments({ status: 'graded' }),
                late: await Submission.countDocuments({ isLate: true })
            },
            results: {
                total: await Result.countDocuments(),
                published: await Result.countDocuments({ isPublished: true }),
                pending: await Result.countDocuments({ status: 'draft' })
            }
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
});

// @route   GET /api/reports/performance
// @desc    Get performance analytics
// @access  Private/Admin/Teacher
router.get('/performance', protect, authorize('administrator', 'teacher'), async (req, res) => {
    try {
        const { subject, grade, academicYear, term } = req.query;
        const query = { isPublished: true };

        if (subject) query.subject = subject;
        if (grade) query.grade = grade;
        if (academicYear) query.academicYear = academicYear;
        if (term) query.term = term;

        const results = await Result.find(query);

        if (results.length === 0) {
            return res.json({
                success: true,
                message: 'No results found for the specified criteria',
                analytics: null
            });
        }

        // Calculate analytics
        const scores = results.map(r => r.scores.percentage);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);

        // Grade distribution
        const gradeDistribution = {
            'A+': 0, 'A': 0, 'A-': 0,
            'B+': 0, 'B': 0, 'B-': 0,
            'C+': 0, 'C': 0, 'C-': 0,
            'D': 0, 'F': 0
        };

        results.forEach(r => {
            if (gradeDistribution.hasOwnProperty(r.letterGrade)) {
                gradeDistribution[r.letterGrade]++;
            }
        });

        // Pass/Fail statistics
        const passCount = results.filter(r => r.scores.percentage >= 50).length;
        const failCount = results.length - passCount;
        const passRate = (passCount / results.length * 100).toFixed(2);

        const analytics = {
            totalResults: results.length,
            scores: {
                average: average.toFixed(2),
                highest: highest.toFixed(2),
                lowest: lowest.toFixed(2)
            },
            gradeDistribution,
            passFailStats: {
                passed: passCount,
                failed: failCount,
                passRate: `${passRate}%`
            }
        };

        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating performance analytics',
            error: error.message
        });
    }
});

// @route   GET /api/reports/subject-analysis
// @desc    Get subject-wise analysis
// @access  Private/Admin/Teacher
router.get('/subject-analysis', protect, authorize('administrator', 'teacher'), async (req, res) => {
    try {
        const { academicYear, term, grade } = req.query;
        const query = { isPublished: true };

        if (academicYear) query.academicYear = academicYear;
        if (term) query.term = term;
        if (grade) query.grade = grade;

        const results = await Result.find(query);

        // Group by subject
        const subjectStats = {};

        results.forEach(result => {
            if (!subjectStats[result.subject]) {
                subjectStats[result.subject] = {
                    subject: result.subject,
                    count: 0,
                    totalPercentage: 0,
                    grades: []
                };
            }

            subjectStats[result.subject].count++;
            subjectStats[result.subject].totalPercentage += result.scores.percentage;
            subjectStats[result.subject].grades.push(result.letterGrade);
        });

        // Calculate averages
        const analysis = Object.values(subjectStats).map(stat => ({
            subject: stat.subject,
            studentsCount: stat.count,
            averageScore: (stat.totalPercentage / stat.count).toFixed(2),
            passRate: ((stat.grades.filter(g => !['D', 'F'].includes(g)).length / stat.count) * 100).toFixed(2)
        })).sort((a, b) => b.averageScore - a.averageScore);

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating subject analysis',
            error: error.message
        });
    }
});

// @route   GET /api/reports/student-progress/:studentId
// @desc    Get individual student progress
// @access  Private
router.get('/student-progress/:studentId', protect, async (req, res) => {
    try {
        // Check authorization
        if (req.user.role === 'student' && req.user.id !== req.params.studentId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this student\'s progress'
            });
        }

        const results = await Result.find({
            student: req.params.studentId,
            isPublished: true
        }).sort({ academicYear: 1, term: 1 });

        const submissions = await Submission.find({
            student: req.params.studentId,
            status: 'graded'
        }).populate('assessment', 'title subject');

        // Calculate overall statistics
        const overallAverage = results.length > 0
            ? (results.reduce((sum, r) => sum + r.scores.percentage, 0) / results.length).toFixed(2)
            : 0;

        // Group by academic year and term
        const progressByPeriod = {};
        results.forEach(result => {
            const key = `${result.academicYear}-${result.term}`;
            if (!progressByPeriod[key]) {
                progressByPeriod[key] = {
                    academicYear: result.academicYear,
                    term: result.term,
                    results: [],
                    average: 0
                };
            }
            progressByPeriod[key].results.push(result);
        });

        // Calculate averages for each period
        Object.values(progressByPeriod).forEach(period => {
            const total = period.results.reduce((sum, r) => sum + r.scores.percentage, 0);
            period.average = (total / period.results.length).toFixed(2);
        });

        res.json({
            success: true,
            progress: {
                student: req.params.studentId,
                overallAverage,
                totalResults: results.length,
                totalSubmissions: submissions.length,
                progressByPeriod: Object.values(progressByPeriod),
                recentResults: results.slice(-5),
                recentSubmissions: submissions.slice(-5)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student progress',
            error: error.message
        });
    }
});

// @route   GET /api/reports/export/results
// @desc    Export results to Excel
// @access  Private/Admin/Teacher
router.get('/export/results', protect, authorize('administrator', 'teacher'), async (req, res) => {
    try {
        const { subject, grade, academicYear, term } = req.query;
        const query = {};

        if (subject) query.subject = subject;
        if (grade) query.grade = grade;
        if (academicYear) query.academicYear = academicYear;
        if (term) query.term = term;

        const results = await Result.find(query)
            .populate('student', 'firstName lastName studentId')
            .populate('exam', 'title');

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Results');

        // Add headers
        worksheet.columns = [
            { header: 'Student ID', key: 'studentId', width: 15 },
            { header: 'Student Name', key: 'studentName', width: 25 },
            { header: 'Subject', key: 'subject', width: 20 },
            { header: 'Grade Level', key: 'grade', width: 12 },
            { header: 'Academic Year', key: 'academicYear', width: 15 },
            { header: 'Term', key: 'term', width: 12 },
            { header: 'Score Obtained', key: 'obtained', width: 15 },
            { header: 'Total Marks', key: 'total', width: 12 },
            { header: 'Percentage', key: 'percentage', width: 12 },
            { header: 'Letter Grade', key: 'letterGrade', width: 12 },
            { header: 'Remarks', key: 'remarks', width: 30 }
        ];

        // Add data
        results.forEach(result => {
            worksheet.addRow({
                studentId: result.student.studentId,
                studentName: `${result.student.firstName} ${result.student.lastName}`,
                subject: result.subject,
                grade: result.grade,
                academicYear: result.academicYear,
                term: result.term,
                obtained: result.scores.obtained,
                total: result.scores.total,
                percentage: result.scores.percentage.toFixed(2),
                letterGrade: result.letterGrade,
                remarks: result.remarks || ''
            });
        });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=results_export_${Date.now()}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error exporting results',
            error: error.message
        });
    }
});

module.exports = router;
