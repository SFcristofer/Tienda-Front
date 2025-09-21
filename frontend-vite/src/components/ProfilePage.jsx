import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery, gql, useMutation, useLazyQuery } from '@apollo/client';
import AuthContext from '../context/AuthContext.jsx';
import {
  Container, Paper, Grid, Tabs, Tab, Box, Typography, TextField,
  Button, Avatar, List, ListItem, ListItemText, Divider, IconButton,
  useMediaQuery, useTheme, Card, CardContent, CardActions, InputAdornment, CircularProgress, Alert, Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import HomeIcon from '@mui/icons-material/Home';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WebIcon from '@mui/icons-material/Web';
import AnalyticsIcon from '@mui/icons-material/Analytics';

import StorefrontIcon from '@mui/icons-material/Storefront';

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      avatarUrl
      phoneNumber
      isVerified
      status
      stores {
        id
        name
        description
        imageUrl
        products {
          id
          name
          price
          imageUrl
        }
      }
    }
  }
`;

const CUSTOMER_ORDERS_QUERY = gql`
  query CustomerOrders {
    customerOrders {
      id
      totalAmount
      status
      deliveryAddress
      createdAt
      customer {
        id
        name
        email
      }
      store {
        id
        name
        owner {
          id
          name
          email
        }
      }
      items {
        id
        quantity
        priceAtOrder
        product {
          id
          name
          imageUrl
        }
      }
    }
  }
`;

const MY_ADDRESSES_QUERY = gql`
  query MyAddresses {
    me {
      id
      addresses {
        id
        street
        city
        state
        zipCode
        country
        phoneNumber
        isDefault
        latitude
        longitude
      }
    }
  }
`;

const CREATE_ADDRESS_MUTATION = gql`
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      id
      street
      city
      state
      zipCode
      country
      phoneNumber
    }
  }
`;

const GEOCODE_ADDRESS_MUTATION = gql`
  mutation GeocodeAddress($addressId: ID!, $addressString: String!) {
    geocodeAddress(addressId: $addressId, addressString: $addressString) {
      id
      latitude
      longitude
    }
  }
`;

const UPDATE_ADDRESS_MUTATION = gql`
  mutation UpdateAddress($input: UpdateAddressInput!) {
    updateAddress(input: $input) {
      id
    }
  }
`;

const DELETE_ADDRESS_MUTATION = gql`
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id)
  }
`;

const SELLER_ORDERS_QUERY = gql`
  query SellerOrders($storeId: ID) {
    sellerOrders(storeId: $storeId) {
      id
      status
      totalAmount
      createdAt
      store {
        id
        name
      }
      customer {
        name
        email
      }
      items {
        quantity
        priceAtOrder
        product {
          name
          imageUrl
        }
      }
    }
  }
`;

const GET_ADDRESS_SUGGESTIONS = gql`
  query GetAddressSuggestions($input: String!) {
    getAddressSuggestions(input: $input) {
      description
      placeId
    }
  }
`;

const GET_PLACE_DETAILS = gql`
  query GetPlaceDetails($placeId: String!) {
    getPlaceDetails(placeId: $placeId) {
      description
      street
      city
      state
      zipCode
      country
      latitude
      longitude
    }
  }
`;

// Seller Analytics Queries
const SELLER_DASHBOARD_STATS_QUERY = gql`
  query SellerGetDashboardStats($storeId: ID) {
    sellerGetDashboardStats(storeId: $storeId) {
      totalUsers
      totalStores
      totalProducts
      totalOrders
      totalSalesVolume
    }
  }
`;

const SELLER_SALES_DATA_QUERY = gql`
  query SellerGetSalesData($period: String!, $startDate: String, $endDate: String, $storeId: ID) {
    sellerGetSalesData(period: $period, startDate: $startDate, endDate: $endDate, storeId: $storeId) {
      date
      totalSales
    }
  }
`;

const SELLER_TOP_SELLING_PRODUCTS_QUERY = gql`
  query SellerGetTopSellingProducts($limit: Int, $startDate: String, $endDate: String, $storeId: ID) {
    sellerGetTopSellingProducts(limit: $limit, startDate: $startDate, endDate: $endDate, storeId: $storeId) {
      productId
      productName
      totalQuantitySold
      totalRevenue
    }
  }
