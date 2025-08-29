import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';



import Home from './components/Home';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import CartPage from './components/CartPage';
import StoresPage from './components/StoresPage';
import StoreDetailPage from './components/StoreDetailPage'; // Importamos StoreDetailPage
import ProductDetailPage from './components/ProductDetailPage'; // Importamos ProductDetailPage
import ProductsPage from './components/ProductsPage'; // Importar la nueva página de productos
import UserProfile from './components/UserProfile';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard'; // New import
import AnalyticsDashboard from './components/AnalyticsDashboard'; // New import
import CheckoutPage from './components/CheckoutPage'; // Importamos CheckoutPage
import OrderConfirmationPage from './components/OrderConfirmationPage'; // Importamos OrderConfirmationPage
import Footer from './components/Footer';
import { Box } from '@mui/material';

function App() {
  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            
            
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
            <Route path="/products" element={<ProductsPage />} />
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
  );
}


export default App;
