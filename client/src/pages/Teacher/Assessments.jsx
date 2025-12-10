import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import axios from 'axios';

const Assessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        exam: '',
        dueDate: '',
        maxScore: 100,
        instructions: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [assessmentsRes, examsRes] = await Promise.all([
                axios.get('/api/assessments', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/exams', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setAssessments(assessmentsRes.data.assessments || assessmentsRes.data);
            setExams(examsRes.data.exams || examsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (assessment = null) => {
        if (assessment) {
            setEditMode(true);
            setSelectedAssessment(assessment);
            setFormData({
                title: assessment.title,
                description: assessment.description,
                exam: assessment.exam._id || assessment.exam,
                dueDate: assessment.dueDate.split('T')[0],
                maxScore: assessment.maxScore,
                instructions: assessment.instructions || ''
            });
        } else {
            setEditMode(false);
            setSelectedAssessment(null);
            setFormData({
                title: '',
                description: '',
                exam: '',
                dueDate: '',
                maxScore: 100,
                instructions: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditMode(false);
        setSelectedAssessment(null);
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (editMode) {
                await axios.put(
                    `/api/assessments/${selectedAssessment._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccess('Assessment updated successfully!');
            } else {
                await axios.post(
                    '/api/assessments',
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccess('Assessment created successfully!');
            }
            handleCloseDialog();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assessment?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/assessments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Assessment deleted successfully!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete assessment');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                        <FileText size={32} style={{ marginRight: 16 }} />
                        <Box>
                            <Typography variant="h4">Assessments</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create and manage student assessments
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        onClick={() => handleOpenDialog()}
                    >
                        Create Assessment
                    </Button>
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

                <Paper elevation={3}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'primary.main' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Exam</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Max Score</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Submissions</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assessments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No assessments yet. Click "Create Assessment" to get started.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    assessments.map((assessment) => (
                                        <TableRow key={assessment._id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {assessment.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {assessment.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{assessment.exam?.title || 'N/A'}</TableCell>
                                            <TableCell>{formatDate(assessment.dueDate)}</TableCell>
                                            <TableCell>{assessment.maxScore}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={assessment.submissionsCount || 0}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(assessment)}
                                                >
                                                    <Edit size={18} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(assessment._id)}
                                                >
                                                    <Trash2 size={18} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editMode ? 'Edit Assessment' : 'Create Assessment'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            select
                            label="Exam"
                            value={formData.exam}
                            onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                            required
                        >
                            {exams.map((exam) => (
                                <MenuItem key={exam._id} value={exam._id}>
                                    {exam.title} - {exam.subject}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Due Date"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Maximum Score"
                            type="number"
                            value={formData.maxScore}
                            onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Instructions"
                            multiline
                            rows={4}
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.title || !formData.exam || !formData.dueDate}
                    >
                        {editMode ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Assessments;


