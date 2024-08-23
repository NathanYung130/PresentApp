// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   gameStarted: false,
//   gameData: null,
// };

// const gameSlice = createSlice({
//   name: 'game',
//   initialState,
//   reducers: {
//     startGame: (state, action) => {
//       return { ...state, gameStarted: true}
//     },
//     resetGame: (state, action) => {
//       return { ...state, gameStarted: false}
//       /*
//       state.gameStarted = false;
//       state.gameData = null;
//       */
//     },
//     setGameState: (state, action) => {
//       state.gameState = action.payload.state;
//       state.sittingOutPlayer = action.payload.sittingOutPlayer;
//     },
//   },
// });

// export const { startGame, resetGame } = gameSlice.actions;
// export default gameSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gameStarted: false,
  gameState: null,
  sittingOutPlayer: null,
  playersWhoSatOut: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.gameStarted = true;
    },
    resetGame: (state) => {
      return initialState;
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