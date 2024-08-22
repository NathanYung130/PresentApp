import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { startGame } from '../Redux/gameSlice';
//import { useSelector } from 'react-redux';

const GameDisplay = ({ socket }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Listen for the 'gameStarted' event from the server
        socket.on('gameStarted', () => {
            console.log('Game has started!'); 
            dispatch(startGame);
        });

        // Cleanup event listener when the component unmounts
        return () => {
            socket.off('gameStarted');
        };
    }, [dispatch]);

    return(
        <>
        
        </>
    );
};

export default GameDisplay;