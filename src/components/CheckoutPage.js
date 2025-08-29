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
  const { getGroupedCartItemsByStore, removePurchasedItems } = useCart();
  const { data: addressesData, loading: addressesLoading, error: addressesError, refetch: refetchAddresses } = useQuery(MY_ADDRESSES_QUERY);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zipCode: '', country: '', phoneNumber: '', isDefault: false });

  const [createOrder, { loading: createOrderLoading, error: createOrderError }] = useMutation(CREATE_ORDER);
  const [createAddress] = useMutation(CREATE_ADDRESS, {
    onCompleted: () => {
      refetchAddresses();
      setOpenAddressDialog(false);
    },
  });

  const navigate = useNavigate();
  const location = useLocation();

  const checkoutData = useMemo(() => {
    const { product: buyNowProduct } = location.state || {};

    if (buyNowProduct) {
      // Flow: Buy Now
      return {
        isBuyNow: true,
        store: buyNowProduct.store,
        items: [{ product: buyNowProduct, quantity: 1 }],
        totalAmount: buyNowProduct.price,
      };
    } else {
      // Flow: Checkout from Cart
      const queryParams = new URLSearchParams(location.search);
      const storeId = queryParams.get('storeId');
      const allCarts = getGroupedCartItemsByStore();
      const cartForStore = allCarts.find((cart) => cart.store.id === storeId);
      return {
        isBuyNow: false,
        ...cartForStore,
      };
    }
  }, [location.state, location.search, getGroupedCartItemsByStore]);

  if (addressesLoading) return <CircularProgress />;
  if (addressesError) return <Alert severity="error">{t('errorLoadingAddresses', { message: addressesError.message })}</Alert>;

  const addresses = addressesData?.myAddresses || [];

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert(t('selectDeliveryAddress'));
      return;
    }
    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
      alert(t('cartEmpty'));
      return;
    }

    try {
      const { data } = await createOrder({
        variables: {
          input: {
            storeId: checkoutData.store.id,
            addressId: selectedAddressId,
            items: checkoutData.items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              priceAtOrder: item.product.price,
            })),
          },
        },
      });
      
      const orderId = data.createOrder.id;

      // Only remove items from cart if it's not a "Buy Now" flow
      if (!checkoutData.isBuyNow) {
        const purchasedProductIds = checkoutData.items.map(item => item.product.id);
        removePurchasedItems(purchasedProductIds);
      }

      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      console.error('Error placing order:', err);
    }
  };

  const handleNumericInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    setAddressForm({ ...addressForm, [name]: sanitizedValue });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>{t('checkout')}</Typography>

      {!checkoutData || !checkoutData.items || checkoutData.items.length === 0 ? (
        <Alert severity="warning">{t('checkoutCartEmptyOrInvalid')}</Alert>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>{t('directDealNotice')}</Alert>
          <Typography variant="h5" gutterBottom>{t('orderSummary')}</Typography>
          <Box key={checkoutData.store.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Typography variant="h6">{t('store')}: {checkoutData.store.name}</Typography>
            <List dense>
              {checkoutData.items.map((item) => (
                <Typography key={item.product.id}>{item.quantity} x {item.product.name} - ${item.product.price.toFixed(2)}</Typography>
              ))}
            </List>
          </Box>
          <Typography variant="h5" sx={{ mt: 2 }}>{t('total')}: ${checkoutData.totalAmount.toFixed(2)}</Typography>

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

          <Button variant="contained" color="secondary" fullWidth sx={{ mt: 4 }} onClick={handlePlaceOrder} disabled={createOrderLoading || !checkoutData || addresses.length === 0 || !selectedAddressId}>
            {createOrderLoading ? t('placingOrder') : t('placeOrder')}
          </Button>
        </Paper>
      )}

      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)}>
        <DialogTitle>{t('addNewAddress')}</DialogTitle>
        <DialogContent>
          <Box component="form" id="new-address-form" onSubmit={async (e) => {
            e.preventDefault();
            try {
              await createAddress({ variables: { input: addressForm } });
              setOpenAddressDialog(false);
            } catch (err) {
              alert(`${t('errorCreatingAddress')}: ${err.message}`);
            }
          }}>
            <TextField margin="normal" required fullWidth label={t('street')} name="street" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
            <TextField margin="normal" required fullWidth label={t('city')} name="city" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
            <TextField margin="normal" required fullWidth label={t('state')} name="state" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
            <TextField margin="normal" required fullWidth label={t('zipCode')} name="zipCode" value={addressForm.zipCode} onChange={handleNumericInputChange} />
            <TextField margin="normal" required fullWidth label={t('country')} name="country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} />
            <TextField margin="normal" required fullWidth label={t('phoneNumber')} name="phoneNumber" value={addressForm.phoneNumber} onChange={handleNumericInputChange} />
            <FormControlLabel control={<Checkbox name="isDefault" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />} label={t('setAsDefault')} />
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