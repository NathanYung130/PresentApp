import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startGame, setGameAdmin } from '../../Redux/gameSlice';
//import { useSelector } from 'react-redux'
import { setCurrentQuestion, setQuestionMap } from '../../Redux/gameSlice';


const GameLobby = ({ socket }) => {
    const dispatch = useDispatch();
    const { roomId } = useSelector(state => state.room);
    const { userName } = useSelector(state => state.room);
    



    useEffect(() => {
        const handleGameStateChange = ({ state }) => {
            if (state === 'answerInitialQuestion') {
                dispatch(startGame());
            }
        
        };

        const handleAssignQuestion = ({ username, question }) => {
            console.log('Received assigned question:', username, question);
            if (userName === username) {
                console.log('Matching username, dispatching action');
                dispatch(setCurrentQuestion({ question }));
            } else {
                console.log('username unmatched');
            }
            
            dispatch(setQuestionMap({ [username]: question }));
        };

        socket.on('assignedQuestion', handleAssignQuestion);
    
    socket.on('gameStateChange', handleGameStateChange);

    return () => {
        socket.off('gameStateChange', handleGameStateChange);
        socket.off('assignedQuestion', handleAssignQuestion);
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
            <h2 className = "fbbage-titler"> Welcome to Fibbage All About You! </h2>
            <h1 className = "startPrompt"> Hit start when all members are here! </h1>
            <button className="gameStart_btn" onClick={handleGameStart}>START GAME</button>
            <div className = "rules">
            <h2 className ="rules-titleCard">Here's how the game will work: </h2>
                <ol className = "bulleted-list">
                    <li>First everyone is prompted to answer a unique question about themselves</li>
                    <li>Next, one of those questions will be chosen.</li>
                    <li>If that question is yours, sit tight! If it is not, your task is to submit an answer you think that person would have submitted</li>
                    <li>Voting will begin! If you chose correctly, both you and question answerer will receive 15 pts.</li>
                    <li>Wrong choices will give 10 pts to the one that deceived you! Remember this is a game of deception!</li>
                </ol>
            </div>
        </div>
        </>
    );
};

export default GameLobby;