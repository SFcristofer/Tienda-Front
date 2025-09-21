import React, { useState } from 'react';
import {
  Button, TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, CircularProgress, Alert, Box,
  Typography
} from '@mui/material';
import { useMutation, gql } from '@apollo/client';
import AddressAutocomplete from './AddressAutocomplete.jsx'; // Import AddressAutocomplete
import ImageUploader from './ImageUploader.jsx'; // Import ImageUploader

const CREATE_STORE_MUTATION = gql`
  mutation CreateStore($name: String!, $description: String, $imageFile: Upload, $addressInput: AddressInput!) {
    createStore(name: $name, description: $description, imageFile: $imageFile, addressInput: $addressInput) {
      id
      name
      description
      imageUrl
      address {
        id
        street
        city
        state
        zipCode
        country
        latitude
        longitude
      }
    }
  }
`;

const CreateStoreModal = ({ open, handleClose, refetchStores }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null); // Changed from imageUrl to imageFile
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zipCode: '', country: '',
    latitude: null, longitude: null, phoneNumber: '', description: ''
  });
  const [error, setError] = useState(null);

  const [createStore, { loading }] = useMutation(CREATE_STORE_MUTATION, {
    onCompleted: () => {
      refetchStores(); // Refetch stores after successful creation
      handleClose();
      setName('');
      setDescription('');
      setImageFile(null); // Reset imageFile
      setAddress({
        street: '', city: '', state: '', zipCode: '', country: '',
        latitude: null, longitude: null, phoneNumber: '', description: ''
      });
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handlePlaceSelected = (placeDetails) => {
    setAddress({
      ...address,
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

  const handleAddressPhoneNumberChange = (e) => {
    setAddress(prev => ({ ...prev, phoneNumber: e.target.value }));
  };

  const handleImageSelected = (file) => {
    setImageFile(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('El nombre de la tienda es obligatorio.');
      return;
    }
    if (!address.latitude || !address.longitude) {
      setError('La dirección de la tienda es obligatoria. Por favor, selecciona una dirección válida.');
      return;
    }
    setError(null);
    const { description: addressDescription, ...addressInput } = address; // Exclude description from addressInput
    createStore({ variables: { name, description, imageFile, addressInput } }); // Pass imageFile
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear Nueva Tienda</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Nombre de la Tienda"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          error={!!error && !name.trim()}
          helperText={!!error && !name.trim() && 'El nombre es obligatorio'}
        />
        <TextField
          margin="dense"
          id="description"
          label="Descripción"
          type="text"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
        />
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle1">Dirección de la Tienda</Typography>
          <AddressAutocomplete onPlaceSelected={handlePlaceSelected} />
          {address.description && (
            <Box my={1}>
              <Typography variant="body2">Seleccionada: {address.description}</Typography>
              <Typography variant="caption">Lat: {address.latitude || 'N/A'}, Lon: {address.longitude || 'N/A'}</Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Número de Teléfono (Opcional)"
            name="phoneNumber"
            value={address.phoneNumber}
            onChange={handleAddressPhoneNumberChange}
            margin="normal"
          />
        </Box>
        <ImageUploader onFileSelected={handleImageSelected} currentImageUrl={null} /> {/* Image Uploader component */}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading || !address.latitude} variant="contained">
          {loading ? <CircularProgress size={24} /> : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateStoreModal;
