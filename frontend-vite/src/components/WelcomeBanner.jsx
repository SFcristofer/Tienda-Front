import React from 'react';
import BannerImage from '../assets/Banner.png'; // Importa la imagen del banner

function WelcomeBanner() {
  return (
    <div 
      className="welcome-banner"
      style={{
        backgroundImage: `url(${BannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white', // Cambia el color del texto a blanco para que contraste con la imagen
      }}
    >
      <h1 className="welcome-banner-title">
        ¡Bienvenido a UniShopp!
      </h1>
      <p className="welcome-banner-text">
        Descubre una gran variedad de productos de tus tiendas favoritas.
      </p>
      <button className="welcome-banner-button">
        Explorar Ahora
      </button>
    </div>
  );
}

export default WelcomeBanner;