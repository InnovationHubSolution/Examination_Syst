import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    TextField,
    Box,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    DialogContentText
} from '@mui/material';
import {
    Edit,
    Delete,
    Search,
    Add,
    Visibility,
    Campaign,
    Notifications,
    Info,
    Warning
} from '@mui/icons-material';
import axios from 'axios';

const priorityColors = {
    low: 'default',
    normal: 'info',
    high: 'warning',
    urgent: 'error'
};

const targetAudienceColors = {
    all: 'primary',
    students: 'success',
    teachers: 'info',
    examiners: 'warning',
    administrators: 'error'
};

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        urgent: 0,
        today: 0
    });

    useEffect(() => {
        fetchAnnouncements();
    }, [search, priorityFilter]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (search) params.search = search;
            if (priorityFilter) params.priority = priorityFilter;

            const response = await axios.get('/api/announcements', { params });
            const announcementsList = response.data.announcements || response.data.items || response.data;
            setAnnouncements(announcementsList);

            // Calculate stats
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            setStats({
                total: announcementsList.length,
                active: announcementsList.filter(a => a.status === 'active' || !a.status).length,
                urgent: announcementsList.filter(a => a.priority === 'urgent').length,
                today: announcementsList.filter(a => {
                    const created = new Date(a.createdAt);
                    return created >= today;
                }).length
            });

            setLoading(false);
        } catch (err) {
            console.error('Error fetching announcements:', err);
            setError(err.response?.data?.message || 'Failed to load announcements');
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (announcement) => {
        setSelectedAnnouncement(announcement);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/announcements/${selectedAnnouncement._id}`);
            setDeleteDialogOpen(false);
            setSelectedAnnouncement(null);
            fetchAnnouncements();
        } catch (err) {
            console.error('Error deleting announcement:', err);
            setError(err.response?.data?.message || 'Failed to delete announcement');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setSelectedAnnouncement(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (loading && announcements.length === 0) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Announcements Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setCreateDialogOpen(true)}
                >
                    Create Announcement
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Statistics Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats.total}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Total Announcements
                                    </Typography>
                                </Box>
                                <Campaign sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats.active}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Active
                                    </Typography>
                                </Box>
                                <Notifications sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats.urgent}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Urgent
                                    </Typography>
                                </Box>
                                <Warning sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats.today}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Posted Today
                                    </Typography>
                                </Box>
                                <Info sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search and Filter */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label="Search"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title or content"
                        sx={{ flexGrow: 1, minWidth: 300 }}
                        InputProps={{
                            endAdornment: <Search />
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={priorityFilter}
                            label="Priority"
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <MenuItem value="">All Priorities</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="normal">Normal</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Announcements Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Title</strong></TableCell>
                            <TableCell><strong>Content</strong></TableCell>
                            <TableCell><strong>Priority</strong></TableCell>
                            <TableCell><strong>Target Audience</strong></TableCell>
                            <TableCell><strong>Posted By</strong></TableCell>
                            <TableCell><strong>Created</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {announcements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                                        No announcements found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            announcements
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((announcement) => (
                                    <TableRow key={announcement._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {announcement.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {truncateText(announcement.content)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={announcement.priority || 'normal'}
                                                color={priorityColors[announcement.priority] || 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={announcement.targetAudience || 'all'}
                                                color={targetAudienceColors[announcement.targetAudience] || 'default'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {announcement.author?.firstName} {announcement.author?.lastName || '-'}
                                        </TableCell>
                                        <TableCell>{formatDate(announcement.createdAt)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="info"
                                                onClick={() => console.log('View announcement:', announcement)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => console.log('Edit announcement:', announcement)}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(announcement)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={announcements.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the announcement{' '}
                        <strong>{selectedAnnouncement?.title}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Announcement Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Create a new announcement to notify users about important updates, events, or information.
                    </DialogContentText>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Title"
                            variant="outlined"
                            fullWidth
                            placeholder="Enter announcement title"
                        />
                        <TextField
                            label="Content"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Enter announcement content"
                        />
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select label="Priority" defaultValue="normal">
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="normal">Normal</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="urgent">Urgent</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Target Audience</InputLabel>
                            <Select label="Target Audience" defaultValue="all">
                                <MenuItem value="all">All Users</MenuItem>
                                <MenuItem value="students">Students</MenuItem>
                                <MenuItem value="teachers">Teachers</MenuItem>
                                <MenuItem value="examiners">Examiners</MenuItem>
                                <MenuItem value="administrators">Administrators</MenuItem>
                            </Select>
                        </FormControl>
                        <Alert severity="info">
                            Create functionality will be implemented with form validation and backend integration.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" disabled>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
