
import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, WorkoutDay } from "../types";

// Vercel/Vite environment variable handling
// Vite uses import.meta.env, Vercel might use process.env in some contexts, so we check both.
// Note: In Vite config, we might need to expose VITE_API_KEY.
const apiKey = (import.meta as any).env?.VITE_API_KEY || (process as any).env?.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: apiKey });

export const askCoach = async (question: string, context: string): Promise<string> => {
  if (!apiKey) return "API Anahtarı eksik. Lütfen Vercel ayarlarında API_KEY (veya VITE_API_KEY) tanımlayın.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert fitness coach named "Coach Gemini". Respond in Turkish.
      Context: ${context}
      User Question: ${question}`,
      config: { temperature: 0.7 }
    });
    return response.text || "Üzgünüm, şu an cevap veremiyorum.";
  } catch (error: any) {
    console.error("AI Error:", error);
    return "Bağlantı hatası oluştu.";
  }
};

export const getWorkoutAnalysis = async (recentLogs: WorkoutLog[], program: WorkoutDay[]): Promise<string> => {
  if (!apiKey) return "API Anahtarı eksik.";

  try {
    const logsSummary = recentLogs.map(log => ({
      date: log.date,
      exercises: Object.entries(log.exercises).map(([id, sets]) => {
        const completed = sets.filter(s => s.completed);
        return completed.length > 0 ? `${id}: ${completed.length} sets` : null;
      }).filter(Boolean)
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiz yap: ${JSON.stringify(logsSummary)}. Dil: Türkçe.`,
      config: { temperature: 0.7 }
    });
    return response.text || "Şu an analiz yapılamıyor.";
  } catch (error) {
    return "Analiz servisi şu an kullanılamıyor.";
  }
};
