import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { CREATE_PRODUCT_REVIEW } from '../graphql/mutations';
import { GET_PRODUCT_BY_ID } from '../graphql/queries';
import { Box, Button, TextField, Rating, Typography, Alert } from '@mui/material';

const ProductReviewForm = ({ productId, onReviewSubmitted }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [createReview, { loading, error }] = useMutation(CREATE_PRODUCT_REVIEW, {
    refetchQueries: [{ query: GET_PRODUCT_BY_ID, variables: { id: productId } }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert(t('pleaseSelectRating'));
      return;
    }
    try {
      await createReview({ variables: { input: { productId, rating, comment } } });
      setRating(0);
      setComment('');
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>{t('writeAReview')}</Typography>
      {error && <Alert severity="error">{error.message}</Alert>}
      <Box sx={{ mb: 2 }}>
        <Typography component="legend">{t('yourRating')}</Typography>
        <Rating name="product-rating" value={rating} onChange={(event, newValue) => { setRating(newValue); }} />
      </Box>
      <TextField label={t('yourReview')} multiline rows={4} fullWidth value={comment} onChange={(e) => setComment(e.target.value)} variant="outlined" sx={{ mb: 2 }} />
      <Button type="submit" variant="contained" disabled={loading}>{loading ? t('submitting') : t('submitReview')}</Button>
    </Box>
  );
};

export default ProductReviewForm;