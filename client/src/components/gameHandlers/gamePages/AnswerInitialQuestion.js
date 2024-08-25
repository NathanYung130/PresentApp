import React from 'react';

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
