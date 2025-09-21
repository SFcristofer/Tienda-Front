import React from 'react';
import './App.css'; // Restaurando la importación de estilos
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePageContent from './components/HomePageContent';
import ProductsPage from './components/ProductsPage';
import StoresPage from './components/StoresPage';
import Login from './components/Login';
import Register from './components/Register';
import ProfilePage from './components/ProfilePage';
import CreateStorePage from './components/CreateStorePage';
import { AuthProvider } from './context/AuthContext.jsx'; // Import AuthProvider

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePageContent />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-store" element={<CreateStorePage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
