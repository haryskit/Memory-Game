import React, { useState, useEffect } from 'react';
import { loadHistory, analyzePerformance, generateRecommendation, getTrendIndicatorForMetric } from '../utils/gameLogic';
import '../styles/StartScreen.css';

function StartScreen({ onStartGame }) {
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const gameHistory = loadHistory();
    setHistory(gameHistory);
    updateProfile(gameHistory);
  }, []);

  const updateProfile = (gameHistory) => {
    if (gameHistory.length === 0) {
      setProfile(null);
      return;
    }

    const avgBrainAge = Math.round(gameHistory.reduce((sum, g) => sum + g.brainAge, 0) / gameHistory.length);
    const avgIQ = Math.round(gameHistory.reduce((sum, g) => sum + g.iq, 0) / gameHistory.length);
    const maxScore = Math.max(...gameHistory.map(g => g.memoryScore));
    const avgFocus = Math.round(gameHistory.reduce((sum, g) => sum + g.focusScore, 0) / gameHistory.length);

    const recentGames = gameHistory.slice(0, 5);
    const avgRecentPF = recentGames.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / recentGames.length;
    let currentRank = "Learner";
    if (avgRecentPF > 1.4) currentRank = "Legend";
    else if (avgRecentPF > 1.25) currentRank = "Genius";
    else if (avgRecentPF > 1.10) currentRank = "Pro";
    else if (avgRecentPF > 0.95) currentRank = "Skilled";

    let trendText = "Stable";
    let trendIndicator = "↔️";

    if (gameHistory.length >= 10) {
      const recent5 = gameHistory.slice(0, 5);
      const previous5 = gameHistory.slice(5, 10);
      const recentAvgPF = recent5.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / 5;
      const previousAvgPF = previous5.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / 5;

      if (recentAvgPF > previousAvgPF * 1.05) {
        trendText = "Improving";
        trendIndicator = "↗️";
      } else if (recentAvgPF < previousAvgPF * 0.95) {
        trendText = "Needs Practice";
        trendIndicator = "↘️";
      }
    } else if (gameHistory.length >= 3) {
      const lastPF = gameHistory[0].performanceFactor || 1;
      const avgPF = gameHistory.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / gameHistory.length;

      if (lastPF > avgPF * 1.1) {
        trendText = "Improving";
        trendIndicator = "↗️";
      } else if (lastPF < avgPF * 0.9) {
        trendText = "Needs Practice";
        trendIndicator = "↘️";
      }
    }

    const analysis = analyzePerformance(gameHistory);
    const recommendation = generateRecommendation(gameHistory, analysis);

    const brainAgeTrend = getTrendIndicatorForMetric(gameHistory, 'brainAge', true);
    const iqTrend = getTrendIndicatorForMetric(gameHistory, 'iq', false);
    const scoreTrend = getTrendIndicatorForMetric(gameHistory, 'memoryScore', false);
    const focusTrend = getTrendIndicatorForMetric(gameHistory, 'focusScore', false);

    setProfile({
      avgBrainAge,
      avgIQ,
      maxScore,
      avgFocus,
      currentRank,
      trendText,
      trendIndicator,
      analysis,
      recommendation,
      brainAgeTrend,
      iqTrend,
      scoreTrend,
      focusTrend
    });
  };

  const handlePlayNow = () => {
    setShowDifficulty(true);
  };

  const handleBack = () => {
    setShowDifficulty(false);
  };

  const handleDifficultySelect = (level) => {
    onStartGame(level);
  };

  return (
    <div className="screen active" id="start-screen">
      {!showDifficulty ? (
        <>
          <div className="hero-section">
            <h1 className="game-title">Memory<br />Master</h1>
            <p className="game-subtitle">Unlock Your Brain's Potential</p>
            <button id="play-now-btn" className="btn-primary btn-large" onClick={handlePlayNow}>
              Play Now
            </button>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card profile-card">
              <h3>Your Brain Profile</h3>

              {profile ? (
                <>
                  <div className="profile-stats-grid">
                    <div className="profile-stat-item">
                      <span className="stat-label">Brain Age</span>
                      <span id="profile-brain-age" className="stat-value">
                        {profile.avgBrainAge} yrs {profile.brainAgeTrend}
                      </span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Estimated IQ</span>
                      <span id="profile-iq" className="stat-value">
                        {profile.avgIQ} {profile.iqTrend}
                      </span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Memory Score</span>
                      <span id="profile-score" className="stat-value">
                        {profile.maxScore} {profile.scoreTrend}
                      </span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Focus Score</span>
                      <span id="profile-focus" className="stat-value">
                        {profile.avgFocus}% {profile.focusTrend}
                      </span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Current Rank</span>
                      <span id="profile-rank" className={`stat-value rank-badge rank-${profile.currentRank.toLowerCase()}`}>
                        {profile.currentRank}
                      </span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Games Played</span>
                      <span id="profile-games" className="stat-value">{history.length}</span>
                    </div>
                  </div>

                  {history.length >= 3 && (
                    <div id="profile-insights" className="profile-insights">
                      <div className="insight-row">
                        <span className="insight-icon">📈</span>
                        <div className="insight-content">
                          <span className="insight-label">Performance</span>
                          <span id="profile-trend" className="insight-value">
                            {profile.trendText} {profile.trendIndicator}
                          </span>
                        </div>
                      </div>
                      <div className="insight-row">
                        <span className="insight-icon">💪</span>
                        <div className="insight-content">
                          <span className="insight-label">Strengths</span>
                          <span id="profile-strengths" className="insight-value">
                            {profile.analysis.strengths.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="insight-row">
                        <span className="insight-icon">🎯</span>
                        <div className="insight-content">
                          <span className="insight-label">Focus On</span>
                          <span id="profile-weaknesses" className="insight-value">
                            {profile.analysis.weaknesses.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {profile.recommendation && (
                    <div id="profile-recommendation" className="profile-recommendation">
                      <div className="recommendation-icon">💡</div>
                      <div className="recommendation-content">
                        <div className="recommendation-title">Suggestion</div>
                        <div id="profile-suggestion" className="recommendation-text">
                          {profile.recommendation}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="profile-stats-grid">
                    <div className="profile-stat-item">
                      <span className="stat-label">Brain Age</span>
                      <span className="stat-value">--</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Estimated IQ</span>
                      <span className="stat-value">--</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Memory Score</span>
                      <span className="stat-value">--</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Focus Score</span>
                      <span className="stat-value">--</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Current Rank</span>
                      <span className="stat-value">--</span>
                    </div>
                    <div className="profile-stat-item">
                      <span className="stat-label">Games Played</span>
                      <span className="stat-value">0</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="dashboard-card history-card">
              <h3>Recent Activity</h3>
              <div id="history-list" className="history-list">
                {history.length === 0 ? (
                  <p className="empty-state">No games played yet.</p>
                ) : (
                  history.map((game, index) => {
                    const date = new Date(game.date).toLocaleDateString();
                    return (
                      <div key={index} className="history-item">
                        <div className="info">
                          <div className="score">{game.memoryScore} pts</div>
                          <div className="date">{date} • {game.difficulty}</div>
                        </div>
                        <div className="stats">IQ: {game.iq}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div id="difficulty-section" className="difficulty-selector">
          <h3>Select Difficulty</h3>
          <div className="buttons">
            <button className="btn-difficulty" data-level="easy" onClick={() => handleDifficultySelect('easy')}>
              <div className="diff-icon">🌱</div>
              <div className="diff-info">
                <span className="level-name">Easy</span>
                <span className="level-desc">4x4 Grid • Warmup</span>
              </div>
            </button>
            <button className="btn-difficulty" data-level="medium" onClick={() => handleDifficultySelect('medium')}>
              <div className="diff-icon">🚀</div>
              <div className="diff-info">
                <span className="level-name">Medium</span>
                <span className="level-desc">6x6 Grid • Balanced</span>
              </div>
            </button>
            <button className="btn-difficulty" data-level="hard" onClick={() => handleDifficultySelect('hard')}>
              <div className="diff-icon">🧠</div>
              <div className="diff-info">
                <span className="level-name">Hard</span>
                <span className="level-desc">6x8 Grid • Expert</span>
              </div>
            </button>
          </div>
          <button id="back-to-home-btn" className="btn-text" onClick={handleBack}>Back</button>
        </div>
      )}
    </div>
  );
}

export default StartScreen;

