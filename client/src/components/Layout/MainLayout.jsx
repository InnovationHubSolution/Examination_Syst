import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    Divider,
    Chip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    LibraryBooks as LibraryBooksIcon,
    FilePresent as FilePresentIcon,
    Assessment as AssessmentIcon,
    EmojiEvents as EmojiEventsIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    ExitToApp as ExitToAppIcon,
    People as PeopleIcon,
    EventNote as EventNoteIcon,
    Announcement as AnnouncementIcon,
    BarChart as BarChartIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const MainLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Menu items based on user role
    const getMenuItems = () => {
        const commonItems = [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
            { text: 'Exam Timetable', icon: <EventNoteIcon />, path: '/app/exam-timetable' },
            { text: 'Resource Library', icon: <LibraryBooksIcon />, path: '/app/resources' },
            { text: 'Announcements', icon: <AnnouncementIcon />, path: '/app/announcements' }
        ];

        const studentItems = [
            { text: 'My Exams', icon: <SchoolIcon />, path: '/app/student/exams' },
            { text: 'Assessments', icon: <AssignmentIcon />, path: '/app/student/assessments' },
            { text: 'Submissions', icon: <FilePresentIcon />, path: '/app/student/submissions' },
            { text: 'Results', icon: <AssessmentIcon />, path: '/app/student/results' },
            { text: 'Certificates', icon: <EmojiEventsIcon />, path: '/app/student/certificates' }
        ];

        const teacherItems = [
            { text: 'Assessments', icon: <AssignmentIcon />, path: '/app/teacher/assessments' },
            { text: 'Submissions', icon: <FilePresentIcon />, path: '/app/teacher/submissions' },
            { text: 'Grading', icon: <AssessmentIcon />, path: '/app/teacher/grading' }
        ];

        const adminItems = [
            { text: 'User Management', icon: <PeopleIcon />, path: '/app/admin/users' },
            { text: 'Exam Management', icon: <SchoolIcon />, path: '/app/admin/exams' },
            { text: 'Resources', icon: <LibraryBooksIcon />, path: '/app/admin/resources' },
            { text: 'Announcements', icon: <AnnouncementIcon />, path: '/app/admin/announcements' },
            { text: 'Reports', icon: <BarChartIcon />, path: '/app/admin/reports' }
        ];

        let roleItems = [];
        if (user?.role === 'student') {
            roleItems = studentItems;
        } else if (user?.role === 'teacher') {
            roleItems = teacherItems;
        } else if (user?.role === 'administrator') {
            roleItems = adminItems;
        }

        return [...commonItems, ...roleItems];
    };

    const drawer = (
        <Box>
            <Toolbar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                    VU Exam Portal
                </Typography>
            </Toolbar>
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {user?.firstName?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight="bold">
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {user?.role}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Divider />
            <List>
                {getMenuItems().map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton onClick={() => navigate(item.path)}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundImage: 'url(/veo-header-bg.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(61, 154, 155, 0.15)',
                        zIndex: 0
                    }
                }}
            >
                <Toolbar sx={{ position: 'relative', zIndex: 1 }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Vanuatu Examination & Assessment Portal
                    </Typography>
                    <Badge badgeContent={0} color="error" sx={{ mr: 2 }}>
                        <IconButton color="inherit">
                            <NotificationsIcon />
                        </IconButton>
                    </Badge>
                    <Chip
                        label={user?.role}
                        size="small"
                        sx={{
                            mr: 2,
                            bgcolor: user?.role === 'administrator' ? 'error.main' : user?.role === 'teacher' ? 'success.main' : 'primary.main',
                            color: 'white',
                            fontWeight: 'bold',
                            textTransform: 'capitalize'
                        }}
                    />
                    <IconButton onClick={handleProfileMenuOpen} color="inherit">
                        <Avatar sx={{ width: 32, height: 32 }}>
                            {user?.firstName?.charAt(0)}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                    >
                        <MenuItem onClick={() => { navigate('/app/profile'); handleProfileMenuClose(); }}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <ExitToAppIcon fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
