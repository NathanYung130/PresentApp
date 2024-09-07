import React from 'react';
import { useRef, useEffect,  useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import supabase from '../../../supabaseClient';
import CountProgressBar from '../../ProgressBar';


const OthersAnswering = ({ question, roomID, socket }) => {
    const input = useRef(false);
    const [ hideButton, setHideButton ]= useState(false);
    const [buttonTracker, setButtonTracker ]= useState(false);// button has been pressed or not (used to prevent double submit)
    const [isCountdownFinished, setIsCountdownFinished] = useState(false);// countdown timer is finished
    const [gameStateUpdated, setGameStateUpdated] = useState(false); // game state has been updated or not

    const user = useSelector((state) => state.room.userName);
    const roomId = useSelector((state) => state.room.roomId);
    const sitOut = useSelector((state) => state.game.sittingOutPlayer);
    const currQuestion = useSelector((state) => state.game.currentQuestion);
    const excludeMe = user === sitOut;

    const handleAnswer = async(event) => {
        console.log('HandleAnswer called');
        console.log(input,'inpuit --- >>  ||| Input Current value ====', input.current.value)
        event && event.preventDefault(); // Prevent form submission
        if (!buttonTracker) {

            setHideButton(true);
            setButtonTracker(true); // Ensure answer is only submitted once
            
            const currInput = input.current.value;

            if (currInput) {
                const { data, error: insertError } = await supabase
                    .from('question_answers')
                    .insert([{ roomcode: roomId, question: question, username: user, answer: currInput }]);

                if (insertError) {
                    console.error("Error saving answer to Supabase:", insertError);
                } else {
                    console.log("Answer saved to Supabase:", data);
                }
            }

            socket.emit('submitAnswer', roomID);
        
        }
    };

    // moves to next state
    const moveToNextState = () => {
        if (!gameStateUpdated) {
            setGameStateUpdated(true);  
            socket.emit('nextGameState', { roomCode: roomID });
        }
    };

    // changes screens if timer is done
    useEffect(() => {
        const handleGameStateChange = (newGameState) => {
            console.log('Game state updated:', newGameState);
            setGameStateUpdated(true);
          };
        
          socket.on('updateGameState', handleGameStateChange);
      
        console.log('updated game state true or false: ', gameStateUpdated);
        // if (isCountdownFinished && !buttonTracker) {
        if (((isCountdownFinished) || (gameStateUpdated === true)) && (!excludeMe)) {
          console.log('countdown finished or everyone has alredy answered (in Others Answering)');
          handleAnswer(new Event('Answer')); // Triggers submit and next state
          submitForSittingOut();
          moveToNextState();
        }
      
        // Clean up event listener when component unmounts
        return () => {
          socket.off('updateGameState');
        };
      }, [isCountdownFinished, buttonTracker, gameStateUpdated, excludeMe]); // Only run when countdown finishes

    const submitForSittingOut = () => {
        socket.emit('submitAnswer', roomID);
    }

    return (
        <>
        {excludeMe ? (
            <div className ="sittiingOutScreen"> 
                <h1>Others Answering!</h1>
                <h2> sit tight! </h2>
                {submitForSittingOut}
            </div>

        ) : (

            <div className="game-screen">
                <h3>Answer the Question!</h3>
                <h2>{question}</h2>

                <input className = "roomcode__input" ref = { input }/>
                {hideButton ? (
                    <></>
                ) : (
                    <button onClick = { handleAnswer }> Answer </button>
                )}

            </div>

        )}
        <div className="progress-bar-container">
        <CountProgressBar duration={10000} onComplete={() => setIsCountdownFinished(true)} /></div>
        
        </>
    );
};

export default OthersAnswering;
