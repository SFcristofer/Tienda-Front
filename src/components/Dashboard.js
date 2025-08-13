import React from 'react';
import { useQuery } from '@apollo/client';
import { Typography, Container, Box, CircularProgress, Alert } from '@mui/material';
import SellerDashboard from './SellerDashboard';
import UserProfile from './UserProfile';
import { ME_QUERY } from '../graphql/queries';

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const { data, loading, error } = useQuery(ME_QUERY, { skip: !token });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const user = data?.me;

  if (!user && token) {
    return <Alert severity="warning">Session expired or invalid. Please log in again.</Alert>;
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="h6">Welcome, {user?.name}</Typography>
      </Box>

      {user?.role === 'seller' && <SellerDashboard />}
      {user?.role === 'customer' && <UserProfile />}
    </Container>
  );
};

export default Dashboard;
