import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    Stack
} from '@mui/material';
import {
    BookOpen,
    Users,
    Award,
    FileText,
    Shield,
    TrendingUp,
    CheckCircle,
    Globe
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <BookOpen size={40} />,
            title: 'Exam Management',
            description: 'Comprehensive digital platform for managing national examinations, timetables, and assessment scheduling.'
        },
        {
            icon: <Users size={40} />,
            title: 'Multi-Role Access',
            description: 'Tailored portals for students, teachers, examiners, moderators, and administrators with role-based permissions.'
        },
        {
            icon: <FileText size={40} />,
            title: 'Assessment & Grading',
            description: 'Digital submission, grading, and moderation of internal assessments with real-time feedback.'
        },
        {
            icon: <Award size={40} />,
            title: 'Results & Certificates',
            description: 'Secure access to examination results and digital certificate verification system.'
        },
        {
            icon: <Shield size={40} />,
            title: 'Data Security',
            description: 'Enterprise-grade security ensuring confidentiality and integrity of examination data.'
        },
        {
            icon: <TrendingUp size={40} />,
            title: 'Analytics & Reports',
            description: 'Comprehensive reporting and analytics for tracking performance and generating insights.'
        }
    ];

    const userTypes = [
        {
            role: 'Students',
            benefits: ['View exam timetables', 'Submit assignments', 'Check results', 'Download certificates']
        },
        {
            role: 'Teachers',
            benefits: ['Create assessments', 'Grade submissions', 'View student progress', 'Access marking schemes']
        },
        {
            role: 'Examiners',
            benefits: ['Manage exam papers', 'Set examination standards', 'Quality assurance', 'Performance analysis']
        },
        {
            role: 'Administrators',
            benefits: ['User management', 'System configuration', 'Generate reports', 'Monitor operations']
        }
    ];

    return (
        <Box>
            {/* Header */}
            <AppBar
                position="static"
                sx={{
                    background: 'linear-gradient(135deg, #F5A623 0%, #E8902E 50%, #2B6F9E 100%)',
                    boxShadow: 3
                }}
            >
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                mr: 2
                            }}
                        >
                            📚
                        </Box>
                        <Typography variant="h6" component="div">
                            Vanuatu Examination Portal
                        </Typography>
                    </Box>
                    <Button
                        color="inherit"
                        onClick={() => navigate('/login')}
                        sx={{ mr: 1 }}
                    >
                        Login
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{
                            color: 'white',
                            borderColor: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                        onClick={() => navigate('/register')}
                    >
                        Register
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #F5A623 0%, #E8902E 50%, #2B6F9E 100%)',
                    color: 'white',
                    py: 12,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.4
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            gutterBottom
                            fontWeight="bold"
                            sx={{ mb: 3 }}
                        >
                            Vanuatu Examination Portal
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                            Transforming Education Through Digital Excellence
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 5, opacity: 0.85, maxWidth: 800, mx: 'auto' }}>
                            A comprehensive digital platform for managing national examinations,
                            assessments, and academic records across the Republic of Vanuatu
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    backgroundColor: 'white',
                                    color: '#2B6F9E',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                    }
                                }}
                            >
                                Get Started
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/verify-certificate')}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    borderColor: 'white',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                Verify Certificate
                            </Button>
                        </Stack>
                    </Box>

                    {/* Stats */}
                    <Grid container spacing={4} sx={{ mt: 4 }}>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" fontWeight="bold">10K+</Typography>
                                <Typography variant="h6">Students</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" fontWeight="bold">500+</Typography>
                                <Typography variant="h6">Teachers</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" fontWeight="bold">100+</Typography>
                                <Typography variant="h6">Schools</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 10 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                        Platform Features
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Everything you need for modern examination management
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                    <Box
                                        sx={{
                                            color: '#3D9A9B',
                                            mb: 2,
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* User Types Section */}
            <Box sx={{ bgcolor: '#f5f5f5', py: 10 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                            Built For Everyone
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Tailored experiences for every role in the education ecosystem
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {userTypes.map((userType, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                            {userType.role}
                                        </Typography>
                                        <Box component="ul" sx={{ pl: 2, mt: 2 }}>
                                            {userType.benefits.map((benefit, i) => (
                                                <Box
                                                    component="li"
                                                    key={i}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        mb: 1,
                                                        listStyle: 'none',
                                                        ml: -2
                                                    }}
                                                >
                                                    <CheckCircle
                                                        size={18}
                                                        style={{
                                                            color: '#F5A623',
                                                            marginRight: 8,
                                                            marginTop: 2,
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                    <Typography variant="body2">
                                                        {benefit}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #2B6F9E 0%, #3D9A9B 100%)',
                    color: 'white',
                    py: 10,
                    textAlign: 'center'
                }}
            >
                <Container maxWidth="md">
                    <Globe size={60} style={{ marginBottom: 24 }} />
                    <Typography variant="h3" gutterBottom fontWeight="bold">
                        Ready to Get Started?
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                        Join thousands of students, teachers, and administrators using the Vanuatu Examination Portal
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{
                                py: 1.5,
                                px: 4,
                                backgroundColor: 'white',
                                color: '#667eea',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                }
                            }}
                        >
                            Create Account
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{
                                py: 1.5,
                                px: 4,
                                borderColor: 'white',
                                color: 'white',
                                fontWeight: 'bold',
                                '&:hover': {
                                    borderColor: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Sign In
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: '#263238', color: 'white', py: 4 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Vanuatu Examination Portal
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Ministry of Education and Training, Republic of Vanuatu
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                © 2025 Vanuatu Examination Portal. All rights reserved.
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
