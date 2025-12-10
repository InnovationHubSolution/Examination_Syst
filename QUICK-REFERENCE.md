# VANUATU EXAMINATION PORTAL - QUICK REFERENCE

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/InnovationHubSolution/Examination_Syst.git
cd Examination_Syst
npm run install-all

# 2. Configure
cp .env.example .env
# Edit .env with your settings

# 3. Start MongoDB
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 4. Seed database
npm run seed

# 5. Start application
npm run dev
```

**Access:** http://localhost:3000

---

## 📋 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vanuatu.gov.vu | ChangeThisPassword123! |
| Teacher | teacher@vanuatu.gov.vu | Teacher123! |
| Examiner | examiner@vanuatu.gov.vu | Examiner123! |
| Moderator | moderator@vanuatu.gov.vu | Moderator123! |
| Provincial | provincial@vanuatu.gov.vu | Provincial123! |
| Student | student@vanuatu.gov.vu | Student123! |

---

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start server + client
npm run server           # Start server only
npm run client           # Start client only

# Database
npm run seed             # Seed with default data
npm run seed:clear       # Clear all data
npm run db:reset         # Clear + reseed

# Production
npm run build            # Build frontend
npm start                # Start production server
```

---

## 📡 API Endpoints Summary

### Phase 1 (Core System)
- **Authentication:** `/api/auth/*` (3 endpoints)
- **Users:** `/api/users/*` (5 endpoints)
- **Candidates:** `/api/candidates/*` (8 endpoints)
- **Schools:** `/api/schools/*` (6 endpoints)
- **Exam Centres:** `/api/exam-centres/*` (7 endpoints)
- **Exams:** `/api/exams/*` (6 endpoints)
- **Internal Assessments:** `/api/internal-assessments/*` (9 endpoints)
- **National Standards:** `/api/national-standards/*` (7 endpoints)
- **Results:** `/api/results/*` (5 endpoints)
- **Certificates:** `/api/certificates/*` (4 endpoints)

### Phase 2 (Advanced Features)
- **Policies:** `/api/policies/*` (9 endpoints)
- **Training:** `/api/training/*` (8 endpoints)
- **Student Guides:** `/api/student-guides/*` (7 endpoints, 3 public)
- **Security Incidents:** `/api/security-incidents/*` (9 endpoints, 1 public)
- **Support:** `/api/support/*` (12 endpoints)
- **Research:** `/api/research/*` (15 endpoints, 1 public)

**Total:** 100+ endpoints

---

## 🗂️ Database Collections (17 Total)

### Phase 1 Collections
1. `users` - All user accounts (7 roles)
2. `schools` - School directory
3. `candidates` - Candidate registrations
4. `examcentres` - Exam centre directory
5. `exams` - National exam scheduling
6. `internalassessments` - IA uploads & moderation
7. `nationalstandards` - Standards & exemplars
8. `resources` - Past papers & materials
9. `results` - Exam results
10. `certificates` - Digital certificates
11. `submissions` - Student submissions
12. `assessments` - General assessments
13. `announcements` - System announcements

### Phase 2 Collections
14. `policies` - Policy management
15. `trainingresources` - Professional development
16. `studentguides` - Student information
17. `securityincidents` - Security tracking
18. `supporttickets` - Help desk
19. `researchdata` - National analytics

---

## 👥 User Roles & Access

| Role | Key Permissions |
|------|-----------------|
| **Student** | View exams, submit work, check results, access guides |
| **Teacher** | Submit IAs, grade work, training, view standards |
| **School Admin** | Register candidates, manage school, view reports |
| **Examiner** | Create exams, manage centres, view incidents |
| **Moderator** | Review IAs, provide feedback, approve submissions |
| **Provincial Officer** | Verify candidates, provincial oversight |
| **Administrator** | Full system access, user/policy management |

---

## 📂 File Upload Locations

```
uploads/
├── candidates/           # Photos, IDs, special needs docs
├── internal-assessments/ # Tasks, rubrics, student work
├── resources/            # Past papers, marking schemes
├── certificates/         # Generated certificates
├── policies/             # Policy documents
├── training/             # Training materials, videos
├── student-guides/       # Guide documents
├── security-incidents/   # Evidence files
├── support-tickets/      # Ticket attachments
└── research/             # Research reports
```

