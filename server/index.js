const express = require("express");
const app = express();
const PORT = 4000;

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

const socketIO = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
    },
});

let rooms = {};

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('joinRoom', ({ userName, roomCode }) => {
        socket.join(roomCode);

        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
        }
        rooms[roomCode].push({ userName, socketID: socket.id });

        socketIO.to(roomCode).emit('newUserResponse', rooms[roomCode]);

        // This should be inside the 'joinRoom' event listener to ensure room-specific broadcasting
        socket.on('message', (data) => {
            socketIO.to(roomCode).emit('messageResponse', data);
        });

        socket.on('typing', (data) => {
            socket.broadcast.to(roomCode).emit('typingResponse', data);
        });

        socket.on('disconnect', () => {
            console.log('🔥: A user disconnected');
            rooms[roomCode] = rooms[roomCode].filter((user) => user.socketID !== socket.id);
            socketIO.to(roomCode).emit('newUserResponse', rooms[roomCode]);
            socket.leave(roomCode); // Ensure the user leaves the room
        });
    });
});

app.get("/api", (req, res) => {
    res.json({
        message: "Hello world",
    });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
