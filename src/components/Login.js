import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useMutation, useApolloClient } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [verificationWarning, setVerificationWarning] = useState('');
  const [loginUser, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted: async (data) => {
      if (data.loginUser) {
        const token = data.loginUser;
        const decodedToken = jwtDecode(token);

        if (decodedToken.user) {
          localStorage.setItem('token', token);
          await client.refetchQueries({ include: ['Me'] });
          navigate('/');
        } else {
          setVerificationWarning('Your account is not verified. Please check your email for a verification link.');
          localStorage.removeItem('token'); // Ensure token is not stored for unverified users
        }
      }
    },
    onError: (err) => {
      console.error('Login error:', err);
      setVerificationWarning(''); // Clear any previous warning on new error
    },
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ variables: { email, password } });
    } catch (err) {
      // El error ya se maneja en el onError de useMutation
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
            value={password}
            onChange={onChange}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 1 }}>
            <Link to="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {String(error.message)}
            </Typography>
          )}

          {verificationWarning && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {verificationWarning}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
