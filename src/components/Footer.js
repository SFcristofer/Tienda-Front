import { Box, Container, Typography, Link, Grid, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useQuery } from '@apollo/client';
import { GET_AVAILABLE_STORE_COUNTRIES } from '../graphql/queries';
import { useRegion } from '../context/RegionContext';

const countryNames = {
  US: 'United States',
  MX: 'Mexico',
  NI: 'Nicaragua',
  CA: 'Canada',
};

const Footer = () => {
  const { t } = useTranslation();
  const { country, setRegion } = useRegion();
  const { data: countriesData } = useQuery(GET_AVAILABLE_STORE_COUNTRIES);

  const availableCountries = countriesData?.getAvailableStoreCountries || [];

  const handleCountryChange = (event) => {
    const newCountry = event.target.value;
    setRegion(newCountry);
    localStorage.setItem('userCountry', newCountry); // Save preference
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#212529', // Un negro grisáceo oscuro
        color: 'white',
        py: 3,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              UniShopp
            </Typography>
            <Typography variant="body2" color="#adb5bd">
              {t('footerDescription', 'Tu mercado digital de confianza para comprar y vender.')}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="h6" gutterBottom>
              {t('company', 'Empresa')}
            </Typography>
            <Link component={RouterLink} to="/about" variant="body2" display="block" color="inherit" sx={{ mb: 1, textDecoration: 'none' }}>{t('aboutUs', 'Sobre Nosotros')}</Link>
            <Link component={RouterLink} to="/contact" variant="body2" display="block" color="inherit" sx={{ mb: 1, textDecoration: 'none' }}>{t('contact', 'Contacto')}</Link>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h6" gutterBottom>
              {t('help', 'Ayuda')}
            </Typography>
            <Link component={RouterLink} to="/faq" variant="body2" display="block" color="inherit" sx={{ mb: 1, textDecoration: 'none' }}>{t('faq', 'Preguntas Frecuentes')}</Link>
            <Link component={RouterLink} to="/shipping" variant="body2" display="block" color="inherit" sx={{ mb: 1, textDecoration: 'none' }}>{t('shippingReturns', 'Envíos y Devoluciones')}</Link>
          </Grid>
          <Grid item xs={12} sm={3}>
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
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="country-select-label" sx={{ color: 'white' }}>{t('country')}</InputLabel>
              <Select
                labelId="country-select-label"
                value={country || ''}
                onChange={handleCountryChange}
                label={t('country')}
                sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
              >
                {availableCountries.map((code) => (
                  <MenuItem key={code} value={code}>
                    {countryNames[code] || code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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