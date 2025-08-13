import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET } from '../graphql/mutations';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const [requestPasswordReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET, {
    onCompleted: (data) => {
      setMessage(data.requestPasswordReset);
      setSeverity('success');
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
      setSeverity('error');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSeverity('info');
    await requestPasswordReset({ variables: { email } });
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Request Reset Link'}
          </Button>
          {message && <Alert severity={severity}>{message}</Alert>}
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
