import mongoose from "mongoose";
import Word from "../models/word.model.js";

export const getWords = async (req, res) => {
    try {
        const words = await Word.find();
        const size=words.length;
        res.status(200).json({size:size,data:words});
    } catch (error) {
        res.status(500).json({ succes: false,message: error.message });
    }
};

export const addWord = async (req, res) => {
    const word = req.body;
    if(!word.word || !word.meaning || !word.language){
        res.status(400).json({ succes:false,message: "Please fill all required fields" });
    }
    const newWord = new Word(word);
    try {
        await newWord.save();
        res.status(201).json({succes:true,data:newWord});
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const updateWord = async (req, res) => {
    try{
        const { id } = req.params;
        const word = req.body;
        if(!id){
            return res.status(400).json({success:false,message:'Invalid word id'})

        }
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({ sucess:true,message: "No word with that id" });
        }
        const updatedWord = await Word.findByIdAndUpdate(id,word, {new: true});
        res.status(200).json({success:true,data:updatedWord});

    }catch(error){
        res.status(500).json({success:false,message:`Server error while updating the word: ${error.message}`});

    }


};

export const deleteWord = async (req, res) => {
    try{
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({ sucess:false,message: "No word with that id" });
        }
        await Word.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Word deleted successfully" });

    }catch(error){
        console.error(`Error while deleting word: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });

    }

};

export const searchWordStart = async (req, res) => {
    const { word } = req.query;
    try {
        const words = await Word.find({ word: { $regex: `^${word}`, $options: "i" } });
        const meanings = await Word.find({ meaning: { $regex: `^${word}`, $options: "i" } });
        const translations = await Word.find({ translations: { $regex: `^${word}`, $options: "i" } });
        const examples= await Word.find({ example: { $regex: `^${word}`, $options: "i" } });
        const combinedResults = [...words, ...meanings, ...translations, ...examples];
       
        const uniqueResults = Array.from(new Set(combinedResults.map((w) => w._id.toString()))).map((id) =>
            combinedResults.find((w) => w._id.toString() === id)
        );
        res.status(200).json({success:true, data: uniqueResults });
        //console.log(uniqueResults);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
        console.error(`Error while searching word: ${error.message}`);
    }
};

// Helper function to get reciprocal relationship type
function getReciprocalType(type) {
    const reciprocals = {
        'singular': 'plural',
        'plural': 'singular',
        'synonym': 'synonym',
        'antonym': 'antonym',
        'variant': 'variant',
        'derived': 'derived',
        'see_also': 'see_also',
        'infinitive': 'infinitive'
    };
    return reciprocals[type] || 'see_also';
}

// Add relationship between words (bidirectional)
export const addWordRelationship = async (req, res) => {
    try {
        const { wordId } = req.params;
        const { relatedWordId, relationshipType } = req.body;

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(wordId) || !mongoose.Types.ObjectId.isValid(relatedWordId)) {
            return res.status(400).json({ success: false, message: "Invalid word ID" });
        }

        const word = await Word.findById(wordId);
        const relatedWord = await Word.findById(relatedWordId);

        if (!word || !relatedWord) {
            return res.status(404).json({ success: false, message: "Word not found" });
        }

        // Initialize relatedWords arrays if they don't exist
        if (!word.relatedWords) word.relatedWords = [];
        if (!relatedWord.relatedWords) relatedWord.relatedWords = [];

        // Remove any existing relationship between these words (to overwrite)
        word.relatedWords = word.relatedWords.filter(
            rw => rw.wordId.toString() !== relatedWordId
        );
        relatedWord.relatedWords = relatedWord.relatedWords.filter(
            rw => rw.wordId.toString() !== wordId
        );

        // Add relationship to the first word
        word.relatedWords.push({
            wordId: relatedWordId,
            word: relatedWord.word,
            relationshipType: relationshipType
        });

        // Add reciprocal relationship to the related word
        const reciprocalType = getReciprocalType(relationshipType);
        relatedWord.relatedWords.push({
            wordId: wordId,
            word: word.word,
            relationshipType: reciprocalType
        });

        await word.save();
        await relatedWord.save();

        res.status(200).json({ 
            success: true, 
            message: "Relationship added successfully",
            data: { word, relatedWord }
        });
    } catch (error) {
        console.error("Error in addWordRelationship:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove relationship between words (bidirectional)
export const removeWordRelationship = async (req, res) => {
    try {
        const { wordId, relatedWordId } = req.params;

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(wordId) || !mongoose.Types.ObjectId.isValid(relatedWordId)) {
            return res.status(400).json({ success: false, message: "Invalid word ID" });
        }

        const word = await Word.findById(wordId);
        const relatedWord = await Word.findById(relatedWordId);

        if (!word || !relatedWord) {
            return res.status(404).json({ success: false, message: "Word not found" });
        }

        // Remove from both sides
        word.relatedWords = word.relatedWords?.filter(
            rw => rw.wordId.toString() !== relatedWordId
        ) || [];
        
        relatedWord.relatedWords = relatedWord.relatedWords?.filter(
            rw => rw.wordId.toString() !== wordId
        ) || [];

        await word.save();
        await relatedWord.save();

        res.status(200).json({ 
            success: true, 
            message: "Relationship removed successfully" 
        });
    } catch (error) {
        console.error("Error in removeWordRelationship:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get dictionary statistics
export const getStatistics = async (req, res) => {
    try {
        const words = await Word.find();
        
        // Helper function to extract dialect words from example text
        String.prototype.countOccurrences = function(substring) {
            const regex = new RegExp(substring, 'gi');
            const matches = this.match(regex);
            return matches ? matches.length : 0;
        };
        const extractWords = (text) => {
            if (!text) return [];
            
            // Split into lines and keep ONLY dialect lines (those that contain H followed by digits)
            // Each dialect line looks like: "Muana wu musakana(H131)." 
            // The French translation lines do NOT contain H-numbers
            console.log("Extracting words from example text:\n", text);
            console.log(`. count: ${text.countOccurrences('.')} | \\n count: ${text.countOccurrences('\n')}`);
            if(!/\n/.test(text)){
                console.log("No line breaks found, fixing text by replacing '. ' with '.\n'");
                text = text.replace(".", '.\n').trim();
                console.log("Fixed example text for the typical case:\n", text);
            }else if(text.countOccurrences('.') > text.countOccurrences('\n')){ // if there are more points then line breaks, make sure to fix it as well
                console.log("More '.' than line breaks, fixing text by replacing '. ' with '.\n'");    
                text = text.replace('\n', '').trim(); // replace all occurences of ". " with ".\n"
                text = text.replace(/\. /g, '.\n').trim(); // replace all occurences of ". " with ".\n"
                console.log("Fixed example text for special case:\n", text);
                

            }
            const dialectLines = text
                .split(/\n/)
                .filter(line => /[Hh]\d+/.test(line));
            console.log("Dialect lines found:", dialectLines.length);
            dialectLines.forEach((line, idx) => {
                console.log(`  Line ${idx + 1}:`, line);
            });
            
            // For each dialect line, strip the H-number marker and everything after it
            // e.g. "Muana wu musakana(H131)." → "Muana wu musakana"
            // e.g. "Muana wu mubela .(H131)." → "Muana wu mubela"
            const cleanedDialect = dialectLines
                .map(line => line.replace(/[\s\(\.]*[Hh]\d+.*$/i, '').trim())
                .join(' ');
            console.log("Cleaned dialect text:", cleanedDialect);
            
            // Split into words, normalize to lowercase, filter short tokens
            return cleanedDialect
                .toLowerCase()
                .replace(/[.,!?;:()\[\]{}""'']/g, ' ')
                .split(/\s+/)
                .map(word => word.trim())
                .filter(word => word.length >= 3);
        };

        // Statistics by language
        const languageStats = {};
        
        // Map to store all dictionary words for quick lookup
        const dictionaryWordsMap = new Map();
        
        words.forEach(wordDoc => {
            // Extract individual words from dictionary entry
            // "Muana dimeme" should add both "muana" and "dimeme"
            const normalizedWord = wordDoc.word.toLowerCase().trim();
            const individualWords = normalizedWord
                .replace(/[.,!?;:()\[\]{}""'']/g, ' ')
                .split(/\s+/)
                .filter(word => word.length >= 3); // Minimum 3 characters to avoid particles
            
            // Add each individual word to the dictionary map
            individualWords.forEach(word => {
                dictionaryWordsMap.set(word, (dictionaryWordsMap.get(word) || 0) + 1);
            });
            
            // Process each language this word belongs to
            wordDoc.language.forEach(langCode => {
                if (!languageStats[langCode]) {
                    languageStats[langCode] = {
                        languageCode: langCode,
                        totalDictionaryWords: 0,
                        wordsWithoutExamples: 0,
                        dictionaryWordsInExamples: new Map(), // Dictionary words found in examples
                        exampleWords: new Map(),
                        wordsInExamplesNotInDictionary: new Map()
                    };
                }
                
                const stats = languageStats[langCode];
                stats.totalDictionaryWords++;
                
                // Count words without examples
                if (!wordDoc.example || wordDoc.example.trim() === '') {
                    stats.wordsWithoutExamples++;
                }
            });
        });
        
        // Second pass: count word occurrences in examples
        words.forEach(wordDoc => {
            wordDoc.language.forEach(langCode => {
                const stats = languageStats[langCode];
                if (!stats) return;
                
                // Extract and count words from examples (only dialect words before H followed by digits)
                if (wordDoc.example && wordDoc.example.trim() !== '') {
                    const exampleWords = extractWords(wordDoc.example);
                    exampleWords.forEach(exWord => {
                        // Count all words in examples
                        stats.exampleWords.set(exWord, 
                            (stats.exampleWords.get(exWord) || 0) + 1
                        );
                        
                        // If this word exists in the dictionary, count it separately
                        if (dictionaryWordsMap.has(exWord)) {
                            stats.dictionaryWordsInExamples.set(exWord,
                                (stats.dictionaryWordsInExamples.get(exWord) || 0) + 1
                            );
                        } else {
                            // This word is NOT in the dictionary
                            stats.wordsInExamplesNotInDictionary.set(exWord,
                                (stats.wordsInExamplesNotInDictionary.get(exWord) || 0) + 1
                            );
                        }
                    });
                }
            });
        });

        // ── DEBUG LOGS ──────────────────────────────────────────────
        console.log('\n===== STATISTICS DEBUG =====');
        console.log('> dictionaryWordsMap has "muana"?', dictionaryWordsMap.has('muana'));
        console.log('> dictionaryWordsMap "muana" value:', dictionaryWordsMap.get('muana'));

        // Show every H131 word entry whose example contains "muana" and what extractWords returns
        const h131Words = words.filter(w => w.language.includes('H131') && w.example && /muana/i.test(w.example));
        console.log(`\n> H131 words with "muana" in example: ${h131Words.length}`);
        h131Words.slice(0, 5).forEach(w => {
            const extracted = extractWords(w.example);
            console.log(`  word="${w.word}"`);
            console.log(`  raw example (first 120): ${w.example.substring(0, 120).replace(/\n/g, '\\n')}`);
            console.log(`  extracted tokens:`, extracted);
            console.log(`  "muana" in tokens?`, extracted.includes('muana'));
            console.log('  ---');
        });

        const h131Stats = languageStats['H131'];
        if (h131Stats) {
            console.log('\n> H131 dictionaryWordsInExamples has "muana"?', h131Stats.dictionaryWordsInExamples.has('muana'));
            console.log('> H131 exampleWords has "muana"?', h131Stats.exampleWords.has('muana'));
            console.log('> H131 exampleWords "muana" count:', h131Stats.exampleWords.get('muana'));
            console.log('\n> Top 10 H131 exampleWords:');
            Array.from(h131Stats.exampleWords.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .forEach(([w, c]) => console.log(`   ${w}: ${c}`));
        }
        console.log('===== END DEBUG =====\n');
        // ── END DEBUG LOGS ───────────────────────────────────────────
        
        // Convert Maps to arrays and sort by frequency
        const result = Object.keys(languageStats).map(langCode => {
            const stats = languageStats[langCode];
            
            // Convert dictionary words in examples to sorted array (by occurrence count in examples)
            const dictionaryWordsInExamplesArray = Array.from(stats.dictionaryWordsInExamples.entries())
                .map(([word, count]) => ({ word, count }))
                .sort((a, b) => b.count - a.count);
            
            // Convert example words map to sorted array
            const exampleWordsArray = Array.from(stats.exampleWords.entries())
                .map(([word, count]) => ({ word, count }))
                .sort((a, b) => b.count - a.count);
            
            // Convert missing words map to sorted array
            const missingWordsArray = Array.from(stats.wordsInExamplesNotInDictionary.entries())
                .map(([word, count]) => ({ word, count }))
                .sort((a, b) => b.count - a.count);
            
            return {
                languageCode: langCode,
                totalDictionaryWords: stats.totalDictionaryWords,
                wordsWithoutExamples: stats.wordsWithoutExamples,
                uniqueDictionaryWordsInExamples: stats.dictionaryWordsInExamples.size,
                uniqueWordsInExamples: stats.exampleWords.size,
                wordsInExamplesNotInDictionary: missingWordsArray.length,
                topDictionaryWords: dictionaryWordsInExamplesArray.slice(0, 20),
                topExampleWords: exampleWordsArray.slice(0, 20),
                topMissingWords: missingWordsArray.slice(0, 50),
                allMissingWords: missingWordsArray
            };
        });
        
        // Overall statistics
        const overallStats = {
            totalWords: words.length,
            totalLanguages: Object.keys(languageStats).length,
            uniqueDictionaryWords: dictionaryWordsMap.size
        };
        
        res.status(200).json({
            success: true,
            data: {
                overall: overallStats,
                byLanguage: result
            }
        });
    } catch (error) {
        console.error("Error in getStatistics:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
