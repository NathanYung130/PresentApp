// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
exports.handler = async (event, context) => {
  const supabase = require('supabase');
  const supabaseUrl = 'https://yfwpnyixwmpaorygujhw.supabase.co'; // Replace with your Supabase project URL
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmd3BueWl4d21wYW9yeWd1amh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNDQzODMsImV4cCI6MjAzOTcyMDM4M30.FyQBmQ0oppZrpMJ3RCneulxM_rdr41bZU3L0rPSyz3k'; // Replace with your Supabase API key

  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  const roomCode = event.pathParameters.roomCode; // Get the room code from the request path

  // Retrieve messages from the specified room
  const { data: messages, error: messagesError } = await supabaseClient.from('messages').select('*').eq('roomCode', roomCode);

  if (messagesError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: messagesError.message }),
    };
  }

  // Retrieve usernames of users in the specified room
  const { data: roomUsers, error: roomUsersError } = await supabaseClient.from('room_users').select('username').eq('roomcode', roomCode);

  if (roomUsersError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: roomUsersError.message }),
    };
  }

  // Combine messages and usernames into a single response
  const response = {
    messages,
    users: roomUsers.map((user) => user.username),
  };

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/diffView' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
