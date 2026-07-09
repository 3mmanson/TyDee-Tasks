import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { api } from '../api/api';

const VoiceButton = ({ onParsed }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const parseAndFill = useCallback(async (text) => {
    if (!text.trim()) return;
    setParsing(true);
    setError(null);
    try {
      const res = await api.tasks.parse(text);
      onParsed(res.data);
      setTranscript('');
    } catch (err) {
      setError(err.message || 'Failed to parse');
    } finally {
      setParsing(false);
    }
  }, [onParsed]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalText = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += t + ' ';
        } else {
          interim += t;
        }
      }
      setTranscript((finalText + interim).trim());
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        setError('Microphone access denied or error occurred');
      }
      stopListening();
    };

    recognition.onend = () => {
      setListening(false);
      if (finalText.trim()) {
        parseAndFill(finalText.trim());
      }
    };

    recognition.start();
    setListening(true);
    setError(null);
    setTranscript('');
  }, [listening, stopListening, parseAndFill]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleListening}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
        style={{
          backgroundColor: listening ? 'var(--color-negative)' : 'var(--color-active)',
          color: '#fff',
          transform: listening ? 'scale(1.1)' : 'scale(1)',
        }}
        title={listening ? 'Stop listening' : 'Voice create task'}
      >
        {listening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {/* Listening overlay */}
      {listening && (
        <div
          className="fixed bottom-24 right-6 z-40 w-72 p-4 rounded-xl shadow-xl border"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="animate-pulse w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-negative)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Listening...</span>
          </div>
          {transcript && (
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{transcript}</p>
          )}
          {!transcript && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Speak naturally, e.g. "I have a task due next Monday to clean the attic"</p>
          )}
        </div>
      )}

      {/* Parsing indicator */}
      {parsing && (
        <div
          className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)' }}
        >
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-active)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Understanding your task...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="fixed bottom-24 right-6 z-40 px-4 py-3 rounded-xl shadow-xl border"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-negative)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-negative)' }}>{error}</p>
        </div>
      )}
    </>
  );
};

export default VoiceButton;
