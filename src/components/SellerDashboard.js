import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Input,
  CardActions,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { GET_MY_STORE, GET_SELLER_ORDERS, GET_ALL_CATEGORIES } from '../graphql/queries';
import {
  CREATE_STORE,
  CREATE_PRODUCT,
  UPDATE_ORDER_STATUS,
  UPDATE_STORE,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from '../graphql/mutations';

const SellerDashboard = () => {
  const token = localStorage.getItem('token');
  const client = useApolloClient();

  const finalStatuses = ['payment_confirmed', 'delivered_payment_received', 'cancelled'];

  // State for forms
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeNameError, setStoreNameError] = useState('');
  const [storeDescriptionError, setStoreDescriptionError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  const [productImageUrl, setProductImageUrl] = useState('');
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImageFileName, setProductImageFileName] = useState('');

  // State for product editing dialog
  const [openEditProductDialog, setOpenEditProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductDescription, setEditProductDescription] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductImageUrl, setEditProductImageUrl] = useState('');
  const [editProductStock, setEditProductStock] = useState('');
  const [editProductCategoryId, setEditProductCategoryId] = useState('');

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProductImageFileName('');
      setProductImageUrl('');
    }
  };

  // Tab state
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 2) {
      refetchOrders();
    }
  };

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // State for store editing dialog
  const [openEditStoreDialog, setOpenEditStoreDialog] = useState(false);
  const [editStoreName, setEditStoreName] = useState('');
  const [editStoreDescription, setEditStoreDescription] = useState('');

  // Queries
  const {
    data: storeData,
    loading: loadingStore,
    error: errorStore,
    refetch: refetchStore,
  } = useQuery(GET_MY_STORE, { skip: !token, fetchPolicy: 'network-only' });
  const store = storeData?.me?.store;
  const {
    data: ordersData,
    loading: loadingOrders,
    error: errorOrders,
    refetch: refetchOrders,
  } = useQuery(GET_SELLER_ORDERS, { skip: !token || !store, fetchPolicy: 'network-only' });
  const {
    data: categoriesData,
    loading: loadingCategories,
    error: errorCategories,
  } = useQuery(GET_ALL_CATEGORIES);

  // Mutations
  const [createStore] = useMutation(CREATE_STORE, {
    onCompleted: async () => {
      await refetchStore();
      setSnackbarMessage('Store created successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage('Error creating store. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    onCompleted: async () => {
      await refetchStore();
      setSnackbarMessage('Product created successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage('Error creating product. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });
  const [updateStore] = useMutation(UPDATE_STORE, {
    refetchQueries: [{ query: GET_MY_STORE }],
    onCompleted: async () => {
      setSnackbarMessage('Store updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenEditStoreDialog(false);
    },
    onError: (error) => {
      setSnackbarMessage('Error updating store. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: async () => {
      await refetchOrders();
      setSnackbarMessage('Order status updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage('Error updating order status. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: async () => {
      await refetchStore();
      setSnackbarMessage('Product updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenEditProductDialog(false);
    },
    onError: (error) => {
      setSnackbarMessage('Error updating product. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: async () => {
      await refetchStore();
      setSnackbarMessage('Product deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage('Error deleting product. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const handleCreateStore = async (e) => {
    e.preventDefault();
    let valid = true;
    if (!storeName.trim()) {
      setStoreNameError('Store name is required.');
      valid = false;
    } else {
      setStoreNameError('');
    }
    if (!storeDescription.trim()) {
      setStoreDescriptionError('Store description is required.');
      valid = false;
    } else {
      setStoreDescriptionError('');
    }

    if (!valid) return;

    try {
      await createStore({ variables: { name: storeName, description: storeDescription } });
      setStoreName('');
      setStoreDescription('');
    } catch (err) {
      console.error('Error creating store:', err);
    }
  };

  const handleCreateProduct = handleSubmit(async (data) => {
    try {
      await createProduct({
        variables: {
          name: data.productName,
          description: data.productDescription,
          price: data.productPrice,
          storeId: storeData.me.store.id,
          imageUrl: productImageUrl,
          categoryId: data.categoryId,
          stock: data.productStock,
        },
      });
      reset();
      setProductImageUrl('');
      setProductImageFileName('');
    } catch (err) {
      console.error('Error creating product:', err);
    }
  });

  const [openStatusConfirmDialog, setOpenStatusConfirmDialog] = useState(false);
  const [statusConfirmDetails, setStatusConfirmDetails] = useState({ orderId: null, newStatus: null });

  const handleOpenStatusConfirmDialog = (orderId, newStatus) => {
    setStatusConfirmDetails({ orderId, newStatus });
    setOpenStatusConfirmDialog(true);
  };

  const handleCloseStatusConfirmDialog = () => {
    setOpenStatusConfirmDialog(false);
    setStatusConfirmDetails({ orderId: null, newStatus: null });
  };

  const handleConfirmStatusChange = async () => {
    const { orderId, newStatus } = statusConfirmDetails;
    try {
      await updateOrderStatus({ variables: { orderId, status: newStatus } });
      handleCloseStatusConfirmDialog();
    } catch (err) {
      console.error('Error updating order status:', err);
      handleCloseStatusConfirmDialog();
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    const finalStatuses = ['payment_confirmed', 'delivered_payment_received', 'cancelled'];

    if (finalStatuses.includes(newStatus)) {
      handleOpenStatusConfirmDialog(orderId, newStatus);
    } else {
      try {
        await updateOrderStatus({ variables: { orderId, status: newStatus } });
      } catch (err) {
        console.error('Error updating order status:', err);
      }
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await updateProduct({
        variables: {
          id: editingProduct.id,
          name: editProductName,
          description: editProductDescription,
          price: parseFloat(editProductPrice),
          imageUrl: editProductImageUrl,
          stock: parseInt(editProductStock),
          categoryId: editProductCategoryId,
        },
      });
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const [openDeleteProductConfirmDialog, setOpenDeleteProductConfirmDialog] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);

  const handleOpenDeleteProductConfirmDialog = (productId) => {
    setProductToDeleteId(productId);
    setOpenDeleteProductConfirmDialog(true);
  };

  const handleCloseDeleteProductConfirmDialog = () => {
    setOpenDeleteProductConfirmDialog(false);
    setProductToDeleteId(null);
  };

  const handleConfirmDeleteProduct = async () => {
    try {
      await deleteProduct({ variables: { id: productToDeleteId } });
      handleCloseDeleteProductConfirmDialog();
    } catch (err) {
      console.error('Error deleting product:', err);
      handleCloseDeleteProductConfirmDialog();
    }
  };

  const handleDeleteProduct = async (productId) => {
    handleOpenDeleteProductConfirmDialog(productId);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setEditProductName(product.name);
    setEditProductDescription(product.description);
    setEditProductPrice(product.price);
    setEditProductImageUrl(product.imageUrl);
    setEditProductStock(product.stock);
    setEditProductCategoryId(product.category.id);
    setOpenEditProductDialog(true);
  };

  const handleEditProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProductImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'payment_pending':
        return 'warning';
      case 'payment_confirmed':
        return 'info';
      case 'delivery_agreed':
        return 'secondary';
      case 'delivered_payment_received':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loadingStore || loadingCategories) return <CircularProgress />;
  if (errorStore && !store) return <Alert severity="error">Error loading store data: {errorStore.message}</Alert>;
  if (errorCategories) return <Alert severity="error">Error loading categories: {errorCategories.message}</Alert>;

  const categories = categoriesData?.getAllCategories || [];
  const orders = ordersData?.sellerOrders || [];

  if (!store) {
    return (
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5">Create Your Store</Typography>
        <Box component="form" onSubmit={handleCreateStore}>
          <TextField
            fullWidth
            label="Store Name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            margin="normal"
            required
            error={!!storeNameError}
            helperText={storeNameError}
          />
          <TextField
            fullWidth
            label="Store Description"
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
            required
            error={!!storeDescriptionError}
            helperText={storeDescriptionError}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Create Store
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Seller Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="seller dashboard tabs">
          <Tab label="Store Management" />
          <Tab label="Product Management" />
          <Tab label="Order Management" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your Store Details
          </Typography>
          <Typography variant="h6">Name: {store.name}</Typography>
          <Typography variant="body1">Description: {store.description}</Typography>
          {store.imageUrl && (
            <Box sx={{ mt: 2 }}>
              <img src={store.imageUrl} alt={store.name} style={{ maxWidth: '200px', height: 'auto' }} />
            </Box>
          )}
          <Button
            variant="contained"
            onClick={() => {
              setEditStoreName(store.name);
              setEditStoreDescription(store.description);
              setOpenEditStoreDialog(true);
            }}
            sx={{ mt: 2 }}
          >
            Edit Store Details
          </Button>
        </Paper>
      )}

      {tabValue === 1 && (
        <Box>
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5">Add New Product</Typography>
            <Box component="form" onSubmit={handleSubmit(handleCreateProduct)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    {...register('productName', { required: 'Product name is required.' })}
                    error={!!errors.productName}
                    helperText={errors.productName?.message}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Description"
                    {...register('productDescription', { required: 'Product description is required.' })}
                    error={!!errors.productDescription}
                    helperText={errors.productDescription?.message}
                    margin="normal"
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Price"
                    {...register('productPrice', {
                      required: 'Price is required.',
                      min: { value: 0.01, message: 'Price must be a positive number.' },
                      valueAsNumber: true,
                    })}
                    error={!!errors.productPrice}
                    helperText={errors.productPrice?.message}
                    margin="normal"
                    type="number"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Stock Quantity"
                    {...register('productStock', {
                      required: 'Stock quantity is required.',
                      min: { value: 0, message: 'Stock must be a non-negative number.' },
                      valueAsNumber: true,
                    })}
                    error={!!errors.productStock}
                    helperText={errors.productStock?.message}
                    margin="normal"
                    type="number"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" required error={!!errors.categoryId}>
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Controller
                      name="categoryId"
                      control={control}
                      rules={{ required: 'Category is required.' }}
                      render={({ field }) => (
                        <Select labelId="category-select-label" label="Category" {...field}>
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.categoryId && (
                      <Typography color="error" variant="caption">
                        {errors.categoryId?.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Product Image
                  </Typography>
                  <input
                    accept="image/png, image/jpeg"
                    style={{ display: 'none' }}
                    id="product-image-upload"
                    type="file"
                    onChange={handleProductImageChange}
                  />
                  <label htmlFor="product-image-upload">
                    <Button variant="outlined" component="span" startIcon={<UploadFileIcon />} fullWidth>
                      Upload Product Image
                    </Button>
                  </label>
                  {productImageFileName && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Selected file: {productImageFileName}
                    </Typography>
                  )}
                  {productImageUrl && (
                    <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                      <img
                        src={productImageUrl}
                        alt="Product preview"
                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" sx={{ mt: 3, display: 'block', mx: 'auto' }}>
                Add Product
              </Button>
            </Box>
          </Paper>
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5">Your Products</Typography>
            {store.products && store.products.length === 0 ? (
              <Typography>You haven't added any products yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {store.products &&
                  store.products.map((p) => (
                    <Grid item xs={12} sm={6} md={4} key={p.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Link to={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={p.imageUrl || '/images/product-placeholder.svg'}
                            alt={p.name}
                          />
                          <CardContent>
                            <Typography gutterBottom variant="h6" component="div">
                              {p.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {p.description}
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 1 }}>
                              ${p.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Stock: {p.stock}
                            </Typography>
                          </CardContent>
                        </Link>
                        <CardActions>
                          <Button size="small" onClick={() => openEditDialog(p)}>
                            Edit
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDeleteProduct(p.id)}>
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            )}
          </Paper>
        </Box>
      )}

      {tabValue === 2 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Customer Orders
          </Typography>
          {loadingOrders ? (
            <CircularProgress />
          ) : errorOrders ? (
            <Alert severity="error">Error loading orders: {errorOrders.message}</Alert>
          ) : orders.length === 0 ? (
            <Typography>No orders received yet.</Typography>
          ) : (
            <Grid container spacing={2}>
              {orders.map((order) => (
                <Grid item xs={12} md={6} key={order.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">Order ID: {order.id}</Typography>
                      <Typography variant="body1">
                        Customer: {order.customer.name} ({order.customer.email})
                      </Typography>
                      <Typography variant="body1">
                        Total: ${order.totalAmount.toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1">Status:</Typography>
                        <Chip
                          label={order.status.replace('_', ' ').toUpperCase()}
                          color={getStatusChipColor(order.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body1">
                        Delivery Address: {order.deliveryAddress}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Order Date: {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">Items:</Typography>
                        <List dense>
                          {order.items.map((item) => (
                            <ListItem key={item.id}>
                              <ListItemText
                                primary={`${item.product.name} x ${item.quantity} (${item.priceAtOrder.toFixed(2)} each)`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id={`status-label-${order.id}`}>Update Order Status</InputLabel>
                        <Select
                          labelId={`status-label-${order.id}`}
                          value={order.status}
                          label="Update Order Status"
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          disabled={finalStatuses.includes(order.status)}
                        >
                          <MenuItem value="payment_pending">Payment Pending</MenuItem>
                          <MenuItem value="payment_confirmed">Payment Confirmed</MenuItem>
                          <MenuItem value="delivery_agreed">Delivery Agreed</MenuItem>
                          <MenuItem value="delivered_payment_received">Delivered & Payment Received</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button component={Link} to={`/order-confirmation/${order.id}`} size="small">
                        View/Download Receipt
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={openEditStoreDialog} onClose={() => setOpenEditStoreDialog(false)}>
        <DialogTitle>Edit Store Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Store Name"
            type="text"
            fullWidth
            value={editStoreName}
            onChange={(e) => setEditStoreName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Store Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={editStoreDescription}
            onChange={(e) => setEditStoreDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditStoreDialog(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              try {
                await updateStore({ variables: { id: store.id, name: editStoreName, description: editStoreDescription } });
              } catch (error) {
                console.error('Error updating store:', error);
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openStatusConfirmDialog}
        onClose={handleCloseStatusConfirmDialog}
        aria-labelledby="status-confirm-dialog-title"
        aria-describedby="status-confirm-dialog-description"
      >
        <DialogTitle id="status-confirm-dialog-title">Confirm Order Status Change</DialogTitle>
        <DialogContent>
          <Typography id="status-confirm-dialog-description">
            Are you sure you want to confirm this status? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmStatusChange} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {editingProduct && (
        <Dialog open={openEditProductDialog} onClose={() => setOpenEditProductDialog(false)}>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Product Name"
              type="text"
              fullWidth
              value={editProductName}
              onChange={(e) => setEditProductName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Product Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={editProductDescription}
              onChange={(e) => setEditProductDescription(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={editProductPrice}
              onChange={(e) => setEditProductPrice(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Stock"
              type="number"
              fullWidth
              value={editProductStock}
              onChange={(e) => setEditProductStock(e.target.value)}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={editProductCategoryId}
                onChange={(e) => setEditProductCategoryId(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" component="label" fullWidth>
              Upload Image
              <input type="file" hidden accept="image/*" onChange={handleEditProductImageChange} />
            </Button>
            {editProductImageUrl && (
              <img src={editProductImageUrl} alt="Product" style={{ width: '100%', marginTop: '10px' }} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditProductDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateProduct}>Save</Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog
        open={openDeleteProductConfirmDialog}
        onClose={handleCloseDeleteProductConfirmDialog}
        aria-labelledby="delete-product-dialog-title"
        aria-describedby="delete-product-dialog-description"
      >
        <DialogTitle id="delete-product-dialog-title">Confirm Product Deletion</DialogTitle>
        <DialogContent>
          <Typography id="delete-product-dialog-description">
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteProductConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteProduct} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerDashboard;