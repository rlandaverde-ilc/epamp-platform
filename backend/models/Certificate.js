const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'issued'],
    default: 'pending'
  },
  certificateNumber: {
    type: String,
    unique: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Generate certificate number before saving
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const count = await mongoose.model('Certificate').countDocuments();
    this.certificateNumber = `CERT-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
