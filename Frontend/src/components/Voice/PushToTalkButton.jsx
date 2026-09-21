import React, { useState, useRef, useEffect } from 'react';

/**
 * PushToTalkButton
 * High-performance, zero-external-dependency push-to-talk voice recording button.
 * Supports both:
 * 1) Hold-to-Talk (Mouse down / Touch start -> speak -> Mouse up / Touch end -> send)
 * 2) Tap-to-Toggle (Click to start speaking -> Click again to send)
 * Automatically optimizes audio codec and records in patient's preferred language.
 */
export default function PushToTalkButton({
  onAudioReady,
  isProcessing = false,
  language = 'hi',
  label = '',
  compact = false,
  disabled = false
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [spokenPreview, setSpokenPreview] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const isHoldRef = useRef(false);
  const startTimeRef = useRef(0);
  const recognitionRef = useRef(null);
  const liveTranscriptRef = useRef('');
  const pointerStartTimeRef = useRef(0);
  const ignoreNextClickRef = useRef(false);

  // Language display labels
  const langLabels = {
    hi: { speak: 'बोलने के लिए दबाएं / टैप करें', listening: 'सुन रहे हैं (हिंदी)...', release: 'भेजने के लिए छोड़ें या टैप करें', processing: 'आवाज़ समझी जा रही है...' },
    en: { speak: 'Push to Talk / Tap to Speak', listening: 'Listening (English)...', release: 'Release or Tap to Send', processing: 'Processing voice...' },
    mr: { speak: 'बोलण्यासाठी दाबा / टॅप करा', listening: 'ऐकत आहोत (मराठी)...', release: 'पाठवण्यासाठी सोडा किंवा टॅप करा', processing: 'आवाज तपासत आहोत...' },
    ta: { speak: 'பேச அழுத்தவும் / தட்டவும்', listening: 'கேட்கிறது (தமிழ்)...', release: 'அனுப்ப விடுங்கள் அல்லது தட்டவும்', processing: 'செயலாக்குகிறது...' }
  };
  const activeLabels = langLabels[language] || langLabels.hi;

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav'
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startRecording = async () => {
    if (disabled || isProcessing || isRecording) return;
    setErrorMessage('');
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Microphone not supported on this device/browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const finalBlob = new Blob(audioChunksRef.current, { type: mime });
        audioChunksRef.current = [];

        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        setTimeout(() => {
          const duration = Date.now() - startTimeRef.current;
          const transcript = (liveTranscriptRef.current || '').trim();
          if (duration >= 300 || transcript.length > 0) {
            if (onAudioReady) {
              onAudioReady(finalBlob, transcript);
            }
          } else {
            setErrorMessage(language === 'hi' ? 'कृपया थोड़ा देर बोलें' : 'Audio too short. Hold or tap and speak clearly.');
          }
          setSpokenPreview('');
        }, 120);
      };

      liveTranscriptRef.current = '';
      setSpokenPreview('');
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          const langMap = { hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN', gu: 'gu-IN', ta: 'ta-IN' };
          rec.lang = langMap[language] || 'hi-IN';
          rec.continuous = true;
          rec.interimResults = true;
          rec.onresult = (e) => {
            let text = '';
            for (let i = 0; i < e.results.length; i++) {
              text += e.results[i][0].transcript;
            }
            if (text.trim()) {
              liveTranscriptRef.current = text.trim();
              setSpokenPreview(text.trim());
            }
          };
          rec.onerror = () => {};
          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          // ignore
        }
      }

      startTimeRef.current = Date.now();
      mediaRecorder.start(250); // Collect in chunks
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            // Auto stop at 30 seconds
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.warn('[PushToTalk] Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(language === 'hi' ? 'माइक्रोफ़ोन अनुमति अस्वीकृत है।' : 'Microphone permission denied.');
      } else {
        setErrorMessage(language === 'hi' ? 'माइक्रोफ़ोन शुरू नहीं हो सका।' : 'Could not access microphone.');
      }
      cleanupRecording();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording && !mediaRecorderRef.current) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('[PushToTalk] Stop recorder error:', e);
      }
    }
  };

  // Hold-to-Talk & Tap-to-Talk pointer handlers
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (disabled || isProcessing) return;

    if (isRecording) {
      ignoreNextClickRef.current = true;
      stopRecording();
      return;
    }

    pointerStartTimeRef.current = Date.now();
    isHoldRef.current = true;
    startRecording();
  };

  const handlePointerUp = () => {
    if (isHoldRef.current && isRecording) {
      const elapsed = Date.now() - pointerStartTimeRef.current;
      if (elapsed > 350) {
        // Deliberate hold action: release to send
        isHoldRef.current = false;
        ignoreNextClickRef.current = true;
        stopRecording();
      } else {
        // Quick tap: keep recording, user can speak and tap again to send
        isHoldRef.current = false;
        ignoreNextClickRef.current = false;
      }
    }
  };

  // Tap-to-toggle fallback
  const handleClick = (e) => {
    e.preventDefault();
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        disabled={disabled || isProcessing}
        title={isRecording ? activeLabels.release : (label || activeLabels.speak)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: compact ? '8px 14px' : '14px 24px',
          borderRadius: compact ? '24px' : '32px',
          border: isRecording
            ? '2px solid #EF4444'
            : isProcessing
            ? '2px solid #3B82F6'
            : '2px solid #2563EB',
          background: isRecording
            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
            : isProcessing
            ? 'linear-gradient(135deg, #F3F4F6, #E5E7EB)'
            : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          color: isProcessing ? '#4B5563' : '#FFFFFF',
          fontSize: compact ? '0.875rem' : '1.05rem',
          fontWeight: 700,
          cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
          boxShadow: isRecording
            ? '0 0 0 6px rgba(239, 68, 68, 0.35), 0 4px 14px rgba(239, 68, 68, 0.4)'
            : '0 4px 12px rgba(37, 99, 235, 0.25)',
          transform: isRecording ? 'scale(1.03)' : 'scale(1)',
          transition: 'all 0.15s ease',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none'
        }}
      >
        {isProcessing ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
            <span>{activeLabels.processing}</span>
          </>
        ) : isRecording ? (
          <>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 0 8px #FFFFFF',
                animation: 'pulse 1s infinite'
              }}
            />
            <span>{activeLabels.listening}</span>
            <span
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.85em'
              }}
            >
              0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </span>
          </>
        ) : (
          <>
            <i className="fa-solid fa-microphone" style={{ fontSize: compact ? '1rem' : '1.25rem' }}></i>
            <span>{label || activeLabels.speak}</span>
          </>
        )}
      </button>

      {/* Sub-label instruction */}
      {isRecording && (
        <span
          style={{
            fontSize: '0.78rem',
            color: '#DC2626',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {activeLabels.release}
        </span>
      )}

      {/* Live speech-to-text transcript bubble */}
      {isRecording && spokenPreview && (
        <div
          style={{
            maxWidth: compact ? '220px' : '360px',
            fontSize: '0.82rem',
            color: '#1E40AF',
            background: '#DBEAFE',
            padding: '5px 12px',
            borderRadius: '12px',
            border: '1px solid #93C5FD',
            marginTop: '2px',
            textAlign: 'center',
            wordBreak: 'break-word',
            animation: 'fadeIn 0.2s ease',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)'
          }}
        >
          🗣️ "{spokenPreview}"
        </div>
      )}

      {errorMessage && (
        <span
          style={{
            fontSize: '0.8rem',
            color: '#DC2626',
            fontWeight: 600,
            background: '#FEE2E2',
            padding: '4px 10px',
            borderRadius: '6px'
          }}
        >
          ⚠️ {errorMessage}
        </span>
      )}
    </div>
  );
}
