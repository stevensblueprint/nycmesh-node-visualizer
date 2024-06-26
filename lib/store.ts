import { configureStore } from '@reduxjs/toolkit';
import playgroundReducer from './features/playground/playgroundSlice';
import actualReducer from './features/actual/actualSlice';
import currentAntennasReducer from './features/currentAntennas/currentAntennasSlice';
import sectorlobesReducer from './features/sectorlobes/sectorlobesSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      playground: playgroundReducer,
      actual: actualReducer,
      currentAntennas: currentAntennasReducer,
      sectorlobes: sectorlobesReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the 'RootState' and 'AppDispatch' types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
