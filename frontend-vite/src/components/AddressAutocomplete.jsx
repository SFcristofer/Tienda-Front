import React, { useState, useEffect } from 'react';
import {
  TextField, Box, Paper, List, ListItem, ListItemText, CircularProgress, Alert,
} from '@mui/material';
import { useLazyQuery, gql } from '@apollo/client';

const GET_ADDRESS_SUGGESTIONS = gql`
  query GetAddressSuggestions($input: String!) {
    getAddressSuggestions(input: $input) {
      description
      placeId
    }
  }
`;

const GET_PLACE_DETAILS = gql`
  query GetPlaceDetails($placeId: String!) {
    getPlaceDetails(placeId: $placeId) {
      description
      street
      city
      state
      zipCode
      country
      latitude
      longitude
    }
  }
`;

const AddressAutocomplete = ({ onPlaceSelected }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [getSuggestions, { loading, error, data }] = useLazyQuery(GET_ADDRESS_SUGGESTIONS);
  const [getDetails, { loading: detailsLoading, error: detailsError }] = useLazyQuery(GET_PLACE_DETAILS);

  useEffect(() => {
    if (data?.getAddressSuggestions) {
      setSuggestions(data.getAddressSuggestions);
    }
  }, [data]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value.length > 2) { // Fetch suggestions only after a few characters
      getSuggestions({ variables: { input: value } });
    }
  };

  const handleSuggestionClick = async (placeId) => {
    setInput('');
    setSuggestions([]);
    try {
      const { data: detailsData } = await getDetails({ variables: { placeId } });
      if (detailsData?.getPlaceDetails) {
        onPlaceSelected(detailsData.getPlaceDetails);
      }
    } catch (e) {
      console.error("Error fetching place details", e);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        label="Buscar Dirección"
        value={input}
        onChange={handleInputChange}
        margin="normal"
        autoComplete="off"
        InputProps={{
          endAdornment: loading && <CircularProgress size={20} />
        }}
      />
      {suggestions.length > 0 && (
        <Paper sx={{ position: 'absolute', zIndex: 1, width: '100%', mt: 1 }}>
          <List>
            {suggestions.map(suggestion => (
              <ListItem key={suggestion.placeId} onClick={() => handleSuggestionClick(suggestion.placeId)}>
                <ListItemText primary={suggestion.description} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      {error && <Alert severity="error">{error.message}</Alert>}
      {detailsError && <Alert severity="error">{detailsError.message}</Alert>}
    </Box>
  );
};

export default AddressAutocomplete;
