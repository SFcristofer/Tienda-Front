import React, { useState, useContext } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import AuthContext from '../context/AuthContext.jsx';
import AddressAutocomplete from './AddressAutocomplete.jsx';
import ImageUploader from './ImageUploader.jsx';

const CREATE_STORE_MUTATION = gql`
  mutation CreateStore($name: String!, $description: String!, $imageFile: Upload, $addressInput: CreateAddressInput!, $storeCategoryIds: [ID!]) {
    createStore(name: $name, description: $description, imageFile: $imageFile, addressInput: $addressInput, storeCategoryIds: $storeCategoryIds) {
      id
      name
    }
  }
`;

function CreateStorePage() {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [createStore, { loading, error }] = useMutation(CREATE_STORE_MUTATION);

  const handlePlaceSelected = (placeDetails) => {
    setAddress(placeDetails);
  };

  const handleImageSelected = (file) => {
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) {
      // Handle case where address is not selected
      return;
    }

    // Prepare the address input, using description as a fallback for street
    const addressInput = {
      street: address.street || address.description, // Use description if street is empty
      city: address.city || 'N/A',
      state: address.state || 'N/A',
      zipCode: address.zipCode || 'N/A',
      country: address.country || 'N/A',
      latitude: address.latitude,
      longitude: address.longitude,
    };

    try {
      await createStore({
        variables: {
          name,
          description,
          imageFile,
          addressInput, // Use the prepared address input
        },
      });
      navigate('/profile'); // Redirect to profile page on success
    } catch (err) {
      console.error("Error creating store:", err);
    }
  };

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crear Nueva Tienda
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Nombre de la Tienda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            margin="normal"
          />
          <Typography variant="h6" sx={{ mt: 2 }}>Dirección de la Tienda</Typography>
          <AddressAutocomplete onPlaceSelected={handlePlaceSelected} />
          {address && (
            <Box my={2}>
              <Typography variant="subtitle1">Dirección Seleccionada:</Typography>
              <Typography>{address.description}</Typography>
              <Typography variant="caption">Lat: {address.latitude || 'N/A'}, Lon: {address.longitude || 'N/A'}</Typography>
            </Box>
          )}
          <Typography variant="h6" sx={{ mt: 2 }}>Imagen de la Tienda</Typography>
          <ImageUploader onFileSelected={handleImageSelected} />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error.message}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !address}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Tienda'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreateStorePage;
