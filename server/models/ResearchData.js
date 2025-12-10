const mongoose = require('mongoose');

const researchDataSchema = new mongoose.Schema({
    // Report Identification
    reportCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },

    // Report Type
    reportType: {
        type: String,
        enum: [
            'National Trends Report',
            'Literacy Analysis',
            'Numeracy Analysis',
            'Senior Secondary Outcomes',
            'Subject Performance',
            'Provincial Comparison',
            'Longitudinal Study',
            'Pass Rate Analysis',
            'Gender Analysis',
            'Socioeconomic Impact',
            'School Performance',
            'Custom Analysis'
        ],
        required: true
    },

    // Time Period
    academicYear: {
        type: String,
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },

    // Executive Summary
    executiveSummary: {
        type: String,
        required: true
    },
    keyFindings: [{
        finding: String,
        significance: {
            type: String,
            enum: ['critical', 'important', 'notable']
        }
    }],
    recommendations: [{
        recommendation: String,
        targetAudience: [String],
        priority: {
            type: String,
            enum: ['high', 'medium', 'low']
        },
        implementationTimeline: String
    }],

    // Data Analysis
    dataPoints: {
        totalStudents: Number,
        totalSchools: Number,
        totalExams: Number,
        dataCompleteness: Number // percentage
    },

    // Literacy Metrics
    literacyMetrics: {
        overallLiteracyRate: Number,
        yearLevelBreakdown: [{
            yearLevel: String,
            literacyRate: Number,
            sampleSize: Number
        }],
        genderComparison: {
            male: Number,
            female: Number
        },
        provincialComparison: [{
            province: String,
            literacyRate: Number,
            ranking: Number
        }],
        trends: [{
            year: String,
            rate: Number,
            change: Number
        }]
    },

    // Numeracy Metrics
    numeracyMetrics: {
        overallNumeracyRate: Number,
        yearLevelBreakdown: [{
            yearLevel: String,
            numeracyRate: Number,
            sampleSize: Number
        }],
        genderComparison: {
            male: Number,
            female: Number
        },
        provincialComparison: [{
            province: String,
            numeracyRate: Number,
            ranking: Number
        }],
        trends: [{
            year: String,
            rate: Number,
            change: Number
        }]
    },

    // Senior Secondary Outcomes
    seniorSecondaryOutcomes: {
        y12Results: {
            totalCandidates: Number,
            passRate: Number,
            averageScore: Number,
            gradeDistribution: mongoose.Schema.Types.Mixed
        },
        y13Results: {
            totalCandidates: Number,
            passRate: Number,
            averageScore: Number,
            gradeDistribution: mongoose.Schema.Types.Mixed
        },
        certificateCompletion: Number,
        universityEligibility: Number,
        vocationalPathway: Number
    },

    // Subject Performance Analysis
    subjectAnalysis: [{
        subject: String,
        yearLevel: String,
        statistics: {
            totalCandidates: Number,
            passRate: Number,
            averageScore: Number,
            highestScore: Number,
            lowestScore: Number,
            standardDeviation: Number
        },
        gradeDistribution: mongoose.Schema.Types.Mixed,
        trend: {
            type: String,
            enum: ['improving', 'declining', 'stable']
        },
        yearOverYearChange: Number
    }],

    // Provincial Performance
    provincialPerformance: [{
        province: String,
        totalSchools: Number,
        totalStudents: Number,
        overallPassRate: Number,
        averageScore: Number,
        ranking: Number,
        strengths: [String],
        challenges: [String]
    }],

    // Gender Analysis
    genderAnalysis: {
        participationRates: {
            male: Number,
            female: Number
        },
        performanceComparison: {
            male: {
                passRate: Number,
                averageScore: Number
            },
            female: {
                passRate: Number,
                averageScore: Number
            }
        },
        subjectPreferences: [{
            subject: String,
            malePercentage: Number,
            femalePercentage: Number
        }]
    },

    // School Performance Rankings
    schoolRankings: [{
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School'
        },
        schoolName: String,
        province: String,
        overallRanking: Number,
        passRate: Number,
        averageScore: Number,
        totalStudents: Number,
        improvement: Number
    }],

    // Visualization Data
    charts: [{
        chartType: String,
        chartTitle: String,
        chartData: mongoose.Schema.Types.Mixed,
        chartConfig: mongoose.Schema.Types.Mixed
    }],

    // Statistical Methods
    methodology: {
        description: String,
        dataSources: [String],
        statisticalMethods: [String],
        limitations: [String],
        confidenceLevel: Number
    },

    // Report Files
    reportFiles: [{
        fileType: {
            type: String,
            enum: ['PDF', 'Excel', 'PowerPoint', 'Word', 'CSV']
        },
        filename: String,
        path: String,
        fileSize: Number,
        uploadedAt: Date
    }],

    // Dissemination
    targetAudience: [{
        type: String,
        enum: [
            'Ministry Officials',
            'School Administrators',
            'Teachers',
            'Provincial Officers',
            'Policy Makers',
            'Public',
            'International Partners'
        ]
    }],
    accessLevel: {
        type: String,
        enum: ['public', 'restricted', 'confidential'],
        default: 'public'
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'under_review', 'approved', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },

    // Authors & Contributors
    authors: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        role: String,
        affiliation: String
    }],
    reviewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Engagement Metrics
    viewCount: {
        type: Number,
        default: 0
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    citations: [{
        citedBy: String,
        citationDate: Date,
        context: String
    }],

    // Related Reports
    relatedReports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResearchData'
    }],

    // Metadata
    keywords: [String],
    doi: String, // Digital Object Identifier
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
researchDataSchema.index({ reportCode: 1 });
researchDataSchema.index({ reportType: 1, academicYear: 1 });
researchDataSchema.index({ status: 1 });
researchDataSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('ResearchData', researchDataSchema);
