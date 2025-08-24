import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { CUSTOMER_ORDERS_QUERY } from '../graphql/queries';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import ProductReviewForm from './ProductReviewForm';

const OrderHistory = () => {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useQuery(CUSTOMER_ORDERS_QUERY);

  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  const handleOpenReviewDialog = (productId) => {
    setCurrentProductId(productId);
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
    setCurrentProductId(null);
    refetch();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{t('errorLoadingOrders', { message: error.message })}</Alert>;

  const orders = data?.customerOrders || [];

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'payment_pending': return 'warning';
      case 'payment_confirmed': return 'info';
      case 'delivery_agreed': return 'secondary';
      case 'delivered_payment_received': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t('yourOrders')}</Typography>
      {orders.length === 0 ? (
        <Typography>{t('youHaventPlacedOrders')}</Typography>
      ) : (
        <List>
          {orders.map((order) => (
            <Paper key={order.id} sx={{ mb: 2, p: 3, boxShadow: 3, borderRadius: 2, display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>{t('orderId')}: {order.id}</Typography>
                  <Typography variant="body2">{t('store')}: {order.store.name}</Typography>
                  <Typography variant="body2">{t('orderDate')}: {new Date(order.createdAt).toLocaleString()}</Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>{t('total')}: ${order.totalAmount.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                  <Chip label={t(`orderStatus_${order.status}`)} color={getStatusChipColor(order.status)} sx={{ mb: 1, fontWeight: 'bold' }} />
                  <Typography variant="body2">{order.items.length} {t('items')}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>{t('items')}:</Typography>
                <List dense>
                  {order.items.map((item) => (
                    <ListItem key={item.id} secondaryAction={order.status === 'delivered_payment_received' && <Button variant="outlined" size="small" onClick={() => handleOpenReviewDialog(item.product.id)}>{t('leaveReview')}</Button>}>
                      <ListItemText primary={`${item.product.name} x ${item.quantity}`} secondary={`$${item.priceAtOrder.toFixed(2)} ${t('each')}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button component={Link} to={`/order-confirmation/${order.id}`} variant="text" size="small">{t('viewReceipt')}</Button>
              </Box>
            </Paper>
          ))}
        </List>
      )}

      {openReviewDialog && (
        <Dialog open={openReviewDialog} onClose={handleCloseReviewDialog}>
          <DialogTitle>{t('leaveReview')}</DialogTitle>
          <DialogContent>
            <ProductReviewForm productId={currentProductId} onReviewSubmitted={handleCloseReviewDialog} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReviewDialog}>{t('cancel')}</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default OrderHistory;