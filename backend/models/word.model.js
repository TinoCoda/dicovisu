import mongoose from "mongoose";
const wordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        unique: true,
    },
    meaning: {
        type: String,
        required: true,
    },
    description:
    { type: String, required: true, default: "" },
    language: {
        type: String,
        required: true,
    },

    example: {
        type: String,
        required: false,
    },
});

const Word = mongoose.model("Word", wordSchema);
export default Word;