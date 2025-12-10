# User Role Differentiation Guide

## Overview
The Vanuatu Examination Portal supports **7 distinct user roles**, each with specific permissions, features, and interfaces tailored to their responsibilities.

---

## 🎓 1. STUDENT

### Purpose
Students use the portal to access exam information, submit assessments, view results, and track their academic progress.

### Dashboard Features
- **Personalized Welcome**: Displays student name and personalized greeting
- **Quick Stats**: 
  - Upcoming exams count
  - Pending assignments
  - Average score across all assessments
  - Certificates earned
- **Learning Journey**: Shows grade, school, and current status
- **Quick Actions**:
  - View exam timetable
  - Access pending assessments
  - Browse study resources
  - Check results and certificates

### Access Permissions
✅ **Can Access:**
- Dashboard (student-specific)
- Exam timetable
- Resource library (view only)
- Announcements (view only)
- My exams
- My assessments
- Submit assignments
- View results
- View/download certificates

❌ **Cannot Access:**
- User management
- Exam creation/editing
- Grading functions
- Administrative reports
- System settings

### Unique Features
- Grade tracking and progress visualization
- Certificate downloads
- Assignment submission system
- Personal performance analytics
- Study resource access

### Navigation Menu
- Dashboard
- Exam Timetable
- Resource Library
- Announcements
- My Exams
- Assessments
- Submissions
- Results
- Certificates

---

## 👨‍🏫 2. TEACHER

### Purpose
Teachers manage their classes, create assessments, grade student work, and track student progress.

### Dashboard Features
- **Personalized Welcome**: Displays teacher name with teaching emoji
- **Quick Stats**:
  - Active classes count
  - Pending grading queue
  - Total students across all classes
  - Completed assessments this month
- **Profile Display**: Shows teacher ID, school, subjects taught
- **Quick Actions**:
  - Create new assessment
  - View my assessments
  - Grade student submissions
  - View all submissions
- **Recent Submissions Table**: Real-time view of student work

### Access Permissions
✅ **Can Access:**
- Dashboard (teacher-specific)
- Create/edit assessments
- View student submissions
- Grade assignments
- View class rosters
- Generate class reports
- Resource library (full access)
- Announcements (create & view)

❌ **Cannot Access:**
- User management (except own classes)
- System-wide exam creation
- Administrative reports
- User account creation
- System settings

### Unique Features
- Assessment builder
- Grading interface with rubrics
- Class performance analytics
- Submission management
- Student progress tracking
- Subject-specific organization

### Navigation Menu
- Dashboard
- Exam Timetable
- Resource Library
- Announcements
- Assessments
- Submissions
- Grading

---

## 🎯 3. ADMINISTRATOR

### Purpose
Administrators have full system access to manage users, exams, resources, and generate comprehensive reports.

### Dashboard Features
- **System Overview**: Complete system status and metrics
- **Comprehensive Stats**:
  - Total users (breakdown by role)
  - Total exams across system
  - All submissions (with pending count)
  - Active resources
- **System Management Panel**:
  - User management
  - Exam management
  - Resource management
  - Announcements
  - Reports
- **System Activity Monitor**: Real-time module usage
- **Notifications Panel**: System alerts and pending tasks
- **Performance Metrics**: User engagement, system load, storage

### Access Permissions
✅ **Can Access (FULL SYSTEM ACCESS):**
- All dashboards
- User management (create, edit, delete, view all users)
- Exam management (full CRUD operations)
- Resource management (full CRUD operations)
- Announcement management (full CRUD operations)
- System reports and analytics
- Database management
- System settings
- Backup operations
- Audit logs

❌ **No Restrictions** - Administrator has full access

### Unique Features
- User account management
- System-wide exam scheduling
- Resource approval workflow
- Comprehensive reporting
- System health monitoring
- Usage analytics
- Backup and restore
- Audit trail viewing

### Navigation Menu
- Dashboard
- Exam Timetable
- Resource Library
- Announcements
- User Management
- Exam Management
- Resources (Admin)
- Announcements (Admin)
- Reports

---

## 📝 4. EXAMINER

### Purpose
Examiners create, review, and moderate examination content ensuring quality and fairness.

### Dashboard Features (To be implemented)
- Exam pipeline management
- Question bank access
- Moderation queue
- Review statistics

### Access Permissions
✅ **Can Access:**
- Exam content creation
- Question bank management
- Exam moderation
- Quality assurance tools
- Resource library (view/edit)

❌ **Cannot Access:**
- User management
- Grading (unless assigned)
- Administrative functions
- System settings

### Unique Features
- Question bank builder
- Exam template creation
- Content moderation tools
- Quality metrics

---

## 🔍 5. MODERATOR

### Purpose
Moderators ensure content quality, review submissions, and moderate discussions or resources.

### Dashboard Features (To be implemented)
- Content review queue
- Moderation statistics
- Flagged content alerts
- Approval workflow

### Access Permissions
✅ **Can Access:**
- Content moderation
- Resource approval
- Submission review
- Forum moderation (if implemented)
- Report inappropriate content

❌ **Cannot Access:**
- User management
- Exam creation
- Grading
- System settings

### Unique Features
- Content approval workflow
- Flagging system
- Moderation tools
- Quality control dashboard

---

## 🏫 6. SCHOOL ADMINISTRATOR

### Purpose
School-level administrators manage their specific institution's users, exams, and resources.

