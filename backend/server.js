import express from 'express';
import dotenv from 'dotenv';

import {connectDB} from './config/db.js';

import wordRoutes from './routes/word.route.js';
import languageRoute from './routes/language.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/words', wordRoutes);
app.use('/api/languages', languageRoute);
app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`)
    
});