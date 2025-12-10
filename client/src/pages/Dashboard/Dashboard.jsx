import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import { Container, CircularProgress, Box } from '@mui/material';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Role-based dashboard rendering
    if (user?.role === 'student') {
        return <StudentDashboard />;
    }

    if (user?.role === 'teacher') {
        return <TeacherDashboard />;
    }

    if (user?.role === 'administrator') {
        return <AdminDashboard />;
    }

    // Default fallback for other roles (examiner, moderator, etc.)
    return (
        <Container>
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <h2>Welcome, {user?.firstName}!</h2>
                <p>Role: {user?.role}</p>
                <p>Your dashboard is being prepared.</p>
            </Box>
        </Container>
    );
};

export default Dashboard;
