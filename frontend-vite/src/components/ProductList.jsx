import React from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Button, Typography, Box, 
  CircularProgress, Alert
} from '@mui/material';

const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    getAllProducts {
      id
      name
      description
      price
      imageUrl
      store {
        name
      }
      category {
        name
      }
    }
  }
`;

export const ProductList = () => {
  const { loading, error, data } = useQuery(GET_ALL_PRODUCTS);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>Error al cargar productos: {error.message}</Alert>;

  return (
    <Box sx={{ my: 4 }}>
      <Container>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Nuestros Productos
        </Typography>
        <Grid container spacing={4}>
          {data.getAllProducts.map(product => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
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
                  image={product.imageUrl || 'https://via.placeholder.com/300x200'}
                  alt={product.name}
                  sx={{ 
                    borderTopLeftRadius: '16px', 
                    borderTopRightRadius: '16px', 
                    objectFit: 'contain', 
                    width: '100%' 
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vendido por: {product.store.name}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Button size="small" variant="contained">Añadir</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
