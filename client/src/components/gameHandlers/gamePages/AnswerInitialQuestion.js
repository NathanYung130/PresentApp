import React, { useState, useRef, useEffect } from 'react';
import supabase from '../../../supabaseClient';
import CountProgressBar from '../../ProgressBar';
import { useSelector } from 'react-redux';

import '../../styles/AnswerInitial.css';

const AnswerInitialQuestion = ({ question, userName, roomID, socket }) => {
  const adminState = useSelector((state) => state.game.gameAdmin);
  const answerRef = useRef('');
  const emitted = useRef(false);
  // Timer Handler Dependencies
  const onCompleteCall = useRef(false);
  const toStore = useRef(false);
  const [submit, setSubmit] = useState(false);

  //submission count
  const [clicks, setClicks] = useState(0);
  const [numMembers, setNumMembers] = useState(0);

  //Handles all submission
  const handleSubmit = async (event) => {
    if (event) event.preventDefault();

    //Double Submit protection
    if (!submit) {
      setSubmit(true);

      if (!toStore.current) {
        toStore.current = true;
        console.log('submitting to store');
        const { error: insertError } = await supabase
          .from('real_answers')
          .insert([{ roomcode: roomID, username: userName, question: question, answer: answerRef.current }]);

        if (insertError) {
          console.error('Error saving answer to Supabase:', insertError);
        }
      }

      if (!emitted.current){
        socket.emit('submitAnswer', roomID);
        emitted.current = true;
      }
    }
  };

  // ========Timer Auto Submission Code =================//
  // ----------------------------------------------------//
  const timerHandler = () => {
    console.log('Timer Up!');
    if (onCompleteCall.current) return;
    onCompleteCall.current = true;

    if (!submit) {
      handleSubmit(); 
    }

  };

  //Listen for next state calls
  useEffect(() => {
    const handleGameStateChange = () => {
      socket.emit('nextGameState', { roomCode: roomID });
      console.log('emit state change!');
    };

    if(adminState){
      socket.on('updateGameState', handleGameStateChange);
    };

    socket.on('currentClicks', (answersSubmitted) => {
      setClicks(answersSubmitted);
    });
    socket.on('currentMembers', (memberNumber) => {
      setNumMembers(memberNumber);
    });  

    return () => {
      socket.off('updateGameState');
    };
  }, [roomID, socket, adminState]);
// ========================================================//
// --------------------------------------------------------//
  return (
    <div className="game-screen">
      <h2 className = "question_title">Question:</h2>
      <p className = "Question">{question}</p>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            className="initial_question_input"
            defaultValue={answerRef.current}
            onChange={(event) => (answerRef.current = event.target.value)}
            required
          />
          <div className="progress-circle-container">
          <CountProgressBar duration={20000} onComplete={timerHandler} />
          </div>
        </label>
        {!submit && (
          <button type="submit">Submit</button>
        )}
      </form>
      
    </div>
  );
};

export default AnswerInitialQuestion;

