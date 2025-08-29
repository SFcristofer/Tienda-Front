import React, { useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { MY_NOTIFICATIONS_QUERY } from '../graphql/queries';
import { MARK_NOTIFICATION_AS_READ_MUTATION, MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION } from '../graphql/mutations';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete'; // Assuming we might add delete later
import { useTranslation } from 'react-i18next';

const NotificationCenter = ({ onUnreadCountChange, userRole }) => { // Added onUnreadCountChange prop
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(MY_NOTIFICATIONS_QUERY);

  useEffect(() => {
    if (data && onUnreadCountChange) {
      const unread = data.myNotifications.filter(n => !n.isRead).length;
      onUnreadCountChange(unread);
    }
  }, [data, onUnreadCountChange]);
  const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ_MUTATION, {
    onCompleted: () => refetch(),
    onError: (err) => console.error("Error marking notification as read:", err),
  });
  const [markAllNotificationsAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION, {
    onCompleted: () => refetch(),
    onError: (err) => console.error("Error marking all notifications as read:", err),
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{t('errorLoadingNotifications')}: {error.message}</Alert>;

  const notifications = data?.myNotifications || [];
  const unreadNotifications = notifications.filter(n => !n.isRead);

  const handleMarkAsRead = (id) => {
    markNotificationAsRead({ variables: { id } });
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markNotificationAsRead({ variables: { id: notification.id } });
    }

    // Navigate based on notification type and user role
    switch (notification.type) {
      case 'NEW_ORDER':
        if (userRole === 'seller') {
          navigate(`/dashboard`); // Seller goes to dashboard for new orders
        } else { // Buyer or Admin
          navigate(`/order-confirmation/${notification.relatedEntityId}`);
        }
        break;
      case 'ORDER_STATUS_UPDATE':
        navigate(`/order-confirmation/${notification.relatedEntityId}`); // Buyer goes to order confirmation
        break;
      case 'NEW_PRODUCT_REVIEW':
        navigate(`/product-details/${notification.relatedEntityId}`);
        break;
      case 'STORE_DEACTIVATED':
        navigate(`/dashboard`); // Or a more specific store management page
        break;
      case 'PRODUCT_DEACTIVATED':
        navigate(`/dashboard`); // Or a more specific product management page
        break;
      // Add more cases for other notification types
      default:
        // If no specific route, just close the notification center or do nothing
        console.log('No specific route for this notification type:', notification.type);
        break;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box mb={2}>
        <Typography variant="h5">{t('notifications')}</Typography>
        {unreadNotifications.length > 0 && (
          <Button
            variant="outlined"
            onClick={handleMarkAllAsRead}
            startIcon={<MarkEmailReadIcon />}
            sx={{ mt: 1 }} // Add margin-top to separate from title
          >
            {t('markAllAsRead')}
          </Button>
        )}
      </Box>
      {notifications.length === 0 ? (
        <Typography>{t('noNotifications')}</Typography>
      ) : (
        <List>
          {notifications.map((notification) => (
            <ListItemButton
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              secondaryAction={
                !notification.isRead && (
                  <IconButton edge="end" aria-label="mark as read" onClick={() => handleMarkAsRead(notification.id)}>
                    <MarkEmailReadIcon />
                  </IconButton>
                )
              }
              sx={{
                backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={notification.message}
                secondary={new Date(notification.createdAt).toLocaleString()}
                primaryTypographyProps={{ variant: 'body2' }} 
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default NotificationCenter;
