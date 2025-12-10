import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Button,
    Chip,
    Avatar
} from '@mui/material';
import {
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    EmojiEvents as EmojiEventsIcon,
    TrendingUp as TrendingUpIcon,
    CalendarToday as CalendarIcon,
    MenuBook as MenuBookIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500 }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mt: 1 }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ opacity: 0.8 }}>
                    {React.cloneElement(icon, { sx: { fontSize: 48, color: 'white' } })}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        upcomingExams: 0,
        pendingAssignments: 0,
        averageScore: 0,
        certificates: 0
    });

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome back, {user?.firstName}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Here's your academic overview
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Upcoming Exams"
                        value={stats.upcomingExams}
                        subtitle="Next 30 days"
                        icon={<SchoolIcon />}
                        color="#667eea"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Tasks"
                        value={stats.pendingAssignments}
                        subtitle="Assignments due"
                        icon={<AssignmentIcon />}
                        color="#f093fb"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Average Score"
                        value={stats.averageScore ? `${stats.averageScore}%` : 'N/A'}
                        subtitle="All assessments"
                        icon={<TrendingUpIcon />}
                        color="#4facfe"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Certificates"
                        value={stats.certificates}
                        subtitle="Earned badges"
                        icon={<EmojiEventsIcon />}
                        color="#43e97b"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Recent Activity */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            📚 My Learning Journey
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ bgcolor: '#667eea' }}>
                                    <SchoolIcon />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1" fontWeight="bold">
                                        Role: Student
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Grade {user?.grade || 'Not specified'} • {user?.school || 'No school assigned'}
                                    </Typography>
                                </Box>
                                <Chip label="Active" color="success" size="small" />
                            </Box>

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                Quick Actions
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<CalendarIcon />}
                                        onClick={() => navigate('/app/exam-timetable')}
                                        sx={{ justifyContent: 'flex-start' }}
                                    >
                                        View Exam Timetable
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<AssignmentIcon />}
                                        onClick={() => navigate('/app/student/assessments')}
                                        sx={{ justifyContent: 'flex-start' }}
                                    >
                                        Pending Assessments
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<MenuBookIcon />}
                                        onClick={() => navigate('/app/resources')}
                                        sx={{ justifyContent: 'flex-start' }}
                                    >
                                        Study Resources
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<EmojiEventsIcon />}
                                        onClick={() => navigate('/app/student/results')}
                                        sx={{ justifyContent: 'flex-start' }}
                                    >
                                        View Results
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                {/* Upcoming Events */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            📅 Upcoming Events
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="No upcoming exams"
                                    secondary="Check the exam timetable for updates"
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudentDashboard;
