import React, { useEffect } from 'react';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import supabase from '../../../supabaseClient';

import "../../styles/Leaderboard.css";

const Leaderboard = ({ question }) => {
    const roomId = useSelector((state) => state.room.roomId);
    const [score, setScore] = useState(null);

    useEffect(() => {

    
    const pullScores = async () => {

        const {data, error} = await supabase
            .from('score_tracker')
            .select('*')
            .eq('roomcode', roomId);

        if (error){
            console.log('error grabbing data');
        } else{
            setScore(data);


        }
    }

    pullScores();

    }, []);

    if(!score){
        return <div>Loading...</div>;
    }
    return (
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
    );
};

export default Leaderboard;
