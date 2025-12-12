import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Загружаем env переменные (если есть .env файл локально)
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    base: './', // <--- ВАЖНО: Делает пути относительными, чинит белый экран на GitHub Pages
    define: {
      // Если ключа нет, передаем пустую строку, чтобы приложение не падало с ошибкой "undefined" при запуске
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || "")
    }
  };
});