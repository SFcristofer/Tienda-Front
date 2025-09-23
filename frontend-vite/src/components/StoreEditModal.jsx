import React, { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Modal, Box, Typography, TextField, Button, CircularProgress, Alert
} from '@mui/material';
import AddressAutocomplete from './AddressAutocomplete.jsx';

const UPDATE_STORE_MUTATION = gql`
  mutation UpdateStore(
    $id: ID!, 
    $name: String, 
    $description: String, 
    $contactEmail: String, 
    $phoneNumber: String, 
    $addressInput: CreateAddressInput
  ) {
    updateStore(
      id: $id, 
      name: $name, 
      description: $description, 
      contactEmail: $contactEmail, 
      phoneNumber: $phoneNumber, 
      addressInput: $addressInput
    ) {
      id
      address {
        id
        street
        city
      }
    }
  }
`;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto'
};

export const StoreEditModal = ({ open, onClose, store, refetch }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newAddress, setNewAddress] = useState(null);

  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setDescription(store.description || '');
      setContactEmail(store.contactEmail || '');
      setPhoneNumber(store.phoneNumber || '');
      setNewAddress(null); // Reset new address on modal open
    }
  }, [store]);

  const [updateStore, { loading, error }] = useMutation(UPDATE_STORE_MUTATION, {
    onCompleted: () => {
      refetch();
      onClose();
    },
    onError: (err) => {
        console.error("Error updating store in mutation hook:", err);
    }
  });

  const handlePlaceSelected = (place) => {
    setNewAddress(place);
  };

  const handleSubmit = async () => {
    let addressInput = null;
    if (newAddress) {
        addressInput = {
            street: newAddress.street || newAddress.description,
            city: newAddress.city,
            state: newAddress.state,
            zipCode: newAddress.zipCode,
            country: newAddress.country,
            latitude: newAddress.latitude,
            longitude: newAddress.longitude,
        };
    }

    try {
      await updateStore({ 
        variables: { 
            id: store.id, 
            name, 
            description, 
            contactEmail, 
            phoneNumber, 
            addressInput 
        } 
      });
    } catch (e) {
      console.error("Error in handleSubmit for updateStore:", e);
    }
  };

  if (!store) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Editar Tienda</Typography>
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error.message}</Alert>}

        <TextField fullWidth label="Nombre de la Tienda" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
        <TextField fullWidth label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" multiline rows={3} />
        
        <Typography sx={{ mt: 2, mb: 1 }}>Cambiar Dirección</Typography>
        <AddressAutocomplete onPlaceSelected={handlePlaceSelected} />
        {newAddress ? (
            <Box my={2}>
              <Typography variant="subtitle1">Nueva Dirección Seleccionada:</Typography>
              <Typography color="text.secondary">{newAddress.description}</Typography>
            </Box>
        ) : store.address && (
            <Box my={2}>
              <Typography variant="subtitle1">Dirección Actual:</Typography>
              <Typography color="text.secondary">{store.address.street}, {store.address.city}</Typography>
            </Box>
        )}

        <Typography sx={{ mt: 2 }}>Contacto</Typography>
        <TextField fullWidth label="Email de Contacto" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} margin="normal" />
        <TextField fullWidth label="Teléfono" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} margin="normal" />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};