### Dashboard Features (To be implemented)
- School-specific user management
- School performance metrics
- Resource management for school
- School-level reports

### Access Permissions
✅ **Can Access:**
- School user management
- School-level reports
- School resource management
- School announcements
- Teacher management (for their school)
- Student management (for their school)

❌ **Cannot Access:**
- Other schools' data
- System-wide settings
- Global user management
- System administrator functions

### Unique Features
- School-specific dashboard
- Teacher assignment
- Student enrollment
- School-level analytics

---

## 🏛️ 7. PROVINCIAL OFFICER

### Purpose
Provincial officers oversee multiple schools within their province, managing regional education data.

### Dashboard Features (To be implemented)
- Provincial overview metrics
- Multi-school management
- Regional reports
- Provincial resource distribution

### Access Permissions
✅ **Can Access:**
- Provincial-level reports
- Multi-school data
- Regional user management
- Provincial resource management
- Cross-school analytics

❌ **Cannot Access:**
- Other provinces' data
- System-wide settings
- Global administrator functions

### Unique Features
- Multi-school dashboard
- Regional analytics
- Provincial reports
- Resource distribution management

---

## Role Hierarchy

```
Administrator (Full System Access)
│
├── Provincial Officer (Province Scope)
│   └── School Administrator (School Scope)
│       ├── Teacher (Class Scope)
│       │   └── Student (Individual Scope)
│       │
│       └── Examiner (Content Creation)
│           └── Moderator (Content Review)
```

---

## Role Identification in System

### Visual Indicators

1. **Color-Coded Badges**:
   - 🔴 Administrator: Red badge
   - 🟢 Teacher: Green badge
   - 🔵 Student: Blue badge
   - 🟡 Examiner: Yellow badge
   - 🟠 Moderator: Orange badge
   - 🟣 School Admin: Purple badge
   - ⚪ Provincial Officer: Gray badge

2. **Sidebar Display**:
   - User avatar with initial
   - Full name
   - Role label (capitalized)

3. **Top Navigation**:
   - Role badge chip
   - Color-coded by role
   - Always visible

---

## Dashboard Comparison

| Feature | Student | Teacher | Admin | Examiner | Moderator | School Admin | Provincial |
|---------|---------|---------|-------|----------|-----------|--------------|------------|
| Personal Stats | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ | ❌ | ❌ | 🟡 School | 🟡 Province |
| Exam Creation | ❌ | 🟡 Limited | ✅ | ✅ | ❌ | 🟡 School | ❌ |
| Grading | ❌ | ✅ | ✅ | 🟡 Review | ❌ | ❌ | ❌ |
| Reports | 🟡 Personal | 🟡 Class | ✅ All | 🟡 Content | 🟡 Moderation | 🟡 School | 🟡 Province |
| System Settings | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

Legend: ✅ Full Access | 🟡 Limited Access | ❌ No Access

---

## Role Assignment

### During Registration
Users can select their role during account creation:
- Student (default)
- Teacher
- Examiner
- Moderator
- School Administrator
- Provincial Officer

**Note**: Administrator role can only be assigned by existing administrators through the User Management panel.

### Post-Registration Changes
Role changes require:
1. Administrator approval
2. Verification of credentials
3. Proper authorization documentation

---

## Security & Permissions

### Route Protection
All routes are protected by role-based middleware:
```javascript
// Example protection
ProtectedRoute: Checks authentication
RoleRoute: Checks specific role permissions
```

### API Endpoints
Each API endpoint validates:
1. User authentication (valid JWT token)
2. Role permissions (can access this resource)
3. Ownership (if applicable, e.g., own submissions)

### Data Visibility
- Students: See only their own data
- Teachers: See their classes' data
- School Admins: See their school's data
- Provincial Officers: See their province's data
- Administrators: See all data

---

## Implementation Status

| Role | Dashboard | Navigation | Permissions | Features |
|------|-----------|------------|-------------|----------|
| Student | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete |
| Teacher | ✅ Complete | ✅ Complete | ✅ Complete | 🟡 Partial |
| Administrator | ✅ Complete | ✅ Complete | ✅ Complete | 🟡 Partial |
| Examiner | ⏳ Planned | ⏳ Planned | ⏳ Planned | ⏳ Planned |
| Moderator | ⏳ Planned | ⏳ Planned | ⏳ Planned | ⏳ Planned |
| School Admin | ⏳ Planned | ⏳ Planned | ⏳ Planned | ⏳ Planned |
| Provincial Officer | ⏳ Planned | ⏳ Planned | ⏳ Planned | ⏳ Planned |

Legend: ✅ Complete | 🟡 Partial | ⏳ Planned

---

## Testing Role Differentiation

### Test Accounts
```javascript
// Student
Email: student@vanuatu.gov.vu
Password: Student123!

// Teacher  
Email: teacher@vanuatu.gov.vu
Password: Teacher123!

// Administrator
Email: admin@vanuatu.gov.vu
Password: Admin123!
```

### Verification Steps
1. Login with different role accounts
2. Verify dashboard differences
3. Check navigation menu items
4. Test permission restrictions
5. Verify API access levels

---

## Future Enhancements

### Planned Features
- [ ] Custom role creation
- [ ] Permission templates
- [ ] Role delegation
- [ ] Temporary role elevation
- [ ] Role analytics
- [ ] Multi-role accounts
- [ ] Role-based notifications
- [ ] Custom dashboard widgets per role

---

Last Updated: December 11, 2025
Version: 2.0
