import React from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import { GET_ALL_STORES } from '../graphql/queries';
import { Link as RouterLink } from 'react-router-dom';
import { useRegion } from '../context/RegionContext'; // 1. Importar el hook de región

const StoresPage = () => {
  const { t } = useTranslation();
  const { region: country, loading: regionLoading } = useRegion(); // 2. Usar el hook

  const { data, loading, error } = useQuery(GET_ALL_STORES, {
    // 3. No ejecutar la consulta hasta que tengamos el país
    skip: regionLoading || !country,
    variables: { 
      country: country, // 4. Pasar el país como variable
      sortBy: 'CREATED_AT', 
      sortOrder: 'DESC' 
    },
    fetchPolicy: 'network-only',
  });

  // 5. Manejar el estado de carga de la región
  if (regionLoading || loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{t('errorLoadingStores', { message: error.message })}</Alert>;

  const storesToDisplay = data?.getAllStores || [];

  return (
    <Container sx={{ mt: 4 }} maxWidth="lg">
      <Typography variant="h4" gutterBottom>{t('exploreStores')}</Typography>

      {storesToDisplay.length === 0 ? (
        <Typography>{t('noStoresAvailable')}</Typography>
      ) : (
        <List>
          {storesToDisplay.map((store) => (
            <React.Fragment key={store.id}>
              <ListItem
                button
                component={RouterLink}
                to={`/stores/${store.id}`}
                alignItems="flex-start"
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={store.imageUrl || '/images/store-placeholder.svg'}
                    alt={store.name}
                    sx={{ width: 100, height: 100, mr: 3, objectFit: 'contain' }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="h5">{store.name}</Typography>}
                  secondary={
                    <>
                      <Typography variant="body1" color="text.secondary">{store.description}</Typography>
                      <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>{t('owner')}: {store.owner.name}</Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
  );
};

export default StoresPage;