import React, { useEffect } from 'react';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux'
import supabase from '../../../supabaseClient';
import Leaderboard from './Leaderboard';

import "../../styles/EndGame.css";

const EndGame = () => {
    const winner = useSelector((state) => state.game.gameWinner);
    const user = useSelector((state) => state.room.userName);
    const [winnerDisp, setWinnerDisp] = useState('');
    const userWin = winner === user;

    useEffect(() => {
        if (winner === null){
            setWinnerDisp('A Tie ?!?');
        } else{
            setWinnerDisp(winner);
        }    
    }, [winner, setWinnerDisp]);

    return (
        <>
            <h1>Congrats!</h1>
            <h1> {winnerDisp} !</h1>
            <Leaderboard inSession = {false} />
            {userWin ? (
                <h1>You Win!</h1>
            ) : (
                <h3>Unfortunately You Didn't Win</h3>
            )}
        </>
    );
};

export default EndGame;
