import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword'; // New import
import ResetPassword from './components/ResetPassword'; // New import
import VerifyEmail from './components/VerifyEmail'; // New import
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import CartPage from './components/CartPage';
import StoresPage from './components/StoresPage';
import StoreDetailPage from './components/StoreDetailPage'; // Importamos StoreDetailPage
import ProductDetailPage from './components/ProductDetailPage'; // Importamos ProductDetailPage
import UserProfile from './components/UserProfile';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard'; // New import
import AnalyticsDashboard from './components/AnalyticsDashboard'; // New import
import CheckoutPage from './components/CheckoutPage'; // Importamos CheckoutPage
import OrderConfirmationPage from './components/OrderConfirmationPage'; // Importamos OrderConfirmationPage
import Footer from './components/Footer';
import { Box } from '@mui/material';

import { SnackbarProvider } from './context/SnackbarContext';

function App() {
  return (
    <SnackbarProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />{' '}
              {/* New route for Forgot Password */}
              <Route path="/reset-password/:token" element={<ResetPassword />} />{' '}
              {/* New route for Reset Password */}
              <Route path="/verify-email/:token" element={<VerifyEmail />} /> {/* New route for Email Verification */}
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <CheckoutPage />
                  </PrivateRoute>
                }
              />{' '}
              {/* Nueva ruta para Checkout */}
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/stores/:id" element={<StoreDetailPage />} />{' '}
              {/* Nueva ruta para el detalle de la tienda */}
              <Route path="/products/:id" element={<ProductDetailPage />} />{' '}
              {/* Nueva ruta para el detalle del producto */}
              <Route
                path="/order-confirmation/:orderId"
                element={
                  <PrivateRoute>
                    <OrderConfirmationPage />
                  </PrivateRoute>
                }
              />{' '}
              {/* Nueva ruta para la confirmación del pedido */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/seller-dashboard"
                element={
                  <PrivateRoute>
                    <SellerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRole="admin"> {/* New route for Admin Dashboard */}
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AnalyticsDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
