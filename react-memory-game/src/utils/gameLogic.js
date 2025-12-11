// Game logic utilities

export const emojis = ['🚀', '🌟', '🎮', '🎨', '🎵', '🍕', '🌈', '🐱', '🐶', '🦄', '🍦', '🍩', '🌍', '🌺', '⚽', '🚗', '💎', '🎁', '🔔', '🔥', '⚡', '💡', '📷', '📚', '🧸', '🎈', '👑', '👓', '🧢', '👟', '🍔', '🍟'];

export const difficulties = {
  easy: { rows: 4, cols: 4, label: 'Easy' },
  medium: { rows: 6, cols: 6, label: 'Medium' },
  hard: { rows: 6, cols: 8, label: 'Hard' }
};

export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateCards(pairsCount) {
  const selectedEmojis = [];
  const availableEmojis = [...emojis];

  for (let i = 0; i < pairsCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableEmojis.length);
    selectedEmojis.push(availableEmojis[randomIndex]);
    availableEmojis.splice(randomIndex, 1);
  }

  const cardValues = [...selectedEmojis, ...selectedEmojis];
  return shuffleArray(cardValues);
}

export function calculateMedicalStats(
  time = 0,
  moves = 0,
  difficulty = 'easy',
  mistakes = 0,
  totalPairs = 8,
  maxCombo = 0
) {
  // Benchmarks & Config
  const benchmarks = {
    easy: { expectedMoves: 16, expectedTime: 30, difficultyMultiplier: 1 },
    medium: { expectedMoves: 36, expectedTime: 90, difficultyMultiplier: 1.5 },
    hard: { expectedMoves: 54, expectedTime: 150, difficultyMultiplier: 2.5 }
  };
  const config = benchmarks[difficulty] || benchmarks.easy;

  // Dynamic Difficulty Scaling (DDS)
  const history = JSON.parse(localStorage.getItem('memoryGameHistory') || '[]');
  const recentGames = history.filter(g => g.difficulty === difficulty).slice(0, 5);
  let ddsMultiplier = 1.0;
  if (recentGames.length >= 3) {
    const avgPF = recentGames.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / recentGames.length;
    if (avgPF > 1.2) ddsMultiplier = 1.1;
  }

  const expectedMoves = config.expectedMoves * ddsMultiplier;
  const expectedTime = config.expectedTime * ddsMultiplier;

  // Robust Performance Factor
  const actualMoves = Math.max(moves, 1);
  const actualTime = Math.max(time, 1);

  const moveScore = Math.pow(expectedMoves / actualMoves, 0.8);
  const timeScore = Math.pow(expectedTime / actualTime, 0.6);

  let performanceFactor = (moveScore * 0.6) + (timeScore * 0.4);

  // Penalties & Bonuses
  const mistakeRatio = mistakes / totalPairs;
  let mistakePenalty = 1 - (mistakeRatio * 0.1);
  mistakePenalty = Math.max(mistakePenalty, 0.75);

  let comboBonus = 1 + (maxCombo * 0.02);
  comboBonus = Math.min(comboBonus, 1.25);

  // Consistency Factor
  let consistencyFactor = 1.0;
  if (recentGames.length >= 3) {
    const times = recentGames.map(g => g.time || 0);
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    consistencyFactor = 1 - (stdDev / 100);
    consistencyFactor = Math.max(0.9, Math.min(consistencyFactor, 1.1));
  }

  let adjustedPF = performanceFactor * mistakePenalty * comboBonus;

  // Calculate Stats
  let memoryScore = Math.round(1000 * adjustedPF * config.difficultyMultiplier);
  const maxScore = 3000 * config.difficultyMultiplier;
  if (memoryScore > maxScore) memoryScore = maxScore;
  if (memoryScore < 0) memoryScore = 0;

  let baseAge = 25;
  let ageChange = (1.0 - adjustedPF) * 35;
  let brainAge = Math.round(baseAge + ageChange);
  if (brainAge < 18) brainAge = 18;
  if (brainAge > 99) brainAge = 99;

  let baseIQ = 110;
  let iqChange = (adjustedPF - 1.0) * 35;
  iqChange *= consistencyFactor;
  let iq = Math.round(baseIQ + iqChange);
  if (iq < 75) iq = 75;
  if (iq > 160) iq = 160;

  const mistakeFactor = Math.max(0, 1 - (mistakes / totalPairs));
  const timeFactor = Math.min(1, expectedTime / actualTime);
  const comboFactor = Math.min(1, maxCombo / 5);

  let focusScore = Math.round((mistakeFactor * 0.5 + timeFactor * 0.3 + comboFactor * 0.2) * 100);
  if (focusScore > 100) focusScore = 100;

  let rank = "Learner";
  if (adjustedPF > 1.4) rank = "Legend";
  else if (adjustedPF > 1.25) rank = "Genius";
  else if (adjustedPF > 1.10) rank = "Pro";
  else if (adjustedPF > 0.95) rank = "Skilled";

  return {
    memoryScore,
    brainAge,
    iq,
    rank,
    focusScore,
    difficulty,
    performanceFactor: adjustedPF,
    time,
    date: new Date().toISOString()
  };
}

