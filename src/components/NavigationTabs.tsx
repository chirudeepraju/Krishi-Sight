import React from 'react';
import { AppPage } from '../types';
import { LayoutDashboard, Mic, Database, Sparkles, Sprout, FileText } from 'lucide-react';

interface NavigationTabsProps {
  currentPage: AppPage;
  onPageChange: (page: AppPage) => void;
  savedDiagnosisCount: number;
  hasActiveDiagnosis: boolean;
  voiceNotesCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentPage,
  onPageChange,
  savedDiagnosisCount,
  hasActiveDiagnosis,
  voiceNotesCount,
}) => {
  const tabs: Array<{
    id: AppPage;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    highlight?: boolean;
  }> = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Overview & Quick Scan',
      icon: LayoutDashboard,
    },
    {
      id: 'voice-notes',
      title: 'Farmer Voice & Field Notes',
      subtitle: 'Speech Transcriber & Journal',
      icon: Mic,
      badge: voiceNotesCount > 0 ? voiceNotesCount : undefined,
    },
    {
      id: 'diagnosis-data',
      title: 'Diagnosis Data',
      subtitle: hasActiveDiagnosis ? 'Active Report & History' : 'Pathology Repository',
      icon: Database,
      badge: savedDiagnosisCount > 0 ? savedDiagnosisCount : (hasActiveDiagnosis ? 'New' : undefined),
      highlight: hasActiveDiagnosis,
    },
  ];

  return (
    <nav
      aria-label="Main Application Navigation"
      className="bg-white border-b border-stone-200 sticky top-[61px] z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPage === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onPageChange(tab.id)}
                className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-xl text-left transition-all duration-150 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-900 text-white shadow-xs font-semibold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100 font-medium'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-emerald-800 text-emerald-300'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex flex-col pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm tracking-tight leading-none whitespace-nowrap">
                      {tab.title}
                    </span>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-amber-400 text-emerald-950'
                            : 'bg-stone-200 text-stone-800'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 hidden md:block whitespace-nowrap ${
                      isActive ? 'text-emerald-200' : 'text-stone-400'
                    }`}
                  >
                    {tab.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
