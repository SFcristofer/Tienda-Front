import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { TextField, Button, Typography, Box, Paper, CircularProgress, Alert, List, ListItem, ListItemText, Snackbar, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Grid, CardMedia, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, CardActions, AlertTitle } from '@mui/material'; // Add AlertTitle
import WarningIcon from '@mui/icons-material/Warning'; // Add WarningIcon
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { GET_MY_STORE, GET_SELLER_ORDERS, GET_ALL_CATEGORIES, GET_ALL_STORE_CATEGORIES, GET_ALL_STORES, GET_ALL_ACTIVE_COUNTRIES } from '../graphql/queries';
import { CREATE_STORE, CREATE_PRODUCT, UPDATE_ORDER_STATUS, UPDATE_STORE, UPDATE_PRODUCT, DELETE_PRODUCT, UPLOAD_IMAGE } from '../graphql/mutations';
import ProductForm from './ProductForm';

import { useRegion } from '../context/RegionContext';

const SellerDashboard = () => {
  const { t } = useTranslation();
  const { country } = useRegion(); // Get country from context
    const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } = useForm({
    defaultValues: {
      productName: '',
      productDescription: '',
      productPrice: '',
      productStock: '',
      categoryId: '',
      countryId: '',
    }
  });
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedStoreCategories, setSelectedStoreCategories] = useState([]);
  const [openCreateCategoryModal, setOpenCreateCategoryModal] = useState(false);
  const [showNewStoreCategoryForm, setShowNewStoreCategoryForm] = useState(false);

  const [openAddProductModal, setOpenAddProductModal] = useState(false); // New state for add product modal

  const handleOpenAddProductModal = () => { // New handler
    setOpenAddProductModal(true);
    reset({
      productName: '',
      productDescription: '',
      productPrice: '',
      productStock: '',
      categoryId: '',
      countryId: '',
    });
    setProductImageUrl(''); // Clear image preview
    setProductImageFileName(''); // Clear image file name
    setEditingProduct(null); // Ensure editingProduct is null when opening add modal
  };

  const handleCloseAddProductModal = () => {
    setOpenAddProductModal(false);
    reset({}); // Ensure form fields are cleared
    setProductImageUrl(''); // Clear image preview
    setProductImageFileName(''); // Clear image file name
    setEditingProduct(null); // Clear any editing product data
  };

  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    countryId: '',
    phoneNumber: '',
    contactEmail: '',
  });

  const { data: countriesData, loading: loadingCountries, error: errorCountries } = useQuery(GET_ALL_ACTIVE_COUNTRIES);
  const { data: storeDataDb, loading: loadingStore, error: errorStore, refetch: refetchStore } = useQuery(GET_MY_STORE, { fetchPolicy: 'network-only' });
  const { data: ordersData, loading: loadingOrders, error: errorOrders, refetch: refetchOrders } = useQuery(GET_SELLER_ORDERS, { skip: !storeDataDb?.me?.store, fetchPolicy: 'network-only' });
  const { data: categoriesData, loading: loadingCategories, error: errorCategories } = useQuery(GET_ALL_CATEGORIES);
  const { data: storeCategoriesData, loading: loadingStoreCategories, error: errorStoreCategories } = useQuery(GET_ALL_STORE_CATEGORIES);

  useEffect(() => {
    if (country) {
      // Find the country object from the fetched countries data
      const selectedCountry = countriesData?.getAllActiveCountries?.find(c => c.code === country);
      if (selectedCountry) {
        setStoreData(prev => ({ ...prev, countryId: selectedCountry.id }));
      }
    }
  }, [country, countriesData]);

  const [storeImageFileName, setStoreImageFileName] = useState('');
  const [openEditStoreDialog, setOpenEditStoreDialog] = useState(false);
  const [editStoreName, setEditStoreName] = useState('');
  const [editStoreDescription, setEditStoreDescription] = useState('');
  const [editStoreImageUrl, setEditStoreImageUrl] = useState('');
  const [editStoreImageFileName, setEditStoreImageFileName] = useState('');
  const [editStoreStreet, setEditStoreStreet] = useState('');
  const [editStoreCity, setEditStoreCity] = useState('');
  const [editStoreState, setEditStoreState] = useState('');
  const [editStoreZipCode, setEditStoreZipCode] = useState('');
  const [editStoreCountryId, setEditStoreCountryId] = useState('');
  const [editStorePhoneNumber, setEditStorePhoneNumber] = useState('');
  const [editStoreContactEmail, setEditStoreContactEmail] = useState('');

  const handleEditStoreImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditStoreImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setEditStoreImageUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const [productImageUrl, setProductImageUrl] = useState('');
  const [productImageFileName, setProductImageFileName] = useState('');
  const [openEditProductDialog, setOpenEditProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [openDeleteProductConfirmDialog, setOpenDeleteProductConfirmDialog] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);

  const [openStatusConfirmDialog, setOpenStatusConfirmDialog] = useState(false);
  const [statusConfirmDetails, setStatusConfirmDetails] = useState({ orderId: null, newStatus: null });

  const store = storeDataDb?.me?.store;
  const categories = categoriesData?.getAllCategories || [];
  const storeCategories = storeCategoriesData?.getAllStoreCategories || [];
  const orders = ordersData?.sellerOrders || [];

  const [createStore] = useMutation(CREATE_STORE, {
    update(cache, { data: { createStore: newStore } }) {
      const existingStores = cache.readQuery({ query: GET_ALL_STORES, variables: { sortBy: 'updatedAt', sortOrder: 'DESC' } });
      if (existingStores && existingStores.getAllStores) {
        cache.writeQuery({
          query: GET_ALL_STORES,
          variables: { sortBy: 'updatedAt', sortOrder: 'DESC' },
          data: {
            getAllStores: [newStore, ...existingStores.getAllStores],
          },
        });
      }
    },
        onCompleted: () => { refetchStore(); setSnackbar({ open: true, message: t('storeCreatedSuccess'), severity: 'success' }); },
    onError: (err) => setSnackbar({ open: true, message: `${t('errorCreatingStore')}: ${err.message}`, severity: 'error' })
  });
  const [updateStore] = useMutation(UPDATE_STORE, { onCompleted: () => { refetchStore(); setOpenEditStoreDialog(false); setSnackbar({ open: true, message: t('storeUpdatedSuccess'), severity: 'success' }); }, onError: (err) => setSnackbar({ open: true, message: `${t('errorUpdatingStore')}: ${err.message}`, severity: 'error' }) });
  const [createProduct] = useMutation(CREATE_PRODUCT, {
  update(cache, { data: { createProduct: newProduct } }) {
    const existingStoreData = cache.readQuery({ query: GET_MY_STORE });
    if (existingStoreData && existingStoreData.me && existingStoreData.me.store) {
      cache.writeQuery({
        query: GET_MY_STORE,
        data: {
          me: {
            ...existingStoreData.me,
            store: {
              ...existingStoreData.me.store,
              products: [...existingStoreData.me.store.products, newProduct],
            },
          },
        },
      });
    }
  },
  onCompleted: async () => { // Make onCompleted async to await refetchStore
    await refetchStore(); // Re-enable refetch for robustness
    console.log('Store data after refetch:', storeDataDb); // Log the entire store data
    console.log('Products after refetch:', storeDataDb?.me?.store?.products); // Log products specifically
    reset();
    setProductImageUrl('');
    setProductImageFileName('');
    setSnackbar({ open: true, message: t('productCreatedSuccess'), severity: 'success' });
    handleCloseAddProductModal(); // Close modal on success
  },
  onError: (err) => setSnackbar({ open: true, message: `${t('errorCreatingProduct')}: ${err.message}`, severity: 'error' })
});
  const [updateProduct] = useMutation(UPDATE_PRODUCT, { onCompleted: () => { refetchStore(); setOpenEditProductDialog(false); setSnackbar({ open: true, message: t('productUpdatedSuccess'), severity: 'success' }); }, onError: (err) => setSnackbar({ open: true, message: `${t('errorUpdatingProduct')}: ${err.message}`, severity: 'error' }) });
  const [deleteProduct] = useMutation(DELETE_PRODUCT, { onCompleted: () => { refetchStore(); setSnackbar({ open: true, message: t('productDeletedSuccess'), severity: 'success' }); }, onError: (err) => setSnackbar({ open: true, message: `${t('errorDeletingProduct')}: ${err.message}`, severity: 'error' }) });
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, { onCompleted: () => { refetchOrders(); setSnackbar({ open: true, message: t('orderStatusUpdatedSuccess'), severity: 'success' }); }, onError: (err) => setSnackbar({ open: true, message: `${t('errorUpdatingOrderStatus')}: ${err.message}`, severity: 'error' }) });
  const [uploadImage] = useMutation(UPLOAD_IMAGE);

  

  

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleStoreInputChange = (e) => {
    const { name, value } = e.target;
    setStoreData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateStore = async () => {
    await updateStore({
      variables: {
        id: store.id,
        name: editStoreName,
        description: editStoreDescription,
        street: editStoreStreet,
        city: editStoreCity,
        state: editStoreState,
        zipCode: editStoreZipCode,
        countryId: editStoreCountryId,
        phoneNumber: editStorePhoneNumber,
        contactEmail: editStoreContactEmail,
        imageUrl: editStoreImageUrl,
      }
    });
  };

  const handleCreateStore = handleSubmit(async (data) => {
    const finalVariables = {
      ...storeData,
      ...data,
      storeCategoryIds: selectedStoreCategories
    };
    await createStore({ variables: finalVariables });
  });

  const handleCreateProduct = handleSubmit(async (data) => {
    await createProduct({ variables: { name: data.productName, description: data.productDescription, price: parseFloat(data.productPrice), storeId: store.id, imageUrl: productImageUrl, categoryId: data.categoryId, stock: parseInt(data.productStock), countryId: data.countryId } });
  });

  const handleUpdateProduct = handleSubmit(async (data) => {
    await updateProduct({ variables: { id: editingProduct.id, name: data.productName, description: data.productDescription, price: parseFloat(data.productPrice), currency: data.currency, imageUrl: productImageUrl, stock: parseInt(data.productStock), categoryId: data.categoryId } });
    setOpenEditProductDialog(false); // Close dialog on success
  });

  const handleConfirmDeleteProduct = async () => {
    await deleteProduct({ variables: { id: productToDeleteId } });
    setOpenDeleteProductConfirmDialog(false);
  };

  const handleConfirmStatusChange = async () => {
    await updateOrderStatus({ variables: { orderId: statusConfirmDetails.orderId, status: statusConfirmDetails.newStatus } });
    setOpenStatusConfirmDialog(false);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setProductImageUrl(product.imageUrl); // Set existing image URL for display
    setProductImageFileName(product.imageUrl ? product.imageUrl.substring(product.imageUrl.lastIndexOf('/') + 1) : ''); // Set file name for display
    reset({ // Pre-fill the form with existing product data
      productName: product.name,
      productDescription: product.description,
      productPrice: product.price,
      productStock: product.stock,
      categoryId: product.category.id,
      countryId: product.country?.id || '', // Pre-fill countryId, safely handle undefined country
    });
    setOpenEditProductDialog(true);
  };

  const handleProductImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const { data } = await uploadImage({ variables: { base64Image: reader.result } });
          setProductImageUrl(data.uploadImage); // Set URL returned by backend
        } catch (err) {
          setSnackbar({ open: true, message: `${t('errorUploadingImage')}: ${err.message}`, severity: 'error' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoreImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const { data } = await uploadImage({ variables: { base64Image: reader.result } });
          console.log('Uploaded image URL:', data.uploadImage); // Debug log
          setStoreData(prev => ({ ...prev, imageUrl: data.uploadImage }));
        } catch (err) {
          setSnackbar({ open: true, message: `${t('errorUploadingImage')}: ${err.message}`, severity: 'error' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  if (loadingStore || loadingCategories) return <CircularProgress />;
  if (errorStore && !store) return <Alert severity="error">{t('errorLoadingStore')}: {errorStore.message}</Alert>;
  if (errorCategories) return <Alert severity="error">{t('errorLoadingCategories')}: {errorCategories.message}</Alert>;

  if (!store) {
    return (
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>{t('createYourStore')}</Typography>
        <Box component="form" onSubmit={handleCreateStore}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2, mb: 1 }}>{t('basicStoreInformation')}</Typography>
          <TextField fullWidth label={t('storeName')} name="name" value={storeData.name} onChange={handleStoreInputChange} margin="normal" required />
          <TextField fullWidth label={t('storeDescription')} name="description" value={storeData.description} onChange={handleStoreInputChange} margin="normal" multiline rows={3} required />
          
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3, mb: 1 }}>{t('storeCategoriesSubtitle')}</Typography>
          <FormControl fullWidth margin="normal" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <InputLabel id="store-categories-label" sx={{ flexShrink: 0 }}>{t('selectCategories')}</InputLabel>
            <Select
              labelId="store-categories-label"
              multiple
              value={selectedStoreCategories}
              onChange={(e) => setSelectedStoreCategories(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const category = storeCategories.find(c => c.id === value);
                    return <Chip key={value} label={category ? category.name : ''} />;
                  })}
                </Box>
              )}
              sx={{ flexGrow: 1, mr: 1 }}
            >
              {storeCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {/* Removed category creation button for sellers */}
          </FormControl>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3, mb: 1 }}>{t('storeLocation')}</Typography>
          <TextField fullWidth label={t('street')} name="street" value={storeData.street} onChange={handleStoreInputChange} margin="normal" />
          <TextField fullWidth label={t('city')} name="city" value={storeData.city} onChange={handleStoreInputChange} margin="normal" required />
          <TextField fullWidth label={t('state')} name="state" value={storeData.state} onChange={handleStoreInputChange} margin="normal" required />
          <TextField fullWidth label={t('zipCode')} name="zipCode" value={storeData.zipCode} onChange={handleStoreInputChange} margin="normal" required />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t('country')}</InputLabel>
            <Controller
              name="countryId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  label={t('country')}
                  onChange={(e) => {
                    field.onChange(e);
                    setStoreData(prev => ({ ...prev, countryId: e.target.value }));
                  }}
                >
                  {countriesData?.getAllActiveCountries?.map((country) => (
                    <MenuItem key={country.id} value={country.id}>
                      {country.name} ({country.currencySymbol})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3, mb: 1 }}>{t('contactInformation')}</Typography>
          <TextField fullWidth label={t('phoneNumber')} name="phoneNumber" value={storeData.phoneNumber} onChange={handleStoreInputChange} margin="normal" required />
          <TextField fullWidth label={t('contactEmail')} name="contactEmail" value={storeData.contactEmail} onChange={handleStoreInputChange} margin="normal" required />
          
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', mt: 2 }}>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} fullWidth>
              {t('uploadStoreImage')}
              <input type="file" hidden accept="image/*" onChange={handleStoreImageChange} />
            </Button>
            {storeData.imageUrl && (
              <Box sx={{ mt: 2 }}>
                <img src={storeData.imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} onLoad={() => console.log('Store image loaded successfully!', storeData.imageUrl)} onError={(e) => console.error('Error loading store image:', e.target.src, e)} />
              </Box>
            )}
          </Paper>
          
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>{t('createStore')}</Button>
        </Box>
      </Paper>
    );
  }

  console.log('Current storeData.imageUrl:', storeData.imageUrl); // Debug log

  return (
    <Box sx={{ mt: 4 }}>
      
      <Typography variant="h4" gutterBottom>{t('sellerDashboard')}</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="seller dashboard tabs">
          <Tab label={t('storeManagement')} />
          <Tab label={t('productManagement')} />
          <Tab label={t('orderManagement')} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{t('storeDetails')}</Typography>
          <Typography variant="h6">{t('name')}: {store.name}</Typography>
          <Typography variant="body1">{t('description')}: {store.description}</Typography>
          <Typography variant="body2" color="text.secondary">{t('status')}: {store.status}</Typography>
          {store.averageRating !== null && store.averageRating !== undefined && (
            <Typography variant="body2" color="text.secondary">{t('averageRating')}: {store.averageRating.toFixed(1)}</Typography>
          )}
          <Typography variant="body2" color="text.secondary">{t('contactEmail')}: {store.contactEmail}</Typography>
          <Typography variant="body2" color="text.secondary">{t('phoneNumber')}: {store.phoneNumber}</Typography>
          <Typography variant="body2" color="text.secondary">{`${store.street}, ${store.city}, ${store.state} ${store.zipCode}, ${store.country}`}</Typography>
          {store.storeCategories && store.storeCategories.length > 0 && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" component="span">{t('categories')}: </Typography>
              {store.storeCategories.map(cat => (
                <Chip key={cat.id} label={cat.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Box>
          )}
          {store.imageUrl && <Box sx={{ mt: 2 }}><img src={store.imageUrl} alt={store.name} style={{ maxWidth: '200px', height: 'auto' }} /></Box>}
          <Button variant="contained" onClick={() => {
            setEditStoreName(store.name);
            setEditStoreDescription(store.description);
            setEditStoreImageUrl(store.imageUrl);
            setEditStoreStreet(store.street || '');
            setEditStoreCity(store.city || '');
            setEditStoreState(store.state || '');
            setEditStoreZipCode(store.zipCode || '');
            setEditStoreCountryId(store.country.id); // Set countryId
            setEditStorePhoneNumber(store.phoneNumber || '');
            setEditStoreContactEmail(store.contactEmail || '');
            setOpenEditStoreDialog(true);
          }} sx={{ mt: 2 }}>{t('editStoreDetails')}</Button>

          

          
        </Paper>
      )}

      {tabValue === 1 && (
        <Box>
          <Button variant="contained" sx={{ mb: 3 }} onClick={handleOpenAddProductModal}>
            {t('addNewProduct')}
          </Button>
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5">{t('yourProducts')}</Typography>
            {store.products && store.products.length === 0 ? <Typography>{t('noProductsAdded')}</Typography> : <Grid container spacing={2}>{(store.products || []).map((p) => <Grid item xs={12} sm={6} md={4} key={p.id}><Card sx={{ height: '100%' }}><CardMedia component="img" height="140" image={p.imageUrl || '/images/product-placeholder.svg'} alt={p.name} /><CardContent><Typography gutterBottom variant="h6">{p.name}</Typography><Typography variant="h6">${p.price}</Typography><Typography variant="body2">{t('stock')}: {p.stock}</Typography></CardContent><CardActions><Button size="small" onClick={() => openEditDialog(p)}>{t('edit')}</Button><Button size="small" color="error" onClick={() => { setProductToDeleteId(p.id); setOpenDeleteProductConfirmDialog(true); }}>{t('delete')}</Button></CardActions></Card></Grid>)}</Grid>}
              </Paper>
            </Box>
          )}

          <Dialog open={openAddProductModal} onClose={handleCloseAddProductModal} fullWidth maxWidth="sm">
            <DialogTitle sx={{ textAlign: 'center' }}>{t('addNewProduct')}</DialogTitle>
            <DialogContent>
              <ProductForm
                register={register}
                errors={errors}
                control={control}
                categories={categories}
                productImageUrl={productImageUrl}
                productImageFileName={productImageFileName}
                handleProductImageChange={handleProductImageChange}
                t={t}
                onSubmit={handleSubmit(handleCreateProduct)}
                watch={watch}
                setValue={setValue}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddProductModal}>{t('cancel')}</Button>
              <Button type="submit" form="product-form" variant="contained">{t('addProduct')}</Button>
            </DialogActions>
          </Dialog>

          {tabValue === 2 && (
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>{t('customerOrders')}</Typography>
              {loadingOrders ? <CircularProgress /> : errorOrders ? <Alert severity="error">{t('errorLoadingOrders')}: {errorOrders.message}</Alert> : orders.length === 0 ? <Typography>{t('noOrdersReceived')}</Typography> : <Grid container spacing={2}>{orders.map((order) => <Grid item xs={12} md={6} key={order.id}><Card variant="outlined"><CardContent><Typography variant="h6">{t('orderId')}: {order.id}</Typography><Typography>{t('customer')}: {order.customer.name}</Typography><Typography>{t('total')}: ${order.totalAmount.toFixed(2)}</Typography>                                    <Chip label={t(`orderStatus_${order.status}`)} color={getStatusChipColor(order.status)} size="small" /><FormControl fullWidth sx={{ mt: 2 }}><InputLabel>{t('updateOrderStatus')}</InputLabel><Select value={order.status} label={t('updateOrderStatus')} onChange={(e) => setStatusConfirmDetails({ orderId: order.id, newStatus: e.target.value })} onBlur={() => handleConfirmStatusChange()} disabled={['delivered_payment_received', 'cancelled'].includes(order.status)}><MenuItem value="payment_pending">{t('paymentPending')}</MenuItem><MenuItem value="payment_confirmed">{t('paymentConfirmed')}</MenuItem><MenuItem value="delivery_agreed">{t('deliveryAgreed')}</MenuItem><MenuItem value="delivered_payment_received">{t('delivered')}</MenuItem><MenuItem value="cancelled">{t('cancelled')}</MenuItem></Select></FormControl></CardContent></Card></Grid>)}</Grid>}
            </Paper>
          )}

          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>
          <Dialog open={openEditStoreDialog} onClose={() => setOpenEditStoreDialog(false)}><DialogTitle>{t('editStoreDetails')}</DialogTitle><DialogContent><TextField autoFocus margin="dense" label={t('storeName')} type="text" fullWidth value={editStoreName} onChange={(e) => setEditStoreName(e.target.value)} /><TextField margin="dense" label={t('storeDescription')} type="text" fullWidth multiline rows={4} value={editStoreDescription} onChange={(e) => setEditStoreDescription(e.target.value)} /><TextField margin="dense" label={t('street')} type="text" fullWidth value={editStoreStreet} onChange={(e) => setEditStoreStreet(e.target.value)} /><TextField margin="dense" label={t('city')} type="text" fullWidth value={editStoreCity} onChange={(e) => setEditStoreCity(e.target.value)} /><TextField margin="dense" label={t('state')} type="text" fullWidth value={editStoreState} onChange={(e) => setEditStoreState(e.target.value)} /><TextField margin="dense" label={t('zipCode')} type="text" fullWidth value={editStoreZipCode} onChange={(e) => setEditStoreZipCode(e.target.value)} /><FormControl fullWidth margin="dense"><InputLabel>{t('country')}</InputLabel><Select value={editStoreCountryId} label={t('country')} onChange={(e) => setEditStoreCountryId(e.target.value)}>{countriesData?.getAllActiveCountries?.map((country) => (<MenuItem key={country.id} value={country.id}>{country.name} ({country.currencySymbol})</MenuItem>))}</Select></FormControl><TextField margin="dense" label={t('phoneNumber')} type="text" fullWidth value={editStorePhoneNumber} onChange={(e) => setEditStorePhoneNumber(e.target.value)} /><TextField margin="dense" label={t('contactEmail')} type="text" fullWidth value={editStoreContactEmail} onChange={(e) => setEditStoreContactEmail(e.target.value)} /><Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}><Button variant="outlined" component="label" startIcon={<UploadFileIcon />} fullWidth>{t('uploadStoreImage')}<input type="file" hidden accept="image/*" onChange={handleEditStoreImageChange} /></Button>{editStoreImageFileName && (<Typography variant="caption" display="block" sx={{ mt: 1 }}>{t('selectedFile', { fileName: editStoreImageFileName })}</Typography>)}{editStoreImageUrl && (<Box sx={{ mt: 2 }}><img src={editStoreImageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} /></Box>)}</Paper></DialogContent><DialogActions><Button onClick={() => setOpenEditStoreDialog(false)}>{t('cancel')}</Button><Button onClick={() => updateStore({ variables: { id: store.id, name: editStoreName, description: editStoreDescription, imageUrl: editStoreImageUrl, street: editStoreStreet, city: editStoreCity, state: editStoreState, zipCode: editStoreZipCode, country: editStoreCountryId, phoneNumber: editStorePhoneNumber, contactEmail: editStoreContactEmail } })}>{t('save')}</Button></DialogActions></Dialog>
          {editingProduct && (
            <Dialog open={openEditProductDialog} onClose={() => setOpenEditProductDialog(false)} fullWidth maxWidth="sm">
              <DialogTitle sx={{ textAlign: 'center' }}>{t('editProduct')}</DialogTitle>
              <DialogContent>
                <ProductForm
                  register={register}
                  errors={errors}
                  control={control}
                  categories={categories}
                  productImageUrl={productImageUrl}
                  productImageFileName={productImageFileName}
                  handleProductImageChange={handleProductImageChange}
                  t={t}
                  onSubmit={handleSubmit(handleUpdateProduct)}
                  watch={watch}
                  setValue={setValue}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenEditProductDialog(false)}>{t('cancel')}</Button>
                <Button type="submit" form="product-form" variant="contained">{t('updateProduct')}</Button>
              </DialogActions>
            </Dialog>
          )}
          <Dialog open={openDeleteProductConfirmDialog} onClose={() => setOpenDeleteProductConfirmDialog(false)}><DialogTitle>{t('confirmProductDeletion')}</DialogTitle><DialogContent><Typography>{t('areYouSureDeleteProduct')}</Typography></DialogContent><DialogActions><Button onClick={() => setOpenDeleteProductConfirmDialog(false)}>{t('cancel')}</Button><Button onClick={handleConfirmDeleteProduct} color="error">{t('delete')}</Button></DialogActions></Dialog>

          {/* Removed category creation dialog for sellers */}
          </Box>
      
  );
};
export default SellerDashboard;