export function analyzeGameplay(timer, moves, moveHistory) {
  const avgTimePerMove = (timer * 1000) / moves;
  let style = "Balanced";
  if (avgTimePerMove < 1500) style = "Impulsive";
  if (avgTimePerMove > 4000) style = "Methodical";
  if (moves <= 59) style = "Strategic";

  const totalPairs = 24; // Hard mode
  const extraMoves = Math.max(0, moves - totalPairs);
  let retention = Math.round(100 - (extraMoves / moves * 100));
  if (retention < 0) retention = 0;

  const times = moveHistory.map(m => m.timeDelta);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);

  let focus = "High";
  if (stdDev > 2000) focus = "Variable";
  if (stdDev > 4000) focus = "Distracted";

  let insight = "Good effort! Keep practicing to improve consistency.";
  if (style === "Impulsive") insight = "You're playing fast! Try slowing down to improve accuracy.";
  if (style === "Methodical") insight = "Great patience! You take your time to ensure matches.";
  if (retention > 80) insight = "Incredible memory! You barely made any mistakes.";
  if (focus === "Distracted") insight = "Your pace varied a lot. Try to maintain a steady rhythm.";

  return { style, retention, focus, insight };
}

export function saveGameResult(stats) {
  const history = JSON.parse(localStorage.getItem('memoryGameHistory') || '[]');
  history.unshift(stats);
  if (history.length > 50) history.pop();
  localStorage.setItem('memoryGameHistory', JSON.stringify(history));
}

export function loadHistory() {
  return JSON.parse(localStorage.getItem('memoryGameHistory') || '[]');
}

export function analyzePerformance(history) {
  if (history.length < 3) {
    return {
      strengths: ['Not enough data'],
      weaknesses: ['Play more games'],
      scores: {}
    };
  }

  const scores = {
    speed: 0,
    accuracy: 0,
    consistency: 0,
    focus: 0
  };

  history.forEach(game => {
    const benchmarks = {
      easy: { expectedTime: 30, expectedMoves: 16 },
      medium: { expectedTime: 90, expectedMoves: 36 },
      hard: { expectedTime: 150, expectedMoves: 54 }
    };
    const bench = benchmarks[game.difficulty] || benchmarks.medium;

    const timeRatio = bench.expectedTime / (game.time || bench.expectedTime);
    scores.speed += timeRatio;

    const pf = game.performanceFactor || 1;
    scores.accuracy += pf;

    scores.focus += (game.focusScore || 50) / 100;
  });

  Object.keys(scores).forEach(key => {
    scores[key] = scores[key] / history.length;
  });

  const pfs = history.map(g => g.performanceFactor || 1);
  const avgPF = pfs.reduce((a, b) => a + b, 0) / pfs.length;
  const variance = pfs.reduce((sum, pf) => sum + Math.pow(pf - avgPF, 2), 0) / pfs.length;
  const stdDev = Math.sqrt(variance);
  scores.consistency = Math.max(0, 1 - stdDev);

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const strengthNames = {
    speed: 'Speed',
    accuracy: 'Accuracy',
    consistency: 'Consistency',
    focus: 'Focus'
  };

  const strengths = sortedScores.slice(0, 2).map(([key]) => strengthNames[key]);
  const weaknesses = sortedScores.slice(-2).reverse().map(([key]) => strengthNames[key]);

  return { strengths, weaknesses, scores };
}

