import React, { useState, useEffect } from 'react';
import { PlantDiagnosis, SampleCropCase, AppPage, FieldVoiceNote } from './types';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { DashboardPage } from './pages/DashboardPage';
import { FarmerVoicePage } from './pages/FarmerVoicePage';
import { DiagnosisDataPage } from './pages/DiagnosisDataPage';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PrintAdvisoryModal } from './components/PrintAdvisoryModal';
import { AIAssistantWidget } from './components/AIAssistantWidget';

const HISTORY_STORAGE_KEY = 'krishi_sight_diagnosis_history_v2';
const VOICE_NOTES_STORAGE_KEY = 'krishi_sight_voice_notes_v1';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [currentRegion, setCurrentRegion] = useState<string>('India (Monsoon & Subtropical)');

  // Input state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [farmerNotes, setFarmerNotes] = useState<string>('');

  // Diagnostic execution state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeDiagnosis, setActiveDiagnosis] = useState<PlantDiagnosis | null>(null);

  // Storage state
  const [historyList, setHistoryList] = useState<PlantDiagnosis[]>([]);
  const [voiceNotesList, setVoiceNotesList] = useState<FieldVoiceNote[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Load history & voice notes from localStorage on startup
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setHistoryList(parsed);
      }

      const savedVoice = localStorage.getItem(VOICE_NOTES_STORAGE_KEY);
      if (savedVoice) {
        const parsed = JSON.parse(savedVoice);
        if (Array.isArray(parsed)) setVoiceNotesList(parsed);
      }
    } catch (e) {
      console.warn('Failed to load saved storage data:', e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (diagnosis: PlantDiagnosis) => {
    try {
      const updated = [diagnosis, ...historyList.filter((h) => h.id !== diagnosis.id)].slice(0, 30);
      setHistoryList(updated);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history to storage:', e);
    }
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const handleDeleteSingle = (id: string) => {
    const updated = historyList.filter((h) => h.id !== id);
    setHistoryList(updated);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    if (activeDiagnosis?.id === id) {
      setActiveDiagnosis(null);
    }
  };

  // Voice notes helpers
  const handleSaveVoiceNote = (note: FieldVoiceNote) => {
    try {
      const updated = [note, ...voiceNotesList.filter((v) => v.id !== note.id)].slice(0, 30);
      setVoiceNotesList(updated);
      localStorage.setItem(VOICE_NOTES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save voice note:', e);
    }
  };

  const handleDeleteVoiceNote = (id: string) => {
    const updated = voiceNotesList.filter((v) => v.id !== id);
    setVoiceNotesList(updated);
    localStorage.setItem(VOICE_NOTES_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleImageSelected = (base64: string, mimeType: string) => {
    setSelectedImage(base64);
    setImageMimeType(mimeType);
    setAnalysisError(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageMimeType('image/jpeg');
    setAnalysisError(null);
  };

  // Convert image URL to Base64 helper for sample images
  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 1-Click Load Sample Case
  const handleSelectSample = async (sample: SampleCropCase) => {
    try {
      setFarmerNotes(sample.farmerNotes);
      setAnalysisError(null);
      const b64 = await urlToBase64(sample.imageUrl);
      setSelectedImage(b64);
      setImageMimeType('image/jpeg');
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load sample image:', err);
      setSelectedImage(sample.imageUrl);
      setImageMimeType('image/jpeg');
    }
  };

  // Run full plant pathology AI diagnosis
  const handleRunDiagnosis = async () => {
    if (!selectedImage) {
      setAnalysisError('Please take a photo or upload an image of the plant leaf first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStep('Scanning leaf morphology & microscopic pathogen symptoms...');

    try {
      const stepTimer1 = setTimeout(() => {
        setAnalysisStep('Identifying plant species & classifying disease severity...');
      }, 1400);

      const stepTimer2 = setTimeout(() => {
        setAnalysisStep('Formulating low-cost organic recipes & regional safety guidance...');
      }, 3200);

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: imageMimeType,
          farmerNotes,
          language: currentLanguage,
          country: currentRegion,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete diagnosis. Please try again.');
      }

      const resData = await res.json();
      if (!resData.success || !resData.data) {
        throw new Error('Invalid diagnostic response received.');
      }

      const diagnosis: PlantDiagnosis = {
        ...resData.data,
        inputImage: selectedImage,
      };

      setActiveDiagnosis(diagnosis);
      if (diagnosis.isIdentifiable) {
        saveToHistory(diagnosis);
      }

      // If triggered from voice-notes, switch to diagnosis-data page
      if (currentPage === 'voice-notes') {
        setCurrentPage('diagnosis-data');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // If on dashboard, smoothly scroll directly to the complete diagnosis report
        setTimeout(() => {
          const el = document.getElementById('active-diagnosis-dashboard');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 120);
      }
    } catch (err: any) {
      console.error('Diagnosis error:', err);
      setAnalysisError(err.message || 'An unexpected error occurred during crop analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/90 text-stone-900 flex flex-col font-sans antialiased selection:bg-emerald-200">
      {/* 1. Header with Region, Language & Quick Actions */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        currentRegion={currentRegion}
        onRegionChange={setCurrentRegion}
        historyCount={historyList.length}
        onOpenHistory={() => {
          // Switch to Diagnosis Data page directly
          setCurrentPage('diagnosis-data');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasActiveDiagnosis={!!activeDiagnosis}
        onOpenPrint={() => setIsPrintModalOpen(true)}
      />

      {/* 2. Navigation Tabs (1. Dashboard, 2. Farmer Voice & Field Notes, 3. Diagnosis Data) */}
      <NavigationTabs
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedDiagnosisCount={historyList.length}
        hasActiveDiagnosis={!!activeDiagnosis}
        voiceNotesCount={voiceNotesList.length}
      />

      {/* 3. Main Multi-Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page 1: Dashboard */}
        {currentPage === 'dashboard' && (
          <DashboardPage
            currentRegion={currentRegion}
            currentLanguage={currentLanguage}
            selectedImage={selectedImage}
            imageMimeType={imageMimeType}
            farmerNotes={farmerNotes}
            onImageSelected={handleImageSelected}
            onClearImage={handleClearImage}
            onNotesChange={setFarmerNotes}
            onRunDiagnosis={handleRunDiagnosis}
            isAnalyzing={isAnalyzing}
            analysisStep={analysisStep}
            analysisError={analysisError}
            onSelectSample={handleSelectSample}
            onNavigate={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            savedCount={historyList.length}
            hasActiveDiagnosis={!!activeDiagnosis}
            activeDiagnosis={activeDiagnosis}
            onClearActiveDiagnosis={() => setActiveDiagnosis(null)}
            onOpenPrint={() => setIsPrintModalOpen(true)}
          />
        )}

        {/* Page 2: Farmer Voice & Field Notes */}
        {currentPage === 'voice-notes' && (
          <FarmerVoicePage
            farmerNotes={farmerNotes}
            onNotesChange={setFarmerNotes}
            language={currentLanguage}
            region={currentRegion}
            selectedImage={selectedImage}
            onImageSelected={handleImageSelected}
            onClearImage={handleClearImage}
            onNavigate={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRunDiagnosisFromVoice={handleRunDiagnosis}
            isAnalyzing={isAnalyzing}
            voiceNotesList={voiceNotesList}
            onSaveVoiceNote={handleSaveVoiceNote}
            onDeleteVoiceNote={handleDeleteVoiceNote}
          />
        )}

        {/* Page 3: Diagnosis Data */}
        {currentPage === 'diagnosis-data' && (
          <DiagnosisDataPage
            activeDiagnosis={activeDiagnosis}
            onSelectDiagnosis={(diag) => {
              setActiveDiagnosis(diag);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onClearActiveDiagnosis={() => setActiveDiagnosis(null)}
            historyList={historyList}
            onDeleteSingle={handleDeleteSingle}
            onClearHistory={handleClearHistory}
            onOpenPrint={() => setIsPrintModalOpen(true)}
            onNavigate={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            language={currentLanguage}
            region={currentRegion}
            onSelectSample={handleSelectSample}
          />
        )}
      </main>

      {/* Slide-out History Drawer (Fallback) */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onSelectDiagnosis={(diag) => {
          setActiveDiagnosis(diag);
          setCurrentPage('diagnosis-data');
          setIsHistoryOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeleteDiagnosis={handleDeleteSingle}
        onClearAll={handleClearHistory}
      />

      {/* Printable Field Advisory Slip Modal */}
      {isPrintModalOpen && activeDiagnosis && (
        <PrintAdvisoryModal
          diagnosis={activeDiagnosis}
          onClose={() => setIsPrintModalOpen(false)}
          language={currentLanguage}
          region={currentRegion}
        />
      )}

      {/* Floating AI Assistant on the bottom right corner */}
      <AIAssistantWidget
        activeDiagnosis={activeDiagnosis}
        language={currentLanguage}
        region={currentRegion}
      />
    </div>
  );
}
