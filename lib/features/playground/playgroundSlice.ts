import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AccessPoint } from '../../../app/types';

type PlaygroundState = { value: AccessPoint[]; old: AccessPoint[] };

export const playgroundSlice = createSlice({
  name: 'playground',
  initialState: {
    value: [],
    old: [],
  } satisfies PlaygroundState as PlaygroundState,
  reducers: {
    initializePlayground: (state, action: PayloadAction<AccessPoint[]>) => {
      return { ...state, value: action.payload, old: action.payload };
    },
    replacePlayground: (state, action: PayloadAction<AccessPoint[]>) => {
      return { ...state, value: action.payload };
    },
    addPlayground: (state, action: PayloadAction<AccessPoint>) => {
      return { ...state, value: [...state.value, action.payload] };
    },
    removePlayground: (state, action) => {
      return {
        ...state,
        value: state.value.filter((item) => item !== action.payload),
      };
    },
    updatePlayground: (state, action: PayloadAction<AccessPoint>) => {
      const newArray = state.value.map((item) => {
        if (item.id === action.payload.id) {
          return action.payload;
        }
        return item;
      });
      state = { ...state, value: newArray };
    },
    replaceOldPlayground: (state, action: PayloadAction<AccessPoint[]>) => {
      return { ...state, old: action.payload };
    },
  },
});

export const {
  initializePlayground,
  replacePlayground,
  addPlayground,
  removePlayground,
  updatePlayground,
  replaceOldPlayground,
} = playgroundSlice.actions;

export default playgroundSlice.reducer;

// https://redux-toolkit.js.org/usage/usage-with-typescript
