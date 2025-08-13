import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Drawer, // Importamos Drawer
  IconButton, // Importamos IconButton
  List, // Importamos List
  ListItem, // Importamos ListItem
  ListItemText, // Importamos ListItemText
  Divider, // Importamos Divider
  ListItemAvatar, // Importamos ListItemAvatar
  Avatar, // Importamos Avatar
  Accordion, // Importamos Accordion
  AccordionSummary, // Importamos AccordionSummary
  AccordionDetails, // Importamos AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Importamos ExpandMoreIcon
import MenuIcon from '@mui/icons-material/Menu'; // Importamos MenuIcon
import { GET_ALL_PRODUCTS, GET_ALL_CATEGORIES, GET_ALL_STORES } from '../graphql/queries';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useCart } from '../context/CartContext';

const StoresPage = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/cart');
  };

  const [categoryId, setCategoryId] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [storeId, setStoreId] = useState(''); // Nuevo estado para el filtro de tienda

  const handleClearFilters = () => {
    setCategoryId('');
    setPriceRange([0, 1000]);
    setSearchTerm('');
    setSortBy('name');
    setSortOrder('ASC');
    setStoreId('');
  };

  // Debugging: Log filter state changes
  console.log('Filter State:', {
    categoryId,
    priceRange,
    searchTerm,
    sortBy,
    sortOrder,
    storeId,
  });

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_ALL_PRODUCTS, {
    variables: {
      categoryId: categoryId || undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      search: searchTerm || undefined,
      sortBy,
      sortOrder,
      storeId: storeId || undefined, // Añadimos el filtro por storeId
    },
  });

  // Debugging: Log products data received
  console.log('Products Data from Query:', productsData);

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_ALL_CATEGORIES);
  const { data: storesData, loading: storesLoading, error: storesError } = useQuery(GET_ALL_STORES); // Nueva consulta para tiendas

  if (productsLoading || categoriesLoading || storesLoading) return <CircularProgress />;
  if (productsError) {
    if (productsError.message && productsError.message.includes('You must be logged in')) {
      return <Alert severity="info">Some products require you to be logged in to view.</Alert>;
    }
    return <Alert severity="error">Error loading products: {productsError.message}</Alert>;
  }
  if (categoriesError) {
    if (categoriesError.message && categoriesError.message.includes('You must be logged in')) {
      return <Alert severity="info">Some categories require you to be logged in to view.</Alert>;
    }
    return <Alert severity="error">Error loading categories: {categoriesError.message}</Alert>;
  }
  if (storesError) {
    // Manejo de errores para la consulta de tiendas
    if (storesError.message && storesError.message.includes('You must be logged in')) {
      return <Alert severity="info">Some stores require you to be logged in to view.</Alert>;
    }
    return <Alert severity="error">Error loading stores: {storesError.message}</Alert>;
  }

  const products = productsData?.getAllProducts || [];
  console.log('Filtered Products for Display:', products);
  const categories = categoriesData?.getAllCategories || [];
  const allStores = storesData?.getAllStores || []; // Obtenemos todas las tiendas

  // Filtramos las tiendas basándonos en los productos actualmente mostrados
  const relevantStoreIds = new Set(products.map((product) => product.store.id));
  const stores = allStores.filter((store) => relevantStoreIds.has(store.id));

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  return (
    <Container sx={{ mt: 4 }} maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Explore Products
        </Typography>
      </Box>

      {products.length === 0 ? (
        <Typography>No products found matching your criteria.</Typography>
      ) : (
        <List>
          {products.map((product) => (
            <React.Fragment key={product.id}>
              <ListItem
                component={RouterLink}
                to={`/products/${product.id}`}
                alignItems="flex-start"
                sx={{
                  mb: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  p: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={product.imageUrl || '/images/product-placeholder.svg'}
                    alt={product.name}
                    sx={{ width: 100, height: 100, mr: 2 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div">
                      <RouterLink
                        to={`/products/${product.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {product.name}
                      </RouterLink>
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {product.description}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Store: {product.store.name}
                      </Typography>
                    </>
                  }
                />
                <Box
                  sx={{
                    ml: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy Now
                  </Button>
                </Box>
              </ListItem>
              <Divider component="li" sx={{ my: 2 }} />
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
  );
};

export default StoresPage;
