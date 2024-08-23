import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startGame } from '../../Redux/gameSlice';

const GameLobby = ({ socket }) => {
    const dispatch = useDispatch();
    const { roomId } = useSelector(state => state.room);
    console.log('socket: ', socket);

    useEffect(() => {
        socket.on('gameStateChange', ({ state }) => {
            if (state === 'answerInitialQuestion') {
                dispatch(startGame());
            }
        });

        return () => {
            socket.off('gameStateChange');
        };
    }, [dispatch, socket]);

    const handleGameStart = () => {
        socket.emit('startGame', { roomCode: roomId });
    };

    return(
        <div className="gameStartPage">
            <h2>Welcome to the Lobby!</h2>
            <h1>Hit start when all members are here!</h1>
            <button className="gameStart_btn" onClick={handleGameStart}>START GAME</button>
        </div>
    );
};

export default GameLobby;