import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

// Используем ключ из env или заглушку, чтобы конструктор не выбросил ошибку при инициализации приложения
// Если ключа нет, приложение запустится, но при попытке толкования выдаст понятную ошибку.
const apiKey = process.env.API_KEY && process.env.API_KEY.length > 0 ? process.env.API_KEY : "missing_key_placeholder";
const ai = new GoogleGenAI({ apiKey });

export const interpretDream = async (dreamText: string): Promise<string> => {
  // Проверяем наличие ключа перед запросом
  if (apiKey === "missing_key_placeholder") {
    console.error("API Key is missing in environment variables.");
    throw new Error("Системная ошибка: Отсутствует ключ API. Пожалуйста, свяжитесь с разработчиком.");
  }

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