import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOptions from './config/corsOptions.js';
import errorHandler from './middleware/errorHandler.js';
import { logEvents, logger } from './middleware/logger.js';

import { connectDB } from './config/db.js';

import wordRoutes from './routes/word.route.js';
import languageRoute from './routes/language.route.js';
import userRoute from './routes/user.route.js';
import authRoute from './routes/auth.route.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Recreate __dirname for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/|\/$/g, '').replace(/\//g, '\\');

app.use(express.json());

app.use(logger);

app.use((req, res, next) => {
    const realOrigin = req.headers['x-real-origin'];
    if (realOrigin) {
      console.log('Detected real origin via proxy:', realOrigin);
    }
    next();
  });
  

app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/api/words', wordRoutes);
app.use('/api/languages', languageRoute);
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html')); // Use recreated __dirname
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});