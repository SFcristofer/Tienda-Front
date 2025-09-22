import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid, CircularProgress, Alert, Select, MenuItem, InputLabel, FormControl, Typography
} from '@mui/material';
import ImageUploader from './ImageUploader';

// Query to get all product categories
const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
    }
  }
`;

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($name: String!, $description: String!, $price: Float!, $storeId: ID!, $categoryId: ID!, $stock: Int!, $imageUrl: String) {
    createProduct(name: $name, description: $description, price: $price, storeId: $storeId, categoryId: $categoryId, stock: $stock, imageUrl: $imageUrl) {
      id
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: ID!, $name: String, $description: String, $price: Float, $stock: Int, $categoryId: ID, $imageUrl: String) {
    updateProduct(id: $id, name: $name, description: $description, price: $price, stock: $stock, categoryId: $categoryId, imageUrl: $imageUrl) {
      id
    }
  }
`;

// A mutation to upload the image and get the URL back
const UPLOAD_IMAGE_MUTATION = gql`
    mutation UploadImage($base64Image: String!) {
        uploadImage(base64Image: $base64Image)
    }
`;


const ProductForm = ({ open, onClose, product, storeId, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_ALL_CATEGORIES);
  const [createProduct, { loading: createLoading, error: createError }] = useMutation(CREATE_PRODUCT_MUTATION);
  const [updateProduct, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_PRODUCT_MUTATION);
  const [uploadImage, { loading: uploadLoading, error: uploadError }] = useMutation(UPLOAD_IMAGE_MUTATION);


  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        categoryId: product.category?.id || '',
      });
      setPreviewUrl(product.imageUrl);
    } else {
      // Reset form for new product
      setFormData({ name: '', description: '', price: '', stock: '', categoryId: '' });
      setPreviewUrl(null);
    }
  }, [product, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelected = (file) => {
    setImageFile(file);
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    } else {
        setPreviewUrl(product?.imageUrl || null);
    }
  };

  const handleSubmit = async () => {
    let imageUrl = product?.imageUrl; // Keep old image if no new one is selected

    if (imageFile) {
        // If there is a new image file, upload it first
        try {
            const { data } = await uploadImage({ variables: { base64Image: previewUrl } });
            imageUrl = data.uploadImage; // Get the URL from Firebase
        } catch (e) {
            console.error("Image upload failed", e);
            // Don't proceed with product creation/update if image upload fails
            return;
        }
    }

    const variables = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      imageUrl,
    };

    try {
      if (product) {
        // Update mode
        await updateProduct({ variables: { id: product.id, ...variables } });
      } else {
        // Create mode
        await createProduct({ variables: { ...variables, storeId } });
      }
      onSave(); // Callback to refetch data and close modal
    } catch (e) {
      console.error("Failed to save product", e);
    }
  };

  const loading = createLoading || updateLoading || uploadLoading;
  const error = createError || updateError || uploadError;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
      <DialogContent>
        <TextField name="name" label="Nombre del Producto" value={formData.name} onChange={handleChange} fullWidth required margin="normal" />
        <TextField name="description" label="Descripción" value={formData.description} onChange={handleChange} fullWidth multiline rows={4} margin="normal" />
        <TextField name="price" label="Precio" type="number" value={formData.price} onChange={handleChange} fullWidth required margin="normal" />
        <TextField name="stock" label="Stock" type="number" value={formData.stock} onChange={handleChange} fullWidth required margin="normal" />
        
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Categoría</Typography>
        <FormControl fullWidth required disabled={categoriesLoading}>
          <InputLabel id="category-select-label">Categoría</InputLabel>
          <Select
            labelId="category-select-label"
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            label="Categoría"
            onChange={handleChange}
          >
            {categoriesData?.getAllCategories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ mt: 2 }}>Imagen del Producto</Typography>
        <ImageUploader onFileSelected={handleImageSelected} currentImageUrl={previewUrl} />

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error.message}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm;
