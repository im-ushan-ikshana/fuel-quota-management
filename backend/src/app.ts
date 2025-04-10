import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';

const app = express();

// Middleware
app.use(morgan('dev'));         // Logs HTTP requests
app.use(cors());                // Enables cross-origin requests
app.use(express.json());        // Parses JSON request body

// Main router
app.use('/api', routes);

export default app;
