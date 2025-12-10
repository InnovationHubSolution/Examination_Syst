const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const School = require('../models/School');
const ExamCentre = require('../models/ExamCentre');
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
                district: 'Port Vila',
                address: {
                    street: 'Main Street',
                    city: 'Port Vila',
                    island: 'Efate'
                },
                contactInfo: {
                    phone: '+678-22222',
                    email: 'pvss@vanuatu.edu.vu'
                },
                schoolType: 'Public',
                principalName: 'Principal One',
                studentPopulation: 500,
                staffCount: 40,
                facilitiesAvailable: ['Computer Lab', 'Science Lab', 'Library', 'Sports Field'],
                status: 'active'
            },
            {
                schoolCode: 'VU-SANMA-001',
                schoolName: 'Santo Secondary School',
                province: 'Sanma',
                district: 'Luganville',
                address: {
                    street: 'Unity Park Road',
                    city: 'Luganville',
                    island: 'Santo'
                },
                contactInfo: {
                    phone: '+678-33333',
                    email: 'sss@vanuatu.edu.vu'
                },
                schoolType: 'Public',
                principalName: 'Principal Two',
                studentPopulation: 400,
                staffCount: 35,
                facilitiesAvailable: ['Computer Lab', 'Library', 'Sports Field'],
                status: 'active'
            },
            {
                schoolCode: 'VU-TAFEA-001',
                schoolName: 'Tanna Secondary School',
                province: 'Tafea',
                district: 'Isangel',
                address: {
                    street: 'School Road',
                    city: 'Isangel',
                    island: 'Tanna'
                },
                contactInfo: {
                    phone: '+678-44444',
                    email: 'tss@vanuatu.edu.vu'
                },
                schoolType: 'Public',
                principalName: 'Principal Three',
                studentPopulation: 300,
                staffCount: 25,
                facilitiesAvailable: ['Library', 'Sports Field'],
                status: 'active'
            }
        ];

        await School.insertMany(schools);
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
                capacity: {
                    totalSeats: 300,
                    regularSeats: 280,
                    specialNeedsSeats: 20
                },
                facilities: ['Wheelchair Access', 'Special Needs Room', 'CCTV', 'Generator'],
                centreSupervisor: {
                    name: 'Supervisor One',
                    phone: '+678-55555',
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
                status: 'active'
            },
            {
                centreCode: 'VU-SANMA-EC001',
                centreName: 'Santo Examination Centre',
                school: schools[1]._id,
                province: 'Sanma',
                capacity: {
                    totalSeats: 250,
                    regularSeats: 240,
                    specialNeedsSeats: 10
                },
                facilities: ['Wheelchair Access', 'CCTV', 'Generator'],
                centreSupervisor: {
                    name: 'Supervisor Two',
                    phone: '+678-77777',
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
                status: 'active'
            }
        ];

        await ExamCentre.insertMany(examCentres);
        console.log('✅ Sample exam centres created successfully');

    } catch (error) {
        console.error('Error seeding exam centres:', error);
    }
};

const seed = async () => {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();

    await seedUsers();
    await seedSchools();
    await seedExamCentres();

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
