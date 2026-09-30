import React, { useState } from 'react';
import { PlantDiagnosis, AppPage, SampleCropCase } from '../types';
import { DiagnosisResult } from '../components/DiagnosisResult';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Eye,
  Printer,
  Share2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sprout,
  Sparkles,
  Layers,
  Activity,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface DiagnosisDataPageProps {
  activeDiagnosis: PlantDiagnosis | null;
  onSelectDiagnosis: (diag: PlantDiagnosis) => void;
  onClearActiveDiagnosis: () => void;
  historyList: PlantDiagnosis[];
  onDeleteSingle: (id: string) => void;
  onClearHistory: () => void;
  onOpenPrint: () => void;
  onNavigate: (page: AppPage) => void;
  language: string;
  region: string;
  onSelectSample: (sample: SampleCropCase) => void;
}

export const DiagnosisDataPage: React.FC<DiagnosisDataPageProps> = ({
  activeDiagnosis,
  onSelectDiagnosis,
  onClearActiveDiagnosis,
  historyList,
  onDeleteSingle,
  onClearHistory,
  onOpenPrint,
  onNavigate,
  language,
  region,
  onSelectSample,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pathogenFilter, setPathogenFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  // Filter saved records
  const filteredHistory = historyList.filter((item) => {
    const matchesSearch =
      item.plantSpecies.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.diseaseOrPest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.farmerNotes && item.farmerNotes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPathogen =
      pathogenFilter === 'All' || item.diseaseOrPest.pathogenType === pathogenFilter;

    const matchesSeverity =
      severityFilter === 'All' ||
      (severityFilter === 'Mild (1-2)' && item.diseaseOrPest.severityScore <= 2) ||
      (severityFilter === 'Moderate (3)' && item.diseaseOrPest.severityScore === 3) ||
      (severityFilter === 'Critical (4-5)' && item.diseaseOrPest.severityScore >= 4);

    return matchesSearch && matchesPathogen && matchesSeverity;
  });

  const getSeverityBadgeClass = (score: number) => {
    switch (score) {
      case 1:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 2:
        return 'bg-lime-100 text-lime-900 border-lime-300';
      case 3:
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 4:
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 5:
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-900 border-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Database className="w-3.5 h-3.5 text-amber-700" />
            <span>Pathology Analytics &amp; Saved Records Archive</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Agricultural Diagnosis Data Repository
          </h1>
          <p className="text-xs text-stone-500 max-w-2xl">
            Inspect active crop diagnoses, compute eco-friendly treatments, ask agronomist follow-up questions,
            and review your historical diagnostic case archive.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {activeDiagnosis && (
            <button
              type="button"
              onClick={onClearActiveDiagnosis}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>View All Records</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Scan Another Leaf</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Active Diagnosis Detailed View (if available) */}
      {activeDiagnosis ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>Active Crop Pathology Inspection</span>
            </h2>
            <button
              type="button"
              onClick={onClearActiveDiagnosis}
              className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold underline cursor-pointer"
            >
              Switch to Historical Archive ({historyList.length})
            </button>
          </div>

          <DiagnosisResult
            diagnosis={activeDiagnosis}
            onReset={onClearActiveDiagnosis}
            onOpenPrint={onOpenPrint}
            language={language}
            region={region}
          />
        </div>
      ) : (
        /* Empty Active State: Invitation & Summary */
        <div className="bg-gradient-to-br from-stone-50 to-emerald-50/40 rounded-3xl border border-stone-200 p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
            <Sprout className="w-6 h-6 text-emerald-700" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-stone-900">
              No Active Crop Diagnosis Open
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Select one of your previously saved diagnoses below to inspect detailed pathology metrics, or return to the Dashboard to scan a new leaf.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Go to Dashboard Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('voice-notes')}
              className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <span>Record Voice Notes</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: Saved Diagnosis History Archive & Filters */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Saved Diagnostic Records ({historyList.length})</span>
            </h2>
            <p className="text-xs text-stone-500">
              Complete archive of field diagnoses saved in your local agricultural database.
            </p>
          </div>

          {historyList.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-stone-400 hover:text-rose-600 transition flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Archive</span>
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by crop, disease, or symptoms..."
              className="w-full bg-stone-50 rounded-xl border border-stone-200 pl-9 pr-3 py-2 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Pathogen Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-400 text-[11px] font-semibold">Pathogen:</span>
            <select
              value={pathogenFilter}
              onChange={(e) => setPathogenFilter(e.target.value)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer text-xs w-full"
            >
              <option value="All">All Types</option>
              <option value="Fungal">Fungal</option>
              <option value="Bacterial">Bacterial</option>
              <option value="Viral">Viral</option>
              <option value="Pest/Insect">Pest / Insect</option>
              <option value="Healthy">Healthy Plant</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-400 text-[11px] font-semibold">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer text-xs w-full"
            >
              <option value="All">All Severity Levels</option>
              <option value="Mild (1-2)">Mild (Grades 1-2)</option>
              <option value="Moderate (3)">Moderate (Grade 3)</option>
              <option value="Critical (4-5)">Critical (Grades 4-5)</option>
            </select>
          </div>
        </div>

        {/* Diagnosis Cards Grid */}
        {filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredHistory.map((item) => {
              const isSelected = activeDiagnosis?.id === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-stone-50 rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
                      : 'border-stone-200 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Thumbnail & Meta Header */}
                    <div className="flex items-start gap-3">
                      {item.inputImage ? (
                        <img
                          src={item.inputImage}
                          alt={item.plantSpecies}
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-stone-200 flex items-center justify-center shrink-0 text-stone-500">
                          <Sprout className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {item.plantSpecies}
                        </h4>
                        <p className="text-xs text-emerald-800 font-semibold truncate">
                          {item.diseaseOrPest.name}
                        </p>
                      </div>
                    </div>

                    {/* Badge Row */}
                    <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold border ${getSeverityBadgeClass(
                          item.diseaseOrPest.severityScore
                        )}`}
                      >
                        Grade {item.diseaseOrPest.severityScore}/5
                      </span>
                      <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                        {item.diseaseOrPest.pathogenType}
                      </span>
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-medium">
                        {item.confidence}% Conf.
                      </span>
                    </div>

                    {/* Summary Snippet */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {item.assessmentSummary}
                    </p>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDiagnosis(item);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Details</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectDiagnosis(item);
                          onOpenPrint();
                        }}
                        className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition cursor-pointer"
                        title="Print Advisory Slip"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteSingle(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-semibold text-stone-600">
              {historyList.length === 0
                ? 'No diagnoses saved yet. Run your first leaf scan on the Dashboard!'
                : 'No diagnostic records match your current search and filter criteria.'}
            </p>
            {historyList.length === 0 && (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                Go to Dashboard Scanner →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
