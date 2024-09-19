import React, { useEffect } from 'react';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import supabase from '../../../supabaseClient';
import CountProgressBar from '../../ProgressBar';
import { setGameWinner } from '../../../Redux/gameSlice';

import "../../styles/Leaderboard.css";

const Leaderboard = ({ question, socket, inSession }) => {
    const dispatch = useDispatch();

    const adminState = useSelector((state) => state.game.gameAdmin);
    const roomId = useSelector((state) => state.room.roomId);
    const [score, setScore] = useState(null);

    // Timer Handler Dependencies
    const onCompleteCall = useRef(false);
    const [submit, setSubmit] = useState(false);
    // Dynamic timer code
    const [dispTimer, setDispTimer] = useState(inSession);

    useEffect(() => {

    
    const pullScores = async () => {

        const {data, error} = await supabase
            .from('score_tracker')
            .select('*')
            .eq('roomcode', roomId);

        if (error){
            console.log('error grabbing data');
        } else{
            const sortedData = data.sort((a, b) => b.pts - a.pts);

            console.log('sortedData: ', sortedData);
            if (sortedData.length === 0){
                setScore(0);
            } else{
                console.log('sortedData first entry: ', sortedData[0].username);
                if (sortedData.length > 1){
                    if (sortedData[0].pts === sortedData[1].pts){
                        console.log('Tie Detected');
                        dispatch(setGameWinner('Tie'));
                    } else {
                        console.log('dispatching to store: ',sortedData[0].username)
                        dispatch(setGameWinner(sortedData[0].username));
                    }
                } else {
                    // No tie
                    console.log('dispatching to store: ',sortedData[0].username)
                    dispatch(setGameWinner(sortedData[0].username));
                }
                setScore(sortedData);
            }
        }
    }

    pullScores();


    }, []);



    // ========Timer Auto Submission Code =================//
    // ----------------------------------------------------//
    const timerHandler = () => {
        console.log('Timer Up!');
        if (onCompleteCall.current) return;
        onCompleteCall.current = true;

        if(adminState){
            socket.emit('nextGameState', { roomCode: roomId });
        }
    };
    // ----------------------------------------------------//
    if(!score){
        return (
        <>
        <div>No Points Scored ..yet</div>
        {dispTimer ? (
            <>
                <div className="progress-circle-container">
                    <CountProgressBar duration={10000} onComplete={timerHandler} />
                </div>
            </>
        ) : (
            <>
            </>
        )}
        </>    
        );
    }
    return (
        <>
        <h2 style={{ marginTop: '10px' }}>Lets take a look at our pts:</h2>

        <div className = "options-container">
            <div className="leaderboard-container">
                {score.map((item) => (
                    <div className="leaderboard-card" key={item.id}> 
                        <div className="user-display">{item.username}</div>
                        <div className="pts-display">{item.pts} pts</div>
                    </div>
                ))}
            </div>
        </div>

        {dispTimer ? (
            <>
                <div className="progress-circle-container">
                    <CountProgressBar duration={10000} onComplete={timerHandler} />
                </div>
            </>
        ) : (
            <>
            </>
        )}
        </>
    );
};

export default Leaderboard;
