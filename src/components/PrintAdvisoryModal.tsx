import React from 'react';
import { PlantDiagnosis } from '../types';
import { Printer, X, Download, Share2, Check, AlertTriangle, ShieldCheck, Sprout } from 'lucide-react';

interface PrintAdvisoryModalProps {
  diagnosis: PlantDiagnosis;
  isOpen: boolean;
  onClose: () => void;
  region: string;
}

export const PrintAdvisoryModal: React.FC<PrintAdvisoryModalProps> = ({
  diagnosis,
  isOpen,
  onClose,
  region,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🌾 *Krishi-Sight Plant Pathology Advisory Report*
*Crop:* ${diagnosis.plantSpecies}
*Condition:* ${diagnosis.diseaseOrPest.name} (${diagnosis.diseaseOrPest.pathogenType})
*Severity:* ${diagnosis.diseaseOrPest.severityScore}/5 (${diagnosis.diseaseOrPest.severityLabel})

*Primary Organic Remedies:*
${diagnosis.organicRemedies.map((r, i) => `${i + 1}. *${r.name}*: ${r.applicationSchedule}`).join('\n')}

*Safety Warnings:*
${diagnosis.safetyWarnings.map((w) => `• ${w}`).join('\n')}

_Generated via Krishi-Sight APAC Agronomy AI Engine_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-300 flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Modal Action Header */}
        <div className="bg-emerald-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">Smallholder Farmer Advisory Slip</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs px-3 py-1.5 rounded-lg border border-emerald-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Share report on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Print Advisory Slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Advisory Body */}
        <div id="printable-advisory" className="p-6 overflow-y-auto space-y-5 text-stone-800 text-xs">
          {/* Header Banner */}
          <div className="border-b-2 border-emerald-900 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl font-extrabold text-emerald-950 tracking-tight">
                KRISHI-SIGHT CROP HEALTH ADVISORY
              </h1>
              <p className="text-xs text-stone-600 font-medium">
                APAC Agricultural Pathology &amp; Smallholder Disease Extension Service
              </p>
            </div>
            <div className="text-right text-[11px] text-stone-500">
              <div>
                <strong>Report Ref:</strong> {diagnosis.id}
              </div>
              <div>
                <strong>Date:</strong> {new Date(diagnosis.timestamp).toLocaleDateString()} | {region}
              </div>
            </div>
          </div>

          {/* Plant & Diagnosis Overview Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Crop Species</span>
              <span className="font-bold text-stone-900 text-xs">{diagnosis.plantSpecies}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Identified Condition</span>
              <span className="font-bold text-rose-700 text-xs">{diagnosis.diseaseOrPest.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Pathogen Type</span>
              <span className="font-bold text-stone-900 text-xs">{diagnosis.diseaseOrPest.pathogenType}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Severity Score</span>
              <span className="font-bold text-amber-700 text-xs">
                Grade {diagnosis.diseaseOrPest.severityScore} of 5 ({diagnosis.diseaseOrPest.severityLabel})
              </span>
            </div>
          </div>

          {/* Assessment Summary */}
          <div>
            <h4 className="font-bold text-stone-900 text-xs mb-1 uppercase text-emerald-900 tracking-wider">
              Agronomic Field Assessment
            </h4>
            <p className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 text-stone-800 leading-relaxed">
              {diagnosis.assessmentSummary}
            </p>
          </div>

          {/* Organic Treatments */}
          <div>
            <h4 className="font-bold text-stone-900 text-xs mb-2 uppercase text-emerald-900 tracking-wider">
              Recommended Organic &amp; Low-Cost Remedies
            </h4>
            <div className="space-y-2">
              {diagnosis.organicRemedies.map((remedy, idx) => (
                <div key={idx} className="border border-stone-200 p-2.5 rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-stone-900 font-bold">
                      {idx + 1}. {remedy.name}
                    </strong>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                      Cost: {remedy.estimatedCostRating}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 mb-1">
                    <strong>Materials:</strong> {remedy.materialsNeeded.join(', ')}
                  </div>
                  <div className="text-[11px] text-stone-700 mb-1">
                    <strong>Preparation:</strong> {remedy.preparationMethod}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    <strong>Schedule:</strong> {remedy.applicationSchedule}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chemical Control (if any) */}
          {diagnosis.chemicalControls && diagnosis.chemicalControls.length > 0 && (
            <div>
              <h4 className="font-bold text-stone-900 text-xs mb-2 uppercase text-stone-700 tracking-wider">
                Emergency Chemical Control
              </h4>
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-stone-100 font-bold text-stone-700 border-b border-stone-200">
                    <tr>
                      <th className="p-2">Chemical Product</th>
                      <th className="p-2">Dosage</th>
                      <th className="p-2">Waiting Period (PHI)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {diagnosis.chemicalControls.map((c, i) => (
                      <tr key={i}>
                        <td className="p-2 font-medium">{c.name}</td>
                        <td className="p-2 font-semibold text-amber-900">{c.dosage}</td>
                        <td className="p-2 font-bold text-rose-700">{c.waitingPeriodDays} Days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Safety Warnings & Prevention */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200">
            <div>
              <h5 className="font-bold text-rose-900 text-[11px] uppercase mb-1">
                Health &amp; Field Safety Rules
              </h5>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-700">
                {diagnosis.safetyWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-emerald-900 text-[11px] uppercase mb-1">
                Prevention &amp; Cultural Hygiene
              </h5>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-700">
                {diagnosis.preventiveMeasures.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-3 border-t border-stone-200 text-[10px] text-stone-500 text-center">
            Advisory generated using Krishi-Sight Agronomy AI. For critical epidemic outbreaks, consult your local Krishi Vigyan Kendra (KVK) or government agricultural extension office.
          </div>
        </div>
      </div>
    </div>
  );
};
