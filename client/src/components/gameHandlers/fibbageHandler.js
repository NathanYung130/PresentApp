import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentQuestion, setGameState } from '../../Redux/gameSlice';
import AnswerInitialQuestion from './gamePages/AnswerInitialQuestion';
import OthersAnswering from './gamePages/OthersAnswering';
import Voting from './gamePages/OthersAnswering';

const FibbageHandler = ({ socket }) => {
    const dispatch = useDispatch();
    const { gameState, currentQuestion, sittingOutPlayer } = useSelector(state => state.game);
    const { userName, roomId } = useSelector(state => state.room);
    const [gameEnded, setGameEnded] = useState(false);
   
    useEffect(() => {
    

        const handleGameStateChange = ({ state, sittingOutPlayer }) => {
            console.log('Received game state change:', state, sittingOutPlayer);
            dispatch(setGameState({ state, sittingOutPlayer }));
            if (state === 'gameEnd') {
                setGameEnded(true);
            }
        };
        const handleAssignQuestion = ({ username, question }) => {

            if (username === userName) {

                dispatch(setCurrentQuestion({ question }));
            }
        };

       
        socket.on('assignedQuestion', handleAssignQuestion);
        socket.on('gameStateChange', handleGameStateChange);

        return () => {

            socket.off('gameStateChange', handleGameStateChange);
            socket.off('assignedQuestion', handleAssignQuestion);

        };
    }, [socket, dispatch, userName]);


    const renderGameComponent = () => {
        switch (gameState) {
          case 'answerInitialQuestion':
            return <AnswerInitialQuestion question={currentQuestion} socket={socket} />;
          case 'othersAnswering':
            return <OthersAnswering question="What is the dumbest thing ____ said?" socket={socket} />;
          case 'voting':
            return <Voting />;
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
            {!gameEnded && <button onClick={ handleNextState }>Next State</button>}
            {gameEnded && <p>Game has ended!</p>}

            {sittingOutPlayer && <p>Sitting Out Player: {sittingOutPlayer}</p>}
            {/* {!gameEnded && <button onClick={handleNextState}>Next State (Test)</button>} */}
            {gameEnded && <p>Game has ended!</p>}
        </>
    );
};

export default FibbageHandler;
