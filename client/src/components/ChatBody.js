import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatBody = ({ messages, lastMessageRef }) => {
    const navigate = useNavigate();

    const handleLeaveChat = () => {
        localStorage.removeItem('userName');
        navigate('/');
        window.location.reload();
    };

    return (
        <>
            <header className="chat__mainHeader">
                <p>Hangout with Colleagues</p>
                <button className="leaveChat__btn" onClick={handleLeaveChat}>
                    LEAVE CHAT
                </button>
            </header>

            <div className="message__container">
                {messages.map((message) => {
                    const isCurrentUser = message.name === localStorage.getItem('userName');
                    return (
                        <div className="message__chats" key={message.id}>
                            <p className="sender__name">{isCurrentUser ? "You" : message.name}</p>
                            <div className={isCurrentUser ? "message__sender" : "message__recipient"}>
                                <p>{message.text}</p>
                            </div>
                        </div>
                    );
                })}

                {/* <div className="message__status">
                    <p>Someone is typing...</p>
                </div> */}
                <div ref={lastMessageRef} />
            </div>
        </>
    );
};

export default ChatBody;
