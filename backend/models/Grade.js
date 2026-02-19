const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grade: {
    type: Number,
    required: [true, 'Grade is required'],
    min: 0,
    max: 100
  },
  semester: {
    type: String,
    required: true
  },
  comments: String,
  academicYear: {
    type: String,
    default: '2025-2026'
  }
}, {
  timestamps: true
});

// Index for faster queries
gradeSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model('Grade', gradeSchema);
