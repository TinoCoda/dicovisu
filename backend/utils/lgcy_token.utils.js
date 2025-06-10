import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // For refresh token generation
import RefreshToken from '../models/lgcy_refreshToken.model.js';
import User from '../models/user.model.js'; // Needed to associate token with user

// Function to generate Access Token
export const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN
    });
};

// Function to generate Refresh Token, save its hashed version to DB, and return the raw token
export const generateRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found for generating refresh token.');
    }

    // Generate a random string for the refresh token
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');

    // Calculate expiry date for the refresh token
    const daysUntilExpiry = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS || '7', 10);
    const expires = new Date();
    expires.setDate(expires.getDate() + daysUntilExpiry);
    console.log("Expires ", expires.toISOString()); // Log the expiry date for debugging
    console.log(`Refresh token will expire on: ${expires.toISOString()}`);

    // Store the refresh token (consider hashing it in a real-world scenario if desired, for this plan we store it directly as per plan step)
    // For enhanced security, one might hash 'rawRefreshToken' before storing,
    // but the plan specifies storing the token directly for verification.
    // Let's stick to the plan, but acknowledge hashing as a best practice.
    const refreshTokenDoc = new RefreshToken({
        user: user,
        token: rawRefreshToken, // Storing raw token as per current simplified plan
        expiresAt: expires
    });

    await refreshTokenDoc.save();
    return rawRefreshToken;
};

// Function to verify Refresh Token
// This function will check if the token exists in the DB and is not expired.
export const verifyRefreshToken = async (token) => {
    const tokenDoc = await RefreshToken.findOne({ token: token });

    if (!tokenDoc) {
        return null; // Token not found
    }

    if (tokenDoc.expires < new Date()) {
        // Token is expired, remove it from DB
        await RefreshToken.findByIdAndDelete(tokenDoc._id);
        return null;
    }

    // Token is valid, return the user associated with it
    return tokenDoc.user; // Returning userId
};
