import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import TranscriptHistory from "./components/TranscriptHistory";

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://speech-to-text-backend-sqpg.onrender.com'  // Replace with your actual Render URL
  : 'http://localhost:5000';

// Language options for speech recognition
const LANGUAGE_OPTIONS = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese' }
];

const App = () => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState([]);
  const [transcriptToDelete, setTranscriptToDelete] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [searchQuery, setSearchQuery] = useState("");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load history from server on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    axios
      .get(`${API_BASE_URL}/api/transcripts`)
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("Error fetching transcripts:", err));
  };

  // Filter transcripts based on search query
  const filteredTranscripts = history.filter(transcript => 
    transcript.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle language change
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    // Stop current recording if active
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  // Handle deleting a transcript
  const handleDeleteTranscript = (id) => {
    setTranscriptToDelete(id);
  };

  // Handle confirmation of deletion
  const confirmDelete = async () => {
    if (!transcriptToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/transcripts/${transcriptToDelete}`);
      // Remove the deleted transcript from the state
      setHistory(history.filter(transcript => transcript._id !== transcriptToDelete));
      console.log('✅ Transcript deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete transcript:', error);
      // Optionally show an error message to the user
    } finally {
      // Hide the modal
      setTranscriptToDelete(null);
    }
  };

  // Handle cancellation of deletion
  const cancelDelete = () => {
    // Simply hide the modal
    setTranscriptToDelete(null);
  };

  // Start Recording
  const handleStart = () => {
    // Stop any existing recognition instance before creating a new one
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
      
    // Check if API is available
    if (!SpeechRecognition) {
        setError("Speech Recognition API is not available in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    // Reset state for a new session
    finalTranscriptRef.current = ""; 
    setText(""); // Clear displayed text immediately on start
    setError(null); // Clear any previous error

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let currentFinalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentFinalTranscript += transcriptChunk + " ";
        } else {
          interimTranscript += transcriptChunk;
        }
      }
      finalTranscriptRef.current += currentFinalTranscript;
      // Update UI text with accumulated final + current interim
      setText(finalTranscriptRef.current + interimTranscript);
    };

     recognition.onend = () => {
        // Handle the end of the recognition session
        console.log("Speech recognition ended.");
        setIsRecording(false);

        const transcriptToSave = finalTranscriptRef.current.trim();
        if (transcriptToSave !== "") {
            setIsLoading(true);
            axios
              .post(`${API_BASE_URL}/api/transcripts`, { 
                text: transcriptToSave,
                language: selectedLanguage 
              })
              .then((res) => {
                setHistory((prevHistory) => [res.data, ...prevHistory]);
                console.log('Transcript saved successfully', res.data);
                setIsLoading(false);
              })
              .catch((err) => {
                console.error("Failed to save transcript:", err);
                setIsLoading(false);
              });
          } else {
              setIsLoading(false);
          }
     };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
         // Set error state to display to the user
        let errorMessage = "An unknown speech recognition error occurred.";
        switch (event.error) {
            case 'no-speech':
                errorMessage = "No speech detected. Please try speaking again.";
                break;
            case 'not-allowed':
                errorMessage = "Microphone permission denied. Please allow microphone access in your browser settings.";
                break;
            case 'denied': // Older browsers might use 'denied'
                errorMessage = "Microphone permission denied. Please allow microphone access.";
                break;
            case 'audio-capture':
                errorMessage = "Error capturing audio. Please check your microphone connection.";
                break;
            case 'network':
                errorMessage = "Network error during recognition. Please check your internet connection.";
                break;
            case 'aborted':
                errorMessage = "Speech recognition aborted.";
                break;
            case 'service-not-allowed':
                errorMessage = "Speech recognition service not allowed.";
                break;
            case 'bad-grammar':
                errorMessage = "Bad grammar or language not supported.";
                break;
            default:
                errorMessage = `Recognition error: ${event.error}`; // Fallback for unexpected errors
        }
        setError(errorMessage);
    };

    recognitionRef.current = recognition; // Store the new instance
    recognition.start();
    setIsRecording(true);
  };

  const handleStop = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      // setIsRecording(false) is now handled in the onend event
    }
  };

  const handleClear = () => {
    // Stop current recording if active
    if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
         // setIsRecording(false) will be handled by the onend event
    }
    setText(""); // Clear the current text displayed
    finalTranscriptRef.current = ""; // Reset the accumulated final transcript
    // The recognition instance is *not* recreated here. 
    // The next call to handleStart will create a new one.
  };

  // Download transcript
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-slate-900 text-white p-8 font-sans">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-5xl font-extrabold text-center text-blue-400 mb-12 tracking-wide">🎤 Speech to Text App</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Recording/Transcription Section */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center">
            {/* Language Selection */}
            <div className="w-full mb-6">
              <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                Select Language
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={`mic-icon ${isRecording ? "animate-pulse bg-blue-500" : "bg-gray-600"} w-32 h-32 rounded-full flex items-center justify-center mb-8`}>
              {/* Placeholder for a more elaborate mic icon or animation */}
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
            </div>

            <div className="flex gap-6 mb-8">
              <button
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
                disabled={isRecording}
              >
                Start Recording
              </button>
              <button
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
                disabled={!isRecording}
              >
                Stop Recording
              </button>
            </div>

            {/* Recording Status Indicator */}
            {isRecording && (
              <p className="text-blue-400 text-lg mb-4">Recording...</p>
            )}

            <textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-6 border border-gray-600 rounded-lg shadow-inner bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 focus:shadow-outline-blue resize-none text-lg transition duration-300"
              placeholder="Your transcript will appear here..."
            ></textarea>

            {/* Character/Word Counter */}
            <p className="text-sm text-gray-400 mt-2">{text.length} characters</p>

            {/* Display Error Message */}
            {error && (
              <div className="text-red-400 text-sm mt-2">{error}</div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="text-blue-400 text-sm mt-2">Processing transcript...</div>
            )}

            <div className="flex gap-6 mt-6">
              <button
                onClick={handleClear}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                Clear Text
              </button>
              <button
                onClick={handleDownload}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                Download Transcript
              </button>
            </div>
          </div>

          {/* Transcript History Section */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col">
            <h2 className="text-3xl font-bold mb-6 text-blue-400 text-center">📜 Transcript History</h2>
            
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transcripts..."
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-96 overflow-y-auto pr-4">
              <TranscriptHistory
                transcripts={filteredTranscripts}
                onDelete={handleDeleteTranscript}
                transcriptToDelete={transcriptToDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {transcriptToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-gray-200">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this transcript?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
