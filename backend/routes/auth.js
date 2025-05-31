const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password
    });
    
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get current logged in user
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// Logout
router.get('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// Update user details
router.put('/updatedetails', protect, async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };
  
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// Update password
router.put('/updatepassword', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  
  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      error: 'Password is incorrect'
    });
  }
  
  user.password = req.body.newPassword;
  await user.save();
  
  sendTokenResponse(user, 200, res);
});

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };
  
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        usage: user.usage
      }
    });
};

module.exports = router;
