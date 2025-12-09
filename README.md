# Vanuatu Examination & Assessment Unit Portal

A comprehensive web-based examination and assessment management system designed specifically for the Vanuatu education system. This portal provides a centralized platform for managing exams, assessments, resources, student results, and certificates.

## 🌟 Features

### 1. Information Hub
- **Exam Timetables**: View and manage examination schedules
- **Assessment Policies**: Access comprehensive assessment guidelines and policies
- **Curriculum Documents**: Browse and download curriculum materials and syllabi
- **Contact Directory**: Find relevant personnel contact information

### 2. Resource Library
- **Past Exam Papers**: Access historical examination papers with marking schemes
- **Sample Assessment Tasks**: Browse sample assignments and projects
- **Study Materials**: Comprehensive study guides and revision materials
- **Teacher Resources**: Tools and materials for assessment development
- **Advanced Search**: Filter resources by subject, grade, year, and category

### 3. Submission & Tracking System
- **Assignment Submission**: Secure portal for submitting assignments and projects
- **Grade Management**: Teachers can enter and manage student grades
- **Progress Tracking**: Real-time monitoring of student performance
- **Late Submission Handling**: Configurable late submission policies with penalties
- **Rubric-based Grading**: Support for detailed grading criteria

### 4. Results & Certificates
- **Secure Result Access**: Students can securely view their examination results
- **Digital Certificates**: Automated certificate generation with verification codes
- **Transcript Generation**: Comprehensive academic transcripts
- **Certificate Verification**: Public verification system with QR codes
- **PDF Downloads**: Download certificates and transcripts

### 5. Communication & Support
- **Announcements**: System-wide and targeted announcements
- **Real-time Notifications**: Socket.io powered instant notifications
- **Targeted Messaging**: Role-based and grade-specific communications
- **Priority Levels**: Urgent, high, normal, and low priority announcements
- **Read Status Tracking**: Monitor announcement engagement

### 6. Reporting & Analytics
- **Performance Analytics**: Comprehensive performance reports and trends
- **Subject Analysis**: Subject-wise performance breakdowns
- **Student Progress**: Individual student progress tracking
- **Dashboard Statistics**: Real-time system statistics
- **Excel Exports**: Export data for further analysis
- **Grade Distribution**: Visual representation of grade distributions

### 7. User Management
- **Role-Based Access Control**: Four user roles (Student, Teacher, Administrator, Examiner)
- **Secure Authentication**: JWT-based authentication system
- **Profile Management**: Users can update their personal information
- **User Registration**: Self-registration with role selection
- **Account Management**: Admin tools for user management

## 🏗️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** for database
- **Mongoose** ORM for data modeling
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Socket.io** for real-time notifications
- **Multer** for file uploads
- **PDFKit** for PDF generation
- **ExcelJS** for Excel export
- **Nodemailer** for email notifications

### Frontend
- **React 18** with hooks
- **React Router** for navigation
- **Material-UI (MUI)** for UI components
- **Axios** for API calls
- **React Query** for data fetching
- **Formik & Yup** for form handling
- **Recharts** for data visualization
- **Socket.io Client** for real-time updates
- **React Toastify** for notifications
- **Vite** for fast development

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```powershell
git clone <repository-url>
cd vanuatu-examination-portal
```

### 2. Install Dependencies

**Install root dependencies:**
```powershell
npm install
```

**Install client dependencies:**
```powershell
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/vanuatu_examination_portal

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Client URL
CLIENT_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@vanuatu.gov.vu
ADMIN_PASSWORD=ChangeThisPassword123!
```

### 4. Start MongoDB

Ensure MongoDB is running on your system:
```powershell
# Windows - if MongoDB is installed as a service
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

### 5. Run the Application

**Development Mode (runs both frontend and backend):**
```powershell
npm run dev
```

**Or run separately:**

**Backend only:**
```powershell
npm run server
```

**Frontend only:**
```powershell
npm run client
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 👥 User Roles & Permissions

### Student
- View exam timetables and schedules
- Access resource library
- Submit assignments and projects
- View results and certificates
- Track personal progress
- Receive announcements

### Teacher
- Create and manage assessments
- Grade student submissions
- Upload resources and materials
- View student performance
- Create announcements
- Access reports and analytics

### Administrator
- Full system access
- User management (create, edit, delete users)
- Exam management
- Resource management
- Certificate generation
- Publish results
- System-wide announcements
- Comprehensive reporting

### Examiner
- Create and manage exams
- Upload exam papers
- Enter and verify results
- Access assessment tools

## 📁 Project Structure

