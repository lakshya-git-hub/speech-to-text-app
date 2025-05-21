// server/models/transcript.js
const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { timestamps: true } // ✅ createdAt and updatedAt will be auto-added
);

module.exports = mongoose.model('Transcript', transcriptSchema);
