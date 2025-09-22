import React from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Button, Typography, Box,
  CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GET_ALL_STORES = gql`
  query GetAllStores {
    getAllStores {
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
      averageRating
      address {
        street
        city
        state
        country
      }
    }
  }
`;

function StoresPage() {
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_ALL_STORES);

  const handleViewStore = (storeId) => {
    navigate(`/stores/${storeId}`);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Todas las Tiendas
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">Error al cargar tiendas: {error.message}</Alert>
      ) : data && data.getAllStores.length === 0 ? (
        <Alert severity="info">No se encontraron tiendas.</Alert>
      ) : (
        <Grid container spacing={4}>
          {data?.getAllStores.map(store => (
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
                  {store.address && (
                    <Typography variant="body2" color="text.secondary">
                      {store.address.street}, {store.address.city}, {store.address.state}, {store.address.country}
                    </Typography>
                  )}
                  {store.averageRating != null && (
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Rating: {store.averageRating.toFixed(1)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
                  <Button size="small" variant="contained" fullWidth onClick={() => handleViewStore(store.id)}>Ver Tienda</Button>
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