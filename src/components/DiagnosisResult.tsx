import React from 'react';
import { PlantDiagnosis } from '../types';
import { OrganicRemediesView } from './OrganicRemediesView';
import { ChemicalControlsView } from './ChemicalControlsView';
import { SafetyWarningsView } from './SafetyWarningsView';
import { FollowUpChat } from './FollowUpChat';
import {
  AlertTriangle,
  CheckCircle2,
  Share2,
  Printer,
  Copy,
  RotateCcw,
  CloudRain,
  Activity,
  ShieldAlert,
  Sprout,
  Info,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface DiagnosisResultProps {
  diagnosis: PlantDiagnosis;
  onReset: () => void;
  onOpenPrint: () => void;
  language: string;
  region: string;
}

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({
  diagnosis,
  onReset,
  onOpenPrint,
  language,
  region,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySummary = () => {
    const text = `Krishi-Sight Diagnosis:
Plant: ${diagnosis.plantSpecies}
Condition: ${diagnosis.diseaseOrPest.name} (${diagnosis.diseaseOrPest.pathogenType})
Severity: Grade ${diagnosis.diseaseOrPest.severityScore}/5 (${diagnosis.diseaseOrPest.severityLabel})
Summary: ${diagnosis.assessmentSummary}
Organic Remedies: ${diagnosis.organicRemedies.map((r) => r.name).join(', ')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `🌾 *Krishi-Sight Plant Pathology Report*
*Crop:* ${diagnosis.plantSpecies}
*Diagnosis:* ${diagnosis.diseaseOrPest.name}
*Severity:* ${diagnosis.diseaseOrPest.severityScore}/5 (${diagnosis.diseaseOrPest.severityLabel})
*Organic Remedy:* ${diagnosis.organicRemedies[0]?.name || 'Standard care'}
*Spray:* ${diagnosis.organicRemedies[0]?.applicationSchedule || 'Follow guidelines'}

_Krishi-Sight APAC Agronomy Engine_`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Color helpers for severity meter
  const getSeverityColor = (score: number) => {
    switch (score) {
      case 1:
        return 'bg-emerald-500 text-white';
      case 2:
        return 'bg-lime-500 text-white';
      case 3:
        return 'bg-amber-500 text-white';
      case 4:
        return 'bg-orange-500 text-white';
      case 5:
        return 'bg-rose-600 text-white';
      default:
        return 'bg-stone-500 text-white';
    }
  };

  const getSeverityBadgeColor = (score: number) => {
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

  const getPathogenBadgeColor = (type: string) => {
    switch (type) {
      case 'Fungal':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Bacterial':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Viral':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Pest/Insect':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'Nutritional Deficiency':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'Healthy':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-900 border-stone-300';
    }
  };

  // Case 1: Unclear / Non-plant specimen guardrail
  if (!diagnosis.isIdentifiable) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">
                Plant Sample Could Not Be Safely Identified
              </h2>
              <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                Retake Advised
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {diagnosis.unclearReason ||
                'The uploaded image is either blurry, out of focus, or does not clearly show an agricultural crop leaf or pest damage.'}
            </p>
          </div>
        </div>

        {/* Practical Field Guidance for Taking Better Photos */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            How to Take a High-Accuracy Diagnostic Photo:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700">
            <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col gap-1">
              <span className="font-bold text-emerald-800">1. Close-Up Leaf Surface</span>
              <p className="text-stone-500 text-[11px]">
                Hold camera 10–15 cm away from the spot, lesion, or insect.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col gap-1">
              <span className="font-bold text-emerald-800">2. Natural Daylight</span>
              <p className="text-stone-500 text-[11px]">
                Avoid harsh flash or deep shadows; shoot under morning/evening sky.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col gap-1">
              <span className="font-bold text-emerald-800">3. Leaf Margin &amp; Underside</span>
              <p className="text-stone-500 text-[11px]">
                Check underside for fungal powdery spores or sucking pests.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onReset}
            className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake or Upload New Photo</span>
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Successful Diagnostic Report
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Banner: Diagnosis Overview Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-4">
        {/* Action Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                  {diagnosis.plantSpecies}
                </h2>
                <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  {diagnosis.confidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium flex items-center flex-wrap gap-1.5 pt-0.5">
                <span>Verified Agricultural Pathology Report • {region}</span>
                {diagnosis.diagnosticEngine && (
                  <span className="text-[10px] text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                    Engine: {diagnosis.diagnosticEngine}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-medium cursor-pointer"
              title="Share via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-medium cursor-pointer"
              title="Copy Summary Text"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenPrint}
              className="bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-medium cursor-pointer"
              title="Print Advisory Slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Advisory Slip</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold cursor-pointer shadow-xs"
              title="Scan Another Leaf"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          </div>
        </div>

        {/* Core Disease & Severity Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Main Condition Block */}
          <div className="md:col-span-7 bg-stone-50/70 p-4 rounded-xl border border-stone-200 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-md font-bold border ${getPathogenBadgeColor(
                    diagnosis.diseaseOrPest.pathogenType
                  )}`}
                >
                  {diagnosis.diseaseOrPest.pathogenType}
                </span>
                {diagnosis.diseaseOrPest.scientificName && (
                  <span className="text-[11px] text-stone-500 italic">
                    ({diagnosis.diseaseOrPest.scientificName})
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-rose-950">
                {diagnosis.diseaseOrPest.name}
              </h3>

              <div className="mt-2 space-y-1">
                <span className="text-[11px] font-bold text-stone-600 block">
                  Observed Diagnostic Symptoms:
                </span>
                <ul className="space-y-1 text-xs text-stone-700">
                  {diagnosis.diseaseOrPest.symptomsObserved.map((symp, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{symp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/80 flex items-center gap-2 text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700">Affected Plant Parts:</span>
              <div className="flex flex-wrap gap-1">
                {diagnosis.diseaseOrPest.affectedPlantParts.map((part, pIdx) => (
                  <span key={pIdx} className="bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-700 font-medium">
                    {part}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Severity Meter Block */}
          <div className="md:col-span-5 bg-stone-50/70 p-4 rounded-xl border border-stone-200 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  Severity Assessment
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getSeverityBadgeColor(
                    diagnosis.diseaseOrPest.severityScore
                  )}`}
                >
                  Grade {diagnosis.diseaseOrPest.severityScore} of 5
                </span>
              </div>

              {/* 5-Step Segmented Bar */}
              <div className="grid grid-cols-5 gap-1.5 my-3">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const isActive = lvl <= diagnosis.diseaseOrPest.severityScore;
                  return (
                    <div key={lvl} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-2.5 w-full rounded-full transition-all duration-300 ${
                          isActive ? getSeverityColor(lvl) : 'bg-stone-200'
                        }`}
                      />
                      <span
                        className={`text-[9px] font-bold ${
                          lvl === diagnosis.diseaseOrPest.severityScore ? 'text-stone-900 font-extrabold' : 'text-stone-400'
                        }`}
                      >
                        Lv.{lvl}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-stone-200 text-xs">
                <span className="font-bold text-stone-800 block mb-0.5">
                  {diagnosis.diseaseOrPest.severityLabel}
                </span>
                <p className="text-[11px] text-stone-500 leading-normal">
                  {diagnosis.diseaseOrPest.severityScore <= 2
                    ? 'Early-stage onset. 100% manageable with low-cost organic remedies before foliar spread.'
                    : diagnosis.diseaseOrPest.severityScore === 3
                    ? 'Active foliar spread. Immediate organic spraying and pruning of lower canopy required.'
                    : 'Critical infection level. Isolate affected zone, apply targeted organic/chemical control immediately.'}
                </p>
              </div>
            </div>

            {/* Regional Monsoon & Weather Alert */}
            <div className="pt-2 border-t border-stone-200/80 flex items-start gap-2 text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
              <CloudRain className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[11px] block">
                  Monsoon Weather Impact ({diagnosis.apacRegionalAdvisory.spreadRisk} Spread Risk)
                </span>
                <p className="text-[11px] text-amber-800">
                  {diagnosis.apacRegionalAdvisory.weatherRiskFactor}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Summary in Supportive Farmer Language */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 text-xs sm:text-sm text-emerald-950 leading-relaxed">
          <div className="flex items-center gap-2 mb-1 font-bold text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Krishi-Sight Expert Agronomist Assessment:</span>
          </div>
          <p>{diagnosis.assessmentSummary}</p>

          {/* Local Language Summary if available */}
          {diagnosis.localLanguageSummary && (
            <div className="mt-3 pt-3 border-t border-emerald-200/80 text-xs text-stone-800 bg-white/70 p-3 rounded-lg border border-emerald-100">
              <span className="font-bold text-emerald-900 block mb-1">
                🌾 क्षेत्रीय भाषा सारांश / Regional Summary:
              </span>
              <p className="leading-relaxed font-medium">{diagnosis.localLanguageSummary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Module 1: Organic & Low-Cost Remedies (Priority) */}
      <OrganicRemediesView remedies={diagnosis.organicRemedies} />

      {/* Module 2: Chemical Controls (Secondary / Threshold) */}
      <ChemicalControlsView
        controls={diagnosis.chemicalControls}
        severityScore={diagnosis.diseaseOrPest.severityScore}
      />

      {/* Module 3: Farmer Safety & Preventive Measures */}
      <SafetyWarningsView
        warnings={diagnosis.safetyWarnings}
        preventiveMeasures={diagnosis.preventiveMeasures}
      />

      {/* Module 4: Live Follow-Up Agronomist Chat */}
      <FollowUpChat diagnosis={diagnosis} language={language} />
    </div>
  );
};
