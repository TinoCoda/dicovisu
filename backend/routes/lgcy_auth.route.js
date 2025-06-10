import express from 'express';
import {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser
} from '../controllers/lgcy_auth.controller.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// POST /api/auth/logout
router.post('/logout', logoutUser);

export default router;
