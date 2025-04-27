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
    SwipeableDrawer,
    Fade,

} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Import the ColorModeContext hook
import { useColorMode } from '../contexts/ThemeContext';

// Icons
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import logo from '../assets/logowhite.png';
import Axios from './Axios';

// Enhanced styled components for better appearance and smoothness
const GlassAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(0, 137, 123, 0.97), rgba(0, 105, 92, 0.95))',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    position: 'fixed',
    zIndex: theme.zIndex.drawer + 1,
}));

const GlassDrawer = styled(Box)(({ theme }) => ({
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(30, 30, 30, 0.98), rgba(20, 20, 20, 0.95))'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 250, 250, 0.95))',
    backdropFilter: 'blur(10px)',
    boxShadow: theme.palette.mode === 'dark'
        ? '0 10px 30px rgba(0, 0, 0, 0.25)'
        : '0 10px 30px rgba(0, 0, 0, 0.1)',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.2)'
            : 'rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(0, 0, 0, 0.15)',
    },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #00897B, #00695C)',
    padding: theme.spacing(3, 2),
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
        zIndex: 0,
    }
}));

const ActiveNavItem = styled(ListItemButton)(({ theme }) => ({
    position: 'relative',
    borderRadius: '12px',
    margin: '4px 8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '15%',
        height: '70%',
        width: 3,
        backgroundColor: theme.palette.primary.main,
        borderRadius: 8,
        opacity: 0,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, rgba(0, 137, 123, 0.1) 0%, transparent 70%)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        zIndex: 0,
        pointerEvents: 'none',
    },
    '&:active::after': {
        opacity: 1,
    },
}));

const ProfileChip = styled(Chip)(({ theme }) => ({
    borderRadius: '50px',
    padding: '0 6px',
    height: 42,
    backgroundColor: alpha(theme.palette.background.paper, 0.15),
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: theme.palette.common.white,
    '& .MuiChip-avatar': {
        width: 32,
        height: 32,
        border: '2px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.25),
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
    },
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& .MuiChip-label': {
        padding: '0 12px 0 8px',
        fontSize: '0.9rem',
        fontWeight: 500,
    },
    '& .MuiChip-deleteIcon': {
        color: 'rgba(255, 255, 255, 0.7)',
        margin: '0 4px 0 -6px',
        transition: 'transform 0.2s ease',
        '&:hover': {
            color: 'rgba(255, 255, 255, 1)',
        }
    },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#ff5252',
        color: '#fff',
        boxShadow: '0 0 0 2px ' + theme.palette.background.paper,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid currentColor',
            content: '""',
        },
    },
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
    color: 'rgba(255, 255, 255, 0.85)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '12px',
    padding: '8px',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        transform: 'translateY(-2px)',
        color: 'rgba(255, 255, 255, 1)',
    },
    '&:active': {
        transform: 'translateY(0)',
    },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& img': {
        transition: 'transform 0.3s ease',
    },
    '&:hover img': {
        transform: 'scale(1.05)',
    },
}));

const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
    borderRadius: '8px',
    margin: '0 8px',
    padding: '10px 16px',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        transform: 'translateX(4px)',
    },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: '16px',
        boxShadow: theme.palette.mode === 'dark'
            ? '0 10px 40px rgba(0, 0, 0, 0.5)'
            : '0 10px 40px rgba(0, 0, 0, 0.1)',
        padding: '8px 0',
        minWidth: '200px',
    },
}));

const NotificationItem = styled(ListItem)(({ theme, read }) => ({
    padding: '12px 16px',
    transition: 'all 0.2s ease',
    position: 'relative',
    backgroundColor: read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
    borderLeft: read ? 'none' : `3px solid ${theme.palette.primary.main}`,
    '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.02)',
    },
    '&:not(:last-child)': {
        borderBottom: '1px solid ' + alpha(theme.palette.divider, 0.1),
    },
}));

