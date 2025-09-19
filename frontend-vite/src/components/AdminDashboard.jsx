import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, isLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores pueden acceder a este panel.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <h3>Panel de Administración</h3>
        <nav>
          <ul>
            <li><Link to="/admin/users">Gestión de Usuarios</Link></li>
            <li><Link to="/admin/stores">Gestión de Tiendas</Link></li>
            <li><Link to="/admin/products">Gestión de Productos</Link></li>
            {/* Add more admin links here */}
          </ul>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet /> {/* Renders nested routes */}
      </main>
    </div>
  );
}

export default AdminDashboard;