import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Загружаем env переменные (если есть .env файл локально)
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Передаем в код ТОЛЬКО API_KEY. 
      // Токен бота и другие секреты сюда не попадут, даже если будут в окружении.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    }
  };
});