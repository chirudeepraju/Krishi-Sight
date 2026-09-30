import React from 'react';
import { ChemicalControl } from '../types';
import { FlaskConical, AlertTriangle, Clock, Calendar, CheckCircle } from 'lucide-react';

interface ChemicalControlsViewProps {
  controls: ChemicalControl[];
  severityScore: number;
}

export const ChemicalControlsView: React.FC<ChemicalControlsViewProps> = ({
  controls,
  severityScore,
}) => {
  if (!controls || controls.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <span>Standard Accessible Chemical Controls</span>
              {severityScore >= 3 ? (
                <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                  Targeted Intervention
                </span>
              ) : (
                <span className="text-[10px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-full border border-stone-200">
                  Secondary / Emergency Option
                </span>
              )}
            </h3>
            <p className="text-xs text-stone-500">
              Only use if organic methods fail or disease severity exceeds economic threshold
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-xs text-stone-700">
          <thead className="bg-stone-50 text-[11px] font-bold text-stone-600 uppercase border-b border-stone-200">
            <tr>
              <th className="py-2.5 px-3">Formulation &amp; Active Ingredient</th>
              <th className="py-2.5 px-3">Dosage / Acre or Liter</th>
              <th className="py-2.5 px-3">Pre-Harvest Interval (PHI)</th>
              <th className="py-2.5 px-3">Application Method &amp; Target Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {controls.map((item, idx) => (
              <tr key={idx} className="hover:bg-stone-50/60 transition">
                <td className="py-3 px-3">
                  <div className="font-bold text-stone-900 text-xs">{item.name}</div>
                  {item.activeIngredient && (
                    <div className="text-[11px] text-stone-500 font-mono">
                      a.i.: {item.activeIngredient}
                    </div>
                  )}
                </td>
                <td className="py-3 px-3">
                  <span className="bg-amber-50 text-amber-900 font-semibold px-2 py-1 rounded-md border border-amber-200 inline-block">
                    {item.dosage}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 font-semibold text-rose-700">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.waitingPeriodDays} Days Waiting</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Do not harvest before this</span>
                </td>
                <td className="py-3 px-3">
                  <div className="text-xs font-medium text-stone-800">{item.applicationMethod}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    Target: {item.targetPestStage}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Agronomist Rule:</strong> Always rotate chemical groups with different Modes of Action (MoA) to prevent fungicide and insecticide resistance in field crops.
        </span>
      </div>
    </div>
  );
};
