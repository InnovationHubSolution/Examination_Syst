const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
    // Server
    server: {
        port: process.env.PORT || 5000,
        nodeEnv: process.env.NODE_ENV || 'development',
        clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },

    // Database
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vanuatu_examination_portal'
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'default_secret_key_change_this',
        expire: process.env.JWT_EXPIRE || '7d'
    },

    // Email
    email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || 'Vanuatu Examination Unit <examinations@vanuatu.gov.vu>'
    },

    // File Upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
        uploadPath: process.env.UPLOAD_PATH || './uploads'
    },

    // Admin
    admin: {
        email: process.env.ADMIN_EMAIL || 'admin@vanuatu.gov.vu',
        password: process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!',
        firstName: process.env.ADMIN_FIRST_NAME || 'System',
        lastName: process.env.ADMIN_LAST_NAME || 'Administrator'
    },

    // Certificate
    certificate: {
        issuer: process.env.CERTIFICATE_ISSUER || 'Vanuatu Examination & Assessment Unit',
        signaturePath: process.env.CERTIFICATE_SIGNATURE_PATH || './assets/signature.png',
        sealPath: process.env.CERTIFICATE_SEAL_PATH || './assets/seal.png'
    },

    // Support System
    support: {
        email: process.env.SUPPORT_EMAIL || 'support@vanuatu.gov.vu',
        phone: process.env.SUPPORT_PHONE || '+678-123-4567',
        hours: process.env.SUPPORT_HOURS || 'Monday-Friday 8:00 AM - 5:00 PM (Vanuatu Time)',
        departments: {
            technical: process.env.SUPPORT_DEPARTMENT_TECHNICAL || 'Technical Support',
            exam: process.env.SUPPORT_DEPARTMENT_EXAM || 'Examination Unit',
            registration: process.env.SUPPORT_DEPARTMENT_REGISTRATION || 'Registration',
            results: process.env.SUPPORT_DEPARTMENT_RESULTS || 'Results & Certificates',
            finance: process.env.SUPPORT_DEPARTMENT_FINANCE || 'Finance',
            general: process.env.SUPPORT_DEPARTMENT_GENERAL || 'General Inquiries'
        }
    },

    // Security
    security: {
        whistleblowerEmail: process.env.WHISTLEBLOWER_PROTECTION_EMAIL || 'whistleblower@vanuatu.gov.vu',
        incidentNotificationEmail: process.env.INCIDENT_NOTIFICATION_EMAIL || 'security@vanuatu.gov.vu',
        securityOfficerEmail: process.env.SECURITY_OFFICER_EMAIL || 'security.officer@vanuatu.gov.vu'
    },

    // Research
    research: {
        doiPrefix: process.env.RESEARCH_DOI_PREFIX || '10.12345/vanuatu.edu',
        publicationEmail: process.env.RESEARCH_PUBLICATION_EMAIL || 'research@vanuatu.gov.vu',
        institution: process.env.RESEARCH_INSTITUTION || 'Vanuatu Ministry of Education and Training'
    },

    // Policy
    policy: {
        approvalEmail: process.env.POLICY_APPROVAL_EMAIL || 'policy.admin@vanuatu.gov.vu',
        archivePath: process.env.POLICY_ARCHIVE_PATH || './uploads/policies/archive'
    },

    // Training
    training: {
        certificateIssuer: process.env.TRAINING_CERTIFICATE_ISSUER || 'Vanuatu Examination & Assessment Unit',
        coordinatorEmail: process.env.TRAINING_COORDINATOR_EMAIL || 'training@vanuatu.gov.vu',
        calendarSyncEnabled: process.env.PD_CALENDAR_SYNC_ENABLED === 'true'
    },

    // Provinces
    provinces: {
        malampa: { email: process.env.PROVINCE_MALAMPA_EMAIL || 'malampa@vanuatu.gov.vu' },
        penama: { email: process.env.PROVINCE_PENAMA_EMAIL || 'penama@vanuatu.gov.vu' },
        sanma: { email: process.env.PROVINCE_SANMA_EMAIL || 'sanma@vanuatu.gov.vu' },
        shefa: { email: process.env.PROVINCE_SHEFA_EMAIL || 'shefa@vanuatu.gov.vu' },
        tafea: { email: process.env.PROVINCE_TAFEA_EMAIL || 'tafea@vanuatu.gov.vu' },
        torba: { email: process.env.PROVINCE_TORBA_EMAIL || 'torba@vanuatu.gov.vu' }
    },

    // SMS
    sms: {
        enabled: process.env.SMS_ENABLED === 'true',
        apiKey: process.env.SMS_API_KEY,
        senderId: process.env.SMS_SENDER_ID || 'VanuatuExam'
    },

    // Cloud Storage
    cloudStorage: {
        enabled: process.env.CLOUD_STORAGE_ENABLED === 'true',
        provider: process.env.CLOUD_STORAGE_PROVIDER || 'aws',
        aws: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            bucketName: process.env.AWS_BUCKET_NAME,
            region: process.env.AWS_REGION || 'ap-southeast-2'
        }
    },

    // Backup
    backup: {
        enabled: process.env.BACKUP_ENABLED === 'true',
        path: process.env.BACKUP_PATH || './backups',
        schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
        retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH || './logs',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        maxSize: process.env.LOG_MAX_SIZE || '10m'
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // Session
    session: {
        secret: process.env.SESSION_SECRET || 'default_session_secret',
        timeout: parseInt(process.env.SESSION_TIMEOUT) || 86400000 // 24 hours
    },

    // Feature Flags
    features: {
        smsNotifications: process.env.FEATURE_SMS_NOTIFICATIONS === 'true',
        biometricVerification: process.env.FEATURE_BIOMETRIC_VERIFICATION === 'true',
        aiAnalytics: process.env.FEATURE_AI_ANALYTICS === 'true',
        liveChat: process.env.FEATURE_LIVE_CHAT === 'true',
        mobileAppApi: process.env.FEATURE_MOBILE_APP_API !== 'false' // Default true
    },

    // Maintenance
    maintenance: {
        mode: process.env.MAINTENANCE_MODE === 'true',
        message: process.env.MAINTENANCE_MESSAGE || 'System is under maintenance. Please check back later.'
    },

    // Analytics
    analytics: {
        googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
        sentryDsn: process.env.SENTRY_DSN,
        monitoringEnabled: process.env.MONITORING_ENABLED === 'true'
    },

    // Time Zone
    timeZone: process.env.TZ || 'Pacific/Efate'
};
