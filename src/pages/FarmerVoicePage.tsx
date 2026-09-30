import React, { useState, useRef, useEffect } from 'react';
import { FieldVoiceNote, AppPage } from '../types';
import {
  Mic,
  Square,
  Loader2,
  Volume2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  BookOpen,
  Calendar,
  CloudRain,
  Sun,
  Wind,
  Layers,
  FileText,
  Upload,
  Camera,
  X,
} from 'lucide-react';

interface FarmerVoicePageProps {
  farmerNotes: string;
  onNotesChange: (notes: string) => void;
  language: string;
  region: string;
  selectedImage: string | null;
  onImageSelected: (base64: string, mimeType: string) => void;
  onClearImage: () => void;
  onNavigate: (page: AppPage) => void;
  onRunDiagnosisFromVoice: () => void;
  isAnalyzing: boolean;
  voiceNotesList: FieldVoiceNote[];
  onSaveVoiceNote: (note: FieldVoiceNote) => void;
  onDeleteVoiceNote: (id: string) => void;
}

const COMMON_SYMPTOM_TAGS = [
  { category: 'Leaf Spots & Blight', tags: ['Spindle-shaped gray-center lesions', 'Water-soaked brown patches', 'Yellow chlorotic halos', 'White powdery mildew spores', 'Scorched leaf tips & margins'] },
  { category: 'Leaf Curling & Veins', tags: ['Upward cup-like leaf curl', 'Downward curling & puckering', 'Thickened swollen veins (enations)', 'Mottled mosaic yellowing'] },
  { category: 'Whorl & Stem Damage', tags: ['Sawdust-like moist frass in whorl', 'Ragged window-pane holes', 'Corky raised crater cankers', 'Collar rot & stem girdling'] },
  { category: 'Fruit & Pod Symptoms', tags: ['Sunken circular rings (anthracnose)', 'Premature fruit drop & rotting', 'Corky fruit blemishes', 'Soft water-soaked rot'] },
];

