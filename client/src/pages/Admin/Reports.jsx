import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Divider
} from '@mui/material';
import {
    People,
    School,
    Assignment,
    TrendingUp,
    Download,
    Assessment
} from '@mui/icons-material';
import axios from 'axios';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalExams: 0,
        totalAssessments: 0,
        totalSubmissions: 0
    });
    const [reportType, setReportType] = useState('overview');
    const [timeRange, setTimeRange] = useState('all');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch users count
            const usersRes = await axios.get('/api/users');
            const users = usersRes.data.users || usersRes.data;
            
            // Fetch exams count
            const examsRes = await axios.get('/api/exams');
            const exams = examsRes.data.exams || examsRes.data.items || examsRes.data;

            // Fetch assessments count
            const assessmentsRes = await axios.get('/api/assessments');
            const assessments = assessmentsRes.data.assessments || assessmentsRes.data.items || assessmentsRes.data;

            setStats({
                totalUsers: users.length,
                totalStudents: users.filter(u => u.role === 'student').length,
                totalTeachers: users.filter(u => u.role === 'teacher').length,
                totalExaminers: users.filter(u => u.role === 'examiner').length,
                totalAdministrators: users.filter(u => u.role === 'administrator').length,
                totalExams: exams.length,
                totalAssessments: assessments.length,
                activeExams: exams.filter(e => e.status === 'published').length,
                upcomingExams: exams.filter(e => e.status === 'upcoming').length,
            });

            setLoading(false);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err.response?.data?.message || 'Failed to load statistics');
            setLoading(false);
        }
    };

    const handleExportReport = () => {
        // Prepare CSV data
        const csvData = [
            ['Vanuatu Examination Portal - Report'],
            ['Generated:', new Date().toLocaleString()],
            [''],
            ['Metric', 'Value'],
            ['Total Users', stats.totalUsers],
            ['Total Students', stats.totalStudents],
            ['Total Teachers', stats.totalTeachers],
            ['Total Examiners', stats.totalExaminers],
            ['Total Administrators', stats.totalAdministrators],
            ['Total Exams', stats.totalExams],
            ['Active Exams', stats.activeExams],
            ['Upcoming Exams', stats.upcomingExams],
            ['Total Assessments', stats.totalAssessments],
        ];

        const csv = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vanuatu-portal-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Reports & Analytics
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleExportReport}
                >
                    Export Report
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Report Type</InputLabel>
                        <Select
                            value={reportType}
                            label="Report Type"
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <MenuItem value="overview">Overview</MenuItem>
                            <MenuItem value="users">User Statistics</MenuItem>
                            <MenuItem value="exams">Exam Statistics</MenuItem>
                            <MenuItem value="performance">Performance Metrics</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            label="Time Range"
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <MenuItem value="all">All Time</MenuItem>
                            <MenuItem value="month">This Month</MenuItem>
                            <MenuItem value="quarter">This Quarter</MenuItem>
                            <MenuItem value="year">This Year</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats.totalUsers}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Total Users
                                    </Typography>
                                </Box>
                                <People sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats.totalStudents}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Students
                                    </Typography>
                                </Box>
                                <School sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats.totalExams}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Total Exams
                                    </Typography>
                                </Box>
                                <Assignment sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats.totalAssessments}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Assessments
                                    </Typography>
                                </Box>
                                <Assessment sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Detailed Statistics */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            User Distribution
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Students</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 8,
                                            bgcolor: '#e0e0e0',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(stats.totalStudents / stats.totalUsers) * 100}%`,
                                                height: '100%',
                                                bgcolor: '#667eea',
                                                borderRadius: 4
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                                        {stats.totalStudents}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Teachers</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 8,
                                            bgcolor: '#e0e0e0',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(stats.totalTeachers / stats.totalUsers) * 100}%`,
                                                height: '100%',
                                                bgcolor: '#4caf50',
                                                borderRadius: 4
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                                        {stats.totalTeachers}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Examiners</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 8,
                                            bgcolor: '#e0e0e0',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(stats.totalExaminers / stats.totalUsers) * 100}%`,
                                                height: '100%',
                                                bgcolor: '#2196f3',
                                                borderRadius: 4
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                                        {stats.totalExaminers}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Administrators</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 8,
                                            bgcolor: '#e0e0e0',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(stats.totalAdministrators / stats.totalUsers) * 100}%`,
                                                height: '100%',
                                                bgcolor: '#f44336',
                                                borderRadius: 4
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                                        {stats.totalAdministrators}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Exam Status
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Active Exams</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 8,
                                            bgcolor: '#e0e0e0',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${stats.totalExams > 0 ? (stats.activeExams / stats.totalExams) * 100 : 0}%`,
                                                height: '100%',
                                                bgcolor: '#4caf50',
                                                borderRadius: 4
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                                        {stats.activeExams}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Upcoming Exams</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 8,
                                            bgcolor: '#e0e0e0',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${stats.totalExams > 0 ? (stats.upcomingExams / stats.totalExams) * 100 : 0}%`,
                                                height: '100%',
                                                bgcolor: '#ff9800',
                                                borderRadius: 4
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                                        {stats.upcomingExams}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Total Assessments</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 8,
                                            bgcolor: '#e0e0e0',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                bgcolor: '#2196f3',
                                                borderRadius: 4
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                                        {stats.totalAssessments}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
