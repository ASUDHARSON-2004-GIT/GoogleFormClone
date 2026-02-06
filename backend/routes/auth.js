const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register new user
// @route POST /api/auth/register
// @access Public
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password });

    if (user) {
        res.status(201).json({
            _id: user.id,
            email: user.email,
            token: generateToken(user.id)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc Authenticate a user
// @route POST /api/auth/login
// @access Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            email: user.email,
            token: generateToken(user.id)
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;
