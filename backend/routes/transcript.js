// server/routes/transcript.js
const express = require('express');
const router = express.Router();
const Transcript = require('../models/transcript');

// POST /api/transcripts - Save a new transcript
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: 'Text is required' });
    }

    const newTranscript = new Transcript({ text });
    await newTranscript.save();

    res.status(201).json(newTranscript);
  } catch (err) {
    console.error('Error saving transcript:', err);
    res.status(500).json({ error: 'Failed to save transcript' });
  }
});

// GET /api/transcripts - Get all transcripts
router.get('/', async (req, res) => {
  try {
    const transcripts = await Transcript.find().sort({ createdAt: -1 });
    res.status(200).json(transcripts);
  } catch (err) {
    console.error('Error fetching transcripts:', err);
    res.status(500).json({ error: 'Error fetching transcripts' });
  }
});

module.exports = router;
