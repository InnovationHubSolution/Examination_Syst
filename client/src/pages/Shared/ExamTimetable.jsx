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
    TextField,
    MenuItem,
    Grid,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { Calendar, Clock, BookOpen, MapPin } from 'lucide-react';
import axios from 'axios';

const ExamTimetable = () => {
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        subject: '',
        grade: '',
        search: ''
    });

    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);

    useEffect(() => {
        fetchExams();
    }, []);

    useEffect(() => {
        filterExams();
    }, [exams, filters]);

    const fetchExams = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/exams', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setExams(response.data.exams || response.data.timetable || response.data);

            // Extract unique subjects and grades for filters
            const uniqueSubjects = [...new Set(response.data.map(exam => exam.subject))];
            const uniqueGrades = [...new Set(response.data.map(exam => exam.grade))];
            setSubjects(uniqueSubjects.sort());
            setGrades(uniqueGrades.sort());
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch exam timetable');
        } finally {
            setLoading(false);
        }
    };

    const filterExams = () => {
        let filtered = [...exams];

        if (filters.subject) {
            filtered = filtered.filter(exam => exam.subject === filters.subject);
        }

        if (filters.grade) {
            filtered = filtered.filter(exam => exam.grade === filters.grade);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(exam =>
                exam.title?.toLowerCase().includes(searchLower) ||
                exam.subject?.toLowerCase().includes(searchLower) ||
                exam.description?.toLowerCase().includes(searchLower)
            );
        }

        // Sort by date
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

        setFilteredExams(filtered);
    };

    const handleFilterChange = (field, value) => {
        setFilters({
            ...filters,
            [field]: value
        });
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
                    <Calendar size={32} style={{ marginRight: 16 }} />
                    <Box>
                        <Typography variant="h4">Exam Timetable</Typography>
                        <Typography variant="body2" color="text.secondary">
                            View all scheduled examinations
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Filters
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Search"
                                placeholder="Search by title or subject"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                select
                                label="Subject"
                                value={filters.subject}
                                onChange={(e) => handleFilterChange('subject', e.target.value)}
                            >
                                <MenuItem value="">All Subjects</MenuItem>
                                {subjects.map((subject) => (
                                    <MenuItem key={subject} value={subject}>
                                        {subject}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                select
                                label="Grade"
                                value={filters.grade}
                                onChange={(e) => handleFilterChange('grade', e.target.value)}
                            >
                                <MenuItem value="">All Grades</MenuItem>
                                {grades.map((grade) => (
                                    <MenuItem key={grade} value={grade}>
                                        {grade}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={3}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'primary.main' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Exam</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subject</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Grade</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date & Time</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredExams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No exams found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredExams.map((exam) => (
                                        <TableRow key={exam._id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <BookOpen size={18} style={{ marginRight: 8 }} />
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {exam.title}
                                                        </Typography>
                                                        {exam.description && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {exam.description.substring(0, 50)}
                                                                {exam.description.length > 50 ? '...' : ''}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{exam.subject}</TableCell>
                                            <TableCell>{exam.grade}</TableCell>
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {filteredExams.length} of {exams.length} exams
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default ExamTimetable;

