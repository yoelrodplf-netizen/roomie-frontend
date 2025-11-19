// src/components/LocationInput.jsx
import React from 'react';
import { GoogleAutocomplete } from 'react-google-autocomplete';

const LocationInput = ({ value, onChange }) => {
  // ✅ Obtiene la API Key de las variables de entorno
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
                 process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('❌ Google Maps API Key no configurada. Crea un archivo .env con REACT_APP_GOOGLE_MAPS_API_KEY');
    return (
      <input
        placeholder="Ubicación (API Key no configurada)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          boxSizing: 'border-box'
        }}
      />
    );
  }

  return (
    <GoogleAutocomplete
      apiKey={apiKey}
      onPlaceSelected={(place) => {
        onChange(place.formatted_address || '');
      }}
      options={{
        types: ['(cities)', 'geocode'],
        componentRestrictions: { country: 'mx' }
      }}
      style={{
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        boxSizing: 'border-box',
        fontSize: '1rem'
      }}
      defaultValue={value}
      placeholder="Ej: Ciudad de México, Monterrey"
    />
  );
};

export default LocationInput;