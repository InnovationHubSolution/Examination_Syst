# EXAMINATION & ASSESSMENT UNIT PORTAL - BLUEPRINT IMPLEMENTATION

## Overview

This document details the complete implementation of the Vanuatu Examination & Assessment Unit Portal according to the official blueprint specifications.

---

## 1. OVERVIEW SECTION

### Purpose & Mandate
The portal serves as the central digital platform for Vanuatu's national examination and assessment system, facilitating:
- National examination management (Y8, Y10, Y12, Y13)
- Internal assessment moderation
- Candidate registration and tracking
- Results distribution and certificate management
- Educational resource distribution
- Communication between all stakeholders

### System Structure
```
┌─────────────────────────────────────────────────────────┐
│         EXAMINATION & ASSESSMENT UNIT PORTAL            │
├─────────────────────────────────────────────────────────┤
│  • National Exam Coordination                           │
│  • Assessment Standards & Moderation                    │
│  • School & Candidate Management                        │
│  • Provincial Officer Operations                        │
│  • Results Processing & Certification                   │
└─────────────────────────────────────────────────────────┘
```

### User Roles
1. **Student** - View exams, submit work, check results
2. **Teacher** - Submit IAs, grade students, view standards
3. **School Admin** - Register candidates, manage school data
4. **Administrator** - Full system control
5. **Examiner** - Exam creation, centre management
6. **Moderator** - IA moderation and approval
7. **Provincial Officer** - Regional oversight and coordination

---

## 2. EXAMINATION MANAGEMENT

### 2.1 National Exam Timetables

#### Database Model: `Exam`
- **Year Levels**: Y8, Y10, Y12, Y13
- **Exam Types**: midterm, final, quarterly, national, mock, practice
- **Fields**: title, subject, grade, scheduledDate, startTime, endTime, venue, totalMarks, syllabus

#### API Endpoints
```
GET    /api/exams                  - List all exams (filtered by yearLevel, examType, academicYear)
GET    /api/exams/:id              - Get exam details
POST   /api/exams                  - Create exam (Administrator/Examiner)
PUT    /api/exams/:id              - Update exam
DELETE /api/exams/:id              - Delete exam
GET    /api/exams/timetable/:grade - Get timetable for specific year level
```

### 2.2 Candidate Registration System

#### Database Model: `Candidate`
```javascript
{
  candidateId: "VU-2025-Y12-000001",  // Auto-generated
  firstName, lastName, dateOfBirth, gender,
  school: ObjectId(School),
  yearLevel: "Y8" | "Y10" | "Y12" | "Y13",
  examYear: "2025",
  subjects: [{ subject, level }],
  examCentre: ObjectId(ExamCentre),
  specialNeeds: {
    hasSpecialNeeds: Boolean,
    needsType: ["Visual Impairment", "Hearing Impairment", ...],
    accommodations: [String],
    supportingDocuments: [{ filename, path }]
  },
  registrationStatus: "draft" | "submitted" | "verified" | "approved",
  candidatePhoto: { filename, path },
  identificationDocument: { filename, path }
}
```

#### API Endpoints
```
GET    /api/candidates                - List candidates (filtered by school, yearLevel, examYear)
GET    /api/candidates/:id            - Get candidate details
POST   /api/candidates                - Register new candidate
PUT    /api/candidates/:id            - Update candidate
PUT    /api/candidates/:id/verify     - Verify registration (Provincial Officer)
PUT    /api/candidates/:id/assign-centre - Assign to exam centre
POST   /api/candidates/:id/notes      - Add administrative notes
GET    /api/candidates/export/list    - Export candidates for printing
```

#### Registration Workflow
1. **School Admin** creates candidate record (status: draft)
2. Upload required documents (photo, ID, special needs documentation)
3. Submit for verification (status: submitted)
4. **Provincial Officer** reviews and verifies (status: verified)
5. **Administrator** assigns exam centre (status: approved)
6. System sends confirmation notifications

