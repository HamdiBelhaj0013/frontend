import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Box,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    Button,
    Tooltip,
    CircularProgress,
    Chip,
    Avatar
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
    NotificationsNoneOutlined as NotificationsIcon,
    CheckCircleOutline as CheckCircleIcon,
    EventAvailable as EventIcon,
    MonetizationOn as MoneyIcon,
    Report as ReportIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    MailOutline as MailIcon,
    LocalAtm as DonationIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    DoDisturbOn as CancelIcon,
    Alarm as ReminderIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    TimerOutlined as DueIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Styled components
const NotificationBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
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

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 16,
        width: 320,
        maxHeight: 500,
        boxShadow: theme.palette.mode === 'dark'
            ? '0 10px 40px rgba(0, 0, 0, 0.5)'
            : '0 10px 40px rgba(0, 0, 0, 0.1)',
        padding: theme.spacing(1, 0),
    },
}));

const NotificationItem = styled(ListItem)(({ theme, read }) => ({
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.2s ease',
    position: 'relative',
    backgroundColor: read ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
    borderLeft: read ? 'none' : `3px solid ${theme.palette.primary.main}`,
    '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.main, 0.1)
            : alpha(theme.palette.primary.main, 0.05),
    },
    '&:not(:last-child)': {
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    },
}));

const EmptyNotification = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
    '& svg': {
        fontSize: 48,
        color: alpha(theme.palette.text.secondary, 0.5),
        marginBottom: theme.spacing(2),
    },
}));

const NotificationPriorityIndicator = styled('span')(({ theme, priority }) => {
    let color;
    switch (priority) {
        case 'high':
            color = theme.palette.error.main;
            break;
        case 'medium':
            color = theme.palette.warning.main;
            break;
        default:
            color = theme.palette.info.main;
    }

    return {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'inline-block',
        marginRight: theme.spacing(1),
    };
});

// Map notification types to icons
const getNotificationIcon = (type, theme) => {
    const { NOTIFICATION_TYPES } = useNotifications();

    switch (type) {
        case NOTIFICATION_TYPES.MEETING_SCHEDULED:
            return <EventIcon sx={{ color: theme.palette.success.main }} />;
        case NOTIFICATION_TYPES.MEETING_CANCELLED:
            return <CancelIcon sx={{ color: theme.palette.error.main }} />;
        case NOTIFICATION_TYPES.MEETING_REMINDER:
            return <ReminderIcon sx={{ color: theme.palette.warning.main }} />;
        case NOTIFICATION_TYPES.REPORT_DUE:
            return <DueIcon sx={{ color: theme.palette.warning.main }} />;
        case NOTIFICATION_TYPES.REPORT_OVERDUE:
            return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
        case NOTIFICATION_TYPES.TRANSACTION_CREATED:
            return <MoneyIcon sx={{ color: theme.palette.info.main }} />;
        case NOTIFICATION_TYPES.TRANSACTION_UPDATED:
            return <EditIcon sx={{ color: theme.palette.info.main }} />;
        case NOTIFICATION_TYPES.TRANSACTION_DELETED:
            return <DeleteIcon sx={{ color: theme.palette.error.main }} />;
        case NOTIFICATION_TYPES.DONATION_RECEIVED:
            return <DonationIcon sx={{ color: theme.palette.success.main }} />;
        case NOTIFICATION_TYPES.USER_JOINED:
        case NOTIFICATION_TYPES.USER_LEFT:
            return <PeopleIcon sx={{ color: theme.palette.info.main }} />;
        case NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED:
            return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
        case NOTIFICATION_TYPES.OFFICIAL_LETTER_REQUIRED:
            return <MailIcon sx={{ color: theme.palette.error.main }} />;
        case NOTIFICATION_TYPES.BUDGET_THRESHOLD:
            return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
        case NOTIFICATION_TYPES.MONTHLY_SUMMARY:
            return <AssignmentIcon sx={{ color: theme.palette.success.main }} />;
        default:
            return <NotificationsIcon sx={{ color: theme.palette.primary.main }} />;
    }
};

const NotificationMenu = ({ buttonStyle }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        handleNotificationClick
    } = useNotifications();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleNotificationSelect = (notification) => {
        handleNotificationClick(notification);
        handleCloseMenu();
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    const handleViewAll = () => {
        navigate('/notifications');
        handleCloseMenu();
    };

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    onClick={handleOpenMenu}
                    color="inherit"
                    sx={buttonStyle}
                >
                    <NotificationBadge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </NotificationBadge>
                </IconButton>
            </Tooltip>

            <StyledMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Notifications
                        {unreadCount > 0 && (
                            <Chip
                                size="small"
                                label={unreadCount}
                                color="error"
                                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                            />
                        )}
                    </Typography>

                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={handleMarkAllRead}
                            sx={{
                                textTransform: 'none',
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                                fontSize: '0.8rem',
                            }}
                        >
                            Mark all as read
                        </Button>
                    )}
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={40} thickness={4} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <EmptyNotification>
                        <NotificationsIcon />
                        <Typography variant="body1" align="center">
                            No notifications yet
                        </Typography>
                        <Typography variant="body2" align="center" color="textSecondary">
                            We'll notify you when something arrives
                        </Typography>
                    </EmptyNotification>
                ) : (
                    <List sx={{ maxHeight: 320, overflow: 'auto', p: 0 }}>
                        {notifications.slice(0, 5).map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                read={notification.read}
                                button
                                onClick={() => handleNotificationSelect(notification)}
                            >
                                <Box sx={{ mr: 1.5 }}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 40, height: 40 }}>
                                        {getNotificationIcon(notification.notification_type, theme)}
                                    </Avatar>
                                </Box>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <NotificationPriorityIndicator priority={notification.priority} />
                                            <Typography variant="body1" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                                                {notification.title}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                                                {notification.message}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                                                {dayjs(notification.created_at).fromNow()}
                                            </Typography>
                                        </>
                                    }
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        sx: { fontWeight: notification.read ? 400 : 600 }
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'body2'
                                    }}
                                />
                            </NotificationItem>
                        ))}
                    </List>
                )}

                <Divider sx={{ my: 1 }} />

                <Box sx={{ p: 1.5, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleViewAll}
                        sx={{
                            borderRadius: 8,
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        View all notifications
                    </Button>
                </Box>
            </StyledMenu>
        </>
    );
};

export default NotificationMenu;