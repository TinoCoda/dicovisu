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
