import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    People as PeopleIcon,
    Grade as GradeIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
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
                    {trend && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <TrendingUpIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', mr: 0.5 }} />
                            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                                {trend}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box sx={{ opacity: 0.8 }}>
                    {React.cloneElement(icon, { sx: { fontSize: 48, color: 'white' } })}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeClasses: 0,
        pendingGrading: 0,
        totalStudents: 0,
        completedAssessments: 0
    });
    const [recentSubmissions, setRecentSubmissions] = useState([]);

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Welcome, {user?.firstName}! 👨‍🏫
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your classes and assessments
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/app/teacher/assessments')}
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        Create Assessment
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Classes"
                        value={stats.activeClasses}
                        subtitle="Current semester"
                        icon={<SchoolIcon />}
                        color="#667eea"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Grading"
                        value={stats.pendingGrading}
                        subtitle="Awaiting review"
                        icon={<AssignmentIcon />}
                        color="#f093fb"
                        trend="+5 today"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Students"
                        value={stats.totalStudents}
                        subtitle="All classes"
                        icon={<PeopleIcon />}
                        color="#4facfe"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Completed"
                        value={stats.completedAssessments}
                        subtitle="This month"
                        icon={<GradeIcon />}
                        color="#43e97b"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Teacher Info */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            👤 Your Profile
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ bgcolor: '#667eea', width: 56, height: 56 }}>
                                    {user?.firstName?.charAt(0)}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1" fontWeight="bold">
                                        {user?.firstName} {user?.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Teacher
                                    </Typography>
                                    <Chip label={user?.teacherId || 'No ID'} size="small" sx={{ mt: 0.5 }} />
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    School
                                </Typography>
                                <Typography variant="body2">
                                    {user?.school || 'Not assigned'}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Subjects
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {user?.subjects && user.subjects.length > 0 ? (
                                        user.subjects.map((subject, index) => (
                                            <Chip key={index} label={subject} size="small" color="primary" variant="outlined" />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No subjects assigned
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => navigate('/app/profile')}
                                sx={{ mt: 2 }}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Quick Actions & Recent Activity */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            🚀 Quick Actions
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<AssignmentIcon />}
                                    onClick={() => navigate('/app/teacher/assessments')}
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    My Assessments
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<GradeIcon />}
                                    onClick={() => navigate('/app/teacher/grading')}
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Grade Submissions
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PeopleIcon />}
                                    onClick={() => navigate('/app/teacher/submissions')}
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    View Submissions
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            📋 Recent Submissions
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student</TableCell>
                                        <TableCell>Assessment</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                                No recent submissions
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TeacherDashboard;
