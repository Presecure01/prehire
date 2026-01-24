import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import apiClient, { API_ENDPOINTS } from '../utils/apiClient';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
            // Handle { success: true, notifications: [], pagination: {} } response format
            const data = response.data;
            const notifs = Array.isArray(data) ? data : (data.notifications || []);
            setNotifications(notifs);

            // Use backend count if available in pagination, otherwise calculate
            const count = data.pagination?.unreadCount ?? notifs.filter(n => !n.read).length;
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotifications([]);
        }
    };

    // Mark notification as read
    const markAsRead = async (id) => {
        try {
            await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        setLoading(true);
        try {
            await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    // Delete notification
    const deleteNotification = async (id) => {
        try {
            await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
            setNotifications(notifications.filter(n => n._id !== id));
            const deletedNotif = notifications.find(n => n._id === id);
            if (deletedNotif && !deletedNotif.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications on mount and every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const styles = {
        container: {
            position: 'relative',
            display: 'inline-block'
        },
        bellButton: {
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            fontSize: '20px',
            color: '#374151',
            transition: 'color 0.2s'
        },
        badge: {
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#EF4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
        },
        dropdown: {
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '360px',
            maxHeight: '480px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
            zIndex: 1000,
            overflow: 'hidden',
            display: showDropdown ? 'flex' : 'none',
            flexDirection: 'column'
        },
        header: {
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        headerTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827'
        },
        markAllBtn: {
            background: 'none',
            border: 'none',
            color: '#3B82F6',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background 0.2s'
        },
        notificationsList: {
            overflowY: 'auto',
            maxHeight: '400px'
        },
        notificationItem: {
            padding: '16px 20px',
            borderBottom: '1px solid #F3F4F6',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            gap: '12px'
        },
        unreadDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#3B82F6',
            flexShrink: 0,
            marginTop: '6px'
        },
        notificationContent: {
            flex: 1,
            minWidth: 0
        },
        notificationTitle: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '4px'
        },
        notificationMessage: {
            fontSize: '13px',
            color: '#6B7280',
            lineHeight: '1.5',
            marginBottom: '4px'
        },
        notificationTime: {
            fontSize: '12px',
            color: '#9CA3AF'
        },
        deleteBtn: {
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '16px',
            flexShrink: 0
        },
        emptyState: {
            padding: '32px 20px',
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '14px'
        }
    };

    // Format time ago
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [name, seconds_in_interval] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / seconds_in_interval);
            if (interval >= 1) {
                return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    };

    return (
        <div style={styles.container} ref={dropdownRef}>
            <button
                style={styles.bellButton}
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Notifications"
            >
                <FaBell />
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            <div style={styles.dropdown}>
                <div style={styles.header}>
                    <span style={styles.headerTitle}>Notifications</span>
                    {notifications.length > 0 && unreadCount > 0 && (
                        <button
                            style={styles.markAllBtn}
                            onClick={markAllAsRead}
                            disabled={loading}
                        >
                            {loading ? 'Marking...' : 'Mark all read'}
                        </button>
                    )}
                </div>

                <div style={styles.notificationsList}>
                    {notifications.length === 0 ? (
                        <div style={styles.emptyState}>
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                style={{
                                    ...styles.notificationItem,
                                    background: notif.read ? 'white' : '#EFF6FF'
                                }}
                                onClick={() => !notif.read && markAsRead(notif._id)}
                            >
                                {!notif.read && <div style={styles.unreadDot} />}
                                <div style={styles.notificationContent}>
                                    <div style={styles.notificationTitle}>{notif.title}</div>
                                    <div style={styles.notificationMessage}>{notif.message}</div>
                                    <div style={styles.notificationTime}>{timeAgo(notif.createdAt)}</div>
                                </div>
                                <button
                                    style={styles.deleteBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notif._id);
                                    }}
                                    aria-label="Delete notification"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationBell;
