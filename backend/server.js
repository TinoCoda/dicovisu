import express from 'express';
import dotenv from 'dotenv';

import {connectDB} from './config/db.js';

import wordRoutes from './routes/word.route.js';
import languageRoute from './routes/language.route.js';
import { protect } from './middleware/auth.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/words', protect, wordRoutes);
app.use('/api/languages', protect, languageRoute);
app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`)
    
});