### 2.3 Exam Centre Directory

#### Database Model: `ExamCentre`
```javascript
{
  centreCode: "VU-SHEFA-001",
  centreName: String,
  school: ObjectId(School),
  province: "Malampa" | "Penama" | "Sanma" | "Shefa" | "Tafea" | "Torba",
  capacity: {
    totalSeats: Number,
    regularSeats: Number,
    specialNeedsSeats: Number
  },
  facilities: ["Wheelchair Access", "Special Needs Room", "CCTV", ...],
  centreSupervisor: { name, phone, email, qualifications },
  deputySupervisors: [{ name, phone, email, role }],
  invigilators: [{ name, phone, email, subject, trainingCompleted }],
  availableFor: [{ yearLevel, examYear }],
  assignedCandidates: [ObjectId(Candidate)],
  status: "active" | "inactive" | "pending_approval" | "maintenance"
}
```

#### API Endpoints
```
GET    /api/exam-centres              - List all exam centres
GET    /api/exam-centres/:id          - Get centre details
POST   /api/exam-centres              - Create exam centre
PUT    /api/exam-centres/:id          - Update centre
PUT    /api/exam-centres/:id/approve  - Approve centre (Administrator)
POST   /api/exam-centres/:id/notes    - Add notes
GET    /api/exam-centres/:id/capacity - Check capacity status
```

### 2.4 Special Needs Registration Workflow

#### Features
- Dedicated checkbox during candidate registration
- Multiple needs type selection
- File upload for medical/professional documentation
- Accommodation requirements specification
- Automatic flagging for special arrangements
- Special needs seat allocation at exam centres

#### Process
1. Mark "Has Special Needs" during registration
2. Select need types (Visual, Hearing, Physical, Learning, Medical)
3. Upload supporting documentation (PDF, images)
4. Specify required accommodations
5. System flags candidate for special centre assignment
6. Verify special needs seats availability at assigned centre

---

## 3. ASSESSMENT MATERIALS REPOSITORY

### 3.1 Past Papers & Marking Guides

#### Database Model: `Resource`
Enhanced with specific categories:
```javascript
{
  category: "past_papers" | "marking_schemes" | "sample_tasks" | 
            "study_guides" | "curriculum_documents" | "syllabus" |
            "teacher_resources" | "revision_materials" | "policies" | "guidelines",
  subject: String,
  grade: String,
  yearLevel: "Y8" | "Y10" | "Y12" | "Y13",
  file: { path, size, mimetype },
  accessLevel: "public" | "students" | "teachers" | "administrators",
  downloadCount: Number,
  isFeatured: Boolean,
  tags: [String]
}
```

#### API Endpoints
```
GET    /api/resources                  - Browse resources
GET    /api/resources/:id              - View resource
POST   /api/resources                  - Upload resource
GET    /api/resources/download/:id     - Download resource
```

### 3.2 Internal Assessment (IA) Manuals

Stored as resources with category: `teacher_resources`
- IA submission guidelines
- Subject-specific IA manuals
- Assessment task templates
- Cover sheet templates

### 3.3 Assessment Exemplars

#### Database Model: `NationalStandard`
```javascript
{
  standardCode: "VU-MATH-Y12-AS1",
  title: String,
  subject: String,
  yearLevel: "Y8" | "Y10" | "Y12" | "Y13",
  standardType: "Achievement Standard" | "Unit Standard" | "Learning Outcome",
  description: String,
  learningOutcomes: [{ outcome, level }],
  gradingDescriptors: [{
    grade: "A+" ... "F",
    minPercentage, maxPercentage,
    descriptor: String,
    criteria: [String]
  }],
  exemplars: [{
    title: String,
    description: String,
    gradeLevel: String,
    annotations: String,
    file: { filename, path },
    uploadedAt: Date
  }],
  teachingResources: [{ title, description, file }],
  version: String,
  effectiveFrom: Date,
  status: "draft" | "active" | "archived"
}
```

