import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#212529', // Un negro grisáceo oscuro
        color: 'white',
        py: 6,
        mt: 8, 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              UniShopp
            </Typography>
            <Typography variant="body2" color="#adb5bd">
              {t('footerDescription', 'Tu mercado universitario de confianza para comprar y vender.')}
            </Typography>
          </Grid>
          <Grid xs={6} sm={2}>
            <Typography variant="h6" gutterBottom>
              {t('company', 'Empresa')}
            </Typography>
            <Link component={RouterLink} to="/about" variant="body2" display="block" color="inherit" sx={{ mb: 1, textDecoration: 'none' }}>{t('aboutUs', 'Sobre Nosotros')}</Link>
            <Link component={RouterLink} to="/contact" variant="body2" display="block" color="inherit" sx={{ mb: 1, textDecoration: 'none' }}>{t('contact', 'Contacto')}</Link>
          </Grid>
          <Grid xs={6} sm={3}>
            <Typography variant="h6" gutterBottom>
              {t('help', 'Ayuda')}
            </Typography>
            <Link component={RouterLink} to="/faq" variant="body2" display="block" color="inherit" sx={{ mb: 1, textDecoration: 'none' }}>{t('faq', 'Preguntas Frecuentes')}</Link>
            <Link component={RouterLink} to="/shipping" variant="body2" display="block" color="inherit" sx={{ mb: 1, textDecoration: 'none' }}>{t('shippingReturns', 'Envíos y Devoluciones')}</Link>
          </Grid>
          <Grid xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              {t('socialMedia', 'Redes Sociales')}
            </Typography>
            <IconButton aria-label="Facebook" color="inherit" component="a" href="https://facebook.com">
              <FacebookIcon />
            </IconButton>
            <IconButton aria-label="Twitter" color="inherit" component="a" href="https://twitter.com">
              <TwitterIcon />
            </IconButton>
            <IconButton aria-label="Instagram" color="inherit" component="a" href="https://instagram.com">
              <InstagramIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="#6c757d" align="center">
            {'Copyright © '}
            <Link color="inherit" href="#">
              UniShopp
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
