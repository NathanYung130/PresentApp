import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, setRoomId, setSocketId} from '../Redux/roomSlice'
import { setCurrUsers } from '../Redux/roomSlice';
import { nanoid } from 'nanoid';

import './styles/ChatBar.css'

const ChatBar = ({ socket }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const roomId = useSelector((state) => state.room.roomId);
  const userId = useSelector((state) => state.room.userName);
  const dispatch = useDispatch();

  useEffect(() => {
    // socket.on('newUserResponse', (data) => setUsers(data));
    
    socket.on('newUserResponse', (data) => {
      setUsers(data);
      dispatch(setCurrUsers(data.length)); // Dispatch the number of users
    });

    return () => {
      socket.off('newUserResponse');
    };
  }, [socket]);
  
  const handleLeaveChat = () => {
    //update Redux store with roomId
    dispatch(setUser(null));
    dispatch(setRoomId(null));
    dispatch(setSocketId(null));

    localStorage.removeItem('userName');
    navigate('/');
    console.log('left');
    window.location.reload();
  };

  return (
    <>
      <div className="chat__sidebar">
        <h2>Lobby: </h2>
        <div>
          <h4 className="chat__header">ACTIVE USERS</h4>
          <div className="chat__users">
            {users.map((user) => (
              <p 
              key={nanoid(8)}
              className={user.username === userId ? 'active-user' : ''}
              >{user.username}</p>
            ))}
          </div>
          <h4> Room: </h4>
            <p>{roomId}</p>
        </div>

        <button onClick = {handleLeaveChat}>Leave</button>
      </div>
    </>
  );
};

export default ChatBar;