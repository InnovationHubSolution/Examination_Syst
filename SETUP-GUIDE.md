# VANUATU EXAMINATION PORTAL - SETUP GUIDE

## Prerequisites

Before setting up the Vanuatu Examination Portal, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/InnovationHubSolution/Examination_Syst.git
cd Examination_Syst
```

### 2. Install Dependencies

Install both server and client dependencies:

```bash
npm run install-all
```

Or install separately:

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Required configurations
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vanuatu_examination_portal
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:3000

# Email configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_app_specific_password

# Admin account
ADMIN_EMAIL=admin@vanuatu.gov.vu
ADMIN_PASSWORD=ChangeThisPassword123!
```

**Important:** Change the default passwords and secrets in production!

### 4. Start MongoDB

Ensure MongoDB is running on your system:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 5. Seed the Database

Initialize the database with default data:

```bash
npm run seed
```

This will create:
- ✅ Admin user and sample users (teacher, examiner, moderator, provincial officer, student)
- ✅ Sample schools (3 schools across different provinces)
- ✅ Sample exam centres (2 exam centres)

**Default Credentials:**
```
Admin:           admin@vanuatu.gov.vu / ChangeThisPassword123!
Teacher:         teacher@vanuatu.gov.vu / Teacher123!
Examiner:        examiner@vanuatu.gov.vu / Examiner123!
Moderator:       moderator@vanuatu.gov.vu / Moderator123!
Provincial:      provincial@vanuatu.gov.vu / Provincial123!
Student:         student@vanuatu.gov.vu / Student123!
```

### 6. Start the Application

**Development Mode (Recommended):**
```bash
npm run dev
```

This starts both the server and client concurrently.

**Start Server Only:**
```bash
npm run server
```

**Start Client Only:**
```bash
npm run client
```

**Production Mode:**
```bash
# Build the client
npm run build

# Start the server
npm start
```

### 7. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## Available Scripts

### Server Scripts
```bash
npm run server          # Start server in development mode with nodemon
npm start              # Start server in production mode
npm run seed           # Seed database with default data
npm run seed:clear     # Clear all data from database
npm run db:reset       # Clear and re-seed database
```

### Client Scripts
```bash
npm run client         # Start client development server
npm run build          # Build client for production
```

### Combined Scripts
```bash
npm run dev            # Run both server and client in development mode
npm run install-all    # Install all dependencies (server + client)
```

---

## Project Structure

```
vanuatu-examination-portal/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── contexts/               # React contexts (Auth, etc.)
│   │   ├── pages/                  # Page components
│   │   │   ├── Admin/             # Admin pages
│   │   │   ├── Teacher/           # Teacher pages
│   │   │   ├── Student/           # Student pages
│   │   │   ├── Shared/            # Shared pages
│   │   │   └── Auth/              # Authentication pages
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express backend
│   ├── config/
│   │   ├── config.js              # Configuration utility
│   │   └── seeder.js              # Database seeder
│   ├── middleware/
│   │   ├── auth.js                # Authentication middleware
│   │   └── upload.js              # File upload middleware
│   ├── models/                     # Mongoose models (17 models)
│   │   ├── User.js
│   │   ├── Candidate.js
│   │   ├── School.js
│   │   ├── ExamCentre.js
│   │   ├── InternalAssessment.js
│   │   ├── NationalStandard.js
│   │   ├── Policy.js
│   │   ├── TrainingResource.js
│   │   ├── StudentGuide.js
│   │   ├── SecurityIncident.js
│   │   ├── SupportTicket.js
│   │   ├── ResearchData.js
│   │   └── ... (other models)
│   ├── routes/                     # API routes (100+ endpoints)
│   │   ├── auth.js
│   │   ├── candidates.js
│   │   ├── policies.js
│   │   ├── training.js
│   │   ├── support.js
│   │   └── ... (other routes)
│   └── index.js                   # Server entry point
│
├── uploads/                        # File uploads directory
│   ├── candidates/
│   ├── policies/
│   ├── training/
│   ├── security-incidents/
│   ├── support-tickets/
│   ├── research/
│   └── ... (other folders)
│
├── .env.example                    # Example environment variables
├── .gitignore
├── package.json                    # Root package.json
├── README.md
├── BLUEPRINT-IMPLEMENTATION.md     # Technical documentation
└── PHASE-2-COMPLETION-SUMMARY.md  # Phase 2 summary
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Candidates (Phase 1)
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Register new candidate
- `PUT /api/candidates/:id/verify` - Verify candidate

### Schools (Phase 1)
- `GET /api/schools` - List all schools
- `POST /api/schools` - Create school
- `GET /api/schools/province/:name` - Get schools by province

### Exam Centres (Phase 1)
- `GET /api/exam-centres` - List exam centres
- `POST /api/exam-centres` - Create exam centre

### Internal Assessments (Phase 1)
- `GET /api/internal-assessments` - List IAs
- `POST /api/internal-assessments` - Submit IA
- `PUT /api/internal-assessments/:id/approve` - Approve IA

### Policies (Phase 2)
- `GET /api/policies` - List policies
- `POST /api/policies` - Create policy (Admin)
- `POST /api/policies/:id/acknowledge` - Acknowledge policy

### Training Resources (Phase 2)
- `GET /api/training` - List training resources
- `POST /api/training/:id/complete` - Complete training
- `GET /api/training/calendar` - PD calendar

### Student Guides (Phase 2)
- `GET /api/student-guides` - PUBLIC: List guides
- `GET /api/student-guides/type/exam-rules` - PUBLIC: Exam rules

### Security Incidents (Phase 2)
- `POST /api/security-incidents/anonymous` - PUBLIC: Anonymous report
- `GET /api/security-incidents` - List incidents (Admin/Examiner)

### Support Tickets (Phase 2)
- `POST /api/support` - Create support ticket
- `GET /api/support/my-tickets` - User's tickets

### Research Data (Phase 2)
- `GET /api/research/public` - PUBLIC: Published research
- `GET /api/research/analytics/literacy` - Literacy trends

**Total:** 100+ API endpoints across 21 routes

---

## User Roles & Permissions

### 1. Student
- View exams and timetables
- Submit assignments
- Check results
- Download certificates
- Access student guides (public)

### 2. Teacher
- Submit internal assessments
- Grade student work
- Access training resources
- View national standards
- Complete professional development

### 3. School Admin
- Register candidates
- Manage school information
- View school-level reports
- Submit student data

### 4. Examiner
- Create and manage exams
- Manage exam centres
- View security incidents
- Access research data

### 5. Moderator
- Review internal assessments
- Provide feedback
- Approve/reject submissions

### 6. Provincial Officer
- Verify candidates in province
- View provincial reports
- Coordinate with schools
- Monitor provincial performance

### 7. Administrator
- Full system access
- User management
- Policy management
- System configuration
- Generate all reports

---

## Features by Phase

### Phase 1 Features ✅
- User authentication with JWT
- Candidate registration with special needs support
- School management (6 provinces)
- Exam centre directory
- Internal assessment moderation workflow
- National standards with exemplars
- Results & certificate management
- Real-time notifications (Socket.io)

### Phase 2 Features ✅
- Policy & circular management with version control
- Training resources with certificate generation
- Student guides with interactive quizzes
- Anonymous whistleblower system
- Support ticket system with SLA tracking
- National research & analytics dashboard
- Multi-language support (English, Bislama, French)
- Comprehensive file upload support

---

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB connection error
```

