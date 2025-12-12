import { Dream, UserProfile } from '../types';
import { INITIAL_SPHERES } from '../constants';

const KEYS = {
  PROFILE: 'dream_sphere_profile',
  DREAMS: 'dream_sphere_journal',
};

export const getProfile = (): UserProfile => {
  const stored = localStorage.getItem(KEYS.PROFILE);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    spheres: INITIAL_SPHERES,
    totalDreamsAnalyzed: 0,
    isOnboarded: false,
  };
};

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const getDreams = (): Dream[] => {
  const stored = localStorage.getItem(KEYS.DREAMS);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveDream = (dream: Dream) => {
  const dreams = getDreams();
  const updated = [dream, ...dreams];
  localStorage.setItem(KEYS.DREAMS, JSON.stringify(updated));
};
