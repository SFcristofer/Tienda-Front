import React from 'react';
import { TextField, Button, Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Controller } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { GET_ALL_ACTIVE_COUNTRIES } from '../graphql/queries';

const ProductForm = ({ register, errors, control, categories, productImageUrl, productImageFileName, handleProductImageChange, t, onSubmit, setValue, watch }) => {

  const { data: countriesData, loading: countriesLoading, error: countriesError } = useQuery(GET_ALL_ACTIVE_COUNTRIES);

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
            label={`${t('price')} (${watch('currencySymbol') || ''})`}
            {...register('productPrice', { required: true, valueAsNumber: true, min: 0 })}
            {...getErrorProps('productPrice')}
            type="number"
            {...commonTextFieldProps}
          />

        {/* Hidden fields for currencyCode and currencySymbol */}
        <input type="hidden" {...register('currencyCode')} />
        <input type="hidden" {...register('currencySymbol')} />

        {/* Currency */}
        <FormControl {...commonTextFieldProps} error={!!errors.countryId}>
            <InputLabel>{t('country')}</InputLabel>
            <Controller
              name="countryId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  label={t('country')}
                  size="medium"
                  onChange={(e) => {
                    field.onChange(e);
                    const selectedCountry = countriesData?.getAllActiveCountries?.find(c => c.id === e.target.value);
                    if (selectedCountry) {
                      setValue('currencyCode', selectedCountry.currencyCode);
                      setValue('currencySymbol', selectedCountry.currencySymbol);
                    }
                  }}
                >
                  {countriesData?.getAllActiveCountries?.map((country) => (
                    <MenuItem key={country.id} value={country.id}>
                      {country.name} ({country.currencySymbol})
                    </MenuItem>
                  ))}
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
