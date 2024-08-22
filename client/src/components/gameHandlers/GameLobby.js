import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { startGame } from '../../Redux/gameSlice';
//import { useSelector } from 'react-redux';

const GameLobby = ({ socket }) => {
    const dispatch = useDispatch();
    console.log('socket: ', socket);

    useEffect(() => {
        // Listen for the 'gameStarted' event from the server
        socket.on('gameStarted', () => {
            console.log('Game has started!'); 
            dispatch(startGame());
        });

        // Cleanup event listener when the component unmounts
        return () => {
            socket.off('gameStarted');
        };
    }, [dispatch]);

    const handleGameStart = () => {
        // Emit 'startGame' message to Socket.IO
        socket.emit('startGame', { /* data to be sent (optional) */ }); // Replace with relevant data if needed
    };

    return(
        <> 
        <div className = "gameStartPage">
            <h2> Welcome to the Lobby! </h2>
            <h1> Hit start when all members are here! </h1>
            <button className="gameStart_btn" onClick={handleGameStart}>START GAME</button>
        </div>
        </>
    );
};

export default GameLobby;