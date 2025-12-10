import React, { useState } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Grid
} from '@mui/material';
import { Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import axios from 'axios';

const CertificateVerification = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const response = await axios.get(`/api/certificates/verify/${code}`);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Certificate not found or invalid');
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

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                    <Shield size={48} style={{ marginRight: 16, color: '#1976d2' }} />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">Certificate Verification</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Verify the authenticity of examination certificates
                        </Typography>
                    </Box>
                </Box>

                <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Enter Certificate Code
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Enter the unique verification code found on the certificate to verify its authenticity.
                    </Typography>

                    <Box component="form" onSubmit={handleVerify}>
                        <TextField
                            fullWidth
                            label="Certificate Verification Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            required
                            placeholder="e.g., CERT-2024-XXXX"
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: <Search size={20} style={{ marginRight: 8, color: '#666' }} />
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading || !code}
                            startIcon={loading ? <CircularProgress size={20} /> : <Shield size={20} />}
                        >
                            {loading ? 'Verifying...' : 'Verify Certificate'}
                        </Button>
                    </Box>
                </Paper>

                {error && (
                    <Alert
                        severity="error"
                        icon={<XCircle size={24} />}
                        sx={{ mb: 3 }}
                    >
                        <Typography variant="subtitle2" gutterBottom>
                            Verification Failed
                        </Typography>
                        <Typography variant="body2">
                            {error}
                        </Typography>
                    </Alert>
                )}

                {result && (
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <CheckCircle size={48} style={{ color: '#4caf50', marginRight: 16 }} />
                            <Box>
                                <Typography variant="h5" color="success.main" gutterBottom>
                                    Certificate Verified
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    This certificate is authentic and valid
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Certificate Code
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    {result.certificateNumber}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Student Name
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {result.student?.firstName} {result.student?.lastName}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Student ID
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {result.student?.studentId || 'N/A'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Exam
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {result.exam?.title}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Subject
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {result.exam?.subject}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Grade/Result
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {result.result?.grade || result.result?.score || 'N/A'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Issue Date
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {formatDate(result.issueDate)}
                                </Typography>
                            </Grid>

                            {result.exam?.date && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Exam Date
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {formatDate(result.exam.date)}
                                    </Typography>
                                </Grid>
                            )}

                            {result.remarks && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Remarks
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {result.remarks}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                )}
            </Box>
        </Container>
    );
};

export default CertificateVerification;
