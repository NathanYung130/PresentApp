import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ socket }) => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [roomCode, setRoomCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('userName', userName);
        localStorage.setItem('roomCode', roomCode);

        // Send the username and room code to the Node.js server
        socket.emit('joinRoom', { userName, roomCode, socketID: socket.id });
        navigate(`/chat/${roomCode}`);
    };

    return (
        <form className="home__container" onSubmit={handleSubmit}>
            <h2 className="home__header">Sign in to Open Chat</h2>
            <label htmlFor="username">Username</label>
            <input
                type="text"
                minLength={6}
                name="username"
                id="username"
                className="username__input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />
            <label htmlFor="roomCode">Room Code</label>
            <input
                type="text"
                name="roomCode"
                id="roomCode"
                className="roomcode__input"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
            />
            <button className="home__cta">JOIN ROOM</button>
        </form>
    );
};

export default Home;