#### API Endpoints
```
GET    /api/national-standards            - Browse standards
GET    /api/national-standards/:id        - View standard details
POST   /api/national-standards            - Create standard (Admin)
PUT    /api/national-standards/:id/approve - Approve standard
GET    /api/national-standards/:id/exemplars - Get exemplars
GET    /api/national-standards/subject/:subject - Standards by subject
```

### 3.4 Grading Descriptors
Embedded within NationalStandard model:
- Grade ranges (A+ to F)
- Percentage thresholds
- Descriptive criteria for each grade
- Performance indicators

---

## 4. DIGITAL UPLOAD & MODERATION SYSTEM

### 4.1 School Login System

#### Authentication
- Secure JWT-based authentication
- Role-based access control (RBAC)
- School-specific user accounts (role: `school_admin`, `teacher`)
- Session management with 7-day token expiry

### 4.2 Internal Assessment Upload

#### Database Model: `InternalAssessment`
```javascript
{
  school: ObjectId(School),
  teacher: ObjectId(User),
  subject: String,
  yearLevel: "Y8" | "Y10" | "Y12" | "Y13",
  academicYear: String,
  term: "Term 1" | "Term 2" | "Term 3",
  assessmentType: "Coursework" | "Practical" | "Portfolio" | "Project" | "Oral" | "Written",
  assessmentTitle: String,
  
  // Student Work
  studentSubmissions: [{
    student: ObjectId(User),
    candidateId: String,
    files: [{ filename, path, fileType, size }],
    marks: { obtained, total, percentage },
    teacherComments: String,
    moderatorComments: String
  }],
  
  // Supporting Documents
  assessmentTask: { filename, path },
  markingRubric: { filename, path },
  coverSheet: { filename, path },
  
  // Moderation Workflow
  moderationStatus: "pending_submission" | "submitted" | "under_review" | 
                    "requires_correction" | "approved" | "rejected",
  assignedModerator: ObjectId(User),
  moderationStartDate: Date,
  moderationCompletionDate: Date,
  
  // Feedback & Corrections
  moderationFeedback: [{
    moderator: ObjectId(User),
    feedbackType: "general" | "marking" | "documentation" | "standards",
    feedback: String,
    isResolved: Boolean,
    createdAt: Date
  }],
  correctionsRequired: [{
    issue: String,
    description: String,
    priority: "low" | "medium" | "high" | "critical",
    isResolved: Boolean
  }],
  
  // Resubmissions
  resubmissions: [{
    resubmittedAt: Date,
    resubmittedBy: ObjectId(User),
    changes: String
  }],
  
  // Final Approval
  finalApproval: {
    approved: Boolean,
    approvedBy: ObjectId(User),
    approvedAt: Date,
    comments: String
  },
  
  submissionDeadline: Date,
  moderationDeadline: Date
}
```

#### API Endpoints
```
GET    /api/internal-assessments            - List IAs (role-filtered)
GET    /api/internal-assessments/:id        - Get IA details
POST   /api/internal-assessments            - Submit new IA
PUT    /api/internal-assessments/:id/assign-moderator - Assign moderator
POST   /api/internal-assessments/:id/feedback - Add moderation feedback
POST   /api/internal-assessments/:id/corrections - Request corrections
PUT    /api/internal-assessments/:id/resubmit - Resubmit after corrections
PUT    /api/internal-assessments/:id/approve - Final approval
GET    /api/internal-assessments/stats/dashboard - Moderation statistics
```

### 4.3 Moderation Tracking

#### Status Flow
```
pending_submission → submitted → under_review → 
    ├─→ approved (complete)
    └─→ requires_correction → resubmitted → under_review → approved
```

#### Dashboard Views
**Administrator Dashboard:**
- Total submissions count
- Pending moderator assignment
- Under review count
- Requires correction count
- Approved count

**Teacher Dashboard:**
- My submissions status
- Corrections required (if any)
- Feedback from moderators
- Resubmission deadlines

