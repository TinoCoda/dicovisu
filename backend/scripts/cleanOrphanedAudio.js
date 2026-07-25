import mongoose from 'mongoose';
import Word from '../models/word.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Migration script to clean up orphaned audio metadata
 *
 * This script removes audio metadata from words where:
 * 1. The audio file was stored on ephemeral filesystem (no 'key' or 'url' field)
 * 2. The audio metadata exists but the file is missing from R2
 *
 * Run this once after migrating to Cloudflare R2 to clean up old metadata
 * from the Render ephemeral filesystem.
 */
async function cleanOrphanedAudio() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully\n');

        // Find all words with audio metadata
        const wordsWithAudio = await Word.find({
            'audio': { $exists: true, $ne: null }
        });

        console.log(`Found ${wordsWithAudio.length} words with audio metadata\n`);

        let cleanedCount = 0;
        let skippedCount = 0;

        for (const word of wordsWithAudio) {
            // If audio metadata exists but doesn't have R2 key/url (old filesystem storage)
            if (word.audio && (!word.audio.key || !word.audio.url)) {
                console.log(`Cleaning orphaned audio from word: "${word.word}" (ID: ${word._id})`);
                console.log(`  Old metadata: filename="${word.audio.filename}", size=${word.audio.size} bytes`);

                word.audio = undefined;
                await word.save();
                cleanedCount++;
            } else if (word.audio?.key && word.audio?.url) {
                console.log(`Skipping word "${word.word}" - has valid R2 audio`);
                skippedCount++;
            }
        }

        console.log('\n=== Migration Complete ===');
        console.log(`Total words processed: ${wordsWithAudio.length}`);
        console.log(`Cleaned (orphaned metadata removed): ${cleanedCount}`);
        console.log(`Skipped (valid R2 audio): ${skippedCount}`);

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

cleanOrphanedAudio();
