import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS, GET_ALL_STORES } from '../graphql/queries';
// You might need to add a new query for GET_ALL_STORES with sorting if the existing one doesn't support it
// For now, assuming GET_ALL_STORES can take sortBy and sortOrder
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip, // Added Chip import
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { useCart } from '../context/CartContext';

// Importa los estilos de react-slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_ALL_PRODUCTS);
  const {
    data: storesData,
    loading: storesLoading,
    error: storesError,
  } = useQuery(GET_ALL_STORES, {
    variables: {
      sortBy: 'averageRating', // Sort by averageRating
      sortOrder: 'DESC', // Descending order
    },
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/cart');
  };

  if (productsLoading || storesLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  if (productsError) {
    if (productsError.message && productsError.message.includes('You must be logged in')) {
      return <Alert severity="info">Some content requires you to be logged in.</Alert>;
    }
    return <Alert severity="error">Error fetching products: {productsError.message}</Alert>;
  }
  if (storesError) {
    if (storesError.message && storesError.message.includes('You must be logged in')) {
      return <Alert severity="info">Some content requires you to be logged in.</Alert>;
    }
    return <Alert severity="error">Error fetching stores: {storesError.message}</Alert>;
  }

  const products = productsData?.getAllProducts || [];
  const stores = storesData?.getAllStores || [];

  console.log('Products data:', productsData);
  console.log('Stores data:', storesData);
  console.log('Processed products:', products);
  console.log('Processed stores:', stores);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  const productSliderSettings = {
    ...sliderSettings,
    infinite: false, // Disable infinite loop for product sliders
  };

  const featuredProducts = products.slice(0, 5);
  const featuredStores = stores.slice(0, 5);

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight="700" gutterBottom>
            Welcome to LaPlaza
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Everything you need, from your favorite local stores right to your door.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/stores"
          >
            Explore Stores
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Featured Stores Carousel */}
        {featuredStores.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              Featured Stores
            </Typography>
            <Slider {...sliderSettings}>
              {featuredStores.map((store) => (
                <Box key={store.id} sx={{ p: 1 }}>
                  <Card
                    component={RouterLink}
                    to={`/stores/${store.id}`}
                    sx={{ textDecoration: 'none', height: '100%', position: 'relative' }} // Added position: 'relative'
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={store.imageUrl || '/images/store-placeholder.svg'}
                      alt={store.name}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {store.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {store.description}
                      </Typography>
                      {console.log(`Store: ${store.name}, Average Rating: ${store.averageRating}`)} {/* Debug log */}
                    </CardContent>
                    {/* "Hot" Badge for top-rated stores */}
                    {store.averageRating > 4.0 && ( // Example threshold: stores with rating > 4.0
                      <Chip
                        label="Destacado" // Or "Hot"
                        color="secondary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                  </Card>
                </Box>
              ))}
            </Slider>
          </Box>
        )}

        {/* Featured Products Carousel */}
        {featuredProducts.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              Featured Products
            </Typography>
            <Slider {...productSliderSettings}>
              {featuredProducts.map((product) => (
                <Box key={product.id} sx={{ p: 1 }}>
                  <Card
                    component={RouterLink}
                    to={`/products/${product.id}`}
                    sx={{
                      textDecoration: 'none',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={product.imageUrl || '/images/product-placeholder.svg'}
                      alt={product.name}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {product.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        ${product.price}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button variant="contained" size="small" onClick={() => addToCart(product)}>
                          Add to Cart
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleBuyNow(product)}
                        >
                          Buy Now
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Slider>
          </Box>
        )}

        {/* Products by Store */}
        {stores.length > 0 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              Products by Store
            </Typography>
            {stores.map((store) => {
              const storeProducts = products
                .filter((product) => product.store && product.store.id === store.id)
                .slice(0, 4); // Get up to 4 products per store
              if (storeProducts.length === 0) return null; // Don't show store if no products

              return (
                <Box key={store.id} sx={{ mb: 6 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    component={RouterLink}
                    to={`/stores/${store.id}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {store.name}
                  </Typography>
                  <Slider {...productSliderSettings}>
                    {storeProducts.map((product) => (
                      <Box key={product.id} sx={{ p: 1 }}>
                        <Card
                          component={RouterLink}
                          to={`/products/${product.id}`}
                          sx={{
                            textDecoration: 'none',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="160"
                            image={product.imageUrl || '/images/product-placeholder.svg'}
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
                              ${product.price.toFixed(2)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => addToCart(product)}
                              >
                                Add to Cart
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleBuyNow(product)}
                              >
                                Buy Now
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Slider>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;
