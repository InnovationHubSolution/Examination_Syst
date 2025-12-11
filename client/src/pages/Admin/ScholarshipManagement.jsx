import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Chip,
    IconButton,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    ExpandMore,
    School,
    AttachMoney,
    CheckCircle,
    Info
} from '@mui/icons-material';
import axios from 'axios';

export default function ScholarshipManagement() {
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingScholarship, setEditingScholarship] = useState(null);
    const [formData, setFormData] = useState({
        scholarshipName: '',
        provider: {
            name: '',
            type: 'Government',
            country: 'Vanuatu'
        },
        scholarshipType: 'Merit-Based',
        level: 'Secondary',
        value: {
            amount: 0,
            currency: 'VUV',
            coverage: 'Full Tuition',
            duration: '1 year'
        },
        academicCriteria: {
            minimumGPA: 3.0,
            minimumPercentage: 70,
            requiredGrades: [],
            specificSubjectsRequired: []
        },
        eligibilityCriteria: {
            citizenship: ['Vanuatu'],
            gender: 'Any',
            region: []
        },
        additionalRequirements: {
            leadershipExperience: false,
            communityService: false,
            essayRequired: false,
            interviewRequired: false,
            recommendationLetters: 0
        },
        applicationPeriod: {
            openDate: new Date().toISOString().split('T')[0],
            closeDate: '',
            isOpen: true
        },
        numberOfAwards: {
            total: 1,
            perYear: 1,
            available: 1
        },
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchScholarships();
    }, []);

    const fetchScholarships = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/scholarships');
            setScholarships(response.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching scholarships:', err);
            setError('Failed to load scholarships');
            setLoading(false);
        }
    };

    const handleOpenDialog = (scholarship = null) => {
        if (scholarship) {
            setEditingScholarship(scholarship);
            setFormData(scholarship);
        } else {
            setEditingScholarship(null);
            setFormData({
                scholarshipName: '',
                provider: {
                    name: '',
                    type: 'Government',
                    country: 'Vanuatu'
                },
                scholarshipType: 'Merit-Based',
                level: 'Secondary',
                value: {
                    amount: 0,
                    currency: 'VUV',
                    coverage: 'Full Tuition',
                    duration: '1 year'
                },
                academicCriteria: {
                    minimumGPA: 3.0,
                    minimumPercentage: 70,
                    requiredGrades: [],
                    specificSubjectsRequired: []
                },
                eligibilityCriteria: {
                    citizenship: ['Vanuatu'],
                    gender: 'Any',
                    region: []
                },
                additionalRequirements: {
                    leadershipExperience: false,
                    communityService: false,
                    essayRequired: false,
                    interviewRequired: false,
                    recommendationLetters: 0
                },
                applicationPeriod: {
                    openDate: new Date().toISOString().split('T')[0],
                    closeDate: '',
                    isOpen: true
                },
                numberOfAwards: {
                    total: 1,
                    perYear: 1,
                    available: 1
                },
                description: '',
                isActive: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingScholarship(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingScholarship) {
                await axios.put(`/api/scholarships/${editingScholarship._id}`, formData);
            } else {
                await axios.post('/api/scholarships', formData);
            }
            fetchScholarships();
            handleCloseDialog();
        } catch (err) {
            console.error('Error saving scholarship:', err);
            setError('Failed to save scholarship');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Emi wantem deletem scholarship ia? (Are you sure you want to delete this scholarship?)')) {
            try {
                await axios.delete(`/api/scholarships/${id}`);
                fetchScholarships();
            } catch (err) {
                console.error('Error deleting scholarship:', err);
                setError('Failed to delete scholarship');
            }
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Scholarship Criteria Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{ background: 'linear-gradient(135deg, #F5A623 0%, #2B6F9E 100%)' }}
                >
                    Add Scholarship
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #3D9A9B 0%, #2B6F9E 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {scholarships.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Total Scholarships
                                    </Typography>
                                </Box>
                                <School sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #F5A623 0%, #E8902E 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {scholarships.filter(s => s.applicationPeriod?.isOpen).length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Open for Applications
                                    </Typography>
                                </Box>
                                <CheckCircle sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #E8902E 0%, #F5A623 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {scholarships.reduce((sum, s) => sum + (s.numberOfAwards?.available || 0), 0)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Available Awards
                                    </Typography>
                                </Box>
                                <AttachMoney sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #2B6F9E 0%, #3D9A9B 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {scholarships.filter(s => s.isActive).length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Active Programs
                                    </Typography>
                                </Box>
                                <Info sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Scholarships List */}
            {scholarships.map((scholarship) => (
                <Accordion key={scholarship._id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                            <Box>
                                <Typography variant="h6">{scholarship.scholarshipName}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip label={scholarship.scholarshipType} size="small" color="primary" />
                                    <Chip label={scholarship.level} size="small" />
                                    {scholarship.applicationPeriod?.isOpen && (
                                        <Chip label="Open" size="small" color="success" />
                                    )}
                                    {!scholarship.isActive && (
                                        <Chip label="Inactive" size="small" color="default" />
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDialog(scholarship);
                                    }}
                                >
                                    <Edit />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(scholarship._id);
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Provider</Typography>
                                <Typography variant="body1" gutterBottom>
                                    {scholarship.provider?.name} ({scholarship.provider?.type})
                                </Typography>

                                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Value</Typography>
                                <Typography variant="body1" gutterBottom>
                                    {scholarship.value?.amount} {scholarship.value?.currency} - {scholarship.value?.coverage}
                                </Typography>

                                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Application Period</Typography>
                                <Typography variant="body1" gutterBottom>
                                    {new Date(scholarship.applicationPeriod?.openDate).toLocaleDateString()} -
                                    {new Date(scholarship.applicationPeriod?.closeDate).toLocaleDateString()}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Academic Criteria</Typography>
                                <Typography variant="body2">
                                    Minimum GPA: {scholarship.academicCriteria?.minimumGPA || 'N/A'}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Minimum Percentage: {scholarship.academicCriteria?.minimumPercentage}%
                                </Typography>

                                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Additional Requirements</Typography>
                                {scholarship.additionalRequirements?.essayRequired && (
                                    <Chip label="Essay Required" size="small" sx={{ mr: 1, mb: 1 }} />
                                )}
                                {scholarship.additionalRequirements?.interviewRequired && (
                                    <Chip label="Interview Required" size="small" sx={{ mr: 1, mb: 1 }} />
                                )}
                                {scholarship.additionalRequirements?.leadershipExperience && (
                                    <Chip label="Leadership Experience" size="small" sx={{ mr: 1, mb: 1 }} />
                                )}
                                {scholarship.additionalRequirements?.communityService && (
                                    <Chip label="Community Service" size="small" sx={{ mr: 1, mb: 1 }} />
                                )}
                            </Grid>

                            {scholarship.description && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                                    <Typography variant="body2">{scholarship.description}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))}

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Scholarship Name"
                                value={formData.scholarshipName}
                                onChange={(e) => setFormData({ ...formData, scholarshipName: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Provider Name"
                                value={formData.provider.name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    provider: { ...formData.provider, name: e.target.value }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Provider Type</InputLabel>
                                <Select
                                    value={formData.provider.type}
                                    label="Provider Type"
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        provider: { ...formData.provider, type: e.target.value }
                                    })}
                                >
                                    <MenuItem value="Government">Government</MenuItem>
                                    <MenuItem value="Private">Private</MenuItem>
                                    <MenuItem value="NGO">NGO</MenuItem>
                                    <MenuItem value="University">University</MenuItem>
                                    <MenuItem value="Corporate">Corporate</MenuItem>
                                    <MenuItem value="International">International</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Scholarship Type</InputLabel>
                                <Select
                                    value={formData.scholarshipType}
                                    label="Scholarship Type"
                                    onChange={(e) => setFormData({ ...formData, scholarshipType: e.target.value })}
                                >
                                    <MenuItem value="Merit-Based">Merit-Based</MenuItem>
                                    <MenuItem value="Need-Based">Need-Based</MenuItem>
                                    <MenuItem value="Sports">Sports</MenuItem>
                                    <MenuItem value="Arts">Arts</MenuItem>
                                    <MenuItem value="STEM">STEM</MenuItem>
                                    <MenuItem value="Mixed">Mixed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Level</InputLabel>
                                <Select
                                    value={formData.level}
                                    label="Level"
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                >
                                    <MenuItem value="Secondary">Secondary</MenuItem>
                                    <MenuItem value="Tertiary">Tertiary</MenuItem>
                                    <MenuItem value="Undergraduate">Undergraduate</MenuItem>
                                    <MenuItem value="Postgraduate">Postgraduate</MenuItem>
                                    <MenuItem value="Vocational">Vocational</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Award Amount"
                                value={formData.value.amount}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    value: { ...formData.value, amount: Number(e.target.value) }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Currency"
                                value={formData.value.currency}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    value: { ...formData.value, currency: e.target.value }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Minimum GPA"
                                inputProps={{ step: 0.1, min: 0, max: 4.0 }}
                                value={formData.academicCriteria.minimumGPA}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    academicCriteria: { ...formData.academicCriteria, minimumGPA: Number(e.target.value) }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Minimum Percentage"
                                inputProps={{ min: 0, max: 100 }}
                                value={formData.academicCriteria.minimumPercentage}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    academicCriteria: { ...formData.academicCriteria, minimumPercentage: Number(e.target.value) }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Application Open Date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.applicationPeriod.openDate}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    applicationPeriod: { ...formData.applicationPeriod, openDate: e.target.value }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Application Close Date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.applicationPeriod.closeDate}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    applicationPeriod: { ...formData.applicationPeriod, closeDate: e.target.value }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ background: 'linear-gradient(135deg, #F5A623 0%, #2B6F9E 100%)' }}
                    >
                        {editingScholarship ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
