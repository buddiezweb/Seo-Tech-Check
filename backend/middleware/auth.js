const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists'
      });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

exports.checkUsageLimit = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user.canPerformCheck()) {
      const limits = {
        free: 50,
        pro: 100,
        enterprise: 'Unlimited'
      };
      
      return res.status(403).json({
        success: false,
        error: `Daily limit reached. ${user.plan} plan allows ${limits[user.plan]} checks per day.`,
        upgradeUrl: '/pricing'
      });
    }
    
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error checking usage limits'
    });
  }
};
