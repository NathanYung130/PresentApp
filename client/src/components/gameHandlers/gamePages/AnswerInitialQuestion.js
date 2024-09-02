import React, { useState } from 'react';
import  supabase  from '../../../supabaseClient';
//get from supabase same amount of questions as participating players
//assign a question per player, store question in redux
// this question needs to be displayed to other players in following rounds

// 
const AnswerInitialQuestion = ({ question, userName, roomID }) => {
  const [buttonTracker, setButtonTracker ]= useState(false);
  const [answer, setAnswer] = useState('');
  const saveAnswerToSupabase = async (roomCode, username, question, answer) => {
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
    setButtonTracker(true);
    event.preventDefault();
    await saveAnswerToSupabase(roomID, userName, question, answer);
  };

  

  return (
    <div className="game-screen">
        <h2>Question:</h2>
        <p>{question}</p>
        <form onSubmit={handleSubmit}>
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
        
    </div>
  );
};

export default AnswerInitialQuestion;
