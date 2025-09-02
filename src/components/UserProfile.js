import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
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
import OrderHistory from './OrderHistory'; // Import OrderHistory

const UserProfile = () => {
  const { t } = useTranslation();
  const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useQuery(ME_QUERY);
  const { data: addressesData, loading: addressesLoading, error: addressesError, refetch: refetchAddresses } = useQuery(MY_ADDRESSES_QUERY);
  const { data: paymentMethodsData, loading: paymentMethodsLoading, error: paymentMethodsError, refetch: refetchPaymentMethods } = useQuery(MY_PAYMENT_METHODS_QUERY);

  const [tabValue, setTabValue] = useState(0);
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zipCode: '', country: '', phoneNumber: '', isDefault: false });
  const [openDeleteAddressConfirmDialog, setOpenDeleteAddressConfirmDialog] = useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = useState(null);

  const [createAddress] = useMutation(CREATE_ADDRESS, { onCompleted: () => { refetchAddresses(); setOpenAddressDialog(false); } });
  const [updateAddress] = useMutation(UPDATE_ADDRESS, { onCompleted: () => { refetchAddresses(); setOpenAddressDialog(false); } });
  const [deleteAddress] = useMutation(DELETE_ADDRESS, { onCompleted: () => refetchAddresses() });

  const [updateUser] = useMutation(UPDATE_USER, { onCompleted: () => refetchUser() });
  const [becomeSeller, { loading: becomeSellerLoading }] = useMutation(BECOME_SELLER, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.becomeSeller);
      window.location.reload();
    },
    onError: (error) => setSnackbar({ open: true, message: `${t('errorBecomingSeller')}: ${error.message}`, severity: 'error' }),
  });

  const [deactivateAccount] = useMutation(DEACTIVATE_ACCOUNT, {
    onCompleted: () => {
      localStorage.removeItem('token');
      window.location.reload();
    },
    onError: (error) => setSnackbar({ open: true, message: `${t('errorDeactivating')}: ${error.message}`, severity: 'error' }),
  });

  const [deleteAccount] = useMutation(DELETE_ACCOUNT, {
    onCompleted: () => {
      localStorage.removeItem('token');
      window.location.reload();
    },
    onError: (error) => setSnackbar({ open: true, message: `${t('errorDeleting')}: ${error.message}`, severity: 'error' }),
  });

  const [openBecomeSellerConfirm, setOpenBecomeSellerConfirm] = useState(false);
  const [openDeactivateConfirm, setOpenDeactivateConfirm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const user = userData?.me;
  const addresses = addressesData?.myAddresses || [];

  if (userLoading || addressesLoading || paymentMethodsLoading) return <CircularProgress />;
  if (userError) return <Alert severity="error">{t('errorLoadingProfile', { message: userError.message })}</Alert>;
  if (addressesError) return <Alert severity="error">{t('errorLoadingAddresses', { message: addressesError.message })}</Alert>;
  if (paymentMethodsError) return <Alert severity="error">{t('errorLoadingPayments', { message: paymentMethodsError.message })}</Alert>;
  if (!user) return <Alert severity="warning">{t('userNotFound')}</Alert>;

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleOpenAddressDialog = (address = null) => {
    setCurrentAddress(address);
    // If new address, pre-fill phone number from user profile
    setAddressForm(address ? { ...address } : { street: '', city: '', state: '', zipCode: '', country: '', phoneNumber: user.phoneNumber || '', isDefault: false });
    setOpenAddressDialog(true);
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();
    try {
      if (currentAddress) {
        await updateAddress({ variables: { input: { id: currentAddress.id, ...addressForm } } });
      } else {
        await createAddress({ variables: { input: addressForm } });
      }
    } catch (err) {
      setSnackbar({ open: true, message: `${t('errorSavingAddress')}: ${err.message}`, severity: 'error' });
    }
  };

  const handleDeleteAddress = async () => {
    try {
      await deleteAddress({ variables: { id: addressToDeleteId } });
      setOpenDeleteAddressConfirmDialog(false);
    } catch (err) {
      setSnackbar({ open: true, message: `${t('errorDeletingAddress')}: ${err.message}`, severity: 'error' });
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name');
    const phoneNumber = formData.get('phoneNumber');
    try {
      await updateUser({ variables: { name, phoneNumber } });
      setSnackbar({ open: true, message: t('profileUpdated'), severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: `${t('errorUpdatingProfile')}: ${err.message}`, severity: 'error' });
    }
  };

  const handleNumericInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    setAddressForm({ ...addressForm, [name]: sanitizedValue });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>{t('userProfile')}</Typography>
        <Typography variant="h6">{t('name')}: {user.name}</Typography>
                {user.role !== 'customer' && <Typography variant="h6">{t('role')}: {user.role}</Typography>}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile sections tabs">
            <Tab label={t('personalInfo')} />
            <Tab label={t('addresses')} />
            <Tab label={t('paymentMethods')} />
            <Tab label={t('myOrders')} />
            {user.role === 'seller' ? <Tab label={t('storeManagement')} /> : <Tab label={t('becomeASeller')} />}
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{t('personalInfo')}</Typography>
            <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 2 }}>
              <TextField margin="normal" required fullWidth label={t('name')} name="name" defaultValue={user.name} />
              <TextField margin="normal" required fullWidth label={t('emailAddress')} name="email" type="email" defaultValue={user.email} disabled />
              <TextField margin="normal" fullWidth label={t('phoneNumber')} name="phoneNumber" defaultValue={user.phoneNumber || ''} onChange={handleNumericInputChange} />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>{t('updateProfile')}</Button>
            </Box>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>{t('accountManagement')}</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="outlined" color="warning" onClick={() => setOpenDeactivateConfirm(true)}>{t('deactivateAccount')}</Button>
              <Button variant="outlined" color="error" onClick={() => setOpenDeleteConfirm(true)}>{t('deleteAccount')}</Button>
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{t('myAddresses')}</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenAddressDialog()}>{t('addNewAddress')}</Button>
            <List>
              {addresses.length === 0 ? <ListItem><ListItemText primary={t('noAddressesFound')} /></ListItem> : addresses.map((address) => (
                <ListItem key={address.id} secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label={t('edit')} onClick={() => handleOpenAddressDialog(address)}><EditIcon /></IconButton>
                    <IconButton edge="end" aria-label={t('delete')} onClick={() => { setAddressToDeleteId(address.id); setOpenDeleteAddressConfirmDialog(true); }}><DeleteIcon /></IconButton>
                  </Box>
                }>
                  <ListItemText primary={`${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`} secondary={address.isDefault ? <Chip label={t('default')} size="small" color="primary" /> : null} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{t('paymentMethods')}</Typography>
            <Typography variant="body1" gutterBottom>{t('paymentsComingSoon')}</Typography>
            <Typography variant="body2" color="text.secondary">{t('stayTuned')}</Typography>
          </Box>
        )}

        {tabValue === 3 && <OrderHistory />}

        {tabValue === 4 && (user.role === 'seller' ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{t('storeManagement')}</Typography>
            <Typography variant="body1" gutterBottom>{t('manageStorePrompt')}</Typography>
            <Button variant="contained" color="primary" component={Link} to="/dashboard" sx={{ mt: 2 }}>{t('goToSellerDashboard')}</Button>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{t('becomeASeller')}</Typography>
            <Typography variant="body1" gutterBottom>{t('becomeSellerPrompt')}</Typography>
            <Button variant="contained" color="primary" onClick={() => setOpenBecomeSellerConfirm(true)} sx={{ mt: 2 }} disabled={becomeSellerLoading}>
              {becomeSellerLoading ? <CircularProgress size={24} /> : t('becomeASeller')}
            </Button>
          </Box>
        ))}

        <Dialog open={openBecomeSellerConfirm} onClose={() => setOpenBecomeSellerConfirm(false)}><DialogTitle>{t('confirmAction')}</DialogTitle><DialogContent><Typography>{t('confirmBecomeSeller')}</Typography></DialogContent><DialogActions><Button onClick={() => setOpenBecomeSellerConfirm(false)}>{t('cancel')}</Button><Button onClick={() => becomeSeller()} color="primary" autoFocus disabled={becomeSellerLoading}>{becomeSellerLoading ? <CircularProgress size={24} /> : t('confirm')}</Button></DialogActions></Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert></Snackbar>
        <Dialog open={openDeactivateConfirm} onClose={() => setOpenDeactivateConfirm(false)}><DialogTitle>{t('confirmDeactivateTitle')}</DialogTitle><DialogContent><Typography>{t('confirmDeactivate')}</Typography></DialogContent><DialogActions><Button onClick={() => setOpenDeactivateConfirm(false)}>{t('cancel')}</Button><Button onClick={() => deactivateAccount()} color="warning" autoFocus>{t('deactivate')}</Button></DialogActions></Dialog>
        <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}><DialogTitle>{t('confirmDeleteTitle')}</DialogTitle><DialogContent><Typography>{t('confirmDelete')}</Typography></DialogContent><DialogActions><Button onClick={() => setOpenDeleteConfirm(false)}>{t('cancel')}</Button><Button onClick={() => deleteAccount()} color="error" autoFocus>{t('delete')}</Button></DialogActions></Dialog>
        <Dialog open={openDeleteAddressConfirmDialog} onClose={() => setOpenDeleteAddressConfirmDialog(false)}><DialogTitle>{t('confirmDeleteAddressTitle')}</DialogTitle><DialogContent><Typography>{t('confirmDeleteAddress')}</Typography></DialogContent><DialogActions><Button onClick={() => setOpenDeleteAddressConfirmDialog(false)}>{t('cancel')}</Button><Button onClick={handleDeleteAddress} color="error" autoFocus>{t('delete')}</Button></DialogActions></Dialog>
        <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)}><DialogTitle>{currentAddress ? t('editAddress') : t('addNewAddress')}</DialogTitle><DialogContent><Box component="form" onSubmit={handleSaveAddress} id="address-form" sx={{ mt: 2 }}><TextField margin="normal" required fullWidth label={t('street')} name="street" value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} /><TextField margin="normal" required fullWidth label={t('city')} name="city" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} /><TextField margin="normal" required fullWidth label={t('state')} name="state" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} /><TextField margin="normal" required fullWidth label={t('zipCode')} name="zipCode" value={addressForm.zipCode} onChange={handleNumericInputChange} /><TextField margin="normal" required fullWidth label={t('country')} name="country" value={addressForm.country} onChange={(e) => setAddressForm({...addressForm, country: e.target.value})} /><TextField margin="normal" required fullWidth label={t('phoneNumber')} name="phoneNumber" value={addressForm.phoneNumber || ''} onChange={handleNumericInputChange} /><FormControlLabel control={<Checkbox name="isDefault" checked={addressForm.isDefault} onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})} />} label={t('setAsDefault')} /></Box></DialogContent><DialogActions><Button onClick={() => setOpenAddressDialog(false)}>{t('cancel')}</Button><Button type="submit" form="address-form" variant="contained">{t('save')}</Button></DialogActions></Dialog>
      </Paper>
    </Box>
  );
};

export default UserProfile;
