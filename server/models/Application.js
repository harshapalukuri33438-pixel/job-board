const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });
resume: {
  type: String
}

// Prevent duplicate applications (VERY IMPORTANT)
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);