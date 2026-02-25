import mongoose from 'mongoose';
import Word from '../models/word.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const debugDictionaryMap = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const words = await Word.find();
    
    // Build dictionary map exactly like in statistics
    const dictionaryWordsMap = new Map();
    
    words.forEach(wordDoc => {
        const normalizedWord = wordDoc.word.toLowerCase().trim();
        const individualWords = normalizedWord
            .replace(/[.,!?;:()\[\]{}""'']/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1);
        
        individualWords.forEach(word => {
            dictionaryWordsMap.set(word, (dictionaryWordsMap.get(word) || 0) + 1);
        });
    });
    
    console.log(`Total unique words in dictionary map: ${dictionaryWordsMap.size}\n`);
    
    // Check if "muana" is in the map
    if (dictionaryWordsMap.has('muana')) {
        console.log(`✓ "muana" IS in dictionary map`);
        console.log(`  Appears in ${dictionaryWordsMap.get('muana')} dictionary entries\n`);
    } else {
        console.log(`✗ "muana" is NOT in dictionary map\n`);
    }
    
    // Now simulate counting in examples for H131
    const h131Words = words.filter(w => w.language.includes('H131'));
    const dictionaryWordsInExamples = new Map();
    
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
    
    h131Words.forEach(wordDoc => {
        if (wordDoc.example) {
            const exampleWords = extractWords(wordDoc.example);
            exampleWords.forEach(exWord => {
                if (dictionaryWordsMap.has(exWord)) {
                    dictionaryWordsInExamples.set(exWord,
                        (dictionaryWordsInExamples.get(exWord) || 0) + 1
                    );
                }
            });
        }
    });
    
    console.log(`Dictionary words found in H131 examples: ${dictionaryWordsInExamples.size}\n`);
    
    if (dictionaryWordsInExamples.has('muana')) {
        console.log(`✓ "muana" found in H131 examples: ${dictionaryWordsInExamples.get('muana')} occurrences`);
    } else {
        console.log(`✗ "muana" NOT found in H131 examples count`);
    }
    
    // Show top 10
    const sorted = Array.from(dictionaryWordsInExamples.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    console.log(`\nTop 10 dictionary words in H131 examples:`);
    sorted.forEach(([word, count], idx) => {
        console.log(`${idx + 1}. ${word}: ${count}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

debugDictionaryMap();
