import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import CartPage from './components/CartPage';
import StoresPage from './components/StoresPage';
import StoreDetailPage from './components/StoreDetailPage';
import ProductDetailPage from './components/ProductDetailPage';
import ProductsPage from './components/ProductsPage';
import UserProfile from './components/UserProfile';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MonetizationPanel from './components/MonetizationPanel';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/stores/:id" element={<StoreDetailPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route
            path="/order-confirmation/:orderId"
            element={
              <PrivateRoute>
                <OrderConfirmationPage />
              </PrivateRoute>
            }
          />
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
              <PrivateRoute requiredRole="admin">
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
          <Route
            path="/admin/monetization"
            element={
              <PrivateRoute requiredRole="admin">
                <MonetizationPanel />
              </PrivateRoute>
            }
          />
        </Routes>
      </Box>
      {/* Google AdSense Banner */}
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-2537491383888831"
             data-ad-slot="8469117880"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </Box>
      {/* End Google AdSense Banner */}
      <Footer />
    </Box>
  );
}

export default App;