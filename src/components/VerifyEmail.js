import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { VERIFY_EMAIL } from '../graphql/mutations';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const [verifyEmailMutation, { loading, error }] = useMutation(VERIFY_EMAIL, {
    onCompleted: (data) => {
      setMessage(data.verifyEmail);
      setSeverity('success');
      // Optionally redirect after a few seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (err) => {
      setMessage(err.message);
      setSeverity('error');
    },
  });

  useEffect(() => {
    if (token) {
      verifyEmailMutation({ variables: { token } });
    } else {
      setMessage('No verification token found.');
      setSeverity('error');
    }
  }, [token, verifyEmailMutation]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying your email...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Email Verification
        </Typography>
        {message && <Alert severity={severity}>{message}</Alert>}
      </Box>
    </Container>
  );
};

export default VerifyEmail;
