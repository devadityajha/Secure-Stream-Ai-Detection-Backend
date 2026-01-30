// require("dotenv").config();
// const jwt = require("jsonwebtoken");

// const isloggedin = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "token missing, login required" });
//     }

//     const decoded = jwt.verify(token, process.env.jwt);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.log(error.message);
//     res.status(401).json({ message: "token missing, login again" });
//   }
// };

// module.exports = isloggedin;


// backend/middleware/authMiddleware.js (or user.middleware.js)

const jwt = require('jsonwebtoken');
const User = require("../models/user.model")  // Ya jo bhi tumhara User model hai

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔑 Decoded token:', decoded);  // Debug log

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User authenticated:', req.user._id);  // Debug log

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      error: error.message
    });
  }
};
