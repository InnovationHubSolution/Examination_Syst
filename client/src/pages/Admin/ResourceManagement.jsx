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
    Download,
    CloudUpload,
    Description,
    FolderOpen,
    InsertDriveFile,
    PictureAsPdf
} from '@mui/icons-material';
import axios from 'axios';

const resourceTypeColors = {
    document: 'primary',
    pdf: 'error',
    video: 'secondary',
    image: 'info',
    audio: 'warning',
    other: 'default'
};

const subjectColors = {
    Mathematics: 'primary',
    English: 'success',
    Science: 'info',
    History: 'secondary',
    Geography: 'warning',
    'French Language': 'error'
};

export default function ResourceManagement() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selectedResource, setSelectedResource] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        documents: 0,
        videos: 0,
        totalSize: 0
    });

    useEffect(() => {
        fetchResources();
    }, [search, subjectFilter, typeFilter]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (search) params.search = search;
            if (subjectFilter) params.subject = subjectFilter;
            if (typeFilter) params.type = typeFilter;

            const response = await axios.get('/api/resources', { params });
            const resourcesList = response.data.resources || response.data.items || response.data;
            setResources(resourcesList);

            // Calculate stats
            const documents = resourcesList.filter(r => r.type === 'document' || r.type === 'pdf').length;
            const videos = resourcesList.filter(r => r.type === 'video').length;
            const totalSize = resourcesList.reduce((sum, r) => sum + (r.size || 0), 0);

            setStats({
                total: resourcesList.length,
                documents: documents,
                videos: videos,
                totalSize: (totalSize / (1024 * 1024)).toFixed(2) // Convert to MB
            });

            setLoading(false);
        } catch (err) {
            console.error('Error fetching resources:', err);
            setError(err.response?.data?.message || 'Failed to load resources');
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

    const handleDeleteClick = (resource) => {
        setSelectedResource(resource);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/resources/${selectedResource._id}`);
            setDeleteDialogOpen(false);
            setSelectedResource(null);
            fetchResources();
        } catch (err) {
            console.error('Error deleting resource:', err);
            setError(err.response?.data?.message || 'Failed to delete resource');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setSelectedResource(null);
    };

    const handleDownload = async (resource) => {
        try {
            const response = await axios.get(`/api/resources/${resource._id}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', resource.filename || resource.title);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error downloading resource:', err);
            setError('Failed to download resource');
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf':
                return <PictureAsPdf />;
            case 'document':
                return <Description />;
            case 'video':
            case 'image':
            case 'audio':
                return <InsertDriveFile />;
            default:
                return <FolderOpen />;
        }
    };

    if (loading && resources.length === 0) {
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
                    Resource Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadDialogOpen(true)}
                >
                    Upload Resource
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
                                        Total Resources
                                    </Typography>
                                </Box>
                                <FolderOpen sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats.documents}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Documents
                                    </Typography>
                                </Box>
                                <Description sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
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
                                        {stats.videos}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Videos
                                    </Typography>
                                </Box>
                                <InsertDriveFile sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
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
                                        {stats.totalSize}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Total Size (MB)
                                    </Typography>
                                </Box>
                                <CloudUpload sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
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
                        placeholder="Search by title or description"
                        sx={{ flexGrow: 1, minWidth: 300 }}
                        InputProps={{
                            endAdornment: <Search />
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Subject</InputLabel>
                        <Select
                            value={subjectFilter}
                            label="Subject"
                            onChange={(e) => setSubjectFilter(e.target.value)}
                        >
                            <MenuItem value="">All Subjects</MenuItem>
                            <MenuItem value="Mathematics">Mathematics</MenuItem>
                            <MenuItem value="English">English</MenuItem>
                            <MenuItem value="Science">Science</MenuItem>
                            <MenuItem value="History">History</MenuItem>
                            <MenuItem value="Geography">Geography</MenuItem>
                            <MenuItem value="French Language">French Language</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={typeFilter}
                            label="Type"
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="document">Document</MenuItem>
                            <MenuItem value="pdf">PDF</MenuItem>
                            <MenuItem value="video">Video</MenuItem>
                            <MenuItem value="image">Image</MenuItem>
                            <MenuItem value="audio">Audio</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Resources Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Title</strong></TableCell>
                            <TableCell><strong>Subject</strong></TableCell>
                            <TableCell><strong>Grade</strong></TableCell>
                            <TableCell><strong>File Size</strong></TableCell>
                            <TableCell><strong>Uploaded</strong></TableCell>
                            <TableCell><strong>Downloads</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                                        No resources found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            resources
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((resource) => (
                                    <TableRow key={resource._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getResourceIcon(resource.type)}
                                                <Chip
                                                    label={resource.type || 'document'}
                                                    color={resourceTypeColors[resource.type] || 'default'}
                                                    size="small"
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>{resource.title}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={resource.subject}
                                                color={subjectColors[resource.subject] || 'default'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{resource.grade || '-'}</TableCell>
                                        <TableCell>{formatFileSize(resource.size)}</TableCell>
                                        <TableCell>{formatDate(resource.uploadedAt || resource.createdAt)}</TableCell>
                                        <TableCell>{resource.downloads || 0}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="info"
                                                onClick={() => console.log('View resource:', resource)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={() => handleDownload(resource)}
                                            >
                                                <Download />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => console.log('Edit resource:', resource)}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(resource)}
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
                    count={resources.length}
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
                        Are you sure you want to delete the resource{' '}
                        <strong>{selectedResource?.title}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Resource</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Upload a new resource to the library. Supported file types include documents, PDFs, videos, images, and audio files.
                    </DialogContentText>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                            fullWidth
                        >
                            Choose File
                            <input type="file" hidden />
                        </Button>
                        <Alert severity="info">
                            File upload functionality will be implemented with backend support.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" disabled>
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
