import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Button, Typography, Box, TextField, 
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';

const GET_ALL_PRODUCTS = gql`
  query GetAllProducts(
    $categoryId: ID
    $minPrice: Float
    $maxPrice: Float
    $search: String
    $sortBy: String
    $sortOrder: String
  ) {
    getAllProducts(
      categoryId: $categoryId
      minPrice: $minPrice
      maxPrice: $maxPrice
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      id
      name
      description
      price
      imageUrl
      store {
        name
      }
      category {
        id
        name
      }
    }
  }
`;

const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
    }
  }
`;

function ProductsPage() {
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { loading: categoriesLoading, error: categoriesError, data: categoriesData } = useQuery(GET_ALL_CATEGORIES);

  const { loading, error, data } = useQuery(GET_ALL_PRODUCTS, {
    variables: {
      search: search || null,
      minPrice: parseFloat(minPrice) || null,
      maxPrice: parseFloat(maxPrice) || null,
      categoryId: selectedCategory || null,
    },
  });

  if (categoriesError) return <Alert severity="error">Error al cargar categorías: {categoriesError.message}</Alert>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Explora Nuestros Productos
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar productos..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <TextField
          type="number"
          label="Precio mínimo"
          variant="outlined"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          sx={{ width: '150px' }}
        />
        <TextField
          type="number"
          label="Precio máximo"
          variant="outlined"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          sx={{ width: '150px' }}
        />
        <FormControl sx={{ minWidth: '200px' }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={selectedCategory}
            label="Categoría"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value=""><em>Todas</em></MenuItem>
            {categoriesData?.getAllCategories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading || categoriesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">Error al cargar productos: {error.message}</Alert>
      ) : (
        <Grid container spacing={4}>
          {data.getAllProducts.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No se encontraron productos con los filtros aplicados.</Typography>
            </Grid>
          ) : (
            data.getAllProducts.map(product => (
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
                    image={product.imageUrl || '/images/product-placeholder.svg'}
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
            ))
          )}
        </Grid>
      )}
    </Container>
  );
}

export default ProductsPage;