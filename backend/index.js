// index.js
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const uploadRoute = require('./routes/upload');
const transcriptRoutes = require('./routes/transcriptRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://speech-to-text-app0.netlify.app', 'http://localhost:5173']
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Static & Routes
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', uploadRoute);
app.use('/api/transcripts', transcriptRoutes); // ✅ cleanly uses transcript routes

app.get("/", (req, res) => {
  res.send("🎤 Speech-to-Text Backend is Running!");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});



