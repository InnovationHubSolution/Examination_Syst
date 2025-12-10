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
import { Award, Download, CheckCircle, Calendar } from 'lucide-react';
import axios from 'axios';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/certificates/my-certificates', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCertificates(response.data.certificates || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (certificate) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/certificates/${certificate._id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate-${certificate.certificateNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download certificate');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Award size={32} style={{ marginRight: 16 }} />
                    <Box>
                        <Typography variant="h4">My Certificates</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Download your examination certificates
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {certificates.length === 0 ? (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                        <Award size={48} style={{ color: '#999', marginBottom: 16 }} />
                        <Typography variant="h6" color="text.secondary">
                            No certificates available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Certificates will appear here once your results are published
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {certificates.map((certificate) => (
                            <Grid item xs={12} md={6} key={certificate._id}>
                                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1, bgcolor: 'primary.light', color: 'white', position: 'relative' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                            <Award size={48} />
                                            <CheckCircle size={24} />
                                        </Box>
                                        <Typography variant="h5" gutterBottom>
                                            Certificate of Achievement
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {certificate.exam?.title}
                                        </Typography>
                                        <Chip
                                            label={certificate.certificateNumber}
                                            size="small"
                                            sx={{ bgcolor: 'white', color: 'primary.main' }}
                                        />
                                    </CardContent>
                                    <CardContent>
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Subject
                                                </Typography>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {certificate.exam?.subject}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Grade
                                                </Typography>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {certificate.result?.grade || 'N/A'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Issue Date
                                                </Typography>
                                                <Typography variant="body2">
                                                    {formatDate(certificate.issueDate)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Exam Date
                                                </Typography>
                                                <Typography variant="body2">
                                                    {formatDate(certificate.exam?.date)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<Download size={18} />}
                                            onClick={() => handleDownload(certificate)}
                                        >
                                            Download Certificate
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

export default Certificates;


