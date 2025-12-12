export interface Dream {
  id: string;
  date: string; // ISO string
  text: string;
  interpretation: string;
}

export interface UserProfile {
  spheres: number;
  totalDreamsAnalyzed: number;
  isOnboarded: boolean;
  telegramId?: number;
  username?: string;
}

export type Screen = 'onboarding' | 'home' | 'input' | 'processing' | 'result' | 'journal' | 'profile' | 'help';

// Minimal definition for Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            username?: string;
          };
          start_param?: string;
        };
        openTelegramLink: (url: string) => void;
        close: () => void;
      };
    };
  }
}