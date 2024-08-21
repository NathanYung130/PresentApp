import React, { useEffect, useState, useRef } from 'react';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import supabase from '../supabaseClient';
console.log('Supabase client:', supabase);

const ChatPage = ({ socket }) => {
    const [messages, setMessages] = useState([]);
    const [typingStatus, setTypingStatus] = useState('');
    const lastMessageRef = useRef(null);
    const [newMessage, setNewMessage] = useState('');

    // Store the current user's name
    const currentUserName = localStorage.getItem('userName');
    const roomCode = localStorage.getItem('roomCode');

    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('roomcode', roomCode);

            setMessages(data || []);
        };

        fetchMessages();

        const handleMessageResponse = (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        const handleTypingResponse = (data) => {
            setTypingStatus(data);
        };

        socket.on('messageResponse', handleMessageResponse);
        socket.on('typingResponse', handleTypingResponse);

        return () => {
            socket.off('messageResponse', handleMessageResponse);
            socket.off('typingResponse', handleTypingResponse);
        };
    }, [socket, roomCode]);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;

        socket.emit('message', {
            text: newMessage,
            name: currentUserName,
            roomCode: roomCode,
            socketID: socket.id,
        });

        setNewMessage('');
    };

    return (
        <div className="chat">
            <ChatBar socket={socket} />
            <div className="chat__main">
                <ChatBody
                    messages={messages}
                    typingStatus={typingStatus}
                    lastMessageRef={lastMessageRef}
                    currentUserName={currentUserName} // Pass the current user's name to ChatBody
                />
                <ChatFooter
                    socket={socket}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleSendMessage={handleSendMessage}
                />
            </div>
        </div>
    );
};

export default ChatPage;