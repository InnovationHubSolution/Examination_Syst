# Account Creation Configuration Guide

## Overview
This guide documents the complete account creation system configuration for the Vanuatu Examination Portal.

## Features Implemented

### 1. Frontend Registration Form (`client/src/pages/Auth/Register.jsx`)

#### Fields for All Users
- ✅ First Name (required)
- ✅ Last Name (required)
- ✅ Email Address (required, validated)
- ✅ Password (required, minimum 8 characters)
- ✅ Confirm Password (required, must match)
- ✅ Role Selection (Student or Teacher)

#### Student-Specific Fields
- Student ID (optional, can be assigned later)
- School (optional)
- Grade (optional)

#### Teacher-Specific Fields
- Teacher ID (optional, can be assigned later)
- School (optional)
- Subjects (comma-separated list, converted to array)
- Phone Number (optional)

#### Styling
- Frosted glass Paper component (elevation 24)
- Purple gradient background matching Login page
- Responsive grid layout
- Helper text for all fields

### 2. Backend Registration API (`server/routes/auth.js`)

#### Validation
- ✅ Required fields: firstName, lastName, email, password
- ✅ Email format validation (regex)
- ✅ Password length validation (minimum 8 characters)
- ✅ Duplicate email detection
- ✅ Duplicate studentId detection (if provided)
- ✅ Duplicate teacherId detection (if provided)
- ✅ Mongoose validation error handling

#### Data Processing
- ✅ Hash password before storing (via User model pre-save hook)
- ✅ Generate JWT token upon successful registration
- ✅ Store subjects as array for teachers
- ✅ Set default role to 'student' if not provided
- ✅ Return user data (excluding password) with token

#### Response Structure
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student",
    "studentId": "STU001",
    "teacherId": null,
    "school": "Port Vila Primary",
    "grade": "Year 6",
    "subjects": []
  }
}
```

### 3. Authentication Context (`client/src/contexts/AuthContext.jsx`)

#### Register Function
- ✅ Sends POST request to `/api/auth/register`
- ✅ Stores JWT token in localStorage
- ✅ Sets Authorization header for subsequent requests
- ✅ Updates user state and authentication status
- ✅ Shows success/error toast notifications
- ✅ Returns success status and error message

### 4. User Model (`server/models/User.js`)

#### Schema Fields
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, min 8 chars, not selected by default),
  role: String (enum: student, teacher, administrator, etc.),
  studentId: String (unique, sparse index),
  teacherId: String (unique, sparse index),
  school: String,
  grade: String,
  subjects: [String],
  phoneNumber: String,
  dateOfBirth: Date,
  address: Object,
  province: String,
  profileImage: String,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Middleware
- ✅ Pre-save hook: Hash password with bcrypt (10 salt rounds)
- ✅ matchPassword method: Compare entered password with hashed password

## API Endpoints

### Register New User
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "student",
  "studentId": "STU12345",
  "school": "Port Vila Secondary",
  "grade": "Year 10"
}

Response (201 Created):
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Register Teacher
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "password": "TeacherPass123!",
  "role": "teacher",
  "teacherId": "TCH789",
  "school": "Port Vila High School",
  "subjects": ["Mathematics", "Physics"],
  "phoneNumber": "+678 12345"
}
```

## Error Handling

### Validation Errors
- Missing required fields: 400 Bad Request
- Invalid email format: 400 Bad Request
- Password too short: 400 Bad Request
- Duplicate email: 400 Bad Request
- Duplicate studentId/teacherId: 400 Bad Request

### Server Errors
- Database errors: 500 Internal Server Error
- Validation errors: 400 Bad Request with field-specific messages

## Testing

### Test Student Registration
```bash
# PowerShell
$body = @{
    firstName = "Test"
    lastName = "Student"
    email = "test.student@example.com"
    password = "Student123!"
    role = "student"
    studentId = "STU999"
    school = "Test School"
    grade = "Year 8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test Teacher Registration
```bash
# PowerShell
$body = @{
    firstName = "Test"
    lastName = "Teacher"
    email = "test.teacher@example.com"
    password = "Teacher123!"
    role = "teacher"
    teacherId = "TCH999"
    school = "Test School"
    subjects = @("Math", "Science")
    phoneNumber = "+678 99999"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## Configuration Files

### Environment Variables (`.env`)
```
MONGODB_URI=mongodb://localhost:27017/vanuatu_examination_portal
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
PORT=5000
```

### Vite Proxy (`client/vite.config.js`)
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

## Navigation Flow

1. User visits `/register` (public route)
2. User fills out registration form
3. Frontend validates password match and length
4. Frontend sends POST to `/api/auth/register`
5. Backend validates all fields
6. Backend creates user with hashed password
7. Backend generates JWT token
8. Frontend stores token and updates auth state
9. User redirected to `/app/dashboard`
10. PublicRoute prevents returning to `/register` when authenticated

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token authentication
- ✅ Password minimum length enforcement (8 characters)
- ✅ Email uniqueness validation
- ✅ Student/Teacher ID uniqueness validation
- ✅ Secure password field (not selected by default in queries)
- ✅ Token expiration (30 days default)
- ✅ Protected routes requiring authentication

## Future Enhancements

### Suggested Improvements
- [ ] Email verification system
- [ ] Password strength indicator
- [ ] CAPTCHA for bot prevention
- [ ] Social authentication (Google, Microsoft)
- [ ] Multi-factor authentication (MFA)
- [ ] Admin approval for teacher accounts
- [ ] Automatic student ID generation
- [ ] Province-based school selection
- [ ] Password reset functionality
- [ ] Account activation emails

### Admin User Creation
- [ ] Add Create User button in UserManagement.jsx
- [ ] Admin can create accounts with all roles
- [ ] Admin can assign custom permissions
- [ ] Bulk user import via CSV
- [ ] User invitation system

## Troubleshooting

### Common Issues

1. **"User already exists" error**
   - Email is already registered
   - Check for duplicate email in database
   - Use forgot password if account exists

2. **"Student ID already exists"**
   - StudentId must be unique
   - Leave blank for auto-generation (if implemented)
   - Contact admin to check existing records

3. **"Password must be at least 8 characters"**
   - Ensure password meets minimum length
   - Use strong password with mix of characters

4. **Registration succeeds but no redirect**
   - Check browser console for errors
   - Verify token is stored in localStorage
   - Check AuthContext state updates

5. **Cannot access dashboard after registration**
   - Check if token is valid
   - Verify ProtectedRoute configuration
   - Check user role permissions

## Support

For issues or questions:
- Check server logs: `npm run server`
- Check browser console for frontend errors
- Verify MongoDB connection
- Test API endpoints directly with tools like Postman or curl
- Review this guide for proper configuration

---

Last Updated: December 10, 2025
