import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import {
  Container, Typography, Box, Button, CircularProgress, Alert, TextField, Paper, Grid,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      totalAmount
      status
      deliveryAddress
      items {
        product {
          name
        }
        quantity
      }
    }
  }
`;

const CREATE_PAYMENT_INTENT_MUTATION = gql`
  mutation CreatePaymentIntent($orderId: ID!) {
    createPaymentIntent(orderId: $orderId) {
      clientSecret
    }
  }
`;

function CheckoutPage() {
  const { isLoggedIn, user } = useContext(AuthContext);
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const [createOrder] = useMutation(CREATE_ORDER_MUTATION);
  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT_MUTATION);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login'); // Redirect to login if not authenticated
    }
    if (cartItems.length === 0) {
      navigate('/cart'); // Redirect to cart if empty
    }
    // Set default selected address if user has addresses
    if (user?.addresses && user.addresses.length > 0) {
      setSelectedAddressId(user.addresses[0].id); // Select the first address by default
    }
  }, [isLoggedIn, cartItems, navigate, user]);

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setPaymentProcessing(true);
    setCheckoutError(null);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded. Make sure to disable form submission until Stripe.js has loaded.
      setPaymentProcessing(false);
      return;
    }

    if (!selectedAddressId) {
      setCheckoutError('Por favor, selecciona una dirección de entrega.');
      setPaymentProcessing(false);
      return;
    }

    if (!user || !user.addresses || user.addresses.length === 0) {
      setCheckoutError('No se encontró una dirección de usuario. Por favor, añade una dirección en tu perfil.');
      setPaymentProcessing(false);
      return;
    }

    if (cartItems.length === 0 || !cartItems[0].product || !cartItems[0].product.store) {
      setCheckoutError('El carrito está vacío o los productos no tienen la información de la tienda completa.');
      setPaymentProcessing(false);
      return;
    }

    try {
      // 1. Create the Order in your backend
      const orderInput = {
        storeId: cartItems[0].product.store.id, // Assuming all items are from the same store for simplicity
        addressId: selectedAddressId, // Use the selected address ID
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          priceAtOrder: item.product.price, // Capture price at the time of order
        })),
      };

      const { data: orderData } = await createOrder({
        variables: { input: orderInput },
      });

      const orderId = orderData.createOrder.id;

      // 2. Create Payment Intent in your backend
      const { data: paymentIntentData } = await createPaymentIntent({
        variables: { orderId },
      });

      const clientSecret = paymentIntentData.createPaymentIntent.clientSecret;

      // 3. Confirm the payment on the client side
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setCheckoutError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        setCheckoutError(null);
        clearCart(); // Clear cart on successful payment
        navigate(`/order-confirmation/${orderId}`); // Navigate to confirmation page
      } else {
        setCheckoutError('El pago no fue exitoso. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message);
    }
    setPaymentProcessing(false);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      {checkoutError && <Alert severity="error" sx={{ mb: 2 }}>{checkoutError}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Resumen del Pedido</Typography>
            {cartItems.length === 0 ? (
              <Typography>Tu carrito está vacío.</Typography>
            ) : (
              <>
                {cartItems.map(item => (
                  <Box key={item.product.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{item.product.name} x {item.quantity}</Typography>
                    <Typography>${(item.product.price * item.quantity).toFixed(2)}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, fontWeight: 'bold' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">${cartTotal.toFixed(2)}</Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Dirección de Entrega</Typography>
            {user?.addresses && user.addresses.length > 0 ? (
              <FormControl fullWidth margin="normal">
                <InputLabel id="delivery-address-label">Selecciona una Dirección</InputLabel>
                <Select
                  labelId="delivery-address-label"
                  value={selectedAddressId}
                  label="Selecciona una Dirección"
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                >
                  {user.addresses.map(address => (
                    <MenuItem key={address.id} value={address.id}>
                      {`${address.street}, ${address.city}, ${address.state}, ${address.country}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                No tienes direcciones guardadas. Por favor, añade una en tu perfil.
              </Alert>
            )}

            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>Detalles de Pago</Typography>
            <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handlePlaceOrder}
              disabled={paymentProcessing || cartItems.length === 0}
              sx={{ mt: 2 }}
            >
              {paymentProcessing ? <CircularProgress size={24} /> : 'Realizar Pedido'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function WrappedCheckoutPage() {
  const [stripeKeyError, setStripeKeyError] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    if (!publicKey) {
      setStripeKeyError('La clave publicable de Stripe no está configurada. Por favor, establece REACT_APP_STRIPE_PUBLISHABLE_KEY en tu archivo .env');
    } else {
      setStripePromise(loadStripe(publicKey));
    }
  }, []);

  if (stripeKeyError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{stripeKeyError}</Alert>
      </Container>
    );
  }

  if (!stripePromise) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      </Container>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutPage />
    </Elements>
  );
}