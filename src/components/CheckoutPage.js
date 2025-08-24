import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_ORDER, CREATE_ADDRESS } from '../graphql/mutations';
import { MY_ADDRESSES_QUERY } from '../graphql/queries';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { getGroupedCartItemsByStore, clearCart, removePurchasedItems } = useCart();
  const { data: addressesData, loading: addressesLoading, error: addressesError, refetch: refetchAddresses } = useQuery(MY_ADDRESSES_QUERY);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [openAddressDialog, setOpenAddressDialog] = useState(false);

  const [createOrder, { loading: createOrderLoading, error: createOrderError }] = useMutation(CREATE_ORDER);
  const [createAddress] = useMutation(CREATE_ADDRESS, {
    onCompleted: () => {
      refetchAddresses();
      setOpenAddressDialog(false);
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const storeId = queryParams.get('storeId');

  const currentCart = useMemo(() => {
    const allCarts = getGroupedCartItemsByStore();
    return allCarts.find((cart) => cart.store.id === storeId);
  }, [getGroupedCartItemsByStore, storeId]);

  if (addressesLoading) return <CircularProgress />;
  if (addressesError) return <Alert severity="error">{t('errorLoadingAddresses', { message: addressesError.message })}</Alert>;

  const addresses = addressesData?.myAddresses || [];

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert(t('selectDeliveryAddress'));
      return;
    }
    if (!currentCart || currentCart.items.length === 0) {
      alert(t('cartEmpty'));
      return;
    }

    console.log('--- CheckoutPage Debug ---');
    console.log('storeId from URL:', storeId);
    console.log('currentCart object:', currentCart);
    console.log('Items being sent to createOrder:');
    currentCart.items.forEach(item => {
      console.log(`  - Product: ${item.product.name} (ID: ${item.product.id}), Store ID: ${item.product.store?.id}`);
    });
    console.log('--------------------------');

    try {
      const { data } = await createOrder({
        variables: {
          input: {
            storeId: currentCart.store.id,
            addressId: selectedAddressId,
            items: currentCart.items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              priceAtOrder: item.product.price,
            })),
          },
        },
      });
      const orderId = data.createOrder.id;
      const purchasedProductIds = currentCart.items.map(item => item.product.id);
      removePurchasedItems(purchasedProductIds); // Use new function
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      // Error is already handled by the 'createOrderError' state from useMutation
      console.error('Error placing order:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>{t('checkout')}</Typography>

      {!currentCart ? (
        <Alert severity="warning">{t('checkoutCartEmptyOrInvalid')}</Alert>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}><strong>{t('directDealModel')}:</strong> {t('directDealNotice')}</Alert>
          <Typography variant="h5" gutterBottom>{t('orderSummary')}</Typography>
          <Box key={currentCart.store.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Typography variant="h6">{t('store')}: {currentCart.store.name}</Typography>
            <List dense>
              {currentCart.items.map((item) => (
                <Typography key={item.product.id}>{item.quantity} x {item.product.name} - ${item.product.price.toFixed(2)}</Typography>
              ))}
            </List>
          </Box>
          <Typography variant="h5" sx={{ mt: 2 }}>{t('total')}: ${currentCart.totalAmount.toFixed(2)}</Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>{t('deliveryInformation')}</Typography>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="address-select-label">{t('deliveryAddress')}</InputLabel>
              <Select labelId="address-select-label" value={selectedAddressId} label={t('deliveryAddress')} onChange={(e) => setSelectedAddressId(e.target.value)}>
                {addresses.length === 0 ? (
                  <MenuItem value="" disabled>{t('noAddressesFound')}</MenuItem>
                ) : (
                  addresses.map((address) => (
                    <MenuItem key={address.id} value={address.id}>{`${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country} - ${address.phoneNumber}`}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpenAddressDialog(true)}>{t('addNewAddress')}</Button>
          </Box>

          {createOrderError && <Alert severity="error" sx={{ mt: 2 }}>{t('errorPlacingOrder', { message: createOrderError.message })}</Alert>}

          <Button variant="contained" color="secondary" fullWidth sx={{ mt: 4 }} onClick={handlePlaceOrder} disabled={createOrderLoading || !currentCart || addresses.length === 0 || !selectedAddressId}>
            {createOrderLoading ? t('placingOrder') : t('placeOrder')}
          </Button>
        </Paper>
      )}

      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)}>
        <DialogTitle>{t('addNewAddress')}</DialogTitle>
        <DialogContent>
          <Box component="form" id="new-address-form" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const street = formData.get('street');
            const city = formData.get('city');
            const state = formData.get('state');
            const zipCode = formData.get('zipCode');
            const country = formData.get('country');
            const phoneNumber = formData.get('phoneNumber');
            const isDefault = formData.get('isDefault') === 'on';
            try {
              await createAddress({ variables: { input: { street, city, state, zipCode, country, phoneNumber, isDefault } } });
              setOpenAddressDialog(false);
            } catch (err) {
              alert(`${t('errorCreatingAddress')}: ${err.message}`);
            }
          }}>
            <TextField margin="normal" required fullWidth label={t('street')} name="street" />
            <TextField margin="normal" required fullWidth label={t('city')} name="city" />
            <TextField margin="normal" required fullWidth label={t('state')} name="state" />
            <TextField margin="normal" required fullWidth label={t('zipCode')} name="zipCode" />
            <TextField margin="normal" required fullWidth label={t('country')} name="country" />
            <TextField margin="normal" required fullWidth label={t('phoneNumber')} name="phoneNumber" />
            <FormControlLabel control={<Checkbox name="isDefault" />} label={t('setAsDefault')} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddressDialog(false)}>{t('cancel')}</Button>
          <Button type="submit" form="new-address-form" variant="contained">{t('saveAddress')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;