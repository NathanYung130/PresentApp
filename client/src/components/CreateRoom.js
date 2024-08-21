import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRoom = ({ socket }) => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      socket.emit('createRoom', roomCode);
      navigate('/');
    }
  };

  return (
    <form className="home__container" onSubmit={handleSubmit}>
      <h2 className="home__header">Create a New Room</h2>
      <label htmlFor="roomCode">Room Code</label>
      <input
        type="text"
        minLength={4}
        name="roomCode"
        id="roomCode"
        className="username__input"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button className="home__cta">Create Room</button>
    </form>
  );
};

export default CreateRoom;