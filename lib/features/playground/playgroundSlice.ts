import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type PlaygroundState = { value: number[] };

export const playgroundSlice = createSlice({
  name: 'playground',
  initialState: {
    value: [],
  } satisfies PlaygroundState as PlaygroundState,
  reducers: {
    replace: (state, action: PayloadAction<number[]>) => {
      state.value = action.payload;
    },
    add: (state, action: PayloadAction<number>) => {
      state.value.push(action.payload);
    },
    remove: (state, action) => {
      state.value = state.value.filter((item) => item !== action.payload);
    },
  },
});

export const { replace, add, remove } = playgroundSlice.actions;

export default playgroundSlice.reducer;

// https://redux-toolkit.js.org/usage/usage-with-typescript
