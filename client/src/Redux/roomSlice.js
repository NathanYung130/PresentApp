import { createSlice, miniSerializeError } from '@reduxjs/toolkit';

const initialState = {
  userName: null,
  roomId: null,
  socketId: null,
  currUsers: 0,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, userName: action.payload };
    },
    setRoomId: (state, action) => {
      return { ...state, roomId: action.payload };
    },
    setSocketId: (state, action) => {
      return { ...state, socketId: action.payload };
    },
    setCurrUsers: (state, action) => {
      state.currUsers = action.payload;
    },
  },
});

export const { setUser, setRoomId, setSocketId, setCurrUsers } = roomSlice.actions;
export default roomSlice.reducer;