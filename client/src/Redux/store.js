import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import roomReducer from './roomSlice';


export const store = configureStore({
  reducer: {
    game: gameReducer,
    room: roomReducer,
  },
});