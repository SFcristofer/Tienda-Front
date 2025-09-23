
import React from 'react';
import { useMutation, gql } from '@apollo/client';
import { Button, Box, Typography, Chip, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CREATE_STRIPE_ACCOUNT_LINK = gql`
  mutation CreateStripeAccountLink($storeId: ID!, $refreshUrl: String!, $returnUrl: String!) {
    createStripeAccountLink(storeId: $storeId, refreshUrl: $refreshUrl, returnUrl: $returnUrl)
  }
`;

const CREATE_STRIPE_LOGIN_LINK = gql`
  mutation CreateStripeLoginLink($storeId: ID!) {
    createStripeLoginLink(storeId: $storeId)
  }
`;

const StripeOnboarding = ({ store }) => {
  const [createAccountLink, { loading: loadingAccountLink }] = useMutation(CREATE_STRIPE_ACCOUNT_LINK);
  const [createLoginLink, { loading: loadingLoginLink }] = useMutation(CREATE_STRIPE_LOGIN_LINK);

  const handleOnboarding = async () => {
    try {
      const returnUrl = window.location.href; // Return to the current page
      const refreshUrl = window.location.href;

      const { data } = await createAccountLink({
        variables: { storeId: store.id, returnUrl, refreshUrl },
      });

      if (data.createStripeAccountLink) {
        window.location.href = data.createStripeAccountLink;
      }
    } catch (err) {
      console.error('Error creating Stripe account link:', err);
    }
  };

  const handleManageAccount = async () => {
    try {
        const { data } = await createLoginLink({ variables: { storeId: store.id } });
        if (data.createStripeLoginLink) {
            window.open(data.createStripeLoginLink, '_blank'); // Open in a new tab
        }
    } catch (err) {
        console.error('Error creating Stripe login link:', err);
    }
  }

  const loading = loadingAccountLink || loadingLoginLink;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Pagos de la Tienda</Typography>
      {store?.stripeAccountId ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <Chip icon={<CheckCircleIcon />} label="Cuenta de Stripe Conectada" color="success" />
            <Button
                variant="contained"
                onClick={handleManageAccount}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} /> : 'Administrar Cuenta de Stripe'}
            </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
                Conecta tu tienda con Stripe para empezar a recibir pagos de tus clientes de forma segura.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleOnboarding}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} /> : 'Configurar Pagos con Stripe'}
            </Button>
        </Box>
      )}
    </Box>
  );
};

export default StripeOnboarding;
