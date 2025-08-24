import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Button,
} from '@mui/material';

const OrderConfirmationPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        setError(t('errorLoadingOrderDetails'));
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, t]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!order) return <Alert severity="warning">{t('orderNotFound')}</Alert>;

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

  const handleDownloadReceipt = () => {
    const element = document.getElementById('receipt-details');
    if (element) {
      html2pdf().from(element).save(`receipt_order_${order.id}.pdf`);
    } else {
      console.error('Receipt content element not found.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" color="success.main" gutterBottom>{t('orderPlaced')}</Typography>
        <Typography variant="h5" color="text.secondary">{t('thankYouForPurchase')}</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>{t('orderId')}: <span style={{ fontWeight: 'bold' }}>{order.id}</span></Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleDownloadReceipt}>{t('downloadReceipt')}</Button>
      </Paper>

      <Alert severity="info" sx={{ mt: 4 }}><strong>{t('nextStepsTitle')}:</strong> {t('nextSteps')}</Alert>

      <Box sx={{ mt: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: '8px' }} id="receipt-details">
        <Typography variant="h5" gutterBottom>{t('orderSummary')}</Typography>
        <Typography variant="body1"><strong>{t('totalAmount')}:</strong> ${order.totalAmount.toFixed(2)}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body1"><strong>{t('status')}:</strong></Typography>
          <Chip label={t(`orderStatus_${order.status}`)} color={getStatusChipColor(order.status)} size="small" />
        </Box>
        <Typography variant="body1"><strong>{t('deliveryAddress')}:</strong> {order.deliveryAddress}</Typography>
        <Typography variant="body1"><strong>{t('orderDate')}:</strong> {new Date(order.createdAt).toLocaleDateString()}</Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>{t('sellerInformation')}</Typography>
        <Typography variant="body1"><strong>{t('store')}:</strong> {order.store.name}</Typography>
        <Typography variant="body1"><strong>{t('seller')}:</strong> {order.store.owner.name}</Typography>
        <Typography variant="body1"><strong>{t('contact')}:</strong> {order.store.owner.email}</Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>{t('items')}:</Typography>
        <List dense>
          {order.items.map((item) => (
            <ListItem key={item.id}>
              <ListItemText primary={`${item.product.name} x ${item.quantity}`} secondary={`$${item.priceAtOrder.toFixed(2)} ${t('each')}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default OrderConfirmationPage;