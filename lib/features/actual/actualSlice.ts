import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AccessPoint } from '../../../app/types';

type ActualState = { value: AccessPoint[] };

export const actualSlice = createSlice({
  name: 'actual',
  initialState: {
    value: [],
  } satisfies ActualState as ActualState,
  reducers: {
    initializeActual: (state, action: PayloadAction<AccessPoint[]>) => {
      return { ...state, value: action.payload };
    },
    replaceActual: (state, action: PayloadAction<AccessPoint[]>) => {
      return { ...state, value: action.payload };
    },
    addActual: (state, action: PayloadAction<AccessPoint>) => {
      return { ...state, value: [...state.value, action.payload] };
    },
    removeActual: (state, action) => {
      return {
        ...state,
        value: state.value.filter((item) => item !== action.payload),
      };
    },
    updateActual: (state, action: PayloadAction<AccessPoint>) => {
      const newArray = state.value.map((item) => {
        if (item.id === action.payload.id) {
          return action.payload;
        }
        return item;
      });
      return { ...state, value: newArray };
    },
  },
});

export const {
  initializeActual,
  replaceActual,
  addActual,
  removeActual,
  updateActual,
} = actualSlice.actions;

export default actualSlice.reducer;

// https://redux-toolkit.js.org/usage/usage-with-typescript
