import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userName: null,
  roomId: null,
  socketId: null,
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
  },
});

export const { setUser, setRoomId, setSocketId } = roomSlice.actions;
export default roomSlice.reducer;