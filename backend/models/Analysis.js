const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  screenshot: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for user's analyses
analysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
