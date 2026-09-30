import React from 'react';
import { SAMPLE_CROP_CASES } from '../sampleCrops';
import { SampleCropCase } from '../types';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';

interface SampleCropsGalleryProps {
  onSelectSample: (sample: SampleCropCase) => void;
  disabled?: boolean;
}

export const SampleCropsGallery: React.FC<SampleCropsGalleryProps> = ({
  onSelectSample,
  disabled = false,
}) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Fungal':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Bacterial':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Viral':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Pest/Insect':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'Healthy':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-900 border-stone-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            ⚡
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Verified APAC Crop Pathology Samples</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                1-Click Test
              </span>
            </h2>
            <p className="text-xs text-stone-500">
              Select any regional crop disease below to immediately test diagnostic pathology &amp; organic remedies
            </p>
          </div>
        </div>
      </div>

      {/* Grid of sample cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SAMPLE_CROP_CASES.map((sample) => (
          <div
            key={sample.id}
            onClick={() => !disabled && onSelectSample(sample)}
            className={`group flex flex-col rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50/40 hover:bg-white overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer ${
              disabled ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-[16/10] bg-stone-200 overflow-hidden">
              <img
                src={sample.imageUrl}
                alt={sample.disease}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-1.5 left-1.5">
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border backdrop-blur-md shadow-xs ${getBadgeColor(
                    sample.pathogenType
                  )}`}
                >
                  {sample.pathogenType}
                </span>
              </div>
              <div className="absolute bottom-1.5 right-1.5 bg-stone-950/80 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm">
                Sev {sample.severity}/5
              </div>
            </div>

            {/* Content */}
            <div className="p-2.5 flex flex-col justify-between flex-1 gap-1.5">
              <div>
                <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-emerald-700 transition">
                  {sample.disease}
                </h4>
                <p className="text-[10px] font-medium text-stone-600 line-clamp-1">
                  {sample.plant}
                </p>
              </div>

              <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Load Sample</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
