import mongoose from 'mongoose';
import Word from '../models/word.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkWords() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully\n');

        // Check for "akiki" and "-awu"
        const words = ['akiki', '-awu'];

        for (const wordText of words) {
            const word = await Word.findOne({ word: wordText });

            console.log(`\n=== Word: "${wordText}" ===`);
            if (!word) {
                console.log('❌ NOT FOUND in database');
                continue;
            }

            console.log('✓ Found in database');
            console.log('ID:', word._id);

            if (word.audio) {
                console.log('✓ HAS AUDIO:');
                console.log('  - Key:', word.audio.key);
                console.log('  - URL:', word.audio.url);
                console.log('  - Filename:', word.audio.filename);
                console.log('  - Size:', word.audio.size, 'bytes');
                console.log('  - Uploaded:', word.audio.uploadedAt);
            } else {
                console.log('❌ NO AUDIO metadata');
            }
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

checkWords();
