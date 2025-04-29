import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import notificationService from '../notificationService.js';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionsContext.jsx';

// Create context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

// Notification types and their corresponding actions
const NOTIFICATION_TYPES = {
    MEETING_SCHEDULED: 'meeting_scheduled',
    MEETING_CANCELLED: 'meeting_cancelled',
    MEETING_REMINDER: 'meeting_reminder',
    REPORT_DUE: 'report_due',
    REPORT_OVERDUE: 'report_overdue',
    TRANSACTION_CREATED: 'transaction_created',
    TRANSACTION_UPDATED: 'transaction_updated',
    TRANSACTION_DELETED: 'transaction_deleted',
    DONATION_RECEIVED: 'donation_received',
    USER_JOINED: 'user_joined',
    USER_LEFT: 'user_left',
    ADMIN_ACTION_REQUIRED: 'admin_action_required',
    OFFICIAL_LETTER_REQUIRED: 'official_letter_required',
    BUDGET_THRESHOLD: 'budget_threshold',
    MONTHLY_SUMMARY: 'monthly_summary'
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { can, RESOURCES, ACTIONS, userRole } = usePermissions();

    // Update notifications
    const updateNotifications = useCallback(async () => {
        try {
            const fetchedNotifications = await notificationService.getNotifications();
            setNotifications(fetchedNotifications);
            setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error updating notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize notification service
    useEffect(() => {
        const initializeNotifications = async () => {
            try {
                // Check if the user is authenticated
                const token = localStorage.getItem('Token') || localStorage.getItem('token');
                if (!token) {
                    console.log('User not authenticated, skipping notification initialization');
                    setLoading(false);
                    return;
                }

                console.log('Initializing notification service');
                notificationService.initialize();

                // Subscribe to new notifications
                const unsubscribe = notificationService.subscribe((newNotifications) => {
                    console.log('Received new notifications:', newNotifications);

                    // Filter notifications based on user role
                    const filteredNotifications = filterNotificationsByUserRole(newNotifications);

                    // Update state with new notifications
                    setNotifications(prev => [...filteredNotifications, ...prev]);
                    setUnreadCount(prev => prev + filteredNotifications.length);

                    // Show toast for high priority notifications
                    filteredNotifications.forEach(notification => {
                        if (notification.priority === 'high') {
                            enqueueSnackbar(notification.title, {
                                variant: 'info',
                                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                action: () => (
                                    <button onClick={() => handleNotificationClick(notification)}>
                                        View
                                    </button>
                                )
                            });

                            // Show desktop notification for high priority items
                            notificationService.showDesktopNotification(notification);
                        }
                    });
                });

                // Initial fetch
                await updateNotifications();
                console.log('Initial notifications loaded');

                return () => {
                    unsubscribe();
                    notificationService.cleanup();
                };
            } catch (error) {
                console.error('Failed to initialize notifications:', error);
                setLoading(false);
            }
        };

        initializeNotifications();
    }, [updateNotifications, enqueueSnackbar]);

    // Filter notifications based on user role
    const filterNotificationsByUserRole = (notificationsList) => {
        // Admin users see all notifications
        if (userRole === 'admin' || userRole === 'treasurer' || userRole === 'president') {
            return notificationsList;
        }

        // Regular members only see meeting-related notifications and ones specifically for them or their role
        return notificationsList.filter(notification => {
            return notification.notification_type.startsWith('meeting_') ||
                notification.recipient === localStorage.getItem('userId') ||
                notification.recipient_role === userRole ||
                (notification.recipient_role === null && notification.recipient === null); // All-users notifications
        });
    };

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        // Mark as read
        await markAsRead(notification.id);

        // Navigate to relevant page based on notification type
        if (notification.url) {
            navigate(notification.url);
        } else {
            // Default navigation based on notification type
            switch (notification.notification_type) {
                case NOTIFICATION_TYPES.MEETING_SCHEDULED:
                case NOTIFICATION_TYPES.MEETING_CANCELLED:
                case NOTIFICATION_TYPES.MEETING_REMINDER:
                    navigate('/meetings');
                    break;
                case NOTIFICATION_TYPES.TRANSACTION_CREATED:
                case NOTIFICATION_TYPES.TRANSACTION_UPDATED:
                case NOTIFICATION_TYPES.TRANSACTION_DELETED:
                case NOTIFICATION_TYPES.DONATION_RECEIVED:
                    navigate('/finance');
                    break;
                case NOTIFICATION_TYPES.USER_JOINED:
                case NOTIFICATION_TYPES.USER_LEFT:
                    navigate('/members');
                    break;
                default:
                    break;
            }
        }
    };

    // Mark a notification as read
    const markAsRead = async (notificationId) => {
        const success = await notificationService.markAsRead(notificationId);
        if (success) {
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === notificationId ? { ...notification, read: true } : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return success;
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        const success = await notificationService.markAllAsRead();
        if (success) {
            setNotifications(prevNotifications =>
                prevNotifications.map(notification => ({ ...notification, read: true }))
            );
            setUnreadCount(0);
        }
        return success;
    };

    // Refresh notifications
    const refresh = () => {
        updateNotifications();
    };

    // Value provided by the context
    const value = {
        notifications: filterNotificationsByUserRole(notifications),
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh,
        handleNotificationClick,
        NOTIFICATION_TYPES
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;