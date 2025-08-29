import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [action, setAction] = useState(null);
  const navigate = useNavigate();

  const showSnackbar = (message, severity = 'info', action = null) => {
    setMessage(message);
    setSeverity(severity);
    setAction(action);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const renderAction = () => {
    if (!action) return null;
    return (
      <Button color="inherit" size="small" onClick={() => {
        navigate(action.path);
        handleClose();
      }}>
        {action.label}
      </Button>
    );
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }} action={renderAction()}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
