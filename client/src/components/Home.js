import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { nanoid } from 'nanoid'

import { setUser, setRoomId, setSocketId} from '../Redux/roomSlice'

import './styles/Home.css'

const Home = ({ socket }) => {
    //++++++++Declare Variables++++++++\\
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Import useDispatch from 'react-redux'

    const [userName, setUserName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [createState, setCreateState] = useState(false);
    //+++++++++++++++++++++++++++++++++++\\

    //updates All front end based stores
    const updateStores = useCallback(() => {
        localStorage.setItem('userName', userName);
        localStorage.setItem('roomCode', roomCode);

        //Update Redux store with roomCode via dispatch action
        dispatch(setUser(userName));
        dispatch(setRoomId(roomCode));
        dispatch(setSocketId(socket.id));
    }, [userName, roomCode, dispatch, socket.id]);

    // Handle search buton press, emits to socket to check if room exists
    const handleSearch = () => {
        if ((roomCode.length < 6)) {
            handlePopup('roomError');
            return; // Prevent form submission if validation fails
        } else if(userName.length < 1){
            handlePopup('userNameError');
        }
        updateStores();
        socket.emit('queryRoom', { userName, roomCode});

    };

    // Handle creation of room. emits to socket to check, the socket response
    // is then collected by useEffect, which handles the joining of the room
    const handleCreate = () =>{
        if (userName.length < 1) {
            handlePopup('userNameError');
            return; // Prevent form submission if validation fails
        }
        setCreateState(true);
        let TempId = nanoid(6);
        setRoomCode(TempId);
        updateStores();
        socket.emit('queryRoom', { userName, roomCode});

    };

    // useEffect handles the output of listener functions that pull from socket.io
    useEffect(() => {
        const handleRoomNotFound = () => {
            if (createState){

                updateStores();
                socket.emit('joinRoom', { userName, roomCode, socketID: socket.id });
                navigate(`/chat/${roomCode}`);
            }else{
                handlePopup('roomError');
            }
        };
        const handleRoomFound = () => {
            socket.emit('joinRoom', { userName, roomCode, socketID: socket.id });
            navigate(`/chat/${roomCode}`);
        };

        // Attach socket listeners
        socket.on('roomNotFound', handleRoomNotFound);
        socket.on('roomFound', handleRoomFound);

        return () =>{
            socket.off('roomNotFound', handleRoomNotFound);
            socket.off('roomFound', handleRoomFound);
        }

    }, [roomCode, navigate, createState, socket, updateStores, userName]);

    //========== Pop Up control: =============\\
    const [popup, setPopup] = useState(null);

    const handlePopup = (popupType) => {
      setPopup(popupType);
    };
  
    const closePopup = () => {
      setPopup(null);
    };
    //=========================================\\
    return (
        <>
        <h1 className = "Title">Joe-Box</h1>
        <form className="home__container">
            <h2 className="home__header">Enter User or  Room Code</h2>
            <label htmlFor="username">Username</label>
            <input
                type="text"
                minLength={6}
                name="username"
                id="username"
                className="username__input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />
            <label htmlFor="roomCode">Room Code</label>
            <input
                type="text"
                minLength={6}
                name="roomCode"
                id="roomCode"
                className="roomcode__input"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
            />
            <div className = "buttons">
                <button className = "interaction" type = "button" onClick = {handleSearch}>Search Room</button>
                <button className = "interaction"type = "button" onClick = {handleCreate}>Create Room</button>
            </div>
        </form>

        {popup && (
            <div className="popup">
                <div className="popup-content">
                    <span className="close" onClick={closePopup}>&times;</span>
                    {popup === 'userNameError' &&
                    <div className= "popText">
                        <p>Enter a Username!</p>
                    </div>}
                    {popup === 'roomError' &&
                    <div className= "popText">
                        <p>Room Codes Must be At Least 6 Characters!</p>
                    </div>}
                </div>
            </div>
        )}
        </>
    );
};

export default Home;