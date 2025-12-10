import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import { Bell, Calendar, User } from 'lucide-react';
import axios from 'axios';

const AnnouncementBoard = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        filterAnnouncements();
    }, [announcements, filter]);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/announcements', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAnnouncements(response.data.announcements || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const filterAnnouncements = () => {
        let filtered = [...announcements];

        if (filter !== 'all') {
            filtered = filtered.filter(a => a.priority === filter);
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFilteredAnnouncements(filtered);
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'urgent': 'error',
            'high': 'warning',
            'normal': 'primary',
            'low': 'default'
        };
        return colors[priority] || 'default';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', {
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Bell size={32} style={{ marginRight: 16 }} />
                        <Box>
                            <Typography variant="h4">Announcements</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Stay updated with the latest news and updates
                            </Typography>
                        </Box>
                    </Box>
                    <TextField
                        select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        sx={{ minWidth: 150 }}
                        size="small"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                        <MenuItem value="high">High Priority</MenuItem>
                        <MenuItem value="normal">Normal</MenuItem>
                        <MenuItem value="low">Low Priority</MenuItem>
                    </TextField>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {filteredAnnouncements.length === 0 ? (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                        <Bell size={48} style={{ color: '#999', marginBottom: 16 }} />
                        <Typography variant="h6" color="text.secondary">
                            No announcements found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Check back later for updates
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {filteredAnnouncements.map((announcement) => (
                            <Grid item xs={12} key={announcement._id}>
                                <Card elevation={3}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="h6">
                                                        {announcement.title}
                                                    </Typography>
                                                    <Chip
                                                        label={announcement.priority?.toUpperCase()}
                                                        color={getPriorityColor(announcement.priority)}
                                                        size="small"
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Calendar size={14} style={{ marginRight: 4 }} />
                                                        {formatDate(announcement.createdAt)}
                                                    </Typography>
                                                    {announcement.author && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <User size={14} style={{ marginRight: 4 }} />
                                                            {announcement.author.firstName} {announcement.author.lastName}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {announcement.content}
                                        </Typography>
                                        {announcement.targetAudience && announcement.targetAudience.length > 0 && (
                                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                    Target:
                                                </Typography>
                                                {announcement.targetAudience.map((audience) => (
                                                    <Chip
                                                        key={audience}
                                                        label={audience}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {filteredAnnouncements.length} of {announcements.length} announcements
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default AnnouncementBoard;


