import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Link,
    Alert,
    MenuItem,
    Grid
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        studentId: '',
        teacherId: '',
        school: '',
        grade: '',
        subjects: '',
        phoneNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        // Prepare data for registration
        const { confirmPassword, subjects, ...registerData } = formData;
        
        // Convert subjects string to array if role is teacher
        if (formData.role === 'teacher' && subjects) {
            registerData.subjects = subjects.split(',').map(s => s.trim()).filter(s => s);
        }

        const result = await register(registerData);

        if (result.success) {
            navigate('/app/dashboard');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundAttachment: 'fixed', position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.4 } }}><Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
                sx={{
                    marginTop: 4,
                    marginBottom: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Paper elevation={24} sx={{ p: 4, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', borderRadius: 3 }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Create Account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    select
                                    label="Role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="teacher">Teacher</MenuItem>
                                </TextField>
                            </Grid>
                            {formData.role === 'student' && (
                                <>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Student ID"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            helperText="Optional - Can be assigned later"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="School"
                                            name="school"
                                            value={formData.school}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Grade"
                                            name="grade"
                                            value={formData.grade}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                </>
                            )}
                            {formData.role === 'teacher' && (
                                <>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Teacher ID"
                                            name="teacherId"
                                            value={formData.teacherId}
                                            onChange={handleChange}
                                            helperText="Optional - Can be assigned later"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="School"
                                            name="school"
                                            value={formData.school}
                                            onChange={handleChange}
                                            helperText="Your current school or institution"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Subjects"
                                            name="subjects"
                                            value={formData.subjects}
                                            onChange={handleChange}
                                            helperText="Enter subjects separated by commas (e.g., Mathematics, English, Science)"
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            helperText="Contact number for communication"
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    helperText="Minimum 8 characters"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link component={RouterLink} to="/login" variant="body2">
                                Already have an account? Sign In
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container></Box>);
};

export default Register;



