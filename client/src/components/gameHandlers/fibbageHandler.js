import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentQuestion, setGameState, setQuestionMap, setGameAdmin } from '../../Redux/gameSlice';
import AnswerInitialQuestion from './gamePages/AnswerInitialQuestion';
import OthersAnswering from './gamePages/OthersAnswering';
import Voting from './gamePages/Voting';
import Leaderboard from './gamePages/Leaderboard';
import EndGame from './gamePages/EndGame';
import supabase from '../../supabaseClient';
import CountProgressBar from '../ProgressBar';

const FibbageHandler = ({ socket }) => {
    const dispatch = useDispatch();
    const { gameState, currentQuestion, sittingOutPlayer, questionMap } = useSelector(state => state.game);
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
            console.log('Received assigned question:', username, question);
            if (username === userName) {
                console.log('Matching username, dispatching action');
                dispatch(setCurrentQuestion({ question }));
            }
        };

        const getAdminStatus = async () => {
            
            const {data: adminBool, error: adminBoolError} = await supabase
                .from('room_users')
                .select('*')
                .eq('roomcode', roomId)
                .eq('admin', 1);
    
            if (adminBoolError){
                console.log('Error fetching admin status');

            }else {
                console.log('Admin = ', adminBool[0].username);
                if (adminBool[0].username === userName){
                    dispatch(setGameAdmin(true));
                }else{
                    dispatch(setGameAdmin(false));
                }

            }
        };

       
        getAdminStatus();
        socket.on('assignedQuestion', handleAssignQuestion);
        socket.on('gameStateChange', handleGameStateChange);

        return () => {

            socket.off('gameStateChange', handleGameStateChange);
            socket.off('assignedQuestion', handleAssignQuestion);

        };
    }, [socket, dispatch, userName]);


    const renderGameComponent = () => {
        //question that is going to be displayed in (others answering)
        const questionToDisplay = questionMap[sittingOutPlayer] || currentQuestion;

        console.log('gameState: ', gameState);
        switch (gameState) {
            case 'answerInitialQuestion':
                return <AnswerInitialQuestion question={currentQuestion} userName={userName} roomID={roomId} socket={socket} />;
            case 'othersAnswering':
                // Use question from the questionMap if sittingOutPlayer is defined
                return sittingOutPlayer && questionMap[sittingOutPlayer] ? (
                    <OthersAnswering question={questionToDisplay} roomID={roomId} socket={socket}/>
                ) : (
                  <OthersAnswering question="Default question or error message" />
                );
            case 'voting':
                return <Voting question={questionToDisplay} socket={socket}/>;
            case 'leaderboard':
                return <Leaderboard question={questionToDisplay} socket={socket} inSession = {true}/>;
            case 'endGame':
                return <EndGame />
           default:
            return <div>Unknown game state</div>;
        }

      };

    const handleNextState = () => {
        if (!gameEnded) {
            socket.emit('nextGameState', { roomCode: roomId });
        }
    };


    return (
        <>
            {renderGameComponent()}
        </>
    );
};

export default FibbageHandler;
