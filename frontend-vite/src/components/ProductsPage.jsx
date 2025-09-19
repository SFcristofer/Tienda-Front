import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';

const GET_ALL_PRODUCTS = gql`
  query GetAllProducts(
    $categoryId: ID
    $minPrice: Float
    $maxPrice: Float
    $search: String
    $sortBy: String
    $sortOrder: String
  ) {
    getAllProducts(
      categoryId: $categoryId
      minPrice: $minPrice
      maxPrice: $maxPrice
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      id
      name
      description
      price
      imageUrl
      store {
        name
      }
      category {
        id
        name
      }
    }
  }
`;

const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
    }
  }
`;

function ProductsPage() {
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { loading: categoriesLoading, error: categoriesError, data: categoriesData } = useQuery(GET_ALL_CATEGORIES);

  const { loading, error, data } = useQuery(GET_ALL_PRODUCTS, {
    variables: {
      search: search || null,
      minPrice: parseFloat(minPrice) || null,
      maxPrice: parseFloat(maxPrice) || null,
      categoryId: selectedCategory || null,
    },
  });

  if (loading || categoriesLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error al cargar productos: {error.message}</p>;
  if (categoriesError) return <p>Error al cargar categorías: {categoriesError.message}</p>;

  return (
    <div className="products-page-container">
      <h2>Explora Nuestros Productos</h2>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
        <input
          type="number"
          placeholder="Precio mínimo"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="filter-input"
        />
        <input
          type="number"
          placeholder="Precio máximo"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="filter-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las categorías</option>
          {categoriesData.getAllCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {data.getAllProducts.length === 0 ? (
          <p>No se encontraron productos con los filtros aplicados.</p>
        ) : (
          data.getAllProducts.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} className="product-image" />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p className="product-store">Tienda: {product.store.name}</p>
              <p className="product-category">Categoría: {product.category ? product.category.name : 'N/A'}</p>
              <button className="add-to-cart-button">Añadir al Carrito</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductsPage;