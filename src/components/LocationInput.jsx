import React from 'react';
import { GoogleAutocomplete } from 'react-google-autocomplete';

const LocationInput = ({ value, onChange }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
                 process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <input
        placeholder="Ubicación"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
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
        fontSize: '1rem'
      }}
      defaultValue={value}
      placeholder="Ej: Ciudad de México"
    />
  );
};

export default LocationInput;