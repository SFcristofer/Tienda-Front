import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns'; // You might need to install date-fns: npm install date-fns

const NotificationCenter = ({ anchorEl, open, handleClose, onMarkAsRead, onNotificationCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const fetchNotifications = async () => {
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get('https://store-ehnr.onrender.com/api/notifications', {
        headers: {
          'x-auth-token': token,
        },
      });
      setNotifications(res.data);
      const unreadCount = res.data.filter(notif => !notif.isRead).length;
      onNotificationCountChange(unreadCount); // Update count in Navbar
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) { // Fetch notifications only when the menu is opened
      fetchNotifications();
    }
  }, [open, token]); // Re-fetch when menu opens or token changes

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`https://store-ehnr.onrender.com/api/notifications/${id}/read`, {}, {
        headers: {
          'x-auth-token': token,
        },
      });
      // Update local state and re-fetch to ensure consistency
      fetchNotifications();
      if (onMarkAsRead) onMarkAsRead(); // Callback to Navbar to potentially re-fetch count
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Assuming a backend endpoint to mark all as read, or iterate
      for (const notif of notifications.filter(n => !n.isRead)) {
        await axios.put(`https://store-ehnr.onrender.com/api/notifications/${notif.id}/read`, {}, {
          headers: {
            'x-auth-token': token,
          },
        });
      }
      fetchNotifications();
      if (onMarkAsRead) onMarkAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read.');
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          maxHeight: 400,
          width: '300px',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <Button onClick={handleMarkAllAsRead} size="small" disabled={notifications.filter(n => !n.isRead).length === 0}>
          Mark All as Read
        </Button>
        <Divider sx={{ my: 1 }} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notifications.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No new notifications.
          </Typography>
        ) : (
          <List dense>
            {notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={() => handleMarkAsRead(notification.id)}>
                <ListItemText
                  primary={notification.message}
                  secondary={
                    <Typography variant="caption" color="textSecondary">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      {!notification.isRead && (
                        <Box component="span" sx={{ ml: 1, color: 'primary.main', fontWeight: 'bold' }}>
                          • New
                        </Box>
                      )}
                    </Typography>
                  }
                  sx={{
                    fontWeight: notification.isRead ? 'normal' : 'bold',
                    color: notification.isRead ? 'text.secondary' : 'text.primary',
                  }}
                />
              </MenuItem>
            ))}
          </List>
        )}
      </Box>
    </Menu>
  );
};

export default NotificationCenter;