

const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  recordingType: {
    type: String,
    required: true,
    enum: ['individual', 'dashboard'],
  },
  
  studentId: {
    type: String,  
    default: null
  },
  
  studentName: {
    type: String,
    default: ''
  },
  
  studentEmail: {
    type: String,
    default: ''
  },
  
  // For dashboard recordings
  studentIds: [{
    type: String  
  }],
  
  studentCount: {
    type: Number,
    default: 0
  },
  
  
  cloudinaryUrl: {
    type: String,
    required: true
  },
  
  cloudinaryPublicId: {
    type: String,
    default: ''
  },
  
  duration: {
    type: Number,
    default: 0
  },
  
  fileSize: {
    type: Number,
    default: 0
  },
  
  recordedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recording', recordingSchema);
