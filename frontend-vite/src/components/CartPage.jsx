import React, { useContext } from 'react';
import { Container, Typography, Button, Grid, Card, CardContent, CardMedia, Box, IconButton, TextField, Stack, Divider, Paper, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'; // For empty cart icon
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AuthContext from '../context/AuthContext';

function CartPage() {
  const { cartItems, cartTotal, updateCartItemQuantity, removeItemFromCart, clearCart } = useCart();
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleUpdateQuantity = (cartItemId, productId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      updateCartItemQuantity(cartItemId, productId, newQuantity);
    }
  };

  const handleRemoveItem = (cartItemId, productId) => {
    removeItemFromCart(cartItemId, productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = () => {
    if (isLoggedIn) {
      navigate('/checkout'); // Assuming a checkout page exists
    } else {
      navigate('/login', { state: { from: '/checkout' } }); // Redirect to login, then to checkout
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <ShoppingCartOutlinedIcon sx={{ fontSize: 100, color: 'text.disabled', mb: 3 }} />
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Tu carrito está vacío
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Parece que aún no has añadido nada a tu carrito. ¡Explora nuestros productos y encuentra algo que te guste!
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained" size="large" sx={{ mt: 2 }}>
          Explorar Productos
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Tu Carrito de Compras
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {cartItems.map((item) => (
              <Paper key={item.product.id} elevation={2} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 120, height: 120, objectFit: 'contain', borderRadius: '4px', mr: 2 }}
                    image={item.product.imageUrl || '/images/product-placeholder.svg'}
                    alt={item.product.name}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ${item.product.price.toFixed(2)} cada uno
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.product.id, item.quantity, -1)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <TextField
                        value={item.quantity}
                        size="small"
                        sx={{ width: 50, mx: 0.5 }}
                        inputProps={{ readOnly: true, style: { textAlign: 'center' } }}
                      />
                      <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.product.id, item.quantity, 1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <Tooltip title="Eliminar del carrito">
                        <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.id, item.product.id)} sx={{ ml: 2 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '8px' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Resumen del Pedido
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Subtotal:</Typography>
              <Typography variant="h6">${cartTotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Total:</Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                ${cartTotal.toFixed(2)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mb: 1, py: 1.5 }}
              onClick={handleCheckout}
            >
              Proceder al Pago
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ py: 1.5 }}
              onClick={handleClearCart}
            >
              Vaciar Carrito
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CartPage;

