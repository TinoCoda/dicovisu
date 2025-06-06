import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.utils.js';
import asyncHandler from 'express-async-handler'; // For cleaner async error handling

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

    const user = await User.create({
        username,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            // Do not return tokens immediately upon registration by default,
            // require them to login. Or, if desired, call login logic here.
            message: 'User registered successfully. Please login.'
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

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        const accessToken = generateAccessToken(user._id);
        const refreshTokenString = await generateRefreshToken(user._id);

        res.cookie('refreshToken', refreshTokenString, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
            sameSite: 'strict',
            maxAge: parseInt(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN_DAYS || '7', 10) * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            _id: user._id,
            username: user.username,
            accessToken,
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid username or password');
    }
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires a valid refresh token cookie)
export const refreshToken = asyncHandler(async (req, res) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
        res.status(401);
        throw new Error('Refresh token not found in cookie.');
    }

    const userId = await verifyRefreshToken(refreshTokenFromCookie);

    if (!userId) {
        res.status(403); // Forbidden
        // Optionally, clear the potentially compromised/invalid refresh token cookie
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            expires: new Date(0)
        });
        throw new Error('Invalid or expired refresh token.');
    }

    // Optional: Implement refresh token rotation.
    // If implementing rotation:
    // 1. Delete the old refresh token from DB: await RefreshToken.deleteOne({ token: refreshTokenFromCookie });
    // 2. Generate a new refresh token: const newRefreshTokenString = await generateRefreshToken(userId);
    // 3. Set the new refresh token cookie: res.cookie('refreshToken', newRefreshTokenString, {...});
    // For now, sticking to the current plan which doesn't explicitly ask for rotation in this step.

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
