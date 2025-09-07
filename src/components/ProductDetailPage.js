import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
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
  Chip,
} from '@mui/material';
import Slider from 'react-slick';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ProductReviewForm from './ProductReviewForm';

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, { variables: { id } });
  const product = data?.getProductById;

  const { data: relatedProductsData, loading: relatedProductsLoading, error: relatedProductsError } = useQuery(GET_ALL_PRODUCTS, {
    variables: { categoryId: product?.category?.id },
    skip: !product?.category?.id,
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    navigate('/checkout', { state: { product } });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{t('errorLoadingProduct', { message: error.message })}</Alert>;
  if (!product) return <Alert severity="warning">{t('productNotFound')}</Alert>;

  const relatedProducts = relatedProductsData?.getAllProducts?.filter((p) => p.id !== product.id) || [];

  const sliderSettings = {
    dots: false,
    infinite: relatedProducts.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box sx={{ height: 400, width: '100%', overflow: 'hidden' }}>
            <CardMedia component="img" image={product.imageUrl || '/images/product-placeholder.svg'} alt={product.name} sx={{ height: '100%', objectFit: 'cover', width: '100%' }} />
          </Box>
          <Typography variant="h3" gutterBottom sx={{ mt: 2 }}>{product.name}</Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {product.insignias && product.insignias.map((insignia, index) => (
              <Chip key={index} label={insignia} color="info" size="small" />
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={product.averageRating} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>({product.reviews.length} {t('reviews')})</Typography>
          </Box>
          <Typography variant="h4" color="primary" gutterBottom>${product.price.toFixed(2)}</Typography>
          <Typography variant="body1" paragraph>{product.description}</Typography>
          <Typography variant="body2" color="text.secondary">{t('store')}: {product.store.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('category')}: {product.category.name}</Typography>
          <Typography variant="h6" color={product.stock > 0 ? 'success.main' : 'error.main'}>
            {product.stock > 0 ? `${product.stock} ${t('available')}` : t('outOfStock')}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" color="secondary" startIcon={<AddShoppingCartIcon />} onClick={() => addToCart(product)} disabled={product.stock === 0} sx={{ mr: 1 }}>
              {product.stock > 0 ? t('addToCart') : t('outOfStock')}
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => handleBuyNow(product)} disabled={product.stock === 0}>{t('buyNow')}</Button>
          </Box>
        </Grid>

        
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>{t('reviews')}</Typography>
        <Divider sx={{ mb: 3 }} />
        {product.reviews.length > 0 ? (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {product.reviews.map((review) => (
              <ListItem key={review.id} alignItems="flex-start">
                <ListItemAvatar><Avatar>{review.user.name.charAt(0)}</Avatar></ListItemAvatar>
                <ListItemText primary={<Rating value={review.rating} readOnly size="small" />} secondary={<><Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">{review.user.name}</Typography>{` — ${review.comment}`}</>} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>{t('noReviewsYet')}</Typography>
        )}
        <ProductReviewForm productId={id} />
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>{t('relatedProducts')}</Typography>
        <Divider sx={{ mb: 3 }} />
        {relatedProductsLoading ? <CircularProgress /> : relatedProductsError ? <Alert severity="error">{t('errorLoadingRelated')}</Alert> : relatedProducts.length === 0 ? <Typography>{t('noRelatedProducts')}</Typography> : (
          <Slider {...sliderSettings}>
            {relatedProducts.map((p) => (
              <Box key={p.id} sx={{ p: 1 }}>
                <Card sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Link to={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Box sx={{ height: 160, overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        height="100%"
                        image={p.imageUrl || '/images/product-placeholder.svg'}
                        alt={p.name}
                        sx={{ objectFit: 'cover', width: '100%' }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {p.name}
                      </Typography>
                    </CardContent>
                  </Link>
                  <CardContent sx={{ p: 2, pt: 0 }}>
                    <Typography variant="h5" sx={{ mt: 'auto', fontWeight: 'bold', color: 'primary.main' }}>
                      ${p.price.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold' }}
                      >
                        {t('addToCart')}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleBuyNow(p); }}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold' }}
                      >
                        {t('buyNow')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
