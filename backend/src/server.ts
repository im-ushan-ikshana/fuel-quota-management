/**
 * @file server.ts
 * @description Main entry point for the Express server. -- main entry point for the server
 * @author @im-ushan-ikshana
 */

//import the express app from the app.ts file
import app from './app';

//import dotenv to load environment variables from .env file
const PORT = process.env.PORT || 3000;


// Start the server-- start the server and listen on the specified port
app.listen(PORT, () => {
  // Log the server start message -- log the message to the console
  console.log(`Server is running on port ${PORT}`);
});
