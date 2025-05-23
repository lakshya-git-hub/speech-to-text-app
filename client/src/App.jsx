import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import TranscriptHistory from "./components/TranscriptHistory";

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-service-name.onrender.com'  // Replace with your actual Render URL
  : 'http://localhost:5000';

const App = () => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState([]);
  const [transcriptToDelete, setTranscriptToDelete] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk + " ";
        } else {
          interimTranscript += transcriptChunk;
        }
      }
      // Update UI text with final + interim
      setText(finalTranscript + interimTranscript);
    };

    recognitionRef.current = recognition;

    // Store finalTranscript for use in stop
    recognition.finalTranscript = () => finalTranscript;
  }, []);

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
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleStop = () => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    setIsRecording(false);

    recognition.onend = () => {
      const transcriptToSave = recognition.finalTranscript?.().trim() || text.trim();
      if (transcriptToSave !== "") {
        axios
          .post(`${API_BASE_URL}/api/transcripts`, { text: transcriptToSave })
          .then((res) => {
            setHistory((prevHistory) => [res.data, ...prevHistory]);
            // Don't clear text here
          })
          .catch((err) => {
            console.error("Failed to save transcript:", err);
          });
      }
    };

    recognition.stop();
  };

  const handleClear = () => {
    setText(""); // ✅ Clear the current text
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

            <textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-6 border border-gray-600 rounded-lg shadow-inner bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 focus:shadow-outline-blue resize-none text-lg transition duration-300"
              placeholder="Your transcript will appear here..."
            ></textarea>

            {/* Character/Word Counter */}
            <p className="text-sm text-gray-400 mt-2">{text.length} characters</p>

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
            <div className="max-h-96 overflow-y-auto pr-4">
              <TranscriptHistory
                transcripts={history}
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
