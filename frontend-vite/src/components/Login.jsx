import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx'; // Import AuthContext

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password)
  }
`;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use login from AuthContext

  const [loginUser, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      const token = data.loginUser;
      login(token); // Call login from AuthContext
      navigate('/'); // Redirect to home page or dashboard
    },
    onError: (err) => {
      console.error('Login error:', err.message);
      // Display error message to user (e.g., using a Snackbar or alert)
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await loginUser({ variables: { email, password } });
    } catch (e) {
      // Error handled by onError callback
    }
  };

  return (
    <Container maxWidth="xs" sx={{
      mt: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor: 'background.paper', // Use Material-UI theme background color
      p: 4, // Padding
      borderRadius: 2, // Border radius
      boxShadow: 3, // Shadow
    }}>
      <style>{`.login-heading { color: black !important; }`}</style>
      <Typography variant="h4" component="h2" gutterBottom className="login-heading">
        Iniciar Sesión
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
        {error && <Typography color="error" variant="body2">{error.message}</Typography>}
      </Box>
    </Container>
  );
}

export default Login;
