import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gameStarted: false,
  gameData: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state, action) => {
      return { ...state, gameStarted: true}
    },
    resetGame: (state, action) => {
      return { ...state, gameStarted: false}
      /*
      state.gameStarted = false;
      state.gameData = null;
      */
    },
  },
});

export const { startGame, resetGame } = gameSlice.actions;
export default gameSlice.reducer;
