import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ display: 'inline-block', margin: '0 10px' }}>
            <Link to="/products" style={{ textDecoration: 'none', color: '#007bff', fontSize: '1.2em' }}>Ver Productos</Link>
          </li>
          <li style={{ display: 'inline-block', margin: '0 10px' }}>
            <Link to="/stores" style={{ textDecoration: 'none', color: '#007bff', fontSize: '1.2em' }}>Explorar Tiendas</Link>
          </li>
        </ul>
      </nav>
      <p style={{ marginTop: '30px', fontSize: '0.9em', color: '#666' }}>
        Tu destino único para compras en línea.
      </p>
    </div>
  );
};

export default Home;
