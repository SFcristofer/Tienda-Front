import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_STORE_BY_ID } from '../graphql/queries';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
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
  Chip,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const StoreDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_STORE_BY_ID, { variables: { id } });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    const productWithStore = { ...product, store: { id: store.id, name: store.name } };
    navigate('/checkout', { state: { product: productWithStore } });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{t('errorLoadingStore', { message: error.message })}</Alert>;

  const store = data?.getStoreById;

  if (!store) return <Alert severity="warning">{t('storeNotFound')}</Alert>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>{store.name}</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>{store.description}</Typography>
      <Typography variant="body2" color="text.secondary">{t('address')}: {`${store.street}, ${store.city}, ${store.state} ${store.zipCode}, ${store.country}`}</Typography>
      <Typography variant="body2" color="text.secondary">{t('phoneNumber')}: {store.phoneNumber}</Typography>
      <Typography variant="body2" color="text.secondary">{t('contactEmail')}: {store.contactEmail}</Typography>
      {store.storeCategories && store.storeCategories.length > 0 && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" component="span">{t('categories')}: </Typography>
          {store.storeCategories.map(cat => (
            <Chip key={cat.id} label={cat.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
          ))}
        </Box>
      )}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>{t('productsFrom', { storeName: store.name })}</Typography>

      {store.products.length === 0 ? (
        <Typography>{t('noProductsInStore')}</Typography>
      ) : (
        <Grid container spacing={4}>
          {store.products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={6} lg={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={product.imageUrl || `/images/product-placeholder.svg`}
                    alt={product.name}
                    sx={{ objectFit: 'contain', width: '100%' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                      {product.description}
                    </Typography>
                  </CardContent>
                </Link>
                <CardContent sx={{ p: 2, pt: 0 }}>
                  <Typography variant="h5" sx={{ mt: 'auto', fontWeight: 'bold', color: 'primary.main' }}>
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={(e) => { e.stopPropagation(); addToCart({ ...product, store: { id: store.id, name: store.name } }); }}
                      sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold' }}
                    >
                      {t('addToCart')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleBuyNow(product); }}
                      sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold' }}
                    >
                      {t('buyNow')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default StoreDetailPage;