export function generateRecommendation(history, analysis) {
  if (history.length === 0) return null;

  const lastGame = history[0];
  const lastGameDate = new Date(lastGame.date);
  const daysSinceLastGame = Math.floor((Date.now() - lastGameDate) / (1000 * 60 * 60 * 24));

  if (daysSinceLastGame > 7) {
    return "Welcome back! Start with Easy mode to warm up your memory.";
  }

  const recentGames = history.slice(0, 5);
  const difficultyCount = {
    easy: recentGames.filter(g => g.difficulty === 'easy').length,
    medium: recentGames.filter(g => g.difficulty === 'medium').length,
    hard: recentGames.filter(g => g.difficulty === 'hard').length
  };

  const avgPFByDifficulty = {};
  ['easy', 'medium', 'hard'].forEach(diff => {
    const games = history.filter(g => g.difficulty === diff);
    if (games.length > 0) {
      avgPFByDifficulty[diff] = games.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / games.length;
    }
  });

  if (avgPFByDifficulty.easy && avgPFByDifficulty.easy > 1.2 && difficultyCount.easy >= 3 && !avgPFByDifficulty.medium) {
    return "You're mastering Easy mode! Try Medium difficulty to challenge yourself.";
  }
  if (avgPFByDifficulty.medium && avgPFByDifficulty.medium > 1.2 && difficultyCount.medium >= 3 && !avgPFByDifficulty.hard) {
    return "Great performance on Medium! You're ready for Hard mode.";
  }

  if (analysis.scores) {
    if (analysis.scores.speed < 0.8) {
      return "Focus on improving your speed. Try to remember card positions quickly.";
    }
    if (analysis.scores.accuracy < 0.9) {
      return "Take your time to improve accuracy. Remember card positions before flipping.";
    }
    if (analysis.scores.consistency < 0.7) {
      return "Try to play more regularly to build consistency and muscle memory.";
    }
    if (analysis.scores.focus < 0.7) {
      return "Reduce mistakes by carefully tracking which cards you've seen.";
    }
  }

  const lastRank = lastGame.rank || 'Learner';
  if (lastRank === 'Legend' || lastRank === 'Genius') {
    return "Outstanding performance! Keep challenging yourself on Hard mode.";
  }

  const recentPF = (lastGame.performanceFactor || 1);
  if (recentPF > 1.1) {
    return "Great job! You're performing above average. Keep it up!";
  } else if (recentPF < 0.9) {
    return "Practice makes perfect! Try playing a few games to improve your score.";
  }

  return "Keep practicing to improve your memory and cognitive skills!";
}

export function getTrendIndicatorForMetric(history, metricName, lowerIsBetter = false) {
  if (history.length < 3) return '';

  const recent = history.slice(0, Math.min(3, history.length));
  const older = history.slice(3, Math.min(6, history.length));

  if (older.length === 0) return '';

  const recentAvg = recent.reduce((sum, g) => sum + (g[metricName] || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, g) => sum + (g[metricName] || 0), 0) / older.length;

  const threshold = 1.05;
  const isImproving = lowerIsBetter ? (recentAvg < olderAvg / threshold) : (recentAvg > olderAvg * threshold);
  const isDeclining = lowerIsBetter ? (recentAvg > olderAvg * threshold) : (recentAvg < olderAvg / threshold);

  if (isImproving) return '↗️';
  if (isDeclining) return '↘️';
  return '↔️';
}

