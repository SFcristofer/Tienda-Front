import { createTheme } from '@mui/material/styles';

// Nuestra paleta de colores personalizada
const theme = createTheme({
  palette: {
    primary: {
      main: '#333333', // Gris carbón oscuro para texto principal
    },
    secondary: {
      main: '#E07A5F', // Terracota/Salmón para acentos y botones
    },
    background: {
      default: '#F9F9F9', // Blanco roto para el fondo de la página
      paper: '#FFFFFF', // Blanco puro para superficies como tarjetas y el navbar
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700, // Títulos más audaces
    },
    h5: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none', // Botones sin mayúsculas para un look más moderno
      fontWeight: 'bold',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Esquinas más redondeadas
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Sombra sutil
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)', // Efecto de levantamiento al pasar el ratón
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', // Sombra más pronunciada al pasar el ratón
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Bordes redondeados para los botones
        },
      },
    },
  },
});

export default theme;
