const express = require("express");
const app = express();
const PORT = 4000;

const http = require("http").Server(app);
const cors = require("cors");



const socketIO = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
    },
});

const supabase = require('./supabaseClient');

app.use(cors());
const gameStates = ['answerInitialQuestion', 'othersAnswering', 'voting', 'leaderboard'];

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

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
    

     /*
    //=============== GAME START HANDLER ==================
    //=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
    //Game start notifier, activated when user clicks "Start Game"
    //@data = any data to be passed (to be decided if this is neccessary)
    socket.on('startGame', (data) => {
        console.log('Game started in room: ', roomCode);
        //Broadcast to all users that game has started
        socketIO.to(roomCode).emit('gameStarted', roomCode);
        })
    */
    //USER STARTS GAME: this one is to emit
    socket.on('startGame', () => {
        console.log('Game started in room: ', roomCode);
        //Broadcast to all users that game has started
        socketIO.to(roomCode).emit('gameStarted');
    })

    socket.on('startGame', async () => {
        try {
            // Fetch all users in the current room from the database
            const { data: users, error: fetchError } = await supabase
                .from('room_users')
                .select('username')
                .eq('roomcode', socket.roomCode);

            if (fetchError) throw fetchError;
            
            // Extract usernames and shuffle the player order randoml
            const players = users.map(user => user.username);
            const shuffledPlayers = players.sort(() => 0.5 - Math.random());

            // Insert a new game session into the database
            const { error: insertError } = await supabase.from('game_sessions').insert({
                room_code: socket.roomCode,
                current_question: 0,
                current_answerer: null,
                game_stage: 'answerInitialQuestion',// Set initial game state
                players: shuffledPlayers,
                answered_players: [],
                sitting_out_player: null,
                players_who_sat_out: []
            });

            if (insertError) throw insertError;

            // Notify all clients in the room that the game has started
            // socketIO.to(socket.roomCode).emit('gameStateChange', { 
            //     state: 'answerInitialQuestion', 
            //     message: 'Answer question 1' 
            // });
            // socketIO.to(socket.roomCode).emit('gameStateChange', { state: 'answerInitialQuestion', sittingOutPlayer: 'na'});
            state = 'answeringInitialQuestions';
            socketIO.to(socket.roomCode).emit('gameStateChange', { 
              state: gameStates[0], 
              sittingOutPlayer: 'na' 
          }); console.log(state, ' state');

        } catch (error) {
            console.error('Error starting game:', error.message);
        }
    });

    // Handler for advancing to the next game state
    socket.on('nextGameState', async () => {
        try {
            // Fetch the current game session data from the database
            const { data, error } = await supabase
                .from('game_sessions')
                .select('*')
                .eq('room_code', socket.roomCode)
                .single();

            if (error) throw error;

            // Initialize variables for the next state
            let nextState;
            let sittingOutPlayer = data.sitting_out_player;
            let answeredPlayers = data.answered_players || [];
            let playersWhoSatOut = data.players_who_sat_out || [];
            let currentStateIndex = gameStates.indexOf(data.game_stage);

            // Determine the next game state
            if (currentStateIndex === -1 || currentStateIndex === gameStates.length - 1) {
                nextState = gameStates[1];
            } else {
                nextState = gameStates[currentStateIndex + 1];
            }

            if (nextState === 'othersAnswering') {
                const availablePlayers = data.players.filter(player => !playersWhoSatOut.includes(player));
                
                if (availablePlayers.length === 0) {
                    // If all players have sat out, move to endgame
                    nextState = 'endGame';
                } else {
                    // Choose a new player to sit out
                    sittingOutPlayer = availablePlayers[0];
                    playersWhoSatOut.push(sittingOutPlayer);
                    answeredPlayers = [sittingOutPlayer];
                }
            }
            // Update the game session in the database
            await supabase
                .from('game_sessions')
                .update({
                    game_stage: nextState,
                    sitting_out_player: sittingOutPlayer,
                    answered_players: answeredPlayers,
                    players_who_sat_out: playersWhoSatOut
                })
                .eq('room_code', socket.roomCode);
            // Notify all clients in the room about the new game state
            socketIO.to(socket.roomCode).emit('gameStateChange', { state: nextState, sittingOutPlayer });
        } catch (error) {
            console.error('Error changing game state:', error.message);
        }
    });


});
   
// SENDING MESSAGES//
socket.on('message', async (data) => {
  try {
      console.log('Received message data:', data);

      // Ensure all necessary fields are present
      if (!data.text || !data.name || !data.socketID) {
          throw new Error('Missing data fields');
      }

      // Store message in Supabase
      const { error } = await supabase
          .from('messages')
          .insert([{ text: data.text, name: data.name, roomcode: data.roomCode, socketid: data.socketID }]);

      if (error) throw error;

      // Emit the message to all clients in the room
      socketIO.to(data.roomCode).emit('messageResponse', {
          text: data.text,
          name: data.name,
          socketID: data.socketID
      });
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

      // If the room is empty, delete all messages and the game session
      if (remainingUsers.length === 0) {
          // Delete all messages for the room
          const { error: deleteMessagesError } = await supabase
              .from('messages')
              .delete()
              .eq('roomcode', roomCode);

          if (deleteMessagesError) throw deleteMessagesError;

          // Delete the game session for the room
          const { error: deleteGameSessionError } = await supabase
              .from('game_sessions')
              .delete()
              .eq('room_code', roomCode);

          if (deleteGameSessionError) throw deleteGameSessionError;

          console.log(`Deleted game session for room: ${roomCode}`);
      }

      socket.leave(roomCode);
  } catch (error) {
      console.error('Error handling disconnect:', error.message);
  }
});
});


http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
