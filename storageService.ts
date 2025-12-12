import { Dream, UserProfile } from '../types';
import { INITIAL_SPHERES } from '../constants';

// Генерация уникальных ключей для конкретного пользователя
const getStorageKeys = (userId: string | number) => ({
  PROFILE: `dream_sphere_profile_${userId}`,
  DREAMS: `dream_sphere_journal_${userId}`,
});

export const getProfile = (userId: string | number = 'guest'): UserProfile => {
  try {
    const keys = getStorageKeys(userId);
    const stored = localStorage.getItem(keys.PROFILE);
    
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Storage access failed", e);
  }
  
  // Если профиля нет или ошибка доступа, возвращаем дефолтный
  return {
    spheres: INITIAL_SPHERES,
    totalDreamsAnalyzed: 0,
    isOnboarded: false,
    telegramId: typeof userId === 'number' ? userId : undefined,
  };
};

export const saveProfile = (profile: UserProfile, userId: string | number = 'guest') => {
  try {
    const keys = getStorageKeys(userId);
    localStorage.setItem(keys.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
};

export const getDreams = (userId: string | number = 'guest'): Dream[] => {
  try {
    const keys = getStorageKeys(userId);
    const stored = localStorage.getItem(keys.DREAMS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Storage access failed for dreams", e);
  }
  return [];
};

export const saveDream = (dream: Dream, userId: string | number = 'guest') => {
  try {
    const dreams = getDreams(userId);
    const updated = [dream, ...dreams];
    const keys = getStorageKeys(userId);
    localStorage.setItem(keys.DREAMS, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save dream", e);
  }
};