import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Assuming axios is installed. If not, user will need to install it.
import html2pdf from 'html2pdf.js'; // Import html2pdf.js
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
  Button, // Added Button for download
} from '@mui/material';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`https://store-ehnr.onrender.com/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Error loading order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;

  if (!order) {
    return (
      <Alert severity="warning">Order not found or an error occurred.</Alert>
    );
  }

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'payment_pending':
        return 'warning';
      case 'payment_confirmed':
        return 'info';
      case 'delivery_agreed':
        return 'secondary';
      case 'delivered_payment_received':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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
        <Typography variant="h3" color="success.main" gutterBottom>
          Order Placed!
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Thank you for your purchase. Your order has been sent to the seller.
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Order ID: <span style={{ fontWeight: 'bold' }}>{order.id}</span>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleDownloadReceipt}
        >
          Download Receipt
        </Button>
      </Paper>

      <Alert severity="info" sx={{ mt: 4 }}>
        <strong>Next Steps:</strong> The seller will contact you within the next 24 hours to arrange payment and delivery details. You can also contact them directly using the information below.
      </Alert>

      <Box sx={{ mt: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: '8px' }} id="receipt-details">
        <Typography variant="h5" gutterBottom>
          Order Summary
        </Typography>
        <Typography variant="body1">
          <strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body1">
            <strong>Status:</strong>
          </Typography>
          <Chip
            label={order.status.replace('_', ' ').toUpperCase()}
            color={getStatusChipColor(order.status)}
            size="small"
          />
        </Box>
        <Typography variant="body1">
          <strong>Delivery Address:</strong> {order.deliveryAddress}
        </Typography>
        <Typography variant="body1">
          <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Seller Information
        </Typography>
        <Typography variant="body1">
          <strong>Store:</strong> {order.store.name}
        </Typography>
        <Typography variant="body1">
          <strong>Seller:</strong> {order.store.owner.name}
        </Typography>
        <Typography variant="body1">
          <strong>Contact:</strong> {order.store.owner.email}
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Items:
        </Typography>
        <List dense>
          {order.items.map((item) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={`${item.product.name} x ${item.quantity}`}
                secondary={`$${item.priceAtOrder.toFixed(2)} each`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default OrderConfirmationPage;