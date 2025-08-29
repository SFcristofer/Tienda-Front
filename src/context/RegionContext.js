
import React, { createContext, useState, useEffect, useContext } from 'react';
import { GET_AVAILABLE_STORE_COUNTRIES } from '../graphql/queries';
import { useQuery } from '@apollo/client';

export const RegionContext = createContext();

export const useRegion = () => {
  return useContext(RegionContext);
};

export const RegionProvider = ({ children }) => {
  const [region, setRegion] = useState(null); // 'region' will now represent the selected country
  const { data: countriesData, loading: countriesLoading, error: countriesError } = useQuery(GET_AVAILABLE_STORE_COUNTRIES);

  useEffect(() => {
    // Try to get country from localStorage first
    const storedCountry = localStorage.getItem('userCountry');
    if (storedCountry) {
      setRegion(storedCountry);
      return;
    }

    // If not in localStorage, try geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const countryComponent = data.results[0].address_components.find(component => component.types.includes('country'));
              if (countryComponent) {
                const countryCode = countryComponent.short_name;
                setRegion(countryCode);
                localStorage.setItem('userCountry', countryCode);
              }
            }
          } catch (error) {
            console.error("Error fetching country from coordinates:", error);
          }
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          // Fallback to a default country if geolocation fails
          setRegion('US'); // Default to US or another suitable country
          localStorage.setItem('userCountry', 'US');
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      // Fallback to a default country if geolocation is not supported
      setRegion('US'); // Default to US or another suitable country
      localStorage.setItem('userCountry', 'US');
    }
  }, []); // Run only once on mount

  const handleRegionSelection = (selectedRegion) => {
    setRegion(selectedRegion);
    localStorage.setItem('userCountry', selectedRegion); // Save preference on manual selection
  };

  const value = {
    region,
    setRegion,
    availableCountries: countriesData?.getAvailableStoreCountries || [],
    countriesLoading,
    countriesError,
    handleRegionSelection,
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
};
