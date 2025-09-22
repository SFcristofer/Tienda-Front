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
import CartPage from './components/CartPage'; // Import CartPage
function App() {
  return (
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
          <Route path="/cart" element={<CartPage />} /> {/* Add CartPage route */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
