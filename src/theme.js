import { createTheme } from '@mui/material/styles';

// Define the new, elegant color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#26A69A', // A friendly, professional teal
    },
    secondary: {
      main: '#123458',
    },
    background: {
      default: '#F7F9FC', // A very light, soft gray for the page background
      paper: '#FFFFFF',   // Pure white for surfaces like cards and the navbar
    },
    text: {
      primary: '#263238',   // Dark slate gray for primary text for a softer look
      secondary: '#546E7A', // A lighter gray for secondary text
    },
    error: {
      main: '#D32F2F',
    },
    success: {
      main: '#2E7D32',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 'bold',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // Ensure Navbar background is white
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)', // A subtle shadow for depth
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
        },
        containedPrimary: {
          color: '#FFFFFF', // Ensure text on primary buttons is white
        },
        containedSecondary: {
          color: '#FFFFFF', // Ensure text on secondary buttons is white
        },
      },
    },
  },
});

export default theme;