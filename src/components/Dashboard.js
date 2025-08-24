import React from 'react';
import { useQuery } from '@apollo/client';
import { Typography, Container, Box, CircularProgress, Alert, Button } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning'; // Import WarningIcon
import { AlertTitle } from '@mui/material'; // Import AlertTitle
import { useTranslation } from 'react-i18next';
import SellerDashboard from './SellerDashboard';
import UserProfile from './UserProfile';
import { ME_QUERY } from '../graphql/queries';

const Dashboard = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const { data, loading, error } = useQuery(ME_QUERY, { skip: !token, fetchPolicy: 'network-only' }); // Add fetchPolicy: 'network-only'

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const user = data?.me;

  console.log('User status in Dashboard:', user?.status); // Add this line

  if (!user && token) {
    return <Alert severity="warning">{t('sessionExpired')}</Alert>;
  }

  return (
    <Container>
      

      {user?.role === 'seller' && <SellerDashboard />}
      {user?.role === 'customer' && <UserProfile />}
    </Container>
  );
};

export default Dashboard;