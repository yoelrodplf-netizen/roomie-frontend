import React from 'react';
import { GoogleAutocomplete } from 'react-google-autocomplete';

const LocationInput = ({ value, onChange }) => {
  return (
    <GoogleAutocomplete
      apiKey="AIzaSyCOO3EpXC9BQgdPdunw_afkgYInUk-k2Mo"
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