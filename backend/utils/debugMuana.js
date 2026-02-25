import mongoose from 'mongoose';
import Word from '../models/word.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const debugMuana = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const words = await Word.find({ language: 'H131' });
    
    // Helper function matching the one in statistics
    const extractWords = (text) => {
        if (!text) return [];
        const dialectPart = text.split(/\s*[Hh]\d+/)[0] || text;
        return dialectPart
            .toLowerCase()
            .replace(/[.,!?;:()\[\]{}""'']/g, ' ')
            .split(/\s+/)
            .map(word => word.trim())
            .filter(word => word.length > 1);
    };
    
    let muanaCount = 0;
    const examplesWithMuana = [];
    
    words.forEach(word => {
        if (word.example) {
            const exampleWords = extractWords(word.example);
            const muanaOccurrences = exampleWords.filter(w => w === 'muana').length;
            
            if (muanaOccurrences > 0) {
                muanaCount += muanaOccurrences;
                examplesWithMuana.push({
                    word: word.word,
                    example: word.example,
                    count: muanaOccurrences
                });
            }
        }
    });
    
    console.log(`Total "muana" occurrences in H131 examples: ${muanaCount}`);
    console.log(`\nFound in ${examplesWithMuana.length} different word entries:\n`);
    
    examplesWithMuana.slice(0, 10).forEach(item => {
        console.log(`Word: ${item.word}`);
        console.log(`Occurrences: ${item.count}`);
        console.log(`Example: ${item.example.substring(0, 80)}...`);
        console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

debugMuana();