**Moderator Dashboard:**
- Assigned IAs
- Pending review count
- Average moderation time
- Completed moderations

### 4.4 Automated Notifications

#### Notification Triggers
1. **IA Submitted** → Notify Administrator
2. **Moderator Assigned** → Notify Moderator & Teacher
3. **Corrections Required** → Notify Teacher (urgent)
4. **IA Resubmitted** → Notify Moderator
5. **IA Approved** → Notify Teacher (success)
6. **Deadline Approaching** → Reminder to Teacher

#### Implementation
- Real-time: Socket.io events
- Email: Nodemailer (configured in .env)
- In-app: Announcement system

---

## 5. RESULTS & REPORTING

### 5.1 Student Result Lookup

#### Authentication System
```javascript
// Public endpoint with credential verification
POST /api/results/lookup
Body: {
  candidateId: "VU-2025-Y12-000001",
  dateOfBirth: "2007-05-15"
}
```

#### Process
1. Student enters Candidate ID + Date of Birth
2. System validates credentials against Candidate database
3. If authenticated, fetch published results
4. Display results with certificate download option
5. Log access for security audit

### 5.2 Bulk School-Level Downloads

#### API Endpoint
```
GET /api/results/school/:schoolId/export
Query params: { academicYear, term, yearLevel }
Returns: Excel file with all students' results
```

#### Excel Format
```
| Candidate ID | Student Name | Subject | Score | Grade | Percentage | Status |
|--------------|--------------|---------|-------|-------|------------|--------|
| VU-2025-...  | John Doe     | Math    | 85/100| A     | 85%        | Pass   |
```

### 5.3 National Performance Dashboards

#### Existing Endpoint Enhanced
```
GET /api/reports/dashboard
Returns: {
  totalStudents,
  totalExams,
  averageScore,
  passRate,
  gradeDistribution: { A+: count, A: count, ... },
  provinceComparison: [{ province, avgScore, passRate }],
  subjectPerformance: [{ subject, avgScore, passRate }],
  yearLevelStats: [{ yearLevel, count, avgScore }]
}
```

#### Visualization Components (Frontend)
- Bar charts: Grade distribution
- Line graphs: Performance trends over years
- Pie charts: Pass/fail ratios
- Heat maps: Provincial performance
- Tables: Subject-wise analysis

### 5.4 Annual Reports & Analytics

#### Generated Reports
1. **Academic Year Summary**
   - Total candidates per year level
   - Overall pass rates
   - Top performing schools
   - Subject-wise analysis

2. **Provincial Performance Report**
   - Province-by-province comparison
   - School rankings within province
   - Resource allocation recommendations

3. **Moderation Report**
   - Total IAs moderated
   - Average moderation time
   - Common issues identified
   - Standards compliance rate

#### Export Endpoint
```
GET /api/reports/annual/:year
Returns: Comprehensive PDF report
```

---

## 6. TECHNICAL IMPLEMENTATION

### 6.1 Database Schema (MongoDB)

**Collections:**
1. `users` - All user accounts (7 roles)
2. `schools` - School directory with provincial data
3. `candidates` - Exam candidate registrations
4. `examcentres` - Exam centre directory
5. `exams` - National exam scheduling
6. `internalassessments` - IA uploads & moderation
7. `nationalstandards` - Standards, descriptors, exemplars
8. `resources` - Past papers, guides, materials
9. `results` - Exam results
10. `certificates` - Digital certificates
11. `submissions` - Student assignment submissions
12. `assessments` - General assessments
13. `announcements` - System-wide communications

### 6.2 File Storage Structure
```
uploads/
├── candidates/
│   ├── photos/
│   ├── identification/
│   └── special-needs/
├── internal-assessments/
│   ├── tasks/
│   ├── rubrics/
│   ├── cover-sheets/
│   └── student-work/
├── resources/
│   ├── past-papers/
│   ├── marking-schemes/
│   ├── manuals/
│   └── exemplars/
├── certificates/
│   └── pdfs/
└── results/
    └── exports/
```

