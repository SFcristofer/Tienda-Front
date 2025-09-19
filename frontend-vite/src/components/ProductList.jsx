import React from 'react';
import './ProductList.css'; // Import the new CSS file
import { gql, useQuery } from '@apollo/client';

const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    getAllProducts {
      id
      name
      description
      price
      imageUrl
      store {
        name
      }
      category {
        name
      }
    }
  }
`;

function ProductList() {
  const { loading, error, data } = useQuery(GET_ALL_PRODUCTS);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error al cargar productos: {error.message}</p>;

  return (
    <div className="product-list-section">
      <h2>Nuestros Productos</h2>
      <div style={{ marginBottom: '30px' }}></div>
      <div className="product-grid">
        {data.getAllProducts.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} className="product-image" />
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-store">Tienda: {product.store.name}</p>
            <p className="product-category">Categoría: {product.category ? product.category.name : 'N/A'}</p>
            {/* <p className="product-description">{product.description}</p> */}
            <button className="add-to-cart-button">Añadir al Carrito</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;