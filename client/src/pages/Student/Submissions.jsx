import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid
} from '@mui/material';
import { Upload, FileText, Calendar, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [submissionData, setSubmissionData] = useState({
        content: '',
        attachmentUrl: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [submissionsRes, assessmentsRes] = await Promise.all([
                axios.get('/api/submissions/my-submissions', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/assessments/my-assessments', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setSubmissions(submissionsRes.data.submissions || submissionsRes.data);
            setAssessments(assessmentsRes.data.filter(a => !a.submitted));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (assessment) => {
        setSelectedAssessment(assessment);
        setOpenDialog(true);
        setSubmissionData({ content: '', attachmentUrl: '' });
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedAssessment(null);
        setSubmissionData({ content: '', attachmentUrl: '' });
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                '/api/submissions',
                {
                    assessment: selectedAssessment._id,
                    ...submissionData
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccess('Submission successful!');
            handleCloseDialog();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusChip = (status) => {
        const colors = {
            'submitted': 'primary',
            'graded': 'success',
            'late': 'error'
        };
        return <Chip label={status?.toUpperCase()} color={colors[status] || 'default'} size="small" />;
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Upload size={32} style={{ marginRight: 16 }} />
                        <Box>
                            <Typography variant="h4">My Submissions</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Submit work and track your submissions
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {assessments.length > 0 && (
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Pending Assessments
                        </Typography>
                        <Grid container spacing={2}>
                            {assessments.map((assessment) => (
                                <Grid item xs={12} sm={6} md={4} key={assessment._id}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            {assessment.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                            Due: {formatDate(assessment.dueDate)}
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="small"
                                            startIcon={<Upload size={16} />}
                                            onClick={() => handleOpenDialog(assessment)}
                                        >
                                            Submit
                                        </Button>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}

                <Paper elevation={3}>
                    <Box sx={{ p: 2, bgcolor: 'primary.main' }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                            Submission History
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Assessment</TableCell>
                                    <TableCell>Submitted On</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Score</TableCell>
                                    <TableCell>Feedback</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No submissions yet
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    submissions.map((submission) => (
                                        <TableRow key={submission._id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {submission.assessment?.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                                            <TableCell>{getStatusChip(submission.status)}</TableCell>
                                            <TableCell>
                                                {submission.score !== undefined
                                                    ? `${submission.score}/${submission.assessment?.maxScore}`
                                                    : 'Pending'}
                                            </TableCell>
                                            <TableCell>
                                                {submission.feedback || 'No feedback yet'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Submit: {selectedAssessment?.title}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Your Answer"
                            multiline
                            rows={6}
                            value={submissionData.content}
                            onChange={(e) => setSubmissionData({ ...submissionData, content: e.target.value })}
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Attachment URL (optional)"
                            placeholder="https://..."
                            value={submissionData.attachmentUrl}
                            onChange={(e) => setSubmissionData({ ...submissionData, attachmentUrl: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!submissionData.content}
                        startIcon={<Upload size={18} />}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Submissions;

