import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Avatar,
    Button,
    Tooltip,
    MenuItem,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    useMediaQuery,
    Badge,
    Chip,
    SwipeableDrawer
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';

// Import the ColorModeContext hook
import { useColorMode } from '../contexts/ThemeContext';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import logo from '../assets/logowhite.png';
import Axios from './Axios';

// Styled components with improved responsiveness
const GlassAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(0, 137, 123, 0.95), rgba(0, 105, 92, 0.9))',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
    transition: 'all 0.3s ease',
    width: '100%',
    overflowX: 'hidden',
}));

const GlassDrawer = styled(Box)(({ theme }) => ({
    background: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

const ActiveNavItem = styled(ListItemButton)(({ theme }) => ({
    position: 'relative',
    borderRadius: '12px',
    margin: '4px 8px',
    transition: 'all 0.3s ease',
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '10%',
        height: '80%',
        width: 4,
        backgroundColor: theme.palette.primary.main,
        borderRadius: 4,
        opacity: 0,
        transition: 'all 0.2s',
    },
    '&.Mui-selected': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        '&::before': {
            opacity: 1,
        },
        '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
        },
        '& .MuiListItemText-primary': {
            fontWeight: 600,
            color: theme.palette.primary.main,
        },
    },
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.light, 0.08),
        transform: 'translateX(4px)',
    }
}));

