// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   gameStarted: false,
//   gameData: null,
//   sittingOutPlayer: null,
//   playersWhoSatOut: [],
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
//       state.gameStarted = true;
//     },
//     updatePlayersWhoSatOut: (state, action) => {
//       state.playersWhoSatOut = action.payload;
//     },
//   },
// });

// export const { startGame, resetGame, setGameState, updatePlayersWhoSatOut } = gameSlice.actions;
// export default gameSlice.reducer;








// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   gameStarted: false,
//   gameState: null,
//   sittingOutPlayer: null,
//   playersWhoSatOut: [],
// };

// const gameSlice = createSlice({
//   name: 'game',
//   initialState,
//   reducers: {
//     startGame: (state) => {
//       state.gameStarted = true;
//       state.gameState = 'answerInitialQuestion'; // Set initial game state
//     },
//     resetGame: (state) => {
//       state.gameStarted = false;
//       state.gameState = null;
//       state.sittingOutPlayer = null;
//       state.playersWhoSatOut = [];
//     },
//     setGameState: (state, action) => {
//       state.gameState = action.payload.state;
//       state.sittingOutPlayer = action.payload.sittingOutPlayer;
//       state.gameStarted = true; // This assumes gameState change implies game is ongoing
//     },
//     updatePlayersWhoSatOut: (state, action) => {
//       state.playersWhoSatOut = action.payload;
//     },
//   },
// });

// export const { startGame, resetGame, setGameState, updatePlayersWhoSatOut } = gameSlice.actions;
// export default gameSlice.reducer;


import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gameStarted: false,
  gameData: null,
  gameState: null,
  sittingOutPlayer: null,
  playersWhoSatOut: [],
  currentQuestion: '',
  questionMap: {}, // To store username to question mapping
  currentPlayerIndex: 0, // To track the index of the current sitting out player
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      // Return updated state with gameStarted set to true and initial game state
      return { ...state, gameStarted: true, gameState: 'answerInitialQuestion' };
    },
    resetGame: (state, action) => {
      // Return updated state with gameStarted set to false and clear game data
      return { ...state, gameStarted: false, gameData: null, gameState: null, sittingOutPlayer: null, playersWhoSatOut: [] };
    },
    setGameState: (state, action) => {
      // Return updated state with new game state and sitting out player
      return { 
        ...state, 
        gameState: action.payload.state, 
        sittingOutPlayer: action.payload.sittingOutPlayer,
        gameStarted: true
      };
    },
    updatePlayersWhoSatOut: (state, action) => {
      // Return updated state with new list of players who sat out
      return { ...state, playersWhoSatOut: action.payload };
    },
    setCurrentQuestion: (state, action) => {
      // Return updated state with new current question
      return { ...state, currentQuestion: action.payload.question };
    },
    // setCurrentQuestion: (state, action) => {
    //   state.currentQuestion = action.payload;
    // },
    setQuestionMap(state, action) {
      // Properly merge new questions with existing questionMap
      state.questionMap = {
        ...state.questionMap, // Keep existing entries
        ...action.payload,    // Merge in new question(s)
      };
    },
    setCurrentPlayerIndex: (state, action) => {
      return { ...state, currentPlayerIndex: action.payload };
    },
    getNextQuestion: (state) => {
      const usernames = Object.keys(state.questionMap);
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % usernames.length; // Cycle through the usernames
      const nextPlayer = usernames[state.currentPlayerIndex];
      state.sittingOutPlayer = nextPlayer;
      state.currentQuestion = state.questionMap[nextPlayer];
    },
  },
});

export const { startGame, resetGame, setGameState, updatePlayersWhoSatOut, setCurrentQuestion, setQuestionMap, setCurrentPlayerIndex, getNextQuestion } = gameSlice.actions;
export default gameSlice.reducer;