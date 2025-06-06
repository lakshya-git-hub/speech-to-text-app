// frontend/src/components/AudioRecorder.jsx
import { useState, useRef } from 'react';
import axios from 'axios';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(audioFile);
        await handleAudioUpload(audioFile);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError("");
    } catch (error) {
      setError('Error accessing microphone. Please check permissions.');
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setError('Please upload a valid audio file (mp3, wav, ogg, etc).');
      return;
    }
    setError("");
    setAudioFile(file);
    await handleAudioUpload(file);
  };

  const handleAudioUpload = async (file) => {
    setIsLoading(true);
    setError("");
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const transcriptText = response.data.transcript;
      setTranscript(transcriptText);

      // Save transcript to DB
      await axios.post('http://localhost:5000/api/transcripts', {
        text: transcriptText,
      });

    } catch (error) {
      setError('Error uploading or transcribing audio. Please try again.');
      console.error('Error uploading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl text-gray-200 font-sans">
      <h2 className="text-3xl font-bold mb-6 text-blue-400 text-center">Audio to Text Converter</h2>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex gap-6 justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-8 py-3 rounded-full font-bold shadow-lg transition duration-300 transform hover:scale-105 ${isRecording
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          <label className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold cursor-pointer shadow-lg transition duration-300 transform hover:scale-105">
            Upload Audio
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {isLoading && (
          <div className="text-center py-6 flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            <p className="mt-2 text-blue-300 text-xl font-semibold">Processing audio...</p>
          </div>
        )}

        {transcript && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-blue-300">Transcription:</h3>
            <div className="p-6 bg-gray-700 rounded-lg shadow-inner">
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{transcript}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
