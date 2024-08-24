import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setGameState } from '../../Redux/gameSlice';

const FibbageHandler = ({ socket }) => {
    const dispatch = useDispatch();
    const { gameState, sittingOutPlayer } = useSelector(state => state.game);
    const { userName, roomId } = useSelector(state => state.room);
    const [gameEnded, setGameEnded] = useState(false);

    useEffect(() => {
        const handleGameStateChange = ({ state, sittingOutPlayer }) => {
            dispatch(setGameState({ state, sittingOutPlayer }));
            if (state === 'gameEnd') {
                setGameEnded(true);
            }
        };

        socket.on('gameStateChange', handleGameStateChange);

        return () => {
            socket.off('gameStateChange', handleGameStateChange);
        };
    }, [socket, dispatch]);

    useEffect(() => {
        switch (gameState) {
            case 'answerInitialQuestion':
                if (sittingOutPlayer === 'na') {
                    console.log('Game State: Answer question 1');
                }
                break;
            case 'othersAnswering':
                if (userName === sittingOutPlayer) {
                    console.log('Game State: Player sitting out');
                } else {
                    console.log('Game State: Answering question');
                }
                break;
            case 'voting':
                if (userName === sittingOutPlayer) {
                    console.log('Game State: Sitting out player voting for favorite answer');
                } else {
                    console.log('Game State: Answering and voting');
                }
                break;
            case 'leaderboard':
                console.log('Game State: Leaderboard');
                break;
            case 'gameEnd':
                console.log('Game State: Game Ended');
                break;
            default:
                console.log('Unknown game state');
        }
    }, [gameState, sittingOutPlayer, userName]);

    const handleNextState = () => {
        if (!gameEnded) {
            socket.emit('nextGameState', { roomCode: roomId });
        }
    };

    return (
        <>
            <h1>Fibbage!</h1>
            <h2>Current Game State: {gameState}</h2>
            {sittingOutPlayer && <p>Sitting Out Player: {sittingOutPlayer}</p>}
            {!gameEnded && <button onClick={handleNextState}>Next State (Test)</button>}
            {gameEnded && <p>Game has ended!</p>}
        </>
    );
};

export default FibbageHandler;
