import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { GET_ALL_CATEGORIES, GET_ALL_STORES } from '../../graphql/queries';
import { ADMIN_SET_CATEGORY_SPONSOR } from '../../graphql/mutations';
import { Typography, List, ListItem, ListItemText, Select, MenuItem, Button, CircularProgress, Alert, Box } from '@mui/material';

const CategorySponsors = () => {
  const { t } = useTranslation();
  const { data: categoriesData, loading: loadingCategories, error: errorCategories, refetch } = useQuery(GET_ALL_CATEGORIES);
  const { data: storesData, loading: loadingStores, error: errorStores } = useQuery(GET_ALL_STORES, {
    variables: { country: 'MX' }, // This might need to be dynamic
  });
  const [setCategorySponsor, { loading: updatingSponsor }] = useMutation(ADMIN_SET_CATEGORY_SPONSOR);

  const [selectedSponsors, setSelectedSponsors] = useState({});

  const handleSponsorChange = (categoryId, storeId) => {
    setSelectedSponsors(prev => ({
      ...prev,
      [categoryId]: storeId,
    }));
  };

  const handleSaveSponsor = async (categoryId) => {
    const storeId = selectedSponsors[categoryId];
    try {
      await setCategorySponsor({
        variables: {
          categoryId,
          storeId: storeId === 'none' ? null : storeId,
        },
      });
      refetch();
    } catch (error) {
      console.error('Error saving sponsor:', error);
    }
  };

  if (loadingCategories || loadingStores) return <CircularProgress />;
  if (errorCategories) return <Alert severity="error">{errorCategories.message}</Alert>;
  if (errorStores) return <Alert severity="error">{errorStores.message}</Alert>;

  const categories = categoriesData?.getAllCategories || [];
  const stores = storesData?.getAllStores || [];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('categorySponsors')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('categorySponsorsDescription')}
      </Typography>
      <List>
        {categories.map(category => (
          <ListItem key={category.id} divider>
            <ListItemText 
              primary={category.name} 
              secondary={`Sponsored by: ${category.sponsoredStore?.name || 'None'}`}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Select
                value={selectedSponsors[category.id] || category.sponsoredStore?.id || 'none'}
                onChange={(e) => handleSponsorChange(category.id, e.target.value)}
                displayEmpty
                size="small"
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="none">
                  <em>None</em>
                </MenuItem>
                {stores.map(store => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                onClick={() => handleSaveSponsor(category.id)}
                disabled={updatingSponsor}
              >
                {updatingSponsor ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CategorySponsors;