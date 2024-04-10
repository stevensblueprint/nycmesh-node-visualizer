import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { SectorlobeData } from '../../../app/types';

type SectorlobesState = { value: SectorlobeData[] };

export const sectorlobesSlice = createSlice({
  name: 'sectorlobes',
  initialState: {
    value: [],
  } satisfies SectorlobesState as SectorlobesState,
  reducers: {
    initializeSectorlobes: (state, action: PayloadAction<SectorlobeData[]>) => {
      return { ...state, value: action.payload, old: action.payload };
    },
    replaceSectorlobes: (state, action: PayloadAction<SectorlobeData[]>) => {
      return { ...state, value: action.payload };
    },
    addSectorlobes: (state, action: PayloadAction<SectorlobeData>) => {
      return { ...state, value: [...state.value, action.payload] };
    },
    removeSectorlobes: (state, action: PayloadAction<SectorlobeData>) => {
      return {
        ...state,
        value: state.value.filter((item) => item.id !== action.payload.id),
      };
    },
    updateSectorlobes: (state, action: PayloadAction<SectorlobeData>) => {
      const newArray = state.value.map((item) => {
        if (item.id === action.payload.id) {
          return action.payload;
        }
        return item;
      });
      state = { ...state, value: newArray };
    },
  },
});

export const {
  initializeSectorlobes,
  replaceSectorlobes,
  addSectorlobes,
  removeSectorlobes,
  updateSectorlobes,
} = sectorlobesSlice.actions;

export default sectorlobesSlice.reducer;

// https://redux-toolkit.js.org/usage/usage-with-typescript
