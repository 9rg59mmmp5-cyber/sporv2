
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, User, Clock, Trophy, Timer, Zap, Activity, Dumbbell, PowerOff, Package, ChevronRight, AlertTriangle, Check, X, Info, Layers, ChevronUp, ChevronDown, Coffee, PenTool, Plus } from 'lucide-react';
import { getWorkoutLogs, getUserSettings, saveUserSettings, saveProgram } from '../services/storageService';
import { UserSettings, WorkoutDay } from '../types';
import { PRESET_PROGRAMS, PresetProgram } from '../constants';
import { triggerHaptic } from '../utils/audio';

interface Props {
  onProgramChange?: (newProgram: WorkoutDay[]) => void;
  onCreateNew?: () => void;
}

export const ProfileView: React.FC<Props> = ({ onProgramChange, onCreateNew }) => {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetProgram | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  
  useEffect(() => {
    const userSettings = getUserSettings();
    setSettings(userSettings);

    const logs = getWorkoutLogs();
    const dates = new Set(logs.map(l => l.date));
    setWorkoutDates(dates);
  }, []);

  const groupedPrograms = useMemo<Record<string, PresetProgram[]>>(() => {
    return {
      'Başlangıç': PRESET_PROGRAMS.filter(p => p.level === 'Başlangıç'),
      'Orta': PRESET_PROGRAMS.filter(p => p.level === 'Orta'),
      'İleri': PRESET_PROGRAMS.filter(p => p.level === 'İleri')
    };
  }, []);

  const handleSaveSettings = () => {
    saveUserSettings(settings);
    setEditMode(false);
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveUserSettings(newSettings);
  };

  const applyPresetProgram = () => {
    if (!selectedPreset) return;
    triggerHaptic(100);

    const uniqueProgram: WorkoutDay[] = selectedPreset.program.map(day => ({
        ...day,
        id: `day-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        exercises: day.exercises.map(ex => ({
            ...ex,
            id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
    }));

    saveProgram(uniqueProgram);
    if (onProgramChange) {
        onProgramChange(uniqueProgram);
    }
    setShowConfirmModal(false);
    setSelectedPreset(null);
    alert('Program başarıyla yüklendi! Ana ekrandaki "Düzenle" butonunu kullanarak programı kişiselleştirebilirsiniz.');
  };

  const handleCreateNewConfirm = () => {
      if (onCreateNew) {
          onCreateNew();
      }
      setShowCreateConfirm(false);
  };

  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isWorkoutDay = workoutDates.has(dateStr);
      const isToday = d === today.getDate();

      days.push(
        <div key={d} className="aspect-square flex items-center justify-center relative">
          <div 
            className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all
              ${isWorkoutDay ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-zinc-400'}
              ${isToday && !isWorkoutDay ? 'border border-primary text-primary' : ''}
            `}
          >
            {d}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="pt-14 px-5 pb-24 space-y-6 animate-in fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Ayarlar</h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Uygulama Tercihleri</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-yellow-500" />
            <span className="text-xs text-zinc-400 uppercase">Toplam</span>
          </div>
          <p className="text-xl font-bold text-white">{workoutDates.size}</p>
          <p className="text-xs text-zinc-500">Antrenman</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
            <CalendarIcon size={18} className="text-emerald-500" />
            <span className="text-xs text-zinc-400 uppercase">Bu Ay</span>
          </div>
          <p className="text-xl font-bold text-white">
            {[...workoutDates].filter(d => d.startsWith(new Date().toISOString().slice(0,7))).length}
          </p>
          <p className="text-xs text-zinc-500">Gün</p>
        </div>
      </div>

      {/* Kompakt Dinlenme Ayarları */}
      <div className="bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-800 shadow-lg">
        <h3 className="text-white font-bold mb-5 flex items-center gap-2">
          <Timer size={18} className="text-primary" />
          Dinlenme Ayarları
        </h3>
        
        <div className="space-y-4">
          {/* Set Arası Dinlenme Row */}
          <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${settings.restBetweenSets ? 'bg-primary/10 text-primary' : 'bg-zinc-800 text-zinc-500'}`}>
                <Activity size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Set Arası</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Sayaç Tetikleme</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {settings.restBetweenSets ? (
                <div className="flex items-center gap-1 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                  <input 
                    type="number"
                    inputMode="numeric"
                    value={settings.restBetweenSets}
                    onChange={(e) => updateSetting('restBetweenSets', parseInt(e.target.value) || 0)}
                    className="w-10 bg-transparent text-center text-xs font-bold text-white outline-none"
                  />
                  <span className="text-[10px] font-bold text-zinc-600">sn</span>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-zinc-600 uppercase">Kapalı</span>
              )}
              <button 
                onClick={() => updateSetting('restBetweenSets', settings.restBetweenSets ? 0 : 90)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.restBetweenSets ? 'bg-primary' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.restBetweenSets ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Hareket Arası Dinlenme Row */}
          <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${settings.restBetweenExercises ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                <Layers size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Hareket Arası</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Sayaç Tetikleme</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {settings.restBetweenExercises ? (
                <div className="flex items-center gap-1 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                  <input 
                    type="number"
                    inputMode="numeric"
                    value={settings.restBetweenExercises}
                    onChange={(e) => updateSetting('restBetweenExercises', parseInt(e.target.value) || 0)}
                    className="w-10 bg-transparent text-center text-xs font-bold text-white outline-none"
                  />
                  <span className="text-[10px] font-bold text-zinc-600">sn</span>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-zinc-600 uppercase">Kapalı</span>
              )}
              <button 
                onClick={() => updateSetting('restBetweenExercises', settings.restBetweenExercises ? 0 : 120)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.restBetweenExercises ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.restBetweenExercises ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hazır Program Paketleri */}
      <div className="bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-800 shadow-lg space-y-8">
        <div className="flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
            <Package size={18} className="text-primary" />
            Antrenman Paketleri
            </h3>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-black/40 px-2 py-1 rounded-lg">Kütüphane</span>
        </div>

        <button 
            onClick={() => setShowCreateConfirm(true)}
            className="w-full bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 border-dashed p-5 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all hover:border-primary/50"
        >
            <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <Plus size={20} />
                 </div>
                 <div className="text-left">
                     <span className="text-white font-bold text-sm block">Sıfırdan Oluştur</span>
                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">KENDİ PROGRAMINI YAZ</span>
                 </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
            </div>
        </button>

        {Object.entries(groupedPrograms).map(([level, programs]) => (
            <div key={level} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                        level === 'Başlangıç' ? 'bg-emerald-500' :
                        level === 'Orta' ? 'bg-primary' : 'bg-red-500'
                    }`}></div>
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{level} Seviyesi</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {(programs as PresetProgram[]).map((preset) => (
                        <button 
                            key={preset.id}
                            onClick={() => { triggerHaptic(50); setSelectedPreset(preset); }}
                            className="w-full bg-black/40 border border-zinc-800/60 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="text-left flex-1 pr-4">
                                <span className="text-white font-bold text-sm block mb-1">{preset.name}</span>
                                <div className="flex gap-2 items-center">
                                    <span className="text-[9px] font-bold text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <Layers size={10} /> {preset.daysCount} Gün Döngüsü
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-zinc-700 group-hover:text-primary transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-lg">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <CalendarIcon size={18} className="text-primary" />
          Antrenman Takvimi
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
            <div key={d} className="text-[10px] text-slate-500 uppercase font-bold">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
      </div>

      {/* PRESET DETAY MODALI */}
      {selectedPreset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex flex-col justify-end animate-in fade-in duration-300">
          <div className="bg-zinc-900 w-full max-h-[90vh] rounded-t-[3rem] border-t border-zinc-800 overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-500">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    selectedPreset.level === 'Başlangıç' ? 'bg-emerald-500/10 text-emerald-500' :
                    selectedPreset.level === 'Orta' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
                }`}>
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">{selectedPreset.name}</h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{selectedPreset.level} SEVİYESİ • {selectedPreset.daysCount} GÜN DÖNGÜSÜ</p>
                </div>
              </div>
              <button onClick={() => setSelectedPreset(null)} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 active:scale-90 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
              <div className="bg-black/20 p-4 rounded-2xl border border-zinc-800 text-zinc-300 text-xs leading-relaxed italic">
                "{selectedPreset.description}"
              </div>

              {selectedPreset.program.map((day, idx) => (
                <div key={day.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black ${day.isRestDay ? 'bg-zinc-800/50 border-zinc-800 text-zinc-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                      {idx + 1}
                    </span>
                    <h4 className={`${day.isRestDay ? 'text-zinc-500 italic' : 'text-white'} font-bold text-base`}>{day.name}</h4>
                  </div>
                  {!day.isRestDay && (
                      <div className="grid grid-cols-1 gap-2 pl-11">
                        {day.exercises.map((ex) => (
                          <div key={ex.id} className="bg-black/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between group">
                            <div className="flex-1">
                              <p className="text-zinc-200 text-sm font-bold group-hover:text-primary transition-colors">{ex.name}</p>
                              <div className="flex gap-3 mt-2 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                <span className="bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">{ex.targetSets}</span>
                                <span className="bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">{ex.targetWeight}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                  )}
                  {day.isRestDay && (
                       <div className="pl-11">
                           <div className="bg-zinc-900/30 border border-dashed border-zinc-800 p-3 rounded-2xl flex items-center gap-3 text-zinc-600">
                               <Coffee size={16} />
                               <span className="text-xs font-bold">Vücut Toparlanma Süreci</span>
                           </div>
                       </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-zinc-900 border-t border-zinc-800 pb-10">
              <button 
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-5 bg-primary hover:bg-blue-600 text-white font-black text-lg rounded-[2rem] shadow-2xl shadow-primary/20 active:scale-[0.98] transition-all"
              >
                BU PROGRAMI YÜKLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onay Modalı - PRESET İÇİN */}
      {showConfirmModal && selectedPreset && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={40} />
                    </div>
                    <h3 className="text-white font-black text-xl mb-3">Emin misiniz?</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                        <span className="text-white font-bold">"{selectedPreset.name}"</span> paketini yüklemek, şu anki tüm antrenman planınızı tamamen silecektir.
                    </p>
                </div>
                <div className="grid grid-cols-2 border-t border-zinc-800">
                    <button onClick={() => setShowConfirmModal(false)} className="py-6 text-zinc-500 font-bold border-r border-zinc-800 active:bg-zinc-800 transition-colors uppercase tracking-widest text-xs">Vazgeç</button>
                    <button onClick={applyPresetProgram} className="py-6 text-primary font-black active:bg-zinc-800 transition-colors uppercase tracking-widest text-xs">Evet, Yükle</button>
                </div>
            </div>
        </div>
      )}

      {/* Onay Modalı - SIFIRDAN OLUŞTURMA İÇİN */}
      {showCreateConfirm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PenTool size={40} />
                    </div>
                    <h3 className="text-white font-black text-xl mb-3">Yeni Program?</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                        Sıfırdan bir program oluşturmak, mevcut antrenman planınızı sıfırlayacaktır.
                    </p>
                </div>
                <div className="grid grid-cols-2 border-t border-zinc-800">
                    <button onClick={() => setShowCreateConfirm(false)} className="py-6 text-zinc-500 font-bold border-r border-zinc-800 active:bg-zinc-800 transition-colors uppercase tracking-widest text-xs">Vazgeç</button>
                    <button onClick={handleCreateNewConfirm} className="py-6 text-white font-black active:bg-zinc-800 transition-colors uppercase tracking-widest text-xs">Oluştur</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
