import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Alert, // Added Alert import
} from '@mui/material';
import { useMutation, useApolloClient } from '@apollo/client';
import { REGISTER_USER } from '../graphql/mutations';

const Register = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registerUser, { loading, error }] = useMutation(REGISTER_USER, {
    onCompleted: async (data) => {
      if (data.registerUser) {
        setRegistrationSuccess(true);
      }
    },
    onError: (err) => {
      console.error('Registration error:', err);
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ variables: { name, email, password } });
    } catch (err) {
      // El error ya se maneja en el onError de useMutation
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        {registrationSuccess ? (
          <Alert severity="success" sx={{ mt: 3 }}>
            Registration successful! Please check your email to verify your account.
          </Alert>
        ) : (
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            name="name"
            value={name}
            onChange={onChange}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={onChange}
          />

          {error && <Typography color="error">{String(error.message)}</Typography>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </Box>
        )}
      </Box>
    </Container>
  );
};

export default Register;
