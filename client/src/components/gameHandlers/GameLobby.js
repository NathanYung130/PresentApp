import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startGame } from '../../Redux/gameSlice';
//import { useSelector } from 'react-redux';

const GameLobby = ({ socket }) => {
    const dispatch = useDispatch();
    const { roomId } = useSelector(state => state.room);
    console.log('socket: ', socket);

    // useEffect(() => {
    //     socket.on('gameStateChange', ({ state }) => {
    //         if (state === 'answerInitialQuestion') {
    //             dispatch(startGame());
    //         }
    //     });

    //     return () => {
    //         socket.off('gameStateChange');
    //     };
    // }, [dispatch, socket]);
    useEffect(() => {
    const handleGameStateChange = ({ state }) => {
        if (state === 'answerInitialQuestion') {
            dispatch(startGame());
        }
    };

    socket.on('gameStateChange', handleGameStateChange);

    return () => {
        socket.off('gameStateChange', handleGameStateChange);
    };
}, [dispatch, socket]);

    const handleGameStart = () => {
        // Emit 'startGame' message to Socket.IO
        // socket.emit('startGame', { /* data to be sent (optional) */ }); // Replace with relevant data if needed
        socket.emit('startGame', { roomCode: roomId });
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