import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gameStarted: false,
  gameData: null,
  sittingOutPlayer: null,
  playersWhoSatOut: [],
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
    setGameState: (state, action) => {
      state.gameState = action.payload.state;
      state.sittingOutPlayer = action.payload.sittingOutPlayer;
    },
    updatePlayersWhoSatOut: (state, action) => {
      state.playersWhoSatOut = action.payload;
    },
  },
});

export const { startGame, resetGame, setGameState, updatePlayersWhoSatOut } = gameSlice.actions;
export default gameSlice.reducer;

