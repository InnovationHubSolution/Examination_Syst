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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    LinearProgress,
    CircularProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    TrendingUp as TrendingUpIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    BarChart as BarChartIcon,
    Announcement as AnnouncementIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ title, value, icon, color, subtitle, change }) => (
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
                    {change && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <TrendingUpIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', mr: 0.5 }} />
                            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                                {change} from last month
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

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalExams: 0,
        totalSubmissions: 0,
        activeResources: 0,
        students: 0,
        teachers: 0,
        pendingReviews: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/reports/dashboard');
            console.log('Dashboard API response:', response.data);
            if (response.data.stats) {
                setStats({
                    totalUsers: response.data.stats.users?.total || 0,
                    totalExams: response.data.stats.exams?.total || 0,
                    totalSubmissions: response.data.stats.submissions?.total || 0,
                    activeResources: response.data.stats.results?.total || 0,
                    students: response.data.stats.users?.students || 0,
                    teachers: response.data.stats.users?.teachers || 0,
                    pendingReviews: response.data.stats.submissions?.pending || 0
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Still set loading to false even on error
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Administrator Dashboard 🎯
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            System overview and management
                        </Typography>
                    </Box>
                    <Chip
                        label="Admin Access"
                        color="error"
                        icon={<PeopleIcon />}
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        subtitle={`${stats.students} students, ${stats.teachers} teachers`}
                        icon={<PeopleIcon />}
                        color="#667eea"
                        change="+12"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Exams"
                        value={stats.totalExams}
                        subtitle="All examinations"
                        icon={<SchoolIcon />}
                        color="#f093fb"
                        change="+3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Submissions"
                        value={stats.totalSubmissions}
                        subtitle={`${stats.pendingReviews} pending review`}
                        icon={<AssignmentIcon />}
                        color="#4facfe"
                        change="+45"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Resources"
                        value={stats.activeResources}
                        subtitle="Learning materials"
                        icon={<BarChartIcon />}
                        color="#43e97b"
                        change="+8"
                    />
                </Grid>
            </Grid>

            {/* Management Sections */}
            <Grid container spacing={3}>
                {/* Quick Management */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            ⚙️ System Management
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PeopleIcon />}
                                    onClick={() => navigate('/app/admin/users')}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    User Management
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<SchoolIcon />}
                                    onClick={() => navigate('/app/admin/exams')}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    Exam Management
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<AssignmentIcon />}
                                    onClick={() => navigate('/app/admin/resources')}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    Resources
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<AnnouncementIcon />}
                                    onClick={() => navigate('/app/admin/announcements')}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    Announcements
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<BarChartIcon />}
                                    onClick={() => navigate('/app/admin/reports')}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    Reports
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            📊 System Activity
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Module</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Usage</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>User Management</TableCell>
                                        <TableCell>
                                            <Chip label="Active" color="success" size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={75}
                                                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="caption">75%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => navigate('/app/admin/users')}>
                                                <Visibility />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Exam System</TableCell>
                                        <TableCell>
                                            <Chip label="Active" color="success" size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={60}
                                                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="caption">60%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => navigate('/app/admin/exams')}>
                                                <Visibility />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Resources Library</TableCell>
                                        <TableCell>
                                            <Chip label="Active" color="success" size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={45}
                                                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="caption">45%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => navigate('/app/admin/resources')}>
                                                <Visibility />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* System Info & Notifications */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            🔔 System Notifications
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                                <Typography variant="body2" fontWeight="bold" color="info.dark">
                                    {stats.pendingReviews} Pending Reviews
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Submissions awaiting approval
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                                <Typography variant="body2" fontWeight="bold" color="success.dark">
                                    System Healthy
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    All modules operating normally
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                                <Typography variant="body2" fontWeight="bold" color="warning.dark">
                                    Backup Reminder
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Last backup: 2 days ago
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            📈 Performance
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    User Engagement
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={85}
                                    sx={{ height: 8, borderRadius: 4 }}
                                    color="success"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    85% active users
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    System Load
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={45}
                                    sx={{ height: 8, borderRadius: 4 }}
                                    color="primary"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    45% capacity
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" gutterBottom>
                                    Storage Used
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={62}
                                    sx={{ height: 8, borderRadius: 4 }}
                                    color="warning"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    62% of total storage
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;