---

## 🌍 Provinces

1. **Malampa** - Malakula, Ambrym, Paama
2. **Penama** - Pentecost, Ambae, Maewo
3. **Sanma** - Santo, Malo
4. **Shefa** - Efate, Shepherds, Epi
5. **Tafea** - Tanna, Aneityum, Futuna, Erromango, Aniwa
6. **Torba** - Torres Islands, Banks Islands

---

## 📊 System Statistics

- **17 Database Models** with comprehensive schemas
- **100+ API Endpoints** with full CRUD operations
- **7 User Roles** with role-based access control
- **6 Provinces** fully supported
- **4 Year Levels** (Y8, Y10, Y12, Y13)
- **Multi-language Support** (English, Bislama, French)
- **Real-time Notifications** via Socket.io
- **Anonymous Reporting** for whistleblower protection

---

## 🔑 Key Features

### Phase 1 ✅
- ✅ JWT Authentication with 7-day expiry
- ✅ Candidate registration with special needs
- ✅ Internal assessment moderation workflow
- ✅ National standards with exemplars
- ✅ Results & certificate management
- ✅ Real-time notifications

### Phase 2 ✅
- ✅ Policy management with version control
- ✅ Training with certificate generation
- ✅ Interactive student guides
- ✅ Anonymous whistleblower system
- ✅ Support tickets with SLA tracking
- ✅ National research analytics

---

## 🔧 Configuration Files

- `.env` - Environment variables (create from `.env.example`)
- `server/config/config.js` - Centralized config utility
- `server/config/seeder.js` - Database seeder
- `server/middleware/auth.js` - Authentication middleware
- `server/middleware/upload.js` - File upload middleware

---

## 📚 Documentation

- **SETUP-GUIDE.md** - Complete installation guide
- **BLUEPRINT-IMPLEMENTATION.md** - Technical documentation (1,500+ lines)
- **PHASE-2-COMPLETION-SUMMARY.md** - Phase 2 feature summary
- **README.md** - Project overview

---

## 🐛 Common Issues

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### File Upload Fails
```bash
# Check file size limit in .env
MAX_FILE_SIZE=10485760  # 10MB

# Ensure uploads folder has write permissions
```

---

## 🚀 Production Checklist

- [ ] Change all default passwords
- [ ] Update JWT_SECRET to strong random value
- [ ] Configure production MongoDB URI
- [ ] Set up email service (SMTP)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure backup schedule
- [ ] Set up monitoring (optional)
- [ ] Configure rate limiting
- [ ] Set NODE_ENV=production
- [ ] Build frontend: `npm run build`
- [ ] Use PM2 or similar process manager

---

## 📞 Support

- **Email:** support@vanuatu.gov.vu
- **Phone:** +678-123-4567
- **Hours:** Monday-Friday 8:00 AM - 5:00 PM (Vanuatu Time)
- **Repository:** https://github.com/InnovationHubSolution/Examination_Syst.git

---

## 📦 Tech Stack

**Backend:**
- Node.js + Express.js 4.18.2
- MongoDB + Mongoose 7.6.3
- JWT Authentication
- Socket.io 4.6.1
- Multer 1.4.5 (file uploads)
- PDFKit + ExcelJS (document generation)

**Frontend:**
- React 18.2.0
- Material-UI 5.14.17
- React Router 6.18.0
- Vite 5.0.0

**Security:**
- Helmet 7.1.0
- bcryptjs (password hashing)
- express-rate-limit 7.1.5
- CORS

---

## 🎯 Quick Test URLs

```
Frontend:              http://localhost:3000
Backend API:           http://localhost:5000
Health Check:          http://localhost:5000/api/health

Public Endpoints:
Student Guides:        GET  /api/student-guides
Exam Rules:            GET  /api/student-guides/type/exam-rules
Anonymous Report:      POST /api/security-incidents/anonymous
Public Research:       GET  /api/research/public
```

---

## 📈 Version

**Current Version:** 2.0.0 (Phase 2 Complete)  
**Last Updated:** December 10, 2025

---

**⚡ Ready to go! Start developing with `npm run dev`**
