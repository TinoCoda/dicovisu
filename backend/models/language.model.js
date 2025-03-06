import mongoose from "mongoose";

const languageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },

    code: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    countries: {
        type: [String],
        required: false,
    },
});

const Language = mongoose.model("Language", languageSchema);
export default Language;