import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { FileText, Calendar, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Assessments = () => {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/assessments/my-assessments', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAssessments(response.data.assessments || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch assessments');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusChip = (dueDate, submitted) => {
        if (submitted) {
            return <Chip label="Submitted" color="success" size="small" icon={<CheckCircle size={16} />} />;
        }

        const now = new Date();
        const due = new Date(dueDate);

        if (due < now) {
            return <Chip label="Overdue" color="error" size="small" />;
        } else if (due - now < 3 * 24 * 60 * 60 * 1000) {
            return <Chip label="Due Soon" color="warning" size="small" />;
        } else {
            return <Chip label="Pending" color="primary" size="small" />;
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FileText size={32} style={{ marginRight: 16 }} />
                    <Box>
                        <Typography variant="h4">My Assessments</Typography>
                        <Typography variant="body2" color="text.secondary">
                            View and submit your assignments
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {assessments.length === 0 ? (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                        <FileText size={48} style={{ color: '#999', marginBottom: 16 }} />
                        <Typography variant="h6" color="text.secondary">
                            No assessments available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Check back later for new assignments
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {assessments.map((assessment) => (
                            <Grid item xs={12} md={6} key={assessment._id}>
                                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                            <Typography variant="h6">
                                                {assessment.title}
                                            </Typography>
                                            {getStatusChip(assessment.dueDate, assessment.submitted)}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {assessment.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Calendar size={14} style={{ marginRight: 4 }} />
                                                Due: {formatDate(assessment.dueDate)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Subject: {assessment.exam?.subject || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Max Score: {assessment.maxScore} points
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => navigate(`/student/submissions?assessment=${assessment._id}`)}
                                        >
                                            {assessment.submitted ? 'View Submission' : 'Submit Work'}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default Assessments;

