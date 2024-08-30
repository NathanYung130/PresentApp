import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startGame } from '../../Redux/gameSlice';
//import { useSelector } from 'react-redux'
import { setCurrentQuestion, setQuestionMap } from '../../Redux/gameSlice';


const GameLobby = ({ socket }) => {
    const dispatch = useDispatch();
    const { roomId } = useSelector(state => state.room);
    const { userName} = useSelector(state => state.room);
    



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
            <h2> Welcome to the Lobby! </h2>
            <h1> Hit start when all members are here! </h1>
            <button className="gameStart_btn" onClick={handleGameStart}>START GAME</button>
        </div>
        </>
    );
};

export default GameLobby;