**Solution:**
1. Ensure MongoDB is running: `mongod --version`
2. Check connection string in `.env`
3. Verify MongoDB service is started

### Port Already in Use
```
Error: Port 5000 is already in use
```

**Solution:**
1. Change `PORT` in `.env` file
2. Or kill the process using the port:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - macOS/Linux: `lsof -i :5000` then `kill -9 <PID>`

### File Upload Errors
```
Error: Invalid file type
```

**Solution:**
1. Check `MAX_FILE_SIZE` in `.env`
2. Verify allowed file types in `server/middleware/upload.js`
3. Ensure `uploads/` directory has write permissions

### Email Not Sending
```
Error: Email configuration error
```

**Solution:**
1. Configure email settings in `.env`
2. For Gmail, use App-Specific Password
3. Enable "Less secure app access" or use OAuth2

---

## Production Deployment

### 1. Environment Configuration
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your_strong_production_secret
CLIENT_URL=https://yourdomain.com
```

### 2. Build Frontend
```bash
cd client
npm run build
```

### 3. Serve Static Files
The server is configured to serve the built client files in production.

### 4. Start Server
```bash
npm start
```

### 5. Process Manager (Recommended)
Use PM2 for production:
```bash
npm install -g pm2
pm2 start server/index.js --name vanuatu-portal
pm2 save
pm2 startup
```

---

## Database Backup

### Manual Backup
```bash
mongodump --db vanuatu_examination_portal --out ./backups/backup-$(date +%Y%m%d)
```

### Restore from Backup
```bash
mongorestore --db vanuatu_examination_portal ./backups/backup-YYYYMMDD/vanuatu_examination_portal
```

---

## Security Considerations

1. **Change Default Passwords:** Update all default passwords in production
2. **Use HTTPS:** Enable SSL/TLS certificates in production
3. **Environment Variables:** Never commit `.env` to version control
4. **Database Access:** Restrict MongoDB access to trusted IPs
5. **Rate Limiting:** Configure appropriate rate limits for your use case
6. **File Upload Security:** Validate and sanitize all uploaded files
7. **JWT Secret:** Use a strong, randomly generated JWT secret

---

## Support & Contact

- **Technical Support:** tech-support@vanuatu.gov.vu
- **Examination Unit:** examinations@vanuatu.gov.vu
- **Administrator:** admin@vanuatu.gov.vu
- **Repository:** https://github.com/InnovationHubSolution/Examination_Syst.git

---

## License

MIT License - Vanuatu Ministry of Education

---

## Version History

- **v2.0.0** (2025-12-10) - Phase 2 complete with advanced features
- **v1.0.0** (2025-12-10) - Phase 1 initial release

---

**Last Updated:** December 10, 2025
