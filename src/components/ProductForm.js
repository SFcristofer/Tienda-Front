import React from 'react';
import { TextField, Button, Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Controller } from 'react-hook-form';

const ProductForm = ({ register, errors, control, categories, productImageUrl, productImageFileName, handleProductImageChange, t, onSubmit }) => {

  const commonTextFieldProps = {
    fullWidth: true,
    variant: "outlined",
    required: true,
    size: "medium", // Added size medium
  };

  const getErrorProps = (fieldName) => ({
    error: !!errors[fieldName],
    helperText: errors[fieldName]?.type === 'min' ? t('cannotBeNegative') : errors[fieldName] ? t('fieldRequired') : ''
  });

  return (
    <Box component="form" id="product-form" onSubmit={onSubmit} sx={{ mt: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Nombre */}
          <TextField
            label={t('productName')}
            {...register('productName', { required: true })}
            {...getErrorProps('productName')}
            {...commonTextFieldProps}
          />

        {/* Descripción */}
          <TextField
            label={t('productDescription')}
            {...register('productDescription', { required: true })}
            {...getErrorProps('productDescription')}
            multiline
            rows={4}
            {...commonTextFieldProps}
          />

        {/* Precio */}
          <TextField
            label={t('price')}
            {...register('productPrice', { required: true, valueAsNumber: true, min: 0 })}
            {...getErrorProps('productPrice')}
            type="number"
            {...commonTextFieldProps}
          />

        {/* Currency */}
        <FormControl {...commonTextFieldProps} error={!!errors.currency}>
            <InputLabel>{t('currency')}</InputLabel>
            <Controller
              name="currency"
              control={control}
              rules={{ required: true }}
              defaultValue="USD" // Default currency
              render={({ field }) => (
                <Select {...field} label={t('currency')} size="medium">
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="MXN">MXN</MenuItem>
                  <MenuItem value="NIO">NIO</MenuItem>
                </Select>
              )}
            />
          </FormControl>

        {/* Stock */}
          <TextField
            label={t('stockQuantity')}
            {...register('productStock', { required: true, valueAsNumber: true, min: 0 })}
            {...getErrorProps('stockQuantity')}
            type="number"
            {...commonTextFieldProps}
          />

        {/* Categoría */}
          <FormControl {...commonTextFieldProps} error={!!errors.categoryId}>
            <InputLabel>{t('category')}</InputLabel>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} label={t('category')} size="medium">
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

        {/* Imagen */}
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              {t('uploadProductImage')}
              <input type="file" hidden accept="image/*" onChange={handleProductImageChange} />
            </Button>

            {productImageFileName && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {t('selectedFile', { fileName: productImageFileName })}
              </Typography>
            )}
            {productImageUrl && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={productImageUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </Box>
            )}
          </Paper>
    </Box>
  );
};

export default ProductForm;
