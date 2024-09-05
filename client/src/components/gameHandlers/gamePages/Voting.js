import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentQuestion, setGameState } from '../../../Redux/gameSlice';
import  supabase  from '../../../supabaseClient';

import "../../styles/Voting.css";

// Utility function to randomize an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const Voting = ({ question }) => {
    const roomId = useSelector((state) => state.room.roomId);
    const user = useSelector((state) => state.room.userName);
    const sitOut = useSelector((state) => state.game.sittingOutPlayer);

    const [options, setOptions] = useState([]);  // Store fetched options here
    const [submitted, setSubmitted] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [shuffOptions, setShuffledOptions] = useState('');
    const [CorrectAnswer, setCorrectAnswer] = useState('');
    const [correct, setCorrect] = useState(false);
    const excludeMe = user === sitOut;

    const uploadData = async ({username, newPoints}) => {

        const {data: L} = await supabase
            .from('score_tracker')
            .insert([{ username: username, roomcode: roomId, pts: newPoints}]);
    }

    const updateData = async ({username, newPoints}) => {

        const {data, error} = await supabase
            .from('score_tracker')
            .update({ pts: newPoints })
            .eq('username', username)
            .eq('roomcode', roomId);
    }
    
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
 
                    uploadData({username: username, newPoints: wonPts});
                }else{

                    const newPts = points[0].pts + wonPts;

                    updateData({username: username, newPoints: newPts});
                }
                break;
        }

    };

    const handleForm = (e) =>{
        e.preventDefault();
        setSubmitted(true);
        if (selectedOption.length === 0){
            return;
        }

        if (selectedOption.username === user){
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
    };

    const handleOptionChange = async (e) => {
        setSelectedOption(e.target.value);
        const option = e.target.value;
        const index = parseInt(option.replace(/[^0-9]/g, '')) - 1;
        setSelectedOption(shuffOptions[index]);

    };

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
                                            <p style = {{color: 'red'}}>You've just given {selectedOption.username} 10 pts! Congrats.</p>
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
        </>

    );

};

export default Voting;
