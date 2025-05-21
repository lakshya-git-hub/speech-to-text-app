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
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```
3. Create a `.env` file in the server directory with:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm run dev
   ```

## License

MIT 