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
  CardContent,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useMutation, gql, useApolloClient } from '@apollo/client';
import { useTranslation } from 'react-i18next'; // Importar hook de traducción
import { useCart } from '../context/CartContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
  const { mergeCartsOnLogin } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, email, phoneNumber, password, confirmPassword } = formData;

  // Mutation for standard registration
  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.registerUser);
      client.refetchQueries({ include: 'all' });
      mergeCartsOnLogin(); // Call merge function
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
        mergeCartsOnLogin(); // Call merge function
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
    if (e.target.name === 'phoneNumber') {
      // Allow only numbers and a leading '+'
      const value = e.target.value;
      const cleanedValue = value.startsWith('+') ? '+' + value.substring(1).replace(/[^0-9]/g, '') : value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [e.target.name]: cleanedValue });
      setPhoneNumberError(''); // Clear error on change
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownConfirmPassword = (event) => {
    event.preventDefault();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConfirmPasswordError(''); // Clear previous error
    setPhoneNumberError(''); // Clear previous error
    setEmailError(''); // Clear previous error

    if (!name || !email || !phoneNumber || !password || !confirmPassword) {
      setError(t('allFieldsRequired'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('invalidEmailFormat')); // Assuming a translation key
      setError(t('invalidEmailFormat'));
      return;
    }

    // Phone number validation (basic: only digits and optional leading +)
    const phoneRegex = /^\+?[0-9]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneNumberError(t('invalidPhoneNumberFormat')); // Assuming a translation key
      setError(t('invalidPhoneNumberFormat'));
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(t('passwordsDoNotMatch'));
      setError(t('passwordsDoNotMatch'));
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
            error={Boolean(emailError)}
            helperText={emailError}
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
            type="tel"
            error={Boolean(phoneNumberError)}
            helperText={phoneNumberError}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={onChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label={t('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={onChange}
            error={Boolean(confirmPasswordError)}
            helperText={confirmPasswordError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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