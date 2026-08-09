import asyncHandler from 'express-async-handler'; // For cleaner async error handling
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users
// @route   GET /users
// @access  Private
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password'); // Exclude password field
    res.status(200).json(users);
});

// @desc    Create a new user (public self-registration)
// @route   POST /users/register
// @access  Public
export const createUser = asyncHandler(async (req, res) => {
    // Deliberately not reading `roles` from the body — this is the public
    // signup endpoint, so a self-assigned role must be structurally
    // impossible here. Every new account starts as the schema default
    // ('learner'); elevating a user is an explicit admin action via
    // updateUser, never something the signup request itself can request.
    const { username, password, name } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error('Please provide username and password');
    }

    // The schema's minlength on `password` validates the stored bcrypt hash
    // (always ~60 chars), not the plaintext — it never actually rejects a
    // short password. Check the real input here instead.
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters.');
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        password: hashedPassword,
        name: name || '',
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            name: user.name,
            roles: user.roles,
            message: 'User created successfully',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update a user (partial — only touches fields actually provided)
// @route   PUT /users/:id
// @access  Private (Admin)
export const updateUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // An admin editing someone else's role shouldn't be forced to also
    // reset that person's username/password — only touch what's provided.
    if (username) user.username = username;
    if (password) {
        if (password.length < 6) {
            res.status(400);
            throw new Error('Password must be at least 6 characters.');
        }
        user.password = await bcrypt.hash(password, 10);
    }
    if (roles) {
        // Guard against an admin accidentally locking themselves out.
        if (req.user === user.username && !roles.includes('superadmin')) {
            res.status(400);
            throw new Error('You cannot change your own admin role.');
        }
        user.roles = roles;
    }

    const updatedUser = await user.save();

    res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        roles: updatedUser.roles,
        message: 'User updated successfully',
    });
});

// @desc    Delete a user
// @route   DELETE /users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (req.user === user.username) {
        res.status(400);
        throw new Error('You cannot delete your own account.');
    }

    await user.deleteOne();

    res.status(200).json({
        message: 'User deleted successfully',
    });
});

// @desc    Get a single user by ID
// @route   GET /users/:id
// @access  Private
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).select('-password'); // Exclude password field

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json(user);
});


