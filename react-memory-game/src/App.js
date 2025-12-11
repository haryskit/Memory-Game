import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverModal from './components/GameOverModal';
import Onboarding from './components/Onboarding';
import ConfirmationModal from './components/ConfirmationModal';
import { saveGameResult, calculateMedicalStats } from './utils/gameLogic';
import './App.css';

import { NotificationSystem } from './utils/notificationSystem';

function App() {
  const [currentScreen, setCurrentScreen] = useState('loading'); // Start with loading to check auth
  const [difficulty, setDifficulty] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [gameId, setGameId] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('memoryGameUserProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
      setCurrentScreen('start');

      // Initialize Notifications with username
      NotificationSystem.requestPermissions().then((granted) => {
        if (granted) {
          NotificationSystem.scheduleDailyNotifications(profile.name);
        }
      });
    } else {
      setCurrentScreen('onboarding');
    }
  }, []);

  const handleOnboardingComplete = (profile) => {
    localStorage.setItem('memoryGameUserProfile', JSON.stringify(profile));
    setUserProfile(profile);
    setCurrentScreen('start');

    // Initialize Notifications
    NotificationSystem.requestPermissions().then((granted) => {
      if (granted) {
        NotificationSystem.scheduleDailyNotifications(profile.name);
      }
    });
  };

  // Handle back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (currentScreen === 'game') {
        // Prevent default back navigation by pushing state again
        window.history.pushState(null, document.title, window.location.href);
        setShowLeaveModal(true);
      }
    };

    if (currentScreen === 'game') {
      // Push a state so we can pop it
      window.history.pushState(null, document.title, window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up state if component unmounts not via back button
    };
  }, [currentScreen]);

  // Handle tab close / refresh (Browsers do NOT support custom UI for this)
  useEffect(() => {
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
    setShowLeaveModal(false);
  };

  const handleLeaveConfirm = () => {
    handleHome();
  };

  const handleLeaveCancel = () => {
    setShowLeaveModal(false);
  };

  const handleGameComplete = React.useCallback((data) => {
    console.log("Game Complete Data:", data);

    // Ensure all required fields are present to avoid NaN
    // If GameScreen didn't pass them, these defaults or the function defaults will handle it
    const stats = calculateMedicalStats(
      data.time || 0,
      data.moves || 0,
      data.difficulty || 'easy',
      data.mistakes || 0,
      data.totalPairs || 8,
      data.maxCombo || 0
    );

    console.log("Calculated Stats:", stats);
    saveGameResult(stats);
    setGameData(stats);
    setShowModal(true);
  }, []);

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

      {currentScreen === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}

      {currentScreen === 'start' && (
        <StartScreen
          onStartGame={handleStartGame}
          userProfile={userProfile}
        />
      )}

      {currentScreen === 'game' && difficulty && (
        <GameScreen
          key={gameId}
          difficulty={difficulty}
          onHome={() => setShowLeaveModal(true)}
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

      <ConfirmationModal
        isOpen={showLeaveModal}
        title="Leaving so soon?"
        message="Stay a while longer to increase your brain capacity! Are you sure you want to exit?"
        onConfirm={handleLeaveConfirm}
        onCancel={handleLeaveCancel}
        confirmText="Exit Game"
        cancelText="Keep Playing"
      />

      <div id="orientation-lock">
        <div className="icon">📱</div>
        <p>Please Rotate Your Device</p>
      </div>
    </div>
  );
}

export default App;
