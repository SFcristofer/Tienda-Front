import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'; // Import AuthProvider
import { CartProvider } from './context/CartContext.jsx'; // Import CartProvider
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient'; // Import your Apollo Client instance

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
