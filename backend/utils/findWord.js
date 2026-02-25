import mongoose from 'mongoose';
import Word from '../models/word.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const findWord = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Search for "muana"
    const muanaWords = await Word.find({ word: /muana/i });
    
    if (muanaWords.length > 0) {
      console.log(`Found ${muanaWords.length} word(s) containing "muana":\n`);
      muanaWords.forEach(word => {
        console.log(`Word: ${word.word}`);
        console.log(`Languages: ${word.language.join(', ')}`);
        console.log(`Meaning: ${word.meaning}`);
        console.log(`Example: ${word.example || 'No example'}`);
        console.log('---');
      });
    } else {
      console.log('❌ "muana" is NOT in the dictionary');
    }
    
    // Also search in examples
    const wordsWithMuanaInExample = await Word.find({ example: /muana/i });
    console.log(`\nFound ${wordsWithMuanaInExample.length} words with "muana" in their examples`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

findWord();
