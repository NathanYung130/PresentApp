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
const getNextState = (currentState) => {
    const states = ['answerInitialQuestion', 'othersAnswering', 'voting', 'leaderboard'];
    const currentIndex = states.indexOf(currentState);
    return states[(currentIndex + 1) % states.length];
};
const rooms = {}; // structure to store room data
const games = {};

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('queryRoom', async ({ userName, roomCode }) => {
        const { data: room, error: roomFetchError } = await supabase
            .from('room_users')
            .select('roomcode')
            .eq('roomcode', roomCode);

        if (roomFetchError) {
            throw roomFetchError;
        }

        if (room.length === 0) {
            console.log('room does not exist')
            // If the room does not exist, send an error back to the client
            socket.emit('roomNotFound');

        } else {
            console.log('room exists');
            socket.emit('roomFound');
        }

        return;
    });

    socket.on('joinRoom', async ({ userName, roomCode }) => {
        try {
            // Use a transaction to ensure atomicity
            const { data: room, error: roomFetchError } = await supabase
                .from('room_users')
                .select('roomcode')
                .eq('roomcode', roomCode);

            if (roomFetchError) {
                throw roomFetchError;
            }

            socket.join(roomCode);
            socket.roomCode = roomCode;

            console.log('Adding to store', socket.id);
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
    

     
    //=============== GAME START HANDLER ==================
    //=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
    //Game start notifier, activated when user clicks "Start Game"
    //@data = any data to be passed (to be decided if this is neccessary)
    //USER STARTS GAME: this one is to emit
    socket.on('startGame', () => {
        console.log('Game started in room: ', roomCode);
        //Broadcast to all users that game has started
        socketIO.to(roomCode).emit('gameStarted');
    });

    socket.on('startGame', async () => {
        try {
            // Fetch all users in the current room from the database
            const { data: users, error: fetchError } = await supabase
                .from('room_users')
                .select('username')
                .eq('roomcode', socket.roomCode);

            if (fetchError) throw fetchError;


            //get total players in room
            if (!rooms[socket.roomCode]) {
                rooms[socket.roomCode] = {
                    totalPlayers : users.length,
                    amsweredUsers: [],
                }
            }
                //Set up the game state if it doesn't already exist
                const totalPlayers = users.length;
            if (!games[socket.roomCode]) {
                games[socket.roomCode] = {
                    answersSubmitted: 0,
                    totalPlayers: rooms[socket.roomCode].totalPlayers, // Ensure this is correctly set
                    gameState: 'answerInitialQuestion', // Set initial game state
                };
            }




            // Fetch all questions
            const { data: questions, error: fetchQuestionsError } = await supabase
                .from('questions')
                .select('*');
            
            if (fetchQuestionsError) throw fetchQuestionsError;
            console.log(questions)
            // Shuffle the questions array and assign each player a unique question
            const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
            const playerQuestions = users.map((user, index) => ({
                username: user.username,
                question: shuffledQuestions[index % shuffledQuestions.length].question_text,
            }));
            

            // Store the assigned questions in a Redux store or send them to each client
            playerQuestions.forEach(({ username, question }) => {
                // socketIO.to(socket.roomCode).emit('assignedQuestion', { username, question });
                console.log(`Emitting question for username: ${username}, question: ${question}`);
                socketIO.to(socket.roomCode).emit('assignedQuestion', { username, question });
                console.log('room code: ', socket.roomCode);
                
            //   console.log('username: ', username, 'question: ', question);
            });
            





            
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

            // Determine the next game state, but doesn't go back to initial state
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

//Moves to NEXT STATE after all users submit their answers
socket.on('submitAnswer', (roomCode) => {
    // Increment answer count for the room
    games[roomCode].answersSubmitted += 1;
    console.log('submitted answers',games[roomCode].answersSubmitted);
    // Check if all players have submitted their answers
    if (games[roomCode].answersSubmitted === games[roomCode].totalPlayers) {
        // Reset answer count
        games[roomCode].answersSubmitted = 0;
        
        // Move to the next game state
        // [MAKE SURE that this game state is synced with the frontend. The change should be reflected in here
        // when the gamestate changes regardless of how it is changed. might want to make another event that 
        // updates the game state in the backend whenever it is changed in the fron end (maybe use a global veriable
        //in change game state)]
        games[roomCode].gameState = getNextState(games[roomCode].gameState);
        
        // Emit event to all clients in the room
        // io.to(roomCode).emit('updateGameState', games[roomCode].gameState);
        socketIO.to(roomCode).emit('updateGameState', games[roomCode].gameState);
        console.log('Submit Answer activated',games);
    }
    console.log('Submit Answer activated (outside of loop )',games);
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

socketIO.on('query', (socket) => {
    
    socket.on('ifRoomExists', async ({ targetRoom }) => {
        console.log(`⚡: ${socket.id} Made a request!`);
        // Fetch roomcode
        const { data: room, error: fetchError } = await supabase
            .from('room_users')
            .select('roomcode')
            .eq('roomcode', targetRoom);

            if (fetchError) {
                console.error(fetchError);
              } else {
                  console.log(room);
                const roomExists = room.length > 0;
                console.log('RoomChecker: ',roomExists); // true or false
              }
    })

    socket.on('pingServer', () => {
        console.log('Ping received');
        socket.emit('pongClient');
    });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