`;

const SELLER_TOP_PERFORMING_STORES_QUERY = gql`
  query SellerGetTopPerformingStores($limit: Int, $startDate: String, $endDate: String, $storeId: ID) {
    sellerGetTopPerformingStores(limit: $limit, startDate: $startDate, endDate: $endDate, storeId: $storeId) {
      storeId
      storeName
      totalRevenue
      totalOrders
    }
  }
`;

const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

// --- Panel Components (DEFINICIONES COMPLETAS) ---

const PersonalInfoPanel = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '' });

  React.useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '', phoneNumber: user.phoneNumber || '' });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    console.log('Saving data:', formData);
    // TODO: Implement actual mutation to update user data
    setEditMode(false);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 80, height: 80, mr: { sm: 2 }, mb: { xs: 2, sm: 0 } }}>{user?.name?.charAt(0)}</Avatar>
        <Typography variant="h5">Hola, {user?.name}</Typography>
      </Box>
      <TextField fullWidth label="Nombre" name="name" value={formData.name} onChange={handleInputChange} disabled={!editMode} margin="normal" />
      <TextField fullWidth label="Correo Electrónico" name="email" value={formData.email} disabled margin="normal" />
      <TextField fullWidth label="Número de Teléfono" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} disabled={!editMode} margin="normal" />
      {editMode ? (
        <Button variant="contained" onClick={handleSaveChanges} sx={{ mt: 2 }}>Guardar Cambios</Button>
      ) : (
        <Button variant="outlined" onClick={() => setEditMode(true)} sx={{ mt: 2 }}>Editar Perfil</Button>
      )}
    </>
  );
};

const OrdersPanel = () => {
  const { data, loading, error } = useQuery(CUSTOMER_ORDERS_QUERY, {
    fetchPolicy: 'network-only', // Always fetch fresh data
  });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error al cargar pedidos: {error.message}</Alert>;

  const orders = data?.customerOrders || [];

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'payment_pending': return 'warning';
      case 'payment_confirmed': return 'info';
      case 'delivery_agreed': return 'secondary';
      case 'delivered_payment_received': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <Typography variant="h6">Historial de Pedidos</Typography>
      {orders.length === 0 ? (
        <Typography>Aún no has realizado ningún pedido.</Typography>
      ) : (
        <List>
          {orders.map((order) => (
            <Paper key={order.id} sx={{ mb: 2, p: 3, boxShadow: 3, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>Pedido ID: {order.id}</Typography>
                  <Typography variant="body2">Tienda: {order.store.name}</Typography>
                  <Typography variant="body2">Fecha: {new Date(order.createdAt).toLocaleString()}</Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>Total: ${order.totalAmount.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                  <Chip label={order.status} color={getStatusChipColor(order.status)} sx={{ mb: 1, fontWeight: 'bold' }} />
                  <Typography variant="body2">{order.items.length} artículos</Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Artículos:</Typography>
                <List dense>
                  {order.items.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText primary={`${item.product.name} x ${item.quantity}`} secondary={`${item.priceAtOrder.toFixed(2)} cada uno`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          ))}
        </List>
      )}
    </>
  );
};

const AddressAutocomplete = ({ onPlaceSelected }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [getSuggestions, { loading, error, data }] = useLazyQuery(GET_ADDRESS_SUGGESTIONS);
  const [getDetails, { loading: detailsLoading, error: detailsError }] = useLazyQuery(GET_PLACE_DETAILS);

  useEffect(() => {
    if (data?.getAddressSuggestions) {
      setSuggestions(data.getAddressSuggestions);
    }
  }, [data]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value.length > 2) { // Fetch suggestions only after a few characters
      getSuggestions({ variables: { input: value } });
    }
  };

  const handleSuggestionClick = async (placeId) => {
    setInput('');
    setSuggestions([]);
    try {
      const { data: detailsData } = await getDetails({ variables: { placeId } });
      if (detailsData?.getPlaceDetails) {
        onPlaceSelected(detailsData.getPlaceDetails);
      }
    } catch (e) {
      console.error("Error fetching place details", e);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        label="Buscar Dirección"
        value={input}
        onChange={handleInputChange}
        margin="normal"
        autoComplete="off"
        InputProps={{
          endAdornment: loading && <CircularProgress size={20} />
        }}
      />
      {suggestions.length > 0 && (
        <Paper sx={{ position: 'absolute', zIndex: 1, width: '100%', mt: 1 }}>
          <List>
            {suggestions.map(suggestion => (
              <ListItem key={suggestion.placeId} onClick={() => handleSuggestionClick(suggestion.placeId)}>
                <ListItemText primary={suggestion.description} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      {error && <Alert severity="error">{error.message}</Alert>}
      {detailsError && <Alert severity="error">{detailsError.message}</Alert>}
    </Box>
  );
};

const AddressesPanel = () => {
  const { data, loading, error, refetch } = useQuery(MY_ADDRESSES_QUERY);
  const [createAddress] = useMutation(CREATE_ADDRESS_MUTATION);
  const [deleteAddress] = useMutation(DELETE_ADDRESS_MUTATION);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', zipCode: '', country: '', phoneNumber: '',
    latitude: null, longitude: null, isDefault: false, description: ''
  });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error al cargar direcciones: {error.message}</Alert>;

  const addresses = data?.me?.addresses || [];

  const handlePhoneNumberChange = (e) => {
    setNewAddress(prev => ({ ...prev, phoneNumber: e.target.value }));
  };

  const handlePlaceSelected = (placeDetails) => {
    setNewAddress({
      ...newAddress,
      description: placeDetails.description,
      street: placeDetails.street,
      city: placeDetails.city,
      state: placeDetails.state,
      zipCode: placeDetails.zipCode,
      country: placeDetails.country,
      latitude: placeDetails.latitude,
      longitude: placeDetails.longitude,
    });
  };

  const handleAddAddress = async () => {
    try {
      const { description, ...input } = newAddress;
      await createAddress({ variables: { input } });
      refetch();
      setShowAddForm(false);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '', phoneNumber: '', latitude: null, longitude: null, isDefault: false, description: '' });
    } catch (err) {
      console.error('Error adding address:', err);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress({ variables: { id } });
      refetch();
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  return (
    <>
      <Typography variant="h6">Mis Direcciones</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Gestiona tus direcciones de envío.</Typography>
      <List>
        {addresses.map(address => (
          <Paper key={address.id} sx={{ mb: 2, p: 2, boxShadow: 1, borderRadius: 1 }}>
            <ListItem secondaryAction={<IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAddress(address.id)}><DeleteIcon /></IconButton>}>
              <ListItemText primary={`${address.street}, ${address.city}`} secondary={`${address.state}, ${address.zipCode}, ${address.country}`} />
            </ListItem>
          </Paper>
        ))}
      </List>
      {!showAddForm ? (
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => setShowAddForm(true)}>Añadir Nueva Dirección</Button>
      ) : (
        <Box sx={{ mt: 3, p: 3, border: '1px solid #ccc', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom>Nueva Dirección</Typography>
          <AddressAutocomplete onPlaceSelected={handlePlaceSelected} />
          {newAddress.description && (
            <Box my={2}>
              <Typography variant="subtitle1">Dirección Seleccionada:</Typography>
              <Typography>{newAddress.description}</Typography>
              <Typography variant="caption">Lat: {newAddress.latitude || 'N/A'}, Lon: {newAddress.longitude || 'N/A'}</Typography>
            </Box>
          )}
          <TextField fullWidth label="Número de Teléfono (Opcional)" name="phoneNumber" value={newAddress.phoneNumber} onChange={handlePhoneNumberChange} margin="normal" />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleAddAddress} disabled={!newAddress.latitude}>Guardar Dirección</Button>
            <Button variant="outlined" onClick={() => setShowAddForm(false)}>Cancelar</Button>
          </Box>
        </Box>
      )}
    </>
  );
};

const SiteEditForm = ({ site, onCancel }) => {
  const [name, setName] = useState(site.name);
  const [slug, setSlug] = useState(site.slug);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(true);

  const handleSlugChange = (e) => {
    const newSlug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setSlug(newSlug);
    setIsCheckingSlug(true);
    setTimeout(() => {
      setSlugAvailable(newSlug !== 'sitio-ocupado');
      setIsCheckingSlug(false);
    }, 500);
  };

  const handleSave = () => {
    console.log('Saving:', { ...site, name, slug });
    onCancel();
  };

  return (
    <CardContent>
      <TextField fullWidth label="Nombre del Sitio" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
      <TextField
        fullWidth
        label="URL del Sitio Web"
        value={slug}
        onChange={handleSlugChange}
        margin="normal"
        InputProps={{
          startAdornment: <InputAdornment position="start">unishopp.com/</InputAdornment>,
          endAdornment: isCheckingSlug && <CircularProgress size={20} />
        }}
        helperText={!isCheckingSlug && (slugAvailable ? '✅ Disponible' : '❌ No disponible')}
        error={!slugAvailable}
      />
      <CardActions>
        <Button onClick={handleSave} variant="contained" disabled={!slugAvailable}>Guardar</Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </CardActions>
    </CardContent>
  );
};

const SitesPanel = () => (
  <>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6">Mis Sitios Web</Typography>
      <Button variant="contained">Crear Nuevo Sitio</Button>
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Aquí puedes gestionar tus sitios web personalizados.</Typography>
    <List>
      {[ // Mock data for sites
        { id: 1, name: 'Mi Landing Page', slug: 'mi-landing-page' },
        { id: 2, name: 'Portafolio de Fotografía', slug: 'fotografia-profesional' },
      ].map(site => (
        <Card key={site.id} sx={{ mb: 2 }}>
          <CardContent>
            <ListItemText primary={`unishopp.com/${site.slug}`} secondary={site.name} />
            <CardActions>
              <Button startIcon={<EditIcon />}>Editar URL</Button>
            </CardActions>
          </CardContent>
        </Card>
      ))}
    </List>
  </>
);

const MyStoresPanel = ({ stores, selectedStoreId, setSelectedStoreId }) => {
  const [selectedView, setSelectedView] = useState('products'); // 'products' or 'orders'
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useQuery(SELLER_ORDERS_QUERY, {
    variables: { storeId: selectedStoreId },
    skip: !selectedStoreId,
  });

  const handleStoreChange = (event, newValue) => {
    setSelectedStoreId(newValue);
  };

  const handleViewChange = (event, newValue) => {
    setSelectedView(newValue);
  };

  if (!stores || stores.length === 0) {
    return (
      <>
        <Typography variant="h6">Mis Tiendas</Typography>
        <Typography>No tienes ninguna tienda creada todavía.</Typography>
        <Button component={RouterLink} to="/create-store" variant="contained" sx={{ mt: 2 }}>Crear Tienda</Button>
      </>
    );
  }

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'payment_pending': return 'warning';
      case 'payment_confirmed': return 'info';
      case 'delivery_agreed': return 'secondary';
      case 'delivered_payment_received': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const selectedStore = stores.find(store => store.id === selectedStoreId);
  const ordersForSelectedStore = ordersData?.sellerOrders.filter(order => order.store.id === selectedStoreId) || [];

  const renderProducts = () => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {selectedStore?.products && selectedStore.products.length > 0 ? (
        selectedStore.products.map(product => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">${product.price.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Typography sx={{ mt: 1, ml: 2 }}>Esta tienda aún no tiene productos.</Typography>
      )}
    </Grid>
  );

  const renderOrders = () => {
    if (ordersLoading) return <CircularProgress />;
    if (ordersError) return <Alert severity="error">Error al cargar los pedidos: {ordersError.message}</Alert>;
    if (ordersForSelectedStore.length === 0) return <Typography>No hay pedidos para esta tienda.</Typography>;

    return (
      <List>
        {ordersForSelectedStore.map((order) => (
          <Paper key={order.id} sx={{ mb: 2, p: 3, boxShadow: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>Pedido ID: {order.id}</Typography>
                <Typography variant="body2">Cliente: {order.customer.name} ({order.customer.email})</Typography>
                <Typography variant="body2">Fecha: {new Date(order.createdAt).toLocaleString()}</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>Total: ${order.totalAmount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                <Chip label={order.status} color={getStatusChipColor(order.status)} sx={{ mb: 1, fontWeight: 'bold' }} />
                <Typography variant="body2">{order.items.length} artículos</Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Artículos:</Typography>
              <List dense>
                {order.items.map((item, index) => (
                                    <ListItem key={index}><ListItemText primary={`${item.product.name} x ${item.quantity}`} secondary={`${item.priceAtOrder.toFixed(2)} cada uno`} />
                                    </ListItem>
                                  ))}</List>            </Box>
          </Paper>
        ))}</List>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs value={selectedStoreId} onChange={handleStoreChange} aria-label="pestañas de tiendas" variant="scrollable" scrollButtons="auto" sx={{ flexGrow: 1 }}>
          {stores.map(store => (
            <Tab key={store.id} label={store.name} value={store.id} />
          ))}
        </Tabs>
        <Button component={RouterLink} to="/create-store" variant="contained" sx={{ ml: 2, whiteSpace: 'nowrap' }}>
          Crear Nueva Tienda
        </Button>
      </Box>

      {selectedStore && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedView} onChange={handleViewChange} aria-label="sub-pestañas de vista">
              <Tab label="Productos" value="products" />
              <Tab label="Pedidos" value="orders" />
            </Tabs>
          </Box>
          <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: 2 }}>
            {selectedView === 'products' ? renderProducts() : renderOrders()}
          </Box>
        </Box>
      )}
    </>
  );
};


import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AnalyticsPanel = ({ selectedStoreId }) => {
  const [period, setPeriod] = useState('month'); // 'day', 'week', 'month', 'year', 'custom'
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch data using the new seller analytics queries
  const { data: dashboardStats, loading: statsLoading, error: statsError } = useQuery(SELLER_DASHBOARD_STATS_QUERY, {
    variables: { storeId: selectedStoreId },
    skip: !selectedStoreId,
  });
  const { data: salesData, loading: salesLoading, error: salesError } = useQuery(SELLER_SALES_DATA_QUERY, {
    variables: { period, startDate, endDate, storeId: selectedStoreId },
    skip: !selectedStoreId,
  });
  const { data: topProducts, loading: productsLoading, error: productsError } = useQuery(SELLER_TOP_SELLING_PRODUCTS_QUERY, {
    variables: { limit: 5, startDate, endDate, storeId: selectedStoreId },
    skip: !selectedStoreId,
  });
  const { data: storePerformance, loading: storePerfLoading, error: storePerfError } = useQuery(SELLER_TOP_PERFORMING_STORES_QUERY, {
    variables: { limit: 5, startDate, endDate, storeId: selectedStoreId },
    skip: !selectedStoreId,
  });

  // Helper to format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Data for Recharts
  const salesChartData = salesData?.sellerGetSalesData?.map(item => ({
    name: formatDate(item.date),
    Ventas: item.totalSales,
  })) || [];

  const storePerformanceChartData = storePerformance?.sellerGetTopPerformingStores?.map(item => ({
    name: item.storeName,
    Ventas: item.totalRevenue,
  })) || [];

  return (
    <>
      <Typography variant="h6" gutterBottom>Panel de Analíticas</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Aquí puedes ver el rendimiento de tus tiendas y productos.
      </Typography>

      {/* Date Range Selector */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant={period === 'day' ? 'contained' : 'outlined'} onClick={() => setPeriod('day')}>Hoy</Button>
        <Button variant={period === 'week' ? 'contained' : 'outlined'} onClick={() => setPeriod('week')}>Últimos 7 días</Button>
        <Button variant={period === 'month' ? 'contained' : 'outlined'} onClick={() => setPeriod('month')}>Este Mes</Button>
        <Button variant={period === 'year' ? 'contained' : 'outlined'} onClick={() => setPeriod('year')}>Este Año</Button>
        {/* Add custom date picker here later */}
      </Box>

      {/* Key Metrics */}
      {statsLoading ? <CircularProgress /> : statsError ? <Alert severity="error">{statsError.message}</Alert> : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Ventas Totales</Typography>
                <Typography variant="h5">${dashboardStats?.sellerGetDashboardStats?.totalSalesVolume?.toFixed(2) || '0.00'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Órdenes Totales</Typography>
                <Typography variant="h5">{dashboardStats?.sellerGetDashboardStats?.totalOrders || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Productos Publicados</Typography>
                <Typography variant="h5">{dashboardStats?.sellerGetDashboardStats?.totalProducts || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Tiendas Activas</Typography>
                <Typography variant="h5">{dashboardStats?.sellerGetDashboardStats?.totalStores || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Sales Trend Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Tendencia de Ventas</Typography>
        {salesLoading ? <CircularProgress /> : salesError ? <Alert severity="error">{salesError.message}</Alert> : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Ventas" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Sales by Store Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Ventas por Tienda</Typography>
        {storePerfLoading ? <CircularProgress /> : storePerfError ? <Alert severity="error">{storePerfError.message}</Alert> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storePerformanceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Ventas" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Top Selling Products */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Productos Más Vendidos</Typography>
        {productsLoading ? <CircularProgress /> : productsError ? <Alert severity="error">{productsError.message}</Alert> : (
          topProducts?.sellerGetTopSellingProducts && topProducts.sellerGetTopSellingProducts.length > 0 ? (
            <List>
              {topProducts.sellerGetTopSellingProducts.map(product => (
                <ListItem key={product.productId}>
                  <ListItemText
                    primary={`${product.productName} (${product.totalQuantitySold} unidades)`}
                    secondary={`${product.totalRevenue.toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No hay productos vendidos en el período seleccionado.</Typography>
          )
        )}
      </Paper>
    </>
  );
};

