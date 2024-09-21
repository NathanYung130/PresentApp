import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from 'nanoid';
import { setUser, setRoomId, setSocketId } from '../Redux/roomSlice';
import './styles/ChatBody.css';

const ChatBody = ({ messages, lastMessageRef, socket }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const roomId = useSelector((state) => state.room.roomId);
    const currentUserName = useSelector((state) => state.room.userName);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            <button onClick={toggleExpand} className="toggle__button">
                {isExpanded ? "HIDE" : "SHOW"}
            </button>
            
            {/* Conditionally render the message__container only if there are messages */}
            {messages.length > 0 && (
                <div className={`message__container ${isExpanded ? 'expanded' : 'collapsed'}`}>
                    {messages.map((message) => {
                        const isCurrentUser = message.name === currentUserName;
                        return (
                            <div className="message__chats" key={nanoid(6)}>
                                <p className="sender__name">{isCurrentUser ? "You" : message.name}</p>
                                <div className={isCurrentUser ? "message__sender" : "message__recipient"}>
                                    <p>{message.text}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={lastMessageRef} />
                </div>
            )}
        </>
    );
};

export default ChatBody;
