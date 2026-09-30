import React from 'react';
import { OrganicRemedy } from '../types';
import { Leaf, Check, DollarSign, Clock, ShieldCheck, Sparkles } from 'lucide-react';

interface OrganicRemediesViewProps {
  remedies: OrganicRemedy[];
}

export const OrganicRemediesView: React.FC<OrganicRemediesViewProps> = ({ remedies }) => {
  if (!remedies || remedies.length === 0) {
    return (
      <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200 text-xs text-emerald-900">
        No specific organic treatment required for this condition. Maintain standard crop hygiene and aeration.
      </div>
    );
  }

  const getCostBadge = (rating: string) => {
    switch (rating) {
      case 'Very Low / Free':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Low':
        return 'bg-lime-100 text-lime-900 border-lime-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-stone-100 text-stone-900 border-stone-300';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <span>Primary Low-Cost Organic Remedies</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Eco-Friendly &amp; Smallholder Preferred
              </span>
            </h3>
            <p className="text-xs text-emerald-800/80">
              Prepared from accessible on-farm organic materials to protect soil microbiome and beneficial insects
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {remedies.map((remedy, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-emerald-200/90 shadow-xs hover:shadow-sm transition p-4 flex flex-col justify-between gap-3 relative overflow-hidden"
          >
            {/* Accent top border */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-lime-400" />

            <div>
              {/* Title & Cost rating */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{remedy.name}</span>
                </h4>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getCostBadge(
                    remedy.estimatedCostRating
                  )}`}
                >
                  {remedy.estimatedCostRating}
                </span>
              </div>

              {/* Rationale / Why it works */}
              <p className="text-xs text-stone-600 mb-3 bg-stone-50 p-2 rounded-lg border border-stone-100 leading-relaxed">
                <span className="font-semibold text-emerald-900">Why it works: </span>
                {remedy.benefitRationale}
              </p>

              {/* Materials Needed Checklist */}
              <div className="mb-3">
                <span className="text-[11px] font-bold text-stone-700 block mb-1.5">
                  Farm Materials &amp; Ingredients:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {remedy.materialsNeeded.map((mat, mIdx) => (
                    <span
                      key={mIdx}
                      className="bg-emerald-50/80 text-emerald-900 border border-emerald-200/60 text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 font-medium"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preparation Steps */}
              <div className="mb-2">
                <span className="text-[11px] font-bold text-stone-700 block mb-1">
                  Preparation Method:
                </span>
                <p className="text-xs text-stone-700 leading-relaxed bg-emerald-50/30 p-2 rounded-lg border border-emerald-100">
                  {remedy.preparationMethod}
                </p>
              </div>
            </div>

            {/* Application Schedule */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-900 bg-emerald-50/40 p-2 rounded-lg font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-[11px] font-semibold">Spray Schedule:</span>
              </div>
              <span className="text-[11px] text-stone-800 text-right">{remedy.applicationSchedule}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
