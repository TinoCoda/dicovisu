import path from 'path';
import { fileURLToPath } from 'url';
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
import countryRoute from './routes/country.route.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Recreate __dirname for ES modules — must stay OS-agnostic: the previous
// hand-rolled version forced backslashes into the path, which is a Windows
// path separator, not a POSIX one. On Linux (e.g. inside Docker) that broke
// path.join() silently: it collapsed to a bare relative "logs"/"views"
// segment that resolved against the process CWD instead of this directory,
// so request logs ended up in the wrong folder and the 404 page 404'd.
const __root = path.resolve();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(logger);
app.use(cors(corsOptions));

app.use(cookieParser());

// Audio files are now served from Cloudflare R2 (cloud storage)
// No need to serve static files from local filesystem anymore

app.use('/api/words', wordRoutes);
app.use('/api/languages', languageRoute);
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/countries', countryRoute);

if(process.env.NODE_ENV === 'production') {
    console.log('Production mode: Serving static files from frontend/dist');
    app.use(express.static(path.join(__root, '/frontend/dist'))); // Serve static files in development
    app.get('*', (req, res) => {
        res.sendFile(path.join(__root, 'frontend','dist', 'index.html')); // Serve index.html for all other routes
    });
}

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

app.use(errorHandler); // ✅ Error handler should be LAST

app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});