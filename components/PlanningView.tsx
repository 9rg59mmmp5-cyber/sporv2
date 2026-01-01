
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Dumbbell, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  CalendarDays,
  Repeat,
  X,
  AlertCircle,
  AlertTriangle,
  MoreHorizontal,
  Coffee,
  Download
} from 'lucide-react';
import { WorkoutDay, AppView } from '../types';
import { getPlannedWorkouts, savePlannedWorkouts } from '../services/storageService';
import { triggerHaptic } from '../utils/audio';

interface Props {
    currentProgram: WorkoutDay[];
    onProgramApply: (program: WorkoutDay[]) => void;
    // Navigasyon için opsiyonel prop eklenebilir veya window.location kullanılabilir ama
    // App.tsx içinden navigate fonksiyonunu buraya geçmek en temizidir.
    // Şimdilik sadece bilgilendirme yapıyoruz.
}

type ViewMode = 'week' | 'month';

export const PlanningView: React.FC<Props> = ({ currentProgram }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [plannedWorkouts, setPlannedWorkouts] = useState<Record<string, string>>({});
    const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
    const [showAutoMenu, setShowAutoMenu] = useState(false);

    // Custom Onay Pencereleri
    const [showAutoConfirm, setShowAutoConfirm] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Başlangıçta verileri yükle
    useEffect(() => {
        setPlannedWorkouts(getPlannedWorkouts());
    }, []);

    // Helper: Tarih formatla (YYYY-MM-DD)
    const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper: Seçili günün planını getir
    const getPlannedDayId = (date: Date) => {
        return plannedWorkouts[formatDateKey(date)];
    };

    // Helper: Planı kaydet
    const savePlan = (dayId: string | null) => {
        const key = formatDateKey(selectedDate);
        const newPlans = { ...plannedWorkouts };
        
        if (dayId) {
            newPlans[key] = dayId;
        } else {
            delete newPlans[key];
        }
        
        setPlannedWorkouts(newPlans);
        savePlannedWorkouts(newPlans);
        setShowWorkoutSelector(false);
        triggerHaptic(50);
    };

    // --- TETİKLEYİCİLER ---
    const handleAutoScheduleClick = () => {
        if (currentProgram.length === 0) {
            alert("Programınız boş! Önce 'Antrenman' sekmesinden program oluşturun.");
            return;
        }
        setShowAutoMenu(false);
        setShowAutoConfirm(true); 
    };

    const handleClearClick = () => {
        setShowAutoMenu(false);
        setShowClearConfirm(true); 
    };

    // --- İŞLEM FONKSİYONLARI ---
    const executeAutoSchedule = () => {
        const newPlans = { ...plannedWorkouts };
        const daysToSchedule = 60; 
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let programIndex = 0;

        for (let i = 0; i < daysToSchedule; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateKey = formatDateKey(date);

            // Döngüsel olarak programdan gün seç
            const dayToAssign = currentProgram[programIndex % currentProgram.length];
            
            // Eğer "Dinlenme Günü" ise (isRestDay: true), takvimi boş bırak
            if (dayToAssign.isRestDay) {
                delete newPlans[dateKey];
            } else {
                newPlans[dateKey] = dayToAssign.id;
            }
            
            // Her gün için program indeksini artır (Böylece döngü ilerler)
            programIndex++;
        }

        setPlannedWorkouts(newPlans);
        savePlannedWorkouts(newPlans);
        setShowAutoConfirm(false);
        triggerHaptic(100);
    };

    const executeClear = () => {
        setPlannedWorkouts({});
        savePlannedWorkouts({});
        setShowClearConfirm(false);
        triggerHaptic(50);
    };

    // --- Components ---

    const WeekStrip = () => {
        const startOfWeek = new Date(selectedDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi başlangıç
        startOfWeek.setDate(diff);

        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            weekDays.push(d);
        }

        const monthTitle = weekDays[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }).toUpperCase();

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <button 
                        onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() - 7);
                            setSelectedDate(d);
                        }}
                        className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-black text-zinc-300 tracking-widest">{monthTitle}</span>
                    <button 
                        onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + 7);
                            setSelectedDate(d);
                        }}
                        className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="flex justify-between items-center bg-zinc-900/40 p-1.5 rounded-[2rem] border border-zinc-800 backdrop-blur-md">
                    {weekDays.map((d, idx) => {
                        const dKey = formatDateKey(d);
                        const isSelected = dKey === formatDateKey(selectedDate);
                        const isToday = dKey === formatDateKey(new Date());
                        const hasPlan = !!plannedWorkouts[dKey];

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSelectedDate(d);
                                    triggerHaptic(10);
                                }}
                                className={`flex flex-col items-center justify-center w-[13.5%] aspect-[3/5] rounded-[1.5rem] transition-all duration-300 relative group
                                    ${isSelected 
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105 z-10 ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-black' 
                                        : 'text-zinc-500 hover:bg-zinc-800'
                                    }
                                `}
                            >
                                <span className={`text-[9px] font-bold uppercase mb-1 ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                                    {d.toLocaleDateString('tr-TR', { weekday: 'short' }).slice(0, 3)}
                                </span>
                                <span className={`text-base font-black ${isSelected ? 'text-white' : isToday ? 'text-emerald-500' : 'text-zinc-300'}`}>
                                    {d.getDate()}
                                </span>
                                
                                {hasPlan && (
                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const MonthGrid = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];
        for (let i = 0; i < startOffset; i++) days.push(<div key={`e-${i}`} />);

        for (let d = 1; d <= daysInMonth; d++) {
            const currentDay = new Date(year, month, d);
            const key = formatDateKey(currentDay);
            const isSelected = key === formatDateKey(selectedDate);
            const isToday = key === formatDateKey(new Date());
            const hasPlan = !!plannedWorkouts[key];

            days.push(
                <button
                    key={d}
                    onClick={() => setSelectedDate(currentDay)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative border transition-all
                        ${isSelected 
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 z-10' 
                            : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                        }
                        ${isToday && !isSelected ? 'text-emerald-500 border-emerald-500/30 font-bold bg-emerald-500/5' : ''}
                    `}
                >
                    <span className="text-xs font-bold">{d}</span>
                    {hasPlan && (
                        <div className={`absolute bottom-2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></div>
                    )}
                </button>
            );
        }

        return (
            <div className="animate-in fade-in zoom-in-95 duration-300 bg-zinc-900/20 p-4 rounded-3xl border border-zinc-800/50">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setSelectedDate(new Date(year, month - 1, 1))} className="p-2 bg-zinc-900 rounded-xl text-zinc-400 hover:text-white border border-zinc-800"><ChevronLeft size={20}/></button>
                    <span className="text-sm font-black text-white uppercase tracking-wider">
                        {selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => setSelectedDate(new Date(year, month + 1, 1))} className="p-2 bg-zinc-900 rounded-xl text-zinc-400 hover:text-white border border-zinc-800"><ChevronRight size={20}/></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center mb-3">
                    {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(d => (
                        <span key={d} className="text-[10px] font-bold text-zinc-600 uppercase">{d}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days}
                </div>
            </div>
        );
    };

    const renderDayDetail = () => {
        const planId = getPlannedDayId(selectedDate);
        const plannedWorkout = planId ? currentProgram.find(p => p.id === planId) : null;
        const isDeleted = planId && !plannedWorkout;

        const dateLabel = selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }).toUpperCase();
        
        // --- BOŞ VERİ KONTROLÜ (YENİ CİHAZ/VERCEL) ---
        // Eğer program listesi tamamen boşsa, muhtemelen yeni bir cihazdadır.
        if (currentProgram.length <= 1 && currentProgram[0]?.exercises.length === 0) {
             return (
                <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-zinc-500 font-black text-xs tracking-[0.2em] flex items-center gap-2">
                            <CalendarDays size={14} />
                            {dateLabel}
                        </h3>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                            <Download size={32} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Veri Bulunamadı</h3>
                            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                                Vercel'e veya yeni bir cihaza geçtiyseniz verileriniz otomatik gelmez. Eski cihazınızdan verileri yedekleyip buraya yükleyebilirsiniz.
                            </p>
                        </div>
                        <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/50 text-xs text-zinc-500">
                            Ayarlar &gt; Veri Yönetimi &gt; Veri Yükle
                        </div>
                    </div>
                </div>
             );
        }

        return (
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-zinc-500 font-black text-xs tracking-[0.2em] flex items-center gap-2">
                        <CalendarDays size={14} />
                        {dateLabel}
                    </h3>
                </div>

                {plannedWorkout ? (
                    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-zinc-800 rounded-[2rem] p-6 relative overflow-hidden group shadow-2xl">
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-all duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                        <Zap size={12} fill="currentColor" />
                                        PLANLANDI
                                    </div>
                                    <h2 className="text-2xl font-black text-white leading-tight mb-2">{plannedWorkout.name}</h2>
                                    <p className="text-zinc-500 text-xs font-bold flex items-center gap-2 bg-zinc-950/50 w-fit px-3 py-1.5 rounded-lg">
                                        <Dumbbell size={14} className="text-zinc-400" />
                                        {plannedWorkout.exercises.length} HAREKET
                                    </p>
                                </div>
                                <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 border border-emerald-500/20">
                                    <CheckCircle2 size={28} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button 
                                    onClick={() => setShowWorkoutSelector(true)}
                                    className="bg-white text-black hover:bg-zinc-200 text-xs font-bold py-4 rounded-2xl transition-all border border-transparent shadow-lg shadow-white/5 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <MoreHorizontal size={16} />
                                    DEĞİŞTİR
                                </button>
                                <button 
                                    onClick={() => savePlan(null)}
                                    className="bg-zinc-950 hover:bg-red-900/20 text-zinc-500 hover:text-red-500 rounded-2xl transition-all border border-zinc-800 hover:border-red-900/50 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    KALDIR
                                </button>
                            </div>
                        </div>
                    </div>
                ) : isDeleted ? (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-3 animate-pulse">
                        <AlertCircle size={40} className="text-red-500" />
                        <div>
                            <h3 className="text-white font-bold text-lg">Program Bulunamadı</h3>
                            <p className="text-zinc-500 text-xs mt-1">Bu plan silinmiş olabilir.</p>
                        </div>
                        <button 
                            onClick={() => savePlan(null)} 
                            className="mt-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl transition-colors border border-red-500/20"
                        >
                            PLANI TEMİZLE
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowWorkoutSelector(true)}
                        className="w-full bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-800/60 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center gap-5 group transition-all active:scale-[0.99] hover:border-emerald-500/30"
                    >
                        <div className="w-20 h-20 rounded-full bg-zinc-900 group-hover:bg-emerald-500 group-hover:text-white text-zinc-600 flex items-center justify-center transition-all shadow-xl border border-zinc-800 group-hover:border-emerald-400 group-hover:shadow-emerald-500/20">
                            <Plus size={32} strokeWidth={3} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">Dinlenme Günü</h3>
                            <p className="text-zinc-600 text-xs mt-1 font-medium">Antrenman eklemek için dokun</p>
                        </div>
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="pt-14 px-5 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-black">Planlayıcı</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Takvim & Program</p>
                </div>
                
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 shadow-sm relative z-40">
                    <button 
                        onClick={() => setViewMode('week')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'week' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' : 'text-zinc-500'}`}
                    >
                        <CalendarIcon size={18} />
                    </button>
                    <button 
                        onClick={() => setViewMode('month')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'month' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' : 'text-zinc-500'}`}
                    >
                        <CalendarDays size={18} />
                    </button>
                    <div className="w-px h-6 bg-zinc-800 mx-1 self-center"></div>
                    <button 
                        onClick={() => setShowAutoMenu(true)}
                        className={`p-2 rounded-lg transition-colors relative ${showAutoMenu ? 'text-white bg-emerald-500/20' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                    >
                        <Sparkles size={18} />
                        {showAutoMenu && (
                            <div className="absolute top-full right-0 mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-20 flex flex-col py-1 animate-in zoom-in-95 origin-top-right">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAutoScheduleClick(); }} 
                                    className="w-full px-4 py-3.5 text-left text-xs font-bold text-white hover:bg-zinc-800 flex items-center gap-3 transition-colors active:bg-zinc-700"
                                >
                                    <Repeat size={14} className="text-emerald-500" /> 
                                    <span>Otomatik Doldur</span>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleClearClick(); }} 
                                    className="w-full px-4 py-3.5 text-left text-xs font-bold text-red-400 hover:bg-zinc-800 flex items-center gap-3 border-t border-zinc-800 transition-colors active:bg-zinc-700"
                                >
                                    <Trash2 size={14} /> 
                                    <span>Takvimi Temizle</span>
                                </button>
                            </div>
                        )}
                        {showAutoMenu && <div className="fixed inset-0 z-10" onClick={(e) => {e.stopPropagation(); setShowAutoMenu(false)}} />}
                    </button>
                </div>
            </div>

            {/* Main View Area */}
            <div className="pb-40"> 
                {viewMode === 'week' && <WeekStrip />}
                {viewMode === 'month' && <MonthGrid />}
                
                {renderDayDetail()}
            </div>

            {/* Workout Selector Modal (Bottom Sheet Style) */}
            {showWorkoutSelector && (
                <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-end animate-in fade-in duration-200">
                    <div className="bg-zinc-900 w-full rounded-t-[2.5rem] border-t border-zinc-800 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-900 z-10 rounded-t-[2.5rem]">
                            <div>
                                <h3 className="text-white font-black text-lg">Program Seç</h3>
                                <p className="text-zinc-500 text-xs font-bold mt-1">
                                    {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} için
                                </p>
                            </div>
                            <button onClick={() => setShowWorkoutSelector(false)} className="bg-zinc-800 p-2.5 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar pb-24">
                            {currentProgram.length === 0 ? (
                                <div className="text-center py-10 text-zinc-500 bg-zinc-950/50 rounded-2xl border border-dashed border-zinc-800">
                                    <p className="text-sm font-bold">Henüz programın yok.</p>
                                    <p className="text-xs mt-2 opacity-60">Önce "Antrenman" sekmesinden program oluşturmalısın.</p>
                                </div>
                            ) : (
                                currentProgram.map(day => {
                                    if (day.isRestDay) {
                                         return (
                                            <button
                                                key={day.id}
                                                disabled
                                                className="w-full bg-zinc-900/30 border border-dashed border-zinc-800 p-4 rounded-2xl flex items-center gap-4 opacity-50 cursor-not-allowed"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600">
                                                    <Coffee size={20} />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <h4 className="text-zinc-500 font-bold text-sm">Dinlenme Günü</h4>
                                                    <p className="text-zinc-700 text-xs">Program Döngüsü</p>
                                                </div>
                                            </button>
                                         );
                                    }
                                    return (
                                        <button
                                            key={day.id}
                                            onClick={() => savePlan(day.id)}
                                            className="w-full bg-black border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/50 transition-all active:scale-[0.98]"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <Dumbbell size={20} />
                                            </div>
                                            <div className="text-left flex-1">
                                                <h4 className="text-white font-bold text-sm">{day.name}</h4>
                                                <p className="text-zinc-600 text-xs">{day.exercises.length} Hareket</p>
                                            </div>
                                            <div className="w-4 h-4 rounded-full border-2 border-zinc-700 group-hover:border-emerald-500"></div>
                                        </button>
                                    );
                                })
                            )}
                            
                            <button 
                                onClick={() => savePlan(null)}
                                className="w-full mt-2 py-4 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
                            >
                                Planı Kaldır
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto Schedule Confirm Modal */}
            {showAutoConfirm && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-white font-black text-xl mb-2">Otomatik Doldur?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Programının döngüsü (Antrenman/Dinlenme) bugünden itibaren sonraki <strong>60 güne</strong> uygulanacak.
                            </p>
                            <div className="bg-black/40 px-4 py-2 rounded-xl inline-block border border-zinc-800">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">DÖNGÜYE UYULACAK</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 border-t border-zinc-800">
                            <button 
                                onClick={() => setShowAutoConfirm(false)} 
                                className="py-5 text-zinc-500 font-bold border-r border-zinc-800 hover:bg-zinc-800/50 active:bg-zinc-800 transition-colors uppercase tracking-widest text-xs"
                            >
                                Vazgeç
                            </button>
                            <button 
                                onClick={executeAutoSchedule} 
                                className="py-5 text-emerald-500 font-black hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors uppercase tracking-widest text-xs"
                            >
                                Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear Confirm Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-white font-black text-xl mb-2">Emin misiniz?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                Tüm takvim planlaması silinecek. Bu işlem geri alınamaz.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 border-t border-zinc-800">
                            <button 
                                onClick={() => setShowClearConfirm(false)} 
                                className="py-5 text-zinc-500 font-bold border-r border-zinc-800 hover:bg-zinc-800/50 active:bg-zinc-800 transition-colors uppercase tracking-widest text-xs"
                            >
                                Vazgeç
                            </button>
                            <button 
                                onClick={executeClear} 
                                className="py-5 text-red-500 font-black hover:bg-red-500/10 active:bg-red-500/20 transition-colors uppercase tracking-widest text-xs"
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
