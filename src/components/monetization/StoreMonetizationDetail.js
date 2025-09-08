import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { GET_STORE_BY_ID } from '../../graphql/queries';
import {
  ADMIN_UPDATE_STORE_MONETIZATION,
  ADMIN_UPDATE_PRODUCT_MONETIZATION,
} from '../../graphql/mutations';
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  Switch,
  List,
  ListItem,
  ListItemText,
  TextField,
  Divider,
  Paper,
  FormControlLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const StoreMonetizationDetail = ({ store, onBack }) => {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useQuery(GET_STORE_BY_ID, {
    variables: { id: store.id },
  });

  const [updateStore, { loading: updatingStore }] = useMutation(ADMIN_UPDATE_STORE_MONETIZATION);
  const [updateProduct, { loading: updatingProduct }] = useMutation(ADMIN_UPDATE_PRODUCT_MONETIZATION);

  const [storePlan, setStorePlan] = useState('');
  const [storeIsFeatured, setStoreIsFeatured] = useState(false);
  const [products, setProducts] = useState([]);

  const fullStoreData = data?.getStoreById;

  useEffect(() => {
    if (fullStoreData) {
      setStorePlan(fullStoreData.plan || 'basico');
      setStoreIsFeatured(fullStoreData.esDestacado || false);
      setProducts(fullStoreData.products.map(p => ({
        ...p,
        insignias: p.insignias ? p.insignias.join(', ') : '',
      })));
    }
  }, [fullStoreData]);

  const handleProductChange = (productId, field, value) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveStore = async () => {
    try {
      await updateStore({
        variables: {
          storeId: store.id,
          plan: storePlan,
          esDestacado: storeIsFeatured,
        },
      });
      refetch();
    } catch (e) {
      console.error('Error updating store:', e);
    }
  };

  const handleSaveProduct = async (product) => {
    try {
      await updateProduct({
        variables: {
          productId: product.id,
          esDestacado: product.esDestacado,
          insignias: product.insignias.split(',').map(s => s.trim()).filter(s => s),
        },
      });
    } catch (e) {
      console.error('Error updating product:', e);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        {t('backToStores')}
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {t('storeLevelMonetization')}: {fullStoreData.name}
        </Typography>
        <Divider sx={{ my: 2 }} />
        {fullStoreData.plan === 'profesional' && fullStoreData.trialExpiresAt && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('trialExpiresOn', { date: new Date(fullStoreData.trialExpiresAt).toLocaleDateString() })}
          </Alert>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 2 }}>
          <FormControlLabel
            control={
              <Select value={storePlan} onChange={(e) => setStorePlan(e.target.value)} size="small">
                <MenuItem value="basico">{t('planBasic')}</MenuItem>
                <MenuItem value="profesional">{t('planProfessional')}</MenuItem>
              </Select>
            }
            label={`${t('sellerPlan')}:`}
            labelPlacement="start"
          />
          <FormControlLabel
            control={<Switch checked={storeIsFeatured} onChange={(e) => setStoreIsFeatured(e.target.checked)} />}
            label={`${t('featuredStore')}:`}
            labelPlacement="start"
          />
        </Box>
        <Button variant="contained" onClick={handleSaveStore} disabled={updatingStore}>
          {updatingStore ? <CircularProgress size={24} /> : t('saveStoreSettings')}
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('productLevelMonetization')}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <List>
          {products.map(product => (
            <ListItem key={product.id} divider>
              <ListItemText primary={product.name} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={<Switch checked={product.esDestacado || false} onChange={(e) => handleProductChange(product.id, 'esDestacado', e.target.checked)} />}
                  label={t('featured')}
                  labelPlacement="start"
                />
                <TextField
                  label={t('badges')}
                  value={product.insignias}
                  onChange={(e) => handleProductChange(product.id, 'insignias', e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: 200 }}
                />
                <Button variant="contained" color="secondary" onClick={() => handleSaveProduct(product)} disabled={updatingProduct}>
                  {t('save')}
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default StoreMonetizationDetail;
