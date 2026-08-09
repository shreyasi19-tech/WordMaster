import { Achievement, GameHistoryItem, Settings, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'wordmaster_user_profile_v1',
  SETTINGS: 'wordmaster_settings_v1',
  HISTORY: 'wordmaster_history_v1',
  ACHIEVEMENTS: 'wordmaster_achievements_v1',
  ACTIVE_GAME: 'wordmaster_active_game_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  nickname: 'WordMaster',
  avatar: '🧠',
  favoriteTheme: 'purple',
  totalScore: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  currentStreak: 0,
  longestStreak: 0,
  fastestWinSeconds: null,
  bestScore: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'purple',
  language: 'en',
  soundEnabled: true,
  bgMusicEnabled: false,
  volume: 70,
  animationsEnabled: true,
  colorblindMode: false,
  highContrast: false,
  largeText: false,
  defaultDifficulty: 'medium',
  dailyReminder: true,
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_victory',
    title: 'First Victory',
    description: 'Solve your very first WordMaster puzzle.',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'gameplay',
    xpReward: 50,
  },
  {
    id: 'five_wins',
    title: 'Five Wins',
    description: 'Win 5 games total.',
    icon: '⭐',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    category: 'gameplay',
    xpReward: 100,
  },
  {
    id: 'ten_wins',
    title: 'Ten Wins',
    description: 'Win 10 games total.',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: 'gameplay',
    xpReward: 200,
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Achieve a winning streak of 3 games.',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    category: 'streak',
    xpReward: 150,
  },
  {
    id: 'hardcore_champ',
    title: 'Hardcore Champ',
    description: 'Win a game on Hard difficulty.',
    icon: '🥊',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'gameplay',
    xpReward: 150,
  },
  {
    id: 'hundred_games',
    title: 'Word Centurion',
    description: 'Play 100 WordMaster games.',
    icon: '💯',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    category: 'gameplay',
    xpReward: 500,
  },
  {
    id: 'perfect_guess',
    title: 'Mind Reader',
    description: 'Guess the secret word on your very first try!',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'special',
    xpReward: 300,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Solve any word puzzle in under 20 seconds.',
    icon: '⏱️',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'special',
    xpReward: 200,
  },
  {
    id: 'word_genius',
    title: 'Word Genius',
    description: 'Win a game on Expert difficulty.',
    icon: '🎓',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'special',
    xpReward: 250,
  },
  {
    id: 'daily_master',
    title: 'Daily Master',
    description: 'Complete a Daily Challenge.',
    icon: '📅',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'special',
    xpReward: 150,
  },
  {
    id: 'theme_collector',
    title: 'Theme Collector',
    description: 'Try out 3 different UI themes.',
    icon: '🎨',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    category: 'special',
    xpReward: 100,
  },
];

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load profile from LocalStorage', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to LocalStorage', e);
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadHistory(): GameHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history', e);
  }
  return [];
}

export function saveHistory(history: GameHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (raw) {
      const stored: Achievement[] = JSON.parse(raw);
      // Merge with default list in case new achievements were added
      return INITIAL_ACHIEVEMENTS.map((item) => {
        const found = stored.find((s) => s.id === item.id);
        return found ? { ...item, ...found } : item;
      });
    }
  } catch (e) {
    console.error('Failed to load achievements', e);
  }
  return INITIAL_ACHIEVEMENTS;
}

export function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error('Failed to save achievements', e);
  }
}
