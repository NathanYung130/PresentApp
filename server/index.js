const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
const socketIO = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
    },
});

const supabase = require('./supabaseClient'); // Ensure this path is correct

app.use(cors());

socketIO.on('connection', (socket) => {
    console.log(`🔥User connected: ${socket.id}`);

    socket.on('joinRoom', async ({ userName, roomCode }) => {
        try {
            socket.join(roomCode);
            socket.roomCode = roomCode;

            const { error: insertError } = await supabase
                .from('room_users')
                .insert([{ username: userName, roomcode: roomCode, socketid: socket.id }]);

            if (insertError) throw insertError;

            const { data: users, error: fetchError } = await supabase
                .from('room_users')
                .select('username, socketid')
                .eq('roomcode', roomCode);

            if (fetchError) throw fetchError;

            socketIO.to(roomCode).emit('newUserResponse', users);
        } catch (error) {
            console.error('Error handling joinRoom:', error.message);
        }
    });

    socket.on('message', async (data) => {
        try {
            console.log('Received message data:', data);

            // Ensure all necessary fields are present
            if (!data.text || !data.name || !data.socketID) {
                throw new Error('Missing data fields');
            }
            console.log('Text:', data.text);
            console.log('id:', data.id);
            console.log('Name:', data.name);
            console.log('Socket ID:', data.socketID);
            console.log('Romm code actual: ', data.roomCode)

            // Store message in Supabase
            const { error } = await supabase
                .from('messages')
                .insert([{ text: data.text, name: data.name, roomcode: data.roomCode, socketid: data.socketID }]);

            if (error) throw error;

            socketIO.to(data.roomCode).emit('messageResponse', data);
        } catch (error) {
            console.error('Error handling message:', error.message);
        }
    });

    socket.on('disconnect', async () => {
        try {
            const roomCode = socket.roomCode;
            console.log('User disconnected:', socket.id);

            const { error: deleteUserError } = await supabase
                .from('room_users')
                .delete()
                .eq('socketid', socket.id);

            if (deleteUserError) throw deleteUserError;

            const { data: remainingUsers, error: fetchRemainingError } = await supabase
                .from('room_users')
                .select('username, socketid')
                .eq('roomcode', roomCode);

            if (fetchRemainingError) throw fetchRemainingError;

            socketIO.to(roomCode).emit('newUserResponse', remainingUsers);

            // If the room is empty, delete all messages
            if (remainingUsers.length === 0) {
                const { error: deleteMessagesError } = await supabase
                    .from('messages')
                    .delete()
                    .eq('roomcode', roomCode);

                if (deleteMessagesError) throw deleteMessagesError;
            }

            socket.leave(roomCode);
        } catch (error) {
            console.error('Error handling disconnect:', error.message);
        }
    });
});

http.listen(4000, () => {
    console.log("Server listening on port 4000");
});
