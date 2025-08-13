import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme'; // Importamos nuestro tema

// Creamos el link a nuestra API de GraphQL
const httpLink = createHttpLink({
  uri: 'https://store-ehnr.onrender.com/graphql',
});

// Creamos un middleware para adjuntar el token a cada petición
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Creamos un link de error para manejar errores de GraphQL
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const { message, locations, path, extensions } of graphQLErrors) {
      // Manejar el error de "You must be logged in" sin mostrarlo como un error crítico en la consola
      if (message && message.includes('You must be logged in')) {
        console.warn(`[GraphQL handled warning]: Authentication required. Message: ${message}`);
        return; // Detener el procesamiento de este error
      }
      if (extensions && extensions.code === 'USER_ALREADY_EXISTS') {
        console.log(`[GraphQL handled error]: Message: ${message}, Code: ${extensions.code}`);
        return;
      }
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    }
  }
  if (networkError) {
    // También verificar si el error de red es de autenticación
    if (networkError.message && networkError.message.includes('You must be logged in')) {
      console.warn(
        `[Network handled warning]: Authentication required. Message: ${networkError.message}`
      );
      return; // Detener el procesamiento de este error
    }
    console.error(`[Network error]: ${networkError}`);
  }
});

// Combinamos los links
const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Normaliza los estilos y aplica el color de fondo */}
        <CartProvider>
          <App />
        </CartProvider>
      </ThemeProvider>
    </ApolloProvider>
  </React.StrictMode>
);
