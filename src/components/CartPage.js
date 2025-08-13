import React from 'react';
import { useCart } from '../context/CartContext';
import { Link as RouterLink } from 'react-router-dom'; // Importar RouterLink
import {
  Container,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart, loading, error } =
    useCart();

  const handleQuantityChange = (productId, e) => {
    const quantity = e.target.value;
    if (quantity > 0) {
      updateQuantity(productId, quantity);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) {
    if (error.message && error.message.includes('You must be logged in')) {
      return <Alert severity="info">Please log in to view your cart.</Alert>;
    }
    return <Alert severity="error">Error loading cart: {error.message}</Alert>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Shopping Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        <>
          <List>
            {cartItems.map((item) => (
              <ListItem
                key={item.product.id}
                sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: '8px', p: 2 }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={item.product.imageUrl || '/images/product-placeholder.svg'}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div">
                      {item.product.name}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Price: ${item.product.price.toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product.id, e)}
                          inputProps={{ min: 1 }}
                          sx={{ width: '70px', mr: 2 }}
                          size="small"
                        />
                        <Typography variant="body1" fontWeight="bold">
                          Subtotal: ${(item.quantity * item.product.price).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Box
            sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="h5">Total: ${getTotalPrice()}</Typography>
            <Box>
              <Button variant="outlined" color="error" onClick={clearCart} sx={{ mr: 2 }}>
                Clear Cart
              </Button>
              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to="/checkout"
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
};

export default CartPage;
