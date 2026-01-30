const express = require('express');
const router = express.Router();
const {
  saveRecording,
  getAllRecordings,
  getRecordingById,
  deleteRecording
} = require('../controllers/recordingController');

// ✅ NO AUTHENTICATION - Public routes
router.post('/save', saveRecording);
router.get('/', getAllRecordings);
router.get('/:id', getRecordingById);
router.delete('/:id', deleteRecording);

module.exports = router;