```
vanuatu-examination-portal/
├── server/
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── Exam.js
│   │   ├── Assessment.js
│   │   ├── Resource.js
│   │   ├── Submission.js
│   │   ├── Result.js
│   │   ├── Certificate.js
│   │   └── Announcement.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── exams.js
│   │   ├── assessments.js
│   │   ├── resources.js
│   │   ├── submissions.js
│   │   ├── results.js
│   │   ├── certificates.js
│   │   ├── announcements.js
│   │   └── reports.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js
│   │   └── upload.js
│   └── index.js          # Server entry point
├── client/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   └── Layout/
│   │   │       └── MainLayout.jsx
│   │   ├── contexts/     # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── pages/        # Page components
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Student/
│   │   │   ├── Teacher/
│   │   │   ├── Admin/
│   │   │   └── Shared/
│   │   ├── App.jsx       # Main App component
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── uploads/              # File uploads directory
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get single exam
- `POST /api/exams` - Create exam (Teacher/Admin)
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam (Admin)
- `GET /api/exams/timetable/:grade` - Get timetable

### Assessments
- `GET /api/assessments` - Get all assessments
- `GET /api/assessments/:id` - Get single assessment
- `POST /api/assessments` - Create assessment (Teacher/Admin)
- `PUT /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get single resource
- `POST /api/resources` - Upload resource (Teacher/Admin)
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource (Admin)
- `GET /api/resources/download/:id` - Download resource

### Submissions
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/:id` - Get single submission
- `POST /api/submissions` - Submit assessment (Student)
- `PUT /api/submissions/:id/grade` - Grade submission (Teacher)
- `GET /api/submissions/student/:studentId/progress` - Student progress

### Results
- `GET /api/results` - Get all results
- `GET /api/results/:id` - Get single result
- `POST /api/results` - Enter result (Teacher/Admin)
- `POST /api/results/bulk` - Bulk enter results
- `PUT /api/results/:id` - Update result
- `PUT /api/results/:id/publish` - Publish result (Admin)
- `GET /api/results/student/:studentId/report` - Student report card

### Certificates
- `GET /api/certificates` - Get all certificates
- `GET /api/certificates/:id` - Get single certificate
- `POST /api/certificates` - Generate certificate (Admin)
- `GET /api/certificates/verify/:code` - Verify certificate (Public)
- `GET /api/certificates/:id/download` - Download certificate
- `PUT /api/certificates/:id/revoke` - Revoke certificate (Admin)

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get single announcement
- `POST /api/announcements` - Create announcement (Admin/Teacher)
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement (Admin)
- `GET /api/announcements/user/unread` - Get unread count

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/performance` - Performance analytics
- `GET /api/reports/subject-analysis` - Subject-wise analysis
- `GET /api/reports/student-progress/:studentId` - Student progress
- `GET /api/reports/export/results` - Export results to Excel

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for passwords
- **Role-Based Access**: Fine-grained permission control
- **Rate Limiting**: Protection against brute force attacks
- **Helmet.js**: HTTP header security
- **CORS**: Configured cross-origin resource sharing
- **File Upload Validation**: Strict file type and size validation
- **Input Validation**: Server-side validation for all inputs

## 📱 Real-time Features

The application uses Socket.io for real-time updates:
- New assignment notifications
- Submission alerts for teachers
- Result publication notifications
- New announcement alerts
- System-wide broadcasts

## 🧪 Testing

Create test users for each role:

```javascript
// Student
{
  email: "student@test.com",
  password: "password123",
  role: "student"
}

// Teacher
{
  email: "teacher@test.com",
  password: "password123",
  role: "teacher"
}

// Administrator
{
  email: "admin@test.com",
  password: "password123",
  role: "administrator"
}
```

## 🔧 Configuration

### File Upload Limits
Default maximum file size: 10MB
Allowed file types: PDF, Word, Excel, PowerPoint, Images, ZIP

### Grading Scale
- A+: 90-100%
- A: 85-89%
- A-: 80-84%
- B+: 75-79%
- B: 70-74%
- B-: 65-69%
- C+: 60-64%
- C: 55-59%
- C-: 50-54%
- D: 40-49%
- F: Below 40%

## 📊 Database Schema

The application uses the following main collections:
- **users**: User accounts and profiles
- **exams**: Examination information
- **assessments**: Assessment tasks
- **resources**: Learning materials
- **submissions**: Student submissions
- **results**: Examination results
- **certificates**: Digital certificates
- **announcements**: System announcements

## 🚀 Production Deployment

### Build for Production

```powershell
# Build frontend
cd client
npm run build

# The build files will be in client/dist
```

### Environment Variables for Production

Update `.env` for production:
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-strong-production-secret
CLIENT_URL=https://your-domain.com
```

### Deployment Checklist
- [ ] Update all environment variables
- [ ] Change default admin credentials
- [ ] Configure proper MongoDB connection
- [ ] Set up SSL/TLS certificates
- [ ] Configure email service
- [ ] Set up backup strategy
- [ ] Configure firewall rules
- [ ] Enable logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For support and questions:
- Email: support@vanuatu-edu-portal.vu
- Documentation: [Link to full documentation]
- Issue Tracker: [GitHub Issues]

## 🙏 Acknowledgments

- Vanuatu Ministry of Education
- All contributors and testers
- Open-source community

## 📝 Changelog

### Version 1.0.0 (Initial Release)
- Complete user authentication system
- Exam and assessment management
- Resource library with file uploads
- Submission and grading system
- Results and certificate generation
- Reporting and analytics
- Real-time notifications
- Announcement system

---

**Built with ❤️ for the Vanuatu Education System**
