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
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext'; // Importar hook
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  const { t } = useTranslation();
  const { region, countriesLoading } = useRegion(); // Usar hook

  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_ALL_PRODUCTS, {
    skip: countriesLoading || !region, // Skip si no hay país
    variables: { country: region }, // Pasar país
  });
  const { data: storesData, loading: storesLoading, error: storesError } = useQuery(GET_ALL_STORES, {
    skip: countriesLoading || !region, // Skip si no hay país
    variables: { country: region, sortBy: 'CREATED_AT', sortOrder: 'DESC' }, // Pasar país
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price, currencyCode) => {
    let locale = undefined;
    if (currencyCode === 'MXN') {
      locale = 'es-MX';
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(price);
  };

  const handleBuyNow = (product) => {
    navigate('/checkout', { state: { product } });
  };

  if (countriesLoading || productsLoading || storesLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="secondary" /></Box>;
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

  const featuredProducts = products.filter(p => p.esDestacado);
  const featuredStores = stores.filter(s => s.esDestacado);

  const otherProducts = products.filter(p => !p.esDestacado);
  const featuredStoreIds = new Set(featuredStores.map(s => s.id));
  const otherStores = stores.filter(s => !featuredStoreIds.has(s.id));

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
                    <CardMedia component="img" height="140" image={store.imageUrl || '/images/store-placeholder.svg'} alt={store.name} sx={{ objectFit: 'contain', width: '100%' }} />
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
                  <Card sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <RouterLink to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <CardMedia component="img" height="160" image={product.imageUrl || '/images/product-placeholder.svg'} alt={product.name} sx={{ objectFit: 'contain', width: '100%' }} />
                      <CardContent>
                        <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {product.insignias && product.insignias.map((insignia, index) => (
                            <Chip key={index} label={insignia} color="info" size="small" />
                          ))}
                        </Box>
                        <Typography gutterBottom variant="h6" component="div">{product.name}</Typography>
                      </CardContent>
                    </RouterLink>
                    <CardContent> {/* This CardContent will contain price and buttons */}
                      <Typography variant="body1" color="text.secondary">{formatPrice(product.price, product.country.currencyCode)}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button variant="contained" size="small" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>{t('addToCart')}</Button>
                        <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); handleBuyNow(product); }}>{t('buyNow')}</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Slider>
          </Box>
        )}

        {otherStores.length > 0 && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>{t('productsByStore')}</Typography>
            {otherStores.map((store) => {
              const storeProducts = otherProducts.filter((p) => p.store?.id === store.id).slice(0, 4);
              if (storeProducts.length === 0) return null;
              return (
                <Box key={store.id} sx={{ mb: 6 }}>
                  <Typography variant="h5" gutterBottom component={RouterLink} to={`/stores/${store.id}`} sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}>{store.name}</Typography>
                  <Slider {...{...sliderSettings, infinite: false}}>
                    {storeProducts.map((product) => (
                      <Box key={product.id} sx={{ p: 1 }}>
                        <Card sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <RouterLink to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <CardMedia component="img" height="160" image={product.imageUrl || '/images/product-placeholder.svg'} alt={product.name} sx={{ objectFit: 'contain', width: '100%' }} />
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography gutterBottom variant="h6" component="div">{product.name}</Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>{product.description}</Typography>
                            </CardContent>
                          </RouterLink>
                          <CardContent> {/* This CardContent will contain price and buttons */}
                            <Typography variant="h6" sx={{ mt: 1 }}>{formatPrice(product.price, product.country.currencyCode)}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button variant="contained" size="small" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>{t('addToCart')}</Button>
                              <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); handleBuyNow(product); }}>{t('buyNow')}</Button>
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