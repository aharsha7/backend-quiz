// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token and attach user to request
const protect = async (req, res, next) => {
  console.log('Auth Header:', req.headers.authorization); // Log the full header
  
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Extracted Token:', token); // Log the extracted token
      
      // Check if token is null or "null"
      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ 
          message: 'Invalid token: token is null or undefined' 
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded Token:', decoded); // Log the decoded content
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      return next();
    } catch (error) {
      console.error('JWT Error:', error.message);
      return res.status(401).json({ 
        message: 'Not authorized, token failed', 
        error: error.message 
      });
    }
  }
  
  return res.status(401).json({ message: 'Not authorized, no token' });
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };