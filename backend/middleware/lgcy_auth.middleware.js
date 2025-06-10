import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (payload has user id)
            // Ensure password is not selected
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found for this token');
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401); // Unauthorized
            // Send a more specific error message if it's a JWT specific error
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Not authorized, token failed verification');
            } else if (error.name === 'TokenExpiredError') {
                throw new Error('Not authorized, token expired');
            }
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});
