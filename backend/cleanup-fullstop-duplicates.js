/**
 * Cleanup Script: Remove Duplicate Words Ending with Fullstop
 * 
 * Algorithm:
 * 1. Find all words ending with '.'
 * 2. For each word ending with '.', check if there's a matching word without '.'
 * 3. If match found with same description, delete the word with '.'
 * 4. Keep the clean word untouched
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Word from './models/word.model.js';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory (root of project)
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔗 MongoDB URI:', process.env.MONGO_URI ? 'Found ✅' : 'Not found ❌');
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error('❌ MONGO_URI is not defined in environment variables.');
    process.exit(1);
}

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Main cleanup function
const cleanupDuplicates = async () => {
    try {
        console.log('\n🔍 Starting cleanup process...\n');

        // Find all words ending with '.'
        const wordsWithFullstop = await Word.find({
            word: { $regex: /\.$/ }
        });

        console.log(`📊 Found ${wordsWithFullstop.length} words ending with fullstop\n`);

        if (wordsWithFullstop.length === 0) {
            console.log('✨ No words with fullstop found. Database is clean!');
            return;
        }

        let deletedCount = 0;
        let keptCount = 0;
        const deletionLog = [];

        // Process each word with fullstop
        for (const wordWithFullstop of wordsWithFullstop) {
            // Remove the trailing fullstop to get the clean version
            const cleanWord = wordWithFullstop.word.replace(/\.$/, '');

            // Look for the clean version in database
            const cleanVersion = await Word.findOne({
                word: cleanWord,
                meaning: wordWithFullstop.meaning // Same description
            });

            if (cleanVersion) {
                // Found a match! Delete the word with fullstop
                console.log(`🗑️  Deleting: "${wordWithFullstop.word}" (ID: ${wordWithFullstop._id})`);
                console.log(`   ✅ Clean version exists: "${cleanVersion.word}" (ID: ${cleanVersion._id})`);
                console.log(`   📝 Meaning: ${wordWithFullstop.meaning.substring(0, 50)}...`);
                
                await Word.findByIdAndDelete(wordWithFullstop._id);
                
                deletionLog.push({
                    deleted: wordWithFullstop.word,
                    deletedId: wordWithFullstop._id.toString(),
                    kept: cleanVersion.word,
                    keptId: cleanVersion._id.toString(),
                    meaning: wordWithFullstop.meaning
                });
                
                deletedCount++;
                console.log('');
            } else {
                        language: cleanVersion.language,
                        example: cleanVersion.example,
                        translations: cleanVersion.translations,
                        relatedWords: cleanVersion.relatedWords
                    },
                    suggestion: {
                        action: "Consider adding as synonym or variant",
                        reason: "Same meaning but different word form (with/without fullstop)"
                    }
                });
                
                await Word.findByIdAndDelete(wordWithFullstop._id);
                
                deletionLog.push({
                    deleted: wordWithFullstop.word,
                    deletedId: wordWithFullstop._id.toString(),
                    kept: cleanVersion.word,
                    keptId: cleanVersion._id.toString(),
                    meaning: wordWithFullstop.meaning
                });
                
                deletedCount++;
                console.log('');
            } else {
                // No clean version found, keep the word with fullstop
                console.log(`⚠️  Keeping: "${wordWithFullstop.word}" (no clean version found)`);
                console.log(`   📝 Meaning: ${wordWithFullstop.meaning.substring(0, 50)}...`);
                console.log('');
                keptCount++;
            }
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 CLEANUP SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Deleted duplicates: ${deletedCount}`);
        console.log(`⚠️  Kept (no match found): ${keptCount}`);
        console.log(`📊 Total processed: ${wordsWithFullstop.length}`);
        console.log('='.repeat(60) + '\n');

        if (deletionLog.length > 0) {
            console.log('📋 Detailed Deletion Log:');
            console.log('-'.repeat(60));
            deletionLog.forEach((log, index) => {
                console.log(`${index + 1}. Deleted: "${log.deleted}" (${log.deletedId})`);
                console.log(`   Kept: "${log.kept}" (${log.keptId})`);
            });
            console.log('-'.repeat(60) + '\n');
        }

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    }
};

// Run the script
const run = async () => {
    try {
        await connectDB();
        await cleanupDuplicates();
        
        console.log('✨ Cleanup completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
};

// Execute
run();
