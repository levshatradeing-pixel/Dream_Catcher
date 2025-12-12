import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const interpretDream = async (dreamText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: dreamText,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text || "Извините, не удалось интерпретировать этот сон. Попробуйте еще раз.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Ошибка соединения с Мастером сновидений.");
  }
};