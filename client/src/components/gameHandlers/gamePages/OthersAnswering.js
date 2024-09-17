import React from 'react';
import { useRef, useEffect,  useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import supabase from '../../../supabaseClient';
import CountProgressBar from '../../ProgressBar';


const OthersAnswering = ({ question, roomID, socket }) => {
    // state trackers
    const adminState = useSelector((state) => state.game.gameAdmin);
    const input = useRef(false);
    const sitOutSubmissionRef = useRef(false);
    const [ hideButton, setHideButton ]= useState(false);
    const [buttonTracker, setButtonTracker ]= useState(false);// button has been pressed or not (used to prevent double submit)

    // user Info fetched from redux
    const user = useSelector((state) => state.room.userName);
    const roomId = useSelector((state) => state.room.roomId);
    const sitOut = useSelector((state) => state.game.sittingOutPlayer);
    const excludeMe = user === sitOut;

    // Timer Handler Dependencies
    const onCompleteCall = useRef(false);
    const [submit, setSubmit] = useState(false);

    // prevent double submit
    const submissionRef = useState(false);

    //TESTING ENVIRONMENT
    const [clicks, setClicks] = useState(0);

    //handle answer submissions, storing to backend
    const handleAnswer = async(event) => {
        if ((!submissionRef.current) && (!excludeMe)){
            submissionRef.current = true;

            console.log('{{{{{{{{{ HANDLE ANSWER IN OTHERSANSWERING');

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

                console.log('To Socket Submission: From handleAnswer');
                socket.emit('submitAnswer', roomID);
            
            }

        } else{ 
            return; 
        }

    };

    // ========Timer Auto Submission Code =================//
    // ----------------------------------------------------//
    const timerHandler = () => {
        console.log('Timer Up!');
        if (onCompleteCall.current){return;};
        onCompleteCall.current = true;
    
        if (!submit) {
          handleAnswer(); 
          setSubmit(true);
        }
    
    };

    // informs webSockets that player is sitting out
    const satisfySocketForSitOut = () => {
        console.log('exclude me: ', excludeMe);
        if ((excludeMe) && (!sitOutSubmissionRef.current)){
            sitOutSubmissionRef.current = true;
            console.log('To Socket Submission: From sitout');
            socket.emit('submitAnswer', roomID);
        } else{
            return;
        }
    };

    useEffect(() => {

        const handleGameStateChange = () => {
            // 2 second timeout, for a quick break for the user
            // before the next state
            setTimeout(() => {
                socket.emit('nextGameState', { roomCode: roomID });
                console.log('emit state change!');
            }, 2000);
        };
        
        if(adminState){
            socket.on('updateGameState', handleGameStateChange);
        };

        socket.on('currentClicks', (answersSubmitted) => {
            setClicks(answersSubmitted);
        });

        satisfySocketForSitOut();

        return () => {
            socket.off('updateGameState');
        };
        }, [roomID, socket]);
    // ====================================================//
    // ----------------------------------------------------//

    return (
        <>
        {excludeMe ? (
            <div className ="sittiingOutScreen"> 
                <h1>Others Answering!</h1>
                <h2> sit tight! </h2>
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
        <div className="progress-circle-container">
        <CountProgressBar duration={20000} onComplete={timerHandler} />
        </div>
        
        <h1>{clicks}</h1>

        </>
    );
};

export default OthersAnswering;
