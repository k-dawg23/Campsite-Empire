import { configureStore } from '@reduxjs/toolkit';
import { gameSlice } from '../features/simulation/gameSlice';

export const store = configureStore({
  reducer: {
    game: gameSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 64
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
