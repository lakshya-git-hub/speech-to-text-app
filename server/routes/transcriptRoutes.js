// const express = require('express');
// const router = express.Router();
// const Transcript = require('../models/transcript');

// // Save a transcript
// router.post('/', async (req, res) => {
//   try {
//     const { text } = req.body;
//     const transcript = await Transcript.create({ text });
//     res.status(201).json(transcript);
//   } catch (err) {
//     console.error('Failed to save transcript:', err);
//     res.status(500).json({ error: 'Failed to save transcript' });
//   }
// });

// // Get all transcripts
// router.get('/', async (req, res) => {
//   try {
//     const transcripts = await Transcript.find().sort({ createdAt: -1 });
//     res.status(200).json(transcripts);
//   } catch (error) {
//     console.error('Error fetching transcripts:', error);
//     res.status(500).json({ message: 'Error fetching transcripts' });
//   }
// });

// module.exports = router;


// server/routes/transcriptRoutes.js
const express = require('express');
const router = express.Router();
const Transcript = require('../models/Transcript');

// POST /api/transcripts - Save a transcript
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Transcript text is required' });
    }

    const transcript = await Transcript.create({ text });
    res.status(201).json(transcript);
  } catch (err) {
    console.error('❌ Failed to save transcript:', err);
    res.status(500).json({ error: 'Failed to save transcript', details: err.message });
  }
});

// GET /api/transcripts - Fetch all transcripts
router.get('/', async (req, res) => {
  try {
    const transcripts = await Transcript.find().sort({ createdAt: -1 });
    res.status(200).json(transcripts);
  } catch (error) {
    console.error('❌ Error fetching transcripts:', error);
    res.status(500).json({ error: 'Error fetching transcripts', details: error.message });
  }
});

// DELETE /api/transcripts/:id - Delete a transcript by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTranscript = await Transcript.findByIdAndDelete(id);

    if (!deletedTranscript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    res.status(200).json({ message: '✅ Transcript deleted successfully', data: deletedTranscript });
  } catch (error) {
    console.error('❌ Error deleting transcript:', error);
    res.status(500).json({ error: 'Error deleting transcript', details: error.message });
  }
});

module.exports = router;
