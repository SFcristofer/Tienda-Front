import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useMutation, useApolloClient, useQuery } from '@apollo/client';
import { CREATE_ORDER, CREATE_ADDRESS } from '../graphql/mutations';
import { ME_QUERY, MY_ADDRESSES_QUERY } from '../graphql/queries';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart, getGroupedCartItemsByStore } = useCart();
  const {
    data: addressesData,
    loading: addressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useQuery(MY_ADDRESSES_QUERY);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [openAddressDialog, setOpenAddressDialog] = useState(false);

  const [createOrder, { loading: createOrderLoading, error: createOrderError }] =
    useMutation(CREATE_ORDER);
  const [createAddress] = useMutation(CREATE_ADDRESS, {
    onCompleted: () => {
      refetchAddresses();
      setOpenAddressDialog(false);
    },
  });

  const navigate = useNavigate();
  const client = useApolloClient();

  if (addressesLoading) return <CircularProgress />;
  if (addressesError)
    return <Alert severity="error">Error loading addresses: {addressesError.message}</Alert>;

  const addresses = addressesData?.myAddresses || [];

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const groupedItems = getGroupedCartItemsByStore();
    let allOrdersSuccessful = true;
    let lastOrderId = null;

    for (const group of groupedItems) {
      console.log(`Attempting to place order for store group: ${group.store.name} (ID: ${group.store.id})`);
      group.items.forEach(item => {
        console.log(`  Item: ${item.product.name}, Product ID: ${item.product.id}, Product Store ID: ${item.product.store.id}`);
      });
      try {
        const { data } = await createOrder({
          variables: {
            input: {
              storeId: group.store.id,
              addressId: selectedAddressId,
              items: group.items.map(item => ({ productId: item.product.id, quantity: item.quantity, priceAtOrder: item.product.price })),
            },
          },
        });
        lastOrderId = data.createOrder.id;
        console.log(`Order placed for store ${group.store.name}:`, data.createOrder);
      } catch (err) {
        console.error(`Error placing order for store ${group.store.name}:`, err);
        alert(`Error placing order for store ${group.store.name}: ${err.message}`);
        allOrdersSuccessful = false;
        break;
      }
    }

    if (allOrdersSuccessful) {
      clearCart();
      await client.refetchQueries({ include: [ME_QUERY] });
      alert('All orders placed successfully!');
      // Navigate to the confirmation page of the last order created
      if(lastOrderId) {
        navigate(`/order-confirmation/${lastOrderId}`);
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {cartItems.length === 0 ? (
        <Alert severity="warning">
          Your cart is empty. Please add items to proceed to checkout.
        </Alert>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Direct Deal Model:</strong> To build trust and offer flexibility, payments are handled directly with the seller after order confirmation. The seller will contact you to arrange payment and delivery.
          </Alert>

          <Typography variant="h5" gutterBottom>
            Order Summary
          </Typography>
          {getGroupedCartItemsByStore().map((group) => (
            <Box
              key={group.store.id}
              sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}
            >
              <Typography variant="h6">Store: {group.store.name}</Typography>
              <List dense>
                {group.items.map((item) => (
                  <Typography key={item.product.id}>
                    {item.quantity} x {item.product.name} - ${item.product.price.toFixed(2)}
                  </Typography>
                ))}
              </List>
              <Typography variant="body1" fontWeight="bold">
                Store Total: ${group.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          ))}
          <Typography variant="h5" sx={{ mt: 2 }}>
            Overall Total: ${getTotalPrice()}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Delivery Information
            </Typography>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="address-select-label">Delivery Address</InputLabel>
              <Select
                labelId="address-select-label"
                value={selectedAddressId}
                label="Delivery Address"
                onChange={(e) => setSelectedAddressId(e.target.value)}
              >
                {addresses.length === 0 ? (
                  <MenuItem value="" disabled>
                    No addresses found. Please add one in your profile.
                  </MenuItem>
                ) : (
                  addresses.map((address) => (
                    <MenuItem key={address.id} value={address.id}>
                      {`${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpenAddressDialog(true)}>
              Add New Address
            </Button>
          </Box>

          {createOrderError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createOrderError?.message}
            </Alert>
          )}

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 4 }}
            onClick={handlePlaceOrder}
            disabled={createOrderLoading || cartItems.length === 0 || addresses.length === 0 || !selectedAddressId}
          >
            {createOrderLoading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </Box>
      )}

      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)}>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="new-address-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const street = formData.get('street');
              const city = formData.get('city');
              const state = formData.get('state');
              const zipCode = formData.get('zipCode');
              const country = formData.get('country');
              const isDefault = formData.get('isDefault') === 'on';

              try {
                await createAddress({
                  variables: { input: { street, city, state, zipCode, country, isDefault } },
                });
                setOpenAddressDialog(false);
              } catch (err) {
                console.error('Error creating address:', err);
                alert(`Error creating address: ${err.message}`);
              }
            }}
          >
            <TextField margin="normal" required fullWidth label="Street" name="street" />
            <TextField margin="normal" required fullWidth label="City" name="city" />
            <TextField margin="normal" required fullWidth label="State" name="state" />
            <TextField margin="normal" required fullWidth label="Zip Code" name="zipCode" />
            <TextField margin="normal" required fullWidth label="Country" name="country" />
            <FormControlLabel control={<Checkbox name="isDefault" />} label="Set as Default" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddressDialog(false)}>Cancel</Button>
          <Button type="submit" form="new-address-form" variant="contained">
            Save Address
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;