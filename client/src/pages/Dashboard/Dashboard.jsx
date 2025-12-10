import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent
} from '@mui/material';
import {
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    EmojiEvents as EmojiEventsIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const StatCard = ({ title, value, icon, color }) => (
    <Card>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                        {title}
                    </Typography>
                    <Typography variant="h4">{value}</Typography>
                </Box>
                <Box
                    sx={{
                        backgroundColor: color,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            if (user?.role === 'administrator' || user?.role === 'teacher') {
                const response = await axios.get('/api/reports/dashboard');
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStudentDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user?.firstName}!
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Upcoming Exams"
                    value="-"
                    icon={<SchoolIcon sx={{ color: 'white' }} />}
                    color="primary.main"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Pending Assessments"
                    value="-"
                    icon={<AssignmentIcon sx={{ color: 'white' }} />}
                    color="warning.main"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Average Score"
                    value="-"
                    icon={<TrendingUpIcon sx={{ color: 'white' }} />}
                    color="success.main"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Certificates"
                    value="-"
                    icon={<EmojiEventsIcon sx={{ color: 'white' }} />}
                    color="info.main"
                />
            </Grid>
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Quick Links
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Use the sidebar to navigate through the portal. You can view your exam timetable,
                        access learning resources, submit assignments, and check your results.
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderAdminDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                    Admin Dashboard
                </Typography>
            </Grid>
            {stats && (
                <>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Users"
                            value={stats.users?.total || 0}
                            icon={<SchoolIcon sx={{ color: 'white' }} />}
                            color="primary.main"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Exams"
                            value={stats.exams?.total || 0}
                            icon={<AssignmentIcon sx={{ color: 'white' }} />}
                            color="warning.main"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Submissions"
                            value={stats.submissions?.total || 0}
                            icon={<TrendingUpIcon sx={{ color: 'white' }} />}
                            color="success.main"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Published Results"
                            value={stats.results?.published || 0}
                            icon={<EmojiEventsIcon sx={{ color: 'white' }} />}
                            color="info.main"
                        />
                    </Grid>
                </>
            )}
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        System Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage users, exams, resources, and generate comprehensive reports from the admin panel.
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );

    return (
        <Container maxWidth="lg">
            {user?.role === 'student' && renderStudentDashboard()}
            {(user?.role === 'administrator' || user?.role === 'teacher') && renderAdminDashboard()}
        </Container>
    );
};

export default Dashboard;
