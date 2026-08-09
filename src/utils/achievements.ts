import { Achievement, GameHistoryItem, UserProfile } from '../types';

export function checkAchievements(
  achievements: Achievement[],
  profile: UserProfile,
  lastGame?: GameHistoryItem,
  themesTriedCount: number = 1
): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];
  const updatedAchievements = achievements.map((ach) => {
    let newProgress = ach.progress;
    let unlocked = ach.unlocked;

    switch (ach.id) {
      case 'first_victory':
        newProgress = profile.gamesWon >= 1 ? 1 : 0;
        break;
      case 'five_wins':
        newProgress = Math.min(5, profile.gamesWon);
        break;
      case 'ten_wins':
        newProgress = Math.min(10, profile.gamesWon);
        break;
      case 'streak_master':
        newProgress = Math.min(3, profile.currentStreak);
        break;
      case 'hardcore_champ':
        if (lastGame && lastGame.result === 'win' && lastGame.difficulty === 'hard') {
          newProgress = 1;
        }
        break;
      case 'hundred_games':
        newProgress = Math.min(100, profile.gamesPlayed);
        break;
      case 'perfect_guess':
        if (lastGame && lastGame.result === 'win' && lastGame.attempts === 1) {
          newProgress = 1;
        }
        break;
      case 'speed_demon':
        if (lastGame && lastGame.result === 'win' && lastGame.timeSeconds <= 20) {
          newProgress = 1;
        }
        break;
      case 'word_genius':
        if (lastGame && lastGame.result === 'win' && lastGame.difficulty === 'expert') {
          newProgress = 1;
        }
        break;
      case 'daily_master':
        if (lastGame && lastGame.result === 'win' && lastGame.mode === 'daily') {
          newProgress = 1;
        }
        break;
      case 'theme_collector':
        newProgress = Math.min(3, themesTriedCount);
        break;
    }

    if (!unlocked && newProgress >= ach.maxProgress) {
      unlocked = true;
      const unlockedItem = {
        ...ach,
        progress: newProgress,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      newlyUnlocked.push(unlockedItem);
      return unlockedItem;
    }

    return {
      ...ach,
      progress: newProgress,
      unlocked,
    };
  });

  return { updatedAchievements, newlyUnlocked };
}
