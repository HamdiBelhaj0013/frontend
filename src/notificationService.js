// notificationService.js - Update the API endpoint paths to match your backend

import Axios from './components/Axios.jsx';

class NotificationService {
    constructor() {
        this.listeners = [];
        this.notificationsCache = [];
        this.pollingInterval = null;
        this.pollingTime = 30000; // 30 seconds
    }

    // Initialize the notification service
    initialize(userId) {
        this.userId = userId;
        this.startPolling();
        return this;
    }

    // Start polling for new notifications
    startPolling() {
        if (this.pollingInterval) return;

        // Immediate first check
        this.fetchNotifications();

        // Set up regular polling
        this.pollingInterval = setInterval(() => {
            this.fetchNotifications();
        }, this.pollingTime);
    }

    // Stop polling
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // Fetch notifications from the backend
    async fetchNotifications() {
        try {
            // Update this endpoint to match your Django URL configuration
            const response = await Axios.get('/api/notifications/');

            // Check if we have new notifications
            const newNotifications = this.filterNewNotifications(response.data);

            // Update cache
            this.notificationsCache = response.data;

            // Notify listeners if we have new notifications
            if (newNotifications.length > 0) {
                this.notifyListeners(newNotifications);
            }

            return response.data;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            return [];
        }
    }

    // Filter new notifications that we haven't seen before
    filterNewNotifications(notifications) {
        if (!this.notificationsCache.length) return notifications;

        const existingIds = new Set(this.notificationsCache.map(n => n.id));
        return notifications.filter(notification => !existingIds.has(notification.id));
    }

    // Get all notifications
    async getNotifications() {
        if (this.notificationsCache.length) {
            return this.notificationsCache;
        }

        return await this.fetchNotifications();
    }

    // Get count of unread notifications
    async getUnreadCount() {
        try {
            // Update this endpoint to match your Django URL configuration
            const response = await Axios.get('/api/notifications/unread_count/');
            return response.data.count;
        } catch (error) {
            console.error('Failed to get unread count:', error);

            // Fallback to counting from cache
            const notifications = await this.getNotifications();
            return notifications.filter(n => !n.read).length;
        }
    }

    // Mark a notification as read
    async markAsRead(notificationId) {
        try {
            // Update this endpoint to match your Django URL configuration
            await Axios.post(`/api/notifications/${notificationId}/mark_as_read/`);

            // Update cache
            this.notificationsCache = this.notificationsCache.map(notification => {
                if (notification.id === notificationId) {
                    return { ...notification, read: true };
                }
                return notification;
            });

            return true;
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            return false;
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        try {
            // Update this endpoint to match your Django URL configuration
            await Axios.post('/api/notifications/mark_all_as_read/');

            // Update cache
            this.notificationsCache = this.notificationsCache.map(notification => {
                return { ...notification, read: true };
            });

            return true;
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            return false;
        }
    }

    // Subscribe to notifications
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    // Notify all listeners
    notifyListeners(newNotifications) {
        this.listeners.forEach(listener => {
            try {
                listener(newNotifications);
            } catch (error) {
                console.error('Error in notification listener:', error);
            }
        });
    }

    // Create a desktop notification
    showDesktopNotification(notification) {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            this.createDesktopNotification(notification);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.createDesktopNotification(notification);
                }
            });
        }
    }

    // Create and display the actual notification
    createDesktopNotification(notification) {
        const title = notification.title || 'New Notification';
        const options = {
            body: notification.message,
            icon: '/logo192.png', // Your app logo
            requireInteraction: notification.priority === 'high'
        };

        const desktopNotification = new Notification(title, options);

        desktopNotification.onclick = () => {
            window.focus();
            if (notification.url) {
                window.location.href = notification.url;
            }
        };
    }

    // Cleanup
    cleanup() {
        this.stopPolling();
        this.listeners = [];
    }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;