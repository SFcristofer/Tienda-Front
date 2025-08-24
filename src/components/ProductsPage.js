
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { GET_ALL_PRODUCTS, GET_ALL_CATEGORIES } from '../graphql/queries';
import { useCart } from '../context/CartContext';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button, Box, CircularProgress, Alert, Divider, Drawer, List, ListItem, ListItemText, Checkbox, FormGroup, FormControlLabel, TextField, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FilterListIcon from '@mui/icons-material/FilterList';

const ProductsPage = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { loading: loadingCategories, error: errorCategories, data: categoriesData } = useQuery(GET_ALL_CATEGORIES);
  const categories = categoriesData?.getAllCategories || [];

  const { loading, error, data } = useQuery(GET_ALL_PRODUCTS, {
    variables: {
      categoryId: selectedCategoryIds.length > 0 ? selectedCategoryIds : null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      search: searchQuery || null,
    },
    fetchPolicy: 'network-only',
  });

  const handleCategoryChange = (event) => {
    const { value } = event.target;
    setSelectedCategoryIds(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleClearFilters = () => {
    setSelectedCategoryIds([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const products = data?.getAllProducts || [];

  // Determine if any filters are active
  const areFiltersActive =
    selectedCategoryIds.length > 0 ||
    minPrice !== '' ||
    maxPrice !== '' ||
    searchQuery !== '';

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category?.name || t('uncategorized');
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  if (loading || loadingCategories) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 8 }} />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (errorCategories) return <Alert severity="error">{errorCategories.message}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button onClick={toggleDrawer(true)} variant="contained" startIcon={<FilterListIcon />} sx={{ mb: 3 }}>
        {t('filterProducts')}
      </Button>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250, p: 2 }}
          role="presentation"
        >
          <Typography variant="h6" gutterBottom>{t('filters')}</Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Category Filter */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-select-label">{t('category')}</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              multiple
              value={selectedCategoryIds}
              onChange={handleCategoryChange}
              renderValue={(selected) => selected.map(id => categories.find(cat => cat.id === id)?.name).join(', ')}
              label={t('category')}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Checkbox checked={selectedCategoryIds.indexOf(category.id) > -1} />
                  <ListItemText primary={category.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Price Range Filter */}
          <Typography gutterBottom sx={{ mt: 2 }}>{t('priceRange')}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label={t('minPrice')}
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              size="small"
              sx={{ width: '50%' }}
            />
            <TextField
              label={t('maxPrice')}
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              size="small"
              sx={{ width: '50%' }}
            />
          </Box>

          {/* Search Filter */}
          <TextField
            label={t('search')}
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            variant="outlined"
            fullWidth
            onClick={handleClearFilters}
          >
            {t('clearFilters')}
          </Button>
        </Box>
      </Drawer>

      <Typography variant="h2" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        {t('allProducts')}
      </Typography>

      {areFiltersActive ? (
        // Display filtered products as a flat list
        products.length > 0 ? (
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl || '/images/product-placeholder.svg'}
                    alt={product.name}
                    sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component={RouterLink} 
                      to={`/products/${product.id}`} 
                      sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
                    >
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('store')}: {product.store.name}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 'auto', fontWeight: 'bold', color: 'primary.main' }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<AddShoppingCartIcon />} 
                      onClick={() => addToCart(product)}
                      sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold' }}
                    >
                      {t('addToCart')}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ p: 3, textAlign: 'center' }}>{t('noProductsFound')}</Typography>
        )
      ) : (
        // Display grouped products when no filters are active
        Object.keys(groupedProducts).length > 0 ? (
          Object.entries(groupedProducts).map(([categoryName, productsInCategory]) => (
            <Box key={categoryName} sx={{ mb: 6 }}>
              <React.Fragment>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  {categoryName}
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </React.Fragment>
              <Grid container spacing={4}>
                {productsInCategory.map((product) => (
                  <Grid item key={product.id} xs={12} sm={6} md={4}>
                    <Card sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      }
                    }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.imageUrl || '/images/product-placeholder.svg'}
                        alt={product.name}
                        sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography 
                          gutterBottom 
                          variant="h6" 
                          component={RouterLink} 
                          to={`/products/${product.id}`} 
                          sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
                        >
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t('store')}: {product.store.name}
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 'auto', fontWeight: 'bold', color: 'primary.main' }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button 
                          fullWidth 
                          variant="contained" 
                          startIcon={<AddShoppingCartIcon />} 
                          onClick={() => addToCart(product)}
                          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold' }}
                        >
                          {t('addToCart')}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        ) : (
          <Typography sx={{ p: 3, textAlign: 'center' }}>{t('noProductsFound')}</Typography>
        )
      )}
    </Container>
  );
};

export default ProductsPage;
