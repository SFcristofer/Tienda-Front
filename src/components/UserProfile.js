import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  ME_QUERY,
  MY_ADDRESSES_QUERY,
  MY_PAYMENT_METHODS_QUERY,
  CUSTOMER_ORDERS_QUERY,
} from '../graphql/queries';
import {
  CREATE_ADDRESS,
  UPDATE_ADDRESS,
  DELETE_ADDRESS,
  CREATE_PAYMENT_METHOD,
  UPDATE_PAYMENT_METHOD,
  DELETE_PAYMENT_METHOD,
  UPDATE_USER,
  BECOME_SELLER,
  DEACTIVATE_ACCOUNT,
  DELETE_ACCOUNT,
} from '../graphql/mutations';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Chip,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const UserProfile = () => {
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery(ME_QUERY);
  const {
    data: addressesData,
    loading: addressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useQuery(MY_ADDRESSES_QUERY);
  const {
    data: paymentMethodsData,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
    refetch: refetchPaymentMethods,
  } = useQuery(MY_PAYMENT_METHODS_QUERY);
  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
  } = useQuery(CUSTOMER_ORDERS_QUERY);

  const [tabValue, setTabValue] = useState(0);
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [openPaymentMethodDialog, setOpenPaymentMethodDialog] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });
  const [openDeleteAddressConfirmDialog, setOpenDeleteAddressConfirmDialog] = useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = useState(null);
  const [openDeletePaymentMethodConfirmDialog, setOpenDeletePaymentMethodConfirmDialog] = useState(false);
  const [paymentMethodToDeleteId, setPaymentMethodToDeleteId] = useState(null);

  const handleAddressFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const [createAddress] = useMutation(CREATE_ADDRESS, {
    onCompleted: () => {
      refetchAddresses();
      setOpenAddressDialog(false);
    },
  });
  const [updateAddress] = useMutation(UPDATE_ADDRESS, {
    onCompleted: () => {
      refetchAddresses();
      setOpenAddressDialog(false);
    },
  });
  const [deleteAddress] = useMutation(DELETE_ADDRESS, { onCompleted: () => refetchAddresses() });

  const [createPaymentMethod] = useMutation(CREATE_PAYMENT_METHOD, {
    onCompleted: () => {
      refetchPaymentMethods();
      setOpenPaymentMethodDialog(false);
    },
  });
  const [updatePaymentMethod] = useMutation(UPDATE_PAYMENT_METHOD, {
    onCompleted: () => {
      refetchPaymentMethods();
      setOpenPaymentMethodDialog(false);
    },
  });
  const [deletePaymentMethod] = useMutation(DELETE_PAYMENT_METHOD, {
    onCompleted: () => refetchPaymentMethods(),
  });

  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      refetchUser();
    },
  });
  const [becomeSeller, { loading: becomeSellerLoading }] = useMutation(BECOME_SELLER, {
    onCompleted: (data) => {
      const { becomeSeller: token } = data;
      console.log('New token:', token);
      localStorage.setItem('token', token);
      window.location.reload();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error becoming seller: ${error.message}`,
        severity: 'error',
      });
      setOpenBecomeSellerConfirm(false);
    },
  });

  const [openBecomeSellerConfirm, setOpenBecomeSellerConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [deactivateAccount] = useMutation(DEACTIVATE_ACCOUNT, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Account deactivated successfully.', severity: 'success' });
      localStorage.removeItem('token'); // Clear token on deactivation
      window.location.reload(); // Reload to reflect changes
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deactivating account: ${error.message}`, severity: 'error' });
    },
  });

  const [deleteAccount] = useMutation(DELETE_ACCOUNT, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Account deleted successfully.', severity: 'success' });
      localStorage.removeItem('token'); // Clear token on deletion
      window.location.reload(); // Reload to reflect changes
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error deleting account: ${error.message}`, severity: 'error' });
    },
  });

  const [openDeactivateConfirm, setOpenDeactivateConfirm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const handleOpenBecomeSellerConfirm = () => {
    setOpenBecomeSellerConfirm(true);
  };

  const handleCloseBecomeSellerConfirm = () => {
    setOpenBecomeSellerConfirm(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDeactivateConfirm = () => {
    setOpenDeactivateConfirm(true);
  };

  const handleCloseDeactivateConfirm = () => {
    setOpenDeactivateConfirm(false);
  };

  const handleConfirmDeactivate = async () => {
    try {
      await deactivateAccount();
    } catch (err) {
      console.error('Error deactivating account:', err);
    }
  };

  const handleOpenDeleteConfirm = () => {
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAccount();
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  const user = userData?.me;
  const addresses = addressesData?.myAddresses || [];
  const paymentMethods = paymentMethodsData?.myPaymentMethods || [];
  const orders = ordersData?.customerOrders || [];

  if (userLoading || addressesLoading || paymentMethodsLoading || ordersLoading) {
    return <CircularProgress />;
  }

  if (userError) {
    return <Alert severity="error">Error loading user profile: {userError.message}</Alert>;
  }

  if (addressesError) {
    return <Alert severity="error">Error loading addresses: {addressesError.message}</Alert>;
  }

  if (paymentMethodsError) {
    return (
      <Alert severity="error">Error loading payment methods: {paymentMethodsError.message}</Alert>
    );
  }

  if (ordersError) {
    return <Alert severity="error">Error loading orders: {ordersError.message}</Alert>;
  }

  if (!user) {
    return <Alert severity="warning">User data not found. Please log in.</Alert>;
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenAddressDialog = (address = null) => {
    if (address) {
      setCurrentAddress(address);
      setAddressForm({
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || '',
        isDefault: address.isDefault || false,
      });
    } else {
      setCurrentAddress(null);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false,
      });
    }
    setOpenAddressDialog(true);
  };

  const handleCloseAddressDialog = () => {
    setOpenAddressDialog(false);
    setCurrentAddress(null);
  };

  const handleOpenPaymentMethodDialog = (paymentMethod = null) => {
    setCurrentPaymentMethod(paymentMethod);
    setOpenPaymentMethodDialog(true);
  };

  const handleClosePaymentMethodDialog = () => {
    setOpenPaymentMethodDialog(false);
    setCurrentPaymentMethod(null);
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const street = formData.get('street');
    const city = formData.get('city');
    const state = formData.get('state');
    const zipCode = formData.get('zipCode');
    const country = formData.get('country');
    const isDefault = formData.get('isDefault') === 'on';

    try {
      if (currentAddress) {
        await updateAddress({
          variables: {
            input: { id: currentAddress.id, street, city, state, zipCode, country, isDefault },
          },
        });
      } else {
        await createAddress({
          variables: { input: { street, city, state, zipCode, country, isDefault } },
        });
      }
    } catch (err) {
      console.error('Error saving address:', err);
      setSnackbar({
        open: true,
        message: `Error al guardar la dirección: ${err.message}`,
        severity: 'error',
      });
    }
  };

  const handleOpenDeleteAddressConfirmDialog = (id) => {
    setAddressToDeleteId(id);
    setOpenDeleteAddressConfirmDialog(true);
  };

  const handleCloseDeleteAddressConfirmDialog = () => {
    setOpenDeleteAddressConfirmDialog(false);
    setAddressToDeleteId(null);
  };

  const handleConfirmDeleteAddress = async () => {
    try {
      await deleteAddress({ variables: { id: addressToDeleteId } });
      handleCloseDeleteAddressConfirmDialog();
    } catch (err) {
      console.error('Error deleting address:', err);
      setSnackbar({
        open: true,
        message: `Error al eliminar la dirección: ${err.message}`,
        severity: 'error',
      });
      handleCloseDeleteAddressConfirmDialog();
    }
  };

  const handleDeleteAddress = async (id) => {
    handleOpenDeleteAddressConfirmDialog(id);
  };

  const handleSavePaymentMethod = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const cardType = formData.get('cardType');
    const lastFour = formData.get('lastFour');
    const expirationMonth = parseInt(formData.get('expirationMonth'));
    const expirationYear = parseInt(formData.get('expirationYear'));
    const isDefault = formData.get('isDefault') === 'on';

    try {
      if (currentPaymentMethod) {
        await updatePaymentMethod({
          variables: { input: { id: currentPaymentMethod.id, isDefault } },
        });
      } else {
        await createPaymentMethod({
          variables: { input: { cardType, lastFour, expirationMonth, expirationYear, isDefault } },
        });
      }
    } catch (err) {
      console.error('Error saving payment method:', err);
      setSnackbar({
        open: true,
        message: `Error al guardar el método de pago: ${err.message}`,
        severity: 'error',
      });
    }
  };

  const handleOpenDeletePaymentMethodConfirmDialog = (id) => {
    setPaymentMethodToDeleteId(id);
    setOpenDeletePaymentMethodConfirmDialog(true);
  };

  const handleCloseDeletePaymentMethodConfirmDialog = () => {
    setOpenDeletePaymentMethodConfirmDialog(false);
    setPaymentMethodToDeleteId(null);
  };

  const handleConfirmDeletePaymentMethod = async () => {
    try {
      await deletePaymentMethod({ variables: { id: paymentMethodToDeleteId } });
      handleCloseDeletePaymentMethodConfirmDialog();
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setSnackbar({
        open: true,
        message: `Error al eliminar el método de pago: ${err.message}`,
        severity: 'error',
      });
      handleCloseDeletePaymentMethodConfirmDialog();
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    handleOpenDeletePaymentMethodConfirmDialog(id);
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    if (!user || !user.id) {
      setSnackbar({
        open: true,
        message: 'Datos de usuario no disponibles. Por favor, inicie sesión.',
        severity: 'error',
      });
      return;
    }
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');

    try {
      await updateUser({ variables: { id: user.id, name, email } });
      setSnackbar({
        open: true,
        message: 'Perfil actualizado correctamente!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: `Error al actualizar el perfil: ${err.message}`,
        severity: 'error',
      });
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!user || !user.id) {
      setSnackbar({
        open: true,
        message: 'Datos de usuario no disponibles. Por favor, inicie sesión.',
        severity: 'error',
      });
      return;
    }
    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get('newPassword');
    const confirmNewPassword = formData.get('confirmNewPassword');

    if (newPassword !== confirmNewPassword) {
      setSnackbar({
        open: true,
        message: 'La nueva contraseña y la confirmación no coinciden.',
        severity: 'error',
      });
      return;
    }

    try {
      await updateUser({ variables: { id: user.id, password: newPassword } });
      setSnackbar({
        open: true,
        message: 'Contraseña actualizada correctamente!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setSnackbar({
        open: true,
        message: `Error al cambiar la contraseña: ${err.message}`,
        severity: 'error',
      });
    }
  };

  const handleBecomeSeller = async () => {
    if (!user || !user.id) {
      setSnackbar({
        open: true,
        message: 'User data not available. Please log in.',
        severity: 'error',
      });
      return;
    }
    // La confirmación se maneja a través del diálogo, no aquí directamente
    try {
      await becomeSeller();
    } catch (err) {
      console.error('Error becoming seller:', err);
      // El onError del useMutation ya maneja el snackbar
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Profile
        </Typography>
        <Typography variant="h6">Name: {user.name}</Typography>
        <Typography variant="h6">Role: {user.role}</Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile sections tabs">
            <Tab label="Personal Info" />
            <Tab label="Addresses" />
            <Tab label="Payment Methods" />
            <Tab label="My Orders" />
            {user.role === 'seller' && <Tab label="Gestión de Tienda" />}
            {user.role !== 'seller' && <Tab label="Become a Seller" />}
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Personal Information
            </Typography>
            <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Name"
                name="name"
                defaultValue={user.name}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                defaultValue={user.email}
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Update Profile
              </Button>
            </Box>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Change Password
            </Typography>
            <Box component="form" onSubmit={handleChangePassword} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirm New Password"
                name="confirmNewPassword"
                type="password"
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Change Password
              </Button>
            </Box>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Account Management
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleOpenDeactivateConfirm}
              >
                Deactivate Account
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleOpenDeleteConfirm}
              >
                Delete Account
              </Button>
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              My Addresses
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAddressDialog()}
            >
              Add New Address
            </Button>
            <List>
              {addresses.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No addresses found." />
                </ListItem>
              ) : (
                addresses.map((address) => (
                  <ListItem
                    key={address.id}
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenAddressDialog(address)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={`${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`}
                      secondary={
                        address.isDefault ? (
                          <Chip
                            label="Default Address"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        ) : null
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Payment Methods
            </Typography>
            <Typography variant="body1" gutterBottom>
              Electronic payment methods are coming soon! We are working to integrate secure and
              convenient payment options to enhance your shopping experience.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stay tuned for updates!
            </Typography>
          </Box>
        )}

        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              My Orders
            </Typography>
            <List>
              {orders.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No orders found." />
                </ListItem>
              ) : (
                orders.map((order) => (
                  <ListItem
                    key={order.id}
                    divider
                    secondaryAction={
                      <Button component={Link} to={`/order-confirmation/${order.id}`} size="small">
                        View/Download Receipt
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          Order ID: {order.id} - Total: ${order.totalAmount.toFixed(2)}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2">Status:</Typography>
                            <Chip
                              label={order.status}
                              color={
                                order.status === 'delivered'
                                  ? 'success'
                                  : order.status === 'shipped'
                                    ? 'info'
                                    : order.status === 'processing'
                                      ? 'warning'
                                      : order.status === 'cancelled'
                                        ? 'error'
                                        : 'default'
                              }
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2">
                            Delivery Address: {order.deliveryAddress}
                          </Typography>
                          <Typography variant="body2">Store: {order.store.name}</Typography>
                          <Typography variant="body2">
                            Date: {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2">Items:</Typography>
                            <List dense>
                              {order.items.map((item) => (
                                <ListItem key={item.id}>
                                  <ListItemText
                                    primary={`${item.product.name} x ${item.quantity}`}
                                    secondary={`${item.priceAtOrder.toFixed(2)} each`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        )}

        {tabValue === 4 && user.role === 'seller' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Gestión de Tienda
            </Typography>
            <Typography variant="body1" gutterBottom>
              Manage your store, products, and orders from your seller dashboard.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/seller-dashboard"
              sx={{ mt: 2 }}
            >
              Go to Seller Dashboard
            </Button>
          </Box>
        )}

        {tabValue === 4 && user.role !== 'seller' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Become a Seller
            </Typography>
            <Typography variant="body1" gutterBottom>
              Are you interested in selling your products on our platform? Click the button below to
              become a seller and start managing your own store!
            </Typography>
            {console.log('becomeSellerLoading:', becomeSellerLoading)}
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenBecomeSellerConfirm}
              sx={{ mt: 2 }}
              disabled={becomeSellerLoading}
            >
              {becomeSellerLoading ? <CircularProgress size={24} /> : 'Become a Seller'}
            </Button>
          </Box>
        )}

        <Dialog
          open={openBecomeSellerConfirm}
          onClose={handleCloseBecomeSellerConfirm}
          aria-labelledby="become-seller-dialog-title"
          aria-describedby="become-seller-dialog-description"
        >
          <DialogTitle id="become-seller-dialog-title">Confirm Action</DialogTitle>
          <DialogContent>
            <Typography id="become-seller-dialog-description">
              Are you sure you want to become a seller? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBecomeSellerConfirm} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleBecomeSeller}
              color="primary"
              autoFocus
              disabled={becomeSellerLoading}
            >
              {becomeSellerLoading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Deactivate Account Dialog */}
        <Dialog
          open={openDeactivateConfirm}
          onClose={handleCloseDeactivateConfirm}
          aria-labelledby="deactivate-account-dialog-title"
          aria-describedby="deactivate-account-dialog-description"
        >
          <DialogTitle id="deactivate-account-dialog-title">Confirm Account Deactivation</DialogTitle>
          <DialogContent>
            <Typography id="deactivate-account-dialog-description">
              Are you sure you want to deactivate your account? You will not be able to log in until it is reactivated by an administrator.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeactivateConfirm} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDeactivate} color="warning" autoFocus>
              Deactivate
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog
          open={openDeleteConfirm}
          onClose={handleCloseDeleteConfirm}
          aria-labelledby="delete-account-dialog-title"
          aria-describedby="delete-account-dialog-description"
        >
          <DialogTitle id="delete-account-dialog-title">Confirm Account Deletion</DialogTitle>
          <DialogContent>
            <Typography id="delete-account-dialog-description">
              Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteConfirm} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Address Dialog */}
        <Dialog
          open={openDeleteAddressConfirmDialog}
          onClose={handleCloseDeleteAddressConfirmDialog}
          aria-labelledby="delete-address-dialog-title"
          aria-describedby="delete-address-dialog-description"
        >
          <DialogTitle id="delete-address-dialog-title">Confirm Address Deletion</DialogTitle>
          <DialogContent>
            <Typography id="delete-address-dialog-description">
              Are you sure you want to delete this address? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteAddressConfirmDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDeleteAddress} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Address Dialog */}
        <Dialog open={openAddressDialog} onClose={handleCloseAddressDialog}>
          <DialogTitle>{currentAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSaveAddress} id="address-form" sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Street"
                name="street"
                value={addressForm.street}
                onChange={handleAddressFormChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="City"
                name="city"
                value={addressForm.city}
                onChange={handleAddressFormChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="State"
                name="state"
                value={addressForm.state}
                onChange={handleAddressFormChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Zip Code"
                name="zipCode"
                value={addressForm.zipCode}
                onChange={handleAddressFormChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Country"
                name="country"
                value={addressForm.country}
                onChange={handleAddressFormChange}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressFormChange}
                  />
                }
                label="Set as Default"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddressDialog}>Cancel</Button>
            <Button type="submit" form="address-form" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Method Dialog */}
        <Dialog open={openPaymentMethodDialog} onClose={handleClosePaymentMethodDialog}>
          <DialogTitle>
            {currentPaymentMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
          </DialogTitle>
          <DialogContent>
            <Box
              component="form"
              onSubmit={handleSavePaymentMethod}
              id="payment-method-form"
              sx={{ mt: 2 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                label="Card Type"
                name="cardType"
                defaultValue={currentPaymentMethod?.cardType || ''}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Last Four Digits"
                name="lastFour"
                inputProps={{ maxLength: 4 }}
                defaultValue={currentPaymentMethod?.lastFour || ''}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Expiration Month (MM)"
                    name="expirationMonth"
                    type="number"
                    inputProps={{ min: 1, max: 12 }}
                    defaultValue={currentPaymentMethod?.expirationMonth || ''}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Expiration Year (YYYY)"
                    name="expirationYear"
                    type="number"
                    inputProps={{ min: new Date().getFullYear() }}
                    defaultValue={currentPaymentMethod?.expirationYear || ''}
                  />
                </Grid>
              </Grid>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isDefault"
                    defaultChecked={currentPaymentMethod?.isDefault || false}
                  />
                }
                label="Set as Default"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentMethodDialog}>Cancel</Button>
            <Button type="submit" form="payment-method-form" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Payment Method Dialog */}
        <Dialog
          open={openDeletePaymentMethodConfirmDialog}
          onClose={handleCloseDeletePaymentMethodConfirmDialog}
          aria-labelledby="delete-payment-method-dialog-title"
          aria-describedby="delete-payment-method-dialog-description"
        >
          <DialogTitle id="delete-payment-method-dialog-title">Confirm Payment Method Deletion</DialogTitle>
          <DialogContent>
            <Typography id="delete-payment-method-dialog-description">
              Are you sure you want to delete this payment method? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeletePaymentMethodConfirmDialog} color="primary">
              Cancel
          </Button>
            <Button onClick={handleConfirmDeletePaymentMethod} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UserProfile;
