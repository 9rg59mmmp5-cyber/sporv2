
import { WorkoutLog, UserSettings, ExerciseSet, WorkoutDay } from '../types';
import { DEFAULT_PROGRAM } from '../constants';

const LOGS_KEY = 'spor_takip_logs_v1';
const SETTINGS_KEY = 'spor_takip_settings_v1';
const SESSION_KEY = 'spor_takip_session_v1';
const PROGRAM_KEY = 'spor_takip_program_v1';
const PLAN_KEY = 'spor_takip_plan_v1';

export const getWorkoutLogs = (): WorkoutLog[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const deleteWorkoutLog = (logToDelete: WorkoutLog): WorkoutLog[] => {
  const logs = getWorkoutLogs();
  
  // 1. Önce kesin startTime eşleşmesi dene
  let index = -1;
  if (logToDelete.startTime) {
      index = logs.findIndex(l => l.startTime && String(l.startTime) === String(logToDelete.startTime));
  }

  // 2. StartTime yoksa veya bulunamadıysa içerik eşleşmesi dene
  if (index === -1) {
      index = logs.findIndex(l => 
          l.date === logToDelete.date && 
          l.dayId === logToDelete.dayId && 
          l.duration === logToDelete.duration
      );
  }

  if (index !== -1) {
    logs.splice(index, 1);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }
  return logs;
};

export const getProgram = (): WorkoutDay[] => {
  try {
    const stored = localStorage.getItem(PROGRAM_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PROGRAM;
  } catch { return DEFAULT_PROGRAM; }
};

export const saveProgram = (program: WorkoutDay[]) => {
  localStorage.setItem(PROGRAM_KEY, JSON.stringify(program));
};

// --- PLANLAMA FONKSİYONLARI ---
export const getPlannedWorkouts = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(PLAN_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
};

export const savePlannedWorkouts = (plans: Record<string, string>) => {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plans));
};
// ------------------------------

// --- YEDEKLEME FONKSİYONLARI ---
export const exportUserData = (): string => {
  try {
    const data = {
      logs: localStorage.getItem(LOGS_KEY),
      program: localStorage.getItem(PROGRAM_KEY),
      plan: localStorage.getItem(PLAN_KEY),
      settings: localStorage.getItem(SETTINGS_KEY),
    };
    // Basit Base64 encode
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch (e) {
    console.error('Export error:', e);
    return '';
  }
};

export const importUserData = (base64Data: string): boolean => {
  try {
    const json = decodeURIComponent(escape(atob(base64Data)));
    const data = JSON.parse(json);
    
    if (data.logs) localStorage.setItem(LOGS_KEY, data.logs);
    if (data.program) localStorage.setItem(PROGRAM_KEY, data.program);
    if (data.plan) localStorage.setItem(PLAN_KEY, data.plan);
    if (data.settings) localStorage.setItem(SETTINGS_KEY, data.settings);
    
    return true;
  } catch (e) {
    console.error('Import error:', e);
    return false;
  }
};
// ------------------------------

export const getNextRecommendedWorkoutId = (): string => {
  const program = getProgram();
  const logs = getWorkoutLogs();
  
  if (program.length === 0) return '';
  if (logs.length === 0) return program[0].id;
  
  const lastLog = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const lastIndex = program.findIndex(d => d.id === lastLog.dayId);
  
  // Eğer son antrenman listede yoksa veya listenin sonundaysa başa dön
  if (lastIndex === -1 || lastIndex === program.length - 1) {
    return program[0].id;
  }
  
  return program[lastIndex + 1].id;
};

export const saveWorkoutLog = (log: WorkoutLog): WorkoutLog => {
  const logs = getWorkoutLogs();
  const existingIndex = logs.findIndex(l => {
      if (log.startTime && l.startTime) return String(l.startTime) === String(log.startTime);
      return false;
  });

  let totalVolume = 0;
  let totalSets = 0;
  const prs: string[] = [];
  const history = [...logs];

  Object.entries(log.exercises).forEach(([id, sets]) => {
    const validSets = sets.filter(s => s.completed && s.weight > 0);
    totalSets += validSets.length;
    validSets.forEach(s => totalVolume += s.weight * s.reps);

    const currentMax = Math.max(...validSets.map(s => s.weight), 0);
    if (currentMax > 0) {
      let historicalMax = 0;
      history.forEach(h => {
        if (log.startTime && h.startTime && String(h.startTime) === String(log.startTime)) return;
        const oldSets = h.exercises[id];
        if (oldSets) {
          const max = Math.max(...oldSets.filter(s => s.completed).map(s => s.weight), 0);
          if (max > historicalMax) historicalMax = max;
        }
      });
      if (currentMax > historicalMax) prs.push(id);
    }
  });

  const finalLog = { ...log, totalVolume, totalSets, prs };

  if (existingIndex > -1) {
      logs[existingIndex] = finalLog;
  } else {
      logs.push(finalLog);
  }
  
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return finalLog;
};

export const startSession = (dayId: string): number => {
  const startTime = Date.now();
  localStorage.setItem(SESSION_KEY, JSON.stringify({ dayId, startTime }));
  return startTime;
};

export const endSession = () => localStorage.removeItem(SESSION_KEY);

export const getSessionStartTime = (dayId: string): number | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session.dayId === dayId ? session.startTime : null;
  } catch { return null; }
};

export const getUserSettings = (): UserSettings => {
  try { 
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? JSON.parse(stored) : {};
    return {
      restBetweenSets: 90,
      restBetweenExercises: 120,
      ...settings
    };
  }
  catch { 
    return {
      restBetweenSets: 90,
      restBetweenExercises: 120
    }; 
  }
};

export const saveUserSettings = (s: UserSettings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
