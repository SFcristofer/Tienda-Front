import React from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Import useLocation
import { jwtDecode } from 'jwt-decode';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../graphql/queries';
import { CircularProgress, Alert, Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PrivateRoute = ({ children, requiredRole }) => {
  const { t } = useTranslation();
  const location = useLocation(); // Get current location
  const { data, loading, error } = useQuery(ME_QUERY, { fetchPolicy: 'network-only' }); // Add fetchPolicy: 'network-only'

  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.user?.role;

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>{t('loadingUserData')}</Typography>
        </Box>
      );
    }

    if (error) {
      console.error('Error fetching user data in PrivateRoute:', error);
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }

    const user = data?.me;

    if (!user) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }

    // Check for required role
    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to="/login?message=unauthorized" />;
    }

    // --- Specific check for seller dashboard and inactive store ---
    if (location.pathname === '/seller-dashboard' && userRole === 'seller') {
      // If seller has no store OR their store is inactive
      if (!user.store || user.store.status !== 'active') {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="h6">{t('storeInactiveTitle')}</Typography>
              <Typography>{t('storeInactiveMessage')}</Typography>
            </Alert>
            <Button variant="contained" onClick={() => window.location.href = '/'} sx={{ mt: 2 }}>
              {t('goToHome')}
            </Button>
          </Box>
        );
      }
    }
    // --- End of specific check ---

    return children;
  } catch (error) {
    console.error('Error decoding token or invalid token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;