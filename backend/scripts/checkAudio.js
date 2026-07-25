import mongoose from 'mongoose';
import Word from '../models/word.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkAudio() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully\n');

        // Find words with audio
        const wordsWithAudio = await Word.find({
            'audio': { $exists: true, $ne: null }
        }).limit(5);

        console.log(`Found ${wordsWithAudio.length} words with audio metadata\n`);

        if (wordsWithAudio.length > 0) {
            console.log('Sample word with audio:');
            const sample = wordsWithAudio[0];
            console.log('Word:', sample.word);
            console.log('Audio metadata:', JSON.stringify(sample.audio, null, 2));
            console.log('\nChecking if audio has required R2 fields:');
            console.log('  - Has key?', !!sample.audio?.key);
            console.log('  - Has url?', !!sample.audio?.url);
            console.log('  - Has filename?', !!sample.audio?.filename);

            if (sample.audio?.url) {
                console.log('\nAudio URL:', sample.audio.url);
            }
        } else {
            console.log('No words with audio found in database.');
        }

        // Check total words
        const totalWords = await Word.countDocuments();
        console.log(`\nTotal words in database: ${totalWords}`);

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

checkAudio();
