import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startGame } from '../../Redux/gameSlice';
import  GameLobby  from './GameLobby';
import FibbageHandler from './fibbageHandler';



const GameDisplay = ({ socket }) => {
    const gameStart = useSelector((state) => state.game.gameStarted);
    console.log('gameStart; ', gameStart);
    return(
        <> 
        <div className = "lobby">
            {gameStart ? (
                <FibbageHandler socket = {socket}/>
            ) : (
                <GameLobby socket = {socket}/>
            )}
        </div>
        </>
    );
};

export default GameDisplay;