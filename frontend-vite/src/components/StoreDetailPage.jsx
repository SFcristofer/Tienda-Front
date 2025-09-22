import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {
  Container, Typography, Box, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button
} from '@mui/material';

const GET_STORE_BY_ID = gql`
  query GetStoreById($id: ID!) {
    getStoreById(id: $id) {
      id
      name
      description
      imageUrl
      owner {
        id
        name
      }
      products {
        id
        name
        description
        price
        imageUrl
      }
      storeCategories {
        id
        name
      }
      averageRating
    }
  }
`;

function StoreDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_STORE_BY_ID, {
    variables: { id },
  });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>Error al cargar la tienda: {error.message}</Alert>;
  if (!data || !data.getStoreById) return <Alert severity="warning" sx={{ mt: 4 }}>Tienda no encontrada.</Alert>;

  const store = data.getStoreById;

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          {store.name}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="250"
              image={store.imageUrl || 'https://via.placeholder.com/400x250'}
              alt={store.name}
              sx={{ objectFit: 'contain' }}
            />
            <CardContent>
              <Typography variant="h5" gutterBottom>{store.name}</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>{store.description}</Typography>
              {store.owner && (
                <Typography variant="body2">Vendedor: {store.owner.name}</Typography>
              )}
              {store.averageRating != null && (
                <Typography variant="body2">Rating: {store.averageRating.toFixed(1)}</Typography>
              )}
              {store.storeCategories && store.storeCategories.length > 0 && (
                <Typography variant="body2">Categorías: {store.storeCategories.map(cat => cat.name).join(', ')}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h5" component="h2" gutterBottom>
            Productos de {store.name}
          </Typography>
          <Grid container spacing={3}>
            {store.products && store.products.length > 0 ? (
              store.products.map(product => (
                <Grid item key={product.id} xs={12} sm={6} md={4}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={product.imageUrl || 'https://via.placeholder.com/200x140'}
                      alt={product.name}
                      sx={{ objectFit: 'contain' }}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Button size="small" variant="contained" sx={{ mt: 1 }}>Ver Producto</Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">No hay productos disponibles en esta tienda.</Alert>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default StoreDetailPage;