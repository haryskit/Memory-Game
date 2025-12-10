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
  const [gameId, setGameId] = useState(0);

  // Handle back button
  React.useEffect(() => {
    const handlePopState = (event) => {
      if (currentScreen === 'game') {
        // Prevent default back
        window.history.pushState(null, document.title, window.location.href);

        const confirmLeave = window.confirm("Are you sure you want to quit the game?");
        if (confirmLeave) {
          handleHome();
        }
      }
    };

    if (currentScreen === 'game') {
      // Push a state so we can pop it
      window.history.pushState(null, document.title, window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentScreen]);

  // Handle tab close / refresh
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentScreen === 'game') {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentScreen]);

  const handleStartGame = (level) => {
    setDifficulty(level);
    setCurrentScreen('game');
    setShowModal(false);
    setGameId(prev => prev + 1); // Ensure fresh game on start
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
      setGameId(prev => prev + 1); // Force remount of GameScreen
      setCurrentScreen('game');
    }
  };

  return (
    <div className={`app-container ${currentScreen === 'game' ? 'game-active' : ''}`}>
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {currentScreen === 'start' && <StartScreen onStartGame={handleStartGame} />}
      {currentScreen === 'game' && difficulty && (
        <GameScreen
          key={gameId}
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
    </div>
  );
}

export default App;