const SecurityPanel = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [updatePassword, { loading }] = useMutation(UPDATE_PASSWORD_MUTATION, {
    onCompleted: (data) => {
      setSuccessMessage(data.updatePassword);
      setErrorMessage('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    },
    onError: (error) => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    },
  });

  const handleSubmit = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await updatePassword({ variables: { currentPassword, newPassword } });
    } catch (error) {
      // Errors are handled by onError callback of useMutation
    }
  };

  return (
    <>
      <Typography variant="h6">Cambiar Contraseña</Typography>
      {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
      <TextField
        fullWidth
        label="Contraseña Actual"
        type="password"
        margin="normal"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <TextField
        fullWidth
        label="Nueva Contraseña"
        type="password"
        margin="normal"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <TextField
        fullWidth
        label="Confirmar Nueva Contraseña"
        type="password"
        margin="normal"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
      />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Actualizar Contraseña'}
      </Button>
    </>
  );
};

// --- Main Profile Page Component ---

function ProfilePage() {
  const { isLoggedIn } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !isLoggedIn, // Skip query if user is not logged in
    fetchPolicy: 'network-only', // Always fetch fresh data
  });

  const user = data?.me;
  const [selectedStoreId, setSelectedStoreId] = useState(user?.stores?.[0]?.id || null);

  useEffect(() => {
    if (user?.stores && user.stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(user.stores[0].id);
    }
  }, [user, selectedStoreId]);

  // Define base tabs for all users
  const baseTabs = [
    { label: 'Perfil', icon: <PersonIcon />, component: <PersonalInfoPanel user={user} /> },
    { label: 'Pedidos', icon: <ShoppingBagIcon />, component: <OrdersPanel /> },
    { label: 'Direcciones', icon: <HomeIcon />, component: <AddressesPanel /> },
    { label: 'Seguridad', icon: <SecurityIcon />, component: <SecurityPanel /> },
  ];

  // Conditionally add seller-specific tabs
  let tabConfig = [...baseTabs];
  if (user?.role === 'seller') {
    const sellerTabs = [
      { label: 'Mis Tiendas', icon: <StorefrontIcon />, component: <MyStoresPanel stores={user.stores} selectedStoreId={selectedStoreId} setSelectedStoreId={setSelectedStoreId} /> },
      { label: 'Mis Sitios', icon: <WebIcon />, component: <SitesPanel /> },
      { label: 'Analítica', icon: <AnalyticsIcon />, component: <AnalyticsPanel stores={user.stores} selectedStoreId={selectedStoreId} /> },
    ];
    // Insert seller tabs after 'Direcciones'
    tabConfig.splice(3, 0, ...sellerTabs);
  }


  if (!isLoggedIn) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5">Acceso Denegado</Typography>
          <Typography>Por favor, inicia sesión para ver tu perfil.</Typography>
          <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 2 }}>Ir a Login</Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Error al cargar el perfil: {error.message}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">No se encontró información del usuario.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Paper elevation={0}>
        <Grid container>
          <Grid xs={12} md={3}>
            <Tabs
              orientation={isMobile ? 'horizontal' : 'vertical'}
              variant="scrollable"
              scrollButtons="auto"
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              aria-label="Profile page tabs"
              sx={{ borderRight: { md: 1 }, borderBottom: { xs: 1, md: 0 }, borderColor: 'divider' }}
            >
              {tabConfig.map((tab, index) => (
                <Tab key={index} icon={tab.icon} iconPosition="start" label={tab.label} />
              ))}
            </Tabs>
          </Grid>
          <Grid xs={12} md={9}>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {tabConfig[tabValue].component}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default ProfilePage;