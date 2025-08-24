import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Link,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { useMutation, gql, useApolloClient } from '@apollo/client';
import { useTranslation } from 'react-i18next'; // Importar hook de traducción

// Define the GraphQL mutations
const REGISTER_USER = gql`
  mutation RegisterUser($name: String!, $email: String!, $password: String!, $phoneNumber: String) {
    registerUser(name: $name, email: $email, password: $password, phoneNumber: $phoneNumber)
  }
`;

const GOOGLE_LOGIN = gql`
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken)
  }
`;

const Register = () => {
  const { t } = useTranslation(); // Hook para obtener la función de traducción
  const navigate = useNavigate();
  const client = useApolloClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { name, email, phoneNumber, password } = formData;

  // Mutation for standard registration
  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.registerUser);
      client.refetchQueries({ include: 'all' });
      navigate('/');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Mutation for Google login
  const [googleLogin] = useMutation(GOOGLE_LOGIN, {
    onCompleted: async (data) => {
      if (data.googleLogin) {
        localStorage.setItem('token', data.googleLogin);
        await client.refetchQueries({ include: ['Me'] });
        navigate('/');
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      google.accounts.id.renderButton(
        document.getElementById('google-sign-in-button-register'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  }, [googleLogin]);

  const handleGoogleLogin = async (response) => {
    if (response.credential) {
      googleLogin({ variables: { idToken: response.credential } });
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !phoneNumber || !password) {
      setError(t('allFieldsRequired'));
      return;
    }
    registerUser({ variables: { name, email, phoneNumber, password } });
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          {t('signUp')}
        </Typography>
        <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3 }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal"
            autoComplete="name"
            name="name"
            required
            fullWidth
            id="name"
            label={t('fullName')}
            autoFocus
            value={name}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('emailAddress')}
            name="email"
            autoComplete="email"
            value={email}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="phoneNumber"
            label={t('phoneNumber')}
            name="phoneNumber"
            autoComplete="tel"
            value={phoneNumber}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('password')}
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={onChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? t('signingUp') : t('signUp')}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                {t('alreadyHaveAccount')}
              </Link>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 3, width: '100%' }}>{t('orDivider')}</Divider>

        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div id="google-sign-in-button-register" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;