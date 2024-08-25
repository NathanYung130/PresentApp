import React from 'react';
import { useSelector } from 'react-redux';
import GameLobby from './GameLobby';
import FibbageHandler from './fibbageHandler';

const GameDisplay = ({ socket }) => {
    const gameStart = useSelector((state) => state.game.gameStarted);

    return(
        <div className="lobby">
            {gameStart ? (
                <FibbageHandler socket={socket} />
            ) : (
                <GameLobby socket={socket} />
            )}
        </div>
    );
};

export default GameDisplay;