### 6.3 Security Features
- JWT authentication with 7-day expiry
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (RBAC)
- Rate limiting (100 requests/15 minutes)
- Helmet.js for HTTP security headers
- CORS configuration for client origin
- File upload validation (type, size limits)
- SQL injection prevention (Mongoose ODM)

### 6.4 Real-time Features (Socket.io)
Events:
- `new_assessment` - New IA submitted
- `new_submission` - Student submitted work
- `submission_graded` - Grade assigned
- `result_published` - Results released
- `new_announcement` - System announcement
- `moderation_feedback` - Moderator comments added
- `correction_required` - Teacher needs to revise IA

---

## 7. USER WORKFLOWS

### 7.1 School Admin: Register Candidate
1. Login to portal (role: school_admin)
2. Navigate to **Candidates > Register New**
3. Fill form: personal details, year level, subjects
4. Upload photo and ID document
5. If special needs: check box, select types, upload docs
6. Submit registration (status → submitted)
7. Await provincial officer verification

### 7.2 Provincial Officer: Verify Candidates
1. Login (role: provincial_officer)
2. View **Candidates > Pending Verification** (filtered to province)
3. Review candidate details and documents
4. Click **Verify** button
5. System updates status → verified
6. Candidate now eligible for centre assignment

### 7.3 Teacher: Submit Internal Assessment
1. Login (role: teacher)
2. Navigate to **Internal Assessments > Submit New**
3. Fill form: subject, year level, assessment type, term
4. Upload assessment task, marking rubric, cover sheet
5. Upload student work files (multiple files supported)
6. Enter marks for each student
7. Submit for moderation
8. Track status in dashboard

### 7.4 Moderator: Review IA
1. Login (role: moderator)
2. View **My Assigned IAs**
3. Open IA for review
4. Download and review student work
5. Check marking against rubric
6. If issues found:
   - Add feedback comments
   - Create correction items with priority
   - Change status → requires_correction
7. If approved:
   - Add approval comments
   - Recommend for final approval
8. Administrator performs final approval

### 7.5 Student: Check Results
1. Visit portal (public page: **/verify-certificate**)
2. Enter Candidate ID and Date of Birth
3. System authenticates credentials
4. View published results by subject
5. Download digital certificate (if applicable)
6. Print transcript

---

## 8. PROVINCIAL STRUCTURE

### Vanuatu Provinces
1. **Malampa** - Malakula, Ambrym, Paama
2. **Penama** - Pentecost, Ambae, Maewo
3. **Sanma** - Santo, Malo
4. **Shefa** - Efate, Shepherds, Epi
5. **Tafea** - Tanna, Aneityum, Futuna, Erromango, Aniwa
6. **Torba** - Torres Islands, Banks Islands

### Provincial Officer Role
- Monitor candidate registrations within province
- Verify candidate documentation
- Coordinate with schools in province
- Generate provincial performance reports
- Identify resource needs for schools

---

## 9. DEPLOYMENT INSTRUCTIONS

### 9.1 Prerequisites
- Node.js v16+
- MongoDB 5+
- Git

### 9.2 Installation Steps

```bash
# Clone repository
git clone https://github.com/InnovationHubSolution/Examination_Syst.git
cd Examination_Syst

# Install all dependencies
npm run install-all

# Create environment file
cp .env.example .env

# Configure .env
nano .env
```

### 9.3 Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vanuatu_examination_portal
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# File Upload
MAX_FILE_SIZE=10485760
FILE_UPLOAD_PATH=./uploads

# Client URL
CLIENT_URL=http://localhost:3000
```

### 9.4 Database Setup

```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or if using MongoDB service
sudo systemctl start mongod
```

### 9.5 Running the Application

```bash
# Development mode (both client and server)
npm run dev

# Server only
npm run server

# Client only
npm run client

