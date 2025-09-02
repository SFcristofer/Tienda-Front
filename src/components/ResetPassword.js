import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD } from '../graphql/mutations';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useTranslation } from 'react-i18next'; // Added useTranslation import
// ...
const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const [token, setToken] = useState(null); // State to store token

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError(t('invalidResetToken'));
    }
  }, [location.search, t]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Extract token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
      const tokenFromUrl = queryParams.get('token'); // Renamed to avoid conflict

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: (data) => {
      setMessage(data.resetPassword);
      setError('');
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (err) => {
      setError(err.message);
      setMessage('');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError(t('invalidOrExpiredToken'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    if (!password) {
      setError(t('passwordRequired'));
      return;
    }

    await resetPassword({ variables: { token, newPassword: password } });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {t('Cambiar contraseña')}
      </Typography>
      {!token && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {t('missingResetToken')}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label={t('newPassword')}
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label={t('confirmNewPassword')}
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading || !token}
        >
          {loading ? t('resetting') : t('Cambiar contraseña')}
        </Button>
        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Container>
  );
};

export default ResetPassword;
