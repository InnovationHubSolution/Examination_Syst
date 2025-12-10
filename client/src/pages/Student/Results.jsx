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
    Alert,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import { TrendingUp, Award, BarChart } from 'lucide-react';
import axios from 'axios';

const Results = () => {
    const [results, setResults] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/results/my-results', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const results = response.data.results || response.data;
            setResults(results);
            calculateStats(results);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        if (data.length === 0) return;

        const scores = data.map(r => r.score).filter(s => s !== undefined);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highestScore = Math.max(...scores);
        const publishedCount = data.filter(r => r.published).length;

        setStats({
            average: avgScore.toFixed(1),
            highest: highestScore,
            total: data.length,
            published: publishedCount
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getGradeColor = (grade) => {
        const colors = {
            'A': 'success',
            'B': 'primary',
            'C': 'info',
            'D': 'warning',
            'F': 'error'
        };
        return colors[grade?.toUpperCase()] || 'default';
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
                    <TrendingUp size={32} style={{ marginRight: 16 }} />
                    <Box>
                        <Typography variant="h4">My Results</Typography>
                        <Typography variant="body2" color="text.secondary">
                            View your exam results and grades
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {stats && (
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography color="textSecondary" variant="body2">
                                                Average Score
                                            </Typography>
                                            <Typography variant="h4">{stats.average}%</Typography>
                                        </Box>
                                        <BarChart size={40} color="#1976d2" />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography color="textSecondary" variant="body2">
                                                Highest Score
                                            </Typography>
                                            <Typography variant="h4">{stats.highest}%</Typography>
                                        </Box>
                                        <Award size={40} color="#4caf50" />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography color="textSecondary" variant="body2">
                                                Total Results
                                            </Typography>
                                            <Typography variant="h4">{stats.total}</Typography>
                                        </Box>
                                        <TrendingUp size={40} color="#9c27b0" />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography color="textSecondary" variant="body2">
                                                Published
                                            </Typography>
                                            <Typography variant="h4">{stats.published}</Typography>
                                        </Box>
                                        <Award size={40} color="#ff9800" />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                <Paper elevation={3}>
                    <Box sx={{ p: 2, bgcolor: 'primary.main' }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                            Exam Results
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Exam</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Score</TableCell>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No results available yet
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    results.map((result) => (
                                        <TableRow key={result._id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {result.exam?.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{result.exam?.subject}</TableCell>
                                            <TableCell>{formatDate(result.exam?.date)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {result.score}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={result.grade}
                                                    color={getGradeColor(result.grade)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {result.published ? (
                                                    <Chip label="Published" color="success" size="small" />
                                                ) : (
                                                    <Chip label="Pending" color="warning" size="small" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </Container>
    );
};

export default Results;