const pages = [
    { name: 'Dashboard', path: '/home', icon: <DashboardIcon /> },
    { name: 'Projects', path: '/projects', icon: <BusinessIcon />, hasNotification: true },
    { name: 'Members', path: '/members', icon: <GroupIcon /> },
    {name: 'Pending Users' , path: '/pending-users' , icon: <HourglassEmptyIcon />},
    { name: 'Finance', path: '/finance', icon: <AccountBalanceIcon /> },
    { name: 'Volunteer', path: '/volunteer', icon: <VolunteerActivismIcon /> },
    {name: 'AI Assitance' , path: '/chatbot' , icon: <SmartToyIcon />},
];

export default function NavBar(props) {
    const { content } = props;
    const drawerWidth = 280;
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
    const [scrolled, setScrolled] = useState(false);

    const isUserMenuOpen = Boolean(userMenuAnchorEl);
    const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);

    // Notifications mock data
    const notifications = [
        { id: 1, message: 'New project proposal submitted', time: '10 min ago', read: false },
        { id: 2, message: 'Budget report is ready for review', time: '1 hour ago', read: false },
        { id: 3, message: 'Team meeting scheduled for tomorrow', time: '3 hours ago', read: true },
    ];

    // Handle scroll event for navbar appearance change
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 60) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
            <DrawerHeader sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
            }}>
                {isMobile && (
                    <IconButton
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
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
                    position: 'relative',
                    zIndex: 1
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                    >
                        <img src={logo} alt="Logo" style={{ height: 70, marginBottom: 16 }} />
                    </motion.div>

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
            </DrawerHeader>

            {/* User profile in sidebar */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 3,
                px: 2,
                borderBottom: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                background: darkMode ?
                    'linear-gradient(180deg, rgba(0,105,92,0.2) 0%, rgba(30,30,30,0) 100%)' :
                    'linear-gradient(180deg, rgba(0,105,92,0.05) 0%, rgba(255,255,255,0) 100%)'
            }}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                    <Avatar
                        sx={{
                            width: 72,
                            height: 72,
                            mb: 1.5,
                            border: '2px solid #00897B',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            background: 'linear-gradient(135deg, #00897B, #00695C)'
                        }}
                    >
                        {userInitial}
                    </Avatar>
                </motion.div>

                <Typography variant="h6" sx={{
                    fontWeight: 600,
                    textAlign: 'center',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mb: 0.5
                }}>
                    {userName}
                </Typography>

                <Chip
                    label={userRole}
                    size="small"
                    sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        borderRadius: '50px',
                        padding: '0 8px',
                        height: '24px',
                        '& .MuiChip-label': {
                            padding: '0 8px'
                        }
                    }}
                />
            </Box>

            <List sx={{ mt: 1, px: 1, flexGrow: 1, overflowY: 'auto' }}>
                {pages.map((page) => {
                    // Skip the pending users page for non-admin users
                    if (page.path === '/pending-users' &&
                        !(userRole === 'Super Admin' || userRole === 'Admin' ||
                            userRole === 'President' || userRole === 'Treasurer' ||
                            userRole === 'Secretary')) {
                        return null;
                    }

                    return (
                        <ListItem key={page.name} disablePadding sx={{ mb: 0.5 }}>
                            <ActiveNavItem
                                component={Link}
                                to={page.path}
                                selected={page.path === location.pathname}
                                onClick={isMobile ? handleDrawerToggle : undefined}
                                disableRipple
                                sx={{
                                    transition: 'all 0.3s ease',
                                    transform: 'scale(1)',
                                    '&:hover': {
                                        transform: 'scale(1.02) translateX(4px)'
                                    }
                                }}
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

                                {/* Show notification badge */}
                                {page.hasNotification && (
                                    <Box component="span">
                                        <Badge
                                            color="error"
                                            variant="dot"
                                            sx={{
                                                '& .MuiBadge-dot': {
                                                    transform: 'scale(1.2)',
                                                    boxShadow: '0 0 0 2px ' + (darkMode ? '#2d2d2d' : '#ffffff')
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </ActiveNavItem>
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{
                p: 2,
                borderTop: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                        {darkMode ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                    <IconButton
                        onClick={toggleDarkMode}
                        sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                transform: 'translateY(-2px)'
                            },
                            '&:active': {
                                transform: 'translateY(0)'
                            }
                        }}
                    >
                        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                </Box>

                <Button
                    onClick={handleLogout}
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    sx={{
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        fontWeight: 500,
                        padding: '10px 16px',
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.2),
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
                        },
                        '&:active': {
                            transform: 'translateY(0)'
                        }
                    }}
                >
                    Logout
                </Button>
            </Box>
        </GlassDrawer>
    );

    // Animation variants for header elements
    const headerVariants = {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <Box sx={{ display: 'flex', width: '100%', overflowX: 'hidden' }}>
            <GlassAppBar
                position="fixed"
                elevation={0}
                sx={{
                    boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.1)',
                    height: scrolled ? 60 : 70,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <Toolbar
                    disableGutters
                    sx={{
                        minHeight: { xs: scrolled ? 60 : 64, md: scrolled ? 60 : 70 },
                        px: { xs: 1, sm: 2, md: 3 },
                        width: '100%',
                        margin: '0 auto',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {/* Mobile logo and menu */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flex: 1 }}>
                        <IconButton
                            size="large"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            color="inherit"
                            sx={{
                                mr: 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <LogoContainer
                            sx={{
                                flexGrow: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start'
                            }}
                        >
                            <Box
                                component="img"
                                src={logo}
                                alt="Logo"
                                sx={{
                                    height: scrolled ? 35 : 40,
                                    mr: 1,
                                    transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                            {!isSmallMobile && (
                                <Typography
                                    variant="h6"
                                    noWrap
                                    sx={{
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '180px',
                                        fontSize: scrolled ? '1.1rem' : '1.25rem',
                                        transition: 'font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {associationName}
                                </Typography>
                            )}
                        </LogoContainer>
                    </Box>

                    {/* Desktop branding */}
                    <LogoContainer
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            mr: 4
                        }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Box
                                component="img"
                                src={logo}
                                alt="Logo"
                                sx={{
                                    height: scrolled ? 40 : 45,
                                    mr: 2,
                                    transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                        </motion.div>
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 600,
                                fontSize: scrolled ? '1.2rem' : '1.3rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {associationName}
                        </Typography>
                    </LogoContainer>

                    {/* Desktop navigation */}
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        justifyContent: 'center',
                        flex: 1,
                        gap: 1
                    }}>
                        {pages.map((page) => (
                            <Tooltip
                                title={page.name}
                                key={page.name}
                                TransitionComponent={Fade}
                                TransitionProps={{ timeout: 600 }}
                                placement="bottom"
                                arrow
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                >
                                    <IconButton
                                        component={Link}
                                        to={page.path}
                                        color="inherit"
                                        sx={{
                                            mx: 0.5,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            opacity: page.path === location.pathname ? 1 : 0.75,
                                            position: 'relative',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                opacity: 1
                                            },
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: -3,
                                                left: '50%',
                                                width: page.path === location.pathname ? '60%' : '0%',
                                                height: 3,
                                                backgroundColor: '#fff',
                                                borderRadius: '3px',
                                                transform: 'translateX(-50%)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            },
                                            '&:hover::after': {
                                                width: '40%'
                                            }
                                        }}
                                    >
                                        <NotificationBadge
                                            variant="dot"
                                            color="error"
                                            invisible={!page.hasNotification}
                                        >
                                            {page.icon}
                                        </NotificationBadge>
                                    </IconButton>
                                </motion.div>
                            </Tooltip>
                        ))}
                    </Box>

                    {/* Right section - notifications and profile */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        ml: 'auto',
                        gap: { xs: 0.5, sm: 1 }
                    }}>
                        {/* Theme Toggle - desktop only */}
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Tooltip
                                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                                placement="bottom"
                                TransitionComponent={Fade}
                                arrow
                            >
                                <ActionIconButton
                                    color="inherit"
                                    onClick={toggleDarkMode}
                                    sx={{ mx: 0.5 }}
                                >
                                    {darkMode ? (
                                        <motion.div
                                            initial={{ rotate: -30, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <LightModeIcon />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ rotate: 30, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <DarkModeIcon />
                                        </motion.div>
                                    )}
                                </ActionIconButton>
                            </Tooltip>
                        </Box>

                        {/* Notification icon */}
                        <Tooltip
                            title="Notifications"
                            placement="bottom"
                            TransitionComponent={Fade}
                            arrow
                        >
                            <ActionIconButton
                                color="inherit"
                                sx={{ mx: 0.5 }}
                                onClick={handleNotificationsOpen}
                            >
                                <NotificationBadge badgeContent={notifications.filter(n => !n.read).length} color="error">
                                    <NotificationsNoneIcon />
                                </NotificationBadge>
                            </ActionIconButton>
                        </Tooltip>

                        {/* Notifications menu */}
                        <StyledMenu
                            anchorEl={notificationsAnchorEl}
                            open={isNotificationsMenuOpen}
                            onClose={handleNotificationsClose}
                            PaperProps={{
                                sx: {
                                    width: 320,
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box sx={{
                                p: 2,
                                borderBottom: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: theme.palette.primary.main,
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Mark all as read
                                </Typography>
                            </Box>
                            <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                                <List sx={{ p: 0 }}>
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            read={notification.read}
                                            button
                                            onClick={handleNotificationsClose}
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
                                        </NotificationItem>
                                    ))}
                                </List>
                            </Box>
                            <Box sx={{
                                p: 1.5,
                                textAlign: 'center',
                                borderTop: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                            }}>
                                <Button
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: theme.palette.primary.main,
                                        borderRadius: '8px',
                                        padding: '6px 16px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                        }
                                    }}
                                >
                                    View all notifications
                                </Button>
                            </Box>
                        </StyledMenu>

                        {/* User profile */}
                        <Box sx={{ ml: { xs: 0.5, sm: 1.5 } }}>
                            <ProfileChip
                                avatar={
                                    <Avatar
                                        sx={{
                                            bgcolor: '#00897B',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {userInitial}
                                    </Avatar>
                                }
                                label={isSmallMobile ? '' : userName}
                                onClick={handleUserMenuOpen}
                                deleteIcon={<KeyboardArrowDownIcon sx={{
                                    fontSize: 16,
                                    transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} />}
                                onDelete={handleUserMenuOpen}
                            />
                            <StyledMenu
                                id="profile-menu"
                                anchorEl={userMenuAnchorEl}
                                open={isUserMenuOpen}
                                onClose={handleUserMenuClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <Box sx={{
                                    px: 2.5,
                                    py: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                }}>
                                    <Avatar
                                        sx={{
                                            mr: 1.5,
                                            bgcolor: theme.palette.primary.main,
                                            width: 48,
                                            height: 48
                                        }}
                                    >
                                        {userInitial}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>{userName}</Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    backgroundColor: '#4caf50',
                                                    display: 'inline-block'
                                                }}
                                            />
                                            Active now • {userRole}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ py: 1 }}>
                                    <MenuItemStyled onClick={handleUserMenuClose}>
                                        <ListItemIcon>
                                            <PersonIcon fontSize="small" color="primary" />
                                        </ListItemIcon>
                                        <Typography>My Profile</Typography>
                                    </MenuItemStyled>
                                    <MenuItemStyled onClick={handleUserMenuClose}>
                                        <ListItemIcon>
                                            <SettingsIcon fontSize="small" color="primary" />
                                        </ListItemIcon>
                                        <Typography>Account Settings</Typography>
                                    </MenuItemStyled>
                                </Box>
                                <Divider sx={{ mx: 2, my: 1 }} />
                                <MenuItemStyled
                                    onClick={handleLogout}
                                    sx={{
                                        color: theme.palette.error.main,
                                        mb: 1
                                    }}
                                >
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <Typography>Logout</Typography>
                                </MenuItemStyled>
                            </StyledMenu>
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
                            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
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
                            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)',
                        },
                    }}
                >
                    <Toolbar sx={{
                        height: { xs: 64, md: 70 },
                        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
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
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflowX: 'hidden',
                }}
            >
                <Toolbar sx={{
                    height: { xs: 64, md: 70 },
                    transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
                <Box sx={{
                    borderRadius: { xs: '12px', md: '16px' },
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: darkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                        : '0 8px 32px rgba(0, 0, 0, 0.05)',
                    p: { xs: 2, sm: 3 },
                    minHeight: 'calc(100vh - 140px)',
                    overflowX: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                    {content}
                </Box>
            </Box>
        </Box>
    );
}