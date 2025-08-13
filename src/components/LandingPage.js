import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { GET_ALL_PRODUCTS, GET_ALL_CATEGORIES } from '../graphql/queries';

const LandingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_ALL_PRODUCTS);
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_ALL_CATEGORIES);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/cart');
  };

  if (productsLoading || categoriesLoading) return <CircularProgress />;
  if (productsError)
    return <Alert severity="error">Error loading products: {productsError.message}</Alert>;
  if (categoriesError)
    return <Alert severity="error">Error loading categories: {categoriesError.message}</Alert>;

  const products = productsData?.getAllProducts || [];
  const categories = categoriesData?.getAllCategories || [];

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category && product.category.id === selectedCategory)
    : products;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        Welcome to LocalMarket!
      </Typography>
      <Typography variant="h5" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
        Discover products from local stores near you.
      </Typography>

      <FormControl sx={{ minWidth: 200, mb: 4 }}>
        <InputLabel id="category-select-label">Filter by Category</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={selectedCategory}
          label="Filter by Category"
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={4}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Card
                component={Link}
                to={`/products/${product.id}`}
                sx={{
                  textDecoration: 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography color="text.secondary">${product.price}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {product.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 2, display: 'block' }}
                  >
                    Sold by: {product.store.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Category: {product.category?.name}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2, ml: 1 }}
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No products available yet. Stores are getting ready!</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default LandingPage;
