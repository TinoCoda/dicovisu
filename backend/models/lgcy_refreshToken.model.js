import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    user: { // Changed from userId to user to match common Mongoose ref naming
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: { // Changed from expiresAt to expires for consistency with typical token expiry naming
        type: Date,
        required: true
    },
    createdAt: { // Explicitly add createdAt for potential cleanup tasks
        type: Date,
        default: Date.now,
        expires: '7d' // Optional: MongoDB TTL index to auto-delete old tokens after 7 days if not refreshed/deleted by logout
    }
});

// Create an index on token for faster lookups
refreshTokenSchema.index({ token: 1 });
// Create an index on user for potentially listing a user's tokens (optional)
refreshTokenSchema.index({ user: 1 });


const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
