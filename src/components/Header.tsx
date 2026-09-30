import React from 'react';
import { Sprout, ShieldCheck, History, Globe, MapPin, Printer } from 'lucide-react';
import { APAC_LANGUAGES, APAC_REGIONS } from '../languages';

interface HeaderProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  currentRegion: string;
  onRegionChange: (region: string) => void;
  historyCount: number;
  onOpenHistory: () => void;
  hasActiveDiagnosis: boolean;
  onOpenPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  currentRegion,
  onRegionChange,
  historyCount,
  onOpenHistory,
  hasActiveDiagnosis,
  onOpenPrint,
}) => {
  return (
    <header className="bg-emerald-900 text-white border-b border-emerald-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-amber-500 p-0.5 shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    Krishi-Sight
                  </h1>
                  <span className="bg-emerald-800/80 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-700 font-medium">
                    APAC Agronomy AI
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 font-medium">
                  Smallholder Plant Pathology & Eco-Friendly Crop Doctor
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={onOpenHistory}
                className="relative p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition"
                title="Diagnosis History"
              >
                <History className="w-5 h-5" />
                {historyCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-emerald-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Controls: Region, Language & Tools */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs">
            {/* Region Selector */}
            <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-700/60">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                aria-label="Select farming region"
                value={currentRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="bg-transparent text-emerald-100 font-medium focus:outline-none cursor-pointer text-xs"
              >
                {APAC_REGIONS.map((r) => (
                  <option key={r.code} value={r.name} className="bg-emerald-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-700/60">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                aria-label="Select diagnostic language"
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent text-emerald-100 font-medium focus:outline-none cursor-pointer text-xs"
              >
                {APAC_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-emerald-900 text-white">
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Print Advisory Button (if diagnosis ready) */}
            {hasActiveDiagnosis && (
              <button
                type="button"
                onClick={onOpenPrint}
                className="hidden sm:flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg border border-emerald-600 transition font-medium cursor-pointer"
                title="Print Advisory Report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Farmer Advisory Slip</span>
              </button>
            )}

            {/* Desktop History Button */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="hidden md:flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg border border-emerald-700 transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-emerald-300" />
              <span>Saved Records</span>
              {historyCount > 0 && (
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