export const FarmerVoicePage: React.FC<FarmerVoicePageProps> = ({
  farmerNotes,
  onNotesChange,
  language,
  region,
  selectedImage,
  onImageSelected,
  onClearImage,
  onNavigate,
  onRunDiagnosisFromVoice,
  isAnalyzing,
  voiceNotesList,
  onSaveVoiceNote,
  onDeleteVoiceNote,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [cropName, setCropName] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('Continuous Monsoon Rain & Humidity');
  const [growthStage, setGrowthStage] = useState('Vegetative / Tillering');
  const [fertilizerNote, setFertilizerNote] = useState('High Urea / Nitrogen top-dressing');
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [lastTranslation, setLastTranslation] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
      console.error('Microphone access failed:', err);
      setTranscriptionError('Microphone access denied or unavailable in this browser environment. You can type notes or use symptom chips below.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
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
          setLastTranscript(transcript);
          setLastTranslation(englishTranslation);

          const formattedNote = englishTranslation && englishTranslation !== transcript
            ? `• Voice Observation: ${englishTranslation} [Spoken: "${transcript}"]`
            : `• Voice Observation: ${transcript}`;

          const updated = farmerNotes ? `${farmerNotes}\n${formattedNote}` : formattedNote;
          onNotesChange(updated);
        }
        setIsTranscribing(false);
      };
    } catch (err: any) {
      console.error('Voice processing error:', err);
      setTranscriptionError(err.message || 'Voice transcription failed. You can type notes directly.');
      setIsTranscribing(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Add symptom tag helper
  const handleAddSymptomTag = (tag: string) => {
    if (farmerNotes.includes(tag)) return;
    const addition = `• Observed: ${tag}`;
    onNotesChange(farmerNotes ? `${farmerNotes}\n${addition}` : addition);
  };

  // Save current field voice note to journal
  const handleSaveToJournal = () => {
    if (!farmerNotes.trim() && !lastTranscript) return;

    const newNote: FieldVoiceNote = {
      id: 'voice-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      cropName: cropName.trim() || 'Unspecified APAC Crop',
      transcript: lastTranscript || 'Manual Field Entry',
      englishTranslation: lastTranslation || undefined,
      notes: farmerNotes,
      weatherCondition: `${weatherCondition} | Stage: ${growthStage}`,
      symptomTags: [],
      attachedImage: selectedImage || undefined,
    };

    onSaveVoiceNote(newNote);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // Image handler for quick photo attachment on this page
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <Mic className="w-3.5 h-3.5" />
            <span>Spoken Dialect Audio &amp; Agronomic Journal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Farmer Voice &amp; Field Notes Workstation
          </h1>
          <p className="text-xs text-stone-500 max-w-2xl">
            Speak directly into your phone or laptop in your local language (Hindi, Telugu, Tamil, Bengali, Vietnamese, Thai, Indonesian).
            Krishi-Sight transcribes symptoms, translates to agricultural pathology terminology, and connects to the diagnostic scanner.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recording Console & Symptom Tag Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audio Recorder Module */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <span>Multi-Lingual Audio Recorder</span>
              </h2>
              <span className="text-[11px] text-stone-400 font-medium">
                Active Region: {region}
              </span>
            </div>

            {/* Recording Controls Card */}
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                {isRecording && (
                  <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping" />
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-md cursor-pointer relative z-10 ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-emerald-800 hover:bg-emerald-700 text-white hover:scale-105'
                  }`}
                  title={isRecording ? 'Click to Stop Recording' : 'Click to Speak Field Symptoms'}
                >
                  {isRecording ? (
                    <Square className="w-6 h-6 fill-white" />
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </button>
              </div>

              <div>
                <p className="text-sm font-bold text-stone-800">
                  {isRecording
                    ? `Recording farmer voice: ${formatSeconds(recordingSeconds)}`
                    : isTranscribing
                    ? 'Transcribing and translating spoken dialect...'
                    : 'Tap microphone to speak crop symptoms'}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isRecording
                    ? 'Speak naturally about leaf spots, discoloration, pests, or recent rains. Tap stop when finished.'
                    : 'Supported: Hindi, Telugu, Tamil, Bengali, Vietnamese, Thai, Indonesian, English, Tagalog'}
                </p>
              </div>

              {isTranscribing && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span>Processing speech with APAC Agricultural NLP...</span>
                </div>
              )}

              {transcriptionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 text-left w-full">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{transcriptionError}</span>
                </div>
              )}
            </div>

            {/* Last Transcription Snippet */}
            {lastTranscript && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-emerald-950 block">Latest Voice Transcript:</span>
                <p className="text-emerald-900 italic">"{lastTranscript}"</p>
                {lastTranslation && lastTranslation !== lastTranscript && (
                  <p className="text-emerald-800 text-[11px] pt-1 border-t border-emerald-200">
                    <strong>Agricultural English Translation:</strong> {lastTranslation}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Interactive Agricultural Symptom Builder */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>One-Click Symptom Tag Builder</span>
              </h2>
              <p className="text-xs text-stone-500">
                Click any visible symptom below to automatically append it to your field notes:
              </p>
            </div>

            <div className="space-y-3.5">
              {COMMON_SYMPTOM_TAGS.map((group, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    {group.category}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map((tag, tIdx) => {
                      const isAdded = farmerNotes.includes(tag);
                      return (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => handleAddSymptomTag(tag)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                            isAdded
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                              : 'bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border-stone-200 hover:border-emerald-300'
                          }`}
                        >
                          <Plus className={`w-3 h-3 ${isAdded ? 'text-emerald-700 rotate-45' : 'text-stone-400'}`} />
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Combined Field Notes & Action Console (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Field Notes Editor */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Field Observation Journal</span>
              </h2>
              <span className="text-[11px] text-stone-400">
                {farmerNotes.length} chars
              </span>
            </div>

            {/* Field Meta Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Crop Variety / Name</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Samba Paddy, Kagzi Lime"
                  className="w-full bg-stone-50 rounded-xl border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Growth Stage</label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full bg-stone-50 rounded-xl border border-stone-300 px-2 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                >
                  <option value="Seedling / Nursery">Seedling / Nursery</option>
                  <option value="Vegetative / Tillering">Vegetative / Tillering</option>
                  <option value="Flowering / Tasseling">Flowering / Tasseling</option>
                  <option value="Fruit Setting / Pod Filling">Fruit Setting / Pod Filling</option>
                  <option value="Ripening / Pre-Harvest">Ripening / Pre-Harvest</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">Field Weather &amp; Moisture</label>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  className="w-full bg-stone-50 rounded-xl border border-stone-300 px-2 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                >
                  <option value="Continuous Monsoon Rain & Humidity">Continuous Monsoon Rain &amp; Humidity</option>
                  <option value="Heavy Morning Dew & Fog">Heavy Morning Dew &amp; Fog</option>
                  <option value="Hot Dry Spell with Whiteflies">Hot Dry Spell with Whiteflies</option>
                  <option value="Overcast Cloudy Skies (3+ Days)">Overcast Cloudy Skies (3+ Days)</option>
                  <option value="Post-Downpour Stagnant Water">Post-Downpour Stagnant Water</option>
                </select>
              </div>
            </div>

            {/* Main Textarea */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1 text-xs">
                Combined Notes &amp; Spoken Symptoms
              </label>
              <textarea
                value={farmerNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Spoken voice notes and selected symptoms will appear here. You can also type directly..."
                rows={7}
                className="w-full bg-stone-50 rounded-xl border border-stone-300 p-3 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none transition"
              />
            </div>

            {/* Photo Attachment Preview / Attachment Button */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-stone-700">Attached Leaf Photo:</span>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={onClearImage}
                    className="text-stone-400 hover:text-rose-600 text-[11px] underline cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {selectedImage ? (
                <div className="flex items-center gap-3">
                  <img
                    src={selectedImage}
                    alt="Attached crop leaf"
                    className="w-14 h-14 rounded-lg object-cover border border-stone-300 shrink-0"
                  />
                  <div className="text-xs text-stone-600">
                    <span className="font-bold text-emerald-800 block">Photo Ready for Scanner</span>
                    <span className="text-[11px] text-stone-500">Will be analyzed alongside your voice notes.</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition font-medium cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Attach Crop Leaf Photo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Actions: Save to Journal & Run Diagnosis */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onRunDiagnosisFromVoice}
                disabled={!selectedImage || isAnalyzing}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs ${
                  selectedImage && !isAnalyzing
                    ? 'bg-emerald-800 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Crop Pathology...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>{selectedImage ? 'Send to Scanner & Diagnose Now' : 'Attach Photo Above to Diagnose'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveToJournal}
                disabled={!farmerNotes.trim() && !lastTranscript}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs py-2.5 rounded-xl border border-stone-300 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                <span>Save to Field Voice Journal</span>
              </button>

              {saveSuccessMsg && (
                <p className="text-center text-xs text-emerald-700 font-semibold animate-fade-in">
                  ✓ Field notes saved to your local journal!
                </p>
              )}
            </div>
          </div>

          {/* Saved Voice Notes Archive */}
          {voiceNotesList.length > 0 && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Saved Voice Notes ({voiceNotesList.length})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {voiceNotesList.map((vn) => (
                  <div
                    key={vn.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-bold text-emerald-900">{vn.cropName}</span>
                      <span>{new Date(vn.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-stone-700 line-clamp-2">{vn.notes}</p>
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => onNotesChange(vn.notes)}
                        className="text-emerald-700 hover:text-emerald-800 font-medium underline cursor-pointer"
                      >
                        Load into Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteVoiceNote(vn.id)}
                        className="text-stone-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
