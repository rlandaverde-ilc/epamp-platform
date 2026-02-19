const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Level name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['kids', 'teens', 'conversation', 'kids4-6'],
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Level', levelSchema);
