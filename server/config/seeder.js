const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const School = require('../models/School');
const ExamCentre = require('../models/ExamCentre');
const Exam = require('../models/Exam');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Candidate = require('../models/Candidate');
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const Result = require('../models/Result');
const config = require('../config/config');

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(config.database.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedUsers = async () => {
    try {
        // Check if admin exists
        const existingAdmin = await User.findOne({ email: config.admin.email });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user (let model's pre-save hook hash the password)
        const admin = await User.create({
            firstName: config.admin.firstName,
            lastName: config.admin.lastName,
            email: config.admin.email,
            password: config.admin.password,
            role: 'administrator',
            isActive: true,
            emailVerified: true
        });

        console.log('✅ Admin user created:', admin.email);

        // Create sample users for testing (let model hash passwords)
        const sampleUsers = [
            {
                firstName: 'John',
                lastName: 'Teacher',
                email: 'teacher@vanuatu.gov.vu',
                password: 'Teacher123!',
                role: 'teacher',
                isActive: true,
                emailVerified: true
            },
            {
                firstName: 'Jane',
                lastName: 'Examiner',
                email: 'examiner@vanuatu.gov.vu',
                password: 'Examiner123!',
                role: 'examiner',
                isActive: true,
                emailVerified: true
            },
            {
                firstName: 'Bob',
                lastName: 'Moderator',
                email: 'moderator@vanuatu.gov.vu',
                password: 'Moderator123!',
                role: 'moderator',
                isActive: true,
                emailVerified: true
            },
            {
                firstName: 'Alice',
                lastName: 'Provincial',
                email: 'provincial@vanuatu.gov.vu',
                password: 'Provincial123!',
                role: 'provincial_officer',
                province: 'Shefa',
                isActive: true,
                emailVerified: true
            },
            {
                firstName: 'Mike',
                lastName: 'Student',
                email: 'student@vanuatu.gov.vu',
                password: 'Student123!',
                role: 'student',
                isActive: true,
                emailVerified: true
            }
        ];

        // Use create instead of insertMany to trigger pre-save hooks for password hashing
        for (const userData of sampleUsers) {
            await User.create(userData);
        }
        console.log('✅ Sample users created successfully');

    } catch (error) {
        console.error('Error seeding users:', error);
    }
};

const seedSchools = async () => {
    try {
        const schoolCount = await School.countDocuments();
        if (schoolCount > 0) {
            console.log('Schools already exist');
            return;
        }

        const schools = [
            {
                schoolCode: 'VU-SHEFA-001',
                schoolName: 'Port Vila Secondary School',
                province: 'Shefa',
                island: 'Efate',
                area: 'Port Vila',
                address: 'Main Street, Port Vila, Efate',
                phoneNumber: '+678-22222',
                email: 'pvss@vanuatu.edu.vu',
                schoolType: 'Secondary',
                principal: {
                    name: 'Principal One',
                    email: 'principal1@vanuatu.edu.vu',
                    phone: '+678-22223'
                },
                examCoordinator: {
                    name: 'Coordinator One',
                    email: 'coord1@vanuatu.edu.vu',
                    phone: '+678-22224'
                },
                studentCapacity: 500,
                examCapacity: 100,
                facilities: ['Computer Lab', 'Science Lab', 'Library', 'Sports Facilities', 'Internet Access'],
                isActive: true,
                isExamCentre: true
            },
            {
                schoolCode: 'VU-SANMA-001',
                schoolName: 'Santo Secondary School',
                province: 'Sanma',
                island: 'Santo',
                area: 'Luganville',
                address: 'Unity Park Road, Luganville, Santo',
                phoneNumber: '+678-33333',
                email: 'sss@vanuatu.edu.vu',
                schoolType: 'Secondary',
                principal: {
                    name: 'Principal Two',
                    email: 'principal2@vanuatu.edu.vu',
                    phone: '+678-33334'
                },
                examCoordinator: {
                    name: 'Coordinator Two',
                    email: 'coord2@vanuatu.edu.vu',
                    phone: '+678-33335'
                },
                studentCapacity: 400,
                examCapacity: 80,
                facilities: ['Computer Lab', 'Library', 'Sports Facilities'],
                isActive: true,
                isExamCentre: true
            },
            {
                schoolCode: 'VU-TAFEA-001',
                schoolName: 'Tanna Secondary School',
                province: 'Tafea',
                island: 'Tanna',
                area: 'Isangel',
                address: 'School Road, Isangel, Tanna',
                phoneNumber: '+678-44444',
                email: 'tss@vanuatu.edu.vu',
                schoolType: 'Secondary',
                principal: {
                    name: 'Principal Three',
                    email: 'principal3@vanuatu.edu.vu',
                    phone: '+678-44445'
                },
                examCoordinator: {
                    name: 'Coordinator Three',
                    email: 'coord3@vanuatu.edu.vu',
                    phone: '+678-44446'
                },
                studentCapacity: 300,
                examCapacity: 60,
                facilities: ['Library', 'Sports Facilities'],
                isActive: true,
                isExamCentre: false
            }
        ];

        for (const schoolData of schools) {
            await School.create(schoolData);
        }
        console.log('✅ Sample schools created successfully');

    } catch (error) {
        console.error('Error seeding schools:', error);
    }
};

const seedExamCentres = async () => {
    try {
        const centreCount = await ExamCentre.countDocuments();
        if (centreCount > 0) {
            console.log('Exam centres already exist');
            return;
        }

        // Get schools to link exam centres
        const schools = await School.find().limit(3);
        if (schools.length === 0) {
            console.log('No schools found. Seed schools first.');
            return;
        }

        const examCentres = [
            {
                centreCode: 'VU-SHEFA-EC001',
                centreName: 'Port Vila Examination Centre',
                school: schools[0]._id,
                province: 'Shefa',
                address: 'Main Street, Port Vila, Efate',
                phoneNumber: '+678-55555',
                email: 'exam.centre1@vanuatu.gov.vu',
                capacity: {
                    totalSeats: 300,
                    regularSeats: 280,
                    specialNeedsSeats: 20
                },
                facilities: ['Wheelchair Access', 'Special Needs Room', 'CCTV', 'Backup Generator'],
                centreSupervisor: {
                    name: 'Supervisor One',
                    phone: '+678-55556',
                    email: 'supervisor1@vanuatu.gov.vu',
                    qualifications: 'Bachelor of Education'
                },
                invigilators: [
                    {
                        name: 'Invigilator One',
                        phone: '+678-66666',
                        email: 'inv1@vanuatu.gov.vu',
                        subject: 'Mathematics',
                        trainingCompleted: true
                    }
                ],
                isActive: true,
                isApproved: true
            },
            {
                centreCode: 'VU-SANMA-EC001',
                centreName: 'Santo Examination Centre',
                school: schools[1]._id,
                province: 'Sanma',
                address: 'Unity Park Road, Luganville, Santo',
                phoneNumber: '+678-77777',
                email: 'exam.centre2@vanuatu.gov.vu',
                capacity: {
                    totalSeats: 250,
                    regularSeats: 240,
                    specialNeedsSeats: 10
                },
                facilities: ['Wheelchair Access', 'CCTV', 'Backup Generator'],
                centreSupervisor: {
                    name: 'Supervisor Two',
                    phone: '+678-77778',
                    email: 'supervisor2@vanuatu.gov.vu',
                    qualifications: 'Bachelor of Education'
                },
                invigilators: [
                    {
                        name: 'Invigilator Two',
                        phone: '+678-88888',
                        email: 'inv2@vanuatu.gov.vu',
                        subject: 'English',
                        trainingCompleted: true
                    }
                ],
                isActive: true,
                isApproved: true
            }
        ];

        for (const centreData of examCentres) {
            await ExamCentre.create(centreData);
        }
        console.log('✅ Sample exam centres created successfully');

    } catch (error) {
        console.error('Error seeding exam centres:', error);
    }
};

// Seed Exams
const seedExams = async () => {
    try {
        const admin = await User.findOne({ role: 'administrator' });

        const exams = [
            {
                title: 'Year 12 Mathematics Final Exam',
                subject: 'Mathematics',
                grade: 'Year 12',
                examType: 'final',
                academicYear: '2025',
                term: 'Term 3',
                scheduledDate: new Date('2025-12-15'),
                startTime: '09:00',
                endTime: '12:00',
                duration: 180,
                venue: 'Main Examination Hall',
                totalMarks: 100,
                passingMarks: 50,
                instructions: 'Answer all questions. Calculator allowed. Show all working.',
                status: 'scheduled',
                isPublished: true,
                examiner: admin._id,
                createdBy: admin._id
            },
            {
                title: 'Year 10 English Literature Exam',
                subject: 'English',
                grade: 'Year 10',
                examType: 'final',
                academicYear: '2025',
                term: 'Term 3',
                scheduledDate: new Date('2025-12-18'),
                startTime: '10:00',
                endTime: '12:00',
                duration: 120,
                venue: 'Building A, Room 201',
                totalMarks: 80,
                passingMarks: 40,
                instructions: 'Answer 4 out of 6 questions. Write clearly.',
                status: 'scheduled',
                isPublished: true,
                examiner: admin._id,
                createdBy: admin._id
            },
            {
                title: 'Year 8 Science Mid-Term Assessment',
                subject: 'Science',
                grade: 'Year 8',
                examType: 'midterm',
                academicYear: '2025',
                term: 'Term 2',
                scheduledDate: new Date('2025-12-20'),
                startTime: '13:00',
                endTime: '14:30',
                duration: 90,
                venue: 'Science Laboratory',
                totalMarks: 60,
                passingMarks: 30,
                instructions: 'Multiple choice and short answer questions.',
                status: 'scheduled',
                isPublished: true,
                examiner: admin._id,
                createdBy: admin._id
            }
        ];

        await Exam.insertMany(exams);
        console.log('✅ Sample exams created successfully');
    } catch (error) {
        console.error('Error seeding exams:', error);
    }
};

// Seed Resources
const seedResources = async () => {
    try {
        const admin = await User.findOne({ role: 'administrator' });

        const resources = [
            {
                title: 'Year 12 Mathematics Past Papers 2024',
                description: 'Complete set of mathematics past papers from 2024 with marking schemes',
                category: 'past_papers',
                subject: 'Mathematics',
                grade: 'Year 12',
                academicYear: '2024',
                fileType: 'pdf',
                file: {
                    filename: 'y12_math_past_papers_2024.pdf',
                    path: '/uploads/resources/y12_math_past_papers_2024.pdf',
                    size: 2500000,
                    mimetype: 'application/pdf'
                },
                accessLevel: 'public',
                uploadedBy: admin._id,
                isActive: true,
                isFeatured: true
            },
            {
                title: 'English Grammar Guide',
                description: 'Comprehensive grammar guide for Year 10 students',
                category: 'study_guides',
                subject: 'English',
                grade: 'Year 10',
                fileType: 'pdf',
                file: {
                    filename: 'english_grammar_guide.pdf',
                    path: '/uploads/resources/english_grammar_guide.pdf',
                    size: 1800000,
                    mimetype: 'application/pdf'
                },
                accessLevel: 'public',
                uploadedBy: admin._id,
                isActive: true,
                isFeatured: false
            },
            {
                title: 'Science Practical Lab Manual',
                description: 'Laboratory experiments and safety guidelines for Year 8 Science',
                category: 'revision_materials',
                subject: 'Science',
                grade: 'Year 8',
                fileType: 'pdf',
                file: {
                    filename: 'science_lab_manual.pdf',
                    path: '/uploads/resources/science_lab_manual.pdf',
                    size: 3200000,
                    mimetype: 'application/pdf'
                },
                accessLevel: 'students',
                uploadedBy: admin._id,
                isActive: true,
                isFeatured: false
            },
            {
                title: 'Year 12 Mathematics Marking Scheme 2024',
                description: 'Detailed marking scheme with answer key',
                category: 'marking_schemes',
                subject: 'Mathematics',
                grade: 'Year 12',
                academicYear: '2024',
                fileType: 'pdf',
                file: {
                    filename: 'y12_math_marking_scheme_2024.pdf',
                    path: '/uploads/resources/y12_math_marking_scheme_2024.pdf',
                    size: 1200000,
                    mimetype: 'application/pdf'
                },
                accessLevel: 'teachers',
                uploadedBy: admin._id,
                isActive: true,
                isFeatured: false
            }
        ];

        await Resource.insertMany(resources);
        console.log('✅ Sample resources created successfully');
    } catch (error) {
        console.error('Error seeding resources:', error);
    }
};

// Seed Announcements
const seedAnnouncements = async () => {
    try {
        const admin = await User.findOne({ role: 'administrator' });

        const announcements = [
            {
                title: 'Examination Timetable Released',
                content: 'The final examination timetable for December 2025 has been published. Students can view their exam schedules in the portal. Please ensure you arrive 30 minutes before the start time.',
                category: 'exam',
                priority: 'high',
                targetAudience: ['all'],
                isPublished: true,
                publishDate: new Date(),
                isPinned: true,
                createdBy: admin._id
            },
            {
                title: 'New Study Materials Available',
                content: 'New study materials and past papers have been added to the resource library. Access them under the Resources section.',
                category: 'general',
                priority: 'normal',
                targetAudience: ['students', 'teachers'],
                isPublished: true,
                publishDate: new Date(),
                isPinned: false,
                createdBy: admin._id
            },
            {
                title: 'System Maintenance Notice',
                content: 'The portal will undergo scheduled maintenance on December 12, 2025 from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.',
                category: 'maintenance',
                priority: 'normal',
                targetAudience: ['all'],
                isPublished: true,
                publishDate: new Date(),
                isPinned: false,
                createdBy: admin._id
            },
            {
                title: 'Registration Deadline Extended',
                content: 'The deadline for Year 8 student registration has been extended to December 13, 2025. Schools should complete all pending registrations.',
                category: 'general',
                priority: 'high',
                targetAudience: ['administrators'],
                isPublished: true,
                publishDate: new Date(),
                isPinned: true,
                createdBy: admin._id
            }
        ];

        await Announcement.insertMany(announcements);
        console.log('✅ Sample announcements created successfully');
    } catch (error) {
        console.error('Error seeding announcements:', error);
    }
};

// Seed Candidates
const seedCandidates = async () => {
    try {
        const schools = await School.find();
        const admin = await User.findOne({ role: 'administrator' });
        
        if (schools.length === 0) {
            console.log('No schools found. Skipping candidate seeding.');
            return;
        }
        
        if (!admin) {
            console.log('No admin user found. Skipping candidate seeding.');
            return;
        }

        const candidates = [
            {
                candidateId: 'CAND-2025-001',
                firstName: 'John',
                lastName: 'Tari',
                dateOfBirth: new Date('2007-03-15'),
                gender: 'Male',
                email: 'john.tari@student.vu',
                phoneNumber: '+678 5551234',
                school: schools[0]._id,
                yearLevel: 'Y12',
                examYear: '2025',
                examType: 'National Exam',
                subjects: [
                    { subject: 'Mathematics', level: 'Advanced' },
                    { subject: 'English', level: 'Standard' },
                    { subject: 'Science', level: 'Advanced' }
                ],
                specialNeeds: { hasSpecialNeeds: false },
                registrationStatus: 'approved',
                registrationDate: new Date('2025-01-15'),
                createdBy: admin._id
            },
            {
                candidateId: 'CAND-2025-002',
                firstName: 'Mary',
                lastName: 'Kalo',
                dateOfBirth: new Date('2009-07-22'),
                gender: 'Female',
                email: 'mary.kalo@student.vu',
                phoneNumber: '+678 5555678',
                school: schools[0]._id,
                yearLevel: 'Y10',
                examYear: '2025',
                examType: 'National Exam',
                subjects: [
                    { subject: 'English', level: 'Standard' },
                    { subject: 'Mathematics', level: 'Standard' },
                    { subject: 'History', level: 'Standard' }
                ],
                specialNeeds: { hasSpecialNeeds: false },
                registrationStatus: 'verified',
                registrationDate: new Date('2025-01-20'),
                createdBy: admin._id
            },
            {
                candidateId: 'CAND-2025-003',
                firstName: 'Peter',
                lastName: 'Maliu',
                dateOfBirth: new Date('2011-11-08'),
                gender: 'Male',
                email: 'peter.maliu@student.vu',
                phoneNumber: '+678 5559012',
                school: schools[0]._id,
                yearLevel: 'Y8',
                examYear: '2025',
                examType: 'Provincial Exam',
                subjects: [
                    { subject: 'Science', level: 'Foundation' },
                    { subject: 'Mathematics', level: 'Foundation' },
                    { subject: 'English', level: 'Foundation' }
                ],
                specialNeeds: { hasSpecialNeeds: false },
                registrationStatus: 'submitted',
                registrationDate: new Date('2025-02-01'),
                createdBy: admin._id
            }
        ];

        for (const candidateData of candidates) {
            await Candidate.create(candidateData);
        }
        console.log('✅ Sample candidates created successfully');
    } catch (error) {
        console.error('Error seeding candidates:', error);
    }
};

// Seed Assessments
const seedAssessments = async () => {
    try {
        const teacher = await User.findOne({ role: 'teacher' });
        const students = await User.find({ role: 'student' });

        if (!teacher || students.length === 0) {
            console.log('No teacher or students found. Skipping assessment seeding.');
            return;
        }

        const assessments = [
            {
                title: 'Mathematics Assignment - Algebra',
                description: 'Complete exercises on quadratic equations and factorization',
                type: 'assignment',
                subject: 'Mathematics',
                grade: 'Year 12',
                teacher: teacher._id,
                assignedTo: students.map(s => s._id),
                dueDate: new Date('2025-12-20'),
                totalMarks: 50,
                passingMarks: 25,
                instructions: 'Show all working. Submit handwritten or typed solutions.',
                attachments: [],
                status: 'active'
            },
            {
                title: 'English Literature Essay',
                description: 'Write a 1000-word essay analyzing a Shakespeare play',
                type: 'assignment',
                subject: 'English',
                grade: 'Year 10',
                teacher: teacher._id,
                assignedTo: students.map(s => s._id),
                dueDate: new Date('2025-12-22'),
                totalMarks: 40,
                passingMarks: 20,
                instructions: 'Use proper citations. Include bibliography.',
                attachments: [],
                status: 'active'
            },
            {
                title: 'Science Project - Ecosystems',
                description: 'Create a presentation on local ecosystem biodiversity',
                type: 'project',
                subject: 'Science',
                grade: 'Year 8',
                teacher: teacher._id,
                assignedTo: students.map(s => s._id),
                dueDate: new Date('2025-12-25'),
                totalMarks: 30,
                passingMarks: 15,
                instructions: 'Include photos and diagrams. Prepare 5-minute presentation.',
                attachments: [],
                status: 'active'
            }
        ];

        await Assessment.insertMany(assessments);
        console.log('✅ Sample assessments created successfully');
    } catch (error) {
        console.error('Error seeding assessments:', error);
    }
};

// Seed Submissions
const seedSubmissions = async () => {
    try {
        const student = await User.findOne({ role: 'student' });
        const assessments = await Assessment.find();

        if (!student || assessments.length === 0) {
            console.log('No student or assessments found. Skipping submission seeding.');
            return;
        }

        const submissions = [
            {
                assessment: assessments[0]._id,
                student: student._id,
                submissionDate: new Date('2025-12-08'),
                content: 'Completed all algebra exercises with detailed solutions.',
                attachments: [
                    {
                        filename: 'algebra_assignment.pdf',
                        path: '/uploads/submissions/algebra_assignment.pdf',
                        fileType: 'pdf',
                        uploadDate: new Date('2025-12-08')
                    }
                ],
                status: 'submitted',
                isLate: false
            },
            {
                assessment: assessments[1]._id,
                student: student._id,
                submissionDate: new Date('2025-12-09'),
                content: 'Essay on Macbeth with character analysis and themes.',
                attachments: [
                    {
                        filename: 'macbeth_essay.docx',
                        path: '/uploads/submissions/macbeth_essay.docx',
                        fileType: 'docx',
                        uploadDate: new Date('2025-12-09')
                    }
                ],
                status: 'graded',
                isLate: false,
                grade: {
                    score: 35,
                    totalMarks: 40,
                    percentage: 87.5,
                    letterGrade: 'A',
                    feedback: 'Excellent analysis with strong supporting evidence.',
                    gradedBy: await User.findOne({ role: 'teacher' }).then(t => t._id),
                    gradedDate: new Date('2025-12-10')
                }
            }
        ];

        await Submission.insertMany(submissions);
        console.log('✅ Sample submissions created successfully');
    } catch (error) {
        console.error('Error seeding submissions:', error);
    }
};

// Seed Results
const seedResults = async () => {
    try {
        const student = await User.findOne({ role: 'student' });
        const teacher = await User.findOne({ role: 'teacher' });
        const exams = await Exam.find();

        if (!student || !teacher || exams.length === 0) {
            console.log('No student, teacher, or exams found. Skipping result seeding.');
            return;
        }

        const results = [
            {
                student: student._id,
                exam: exams[0]._id,
                subject: 'Mathematics',
                grade: 'Year 12',
                academicYear: '2025',
                term: 'Term 3',
                scores: {
                    obtained: 85,
                    total: 100,
                    percentage: 85
                },
                letterGrade: 'A',
                gpa: 4.0,
                status: 'published',
                remarks: 'Excellent performance',
                isPublished: true,
                publishedAt: new Date('2025-12-10'),
                enteredBy: teacher._id,
                verifiedBy: teacher._id,
                verifiedAt: new Date('2025-12-10')
            },
            {
                student: student._id,
                exam: exams[1]._id,
                subject: 'English',
                grade: 'Year 10',
                academicYear: '2025',
                term: 'Term 3',
                scores: {
                    obtained: 68,
                    total: 80,
                    percentage: 85
                },
                letterGrade: 'A',
                gpa: 4.0,
                status: 'published',
                remarks: 'Strong writing skills demonstrated',
                isPublished: true,
                publishedAt: new Date('2025-12-10'),
                enteredBy: teacher._id,
                verifiedBy: teacher._id,
                verifiedAt: new Date('2025-12-10')
            },
            {
                student: student._id,
                exam: exams[2]._id,
                subject: 'Science',
                grade: 'Year 8',
                academicYear: '2025',
                term: 'Term 2',
                scores: {
                    obtained: 48,
                    total: 60,
                    percentage: 80
                },
                letterGrade: 'B+',
                gpa: 3.5,
                status: 'published',
                remarks: 'Good understanding of concepts',
                isPublished: true,
                publishedAt: new Date('2025-12-10'),
                enteredBy: teacher._id,
                verifiedBy: teacher._id,
                verifiedAt: new Date('2025-12-10')
            }
        ];

        await Result.insertMany(results);
        console.log('✅ Sample results created successfully');
    } catch (error) {
        console.error('Error seeding results:', error);
    }
};

const seed = async () => {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();

    await seedUsers();
    await seedSchools();
    await seedExamCentres();
    await seedExams();
    await seedResources();
    await seedAnnouncements();
    await seedCandidates();
    await seedAssessments();
    await seedSubmissions();
    await seedResults();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Default Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Admin:           ${config.admin.email} / ${config.admin.password}`);
    console.log('Teacher:         teacher@vanuatu.gov.vu / Teacher123!');
    console.log('Examiner:        examiner@vanuatu.gov.vu / Examiner123!');
    console.log('Moderator:       moderator@vanuatu.gov.vu / Moderator123!');
    console.log('Provincial:      provincial@vanuatu.gov.vu / Provincial123!');
    console.log('Student:         student@vanuatu.gov.vu / Student123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
};

const clearDatabase = async () => {
    console.log('🗑️  Clearing database...\n');

    await connectDB();

    await User.deleteMany({});
    await School.deleteMany({});
    await ExamCentre.deleteMany({});
    await Exam.deleteMany({});
    await Resource.deleteMany({});
    await Announcement.deleteMany({});
    await Candidate.deleteMany({});
    await Assessment.deleteMany({});
    await Submission.deleteMany({});
    await Result.deleteMany({});

    console.log('✅ Database cleared successfully!\n');

    process.exit(0);
};

// Check command line arguments
const command = process.argv[2];

if (command === 'clear') {
    clearDatabase();
} else {
    seed();
}
