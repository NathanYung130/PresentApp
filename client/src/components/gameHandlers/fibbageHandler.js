import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setGameState } from '../../Redux/gameSlice';
import AnswerInitialQuestion from './gamePages/AnswerInitialQuestion';
import OthersAnswering from './gamePages/OthersAnswering';

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

    // useEffect(() => {
    //     switch (gameState) {
    //         case 'answerInitialQuestion':
    //             if (sittingOutPlayer === 'na') {
    //                 console.log('Game State: Answer question 1');
    //             }
    //             break;
    //         case 'othersAnswering':
    //             if (userName === sittingOutPlayer) {
    //                 console.log('Game State: Player sitting out');
    //             } else {
    //                 console.log('Game State: Answering question');
    //             }
    //             break;
    //         case 'voting':
    //             if (userName === sittingOutPlayer) {
    //                 console.log('Game State: Sitting out player voting for favorite answer');
    //             } else {
    //                 console.log('Game State: Answering and voting');
    //             }
    //             break;
    //         case 'leaderboard':
    //             console.log('Game State: Leaderboard');
    //             break;
    //         case 'gameEnd':
    //             console.log('Game State: Game Ended');
    //             break;
    //         default:
    //             console.log('Unknown game state');
    //     }
    // }, [gameState, sittingOutPlayer, userName]);

    const renderGameComponent = () => {
        switch (gameState) {
          case 'answerInitialQuestion':
            return <AnswerInitialQuestion question="Why are you so dumb?" />;
          case 'othersAnswering':
            return <OthersAnswering question="What is the dumbest thing ____ said?" />;
        //   case 'voting':
        //     return <Voting answers={['took a shit at truck stop', 'said the n word', 'Green']} handleVote={(answer) => console.log(`Voted for: ${answer}`)} />;
        //   case 'sittingOut':
        //     return <SittingOut />;
        //   case 'leaderboard':
        //     return <Leaderboard players={players} />;
           default:
            return <div>Unknown game state</div>;
        }

        console.log(gameState);
      };

    const handleNextState = () => {
        if (!gameEnded) {
            socket.emit('nextGameState', { roomCode: roomId });
        }
    };

    return (
        <>
            <h1>Fibbage!</h1>
            {renderGameComponent()}
            <h2>Current Game State: {gameState}</h2>
            {!gameEnded && <button onClick={() => socket.emit('nextGameState', { roomCode: roomId })}>Next State</button>}
            {gameEnded && <p>Game has ended!</p>}

            {sittingOutPlayer && <p>Sitting Out Player: {sittingOutPlayer}</p>}
            {/* {!gameEnded && <button onClick={handleNextState}>Next State (Test)</button>} */}
            {gameEnded && <p>Game has ended!</p>}
        </>
    );
};

export default FibbageHandler;
