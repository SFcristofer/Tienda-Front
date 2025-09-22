import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Button, Typography, Box, TextField, 
  CircularProgress, Alert
} from '@mui/material';

const GET_NEARBY_STORES = gql`
  query GetNearbyStores($latitude: Float!, $longitude: Float!, $radius: Float) {
    getNearbyStores(latitude: $latitude, longitude: $longitude, radius: $radius) {
      id
      name
      description
      imageUrl
      owner {
        name
      }
      storeCategories {
        name
      }
      distance
    }
  }
`;

function StoresPage() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [radius, setRadius] = useState(20); // Default radius in km
  const [locationError, setLocationError] = useState('');

  const { loading, error, data } = useQuery(GET_NEARBY_STORES, {
    variables: { 
      latitude: location.latitude,
      longitude: location.longitude,
      radius 
    },
    skip: !location.latitude || !location.longitude, // Skip query if no coordinates
  });

  const handleFindStores = () => {
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setLocationError(`Error al obtener la ubicación: ${err.message}`);
        }
      );
    } else {
      setLocationError('La geolocalización no es soportada por este navegador.');
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tiendas Cercanas
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={handleFindStores}>
          Buscar tiendas cerca de mí
        </Button>
        <TextField
          type="number"
          label="Radio (km)"
          variant="outlined"
          value={radius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
          sx={{ width: '150px' }}
        />
      </Box>

      {locationError && <Alert severity="error" sx={{ mb: 2 }}>{locationError}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">Error al cargar tiendas: {error.message}</Alert>
      ) : !location.latitude || !location.longitude ? (
        <Alert severity="info">Haz clic en el botón para encontrar tiendas cercanas a tu ubicación.</Alert>
      ) : data && data.getNearbyStores.length === 0 ? (
        <Alert severity="warning">No se encontraron tiendas en el radio especificado.</Alert>
      ) : (
        <Grid container spacing={4}>
          {data?.getNearbyStores.map(store => (
            <Grid item key={store.id} xs={12} sm={6} md={4}>
              <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  overflow: 'hidden', // Safeguard against content stretching
                  maxWidth: 200, // Set max width as requested
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  }
              }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={store.imageUrl || 'https://via.placeholder.com/300x200'}
                  alt={store.name}
                  sx={{ 
                    borderTopLeftRadius: '16px', 
                    borderTopRightRadius: '16px', 
                    objectFit: 'contain', 
                    width: '100%' 
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {store.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {store.description}
                  </Typography>
                  {store.distance != null && (
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                      A {store.distance.toFixed(2)} km de distancia
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
                  <Button size="small" variant="contained" fullWidth>Ver Tienda</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default StoresPage;