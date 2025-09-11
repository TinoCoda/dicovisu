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
        const combinedResults = [...words, ...meanings];
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

