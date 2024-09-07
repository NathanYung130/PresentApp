import React, { useState, useEffect } from 'react';
import  supabase  from '../../../supabaseClient';
import CountProgressBar from '../../ProgressBar';
//get from supabase same amount of questions as participating players
//assign a question per player, store question in redux
// this question needs to be displayed to other players in following rounds

// 
const AnswerInitialQuestion = ({ question, userName, roomID, socket }) => {
  const [buttonTracker, setButtonTracker ]= useState(false);
  const [answer, setAnswer] = useState('');
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [gameStateUpdated, setGameStateUpdated] = useState(false);
  const saveAnswerToSupabase = async (roomCode, username, question, answer) => {
    console.log('ANSWER IS BEING SUBMITTED');
    try {
      const { data, error } = await supabase.from('real_answers').insert([
        {
          roomcode: roomCode,
          username: username,
          question: question,
          answer: answer,
        },
      ]);

      if (error) {
        console.error('Error saving answer to Supabase:', error);
      } else {
        console.log('Answer saved to Supabase:', data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleSubmit = async (event) => {
    // event.preventDefault();

    // Prevent duplicate submissions
    if (!buttonTracker) {
      console.log('ANSWER IS BEING SUBMITTED');
      setButtonTracker(true);  // Track that the button has been clicked

      await saveAnswerToSupabase(roomID, userName, question, answer);

      // Emit events to server after answering
      // socket.emit('userAnswered', { roomCode: roomID, userName });
      socket.emit('submitAnswer', roomID);
    }
  };

  const moveToNextState = () => {
    if (!gameStateUpdated) {
      setGameStateUpdated(true);  
      socket.emit('nextGameState', { roomCode: roomID });
  }
  };


useEffect(() => {
  const handleGameStateChange = (newGameState) => {
    console.log('Game state updated:', newGameState);
    setGameStateUpdated(true);
  };

  socket.on('updateGameState', handleGameStateChange);

  console.log('updated game state true or false: ', gameStateUpdated);
  // if (isCountdownFinished && !buttonTracker) {
  if ((isCountdownFinished) || (gameStateUpdated === true)) {
    console.log('countdown finished or everyone has alredy answered');
    handleSubmit(); // Triggers submit and next state
    moveToNextState();
  }

  // Clean up event listener when component unmounts
  return () => {
    socket.off('updateGameState');
  };
}, [isCountdownFinished, buttonTracker, gameStateUpdated]); // Only run when countdown finishes
  

  return (
    <div className="game-screen">
        <h2>Question:</h2>
        <p>{question}</p>
        <form>
        <label>
          <input type="text" className="username__input" value={answer} onChange={(event) => setAnswer(event.target.value)} />
        </label>
        {buttonTracker ?(
          <></>
        ):(
          <button type="submit" onClick={handleSubmit}>Submit</button>
        )}

        {/* {form submit} */}
        </form>
        <div className="progress-bar-container">
        <CountProgressBar duration={10000} onComplete={() => setIsCountdownFinished(true)} /></div>
    </div>
  );
};

export default AnswerInitialQuestion;
