const express = require('express');
const router = express.Router();
const ResearchData = require('../models/ResearchData');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/research
// @desc    Get all research reports
// @access  Private (Administrator, Examiner, Provincial Officer)
router.get('/', protect, authorize('administrator', 'examiner', 'provincial_officer'), async (req, res) => {
    try {
        const { reportType, academicYear, yearLevel, province, status, accessLevel } = req.query;

        let query = {};

        if (reportType) query.reportType = reportType;
        if (academicYear) query.academicYear = parseInt(academicYear);
        if (yearLevel) query.yearLevel = yearLevel;
        if (province) query.province = province;
        if (status) query.status = status;
        if (accessLevel) query.accessLevel = accessLevel;

        const reports = await ResearchData.find(query)
            .populate('author contributors reviewers', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/research/public
// @desc    Get public research reports
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const { reportType, academicYear, yearLevel } = req.query;

        let query = {
            status: 'published',
            accessLevel: 'public'
        };

        if (reportType) query.reportType = reportType;
        if (academicYear) query.academicYear = parseInt(academicYear);
        if (yearLevel) query.yearLevel = yearLevel;

        const reports = await ResearchData.find(query)
            .select('-methodology.statisticalMethods -methodology.limitations')
            .populate('author', 'firstName lastName')
            .sort({ publishedAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/research/:id
// @desc    Get single research report
// @access  Private/Public (based on access level)
router.get('/:id', async (req, res) => {
    try {
        const report = await ResearchData.findById(req.params.id)
            .populate('author contributors reviewers', 'firstName lastName email')
            .populate('relatedReports', 'reportCode title reportType');

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Research report not found'
            });
        }

        // Check access level
        if (report.accessLevel !== 'public' && !req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required to view this report'
            });
        }

        if (report.accessLevel === 'confidential' && req.user) {
            const hasAccess = req.user.role === 'administrator' ||
                req.user.role === 'examiner' ||
                report.author.toString() === req.user.id;

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view this confidential report'
                });
            }
        }

        // Increment view count
        report.engagementMetrics.views += 1;
        await report.save();

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/research
// @desc    Create new research report
// @access  Private (Administrator, Examiner)
router.post('/', protect, authorize('administrator', 'examiner'), upload.array('reportFiles', 5), async (req, res) => {
    try {
        const reportData = {
            ...req.body,
            author: req.user.id
        };

        // Parse JSON fields
        if (req.body.literacyMetrics) reportData.literacyMetrics = JSON.parse(req.body.literacyMetrics);
        if (req.body.numeracyMetrics) reportData.numeracyMetrics = JSON.parse(req.body.numeracyMetrics);
        if (req.body.seniorSecondaryOutcomes) reportData.seniorSecondaryOutcomes = JSON.parse(req.body.seniorSecondaryOutcomes);
        if (req.body.subjectAnalysis) reportData.subjectAnalysis = JSON.parse(req.body.subjectAnalysis);
        if (req.body.provincialPerformance) reportData.provincialPerformance = JSON.parse(req.body.provincialPerformance);
        if (req.body.genderAnalysis) reportData.genderAnalysis = JSON.parse(req.body.genderAnalysis);
        if (req.body.schoolRankings) reportData.schoolRankings = JSON.parse(req.body.schoolRankings);
        if (req.body.visualizations) reportData.visualizations = JSON.parse(req.body.visualizations);
        if (req.body.methodology) reportData.methodology = JSON.parse(req.body.methodology);
        if (req.body.keyFindings) reportData.keyFindings = JSON.parse(req.body.keyFindings);
        if (req.body.recommendations) reportData.recommendations = JSON.parse(req.body.recommendations);
        if (req.body.contributors) reportData.contributors = JSON.parse(req.body.contributors);
        if (req.body.reviewers) reportData.reviewers = JSON.parse(req.body.reviewers);
        if (req.body.relatedReports) reportData.relatedReports = JSON.parse(req.body.relatedReports);
        if (req.body.targetAudience) reportData.targetAudience = JSON.parse(req.body.targetAudience);

        // Handle report files
        if (req.files && req.files.length > 0) {
            reportData.reportFiles = req.files.map(file => ({
                filename: file.filename,
                path: file.path,
                fileType: file.mimetype,
                size: file.size,
                format: file.originalname.split('.').pop().toUpperCase()
            }));
        }

        const report = await ResearchData.create(reportData);

        res.status(201).json({
            success: true,
            data: report,
            message: `Research report created successfully. Report code: ${report.reportCode}`
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/research/:id
// @desc    Update research report
// @access  Private (Administrator, Author)
router.put('/:id', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        let report = await ResearchData.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Research report not found'
            });
        }

        // Check if user is author or admin
        if (report.author.toString() !== req.user.id && req.user.role !== 'administrator') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this report'
            });
        }

        report = await ResearchData.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   PUT /api/research/:id/publish
// @desc    Publish research report
// @access  Private (Administrator)
router.put('/:id/publish', protect, authorize('administrator'), async (req, res) => {
    try {
        const report = await ResearchData.findByIdAndUpdate(
            req.params.id,
            {
                status: 'published',
                publishedAt: Date.now()
            },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Research report not found'
            });
        }

        res.json({
            success: true,
            data: report,
            message: 'Research report published successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/research/analytics/literacy
// @desc    Get literacy trends and analysis
// @access  Private (Administrator, Examiner, Provincial Officer)
router.get('/analytics/literacy', protect, authorize('administrator', 'examiner', 'provincial_officer'), async (req, res) => {
    try {
        const { academicYear, province, yearLevel } = req.query;

        let query = {
            reportType: { $in: ['National Trends', 'Literacy Analysis'] },
            status: 'published',
            'literacyMetrics.overallRate': { $exists: true }
        };

        if (academicYear) query.academicYear = parseInt(academicYear);
        if (province) query.province = province;
        if (yearLevel) query.yearLevel = yearLevel;

        const reports = await ResearchData.find(query)
            .select('reportCode title academicYear literacyMetrics province yearLevel')
            .sort({ academicYear: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/research/analytics/numeracy
// @desc    Get numeracy trends and analysis
// @access  Private (Administrator, Examiner, Provincial Officer)
router.get('/analytics/numeracy', protect, authorize('administrator', 'examiner', 'provincial_officer'), async (req, res) => {
    try {
        const { academicYear, province, yearLevel } = req.query;

        let query = {
            reportType: { $in: ['National Trends', 'Numeracy Analysis'] },
            status: 'published',
            'numeracyMetrics.overallRate': { $exists: true }
        };

        if (academicYear) query.academicYear = parseInt(academicYear);
        if (province) query.province = province;
        if (yearLevel) query.yearLevel = yearLevel;

        const reports = await ResearchData.find(query)
            .select('reportCode title academicYear numeracyMetrics province yearLevel')
            .sort({ academicYear: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/research/analytics/provincial
// @desc    Get provincial performance comparison
// @access  Private (Administrator, Examiner, Provincial Officer)
router.get('/analytics/provincial', protect, authorize('administrator', 'examiner', 'provincial_officer'), async (req, res) => {
    try {
        const { academicYear } = req.query;

        let query = {
            reportType: { $in: ['Provincial Comparison', 'National Trends'] },
            status: 'published',
            'provincialPerformance': { $exists: true, $ne: [] }
        };

        if (academicYear) query.academicYear = parseInt(academicYear);

        const reports = await ResearchData.find(query)
            .select('reportCode title academicYear provincialPerformance')
            .sort({ academicYear: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/research/analytics/gender
// @desc    Get gender analysis data
// @access  Private (Administrator, Examiner)
router.get('/analytics/gender', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const { academicYear, yearLevel } = req.query;

        let query = {
            reportType: { $in: ['Gender Analysis', 'National Trends'] },
            status: 'published',
            'genderAnalysis': { $exists: true }
        };

        if (academicYear) query.academicYear = parseInt(academicYear);
        if (yearLevel) query.yearLevel = yearLevel;

        const reports = await ResearchData.find(query)
            .select('reportCode title academicYear yearLevel genderAnalysis')
            .sort({ academicYear: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/research/analytics/schools
// @desc    Get school rankings and performance
// @access  Private (Administrator, Examiner, Provincial Officer, School Admin)
router.get('/analytics/schools', protect, authorize('administrator', 'examiner', 'provincial_officer', 'school_admin'), async (req, res) => {
    try {
        const { academicYear, province, schoolType } = req.query;

        let query = {
            reportType: { $in: ['School Performance', 'National Trends'] },
            status: 'published',
            'schoolRankings': { $exists: true, $ne: [] }
        };

        if (academicYear) query.academicYear = parseInt(academicYear);
        if (province) query.province = province;

        const reports = await ResearchData.find(query)
            .select('reportCode title academicYear schoolRankings province')
            .populate('schoolRankings.school', 'name schoolType')
            .sort({ academicYear: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   POST /api/research/:id/download
// @desc    Track report download
// @access  Private/Public (based on access level)
router.post('/:id/download', async (req, res) => {
    try {
        const report = await ResearchData.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Research report not found'
            });
        }

        // Check access level
        if (report.accessLevel !== 'public' && !req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required to download this report'
            });
        }

        // Increment download count
        report.engagementMetrics.downloads += 1;
        await report.save();

        res.json({
            success: true,
            message: 'Download tracked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @route   GET /api/research/stats/dashboard
// @desc    Get research data statistics
// @access  Private (Administrator, Examiner)
router.get('/stats/dashboard', protect, authorize('administrator', 'examiner'), async (req, res) => {
    try {
        const stats = {
            totalReports: await ResearchData.countDocuments(),
            byType: {},
            byStatus: {
                draft: await ResearchData.countDocuments({ status: 'draft' }),
                underReview: await ResearchData.countDocuments({ status: 'under_review' }),
                published: await ResearchData.countDocuments({ status: 'published' })
            },
            byAccessLevel: {
                public: await ResearchData.countDocuments({ accessLevel: 'public' }),
                restricted: await ResearchData.countDocuments({ accessLevel: 'restricted' }),
                confidential: await ResearchData.countDocuments({ accessLevel: 'confidential' })
            },
            currentYear: await ResearchData.countDocuments({ academicYear: new Date().getFullYear() }),
            totalViews: 0,
            totalDownloads: 0
        };

        // Count by report type
        const reportTypes = [
            'National Trends', 'Literacy Analysis', 'Numeracy Analysis',
            'Senior Secondary Outcomes', 'Subject Performance', 'Provincial Comparison',
            'Longitudinal Study', 'Pass Rate Analysis', 'Gender Analysis',
            'Socioeconomic Impact', 'School Performance', 'Custom Analysis'
        ];

        for (const type of reportTypes) {
            stats.byType[type] = await ResearchData.countDocuments({ reportType: type });
        }

        // Calculate total engagement
        const reports = await ResearchData.find().select('engagementMetrics');
        stats.totalViews = reports.reduce((sum, r) => sum + (r.engagementMetrics?.views || 0), 0);
        stats.totalDownloads = reports.reduce((sum, r) => sum + (r.engagementMetrics?.downloads || 0), 0);

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
