import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Paper
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
      <Paper sx={{ p: 4, mt: 4 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          ¡Pedido Confirmado!
        </Typography>
        <Typography variant="body1" paragraph>
          Gracias por tu compra. Tu pedido ha sido recibido y está siendo procesado.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Número de Pedido: {orderId}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" onClick={() => navigate('/')}>
            Volver al Inicio
          </Button>
          <Button variant="outlined" onClick={() => navigate('/profile')}> {/* Assuming a profile page with order history */}
            Ver Mis Pedidos
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default OrderConfirmationPage;