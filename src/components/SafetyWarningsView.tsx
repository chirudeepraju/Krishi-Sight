import React from 'react';
import { ShieldAlert, AlertOctagon, Droplets, Wind, Eye, Users, Trees } from 'lucide-react';

interface SafetyWarningsViewProps {
  warnings: string[];
  preventiveMeasures: string[];
}

export const SafetyWarningsView: React.FC<SafetyWarningsViewProps> = ({
  warnings,
  preventiveMeasures,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Farmer Health & Application Safety Shield */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-950">
                Farmer Health &amp; Environment Safety
              </h4>
              <p className="text-[11px] text-rose-800/80">Translated into simple, direct safety rules</p>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {warnings.map((warn, idx) => (
              <div
                key={idx}
                className="bg-white/80 border border-rose-200/80 rounded-lg p-2.5 flex items-start gap-2 text-xs text-rose-950"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{warn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Safety Rule Badges */}
        <div className="pt-2 border-t border-rose-200/80 flex flex-wrap gap-2 text-[10px] font-semibold text-rose-800">
          <span className="bg-rose-100/80 px-2 py-0.5 rounded flex items-center gap-1">
            <Eye className="w-3 h-3 text-rose-600" /> Wear Mask &amp; Eye Cover
          </span>
          <span className="bg-rose-100/80 px-2 py-0.5 rounded flex items-center gap-1">
            <Wind className="w-3 h-3 text-rose-600" /> Spray with Back to Wind
          </span>
          <span className="bg-rose-100/80 px-2 py-0.5 rounded flex items-center gap-1">
            <Droplets className="w-3 h-3 text-rose-600" /> Protect Drinking Wells
          </span>
        </div>
      </div>

      {/* Good Agricultural Practices & Preventive Measures */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Trees className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                Long-Term Agronomic Prevention
              </h4>
              <p className="text-[11px] text-emerald-800/80">
                Cultural practices to prevent reinfection next season
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {preventiveMeasures.map((prev, idx) => (
              <div
                key={idx}
                className="bg-white/80 border border-emerald-200/80 rounded-lg p-2.5 flex items-start gap-2 text-xs text-emerald-950"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="leading-relaxed font-medium">{prev}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-800 font-medium flex items-center justify-between">
          <span>Promotes natural predator biodiversity</span>
          <span className="font-bold text-emerald-900">Zero-Loss Farming</span>
        </div>
      </div>
    </div>
  );
};
