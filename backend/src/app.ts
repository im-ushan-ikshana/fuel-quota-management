/**
 * @file app.ts
 * @description Main application file for the Express server. -- main server file
 * @author @im-ushan-ikshana
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';

const app = express();

// Middleware
app.use(morgan('dev'));         // Logs HTTP requests -- added for debugging
app.use(cors());                // Enables cross-origin requests 
app.use(express.json());        // Parses JSON request body -- added for parsing JSON data

// Main router
app.use('/api', routes);

// export the app for use in other files -- handles as a module (can be used in server and test files)
export default app;
