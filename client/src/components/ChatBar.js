import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ChatBar = ({ socket }) => {
  const [users, setUsers] = useState([]);
  const roomId = useSelector((state) => state.room.roomId);

  useEffect(() => {
    socket.on('newUserResponse', (data) => setUsers(data));
  }, [socket, users]);


  return (
    <div className="chat__sidebar">
      <h2>Open Chat</h2>
      <div>
        <h4 className="chat__header">ACTIVE USERS</h4>
        <div className="chat__users">
          {users.map((user) => (
            <p key={user.socketID}>{user.userName}</p>
          ))}
        </div>
        <h4> Room: </h4>
          <p>{roomId}</p>
      </div>
    </div>
  );
};

export default ChatBar;