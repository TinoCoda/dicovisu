import mongoose from "mongoose";
import Language from "../models/language.model.js";

export const getLanguages = async (req, res) => {
    try {
        const languages = await Language.find();
        const size = languages.length;
        res.status(200).json({ size: size, data: languages });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
};
export const addLanguage = async (req, res) => {
    const language = req.body;
    if (!language.name || !language.code) {
        res.status(400).json({ succes: false, message: "Please fill all required fields" });
    }
    const newLanguage = new Language(language);
    try {
        await newLanguage.save();
        res.status(201).json({ succes: true, data: newLanguage });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};
export const updateLanguage = async (req, res) => {
    try {
        const { id } = req.params;
        const language = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Invalid language id' });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "No language with that id" });
        }
        const updatedLanguage = await Language.findByIdAndUpdate(id, language, { new: true });
        res.status(200).json({ success: true, data: updatedLanguage , id: id});
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error while updating the language: ${error.message}` });
    }
};
export const deleteLanguage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "No language with that id" });
        }
        await Language.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Language deleted successfully" });
    } catch (error) {
        console.error(`Error while deleting language: ${error.message}`);
    }
};