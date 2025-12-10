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
    TextField,
    MenuItem,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { BookOpen, Download, FileText, Search } from 'lucide-react';
import axios from 'axios';

const ResourceLibrary = () => {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        subject: '',
        search: ''
    });

    const [subjects, setSubjects] = useState([]);
    const [types, setTypes] = useState([]);

    useEffect(() => {
        fetchResources();
    }, []);

    useEffect(() => {
        filterResources();
    }, [resources, filters]);

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/resources', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setResources(response.data.resources || response.data);

            // Extract unique subjects and types for filters
            const uniqueSubjects = [...new Set(response.data.map(r => r.subject).filter(Boolean))];
            const uniqueTypes = [...new Set(response.data.map(r => r.type).filter(Boolean))];
            setSubjects(uniqueSubjects.sort());
            setTypes(uniqueTypes.sort());
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    };

    const filterResources = () => {
        let filtered = [...resources];

        if (filters.type) {
            filtered = filtered.filter(r => r.type === filters.type);
        }

        if (filters.subject) {
            filtered = filtered.filter(r => r.subject === filters.subject);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(r =>
                r.title?.toLowerCase().includes(searchLower) ||
                r.description?.toLowerCase().includes(searchLower) ||
                r.subject?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredResources(filtered);
    };

    const handleFilterChange = (field, value) => {
        setFilters({
            ...filters,
            [field]: value
        });
    };

    const handleDownload = async (resource) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/resources/${resource._id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', resource.fileName || resource.title);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download resource');
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            'Study Guide': 'primary',
            'Past Paper': 'secondary',
            'Notes': 'success',
            'Video': 'info',
            'Assignment': 'warning'
        };
        return colors[type] || 'default';
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
                        <Typography variant="h4">Resource Library</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Browse and download study materials
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
                        Search & Filter
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Search"
                                placeholder="Search resources..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                InputProps={{
                                    startAdornment: <Search size={20} style={{ marginRight: 8, color: '#666' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                select
                                label="Type"
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <MenuItem value="">All Types</MenuItem>
                                {types.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
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
                    </Grid>
                </Paper>

                {filteredResources.length === 0 ? (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                        <FileText size={48} style={{ color: '#999', marginBottom: 16 }} />
                        <Typography variant="h6" color="text.secondary">
                            No resources found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {filteredResources.map((resource) => (
                            <Grid item xs={12} sm={6} md={4} key={resource._id}>
                                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                            <FileText size={32} color="#1976d2" />
                                            <Chip
                                                label={resource.type}
                                                color={getTypeColor(resource.type)}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="h6" gutterBottom>
                                            {resource.title}
                                        </Typography>
                                        {resource.subject && (
                                            <Chip
                                                label={resource.subject}
                                                size="small"
                                                sx={{ mb: 1 }}
                                            />
                                        )}
                                        {resource.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {resource.description.length > 100
                                                    ? `${resource.description.substring(0, 100)}...`
                                                    : resource.description}
                                            </Typography>
                                        )}
                                        {resource.grade && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                Grade: {resource.grade}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                            Uploaded: {new Date(resource.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<Download size={18} />}
                                            onClick={() => handleDownload(resource)}
                                        >
                                            Download
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {filteredResources.length} of {resources.length} resources
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default ResourceLibrary;

