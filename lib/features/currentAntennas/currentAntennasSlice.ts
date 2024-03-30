import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AccessPoint } from '../../../app/types';

type currentAntennasState = { value: { mode: string; data: AccessPoint[] } };

export const currentAntennasSlice = createSlice({
  name: 'currentAntennas',
  initialState: {
    value: {
      mode: 'actual',
      data: [],
    },
  } satisfies currentAntennasState as currentAntennasState,
  reducers: {
    initializeCurrent: (state, action: PayloadAction<AccessPoint[]>) => {
      return { ...state, value: { mode: 'actual', data: action.payload } };
    },
    changeCurrent: (
      state,
      action: PayloadAction<{ mode: string; data: AccessPoint[] }>
    ) => {
      return { ...state, value: action.payload };
    },
    updateCurrent: (state, action: PayloadAction<AccessPoint>) => {
      const newArray = state.value.data.map((item) => {
        if (item.id === action.payload.id) {
          return action.payload;
        }
        return item;
      });
      return { ...state, value: { mode: state.value.mode, data: newArray } };
    },
  },
});

export const { initializeCurrent, changeCurrent, updateCurrent } =
  currentAntennasSlice.actions;

export default currentAntennasSlice.reducer;

// https://redux-toolkit.js.org/usage/usage-with-typescript
