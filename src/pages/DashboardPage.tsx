import React from 'react';
import { PlantDiagnosis, SampleCropCase, AppPage } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { SampleCropsGallery } from '../components/SampleCropsGallery';
import { DiagnosisResult } from '../components/DiagnosisResult';
import {
  Leaf,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Mic,
  Database,
  ShieldCheck,
  CloudRain,
  Activity,
  Layers,
  Sprout,
  BarChart3,
  Calendar,
  RotateCcw,
} from 'lucide-react';

interface DashboardPageProps {
  currentRegion: string;
  currentLanguage: string;
  selectedImage: string | null;
  imageMimeType: string;
  farmerNotes: string;
  onImageSelected: (base64: string, mimeType: string) => void;
  onClearImage: () => void;
  onNotesChange: (notes: string) => void;
  onRunDiagnosis: () => void;
  isAnalyzing: boolean;
  analysisStep: string;
  analysisError: string | null;
  onSelectSample: (sample: SampleCropCase) => void;
  onNavigate: (page: AppPage) => void;
  savedCount: number;
  hasActiveDiagnosis: boolean;
  activeDiagnosis: PlantDiagnosis | null;
  onClearActiveDiagnosis?: () => void;
  onOpenPrint?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentRegion,
  currentLanguage,
  selectedImage,
  imageMimeType,
  farmerNotes,
  onImageSelected,
  onClearImage,
  onNotesChange,
  onRunDiagnosis,
  isAnalyzing,
  analysisStep,
  analysisError,
  onSelectSample,
  onNavigate,
  savedCount,
  hasActiveDiagnosis,
  activeDiagnosis,
  onClearActiveDiagnosis,
  onOpenPrint,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Agronomic Mission Hero */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 rounded-3xl text-white p-6 sm:p-8 shadow-md border border-emerald-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-700/80 backdrop-blur-sm">
            <Leaf className="w-3.5 h-3.5" />
            <span>APAC Smallholder Agricultural Doctor • {currentRegion}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Agricultural Disease Diagnosis &amp; Low-Cost Organic Remedies
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
            Empowering smallholder farmers across Asia Pacific with instant multimodal plant pathology,
            severity grade scoring (1–5), and zero-cost on-farm organic recipes like neem oil emulsions,
            wood ash, and fermented curd water sprays.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
              <span className="text-[11px] text-emerald-300 block">Organic Priority</span>
              <span className="text-base font-bold text-white">100% Eco-Safe</span>
            </div>
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
              <span className="text-[11px] text-emerald-300 block">Severity Meter</span>
              <span className="text-base font-bold text-white">Grades 1 to 5</span>
            </div>
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
              <span className="text-[11px] text-emerald-300 block">Pre-Harvest Safe</span>
              <span className="text-base font-bold text-white">Exact PHI Days</span>
            </div>
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
              <span className="text-[11px] text-emerald-300 block">Saved Records</span>
              <span className="text-base font-bold text-amber-300">{savedCount} Reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Farmer Voice & Field Notes Jump */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-500/50 transition flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Mic className="w-4 h-4 text-emerald-700" />
            </div>
            <h2 className="text-sm font-bold text-stone-900">Farmer Voice &amp; Field Notes</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Record voice audio in your local dialect, transcribe symptoms, and log field observations.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('voice-notes')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 cursor-pointer"
              >
                <span>Open Voice Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card B: Diagnosis Data Jump */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-500/50 transition flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Database className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-stone-900">Diagnosis Data Repository</h2>
              {hasActiveDiagnosis && (
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  Report Ready
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {hasActiveDiagnosis
                ? `Active report for ${activeDiagnosis?.plantSpecies}. View organic recipes, chemical controls & ask questions.`
                : 'Inspect detailed pathology metrics, historical diagnostic cases, and print advisory slips.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('diagnosis-data')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 cursor-pointer"
              >
                <span>{hasActiveDiagnosis ? 'Inspect Active Report' : 'Browse Pathology Archive'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Error Banner with Instant Retry */}
      {analysisError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold block text-rose-950">Diagnostic Notice:</strong>
              <p className="text-rose-800">{analysisError}</p>
            </div>
          </div>
          {selectedImage && (
            <button
              type="button"
              onClick={onRunDiagnosis}
              disabled={isAnalyzing}
              className="bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer self-end sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Retry Crop Analysis</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Active Diagnosis Results (Rendered directly on Dashboard upon diagnosis completion) */}
      {activeDiagnosis && (
        <div className="space-y-4 animate-in fade-in duration-300" id="active-diagnosis-dashboard">
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emerald-950">
                    Diagnosis Complete: {activeDiagnosis.plantSpecies}
                  </h3>
                  <span className="text-[11px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    Grade {activeDiagnosis.diseaseOrPest.severityScore}/5
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Full pathology findings and organic remedies are ready below and saved to your Diagnosis Data tab.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => onNavigate('diagnosis-data')}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>View in Diagnosis Data Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClearImage();
                  onClearActiveDiagnosis?.();
                }}
                className="bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-medium text-xs px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </button>
            </div>
          </div>

          <DiagnosisResult
            diagnosis={activeDiagnosis}
            onReset={() => {
              onClearImage();
              onClearActiveDiagnosis?.();
            }}
            onOpenPrint={onOpenPrint || (() => {})}
            language={currentLanguage}
            region={currentRegion}
          />
        </div>
      )}

      {/* 5. Quick Diagnostic Scanner Section */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              <span>Instant Leaf Pathology Scanner</span>
            </h2>
            <p className="text-xs text-stone-500">
              Attach a clear leaf photo or pick a sample crop below to run instant plant pathology analysis.
            </p>
          </div>

          {selectedImage && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
              </span>
              <button
                type="button"
                onClick={onClearImage}
                disabled={isAnalyzing}
                className="text-xs text-stone-500 hover:text-rose-600 underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Dual Input Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Panel 1: Photo Uploader & Live Camera */}
          <div>
            <div className="text-xs font-bold text-stone-700 mb-2 flex items-center justify-between">
              <span>Step 1: Leaf Photo / Live Camera</span>
              <span className="text-[11px] text-stone-400 font-normal">Macro closeup recommended</span>
            </div>
            <ImageUploader
              selectedImage={selectedImage}
              onImageSelected={onImageSelected}
              onClearImage={onClearImage}
              disabled={isAnalyzing}
            />
          </div>

          {/* Panel 2: Field Notes Quick Preview / Voice link */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
              <span>Step 2: Field Observations &amp; Spoken Notes</span>
              <button
                type="button"
                onClick={() => onNavigate('voice-notes')}
                className="text-emerald-700 hover:text-emerald-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Mic className="w-3 h-3" />
                <span>Open Full Voice Studio</span>
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
              <textarea
                value={farmerNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                disabled={isAnalyzing}
                placeholder="Describe visible symptoms (e.g. brown oval spots on leaf margins, yellowing after monsoon rain, sudden leaf drop, powdery white dust)..."
                rows={5}
                className="w-full bg-white rounded-xl border border-stone-300 p-3 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none transition"
              />

              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>{farmerNotes.length} characters noted</span>
                <button
                  type="button"
                  onClick={() => onNavigate('voice-notes')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Mic className="w-3 h-3" />
                  <span>Record Local Voice</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis Trigger Action Bar */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                selectedImage ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-400'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Ready to Diagnose Crop Pathology
              </h3>
              <p className="text-xs text-stone-500">
                {selectedImage
                  ? 'Photo attached. Click to analyze leaf morphology & compute treatment.'
                  : 'Please attach a leaf photo or pick a sample below to diagnose.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRunDiagnosis}
            disabled={!selectedImage || isAnalyzing}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm ${
              selectedImage && !isAnalyzing
                ? 'bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white cursor-pointer shadow-emerald-900/20'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Analyzing Plant Pathology...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Run Full Crop Diagnosis</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time scanning progress */}
        {isAnalyzing && analysisStep && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            <span className="font-semibold">{analysisStep}</span>
          </div>
        )}
      </div>

      {/* 5. Curated APAC Field Pathology Samples Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Curated APAC Field Samples (1-Click Test)
            </h2>
            <p className="text-xs text-stone-500">
              Test Krishi-Sight immediately on major smallholder staple crops with documented disease cases.
            </p>
          </div>
        </div>

        <SampleCropsGallery onSelectSample={onSelectSample} disabled={isAnalyzing} />
      </div>
    </div>
  );
};
