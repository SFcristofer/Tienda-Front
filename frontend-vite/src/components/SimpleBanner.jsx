import React, { useState } from 'react';

function SimpleBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="simple-banner">
      <p className="simple-banner-text">
        ¡Oferta especial! Envío gratis en todos los pedidos por tiempo limitado.
      </p>
      <button className="simple-banner-close" onClick={() => setIsVisible(false)}>
        &times;
      </button>
    </div>
  );
}

export default SimpleBanner;