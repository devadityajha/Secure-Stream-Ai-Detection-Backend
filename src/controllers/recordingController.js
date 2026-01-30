// backend/controllers/recordingController.js

const Recording = require("../models/Recording") 
// backend/controllers/recordingController.js

// Save recording (NO AUTH)
exports.saveRecording = async (req, res) => {
  try {
    console.log('📥 Save recording request:', req.body);
    
    const {
      recordingType,
      studentId,
      studentName,
      studentEmail,
      studentIds,
      studentCount,
      cloudinaryUrl,
      cloudinaryPublicId,
      duration,
      fileSize
    } = req.body;

    // Validation
    if (!recordingType || !cloudinaryUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recordingType, cloudinaryUrl'
      });
    }

    // ✅ NO ADMIN ID NEEDED (or use a default one)
    const recording = new Recording({
      recordingType,
      studentId: studentId || null,
      studentName: studentName || '',
      studentEmail: studentEmail || '',
      studentIds: studentIds || [],
      studentCount: studentCount || 0,
      adminId: null, // ✅ No admin tracking
      cloudinaryUrl,
      cloudinaryPublicId: cloudinaryPublicId || '',
      duration: duration || 0,
      fileSize: fileSize || 0
    });

    await recording.save();

    console.log('✅ Recording saved:', recording._id);

    res.status(201).json({
      success: true,
      message: 'Recording saved successfully',
      recording
    });

  } catch (error) {
    console.error('❌ Save recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save recording',
      error: error.message
    });
  }
};

// Get all recordings (NO AUTH)
exports.getAllRecordings = async (req, res) => {
  try {
    console.log('📥 Fetching all recordings...');

    // ✅ Get ALL recordings (no admin filter)
    const recordings = await Recording.find({})
      .sort({ recordedAt: -1 });

    console.log(`✅ Found ${recordings.length} recordings`);

    res.status(200).json({
      success: true,
      count: recordings.length,
      recordings
    });

  } catch (error) {
    console.error('❌ Get recordings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recordings',
      error: error.message
    });
  }
};

// Get single recording (NO AUTH)
exports.getRecordingById = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    res.status(200).json({
      success: true,
      recording
    });

  } catch (error) {
    console.error('❌ Get recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recording',
      error: error.message
    });
  }
};

// Delete recording (NO AUTH)
exports.deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findByIdAndDelete(req.params.id);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    console.log('✅ Recording deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Recording deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recording',
      error: error.message
    });
  }
};
