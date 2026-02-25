import mongoose from 'mongoose';
import Word from '../models/word.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixLanguageCodes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all words
    const allWords = await Word.find({});
    console.log(`Found ${allWords.length} total words to check\n`);

    let ibindaCount = 0;
    let sundiCount = 0;
    let viliCount = 0;
    let kikongoCount = 0;

    for (const word of allWords) {
      let updated = false;
      const originalLanguages = [...word.language];

      word.language = word.language.map(lang => {
        const lowerLang = lang.toLowerCase();
        
        // Fix any variation of SUNDI -> H131
        if (lowerLang.includes('sundi')) {
          sundiCount++;
          updated = true;
          return 'H131';
        }
        
        // Fix any variation of IBINDA or KIKONGO -> H16d
        if (lowerLang.includes('ibinda') || lowerLang.includes('kikongo')) {
          if (lowerLang.includes('ibinda')) ibindaCount++;
          if (lowerLang.includes('kikongo')) kikongoCount++;
          updated = true;
          return 'H16d';
        }
        
        // Fix any variation of vili -> H12
        if (lowerLang.includes('vili')) {
          viliCount++;
          updated = true;
          return 'H12';
        }
        
        return lang;
      });

      if (updated) {
        // Ensure description field is not empty to pass validation
        if (!word.description || word.description.trim() === '') {
          word.description = '';
        }
        await word.save({ validateBeforeSave: false });
        console.log(`Updated: "${word.word}" | ${originalLanguages.join(', ')} → ${word.language.join(', ')}`);
      }
    }

    console.log(`\n✓ Language code fixes completed!`);
    console.log(`Updated ${ibindaCount} words from IBINDA variants to H16d`);
    console.log(`Updated ${kikongoCount} words from KIKONGO variants to H16d`);
    console.log(`Updated ${sundiCount} words from SUNDI variants to H131`);
    console.log(`Updated ${viliCount} words from vili variants to H12`);
    
    // Show updated counts
    const h16dCount = await Word.countDocuments({ language: 'H16d' });
    const h131Count = await Word.countDocuments({ language: 'H131' });
    const h12Count = await Word.countDocuments({ language: 'H12' });
    
    console.log(`\nCurrent counts:`);
    console.log(`H16d: ${h16dCount} words`);
    console.log(`H131: ${h131Count} words`);
    console.log(`H12: ${h12Count} words`);

  } catch (error) {
    console.error('Error fixing language codes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

fixLanguageCodes();
