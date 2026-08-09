import mongoose from "mongoose";
import Word from "../models/word.model.js";
import { isWordInDictionary } from "../utils/lemmatizer.js";
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import r2Client, { R2_BUCKET_NAME, R2_PUBLIC_URL } from '../config/r2.js';
import path from 'path';

const deduplicateSentences = (text) => {
    if (!text) return '';

    // Match sentences ending with . ! or ? (keeping the punctuation)
    const sentenceRegex = /[^.!?]+[.!?]/g;
    const sentences = text.match(sentenceRegex) || [];
    //console.log(sentences)

    // Deduplicate case-insensitively but keep original casing
    const seen = new Set();
    const uniqueSentences = sentences.filter(sentence => {
        const key = sentence.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Join back with a space
    return uniqueSentences.map(s => s.trim()).join('\n');
};

export const getWords = async (req, res) => {
    try {
        const words = await Word.find();
        const size = words.length;

        res.status(200).json({ success: true, size: size, data: words });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addWord = async (req, res) => {
    const word = req.body;
    if(!word.word || !word.meaning || !word.language){
        return res.status(400).json({ success:false,message: "Please fill all required fields" });
    }

    const newWord = new Word(word);
    try {
        await newWord.save();
        res.status(201).json({success:true,data:newWord});
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
            return res.status(404).json({ success:false,message: "No word with that id" });
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
            return res.status(404).json({ success:false,message: "No word with that id" });
        }
        await Word.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Word deleted successfully" });

    }catch(error){
        console.error(`Error while deleting word: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });

    }

};

export const searchWordStart = async (req, res) => {
    // Accept ?words=term1,term2,... (new) or legacy ?word=term
    const rawWords = req.query.words || req.query.word || "";
    const termList = rawWords
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    if (termList.length === 0) {
        // Return total count when query is empty
        try {
            const totalCount = await Word.countDocuments();
            return res.status(200).json({ success: true, directMatches: [], exampleMatches: [], totalCount });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    try {
        // For the `word` field: starts-with match for every term
        const wordStartsWithConditions = termList.map(t => ({
            word: { $regex: "^" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" }
        }));

        // For meaning/translations: contains match (useful for French meanings & cross-language)
        const anywhereConditions = termList.map(t => {
            const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const anyRx = { $regex: esc, $options: "i" };
            return { $or: [{ meaning: anyRx }, { translations: anyRx }] };
        });

        const directWordMatches    = await Word.find({ $or: wordStartsWithConditions });
        const meaningMatches       = await Word.find({ $or: anywhereConditions });

        const directCombined = [...directWordMatches, ...meaningMatches];
        const directIds = new Set();
        const directMatches = [];
        for (const w of directCombined) {
            const id = w._id.toString();
            if (!directIds.has(id)) { directIds.add(id); directMatches.push(w); }
        }

        // Example/description: contains match, excluding already-found words
        const exampleConditions = termList.map(t => {
            const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const anyRx = { $regex: esc, $options: "i" };
            return { $or: [{ example: anyRx }, { description: anyRx }] };
        });
        const exampleMatches_raw = await Word.find({ $or: exampleConditions });
        const exampleMatches = exampleMatches_raw.filter(w => !directIds.has(w._id.toString()));

        // Sort alphabetically
        directMatches.sort((a, b) => a.word.localeCompare(b.word));
        exampleMatches.sort((a, b) => a.word.localeCompare(b.word));

        res.status(200).json({ success: true, directMatches, exampleMatches });
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

        // Count occurrences of a substring in text, case-insensitively.
        const countOccurrences = (text, substring) => {
            const matches = text.match(new RegExp(substring, 'gi'));
            return matches ? matches.length : 0;
        };

        const extractWords = (text) => {
            if (!text) return [];

            // Split into lines and keep ONLY dialect lines (those that contain H followed by digits)
            // Each dialect line looks like: "Muana wu musakana(H131)."
            // The French translation lines do NOT contain H-numbers
            if(!/\n/.test(text)){
                text = text.replace(".", '.\n').trim();
            }else if(countOccurrences(text, '.') > countOccurrences(text, '\n')){ // if there are more points then line breaks, make sure to fix it as well
                text = text.replace('\n', '').trim();
                text = text.replace(/\. /g, '.\n').trim();
            }
            const dialectLines = text
                .split(/\n/)
                .filter(line => /[Hh]\d+/.test(line));

            // For each dialect line, strip the H-number marker and everything after it
            // e.g. "Muana wu musakana(H131)." → "Muana wu musakana"
            // e.g. "Muana wu mubela .(H131)." → "Muana wu mubela"
            const cleanedDialect = dialectLines
                .map(line => line.replace(/[\s\(\.]*[Hh]\d+.*$/i, '').trim())
                .join(' ');

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
                        
                        // If this word (or any of its lemmatized stems) exists in the
                        // dictionary, count it as a known word — not a missing one.
                        // This prevents inflected verb forms like "nakusididi" from
                        // showing up as missing when "sididi" is already in the dictionary.
                        if (isWordInDictionary(exWord, dictionaryWordsMap)) {
                            stats.dictionaryWordsInExamples.set(exWord,
                                (stats.dictionaryWordsInExamples.get(exWord) || 0) + 1
                            );
                        } else {
                            // This word is NOT in the dictionary even after lemmatization
                            stats.wordsInExamplesNotInDictionary.set(exWord,
                                (stats.wordsInExamplesNotInDictionary.get(exWord) || 0) + 1
                            );
                        }
                    });
                }
            });
        });

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

// Upload audio pronunciation for a word
export const uploadAudio = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid word ID" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No audio file provided" });
        }

        const word = await Word.findById(id);
        if (!word) {
            return res.status(404).json({ success: false, message: "Word not found" });
        }

        // Generate unique filename using wordId and original extension
        const ext = path.extname(req.file.originalname);
        const filename = `${id}${ext}`;
        const key = `audio/${filename}`; // Store in 'audio/' prefix in R2 bucket

        // Delete old audio file from R2 if it exists
        if (word.audio?.key) {
            try {
                await r2Client.send(new DeleteObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: word.audio.key
                }));
            } catch (deleteError) {
                console.error("Error deleting old audio from R2:", deleteError);
                // Continue anyway - old file might already be deleted
            }
        }

        // Upload new file to R2
        await r2Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ContentLength: req.file.size
        }));

        // Construct public URL for the audio file
        const audioUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL}/${key}`  // Use custom domain if configured
            : `https://${R2_BUCKET_NAME}.r2.dev/${key}`; // Default R2 public URL

        // Update word with new audio metadata
        word.audio = {
            key: key,              // R2 object key
            url: audioUrl,         // Public URL
            filename: filename,    // Original filename for reference
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date()
        };

        await word.save();

        res.status(200).json({
            success: true,
            message: "Audio uploaded successfully",
            data: {
                word,
                audioUrl: audioUrl
            }
        });
    } catch (error) {
        console.error("Error in uploadAudio:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete audio pronunciation for a word
export const deleteAudio = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid word ID" });
        }

        const word = await Word.findById(id);
        if (!word) {
            return res.status(404).json({ success: false, message: "Word not found" });
        }

        if (!word.audio?.key) {
            return res.status(404).json({ success: false, message: "No audio file to delete" });
        }

        // Delete the audio file from R2
        try {
            await r2Client.send(new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: word.audio.key
            }));
        } catch (deleteError) {
            console.error("Error deleting audio from R2:", deleteError);
            // Continue anyway to clean up metadata even if file is already gone
        }

        // Remove audio metadata from word
        word.audio = undefined;
        await word.save();

        res.status(200).json({
            success: true,
            message: "Audio deleted successfully",
            data: word
        });
    } catch (error) {
        console.error("Error in deleteAudio:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
