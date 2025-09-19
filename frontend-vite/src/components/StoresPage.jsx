import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import './StoresPage.css';

const GET_NEARBY_STORES = gql`
  query GetNearbyStores($latitude: Float!, $longitude: Float!, $radius: Float) {
    getNearbyStores(latitude: $latitude, longitude: $longitude, radius: $radius) {
      id
      name
      description
      imageUrl
      owner {
        name
      }
      storeCategories {
        name
      }
      distance
    }
  }
`;

function StoresPage() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [radius, setRadius] = useState(20); // Default radius in km

  const { loading, error, data } = useQuery(GET_NEARBY_STORES, {
    variables: { latitude, longitude, radius },
    skip: !latitude || !longitude, // Skip query if no coordinates
  });

  console.log('Data received in StoresPage:', data);

  const handleSearch = () => {
    // This function will trigger a re-fetch of the query with updated variables
    // The useQuery hook handles this automatically when variables change.
  };

  return (
    <div className="stores-page-container">
      <h2>Tiendas Cercanas</h2>
      <div className="location-input">
        <input
          type="number"
          placeholder="Latitud"
          value={latitude || ''}
          onChange={(e) => setLatitude(parseFloat(e.target.value))}
        />
        <input
          type="number"
          placeholder="Longitud"
          value={longitude || ''}
          onChange={(e) => setLongitude(parseFloat(e.target.value))}
        />
        <input
          type="number"
          placeholder="Radio (km)"
          value={radius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
        />
        <button onClick={handleSearch}>Buscar Tiendas</button>
      </div>

      {loading && <p>Cargando tiendas...</p>}
      {error && <p>Error al cargar tiendas: {error.message}</p>}
      {!latitude || !longitude ? (
        <p>Por favor, introduce tu latitud y longitud para buscar tiendas cercanas.</p>
      ) : data && data.getNearbyStores.length === 0 ? (
        <p>No se encontraron tiendas cercanas en este radio.</p>
      ) : (
        <div className="stores-grid">
          {data && data.getNearbyStores.map(store => (
            <div key={store.id} className="store-card">
              <img src={store.imageUrl || 'https://via.placeholder.com/150'} alt={store.name} className="store-image" />
              <h3 className="store-name">{store.name}</h3>
              <p className="store-owner">Propietario: {store.owner.name}</p>
              <p className="store-category">Categoría: {store.storeCategories && store.storeCategories.length > 0 ? store.storeCategories[0].name : 'N/A'}</p>
              <p className="store-description">{store.description}</p>
              {store.distance && <p className="store-distance">Distancia: {store.distance.toFixed(2)} km</p>}
              <button className="view-store-button">Ver Tienda</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StoresPage;