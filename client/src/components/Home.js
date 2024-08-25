import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import supabase from '../supabaseClient';
import { nanoid } from 'nanoid'

import { setUser, setRoomId, setSocketId} from '../Redux/roomSlice'

import './styles/Home.css'

const Home = ({ socket }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Import useDispatch from 'react-redux'

    const [userName, setUserName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [exists, setExists] = useState(null);

    const checkRoomId = async () => {
        const { data, error } = await supabase
          .from('room_users')
          .select('roomcode')
          .eq('roomcode', roomCode);
      
        if (error) {
          console.error(error);
          setExists(false);
        } else {
            console.log(data);
          const roomExists = data.length > 0;
          console.log('RoomChecker: ',roomExists); // true or false
          setExists(data.length > 0);
        }
    };

    //updates All front end based stores
    function updateStores(){
        localStorage.setItem('userName', userName);
        localStorage.setItem('roomCode', roomCode);

        //Update Redux store with roomCode via dispatch action
        dispatch(setUser(userName));
        dispatch(setRoomId(roomCode));
        dispatch(setSocketId(socket.id));
    };

    const handleSearch = () => {

        if (roomCode.length < 6) {
            alert("Username or Room Code must be at least 6 characters long!");
            return; // Prevent form submission if validation fails
        }
        updateStores();
        checkRoomId();
        // Send the username and room code to the Node.js server
        socket.emit('joinRoom', { userName, roomCode, socketID: socket.id });
        navigate(`/chat/${roomCode}`);
    };

    const handleCreate = () =>{
        if (roomCode.length < 6) {
            alert("Username or Room Code must be at least 6 characters long!");
            return; // Prevent form submission if validation fails
        }
        updateStores();

    };

    //roomvcheck
    

    useEffect(() => {
        // Listen for the 'gameStarted' event from the server
        socket.on('roomNotFound', () => {
            setExists(true);
            console.log('game not found!'); 
        });

        // Cleanup event listener when the component unmounts
        return () => {
            socket.off('roomNotFound');
        };
    }, [setExists]);


    

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
        </>
    );
};

export default Home;








    /*
    const checkRoomId = async (roomId) => {
        const { data, error } = await supabase
          .from('room_users')
          .select('roomcode')
          .eq('roomcode', roomId);
      
        if (error) {
          console.error(error);
        } else {
            console.log(data);
          const roomExists = data.length > 0;
          console.log('RoomChecker: ',roomExists); // true or false
          return roomExists;
        }
      };*/