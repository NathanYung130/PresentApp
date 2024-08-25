import React from 'react';

const OthersAnswering = ({ question }) => {
  return (
    <div className="game-screen">
      <h2>Answer the Question!</h2>
      <p>{question}</p>
      {/* Form or input elements for submitting answers would go here */}
    </div>
  );
};

export default OthersAnswering;
