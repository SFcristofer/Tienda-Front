import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_AVAILABLE_STORE_COUNTRIES } from '../graphql/queries';
import { useRegion } from '../context/RegionContext';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, FormControl, InputLabel, Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CountrySelectorModal = () => {
  const { t } = useTranslation();
  const { country, loading, setRegion } = useRegion();
  const { data, loading: queryLoading, error: queryError } = useQuery(GET_AVAILABLE_STORE_COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState('');

  const availableCountries = data?.getAvailableStoreCountries || [];

  const countryNames = {
    US: t('country_US', 'United States'),
    MX: t('country_MX', 'Mexico'),
    NI: t('country_NI', 'Nicaragua'),
    // Add more country codes and their translated names here
  };

  const handleSelectCountry = () => {
    if (selectedCountry) {
      localStorage.setItem('userCountry', selectedCountry);
      setRegion(prev => ({ ...prev, country: selectedCountry, loading: false }));
    }
  };

  if (loading || queryLoading) {
    return (
      <Dialog open={true} disableEscapeKeyDown>
        <DialogTitle>{t('loadingCountries')}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography>{t('fetchingAvailableCountries')}</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (queryError) {
    return (
      <Dialog open={true} disableEscapeKeyDown>
        <DialogTitle>{t('errorLoadingCountries')}</DialogTitle>
        <DialogContent>
          <Alert severity="error">{t('errorFetchingCountries')}: {queryError.message}</Alert>
          <Typography sx={{ mt: 2 }}>{t('pleaseTryAgainLater')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.location.reload()}>{t('reloadPage')}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Only show the modal if no country is set and not loading
  if (country) {
    return null; // Country is already set, don't show modal
  }

  return (
    <Dialog open={true} disableEscapeKeyDown>
      <DialogTitle>{t('selectYourCountry')}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>{t('country')}</InputLabel>
          <Select
            value={selectedCountry}
            label={t('country')}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {availableCountries.length === 0 ? (
              <MenuItem value="" disabled>{t('noCountriesAvailable')}</MenuItem>
            ) : (
              availableCountries.map((code) => (
                <MenuItem key={code} value={code}>
                  {countryNames[code] || code}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        {availableCountries.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>{t('noStoresInAnyCountry')}</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSelectCountry} disabled={!selectedCountry || availableCountries.length === 0}>{t('confirmSelection')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CountrySelectorModal;
