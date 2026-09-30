import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Volume2, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  farmerNotes: string;
  onNotesChange: (notes: string) => void;
  language: string;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  farmerNotes,
  onNotesChange,
  language,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    setTranscriptionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setTranscriptionError('Microphone access denied or not available. You can type observations directly below.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionError(null);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/transcribe-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: audioBlob.type || 'audio/webm',
            language,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to transcribe audio.');
        }

        const data = await res.json();
        if (data.success && data.data) {
          const { transcript, englishTranslation } = data.data;
          const noteAddition = englishTranslation
            ? `${englishTranslation} (${transcript})`
            : transcript;
          const updated = farmerNotes
            ? `${farmerNotes}\n• Spoken note: ${noteAddition}`
            : noteAddition;
          onNotesChange(updated);
        }
        setIsTranscribing(false);
      };
    } catch (err: any) {
      console.error('Transcription failed:', err);
      setTranscriptionError(err.message || 'Could not transcribe voice note. Please type observations manually.');
      setIsTranscribing(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Farmer Voice &amp; Field Notes (Optional)</h2>
            <p className="text-xs text-stone-500">
              Speak or describe duration, rainfall, fertilizer, or pest behavior in local dialect
            </p>
          </div>
        </div>
      </div>

      {/* Voice Recording Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={disabled || isTranscribing}
              className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Mic className="w-4 h-4" />
              <span>Record Voice Note</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 transition animate-pulse cursor-pointer"
            >
              <Square className="w-4 h-4" />
              <span>Stop Recording ({formatSeconds(recordingSeconds)})</span>
            </button>
          )}

          {isTranscribing && (
            <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Transcribing &amp; translating speech...</span>
            </div>
          )}

          {!isRecording && !isTranscribing && (
            <span className="text-[11px] text-stone-500">
              Auto-translates Hindi, Telugu, Tamil, Bengali, Vietnamese, Thai, Indonesian, etc.
            </span>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-1.5 self-center">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-semibold text-rose-700">Listening to farmer audio...</span>
          </div>
        )}
      </div>

      {transcriptionError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{transcriptionError}</span>
        </div>
      )}

      {/* Text Area for Notes */}
      <div className="relative">
        <textarea
          aria-label="Farmer observations and symptoms notes"
          value={farmerNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Type or edit field observations (e.g. 'Leaves started drying 3 days after continuous rain. Stems feel hollow with foul smell. What can I spray organically?')"
          rows={3}
          disabled={disabled}
          className="w-full text-xs text-stone-800 p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none placeholder:text-stone-400"
        />
        {farmerNotes && (
          <button
            type="button"
            onClick={() => onNotesChange('')}
            className="absolute top-2 right-2 text-[10px] text-stone-400 hover:text-stone-600 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded cursor-pointer transition"
          >
            Clear Text
          </button>
        )}
      </div>
    </div>
  );
};
