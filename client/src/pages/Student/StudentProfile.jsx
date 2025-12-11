import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Divider
} from '@mui/material';
import {
    School,
    Grade,
    EmojiEvents,
    TrendingUp,
    Assignment,
    Download
} from '@mui/icons-material';
import axios from 'axios';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function StudentProfile() {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentData, setStudentData] = useState({
        enrollment: [],
        grades: [],
        awards: [],
        placements: [],
        eligibleScholarships: []
    });
    const [gpa, setGpa] = useState(0);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId'); // Get from auth context

            const [enrollmentRes, gradesRes, awardsRes, placementRes, scholarshipsRes] = await Promise.all([
                axios.get(`/api/students/${userId}/enrollment`),
                axios.get(`/api/students/${userId}/grades`),
                axios.get(`/api/students/${userId}/awards`),
                axios.get(`/api/students/${userId}/placement`),
                axios.get(`/api/scholarships/student/${userId}/eligible`)
            ]);

            setStudentData({
                enrollment: enrollmentRes.data.data || [],
                grades: gradesRes.data.data || [],
                awards: awardsRes.data.data || [],
                placements: placementRes.data.data || [],
                eligibleScholarships: scholarshipsRes.data.data || []
            });

            setGpa(gradesRes.data.gpa || 0);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching student data:', err);
            setError(err.response?.data?.message || 'Failed to load student data');
            setLoading(false);
        }
    };

    const downloadTranscript = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.get(`/api/students/${userId}/transcript`);
            // TODO: Generate PDF from transcript data
            console.log('Transcript data:', response.data);
        } catch (err) {
            console.error('Error downloading transcript:', err);
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    My Academic Profile
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={downloadTranscript}
                    sx={{ background: 'linear-gradient(135deg, #3D9A9B 0%, #2B6F9E 100%)' }}
                >
                    Download Transcript
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #F5A623 0%, #E8902E 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {gpa}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Current GPA
                                    </Typography>
                                </Box>
                                <TrendingUp sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #3D9A9B 0%, #2B6F9E 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {studentData.grades.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Subjects
                                    </Typography>
                                </Box>
                                <School sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #2B6F9E 0%, #3D9A9B 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {studentData.awards.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Awards
                                    </Typography>
                                </Box>
                                <EmojiEvents sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #E8902E 0%, #F5A623 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {studentData.eligibleScholarships.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Eligible Scholarships
                                    </Typography>
                                </Box>
                                <Assignment sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            color: '#2B6F9E'
                        },
                        '& .Mui-selected': {
                            color: '#F5A623 !important'
                        }
                    }}
                >
                    <Tab label="Enrollment" />
                    <Tab label="Grades" />
                    <Tab label="Awards & Recognition" />
                    <Tab label="Placement" />
                    <Tab label="Scholarships" />
                </Tabs>
            </Paper>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>Current Enrollment</Typography>
                {studentData.enrollment.map((enrollment, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">School</Typography>
                                    <Typography variant="body1" fontWeight="bold">{enrollment.school}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="subtitle2" color="textSecondary">Grade</Typography>
                                    <Typography variant="body1" fontWeight="bold">{enrollment.grade}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                                    <Chip label={enrollment.status} color="success" size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Enrolled Subjects ({enrollment.subjects?.length || 0})
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {enrollment.subjects?.map((subject, idx) => (
                                            <Grid item xs={12} sm={6} md={4} key={idx}>
                                                <Chip
                                                    label={`${subject.subjectCode} - ${subject.subjectName}`}
                                                    size="small"
                                                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                ))}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>Academic Performance</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Subject</strong></TableCell>
                                <TableCell><strong>Year</strong></TableCell>
                                <TableCell><strong>Term</strong></TableCell>
                                <TableCell><strong>Grade</strong></TableCell>
                                <TableCell><strong>Percentage</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {studentData.grades.map((grade, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>{grade.subject.subjectName}</TableCell>
                                    <TableCell>{grade.academicYear}</TableCell>
                                    <TableCell>{grade.term}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={grade.finalGrade?.grade || '-'}
                                            color={grade.finalGrade?.status === 'Pass' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{grade.finalGrade?.percentage?.toFixed(1)}%</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={grade.finalGrade?.status || 'Pending'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>Awards & Recognition</Typography>
                <Grid container spacing={2}>
                    {studentData.awards.map((award, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <EmojiEvents sx={{ color: '#F5A623', fontSize: 40, mr: 2 }} />
                                        <Box>
                                            <Typography variant="h6">{award.awardName}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {award.awardType}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2">
                                        <strong>Year:</strong> {award.academicYear}
                                    </Typography>
                                    {award.subject && (
                                        <Typography variant="body2">
                                            <strong>Subject:</strong> {award.subject}
                                        </Typography>
                                    )}
                                    <Typography variant="body2">
                                        <strong>Date:</strong> {new Date(award.awardDate).toLocaleDateString()}
                                    </Typography>
                                    {award.description && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {award.description}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>Placement Information</Typography>
                {studentData.placements.map((placement, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" color="primary">
                                        {placement.institution.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {placement.placementType} • {placement.institution.location}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Program</Typography>
                                    <Typography variant="body1">{placement.program?.name || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                                    <Chip label={placement.applicationStatus} color="info" size="small" />
                                </Grid>
                                {placement.scholarship?.awarded && (
                                    <Grid item xs={12}>
                                        <Alert severity="success">
                                            <strong>Scholarship Awarded:</strong> {placement.scholarship.scholarshipName}
                                            <br />
                                            Provider: {placement.scholarship.provider}
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                ))}
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
                <Typography variant="h6" gutterBottom>
                    Available Scholarships ({studentData.eligibleScholarships.length} eligible)
                </Typography>
                <Grid container spacing={2}>
                    {studentData.eligibleScholarships.map((item, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {item.scholarship.scholarshipName}
                                    </Typography>
                                    <Chip
                                        label={item.scholarship.scholarshipType}
                                        size="small"
                                        sx={{ mb: 2, bgcolor: '#F5A623', color: 'white' }}
                                    />
                                    <Typography variant="body2" paragraph>
                                        <strong>Provider:</strong> {item.scholarship.provider.name}
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Value:</strong> {item.scholarship.value.amount} {item.scholarship.value.currency}
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <strong>Coverage:</strong> {item.scholarship.value.coverage}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Application Deadline:</strong>{' '}
                                        {new Date(item.scholarship.applicationPeriod.closeDate).toLocaleDateString()}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            mt: 2,
                                            background: 'linear-gradient(135deg, #3D9A9B 0%, #2B6F9E 100%)'
                                        }}
                                    >
                                        Apply Now
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>
        </Container>
    );
}
