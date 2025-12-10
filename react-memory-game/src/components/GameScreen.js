import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import { generateCards, difficulties } from '../utils/gameLogic';
import '../styles/GameScreen.css';

function GameScreen({ difficulty, onHome, onGameComplete }) {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [seenCards, setSeenCards] = useState(new Map());
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMoveTime, setLastMoveTime] = useState(Date.now());
  const [mistakes, setMistakes] = useState(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const config = difficulties[difficulty];
  const totalPairs = (config.rows * config.cols) / 2;

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  useEffect(() => {
    let interval = null;
    if (matchedPairs < totalPairs) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchedPairs, totalPairs]);

  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0) {
      const timeout = setTimeout(() => {
        onGameComplete({
          time: timer,
          moves,
          difficulty,
          mistakes,
          totalPairs,
          maxCombo,
          moveHistory
        });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [matchedPairs, totalPairs, timer, moves, difficulty, mistakes, maxCombo, moveHistory, onGameComplete]);

  const initializeGame = () => {
    const cardValues = generateCards(totalPairs);
    const newCards = cardValues.map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false
    }));
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setIsLocked(false);
    setSeenCards(new Map());
    setMoveHistory([]);
    setLastMoveTime(Date.now());
    setMistakes(0);
    setCurrentCombo(0);
    setMaxCombo(0);
  };

  const handleCardClick = useCallback((card) => {
    if (isLocked) return;
    if (card.isFlipped) return;
    if (card.isMatched) return;

    // Track seen card
    const newSeenCards = new Map(seenCards);
    if (!newSeenCards.has(card.id)) {
      newSeenCards.set(card.id, { value: card.value, firstSeenTime: Date.now() });
    }
    setSeenCards(newSeenCards);

    // Flip card
    const newFlippedCards = [...flippedCards, card];
    setFlippedCards(newFlippedCards);

    const updatedCards = cards.map(c =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      checkForMatch(newFlippedCards, updatedCards, newSeenCards);
    }
  }, [cards, flippedCards, isLocked, seenCards]);

  const checkForMatch = (flipped, currentCards, seen) => {
    setIsLocked(true);
    const [card1, card2] = flipped;
    const match = card1.value === card2.value;

    const now = Date.now();
    const timeSinceLastMove = now - lastMoveTime;
    setLastMoveTime(now);

    setMoveHistory(prev => [...prev, {
      timeDelta: timeSinceLastMove,
      match: match,
      card1: card1.value,
      card2: card2.value
    }]);

    if (match) {
      const newCombo = currentCombo + 1;
      setCurrentCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      disableCards(flipped, currentCards);
    } else {
      setCurrentCombo(0);
      const index1 = card1.id;
      const index2 = card2.id;
      if (seen.has(index1) || seen.has(index2)) {
        setMistakes(prev => prev + 1);
      }
      unflipCards(flipped, currentCards);
    }
  };

  const disableCards = (flipped, currentCards) => {
    const updatedCards = currentCards.map(c =>
      flipped.some(f => f.id === c.id) ? { ...c, isMatched: true } : c
    );
    setCards(updatedCards);
    setFlippedCards([]);
    setIsLocked(false);
    setMatchedPairs(prev => prev + 1);
  };

  const unflipCards = (flipped, currentCards) => {
    setTimeout(() => {
      const updatedCards = currentCards.map(c =>
        flipped.some(f => f.id === c.id) ? { ...c, isFlipped: false } : c
      );
      setCards(updatedCards);
      setFlippedCards([]);
      setIsLocked(false);
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const gridStyle = {
    '--cols': config.cols,
    maxWidth: difficulty === 'hard' ? '800px' : '600px'
  };

  return (
    <div className="screen active" id="game-screen">
      <header className="game-header">
        <button id="game-home-btn" className="btn-icon" onClick={onHome} aria-label="Home">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
        <div className="stat-box">
          <span className="stat-label">Time</span>
          <span id="timer" className="stat-value">{formatTime(timer)}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Moves</span>
          <span id="moves" className="stat-value">{moves}</span>
        </div>
        <button id="restart-btn" className="btn-icon" onClick={initializeGame} aria-label="Restart">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12" />
          </svg>
        </button>
      </header>

      <div id="game-board" className={`game-board ${difficulty}`} style={gridStyle}>
        {cards.map(card => (
          <Card
            key={card.id}
            value={card.value}
            index={card.id}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => handleCardClick(card)}
          />
        ))}
      </div>
    </div>
  );
}

export default GameScreen;

