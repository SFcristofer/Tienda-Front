import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { GET_ALL_STORES_WITH_PLANS } from '../../graphql/queries';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StoreMonetizationDetail from './StoreMonetizationDetail'; // The detail view component we will create

const StoreMonetizationManager = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery(GET_ALL_STORES_WITH_PLANS);

  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectStore = (store) => {
    setSelectedStore(store);
  };

  const handleBackToList = () => {
    setSelectedStore(null);
  };

  const filteredStores = useMemo(() => {
    if (!data?.adminGetAllStores) return [];
    return data.adminGetAllStores.filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  if (selectedStore) {
    return (
      <StoreMonetizationDetail 
        store={selectedStore} 
        onBack={handleBackToList} 
      />
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('storeMonetizationManagement')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('storeMonetizationManagementDescription')}
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder={t('searchStore')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <List>
        {filteredStores.map(store => {
          let secondaryText = `Plan: ${store.plan || 'N/A'} - Featured: ${store.esDestacado ? 'Yes' : 'No'}`;
          if (store.plan === 'profesional' && store.trialExpiresAt) {
            const expirationDate = new Date(store.trialExpiresAt);
            const now = new Date();
            const diffTime = expirationDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0) {
              secondaryText = `Plan: Profesional (Trial - ${diffDays} days left)`;
            } else {
              secondaryText = `Plan: Profesional (Trial Expired)`;
            }
          }

          return (
            <ListItem key={store.id} divider>
              <ListItemText 
                primary={store.name} 
                secondary={secondaryText}
              />
              <Button
                variant="contained"
                onClick={() => handleSelectStore(store)}
              >
                {t('manage')}
              </Button>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default StoreMonetizationManager;
