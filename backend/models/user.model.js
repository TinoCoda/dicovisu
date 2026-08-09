import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Optional: Enforce a minimum password length
    },
    name: {
        type: String,
        trim: true,
        default: ''
    },
    roles: {
        type: [String],
        enum: ['learner', 'developper', 'superadmin'],
        default: ['learner'] // Default role for new users — never settable by the user themselves
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const User = mongoose.model('User', userSchema);

export default User;
