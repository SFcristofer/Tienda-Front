import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD } from '../graphql/mutations';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: (data) => {
      setMessage(data.resetPassword);
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

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setSeverity('error');
      return;
    }

    await resetPassword({ variables: { token, newPassword } });
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
          {message && <Alert severity={severity}>{message}</Alert>}
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword;
