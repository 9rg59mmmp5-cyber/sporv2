
import React from 'react';
import { X, Clock, Dumbbell, Repeat, Trophy, Calendar, FileText, ChevronRight } from 'lucide-react';
import { WorkoutLog, WorkoutDay, ExerciseSet } from '../types';

interface Props {
  log: WorkoutLog;
  program: WorkoutDay[];
  onClose: () => void;
}

export const HistoryDetailModal: React.FC<Props> = ({ log, program, onClose }) => {
  const dayName = program.find(d => d.id === log.dayId)?.name || 'Antrenman';
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0dk';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}sa ${m}dk` : `${m}dk`;
  };

  const getExerciseName = (exId: string) => {
    for (const day of program) {
      const ex = day.exercises.find(e => e.id === exId);
      if (ex) return ex.name;
    }
    return 'Bilinmeyen Hareket';
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="pt-safe px-6 pb-4 border-b border-zinc-900 flex items-center justify-between bg-black/50 sticky top-0 z-10">
        <div>
          <h2 className="text-white font-black text-xl">{dayName}</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
            {new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 active:scale-90 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24 space-y-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 flex flex-col items-center gap-1">
            <Clock size={16} className="text-blue-500" />
            <span className="text-white font-bold text-base">{formatDuration(log.duration)}</span>
            <span className="text-[9px] text-zinc-500 uppercase font-black">Süre</span>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 flex flex-col items-center gap-1">
            <Dumbbell size={16} className="text-emerald-500" />
            <span className="text-white font-bold text-base">{(log.totalVolume || 0).toLocaleString()}</span>
            <span className="text-[9px] text-zinc-500 uppercase font-black">Hacim</span>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 flex flex-col items-center gap-1">
            <Repeat size={16} className="text-purple-500" />
            <span className="text-white font-bold text-base">{log.totalSets || 0}</span>
            <span className="text-[9px] text-zinc-500 uppercase font-black">Set</span>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-6">
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] px-1">Hareket Detayları</h3>
          {Object.entries(log.exercises).map(([exId, setsData]) => {
            const sets = setsData as ExerciseSet[];
            const isPR = log.prs?.includes(exId);
            return (
              <div key={exId} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-bold text-sm">{getExerciseName(exId)}</h4>
                    {isPR && <Trophy size={14} className="text-yellow-500" />}
                  </div>
                  <span className="text-[10px] font-black text-zinc-600 uppercase">{sets.length} SET</span>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-600 font-black uppercase tracking-tighter">
                        <th className="py-3 px-4 text-left w-12">#</th>
                        <th className="py-3 px-4 text-center">Ağırlık</th>
                        <th className="py-3 px-4 text-center">Tekrar</th>
                        <th className="py-3 px-4 text-right">Hacim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sets.map((set, idx) => (
                        <tr key={idx} className={`${idx !== sets.length - 1 ? 'border-b border-zinc-900/50' : ''} text-zinc-300`}>
                          <td className="py-3 px-4 text-zinc-600 font-bold">{idx + 1}</td>
                          <td className="py-3 px-4 text-center font-bold text-white">{set.weight} <span className="text-[10px] text-zinc-600">kg</span></td>
                          <td className="py-3 px-4 text-center font-bold">{set.reps}</td>
                          <td className="py-3 px-4 text-right text-zinc-500 font-medium">{(set.weight * set.reps).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
