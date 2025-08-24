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
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password)
  }
`;

const GOOGLE_LOGIN = gql`
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken)
  }
`;

const Login = () => {
  const { t } = useTranslation(); // Hook para obtener la función de traducción
  const navigate = useNavigate();
  const client = useApolloClient();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { email, password } = formData;

  // Mutation for standard login
  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.loginUser);
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
        document.getElementById('google-sign-in-button-login'),
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
    if (!email || !password) {
      setError(t('allFieldsRequired'));
      return;
    }
    loginUser({ variables: { email, password } });
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          {t('signIn')}
        </Typography>
        <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3 }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('emailAddress')}
            name="email"
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
            label={t('password')}
            type="password"
            id="password"
            autoComplete="current-password"
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
            {loading ? t('signingIn') : t('signIn')}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                {t('forgotPassword')}
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {t('dontHaveAccount')}
              </Link>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3, width: '100%' }}>{t('orDivider')}</Divider>

        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div id="google-sign-in-button-login" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;