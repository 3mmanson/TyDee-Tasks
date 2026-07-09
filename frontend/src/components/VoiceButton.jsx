import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Send, Keyboard } from 'lucide-react';
import { api } from '../api/api';

const SpeechSupported = typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const VoiceButton = ({ onParsed }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const recognitionRef = useRef(null);
  const finalTextRef = useRef('');
  const processingRef = useRef(false);

  const parseAndFill = useCallback(async (text) => {
    if (!text.trim() || processingRef.current) return;
    processingRef.current = true;
    setParsing(true);
    setError(null);
    try {
      const res = await api.tasks.parse(text);
      onParsed(res.data);
      setTranscript('');
      setManualText('');
      setShowTextInput(false);
    } catch (err) {
      setError(err.message || 'Failed to parse');
    } finally {
      setParsing(false);
      processingRef.current = false;
    }
  }, [onParsed]);

  const handleManualSubmit = () => {
    if (manualText.trim()) {
      parseAndFill(manualText.trim());
    }
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
      return;
    }

    if (!SpeechSupported) {
      setShowTextInput(true);
      return;
    }

    processingRef.current = false;
    finalTextRef.current = '';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTextRef.current += t + ' ';
        } else {
          interim += t;
        }
      }
      setTranscript((finalTextRef.current + interim).trim());
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError('Microphone access denied or error occurred');
      }
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      if (processingRef.current) return;
      const text = finalTextRef.current.trim();
      if (text) {
        parseAndFill(text);
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
        {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
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
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Speak naturally, e.g. "I have a task due next Monday to clean the attic"</p>
          )}
          <button
            onClick={stopListening}
            className="w-full px-3 py-2 text-xs font-medium rounded-lg transition"
            style={{ backgroundColor: 'var(--color-active)', color: '#fff' }}
          >
            Done speaking
          </button>
        </div>
      )}

      {/* Text input fallback */}
      {showTextInput && !listening && !parsing && (
        <div
          className="fixed bottom-24 right-6 z-40 w-80 p-4 rounded-xl shadow-xl border"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--stroke)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="w-4 h-4" style={{ color: 'var(--color-active)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Describe your task</span>
          </div>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder='e.g. "I have a task due next Monday to clean the attic..."'
            className="w-full px-3 py-2 text-sm border rounded-lg outline-none resize-none mb-2"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--stroke)',
              color: 'var(--text-primary)',
              minHeight: '80px',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleManualSubmit();
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowTextInput(false); setManualText(''); }}
              className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleManualSubmit}
              className="flex-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition flex items-center justify-center gap-1"
              style={{ backgroundColor: 'var(--color-active)' }}
            >
              <Send className="w-3 h-3" /> Parse
            </button>
          </div>
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
          className="fixed bottom-24 right-6 z-40 px-4 py-3 rounded-xl shadow-xl border max-w-xs"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-negative)' }}
        >
          <p className="text-sm mb-2" style={{ color: 'var(--color-negative)' }}>{error}</p>
          <button
            onClick={() => { setError(null); setShowTextInput(true); }}
            className="text-xs font-medium"
            style={{ color: 'var(--color-active)' }}
          >
            Type instead
          </button>
        </div>
      )}
    </>
  );
};

export default VoiceButton;
