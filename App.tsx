
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dumbbell, ChevronLeft, ArrowRight, ChevronRight, Settings, Play, Trophy, Clock, Edit2, Plus, Trash2, Check, Layers, Calendar, ChevronDown, CheckCircle2, GripVertical, CalendarDays, Coffee } from 'lucide-react';
import { ExerciseCard } from './components/ExerciseCard';
import { WorkoutTimer } from './components/WorkoutTimer';
import { RestTimer } from './components/RestTimer';
import { ProfileView } from './components/ProfileView';
import { PlanningView } from './components/PlanningView';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { HistoryDetailModal } from './components/HistoryDetailModal';
import { InstallPrompt } from './components/InstallPrompt';
import { AppView, WorkoutDay, ExerciseSet, WorkoutLog, ExerciseData, UserSettings } from './types';
import { saveWorkoutLog, getWorkoutLogs, deleteWorkoutLog, startSession, endSession, getSessionStartTime, getProgram, saveProgram, getNextRecommendedWorkoutId, getUserSettings } from './services/storageService';
import { triggerHaptic } from './utils/audio';

const TabItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-95 ${isActive ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
  >
    <div className={`transition-transform duration-200 ${isActive ? '-translate-y-0.5' : ''}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: isActive ? 2.5 : 2 })}
    </div>
    <span className={`text-[10px] font-bold mt-0.5 transition-colors ${isActive ? 'text-primary' : 'text-zinc-600'}`}>
        {label}
    </span>
  </button>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [program, setProgram] = useState<WorkoutDay[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [activeLog, setActiveLog] = useState<{ [exerciseId: string]: ExerciseSet[] }>({});
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  
  const [completedWorkoutLog, setCompletedWorkoutLog] = useState<WorkoutLog | null>(null);
  const [selectedHistoryLog, setSelectedHistoryLog] = useState<WorkoutLog | null>(null);
  const [restTargetTime, setRestTargetTime] = useState<number | null>(null);
  
  // History View State
  const [historyLogs, setHistoryLogs] = useState<WorkoutLog[]>([]);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string>('');

  // Drag and Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [draggedDayId, setDraggedDayId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadedProgram = getProgram();
    setProgram(loadedProgram);
    const logs = getWorkoutLogs().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistoryLogs(logs);
    setNextId(getNextRecommendedWorkoutId());
  }, []);

  useEffect(() => {
    if (currentView === AppView.HISTORY || currentView === AppView.DASHBOARD) {
        const logs = getWorkoutLogs().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistoryLogs(logs);
        setNextId(getNextRecommendedWorkoutId());
    }
  }, [currentView]);

  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: WorkoutLog[] } = {};
    historyLogs.forEach(log => {
        const date = new Date(log.date);
        let monthName = date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        
        if (!groups[monthName]) groups[monthName] = [];
        groups[monthName].push(log);
    });
    return groups;
  }, [historyLogs]);

  const navigate = (view: AppView) => {
    setCurrentView(view);
    setIsEditMode(false);
  };

  const startWorkoutView = (day: WorkoutDay) => {
    if (isEditMode || day.isRestDay) return;
    setSelectedDay(day);
    const today = new Date().toISOString().split('T')[0];
    const logs = getWorkoutLogs();
    const existingLog = logs.find(l => l.date === today && l.dayId === day.id);
    const activeSessionStart = getSessionStartTime(day.id);

    if (existingLog) {
      setActiveLog(existingLog.exercises);
    } else {
      setActiveLog({});
    }
    
    setWorkoutStartTime(activeSessionStart);
    setCurrentView(AppView.WORKOUT);
  };

  const handleManualStart = () => {
    if (!selectedDay) return;
    const startTime = startSession(selectedDay.id);
    setWorkoutStartTime(startTime);
    triggerHaptic(100);
  };

  const handleExerciseUpdate = (exId: string, sets: ExerciseSet[]) => {
    setActiveLog(prev => ({ ...prev, [exId]: sets }));
  };

  const handleTargetUpdate = (dayId: string, exId: string, newTarget: string) => {
    const updatedProgram = program.map(day => {
        if (day.id === dayId) {
            return {
                ...day,
                exercises: day.exercises.map(ex => 
                    ex.id === exId ? { ...ex, targetSets: newTarget } : ex
                )
            };
        }
        return day;
    });
    
    setProgram(updatedProgram);
    saveProgram(updatedProgram);
    
    if (selectedDay && selectedDay.id === dayId) {
        const updatedDay = updatedProgram.find(d => d.id === dayId);
        if (updatedDay) setSelectedDay(updatedDay);
    }
  };

  const handleSetComplete = (isExerciseFinished: boolean) => {
    const settings = getUserSettings();
    const restSeconds = isExerciseFinished 
        ? (settings.restBetweenExercises ?? 120) 
        : (settings.restBetweenSets ?? 90);
    
    if (restSeconds > 0) {
        setRestTargetTime(Date.now() + (restSeconds * 1000));
    }
  };

  const finishWorkout = () => {
    if (!selectedDay) return;
    const endTime = Date.now();
    const duration = workoutStartTime ? Math.floor((endTime - workoutStartTime) / 1000) : 0;
    const logData: WorkoutLog = {
      date: new Date().toISOString().split('T')[0],
      dayId: selectedDay.id,
      startTime: workoutStartTime || endTime,
      endTime,
      duration,
      exercises: activeLog
    };
    const savedLog = saveWorkoutLog(logData);
    endSession();
    setShowFinishConfirm(false);
    setRestTargetTime(null);
    setCompletedWorkoutLog(savedLog);
    
    const updatedLogs = getWorkoutLogs().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHistoryLogs(updatedLogs);
    setNextId(getNextRecommendedWorkoutId());
    triggerHaptic(200);
  };

  const handleDeleteHistoryLog = (logToDelete: WorkoutLog) => {
    // Onay penceresi kaldırıldı
    triggerHaptic(100);
    const updatedLogs = deleteWorkoutLog(logToDelete);
    setHistoryLogs(updatedLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setNextId(getNextRecommendedWorkoutId());
  };

  const handleUpdateProgram = (newProgram: WorkoutDay[]) => {
    setProgram(newProgram);
    saveProgram(newProgram);
  };
  
  const updateExerciseTarget = (dayId: string, exId: string, newTarget: string) => {
    const updated = program.map(d => 
      d.id === dayId 
        ? { ...d, exercises: d.exercises.map(e => e.id === exId ? { ...e, targetSets: newTarget } : e) } 
        : d
    );
    handleUpdateProgram(updated);
  };

  const handleCreateNewProgram = () => {
      // Boş bir program oluştur
      const initialProgram: WorkoutDay[] = [
          {
              id: `day-${Date.now()}-${Math.random()}`,
              name: 'Gün 1',
              exercises: []
          }
      ];
      setProgram(initialProgram);
      saveProgram(initialProgram);
      
      // Dashboard'a yönlendir ve edit modunu aç
      setCurrentView(AppView.DASHBOARD);
      setIsEditMode(true);
      triggerHaptic(100);
  };

  const addNewWorkoutDay = () => {
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Benzersiz ID için random eklendi
      name: 'Yeni Antrenman Günü',
      exercises: []
    };
    const updated = [...program, newDay];
    handleUpdateProgram(updated);
    triggerHaptic(50);
  };

  const removeWorkoutDay = (dayId: string) => {
    // Onay penceresi kaldırıldı
    const updated = program.filter(d => d.id !== dayId);
    handleUpdateProgram(updated);
    triggerHaptic(100);
  };

  const updateWorkoutDayName = (dayId: string, name: string) => {
    const updated = program.map(d => d.id === dayId ? { ...d, name } : d);
    handleUpdateProgram(updated);
  };

  const addNewExercise = (dayId: string) => {
    const newEx: ExerciseData = { id: `ex-${Date.now()}`, name: 'Yeni Hareket', targetSets: '3x10', targetWeight: '20 kg' };
    const updated = program.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, newEx] } : d);
    handleUpdateProgram(updated);
  };

  const removeExercise = (dayId: string, exId: string) => {
    const updated = program.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d);
    handleUpdateProgram(updated);
  };

  // --- TOUCH REORDER LOGIC ---
  const handleTouchStart = (dayId: string, index: number) => {
    setDraggedIdx(index);
    setDraggedDayId(dayId);
    triggerHaptic(80);
  };

  const handleTouchMove = (e: React.TouchEvent, dayId: string) => {
    if (draggedIdx === null || draggedDayId !== dayId) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const row = element?.closest('[data-drag-index]');
    
    if (row) {
      const targetIdx = parseInt(row.getAttribute('data-drag-index') || '');
      if (!isNaN(targetIdx) && targetIdx !== draggedIdx) {
        const updated = program.map(d => {
          if (d.id === dayId) {
            const newExercises = [...d.exercises];
            const item = newExercises[draggedIdx];
            newExercises.splice(draggedIdx, 1);
            newExercises.splice(targetIdx, 0, item);
            return { ...d, exercises: newExercises };
          }
          return d;
        });
        setProgram(updated);
        setDraggedIdx(targetIdx);
        triggerHaptic(30); 
      }
    }
  };

  const handleTouchEnd = () => {
    if (draggedIdx !== null) {
      saveProgram(program);
      setDraggedIdx(null);
      setDraggedDayId(null);
      triggerHaptic(50);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-primary/30 pb-safe overflow-x-hidden">
      
      <main className={`flex-1 overflow-y-auto no-scrollbar pb-32 ${currentView === AppView.WORKOUT ? 'pt-safe' : 'pt-0'}`}>
        
        {/* === DASHBOARD === */}
        {currentView === AppView.DASHBOARD && (
          <div className="animate-in fade-in duration-500 pt-14 px-5 pb-10">
             <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter leading-none">Spor Takip</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long'})}
                    </p>
                </div>
                <button onClick={() => navigate(AppView.PROFILE)} className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary mt-2">
                    <Settings size={20} />
                </button>
             </div>

             <div className="mt-8 space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-base font-bold">Programın</h2>
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${isEditMode ? 'bg-primary text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                    >
                        {isEditMode ? <><Check size={14} /> Tamam</> : <><Edit2 size={14} /> Düzenle</>}
                    </button>
                </div>

                <div className="space-y-4">
                    {program.map((day) => {
                        const isRecommended = day.id === nextId;
                        const isCompletedToday = historyLogs.some(l => l.date === todayStr && l.dayId === day.id);
                        const totalSets = day.exercises.reduce((acc, ex) => {
                            const match = ex.targetSets ? ex.targetSets.match(/^(\d+)/) : null;
                            return acc + (match ? parseInt(match[1]) : 0);
                        }, 0);

                        if (day.isRestDay) {
                           return (
                               <div key={day.id} className="relative group">
                                    <div className="bg-zinc-950/50 rounded-2xl border border-dashed border-zinc-800 p-4 flex items-center gap-4 opacity-70">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600">
                                            <Coffee size={20} />
                                        </div>
                                        <div className="flex-1">
                                             <div className="font-bold text-sm text-zinc-500">Dinlenme Günü</div>
                                             <p className="text-[10px] text-zinc-600">Kas toparlanması için önemli</p>
                                        </div>
                                    </div>
                                    {isEditMode && (
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeWorkoutDay(day.id);
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            className="absolute top-1/2 -translate-y-1/2 right-4 w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full text-red-500 hover:bg-red-900/20 transition-all z-[100] shadow-xl cursor-pointer active:scale-95"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                               </div>
                           );
                        }

                        return (
                            <div key={day.id} className={`bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl transition-all duration-300 ${isCompletedToday ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                <div className="relative">
                                    {/* CRITICAL FIX: Changed <button> to <div> and handled click logic conditionally */}
                                    <div
                                        onClick={() => {
                                            if (!isEditMode) startWorkoutView(day);
                                        }}
                                        className={`w-full text-left p-5 flex items-center justify-between transition-all select-none ${!isEditMode ? 'cursor-pointer active:bg-zinc-800/50 active:scale-[0.99]' : ''} ${isRecommended && !isEditMode && !isCompletedToday ? 'bg-primary/10' : ''} ${isEditMode ? 'pointer-events-none' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex-1">
                                                {isEditMode ? (
                                                    <input 
                                                        autoFocus={day.name === 'Yeni Antrenman Günü'}
                                                        value={day.name}
                                                        onChange={(e) => updateWorkoutDayName(day.id, e.target.value)}
                                                        className="bg-black/50 border border-zinc-700 rounded-lg px-2 py-2 text-sm font-bold text-white focus:border-primary outline-none w-[80%] pointer-events-auto"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <div className="font-bold text-sm text-white flex items-center gap-2">
                                                        {day.name}
                                                        {isRecommended && !isCompletedToday && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase">Sıradaki</span>}
                                                        {isCompletedToday && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full uppercase flex items-center gap-1"><Check size={10} /> Tamamlandı</span>}
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5">
                                                    <span>{day.exercises.length} Hareket</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                                    <span>{totalSets} Set</span>
                                                </p>
                                            </div>
                                        </div>
                                        {isCompletedToday ? (
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <CheckCircle2 size={18} />
                                            </div>
                                        ) : (
                                            !isEditMode && <ArrowRight size={18} className="text-zinc-700" />
                                        )}
                                    </div>

                                    {isEditMode && (
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeWorkoutDay(day.id);
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full text-red-500 hover:bg-red-900/20 transition-all z-[100] shadow-xl cursor-pointer active:scale-95"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                                
                                {isEditMode && (
                                    <div className="p-4 bg-black/40 border-t border-zinc-800 space-y-3">
                                        {day.exercises.map((ex, i) => {
                                            const isDragging = draggedIdx === i && draggedDayId === day.id;
                                            return (
                                                <div 
                                                  key={ex.id} 
                                                  data-drag-index={i}
                                                  className={`flex items-center gap-2 p-2 rounded-2xl border transition-all duration-200 ${isDragging ? 'bg-primary/20 border-primary scale-[1.05] z-50 shadow-2xl relative' : 'bg-transparent border-transparent'}`}
                                                >
                                                    {/* Custom Drag Handle for Touch */}
                                                    <div 
                                                      className="p-3 text-zinc-600 active:text-primary touch-none cursor-grab"
                                                      onTouchStart={() => handleTouchStart(day.id, i)}
                                                      onTouchMove={(e) => handleTouchMove(e, day.id)}
                                                      onTouchEnd={handleTouchEnd}
                                                    >
                                                      <GripVertical size={24} />
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                                        <input 
                                                            value={ex.name}
                                                            onChange={(e) => {
                                                                const updated = program.map(d => d.id === day.id ? { ...d, exercises: d.exercises.map((eObj, idx) => idx === i ? { ...eObj, name: e.target.value } : eObj) } : d);
                                                                handleUpdateProgram(updated);
                                                            }}
                                                            className="col-span-2 bg-black border border-zinc-800 rounded-xl px-3 py-3 text-xs font-bold text-white focus:border-primary outline-none"
                                                            placeholder="Hareket Adı"
                                                        />
                                                        <input 
                                                            value={ex.targetSets}
                                                            onChange={(e) => updateExerciseTarget(day.id, ex.id, e.target.value)}
                                                            className="col-span-1 bg-black border border-zinc-800 rounded-xl px-2 py-3 text-xs font-bold text-white text-center focus:border-primary outline-none"
                                                            placeholder="3x10"
                                                        />
                                                    </div>
                                                    <button onClick={() => removeExercise(day.id, ex.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl shrink-0 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        <button 
                                            onClick={() => addNewExercise(day.id)}
                                            className="w-full py-4 bg-zinc-900 border border-zinc-800 border-dashed rounded-xl text-zinc-500 text-xs font-bold flex items-center justify-center gap-2 hover:border-zinc-600 hover:text-zinc-300 transition-all mt-2"
                                        >
                                            <Plus size={18} /> Hareket Ekle
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {isEditMode && (
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={addNewWorkoutDay}
                                className="py-6 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-500 font-bold flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 hover:border-zinc-700 hover:text-primary transition-all active:scale-95"
                            >
                                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-primary">
                                    <Plus size={20} />
                                </div>
                                <span className="text-xs">Antrenman Ekle</span>
                            </button>
                             <button 
                                onClick={() => {
                                    const newDay: WorkoutDay = { 
                                        id: `rest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Benzersiz ID 
                                        name: 'Dinlenme Günü', 
                                        exercises: [], 
                                        isRestDay: true 
                                    };
                                    handleUpdateProgram([...program, newDay]);
                                    triggerHaptic(50);
                                }}
                                className="py-6 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-500 font-bold flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 hover:border-zinc-700 hover:text-primary transition-all active:scale-95"
                            >
                                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-primary">
                                    <Coffee size={20} />
                                </div>
                                <span className="text-xs">Dinlenme Ekle</span>
                            </button>
                        </div>
                    )}
                </div>
             </div>
          </div>
        )}

        {/* === WORKOUT === */}
        {currentView === AppView.WORKOUT && selectedDay && (
           <div className="animate-in slide-in-from-right duration-300 bg-black min-h-screen">
               <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-zinc-900 pt-safe px-4 py-3 flex items-center justify-between">
                   <button onClick={() => setShowFinishConfirm(true)} className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                   </button>
                   <div className="flex flex-col items-center">
                       <h2 className="font-bold text-xs text-zinc-400 uppercase tracking-widest">{selectedDay.name}</h2>
                       <div className="mt-1">
                            {workoutStartTime ? <WorkoutTimer startTime={workoutStartTime} /> : (
                                <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-md">HAZIR</span>
                            )}
                       </div>
                   </div>
                   <div className="w-6"></div>
               </div>
               
               <div className="p-4 space-y-6 pb-32">
                   {!workoutStartTime && (
                       <button
                           onClick={handleManualStart}
                           className="w-full py-10 bg-primary hover:bg-blue-600 rounded-[2rem] shadow-[0_0_50px_rgba(10,132,255,0.3)] active:scale-95 transition-all flex flex-col items-center justify-center gap-4 mb-2 group relative overflow-hidden border border-white/10"
                       >
                           <Play size={40} fill="currentColor" className="ml-2 relative z-10 text-white" />
                           <div className="text-center relative z-10">
                               <h3 className="text-3xl font-black text-white tracking-tighter leading-none">BAŞLAT</h3>
                               <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Antrenmanı Kaydet</p>
                           </div>
                       </button>
                   )}

                   <div className={`space-y-4 transition-all duration-500 ${!workoutStartTime ? 'opacity-30 blur-sm pointer-events-none scale-95 origin-top' : 'opacity-100 blur-0 scale-100'}`}>
                       {selectedDay.exercises.map(exercise => (
                           <ExerciseCard 
                               key={exercise.id}
                               exercise={exercise}
                               initialLogs={activeLog[exercise.id] || []}
                               onUpdate={handleExerciseUpdate}
                               onSetComplete={handleSetComplete}
                               onTargetChange={(newTarget) => handleTargetUpdate(selectedDay.id, exercise.id, newTarget)}
                           />
                       ))}

                       {workoutStartTime && (
                           <button
                                onClick={() => setShowFinishConfirm(true)}
                                className="w-full py-5 mt-6 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-black text-lg tracking-wide shadow-xl shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                           >
                               <Check size={24} strokeWidth={3} />
                               ANTRENMANI BİTİR
                           </button>
                       )}
                   </div>
               </div>
           </div>
        )}

        {/* === HISTORY === */}
        {currentView === AppView.HISTORY && (
             <div className="pt-14 px-5 space-y-8 pb-10 animate-in fade-in duration-500">
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black">Geçmiş</h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Antrenman Arşivi</p>
                    </div>
                 </div>
                 
                 <div>
                    {historyLogs.length === 0 ? (
                        <div className="text-center py-10 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
                            <p className="text-zinc-500 text-sm">Henüz kayıtlı antrenman yok.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(groupedHistory).map(monthKey => {
                                const logs = groupedHistory[monthKey];
                                const isExpanded = expandedMonth === monthKey;
                                const totalWorkouts = logs.length;

                                return (
                                    <div key={monthKey} className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden">
                                        <button 
                                            onClick={() => setExpandedMonth(isExpanded ? null : monthKey)}
                                            className={`w-full p-5 flex items-center justify-between transition-all duration-300 ${isExpanded ? 'bg-zinc-900' : 'bg-transparent hover:bg-zinc-900/50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-primary text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'}`}>
                                                    <Calendar size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className={`font-bold text-base ${isExpanded ? 'text-white' : 'text-zinc-300'}`}>{monthKey}</h3>
                                                    <div className="flex gap-3 mt-1">
                                                        <span className="text-[10px] font-bold text-zinc-500 bg-black/20 px-2 py-0.5 rounded-full">{totalWorkouts} Antrenman</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : 'text-zinc-600'}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="p-3 space-y-3 bg-zinc-900/30 border-t border-zinc-900 animate-in slide-in-from-top-2">
                                                {logs.map((log) => {
                                                    const uniqueKey = log.startTime ? `log-${log.startTime}` : `log-${log.date}-${log.dayId}-${log.duration}`;
                                                    const day = program.find(d => d.id === log.dayId);
                                                    const hasPR = log.prs && log.prs.length > 0;
                                                    
                                                    return (
                                                        <div 
                                                          key={uniqueKey} 
                                                          onClick={() => setSelectedHistoryLog(log)}
                                                          className="bg-black active:bg-zinc-900 transition-colors rounded-2xl p-4 border border-zinc-800 flex items-center justify-between group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex flex-col items-center justify-center bg-zinc-900 w-10 h-10 rounded-xl border border-zinc-800">
                                                                    <span className="text-[9px] font-bold text-zinc-500 uppercase leading-none mb-1">{new Date(log.date).toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
                                                                    <span className="text-sm font-black text-white leading-none">{new Date(log.date).getDate()}</span>
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-bold text-white text-sm">{day?.name || 'Antrenman'}</h4>
                                                                        {hasPR && <Trophy size={12} className="text-yellow-500" />}
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-500 mt-1 font-bold">
                                                                        <span className="flex items-center gap-1"><Clock size={10} /> {Math.floor((log.duration || 0)/60)}dk</span>
                                                                        <span className="flex items-center gap-1"><Dumbbell size={10} /> {(log.totalVolume || 0).toLocaleString()}kg</span>
                                                                        <span className="flex items-center gap-1"><Layers size={10} /> {log.totalSets || 0} Set</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleDeleteHistoryLog(log);
                                                                    }}
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                    onTouchStart={(e) => e.stopPropagation()}
                                                                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-700 hover:text-red-500 hover:border-red-900/30 transition-all active:scale-90 shadow-md relative z-10"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                                <ChevronRight size={16} className="text-zinc-800" />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                 </div>
             </div>
        )}
        
        {currentView === AppView.PLANNING && <PlanningView currentProgram={program} onProgramApply={(newP) => { setProgram(newP); navigate(AppView.DASHBOARD); }} />}

        {currentView === AppView.PROFILE && <ProfileView onProgramChange={(newP) => setProgram(newP)} onCreateNew={handleCreateNewProgram} />}

      </main>

      {/* === TAB BAR === */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-zinc-900 pb-safe pt-2 z-50">
          <div className="flex justify-around items-center h-[50px]">
              <TabItem icon={<Dumbbell />} label="Antrenman" isActive={currentView === AppView.DASHBOARD || currentView === AppView.WORKOUT} onClick={() => navigate(AppView.DASHBOARD)} />
              <TabItem icon={<CalendarDays />} label="Planlama" isActive={currentView === AppView.PLANNING} onClick={() => navigate(AppView.PLANNING)} />
              <TabItem icon={<Clock />} label="Geçmiş" isActive={currentView === AppView.HISTORY} onClick={() => navigate(AppView.HISTORY)} />
              <TabItem icon={<Settings />} label="Ayarlar" isActive={currentView === AppView.PROFILE} onClick={() => navigate(AppView.PROFILE)} />
          </div>
      </div>
      
      {restTargetTime && <RestTimer targetTime={restTargetTime} onDismiss={() => setRestTargetTime(null)} onAddSeconds={(s) => setRestTargetTime(restTargetTime + (s * 1000))} />}
      {completedWorkoutLog && <WorkoutSummaryModal log={completedWorkoutLog} onClose={() => {setCompletedWorkoutLog(null); navigate(AppView.DASHBOARD);}} />}
      {selectedHistoryLog && <HistoryDetailModal log={selectedHistoryLog} program={program} onClose={() => setSelectedHistoryLog(null)} />}
      
      <InstallPrompt />

      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm space-y-2 animate-in slide-up duration-300">
                <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
                    <div className="p-6 text-center border-b border-zinc-800">
                        <h3 className="text-base font-bold">Antrenman Bitsin mi?</h3>
                        <p className="text-xs text-zinc-500 mt-2">Bugünkü performansın kaydedilecek.</p>
                    </div>
                    <button onClick={finishWorkout} className="w-full py-4 text-primary font-black text-base active:bg-white/5 uppercase tracking-widest">KAYDET VE BİTİR</button>
                </div>
                <button onClick={() => setShowFinishConfirm(false)} className="w-full py-4 bg-zinc-900 text-white font-bold rounded-3xl border border-zinc-800 text-sm">İptal</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
