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
        type: [String],
        required: true,
    },
    translations:{
        type: [String],
        required: false,
        default: []
    },

    example: {
        type: String,
        required: false,
    },
    
    // Related words with relationship types
    relatedWords: [{
        wordId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Word' 
        },
        word: { 
            type: String,
            required: true
        },
        relationshipType: { 
            type: String, 
            enum: ['singular', 'plural', 'synonym', 'antonym', 'variant', 'derived', 'see_also', 'infinitive'],
            required: true
        }
    }]
}, {
    timestamps: true
});

const Word = mongoose.model("Word", wordSchema);
export default Word;