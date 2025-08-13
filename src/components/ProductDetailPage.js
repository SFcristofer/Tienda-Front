import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { GET_PRODUCT_BY_ID, GET_ALL_PRODUCTS } from '../graphql/queries';
import { useCart } from '../context/CartContext';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Button,
  CardMedia,
  Grid,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

import ProductReviewForm from './ProductReviewForm';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, { variables: { id } });
  const product = data?.getProductById;

  const {
    data: relatedProductsData,
    loading: relatedProductsLoading,
    error: relatedProductsError,
  } = useQuery(GET_ALL_PRODUCTS, {
    variables: {
      categoryId: product?.category?.id, // Fetch products from the same category
    },
    skip: !product?.category?.id, // Skip if product or category ID is not available
  });

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
    return <Alert severity="error">Error loading product: {error.message}</Alert>;
  }

  // If product data is null after loading, display a message
  if (!product) {
    return <Alert severity="warning">Product not found.</Alert>;
  }

  const relatedProducts =
    relatedProductsData?.getAllProducts?.filter((p) => p.id !== product.id) || [];

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
    ],
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Main Product Details Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={12}>
              <CardMedia
                component="img"
                image={product.imageUrl || '/images/product-placeholder.svg'}
                alt={product.name}
                sx={{ maxHeight: 400, objectFit: 'contain' }}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Typography variant="h3" gutterBottom>
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={product.averageRating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({product.reviews.length} reviews)
                </Typography>
              </Box>
              <Typography variant="h4" color="primary" gutterBottom>
                ${product.price.toFixed(2)}
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Store: {product.store.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Category: {product.category.name}
              </Typography>
              <Typography variant="h6" color={product.stock > 0 ? 'success.main' : 'error.main'}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  sx={{ mr: 1 }}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleBuyNow(product)}
                  disabled={product.stock === 0}
                >
                  Buy Now
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Related Products Column */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mt: { xs: 6, md: 0 } }}>
            {' '}
            {/* Adjust margin top for smaller screens */}
            <Typography variant="h5" gutterBottom>
              Related Products
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {relatedProductsLoading ? (
              <CircularProgress />
            ) : relatedProductsError ? (
              <Alert severity="error">
                Error loading related products: {relatedProductsError.message}
              </Alert>
            ) : relatedProducts.length === 0 ? (
              <Typography>No related products found.</Typography>
            ) : (
              <Slider {...sliderSettings}>
                {relatedProducts.map((p) => (
                  <Box key={p.id} sx={{ p: 1 }}>
                    {' '}
                    {/* Add padding for slider items */}
                    <Card
                      component={Link}
                      to={`/products/${p.id}`}
                      elevation={2}
                      sx={{
                        textDecoration: 'none',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={p.imageUrl || '/images/product-placeholder.svg'}
                        alt={p.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div">
                          <Link
                            to={`/products/${p.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {p.name}
                          </Link>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {p.description}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          ${p.price}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button variant="contained" size="small" onClick={() => addToCart(p)}>
                            Add to Cart
                          </Button>
                          <Button variant="outlined" size="small" onClick={() => handleBuyNow(p)}>
                            Buy Now
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Slider>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section (below both columns) */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {product.reviews.length > 0 ? (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {product.reviews.map((review) => (
              <ListItem key={review.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{review.user.name.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Rating value={review.rating} readOnly size="small" />}
                  secondary={
                    <>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {review.user.name}
                      </Typography>
                      {` — ${review.comment}`}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No reviews yet. Be the first to review!</Typography>
        )}
        <ProductReviewForm productId={id} />
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
