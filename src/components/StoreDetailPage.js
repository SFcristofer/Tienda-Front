import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_STORE_BY_ID } from '../graphql/queries';
import { useCart } from '../context/CartContext';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const StoreDetailPage = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_STORE_BY_ID, { variables: { id } });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/cart');
  };

  if (loading) return <CircularProgress />;
  if (error) {
    if (error.message && error.message.includes('You must be logged in')) {
      return <Alert severity="info">This content requires you to be logged in to view.</Alert>;
    }
    return <Alert severity="error">Error loading store: {error.message}</Alert>;
  }

  const store = data?.getStoreById;

  if (!store) {
    return <Alert severity="warning">Store not found.</Alert>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>
        {store.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {store.description}
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Products from {store.name}
      </Typography>

      {store.products.length === 0 ? (
        <Typography>No products available in this store yet.</Typography>
      ) : (
        <Grid container spacing={4}>
          {store.products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to={`/products/${product.id}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={product.imageUrl || `https://via.placeholder.com/150?text=${product.name}`}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    ${product.price}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy Now
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default StoreDetailPage;
