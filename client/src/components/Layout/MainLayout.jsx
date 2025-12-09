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
  Divider
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
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Exam Timetable', icon: <EventNoteIcon />, path: '/exam-timetable' },
      { text: 'Resource Library', icon: <LibraryBooksIcon />, path: '/resources' },
      { text: 'Announcements', icon: <AnnouncementIcon />, path: '/announcements' }
    ];

    const studentItems = [
      { text: 'My Exams', icon: <SchoolIcon />, path: '/student/exams' },
      { text: 'Assessments', icon: <AssignmentIcon />, path: '/student/assessments' },
      { text: 'Submissions', icon: <FilePresentIcon />, path: '/student/submissions' },
      { text: 'Results', icon: <AssessmentIcon />, path: '/student/results' },
      { text: 'Certificates', icon: <EmojiEventsIcon />, path: '/student/certificates' }
    ];

    const teacherItems = [
      { text: 'Assessments', icon: <AssignmentIcon />, path: '/teacher/assessments' },
      { text: 'Submissions', icon: <FilePresentIcon />, path: '/teacher/submissions' },
      { text: 'Grading', icon: <AssessmentIcon />, path: '/teacher/grading' }
    ];

    const adminItems = [
      { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
      { text: 'Exam Management', icon: <SchoolIcon />, path: '/admin/exams' },
      { text: 'Resources', icon: <LibraryBooksIcon />, path: '/admin/resources' },
      { text: 'Announcements', icon: <AnnouncementIcon />, path: '/admin/announcements' },
      { text: 'Reports', icon: <BarChartIcon />, path: '/admin/reports' }
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
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          VU Exam Portal
        </Typography>
      </Toolbar>
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
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar>
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
          <IconButton color="inherit">
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
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
            <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
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
