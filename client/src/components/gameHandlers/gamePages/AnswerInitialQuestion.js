import React from 'react';
//get from supabase same amount of questions as participating players
//assign a question per player, store question in redux
// this question needs to be displayed to other players in following rounds

// 
const AnswerInitialQuestion = ({ question }) => {
  return (
    <div className="game-screen">
        <h2>Question:</h2>
        <p>{question}</p>
        {/* {form submit} */}
    </div>
  );
};

export default AnswerInitialQuestion;
