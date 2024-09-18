const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const supabase = require('./supabaseClient');

// Server setup
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: "http://localhost:3000" }
});

const PORT = 4000;
app.use(cors());

// Game state constants
const gameStates = ['answerInitialQuestion', 'othersAnswering', 'voting', 'leaderboard'];
const rooms = {};
const games = {};

// Utility functions
const getNextState = (currentState) => {
    const currentIndex = gameStates.indexOf(currentState);
    return gameStates[(currentIndex + 1) % gameStates.length];
};

// Database operations
const dbOperations = {
    queryRoom: async (roomCode) => {
        const { data, error } = await supabase
            .from('room_users')
            .select('roomcode')
            .eq('roomcode', roomCode);
        if (error) throw error;
        return data;
    },
    addUserToRoom: async (userName, roomCode, socketId, isAdmin) => {
        const { error } = await supabase
            .from('room_users')
            .insert([{ username: userName, roomcode: roomCode, socketid: socketId, admin: isAdmin }]);
        if (error) throw error;
    },
    getUsersInRoom: async (roomCode) => {
        const { data, error } = await supabase
            .from('room_users')
            .select('username, socketid')
            .eq('roomcode', roomCode);
        if (error) throw error;
        return data;
    },
    getQuestions: async () => {
        const { data, error } = await supabase.from('questions').select('*');
        if (error) throw error;
        return data;
    },
    insertGameSession: async (roomCode, players) => {
        const { error } = await supabase.from('game_sessions').insert({
            room_code: roomCode,
            current_question: 0,
            current_answerer: null,
            game_stage: 'answerInitialQuestion',
            players: players,
            answered_players: [],
            sitting_out_player: null,
            players_who_sat_out: []
        });
        if (error) throw error;
    },
    updateGameSession: async (roomCode, updateData) => {
        const { error } = await supabase
            .from('game_sessions')
            .update(updateData)
            .eq('room_code', roomCode);
        if (error) throw error;
    },
    getGameSession: async (roomCode) => {
        const { data, error } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('room_code', roomCode)
            .single();
        if (error) throw error;
        return data;
    },
    insertMessage: async (text, name, roomCode, socketId) => {
        const { error } = await supabase
            .from('messages')
            .insert([{ text, name, roomcode: roomCode, socketid: socketId }]);
        if (error) throw error;
    },
    removeUserFromRoom: async (socketId) => {
        const { error } = await supabase
            .from('room_users')
            .delete()
            .eq('socketid', socketId);
        if (error) throw error;
    },
    cleanupRoom: async (roomCode) => {
        const tables = ['messages', 'game_sessions', 'question_answers', 'real_answers', 'score_tracker'];
        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('roomcode', roomCode);
            if (error) throw error;
        }
    }
};

