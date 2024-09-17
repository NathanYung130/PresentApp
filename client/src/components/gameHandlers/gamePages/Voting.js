import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentQuestion, setGameState } from '../../../Redux/gameSlice';
import  supabase  from '../../../supabaseClient';
import CountProgressBar from '../../ProgressBar';

import "../../styles/Voting.css";

// Utility function for answer scrambling
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const Voting = ({ question, socket }) => {

    // user Info fetched from redux store
    const roomId = useSelector((state) => state.room.roomId);
    const user = useSelector((state) => state.room.userName);
    const sitOut = useSelector((state) => state.game.sittingOutPlayer);
    const adminState = useSelector((state) => state.game.gameAdmin);

    // state trackers
    const [options, setOptions] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [shuffOptions, setShuffledOptions] = useState('');
    const [CorrectAnswer, setCorrectAnswer] = useState('');
    const [ownAnswer, setOwnAnswer] = useState(false);
    const [noSub, setNoSub] = useState(false);
    const [correct, setCorrect] = useState(false);
    const sitOutSubmissionRef = useRef(false);
    const submitCompleted = useRef(false);
    const excludeMe = user === sitOut;

    //Timer Handler trackers/ dependencies
    const onCompleteCall = useRef(false);
    const [submit, setSubmit] = useState(false);

    const [clicks, setClicks] = useState(0);

    // inserts username and score into backend via sql
    const uploadData = async ({username, newPoints}) => {
        console.log('==== NEW COL CREATED for user:  ', username);
        console.log('==== Pts: ', newPoints);
        const {data: L} = await supabase
            .from('score_tracker')
            .insert([{ username: username, roomcode: roomId, pts: newPoints}]);
    }

    // updates username and score into backend via sql
    const updateData = async ({username, newPoints}) => {
        console.log('_____ DATA UPDATING FOR: ', username);
        console.log('_____ Pts: ', newPoints);
        const {data, error} = await supabase
            .from('score_tracker')
            .update({ pts: newPoints })
            .eq('username', username)
            .eq('roomcode', roomId);
    }
    
    // handleForm utility function that creates a new row
    // or updates row based on if the user info is already
    // stored
    const handlePts = async ({username, wonPts}) =>{

        //query for current player's pts
        const {data: points, error: error} = await supabase
            .from('score_tracker')
            .select('*')
            .eq('roomcode', roomId)
            .eq('username', username)
        
        switch (error){
            case true: 

                break;
            default: 
                if (points.length === 0){
                    
                    console.log('Pts not found for ', username);
                    uploadData({username: username, newPoints: wonPts});
                }else{
                    console.log('ROW FOUND FOR USER: ', username);
                    console.log('ADDING TO EXISTING to  old pts: ',  points[0].pts);
                    const newPts = points[0].pts + wonPts;

                    updateData({username: username, newPoints: newPts});
                }
                break;
        }

    };

    // handles form submission
    const handleForm = (e) =>{
        if (e) e.preventDefault();

        //Check if a submission has already been made
        if ((!submitCompleted.current) && (!excludeMe)){
            submitCompleted.current = true;

            console.log('+++SUBMISSION CALL+++')

            setSubmitted(true);
            if (selectedOption.length === 0){
                setNoSub(true);
                setSubmitted(true);
                socket.emit('submitAnswer', roomId);
                return;
            }

            if (selectedOption.username === user){
                setOwnAnswer(true);
                setSubmitted(true);
                socket.emit('submitAnswer', roomId);
                return;
            }

            if (selectedOption.id === CorrectAnswer[0].id){
                //Selected Correctly, now Assign pts
                setCorrect(true);
                //Award points to sitting out and player who guessed right
                handlePts({username: user, wonPts: 15});

                handlePts({username: sitOut, wonPts: 15});
            } else{
                //Incorrect Selection points distribution
                handlePts({username: selectedOption.username, wonPts: 10});
            }

            
            setSubmitted(true);
            socket.emit('submitAnswer', roomId);
        } else{
            return;
        }
    };
    // handles user requests to change answer before submission
    const handleOptionChange = async (e) => {
        setSelectedOption(e.target.value);
        const option = e.target.value;
        const index = parseInt(option.replace(/[^0-9]/g, '')) - 1;
        setSelectedOption(shuffOptions[index]);

    };

    // This useEffect is exclusively for Answer Choice update functions
    useEffect(() => {
        const fetchOptions = async () => {

            // Query for Incorrect Answers
            const { data: incorrect, error: error } = await supabase
                .from('question_answers')
                .select('*')
                .eq('roomcode', roomId)
                .eq('question', question);
            // Query for correct Answer
            const { data: Answer, error: correctError } = await supabase
                .from('real_answers') // Replace with your correct answers table
                .select('*')
                .eq('roomcode', roomId)
                .eq('question', question);

          
            if (error || correctError) {
              console.error("Error fetching options:", error || correctError);
            } else {

                // Combine incorrect and correct answers
                setCorrectAnswer(Answer);
                const combinedOptions = [...incorrect, ...Answer];
                
                // Randomize the order
                const shuffledOptions = shuffleArray(combinedOptions);
                setShuffledOptions(shuffledOptions);
                // Update the state with shuffled options
                setOptions(shuffledOptions);
            }
          };

        fetchOptions();
    }, [roomId, user, question]);  // Empty dependency array to run once when component mounts

    // ========Timer Auto Submission Code =================//
    // ----------------------------------------------------//
    const timerHandler = () => {
        console.log('Timer Up!');
        if (onCompleteCall.current){
            onCompleteCall.current = true;
            return;
        }
        
        console.log('{}{} submit: ', submit);
        if (!submit) {
            setSubmit(true);
            console.log('//// Handle Submit from Timer /////');
            handleForm(); 
        }
    
    };

    // informs webSockets that player is sitting out
    const satisfySocketForSitOut = () => {
        console.log('exclude me: ', excludeMe);
        if ((excludeMe) && (!sitOutSubmissionRef.current)){
            sitOutSubmissionRef.current = true;
            console.log('To Socket Submission: From sitout');
            socket.emit('submitAnswer', roomId);
        } else{
            return;
        }
    };

    useEffect(() => {

        const handleGameStateChange = () => {
            // Delay next state change, allowing user to read 
            // if they guessed correctly
            setTimeout(() => {
                socket.emit('nextGameState', { roomCode: roomId });
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
        }, [roomId, socket]);
    // ====================================================//
    // ----------------------------------------------------//
    return(
        <>
        <div className = "voting-styles" styles = {{color: 'coral'}}>
        <h3>Guess the CORRECT one!</h3>
        <h2>{question}</h2>

        <form onSubmit={handleForm} >
                <div className="options-container">
                    {options.map((option, index) => (
                        <label key={index} className="radio-label">
                            <input type="radio" 
                            name="options" 
                            value={`option${index + 1}`} 
                            onChange={handleOptionChange}
                            />
                            <span>{option.answer}</span> 
                        </label>
                    ))}
                </div>
                
                {excludeMe ? (
                    
                    <h2>Others are guessing what you put!</h2>
                    
                ) : (
                    <>
                        {submitted ? (
                            <>
                                <div className="feedback">
                                    {correct ? (
                                        <>
                                            <div className="checkmark">✔️</div>
                                            <p style = {{color: 'indigo'}}>Correct! +15pts</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="cross">❌</div>
                                            {noSub ? (
                                                <p style = {{color: 'red'}}> Wow, no submission?</p>
                                            ) : (
                                                <>
                                                    {ownAnswer ? (
                                                        <p style = {{color: 'red'}}>Hold on, wasn't that your answer?  0 pts...</p>
                                                    ) : (
                                                        <p style = {{color: 'red'}}>You've just given {selectedOption.username} 10 pts! Congrats.</p>
                                                    )}
                                                </>
                                            )}

                                        </>
                                    )}
                                </div>
                            
                            </>
                        ) : (
                            <>
                                <div className = "buttons">
                                    <button className="submit-btn" type="submit" >Submit</button>
                                </div>
                            </>
                        )}

                    </>
                )}
                
        </form>

        </div>

        <div className="progress-circle-container">
            <CountProgressBar duration={20000} onComplete={timerHandler} />
        </div>
        <h1>{clicks}</h1>
        </>

    );

};

export default Voting;
