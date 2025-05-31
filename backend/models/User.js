const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  usage: {
    checksToday: {
      type: Number,
      default: 0
    },
    lastCheckDate: {
      type: Date,
      default: Date.now
    },
    totalChecks: {
      type: Number,
      default: 0
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Reset daily usage
userSchema.methods.resetDailyUsage = function() {
  const today = new Date();
  const lastCheck = new Date(this.usage.lastCheckDate);
  
  if (today.toDateString() !== lastCheck.toDateString()) {
    this.usage.checksToday = 0;
    this.usage.lastCheckDate = today;
  }
};

// Check if user can perform analysis
userSchema.methods.canPerformCheck = function() {
  this.resetDailyUsage();
  
  const limits = {
    free: 5,
    pro: 100,
    enterprise: Infinity
  };
  
  return this.usage.checksToday < limits[this.plan];
};

// Increment usage
userSchema.methods.incrementUsage = async function() {
  this.usage.checksToday += 1;
  this.usage.totalChecks += 1;
  this.usage.lastCheckDate = new Date();
  await this.save();
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
