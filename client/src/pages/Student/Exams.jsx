import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { BookOpen, Calendar, Clock, MapPin } from 'lucide-react';
import axios from 'axios';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/exams/my-exams', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setExams(response.data.exams || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch exams');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusChip = (examDate) => {
        const now = new Date();
        const date = new Date(examDate);

        if (date < now) {
            return <Chip label="Completed" color="default" size="small" />;
        } else if (date - now < 7 * 24 * 60 * 60 * 1000) {
            return <Chip label="Upcoming" color="warning" size="small" />;
        } else {
            return <Chip label="Scheduled" color="primary" size="small" />;
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
                    <BookOpen size={32} style={{ marginRight: 16 }} />
                    <Box>
                        <Typography variant="h4">My Exams</Typography>
                        <Typography variant="body2" color="text.secondary">
                            View your registered examinations
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {exams.length === 0 ? (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                        <BookOpen size={48} style={{ color: '#999', marginBottom: 16 }} />
                        <Typography variant="h6" color="text.secondary">
                            No exams registered
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You haven't registered for any exams yet
                        </Typography>
                    </Paper>
                ) : (
                    <Paper elevation={3}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Exam</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subject</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date & Time</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {exams.map((exam) => (
                                        <TableRow key={exam._id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {exam.title}
                                                </Typography>
                                                {exam.description && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {exam.description.substring(0, 50)}
                                                        {exam.description.length > 50 ? '...' : ''}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{exam.subject}</TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2">
                                                        {formatDate(exam.date)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                                        {formatTime(exam.date)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{exam.duration} min</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <MapPin size={16} style={{ marginRight: 4 }} />
                                                    {exam.location || 'TBA'}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{getStatusChip(exam.date)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Box>
        </Container>
    );
};

export default Exams;

