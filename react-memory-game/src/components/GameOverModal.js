import React, { useMemo } from 'react';
import { calculateMedicalStats, analyzeGameplay } from '../utils/gameLogic';
import '../styles/GameOverModal.css';

function GameOverModal({ gameData, onPlayAgain, onHome }) {
  const stats = useMemo(() => {
    if (!gameData) return null;
    return calculateMedicalStats(
      gameData.time,
      gameData.moves,
      gameData.difficulty,
      gameData.mistakes,
      gameData.totalPairs,
      gameData.maxCombo
    );
  }, [gameData]);

  const analysis = useMemo(() => {
    if (!gameData || gameData.difficulty !== 'hard' || !gameData.moveHistory) {
      return null;
    }
    return analyzeGameplay(gameData.time, gameData.moves, gameData.moveHistory);
  }, [gameData]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  if (!gameData || !stats) return null;

  return (
    <div className="modal active" id="game-over-modal">
      <div className="modal-content">
        <h2>Assessment Complete</h2>
        <p className="modal-subtitle">Here is your brain performance report</p>

        <div className="assessment-grid">
          <div className="assessment-item">
            <span className="label">Rank</span>
            <span id="final-rank" className="value highlight">{stats.rank}</span>
          </div>
          <div className="assessment-item">
            <span className="label">Brain Age</span>
            <span id="final-brain-age" className="value highlight">{stats.brainAge} yrs</span>
          </div>
          <div className="assessment-item">
            <span className="label">Memory Score</span>
            <span id="final-memory-score" className="value highlight">{stats.memoryScore}</span>
          </div>
          <div className="assessment-item">
            <span className="label">Focus Score</span>
            <span id="final-focus-score" className="value highlight">{stats.focusScore}</span>
          </div>
        </div>

        {analysis && (
          <div id="advanced-analysis" className="advanced-analysis">
            <h3>Advanced Analysis</h3>
            <div className="analysis-row">
              <div className="analysis-item">
                <span className="label">Play Style</span>
                <span id="analysis-style" className="value-badge">{analysis.style}</span>
              </div>
              <div className="analysis-item">
                <span className="label">Retention</span>
                <span id="analysis-retention" className="value">{analysis.retention}%</span>
              </div>
              <div className="analysis-item">
                <span className="label">Focus</span>
                <span id="analysis-focus" className="value">{analysis.focus}</span>
              </div>
            </div>
            <p id="analysis-insight" className="analysis-insight">{analysis.insight}</p>
          </div>
        )}

        <div className="final-stats-row">
          <span>Time: <strong id="final-time">{formatTime(gameData.time)}</strong></span>
          <span>Moves: <strong id="final-moves">{gameData.moves}</strong></span>
        </div>

        <div className="modal-actions">
          <button id="play-again-btn" className="btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <button id="home-btn" className="btn-secondary" onClick={onHome}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;

