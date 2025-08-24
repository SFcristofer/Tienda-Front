import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS, GET_ALL_STORES } from '../graphql/queries';
import { useTranslation } from 'react-i18next';
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
  Chip,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { useCart } from '../context/CartContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  const { t } = useTranslation();
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_ALL_PRODUCTS);
  const { data: storesData, loading: storesLoading, error: storesError } = useQuery(GET_ALL_STORES, {
    variables: { sortBy: 'createdAt', sortOrder: 'DESC' },
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/cart');
  };

  if (productsLoading || storesLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="secondary" /></Box>;
  if (productsError) return <Alert severity="error">{t('errorLoadingProducts', { message: productsError.message })}</Alert>;
  if (storesError) return <Alert severity="error">{t('errorLoadingStores', { message: storesError.message })}</Alert>;

  const products = productsData?.getAllProducts || [];
  const stores = storesData?.getAllStores || [];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const featuredProducts = products.slice(0, 5);
  const featuredStores = stores.slice(0, 5);

  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight="700" gutterBottom>{t('welcomeToUniShopp')}</Typography>
          <Typography variant="h5" color="primary.contrastText" paragraph sx={{ opacity: 0.9 }}>{t('heroSlogan')}</Typography>
          <Button variant="contained" color="secondary" size="large" component={RouterLink} to="/stores">{t('exploreStores')}</Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {featuredStores.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>{t('featuredStores')}</Typography>
            <Slider {...{...sliderSettings, infinite: false}}>
              {featuredStores.map((store) => (
                <Box key={store.id} sx={{ p: 1 }}>
                  <Card component={RouterLink} to={`/stores/${store.id}`} sx={{ textDecoration: 'none', height: '100%', position: 'relative' }}>
                    <CardMedia component="img" height="140" image={store.imageUrl || '/images/store-placeholder.svg'} alt={store.name} />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">{store.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{store.description}</Typography>
                    </CardContent>
                    {store.averageRating > 4.0 && <Chip label={t('featured')} color="secondary" size="small" sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 'bold' }} />}
                  </Card>
                </Box>
              ))}
            </Slider>
          </Box>
        )}

        {featuredProducts.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>{t('featuredProducts')}</Typography>
            <Slider {...{...sliderSettings, infinite: false}}>
              {featuredProducts.map((product) => (
                <Box key={product.id} sx={{ p: 1 }}>
                  <Card component={RouterLink} to={`/products/${product.id}`} sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia component="img" height="160" image={product.imageUrl || '/images/product-placeholder.svg'} alt={product.name} />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">{product.name}</Typography>
                      <Typography variant="body1" color="text.secondary">${product.price}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button variant="contained" size="small" onClick={() => addToCart(product)}>{t('addToCart')}</Button>
                        <Button variant="outlined" size="small" onClick={() => handleBuyNow(product)}>{t('buyNow')}</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Slider>
          </Box>
        )}

        {stores.length > 0 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>{t('productsByStore')}</Typography>
            {stores.map((store) => {
              const storeProducts = products.filter((p) => p.store?.id === store.id).slice(0, 4);
              if (storeProducts.length === 0) return null;
              return (
                <Box key={store.id} sx={{ mb: 6 }}>
                  <Typography variant="h5" gutterBottom component={RouterLink} to={`/stores/${store.id}`} sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}>{store.name}</Typography>
                  <Slider {...{...sliderSettings, infinite: false}}>
                    {storeProducts.map((product) => (
                      <Box key={product.id} sx={{ p: 1 }}>
                        <Card component={RouterLink} to={`/products/${product.id}`} sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardMedia component="img" height="160" image={product.imageUrl || '/images/product-placeholder.svg'} alt={product.name} />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h6" component="div">{product.name}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>{product.description}</Typography>
                            <Typography variant="h6" sx={{ mt: 1 }}>${product.price.toFixed(2)}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button variant="contained" size="small" onClick={() => addToCart(product)}>{t('addToCart')}</Button>
                              <Button variant="outlined" size="small" onClick={() => handleBuyNow(product)}>{t('buyNow')}</Button>
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