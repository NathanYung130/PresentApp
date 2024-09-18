import React, { useState } from 'react';

import "../../styles/RockPaperS.css"

const RockPaperS = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const [computer, setComputer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [win, setWin] = useState(false);


    const handleCast = () => {

            setSubmitted(true);
            const num = Math.floor(Math.random() * 2);

            if (num) {
                //Win
                setWin(true);

            } else{
                //Lose
                setWin(false);

            }
        
    };

  return (
    <>
        <div className="game-container">
            <form>
                <label for="cars">Lets Play a Game While we Wait:</label>
                <select id="cars" name="cars">
                    <option value="Rock">Rock</option>
                    <option value="Paper">Paper</option>
                    <option value="Scissors">Scissors</option>
                </select>
            </form>
            <button onClick={handleCast}>Cast</button>
            {submitted ? (
                <div className="result">
                {win ? (
                <h1>Wow you Won!</h1>
                ) : (
                <h1>Breathtaking Loss.</h1>
                )}
                </div>
            ) : (
                <></>
            )}
        </div>
    </>
    );
};

export default RockPaperS;
