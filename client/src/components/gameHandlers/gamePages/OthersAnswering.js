import React from 'react';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import supabase from '../../../supabaseClient';



const OthersAnswering = ({ question, socket }) => {
    const input = useRef(null);
    const [ hideButton, setHideButton ]= useState(false);

    const user = useSelector((state) => state.room.userName);
    const roomId = useSelector((state) => state.room.roomId);
    const sitOut = useSelector((state) => state.game.sittingOutPlayer);
    const currQuestion = useSelector((state) => state.game.currentQuestion);
    const excludeMe = user === sitOut;

    const handleAnswer = async() => {
        setHideButton(true);
        const currInput = input.current.value;

        const { data, error: insertError } = await supabase
        .from('question_answers')
        .insert([{ roomcode: roomId, question: question, username: user, answer: currInput}]);

        

    }

    

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
        </>
    );
};

export default OthersAnswering;
