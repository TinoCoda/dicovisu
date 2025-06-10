import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/lgcy_refreshToken.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/lgcy_token.utils.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error('Please provide username and password');
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            message: 'User registered successfully',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error('Please provide username and password');
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
        res.status(401);
        throw new Error('Invalid username or password');
    }

    // Compare entered password with hashed password in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        res.status(401);
        throw new Error('Invalid username or password');
    }

    // Generate token (assuming you have a function for this)
    const token = generateToken(user._id);

    // Generate refresh token and save it in the database
    const refreshToken = generateRefreshToken(user._id);
    res.cookie('jwt_dico', refreshToken, {
        httpOnly: false, // Helps prevent XSS attacks
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Helps prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });


    res.status(200).json({
        _id: user._id,
        username: user.username,
        token,
    });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires a valid refresh token cookie)
export const refreshToken = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    console.log("Cookies: ", cookies);

    if(!cookies?.jwt_dico) return res.status(401).json({ message: 'Unauthorized!\n No refresh cooking available' });
    
    const refreshTokenFromCookie = cookies.jwt_dico;
    if (!refreshTokenFromCookie) {
        res.status(401);
        throw new Error('Refresh token not found in cookie.');
    }

    const userId = await verifyRefreshToken(refreshTokenFromCookie);

    if (!userId) {
        res.status(403); // Forbidden
        res.cookie('jwt_dico', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            expires: new Date(0),
        });
        throw new Error('Invalid or expired refresh token.');
    }

    const newAccessToken = generateAccessToken(userId);
    res.json({ accessToken: newAccessToken });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public (requires a valid refresh token cookie to invalidate)
export const logoutUser = asyncHandler(async (req, res) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (refreshTokenFromCookie) {
        // Attempt to delete the token from the database
        // It's okay if it's not found (e.g., already expired and cleaned up, or invalid)
        await RefreshToken.deleteOne({ token: refreshTokenFromCookie });
    }

    // Clear the refresh token cookie regardless
    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0) // Set expiry to a past date to remove it
    });

    res.status(200).json({ message: 'Logged out successfully' });
});

// Helper function to generate token (example using JWT)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
