const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const loginRouter = express.Router();

// JWT Secret Key (should be in environment variables in production)
const JWT_SECRET = 'your-secret-key'; // In production, use process.env.JWT_SECRET

// GET route to serve the login form
loginRouter.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'static', 'login.html'));
});

// POST route to handle login
loginRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Check if user exists and password matches
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 24 hours
        );

        // Send success response with token
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Bearer header

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Protected route example
loginRouter.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = { loginRouter, verifyToken }; 