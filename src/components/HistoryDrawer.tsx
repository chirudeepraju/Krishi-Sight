import React from 'react';
import { PlantDiagnosis } from '../types';
import { History, X, Trash2, ArrowRight, Calendar, Sprout, AlertCircle } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: PlantDiagnosis[];
  onSelectDiagnosis: (diagnosis: PlantDiagnosis) => void;
  onClearHistory: () => void;
  onDeleteSingle: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyList,
  onSelectDiagnosis,
  onClearHistory,
  onDeleteSingle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Past Field Diagnoses</h3>
              <p className="text-[11px] text-emerald-200">
                {historyList.length} saved diagnostic records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {historyList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <Sprout className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-700 mb-1">No Past Diagnoses</h4>
              <p className="text-xs text-stone-500">
                Diagnose a crop leaf or test with a sample case above to save records locally.
              </p>
            </div>
          ) : (
            historyList.map((item) => (
              <div
                key={item.id}
                className="bg-stone-50 hover:bg-emerald-50/40 border border-stone-200 hover:border-emerald-300 rounded-xl p-3 flex flex-col gap-2 transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {item.inputImage ? (
                      <img
                        src={item.inputImage}
                        alt={item.plantSpecies}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover border border-stone-300 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        🌱
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition">
                        {item.plantSpecies}
                      </h4>
                      <p className="text-[11px] font-semibold text-rose-700">
                        {item.diseaseOrPest?.name || 'Unidentified'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSingle(item.id);
                    }}
                    className="text-stone-400 hover:text-rose-600 p-1 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1.5 border-t border-stone-200/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectDiagnosis(item);
                      onClose();
                    }}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Actions */}
        {historyList.length > 0 && (
          <div className="p-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1.5 p-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