const ProfileChip = styled(Chip)(({ theme }) => ({
    borderRadius: '50px',
    padding: '2px 6px',
    height: 40,
    backgroundColor: alpha(theme.palette.background.paper, 0.15),
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: theme.palette.common.white,
    '& .MuiChip-avatar': {
        width: 30,
        height: 30,
        border: '2px solid rgba(255, 255, 255, 0.6)',
    },
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.25),
        transform: 'translateY(-2px)',
    },
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

const pages = [
    { name: 'Dashboard', path: '/home', icon: <DashboardIcon /> },
    { name: 'Projects', path: '/projects', icon: <BusinessIcon /> },
    { name: 'Members', path: '/members', icon: <GroupIcon /> },
    { name: 'Finance', path: '/finance', icon: <AccountBalanceIcon /> },
    { name: 'Volunteer', path: '/volunteer', icon: <VolunteerActivismIcon /> },
    { name: 'About', path: '/about', icon: <InfoIcon /> },
];

export default function NavBar(props) {
    const { content } = props;
    const drawerWidth = 260;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();
    const navigate = useNavigate();

    // Use the color mode context
    const colorMode = useColorMode();

    // Get the dark mode state from the context
    const darkMode = colorMode.mode === 'dark';

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
    const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('Member');
    const [userInitial, setUserInitial] = useState('');
    const [associationName, setAssociationName] = useState('');

    const isUserMenuOpen = Boolean(userMenuAnchorEl);
    const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);

    // Notifications mock data
    const notifications = [
        { id: 1, message: 'New project proposal submitted', time: '10 min ago', read: false },
        { id: 2, message: 'Budget report is ready for review', time: '1 hour ago', read: false },
        { id: 3, message: 'Team meeting scheduled for tomorrow', time: '3 hours ago', read: true },
    ];

    useEffect(() => {
        // Fetch user data from the backend
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('Token') || localStorage.getItem('token');

                if (!token) {
                    navigate('/'); // Redirect to login if no token
                    return;
                }

                const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                Axios.defaults.headers.common['Authorization'] = authHeader;

                const response = await Axios.get('/users/profile/');

                if (response.data) {
                    // Set user data
                    const fullName = response.data.full_name || 'User';
                    setUserName(fullName);
                    setUserInitial(fullName.charAt(0).toUpperCase());

                    // Set organization name
                    if (response.data.association) {
                        setAssociationName(response.data.association.name);

                        // Set role based on permissions
                        if (response.data.is_superuser) {
                            setUserRole('Super Admin');
                        } else if (response.data.is_staff) {
                            setUserRole('Admin');
                        } else {
                            setUserRole('Member');
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Redirect to login on auth error
                if (error.response && error.response.status === 401) {
                    navigate('/');
                }
            }
        };

        fetchUserData();

        // Clean up resize listener
        const handleResize = () => {
            if (!isMobile) {
                setDrawerOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isMobile, navigate]);

    // Toggle dark mode using the context
    const toggleDarkMode = () => {
        colorMode.toggleColorMode();
    };

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchorEl(null);
    };

    const handleNotificationsOpen = (event) => {
        setNotificationsAnchorEl(event.currentTarget);
    };

    const handleNotificationsClose = () => {
        setNotificationsAnchorEl(null);
    };

    const handleLogout = () => {
        handleUserMenuClose();

        // Clear all storage and navigate to login
        localStorage.removeItem('Token');
        localStorage.removeItem('token');
        navigate('/');
    };

    const drawer = (
        <GlassDrawer>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 2,
                px: 2,
                background: 'linear-gradient(135deg, #00897B, #00695C)',
                color: 'white',
                position: 'relative'
            }}>
                {isMobile && (
                    <IconButton
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.2)'
                            }
                        }}
                        onClick={handleDrawerToggle}
                    >
                        <CloseIcon />
                    </IconButton>
                )}

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    width: '100%',
                    mt: isMobile ? 4 : 0
                }}>
                    <img src={logo} alt="Logo" style={{ height: 60, marginBottom: 16 }} />
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: 1,
                            background: 'linear-gradient(90deg, #ffffff, #e0e0e0)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {associationName}
                    </Typography>
                </Box>
            </Box>

            {/* User profile in sidebar */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 3,
                px: 2,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                background: darkMode ?
                    'linear-gradient(180deg, rgba(0,105,92,0.2) 0%, rgba(30,30,30,0) 100%)' :
                    'linear-gradient(180deg, rgba(0,105,92,0.05) 0%, rgba(255,255,255,0) 100%)'
            }}>
                <Avatar
                    sx={{
                        width: 64,
                        height: 64,
                        mb: 1,
                        border: '2px solid #00897B',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        background: 'linear-gradient(135deg, #00897B, #00695C)'
                    }}
                >
                    {userInitial}
                </Avatar>
                <Typography variant="subtitle1" sx={{
                    fontWeight: 600,
                    textAlign: 'center',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {userName}
                </Typography>
                <Chip
                    label={userRole}
                    size="small"
                    sx={{
                        mt: 0.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        borderRadius: '50px',
                    }}
                />
            </Box>

            <List sx={{ mt: 1, px: 1, flexGrow: 1, overflowY: 'auto' }}>
                {pages.map((page) => (
                    <ListItem key={page.name} disablePadding sx={{ mb: 0.5 }}>
                        <ActiveNavItem
                            component={Link}
                            to={page.path}
                            selected={page.path === location.pathname}
                            onClick={isMobile ? handleDrawerToggle : undefined}
                            disableRipple
                        >
                            <ListItemIcon sx={{
                                minWidth: 40,
                                color: page.path === location.pathname ?
                                    theme.palette.primary.main :
                                    alpha(theme.palette.text.primary, 0.7)
                            }}>
                                {page.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={page.name}
                                primaryTypographyProps={{
                                    fontSize: 15,
                                    fontWeight: page.path === location.pathname ? 600 : 400
                                }}
                            />

                            {/* Show notification badge on Projects */}
                            {page.name === 'Projects' && (
                                <Box component="span">
                                    <Badge color="error" variant="dot" />
                                </Box>
                            )}
                        </ActiveNavItem>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <IconButton
                    onClick={toggleDarkMode}
                    sx={{
                        mb: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2)
                        }
                    }}
                >
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>

                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.2),
                        }
                    }}
                >
                    <ListItemIcon>
                        <LogoutIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{
                            fontWeight: 500
                        }}
                    />
                </ListItemButton>
            </Box>
        </GlassDrawer>
    );

    return (
        <Box sx={{ display: 'flex', width: '100%', overflowX: 'hidden' }}>
            <GlassAppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar disableGutters sx={{
                    minHeight: { xs: 64, md: 70 },
                    px: { xs: 1, sm: 2, md: 3 },
                    width: '100%',
                    margin: '0 auto'
                }}>
                    {/* Mobile logo and menu */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flex: 1 }}>
                        <IconButton
                            size="large"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            color="inherit"
                            sx={{ mr: 1 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box
                            component="img"
                            src={logo}
                            alt="Logo"
                            sx={{ height: 40, mr: 1 }}
                        />
                        {!isSmallMobile && (
                            <Typography variant="h6" noWrap sx={{
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '180px'
                            }}>
                                {associationName}
                            </Typography>
                        )}
                    </Box>

                    {/* Desktop branding */}
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        mr: 4
                    }}>
                        <Box
                            component="img"
                            src={logo}
                            alt="Logo"
                            sx={{ height: 40, mr: 1 }}
                        />
                        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                            {associationName}
                        </Typography>
                    </Box>

                    {/* Desktop navigation */}
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        justifyContent: 'center',
                        flex: 1
                    }}>
                        {pages.map((page) => (
                            <Tooltip title={page.name} key={page.name}>
                                <IconButton
                                    component={Link}
                                    to={page.path}
                                    color="inherit"
                                    sx={{
                                        mx: 0.5,
                                        transition: 'all 0.3s',
                                        opacity: page.path === location.pathname ? 1 : 0.7,
                                        transform: page.path === location.pathname ? 'scale(1.1)' : 'scale(1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            transform: 'scale(1.1)',
                                            opacity: 1
                                        }
                                    }}
                                >
                                    <Badge
                                        variant="dot"
                                        color="error"
                                        invisible={page.name !== 'Projects'}
                                    >
                                        {page.icon}
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                        ))}
                    </Box>

                    {/* Right section - notifications and profile */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        ml: 'auto'
                    }}>
                        {/* Theme Toggle - desktop only */}
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                                <IconButton
                                    color="inherit"
                                    onClick={toggleDarkMode}
                                    sx={{ mx: 0.5 }}
                                >
                                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Notification icon */}
                        <Tooltip title="Notifications">
                            <IconButton
                                color="inherit"
                                sx={{ mx: 0.5 }}
                                onClick={handleNotificationsOpen}
                            >
                                <Badge badgeContent={2} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Notifications menu */}
                        <Menu
                            anchorEl={notificationsAnchorEl}
                            open={isNotificationsMenuOpen}
                            onClose={handleNotificationsClose}
                            PaperProps={{
                                sx: {
                                    width: 320,
                                    maxWidth: '100%',
                                    borderRadius: '12px',
                                    mt: 1.5,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
                            </Box>
                            <List sx={{ p: 0 }}>
                                {notifications.map((notification) => (
                                    <ListItem
                                        key={notification.id}
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                            backgroundColor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                                            borderLeft: notification.read ? 'none' : `3px solid ${theme.palette.primary.main}`,
                                        }}
                                    >
                                        <ListItemText
                                            primary={notification.message}
                                            secondary={notification.time}
                                            primaryTypographyProps={{
                                                fontWeight: notification.read ? 400 : 600,
                                                variant: 'body2',
                                            }}
                                            secondaryTypographyProps={{
                                                variant: 'caption',
                                                color: 'text.secondary'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Box sx={{ p: 1, textAlign: 'center' }}>
                                <Button
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        color: theme.palette.primary.main
                                    }}
                                >
                                    View all notifications
                                </Button>
                            </Box>
                        </Menu>

                        {/* User profile */}
                        <Box sx={{ ml: { xs: 0.5, sm: 2 } }}>
                            <ProfileChip
                                avatar={<Avatar sx={{ bgcolor: '#00897B' }}>{userInitial}</Avatar>}
                                label={isSmallMobile ? '' : userName}
                                onClick={handleUserMenuOpen}
                                deleteIcon={<IconButton size="small">▼</IconButton>}
                                onDelete={handleUserMenuOpen}
                            />
                            <Menu
                                sx={{
                                    mt: '45px',
                                    '& .MuiPaper-root': {
                                        borderRadius: '16px',
                                        backgroundImage: darkMode
                                            ? 'linear-gradient(135deg, rgba(30,30,30,0.95), rgba(20,20,20,0.98))'
                                            : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.95))',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
                                        border: darkMode
                                            ? '1px solid rgba(255, 255, 255, 0.05)'
                                            : '1px solid rgba(255, 255, 255, 0.2)'
                                    }
                                }}
                                id="profile-menu"
                                anchorEl={userMenuAnchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={isUserMenuOpen}
                                onClose={handleUserMenuClose}
                            >
                                <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ mr: 1, bgcolor: theme.palette.primary.main }}>{userInitial}</Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>{userName}</Typography>
                                        <Typography variant="caption" color="text.secondary">{userRole}</Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <MenuItem onClick={handleUserMenuClose} sx={{ borderRadius: '8px', mx: 1 }}>
                                    <ListItemIcon>
                                        <PersonIcon fontSize="small" />
                                    </ListItemIcon>
                                    <Typography>My Profile</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleUserMenuClose} sx={{ borderRadius: '8px', mx: 1 }}>
                                    <ListItemIcon>
                                        <SettingsIcon fontSize="small" />
                                    </ListItemIcon>
                                    <Typography>Account Settings</Typography>
                                </MenuItem>
                                <Divider sx={{ my: 1 }} />
                                <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', mx: 1, color: theme.palette.error.main }}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <Typography>Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>
            </GlassAppBar>

            {/* Side drawer - SwipeableDrawer for mobile */}
            {isMobile ? (
                <SwipeableDrawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={handleDrawerToggle}
                    onOpen={() => setDrawerOpen(true)}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            borderRight: 'none',
                            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.05)',
                        },
                    }}
                    ModalProps={{
                        keepMounted: true, // Better performance on mobile
                    }}
                >
                    {drawer}
                </SwipeableDrawer>
            ) : (
                <Drawer
                    variant="permanent"
                    open={true}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            borderRight: 'none',
                            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.05)',
                            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                        },
                    }}
                >
                    <Toolbar />
                    {drawer}
                </Drawer>
            )}

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    backgroundColor: theme.palette.background.default,
                    minHeight: '100vh',
                    transition: 'all 0.3s ease',
                    overflowX: 'hidden',
                }}
            >
                <Toolbar />
                <Box sx={{
                    borderRadius: { xs: '12px', md: '16px' },
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: darkMode
                        ? '0 2px 20px rgba(0, 0, 0, 0.2)'
                        : '0 2px 20px rgba(0, 0, 0, 0.05)',
                    p: { xs: 2, sm: 3 },
                    minHeight: 'calc(100vh - 140px)',
                    overflowX: 'hidden',
                }}>
                    {content}
                </Box>
            </Box>
        </Box>
    );
}