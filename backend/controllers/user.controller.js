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

// @desc    Create a new user
// @route   POST /users
// @access  Private
export const createUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error('Please provide username and password');
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = roles? await User.create({
        username,
        password: hashedPassword,
        roles:roles, // Use provided roles if available
    }):
    await User.create({
        username,
        password: hashedPassword
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            message: 'User created successfully',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update a user
// @route   PUT /users/:id
// @access  Private
export const updateUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;
    const userId = req.params.id;

    if (!username || !password) {
        res.status(400);
        throw new Error('Please provide username and password');
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.username = username;
    user.password = await bcrypt.hash(password, 10);
    if (roles) {
        user.roles = roles; // Update roles if provided
    }

    const updatedUser = await user.save();

    res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        message: 'User updated successfully',
    });
});

// @desc    Delete a user
// @route   DELETE /users/:id
// @access  Private
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await user.remove();

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


