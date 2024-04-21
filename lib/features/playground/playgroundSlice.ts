import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AccessPoint } from '../../../app/types';

type PlaygroundState = {
  value: AccessPoint[];
  old: AccessPoint[];
  toBeUpdated: AccessPoint[];
};

export const playgroundSlice = createSlice({
  name: 'playground',
  initialState: {
    value: [],
    old: [],
    toBeUpdated: [],
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
    addToUpdatePlayground: (state, action: PayloadAction<AccessPoint>) => {
      for (let i = 0; i < state.toBeUpdated.length; i++) {
        if (state.toBeUpdated[i].id === action.payload.id) {
          return {
            ...state,
            toBeUpdated: state.toBeUpdated.map((item) => {
              if (item.id === action.payload.id) {
                return action.payload;
              }
              return item;
            }),
          };
        }
      }
      return { ...state, toBeUpdated: [...state.toBeUpdated, action.payload] };
    },
    clearToUpdatePlayground: (state) => {
      return { ...state, toBeUpdated: [] };
    },
    removeFromUpdatePlayground: (state, action: PayloadAction<AccessPoint>) => {
      return {
        ...state,
        toBeUpdated: state.toBeUpdated.filter(
          (item) => item !== action.payload
        ),
      };
    },
    replaceToUpdatePlayground: (
      state,
      action: PayloadAction<AccessPoint[]>
    ) => {
      return { ...state, toBeUpdated: action.payload };
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
  addToUpdatePlayground,
  clearToUpdatePlayground,
  removeFromUpdatePlayground,
  replaceToUpdatePlayground,
} = playgroundSlice.actions;

export default playgroundSlice.reducer;

// https://redux-toolkit.js.org/usage/usage-with-typescript
