import React from 'react';
import { Paper, Typography, Grid, CardMedia, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';

const SponsoredStoreBanner = ({ store, t }) => {
  if (!store) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        backgroundColor: 'primary.light',
        color: 'primary.contrastText',
        borderRadius: '16px',
        border: '2px solid',
        borderColor: 'secondary.main'
      }}
    >
      <Grid container alignItems="center" spacing={3}>
        <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
          <CardMedia
            component="img"
            image={store.imageUrl || '/images/store-placeholder.svg'}
            alt={store.name}
            sx={{
              width: 100,
              height: 100,
              objectFit: 'contain',
              borderRadius: '50%',
              border: '3px solid',
              borderColor: 'secondary.main',
              m: 'auto'
            }}
          />
        </Grid>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <StarIcon sx={{ color: 'secondary.main', mr: 1 }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
              {t('sponsoredStore', 'Tienda Patrocinada')}
            </Typography>
          </Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {store.name}
          </Typography>
          <Typography variant="body1">
            {store.description}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            component={RouterLink}
            to={`/stores/${store.id}`}
            sx={{ fontWeight: 'bold' }}
          >
            {t('visitStore', 'Visitar Tienda')}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SponsoredStoreBanner;