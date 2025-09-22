import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Button, Typography, Box, 
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useCart } from '../context/CartContext';

const SnackbarAlert = React.forwardRef(function SnackbarAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    getAllProducts {
      id
      name
      description
      price
      imageUrl
      store {
        name
      }
      category {
        name
      }
    }
  }
`;

export const ProductList = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { addToCart } = useCart();

  const { loading, error, data } = useQuery(GET_ALL_PRODUCTS);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1); // Add 1 quantity by default
      setSnackbarMessage(`${product.name} añadido al carrito.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage(`Error al añadir ${product.name} al carrito.`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Error adding to cart:', err);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>Error al cargar productos: {error.message}</Alert>;

  return (
    <Box sx={{ my: 4 }}>
      <Container>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Nuestros Productos
        </Typography>
        <Grid container spacing={4}>
          {data.getAllProducts.map(product => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  overflow: 'hidden', // Safeguard against content stretching
                  maxWidth: 200, // Set max width as requested
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  }
              }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={product.imageUrl || 'https://via.placeholder.com/300x200'}
                  alt={product.name}
                  sx={{ 
                    borderTopLeftRadius: '16px', 
                    borderTopRightRadius: '16px', 
                    objectFit: 'contain', 
                    width: '100%' 
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vendido por: {product.store.name}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Button size="small" variant="contained" onClick={() => handleAddToCart(product)}>Añadir</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <SnackbarAlert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </SnackbarAlert>
      </Snackbar>
    </Box>
  );
};
