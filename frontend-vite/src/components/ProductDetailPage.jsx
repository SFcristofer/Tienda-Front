import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Container, Typography, Box, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button,
  Rating, TextField
} from '@mui/material';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    getProductById(id: $id) {
      id
      name
      description
      price
      imageUrl
      stock
      store {
        id
        name
      }
      category {
        id
        name
      }
      reviews {
        id
        rating
        comment
        user {
          id
          name
        }
        createdAt
      }
      averageRating
    }
  }
`;

const CREATE_PRODUCT_REVIEW_MUTATION = gql`
  mutation CreateProductReview($productId: ID!, $rating: Int!, $comment: String) {
    createProductReview(input: { productId: $productId, rating: $rating, comment: $comment }) {
      id
      rating
      comment
      user {
        id
        name
      }
      createdAt
    }
  }
`;

const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: ID!, $excludeProductId: ID!) {
    getAllProducts(categoryId: $categoryId, excludeProductId: $excludeProductId) {
      id
      name
      price
      imageUrl
    }
  }
`;

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(AuthContext);
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id },
  });

  const product = data?.getProductById; // Get product data here

  const { data: suggestedProductsData, loading: suggestedProductsLoading, error: suggestedProductsError } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: {
      categoryId: product?.category?.id,
      excludeProductId: id,
    },
    skip: !product?.category?.id,
  });

  const [createProductReview, { loading: reviewLoading, error: reviewError }] = useMutation(CREATE_PRODUCT_REVIEW_MUTATION, {
    onCompleted: () => {
      setReviewRating(0);
      setReviewComment('');
      refetch(); // Refetch product details to show new review
    },
  });

  const handleAddToCart = () => {
    if (data?.getProductById) {
      addToCart(data.getProductById, quantity);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para dejar una reseña.');
      return;
    }
    if (reviewRating === 0) {
      alert('Por favor, selecciona una calificación.');
      return;
    }
    try {
      await createProductReview({
        variables: {
          productId: id,
          rating: reviewRating,
          comment: reviewComment,
        },
      });
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>Error al cargar el producto: {error.message}</Alert>;
  if (!data || !data.getProductById) return <Alert severity="warning" sx={{ mt: 4 }}>Producto no encontrado.</Alert>;

  // const product = data.getProductById; // Removed redundant declaration

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          {product.name}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.imageUrl || 'https://via.placeholder.com/600x400'}
              alt={product.name}
              sx={{ objectFit: 'contain' }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>{product.name}</Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              ${product.price.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.reviews.length} reseñas)
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Stock: {product.stock}</Typography>
            {product.store && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Tienda: <Button component="a" onClick={() => navigate(`/stores/${product.store.id}`)}>{product.store.name}</Button>
              </Typography>
            )}
            {product.category && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Categoría: {product.category.name}</Typography>
            )}

            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
              <TextField
                type="number"
                label="Cantidad"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: product.stock }}
                sx={{ width: '100px', mr: 2 }}
              />
              <Button variant="contained" onClick={handleAddToCart} disabled={product.stock === 0}>
                {product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Descripción del Producto
        </Typography>
        <Typography variant="body1" paragraph>{product.description}</Typography>
      </Box>

      <Box sx={{ mt: 4, p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Reseñas del Producto
        </Typography>

        {isLoggedIn && (
          <Box component="form" onSubmit={handleReviewSubmit} sx={{ mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Typography variant="h6" gutterBottom>Deja tu Reseña</Typography>
            <Rating
              name="product-rating"
              value={reviewRating}
              onChange={(event, newValue) => {
                setReviewRating(newValue);
              }}
              sx={{ mb: 1 }}
            />
            <TextField
              label="Comentario"
              multiline
              rows={3}
              fullWidth
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" disabled={reviewLoading}>
              {reviewLoading ? <CircularProgress size={24} /> : 'Enviar Reseña'}
            </Button>
            {reviewError && <Alert severity="error" sx={{ mt: 2 }}>Error al enviar reseña: {reviewError.message}</Alert>}
          </Box>
        )}

        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map(review => (
            <Card key={review.id} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  por {review.user?.name || 'Anónimo'} el {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body1">{review.comment}</Typography>
            </Card>
          ))
        ) : (
          <Alert severity="info">No hay reseñas para este producto aún.</Alert>
        )}
      </Box>

      <Box sx={{ mt: 4, p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Productos Sugeridos
        </Typography>

        {suggestedProductsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : suggestedProductsError ? (
          <Alert severity="error">Error al cargar sugerencias: {suggestedProductsError.message}</Alert>
        ) : suggestedProductsData?.getAllProducts.length === 0 ? (
          <Alert severity="info">No hay productos sugeridos en esta categoría.</Alert>
        ) : (
          <Grid container spacing={3} sx={{ flexWrap: 'nowrap', overflowX: 'auto', pb: 2 }}>
            {suggestedProductsData?.getAllProducts.map(suggestedProduct => (
              <Grid item key={suggestedProduct.id} xs={12} sm={6} md={4} lg={3} sx={{ flexShrink: 0, width: '250px' }}>
                <Card 
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      cursor: 'pointer',
                    }
                  }}
                  onClick={() => navigate(`/products/${suggestedProduct.id}`)} // Navigate to suggested product detail
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={suggestedProduct.imageUrl || '/images/product-placeholder.svg'}
                    alt={suggestedProduct.name}
                    sx={{ objectFit: 'contain' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {suggestedProduct.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${suggestedProduct.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default ProductDetailPage;