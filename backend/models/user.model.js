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
    roles: {
        type: [String], // Array of strings for roles
        default: ['learner'] // Default role for new users // learner, developper, superadmin
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const User = mongoose.model('User', userSchema);

export default User;
