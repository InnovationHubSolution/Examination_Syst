import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Public Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Common Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';

// Student Pages
import StudentExams from './pages/Student/Exams';
import StudentAssessments from './pages/Student/Assessments';
import StudentResources from './pages/Student/Resources';
import StudentSubmissions from './pages/Student/Submissions';
import StudentResults from './pages/Student/Results';
import StudentCertificates from './pages/Student/Certificates';

// Teacher Pages
import TeacherAssessments from './pages/Teacher/Assessments';
import TeacherSubmissions from './pages/Teacher/Submissions';
import TeacherGrading from './pages/Teacher/Grading';

// Admin Pages
import UserManagement from './pages/Admin/UserManagement';
import ExamManagement from './pages/Admin/ExamManagement';
import ResourceManagement from './pages/Admin/ResourceManagement';
import Announcements from './pages/Admin/Announcements';
import Reports from './pages/Admin/Reports';

// Shared Pages
import ExamTimetable from './pages/Shared/ExamTimetable';
import ResourceLibrary from './pages/Shared/ResourceLibrary';
import AnnouncementBoard from './pages/Shared/AnnouncementBoard';
import CertificateVerification from './pages/Shared/CertificateVerification';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-certificate" element={<CertificateVerification />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="exam-timetable" element={<ExamTimetable />} />
                <Route path="resources" element={<ResourceLibrary />} />
                <Route path="announcements" element={<AnnouncementBoard />} />

                {/* Student Routes */}
                <Route
                    path="student/exams"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentExams />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="student/assessments"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentAssessments />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="student/submissions"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentSubmissions />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="student/results"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentResults />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="student/certificates"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentCertificates />
                        </ProtectedRoute>
                    }
                />

                {/* Teacher Routes */}
                <Route
                    path="teacher/assessments"
                    element={
                        <ProtectedRoute allowedRoles={['teacher', 'administrator']}>
                            <TeacherAssessments />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="teacher/submissions"
                    element={
                        <ProtectedRoute allowedRoles={['teacher', 'administrator']}>
                            <TeacherSubmissions />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="teacher/grading"
                    element={
                        <ProtectedRoute allowedRoles={['teacher', 'administrator']}>
                            <TeacherGrading />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['administrator']}>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/exams"
                    element={
                        <ProtectedRoute allowedRoles={['administrator']}>
                            <ExamManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/resources"
                    element={
                        <ProtectedRoute allowedRoles={['administrator']}>
                            <ResourceManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/announcements"
                    element={
                        <ProtectedRoute allowedRoles={['administrator', 'teacher']}>
                            <Announcements />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/reports"
                    element={
                        <ProtectedRoute allowedRoles={['administrator', 'teacher']}>
                            <Reports />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default App;