# Production build
cd client
npm run build
```

### 9.6 Default Admin Account Setup

```javascript
// Run this in MongoDB shell or create via API
db.users.insertOne({
  firstName: "System",
  lastName: "Administrator",
  email: "admin@vanuatu.gov.vu",
  password: "$2a$10$hashed_password_here", // Use bcrypt to hash
  role: "administrator",
  isActive: true,
  createdAt: new Date()
});
```

---

## 10. API DOCUMENTATION SUMMARY

### Authentication Endpoints
```
POST /api/auth/register       - Register new user
POST /api/auth/login          - Login user
GET  /api/auth/me             - Get current user
PUT  /api/auth/update-profile - Update profile
PUT  /api/auth/change-password - Change password
```

### Candidate Management
```
GET  /api/candidates                     - List candidates
POST /api/candidates                     - Register candidate
GET  /api/candidates/:id                 - Get candidate
PUT  /api/candidates/:id/verify          - Verify candidate
PUT  /api/candidates/:id/assign-centre   - Assign exam centre
```

### School Management
```
GET  /api/schools                 - List schools
POST /api/schools                 - Create school
GET  /api/schools/province/:name  - Schools by province
```

### Exam Centre Management
```
GET  /api/exam-centres              - List centres
POST /api/exam-centres              - Create centre
PUT  /api/exam-centres/:id/approve  - Approve centre
GET  /api/exam-centres/:id/capacity - Check capacity
```

### Internal Assessment Moderation
```
GET  /api/internal-assessments                  - List IAs
POST /api/internal-assessments                  - Submit IA
PUT  /api/internal-assessments/:id/assign-moderator - Assign
POST /api/internal-assessments/:id/corrections  - Request corrections
PUT  /api/internal-assessments/:id/approve      - Approve IA
```

### National Standards
```
GET  /api/national-standards            - Browse standards
GET  /api/national-standards/:id/exemplars - Get exemplars
```

### Results & Reports
```
POST /api/results/lookup               - Student result lookup
GET  /api/results/school/:id/export    - School results export
GET  /api/reports/dashboard            - National dashboard
GET  /api/reports/annual/:year         - Annual report
```

---

## 11. FUTURE ENHANCEMENTS

### Phase 2 Features
1. **Mobile Application**
   - React Native app for Android/iOS
   - Offline result checking
   - Push notifications

2. **SMS Integration**
   - Result notification via SMS
   - Registration confirmation
   - Deadline reminders

3. **Biometric Verification**
   - Fingerprint capture during registration
   - Biometric verification at exam centres

4. **AI-Powered Analytics**
   - Predictive performance analysis
   - Anomaly detection in marking
   - Automated feedback generation

5. **E-Payment Integration**
   - Online exam fee payment
   - Receipt generation
   - Financial reporting

6. **Advanced Reporting**
   - Custom report builder
   - Data export in multiple formats
   - Scheduled automatic reports

---

## 12. SUPPORT & MAINTENANCE

### Contact Directory
- **Technical Support**: tech-support@vanuatu.gov.vu
- **Examination Unit**: examinations@vanuatu.gov.vu
- **Administrator**: admin@vanuatu.gov.vu

### Backup Schedule
- **Daily**: Automated database backup at 2:00 AM
- **Weekly**: Full system backup every Sunday
- **Monthly**: Archive and off-site storage

### System Monitoring
- Uptime monitoring: 24/7
- Performance metrics: Real-time dashboard
- Error logging: Winston logger with daily rotation
- Security audits: Quarterly review

---

## CONCLUSION

This implementation provides a comprehensive, secure, and scalable platform for managing Vanuatu's national examination and assessment system. All blueprint requirements have been fully implemented with additional enhancements for security, usability, and efficiency.

**Repository**: https://github.com/InnovationHubSolution/Examination_Syst.git

**Documentation Version**: 1.0  
**Last Updated**: December 10, 2025  
**Implemented By**: AI Development Team
