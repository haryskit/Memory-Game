import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverModal from './components/GameOverModal';
import { saveGameResult } from './utils/gameLogic';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('start');
  const [difficulty, setDifficulty] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleStartGame = (level) => {
    setDifficulty(level);
    setCurrentScreen('game');
    setShowModal(false);
  };

  const handleHome = () => {
    setCurrentScreen('start');
    setShowModal(false);
    setGameData(null);
  };

  const handleGameComplete = (data) => {
    const { calculateMedicalStats } = require('./utils/gameLogic');
    const stats = calculateMedicalStats(
      data.time,
      data.moves,
      data.difficulty,
      data.mistakes,
      data.totalPairs,
      data.maxCombo
    );
    saveGameResult(stats);
    setGameData(data);
    setShowModal(true);
  };

  const handlePlayAgain = () => {
    setShowModal(false);
    setGameData(null);
    if (difficulty) {
      setCurrentScreen('game');
    }
  };

  return (
    <div className="app-container">
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {currentScreen === 'start' && <StartScreen onStartGame={handleStartGame} />}
      {currentScreen === 'game' && difficulty && (
        <GameScreen
          difficulty={difficulty}
          onHome={handleHome}
          onGameComplete={handleGameComplete}
        />
      )}

      {showModal && (
        <GameOverModal
          gameData={gameData}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
        />
      )}

      <footer className="site-footer">
        <p className="footer-text">
          Crafted with <span className="footer-heart">❤️</span> by <span className="footer-name">Harshit Singh
            Chouhan</span>
        </p>
        <p className="footer-copyright">© 2025 Memory Master. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

