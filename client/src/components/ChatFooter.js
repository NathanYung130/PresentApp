import React, { useState } from 'react';

import styles from './styles/ChatFooter.css'
const ChatFooter = ({ socket }) => {
  const [message, setMessage] = React.useState('');
  const roomCode = localStorage.getItem('roomCode');
  const currentUserName = localStorage.getItem('userName');

  const handleTyping = () =>
    socket.emit('typing', `${currentUserName} is typing`);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && currentUserName) {
      socket.emit('message', {
        text: message,
        name: currentUserName,
        roomCode: roomCode, // Send the room code along with the message
        socketID: socket.id,
      });
    }
    setMessage('');
  };
  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Write message"
          className="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
        />
        {/* OnKeyDown function */}
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;