// Socket event handlers
const socketHandlers = {
    queryRoom: async (socket, { userName, roomCode }) => {
        try {
            const room = await dbOperations.queryRoom(roomCode);
            socket.emit(room.length === 0 ? 'roomNotFound' : 'roomFound');
        } catch (error) {
            console.error('Error querying room:', error.message);
        }
    },
    joinRoom: async (socket, { userName, roomCode, firstUser }) => {
        try {
            await dbOperations.addUserToRoom(userName, roomCode, socket.id, firstUser);
            socket.join(roomCode);
            socket.roomCode = roomCode;
            const users = await dbOperations.getUsersInRoom(roomCode);
            io.to(roomCode).emit('newUserResponse', users);
        } catch (error) {
            console.error('Error handling joinRoom:', error.message);
        }
    },
    startGame: async (socket) => {
        try {
            const users = await dbOperations.getUsersInRoom(socket.roomCode);
            const questions = await dbOperations.getQuestions();
            const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
            
            users.forEach((user, index) => {
                const question = shuffledQuestions[index % shuffledQuestions.length].question_text;
                io.to(socket.roomCode).emit('assignedQuestion', { username: user.username, question });
            });

            const players = users.map(user => user.username);
            const shuffledPlayers = players.sort(() => 0.5 - Math.random());
            await dbOperations.insertGameSession(socket.roomCode, shuffledPlayers);

            rooms[socket.roomCode] = { totalPlayers: users.length, answeredUsers: [] };
            games[socket.roomCode] = { answersSubmitted: 0, totalPlayers: users.length, gameState: 'answerInitialQuestion' };

            io.to(socket.roomCode).emit('gameStateChange', { state: gameStates[0], sittingOutPlayer: 'na' });
        } catch (error) {
            console.error('Error starting game:', error.message);
        }
    },
    nextGameState: async (socket) => {
        try {
            const data = await dbOperations.getGameSession(socket.roomCode);
            let nextState;
            let sittingOutPlayer = data.sitting_out_player;
            let answeredPlayers = data.answered_players || [];
            let playersWhoSatOut = data.players_who_sat_out || [];
            let currentStateIndex = gameStates.indexOf(data.game_stage);

            if (currentStateIndex === -1 || currentStateIndex === gameStates.length - 1) {
                nextState = gameStates[1];
            } else {
                nextState = gameStates[currentStateIndex + 1];
            }

            if (nextState === 'othersAnswering') {
                const availablePlayers = data.players.filter(player => !playersWhoSatOut.includes(player));
                
                if (availablePlayers.length === 0) {
                    nextState = 'endGame';
                } else {
                    sittingOutPlayer = availablePlayers[0];
                    playersWhoSatOut.push(sittingOutPlayer);
                    answeredPlayers = [sittingOutPlayer];
                }
            }

            await dbOperations.updateGameSession(socket.roomCode, {
                game_stage: nextState,
                sitting_out_player: sittingOutPlayer,
                answered_players: answeredPlayers,
                players_who_sat_out: playersWhoSatOut
            });

            io.to(socket.roomCode).emit('gameStateChange', { state: nextState, sittingOutPlayer });
        } catch (error) {
            console.error('Error changing game state:', error.message);
        }
    },
    message: async (socket, data) => {
        try {
            if (!data.text || !data.name || !data.socketID) {
                throw new Error('Missing data fields');
            }
            await dbOperations.insertMessage(data.text, data.name, data.roomCode, data.socketID);
            io.to(data.roomCode).emit('messageResponse', data);
        } catch (error) {
            console.error('Error handling message:', error.message);
        }
    },
    submitAnswer: (socket, roomCode) => {
        games[roomCode].answersSubmitted += 1;
        if (games[roomCode].answersSubmitted === games[roomCode].totalPlayers) {
            games[roomCode].answersSubmitted = 0;
            games[roomCode].gameState = getNextState(games[roomCode].gameState);
            io.to(roomCode).emit('updateGameState', games[roomCode].gameState);
        }
        io.to(roomCode).emit('currentMembers', games[roomCode].totalPlayers);
        io.to(roomCode).emit('currentClicks', games[roomCode].answersSubmitted);
    },
    disconnect: async (socket) => {
        try {
            const roomCode = socket.roomCode;
            await dbOperations.removeUserFromRoom(socket.id);
            const remainingUsers = await dbOperations.getUsersInRoom(roomCode);
            io.to(roomCode).emit('newUserResponse', remainingUsers);

            if (remainingUsers.length === 0) {
                await dbOperations.cleanupRoom(roomCode);
                console.log(`Deleted game session for room: ${roomCode}`);
            }

            socket.leave(roomCode);
        } catch (error) {
            console.error('Error handling disconnect:', error.message);
        }
    },
    ifRoomExists: async (socket, { targetRoom }) => {
        try {
            const room = await dbOperations.queryRoom(targetRoom);
            console.log('RoomChecker:', room.length > 0);
        } catch (error) {
            console.error('Error checking if room exists:', error.message);
        }
    },
    pingServer: (socket) => {
        console.log('Ping received');
        socket.emit('pongClient');
    }
};

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('queryRoom', (data) => socketHandlers.queryRoom(socket, data));
    socket.on('joinRoom', (data) => socketHandlers.joinRoom(socket, data));
    socket.on('startGame', () => socketHandlers.startGame(socket));
    socket.on('nextGameState', () => socketHandlers.nextGameState(socket));
    socket.on('message', (data) => socketHandlers.message(socket, data));
    socket.on('submitAnswer', (roomCode) => socketHandlers.submitAnswer(socket, roomCode));
    socket.on('disconnect', () => socketHandlers.disconnect(socket));
});

io.of("/").on('connection', (socket) => {
    socket.on('ifRoomExists', (data) => socketHandlers.ifRoomExists(socket, data));
    socket.on('pingServer', () => socketHandlers.pingServer(socket));
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});