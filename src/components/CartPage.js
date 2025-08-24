import React from 'react';
import { useCart } from '../context/CartContext';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Paper,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CartPage = () => {
  const { t } = useTranslation();
  const { getGroupedCartItemsByStore, removeFromCart, updateQuantity, loading, error } = useCart();

  const groupedCarts = getGroupedCartItemsByStore();

  const handleQuantityChange = (productId, e) => {
    const quantity = e.target.value;
    if (quantity > 0) {
      updateQuantity(productId, quantity);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) {
    if (error.message && error.message.includes('You must be logged in')) {
      return <Alert severity="info">{t('pleaseLoginToViewCart')}</Alert>;
    }
    return <Alert severity="error">{t('errorLoadingCart', { message: error.message })}</Alert>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('yourShoppingCart')}
      </Typography>

      {groupedCarts.length === 0 ? (
        <Typography>{t('cartEmpty')}</Typography>
      ) : (
        groupedCarts.map((cart) => (
          <Paper key={cart.store.id} elevation={3} sx={{ mb: 4, p: 3 }}>
            <Typography variant="h5" gutterBottom component={RouterLink} to={`/stores/${cart.store.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
              {cart.store.name}
            </Typography>
            <List>
              {cart.items.map((item) => (
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
                          {t('price')}: ${item.product.price.toFixed(2)}
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
                            {t('subtotal')}: ${(item.quantity * item.product.price).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{t('storeTotal')}: ${cart.totalAmount.toFixed(2)}</Typography>
              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to={`/checkout?storeId=${cart.store.id}`}
              >
                {t('proceedToCheckout')}
              </Button>
            </Box>
          </Paper>
        ))
      )}
    </Container>
  );
};

export default CartPage;