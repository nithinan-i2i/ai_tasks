import { createSlice } from '@reduxjs/toolkit';

export interface Country {
  id: string;
  name: string;
}

export interface LocationState {
  countries: Country[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  countries: [
    { id: 'US', name: 'United States' },
    { id: 'CA', name: 'Canada' },
  ],
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {},
});

export default locationSlice.reducer; 