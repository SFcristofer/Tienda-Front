import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ImageUploader = ({ onFileSelected, currentImageUrl }) => {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelected(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      onFileSelected(null);
      setPreviewUrl(null);
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px dashed grey', p: 2, borderRadius: '4px' }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="raised-button-file">
        <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
          Subir Imagen
        </Button>
      </label>
      {previewUrl && (
        <Box sx={{ mt: 2, maxWidth: '100%', maxHeight: '200px', overflow: 'hidden' }}>
          <img src={previewUrl} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <Typography variant="caption" sx={{ mt: 1 }}>Previsualización de la imagen</Typography>
        </Box>
      )}
      {!previewUrl && currentImageUrl && (
        <Box sx={{ mt: 2, maxWidth: '100%', maxHeight: '200px', overflow: 'hidden' }}>
          <img src={currentImageUrl} alt="Current" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <Typography variant="caption" sx={{ mt: 1 }}>Imagen actual</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader;
