import mongoose from 'mongoose';
import Word from '../models/word.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function searchWords() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully\n');

        // Search for words containing "kiki"
        const words = await Word.find({
            word: { $regex: 'kiki', $options: 'i' }
        });

        console.log(`Found ${words.length} words containing "kiki":\n`);

        for (const word of words) {
            console.log(`- "${word.word}" (ID: ${word._id})`);
            if (word.audio) {
                console.log(`  ✓ HAS AUDIO: ${word.audio.url}`);
            } else {
                console.log(`  ❌ NO AUDIO`);
            }
        }

        // Also check all words with audio
        console.log('\n\n=== All words with audio ===');
        const wordsWithAudio = await Word.find({ 'audio': { $exists: true, $ne: null } });
        console.log(`Total: ${wordsWithAudio.length} words\n`);

        for (const word of wordsWithAudio) {
            console.log(`- "${word.word}" (ID: ${word._id})`);
            console.log(`  URL: ${word.audio.url}`);
        }

        await mongoose.connection.close();
        console.log('\n\nDatabase connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

searchWords();
