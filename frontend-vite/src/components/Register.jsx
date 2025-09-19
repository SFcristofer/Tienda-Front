import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx'; // Import AuthContext

const REGISTER_USER = gql`
  mutation RegisterUser($name: String!, $email: String!, $password: String!) {
    registerUser(name: $name, email: $email, password: $password)
  }
`;

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use login from AuthContext

  const [registerUser, { loading, error }] = useMutation(REGISTER_USER, {
    onCompleted: (data) => {
      const token = data.registerUser;
      login(token); // Call login from AuthContext
      navigate('/'); // Redirect to home page or dashboard
    },
    onError: (err) => {
      console.error('Registration error:', err.message);
      // Display error message to user
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await registerUser({ variables: { name, email, password } });
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
      <style>{`.register-heading { color: black !important; }`}</style>
      <Typography variant="h4" component="h2" gutterBottom className="register-heading">
        Registrarse
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Nombre"
          name="name"
          autoComplete="name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
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
          autoComplete="new-password"
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
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>
        {error && <Typography color="error" variant="body2">{error.message}</Typography>}
      </Box>
    </Container>
  );
}

export default Register;