# Speech-to-Text Application

A web application that converts speech to text using modern web technologies.

## Features

- Real-time speech-to-text conversion
- Save and manage transcripts
- Modern and responsive UI
- RESTful API backend

## Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Additional: Web Speech API

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Create a `.env` file in the backend directory with:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd ../frontend
   npm run dev
   ```

## API Usage

### Endpoints

- **GET /api/transcripts**
  - Fetch all saved transcripts.
- **POST /api/transcripts**
  - Save a new transcript.
  - Body: `{ "text": "Your transcript text", "language": "en-US" }`
- **DELETE /api/transcripts/:id**
  - Delete a transcript by its ID.
- **POST /api/upload**
  - Upload an audio file for transcription (used by the audio upload feature).

### Example: Save a Transcript
```bash
curl -X POST http://localhost:5000/api/transcripts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "language": "en-US"}'
```

## Deployment Steps

### Deploy Backend (Render, Heroku, etc.)
1. Push your backend code to a GitHub repository.
2. Create a new web service on Render/Heroku.
3. Set environment variables (`MONGO_URI`, `PORT`).
4. Deploy and note the backend URL (e.g., `https://your-backend.onrender.com`).

### Deploy Frontend (Netlify, Vercel, etc.)
1. Push your frontend code to a GitHub repository.
2. Create a new site on Netlify/Vercel.
3. Set the build command to `npm run build` and the publish directory to `dist` in the `frontend` directory.
4. In your frontend, set the API base URL to your deployed backend (see `frontend/src/App.jsx`).
5. Deploy and test the app.

## License

MIT 