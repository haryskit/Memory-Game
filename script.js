document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameBoard = document.getElementById('game-board');
    const timerDisplay = document.getElementById('timer');
    const movesDisplay = document.getElementById('moves');
    const restartBtn = document.getElementById('restart-btn');
    const modal = document.getElementById('game-over-modal');

    // Modal Elements
    const finalTimeDisplay = document.getElementById('final-time');
    const finalMovesDisplay = document.getElementById('final-moves');
    const finalBrainAge = document.getElementById('final-brain-age');
    const finalMemoryScore = document.getElementById('final-memory-score');
    const finalRank = document.getElementById('final-rank');
    const finalFocusScore = document.getElementById('final-focus-score');

    // Analysis Elements
    const advancedAnalysis = document.getElementById('advanced-analysis');
    const analysisStyle = document.getElementById('analysis-style');
    const analysisRetention = document.getElementById('analysis-retention');
    const analysisFocus = document.getElementById('analysis-focus');
    const analysisInsight = document.getElementById('analysis-insight');

    // Buttons
    const playAgainBtn = document.getElementById('play-again-btn');
    const homeBtn = document.getElementById('home-btn');
    const playNowBtn = document.getElementById('play-now-btn');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const gameHomeBtn = document.getElementById('game-home-btn');
    const difficultyBtns = document.querySelectorAll('.btn-difficulty');

    // Sections
    const heroSection = document.querySelector('.hero-section');
    const difficultySection = document.getElementById('difficulty-section');
    const dashboardGrid = document.querySelector('.dashboard-grid');
    const historyList = document.getElementById('history-list');

    // Profile Elements
    const profileBrainAge = document.getElementById('profile-brain-age');
    const profileScore = document.getElementById('profile-score');

    // Game State
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let moves = 0;
    let timer = 0;
    let timerInterval;
    let isLocked = false;
    let currentDifficulty = 'easy';

    // Analysis State
    let seenCards = new Map(); // { cardIndex: { value, firstSeenTime } }
    let moveHistory = []; // { time, card1, card2, isMatch, isError }
    let lastMoveTime = 0;
    let mistakes = 0;
    let currentCombo = 0;
    let maxCombo = 0;

    // Emojis for cards
    const emojis = ['🚀', '🌟', '🎮', '🎨', '🎵', '🍕', '🌈', '🐱', '🐶', '🦄', '🍦', '🍩', '🌍', '🌺', '⚽', '🚗', '💎', '🎁', '🔔', '🔥', '⚡', '💡', '📷', '📚', '🧸', '🎈', '👑', '👓', '🧢', '👟', '🍔', '🍟'];

    // Difficulty Settings
    const difficulties = {
        easy: { rows: 4, cols: 4, label: 'Easy' },
        medium: { rows: 6, cols: 6, label: 'Medium' },
        hard: { rows: 6, cols: 8, label: 'Hard' }
    };

    // Initialize
    loadHistory();
    updateProfile();

    // Event Listeners
    playNowBtn.addEventListener('click', () => {
        heroSection.classList.add('hidden');
        dashboardGrid.classList.add('hidden');
        difficultySection.classList.remove('hidden');
    });

    backToHomeBtn.addEventListener('click', () => {
        difficultySection.classList.add('hidden');
        heroSection.classList.remove('hidden');
        dashboardGrid.classList.remove('hidden');
    });

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.dataset.level;
            startGame(level);
        });
    });

    restartBtn.addEventListener('click', () => {
        resetGame();
        generateCards(totalPairs);
        startTimer();
    });

    playAgainBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        resetGame();
        generateCards(totalPairs);
        startTimer();
    });

    homeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        gameScreen.classList.remove('active');
        startScreen.classList.add('active');

        // Reset Start Screen View
        difficultySection.classList.add('hidden');
        heroSection.classList.remove('hidden');
        dashboardGrid.classList.remove('hidden');

        loadHistory();
        updateProfile();
    });

    gameHomeBtn.addEventListener('click', () => {
        gameScreen.classList.remove('active');
        startScreen.classList.add('active');

        // Reset Start Screen View
        difficultySection.classList.add('hidden');
        heroSection.classList.remove('hidden');
        dashboardGrid.classList.remove('hidden');

        loadHistory();
        updateProfile();
    });

    // Functions
    function startGame(level) {
        currentDifficulty = level;
        const config = difficulties[level];
        const numCards = config.rows * config.cols;
        totalPairs = numCards / 2;

        // Set grid styles
        gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        gameBoard.style.setProperty('--rows', config.rows);
        gameBoard.style.setProperty('--cols', config.cols);

        // Adjust card size based on difficulty
        if (level === 'hard') {
            gameBoard.style.maxWidth = '800px';
        } else {
            gameBoard.style.maxWidth = '600px';
        }

        // Switch screens
        startScreen.classList.remove('active');
        gameScreen.classList.add('active');

        resetGame();
        generateCards(totalPairs);
        startTimer();
    }

    function resetGame() {
        gameBoard.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        timer = 0;
        isLocked = false;

        // Reset Analysis
        seenCards.clear();
        moveHistory = [];
        lastMoveTime = Date.now();
        mistakes = 0;
        currentCombo = 0;
        maxCombo = 0;

        updateStats();
        clearInterval(timerInterval);
    }

    function generateCards(pairsCount) {
        const selectedEmojis = [];
        const availableEmojis = [...emojis];

        for (let i = 0; i < pairsCount; i++) {
            const randomIndex = Math.floor(Math.random() * availableEmojis.length);
            selectedEmojis.push(availableEmojis[randomIndex]);
            availableEmojis.splice(randomIndex, 1);
        }

        const cardValues = [...selectedEmojis, ...selectedEmojis];
        shuffleArray(cardValues);

        cardValues.forEach((value, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.value = value;
            card.dataset.index = index; // Unique index for tracking

            card.innerHTML = `
                <div class="card-face card-front"></div>
                <div class="card-face card-back">${value}</div>
            `;

            card.addEventListener('click', () => flipCard(card));
            gameBoard.appendChild(card);
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function flipCard(card) {
        if (isLocked) return;
        if (card.classList.contains('flipped')) return;
        if (card.classList.contains('matched')) return;

        // Track seen card
        const index = card.dataset.index;
        const value = card.dataset.value;
        if (!seenCards.has(index)) {
            seenCards.set(index, { value, firstSeenTime: Date.now() });
        }

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            updateStats();
            checkForMatch();
        }
    }

    function checkForMatch() {
        isLocked = true;
        const [card1, card2] = flippedCards;
        const match = card1.dataset.value === card2.dataset.value;

        // Analysis Tracking
        const now = Date.now();
        const timeSinceLastMove = now - lastMoveTime;
        lastMoveTime = now;

        let isError = false;
        // Check if we missed a known match
        // Logic: If we flipped card1, and we have seen its pair before (but not card2), that's a missed opportunity?
        // Simpler Logic: If we flip two cards that don't match, and we've seen both before, that's a memory error.
        if (!match) {
            const index1 = card1.dataset.index;
            const index2 = card2.dataset.index;
            // If we've seen both cards before this turn, it's a definite memory lapse
            // Note: We just added them to seenCards in flipCard, so we need to check if they were seen *before* this turn.
            // But for simplicity, let's just track if we fail to match.
            // Better: If we flip A and B (no match), and we previously saw the pair for A (let's say A'), that's an error.

            // Let's count "Memory Errors" as: Flipping a card that we've seen before, but failing to match it.
            // Or: Flipping two cards that don't match, when we SHOULD have known better.
        }

        moveHistory.push({
            timeDelta: timeSinceLastMove,
            match: match,
            card1: card1.dataset.value,
            card2: card2.dataset.value
        });

        if (match) {
            currentCombo++;
            if (currentCombo > maxCombo) maxCombo = currentCombo;
            disableCards();
        } else {
            currentCombo = 0;
            // Check for mistake: if we've seen either card before and didn't match it
            // Or simple logic: A mismatch is a mistake if we should have known better?
            // For simplicity in this enhanced logic, let's count every mismatch as a potential mistake
            // but weight it in the scoring.
            // A stricter definition:
            const index1 = card1.dataset.index;
            const index2 = card2.dataset.index;
            if (seenCards.has(index1) || seenCards.has(index2)) {
                mistakes++;
            }

            unflipCards();
        }
    }

    function disableCards() {
        flippedCards.forEach(card => {
            card.classList.add('matched');
        });

        matchedPairs++;
        flippedCards = [];
        isLocked = false;

        if (matchedPairs === totalPairs) {
            setTimeout(endGame, 500);
        }
    }

    function unflipCards() {
        setTimeout(() => {
            flippedCards.forEach(card => {
                card.classList.remove('flipped');
            });
            flippedCards = [];
            isLocked = false;
        }, 1000);
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            updateStats();
        }, 1000);
    }

    function updateStats() {
        movesDisplay.textContent = moves;
        const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
        const seconds = (timer % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    function endGame() {
        clearInterval(timerInterval);

        // Calculate Stats
        const stats = calculateMedicalStats(timer, moves, currentDifficulty);

        // Update Modal
        finalMovesDisplay.textContent = moves;
        finalTimeDisplay.textContent = timerDisplay.textContent;
        finalBrainAge.textContent = stats.brainAge + ' yrs';
        finalMemoryScore.textContent = stats.memoryScore;
        finalRank.textContent = stats.rank;
        finalFocusScore.textContent = stats.focusScore;

        // Hard Mode Analysis
        if (currentDifficulty === 'hard') {
            advancedAnalysis.classList.remove('hidden');
            const analysis = analyzeGameplay();
            analysisStyle.textContent = analysis.style;
            analysisRetention.textContent = analysis.retention + '%';
            analysisFocus.textContent = analysis.focus;
            analysisInsight.textContent = analysis.insight;
        } else {
            advancedAnalysis.classList.add('hidden');
        }

        // Save Result
        saveGameResult(stats);

        modal.classList.add('active');
    }

    function analyzeGameplay() {
        // 1. Play Style
        // Fast moves + High Moves = Impulsive
        // Slow moves + Low Moves = Methodical
        const avgTimePerMove = (timer * 1000) / moves; // in ms
        let style = "Balanced";
        if (avgTimePerMove < 1500) style = "Impulsive";
        if (avgTimePerMove > 4000) style = "Methodical";
        if (moves <= totalPairs + 5) style = "Strategic"; // Very few mistakes

        // 2. Retention Rate
        // Estimate: How many "useless" flips did we make?
        // Perfect game = totalPairs moves.
        // Extra moves = moves - totalPairs.
        // Retention = 100 - (Extra Moves / Total Moves * 100)
        // This is a rough proxy but works for a game.
        const extraMoves = Math.max(0, moves - totalPairs);
        let retention = Math.round(100 - (extraMoves / moves * 100));
        if (retention < 0) retention = 0;

        // 3. Focus Score
        // Based on consistency of move times.
        // Calculate variance of timeDelta in moveHistory
        const times = moveHistory.map(m => m.timeDelta);
        const mean = times.reduce((a, b) => a + b, 0) / times.length;
        const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
        const stdDev = Math.sqrt(variance);

        let focus = "High";
        if (stdDev > 2000) focus = "Variable";
        if (stdDev > 4000) focus = "Distracted";

        // Insight
        let insight = "Good effort! Keep practicing to improve consistency.";
        if (style === "Impulsive") insight = "You're playing fast! Try slowing down to improve accuracy.";
        if (style === "Methodical") insight = "Great patience! You take your time to ensure matches.";
        if (retention > 80) insight = "Incredible memory! You barely made any mistakes.";
        if (focus === "Distracted") insight = "Your pace varied a lot. Try to maintain a steady rhythm.";

        return { style, retention, focus, insight };
    }

    function calculateMedicalStats(time, moves, difficulty) {
        // 1. Benchmarks & Config
        const benchmarks = {
            easy: { expectedMoves: 16, expectedTime: 30, difficultyMultiplier: 1 },
            medium: { expectedMoves: 36, expectedTime: 90, difficultyMultiplier: 1.5 },
            hard: { expectedMoves: 54, expectedTime: 150, difficultyMultiplier: 2.5 }
        };
        const config = benchmarks[difficulty];

        // Dynamic Difficulty Scaling (DDS) - Check history for this difficulty
        const history = JSON.parse(localStorage.getItem('memoryGameHistory') || '[]');
        const recentGames = history.filter(g => g.difficulty === difficulty).slice(0, 5);
        let ddsMultiplier = 1.0;
        if (recentGames.length >= 3) {
            const avgPF = recentGames.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / recentGames.length;
            if (avgPF > 1.2) ddsMultiplier = 1.1; // Increase expectations slightly for good players
        }

        const expectedMoves = config.expectedMoves * ddsMultiplier;
        const expectedTime = config.expectedTime * ddsMultiplier;

        // 2. Robust Performance Factor
        const actualMoves = Math.max(moves, 1);
        const actualTime = Math.max(time, 1);

        // Diminishing returns using power functions
        const moveScore = Math.pow(expectedMoves / actualMoves, 0.8);
        const timeScore = Math.pow(expectedTime / actualTime, 0.6);

        let performanceFactor = (moveScore * 0.6) + (timeScore * 0.4);

        // 3. Penalties & Bonuses
        // Mistake Penalty
        // Mistake = mismatch where we had seen a card.
        // Let's be lenient: mistakes relative to total pairs
        const mistakeRatio = mistakes / totalPairs;
        let mistakePenalty = 1 - (mistakeRatio * 0.1); // 10% penalty per full set of mistakes
        mistakePenalty = Math.max(mistakePenalty, 0.75); // Max 25% penalty

        // Combo Bonus
        let comboBonus = 1 + (maxCombo * 0.02); // 2% per combo
        comboBonus = Math.min(comboBonus, 1.25); // Max 25% bonus

        // Consistency Factor
        let consistencyFactor = 1.0;
        if (recentGames.length >= 3) {
            const times = recentGames.map(g => g.time || 0);
            const mean = times.reduce((a, b) => a + b, 0) / times.length;
            const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
            const stdDev = Math.sqrt(variance);

            // Lower stdDev is better. 
            // If stdDev is 10s, factor = 0.9. If 0s, factor = 1.0.
            consistencyFactor = 1 - (stdDev / 100);
            consistencyFactor = Math.max(0.9, Math.min(consistencyFactor, 1.1));
        }

        // Final Adjusted Performance Factor
        // We don't apply consistency to the raw score, but maybe to the Rank/IQ?
        // Let's apply penalties/bonuses to the PF first
        let adjustedPF = performanceFactor * mistakePenalty * comboBonus;

        // 4. Calculate Stats

        // Memory Score
        let memoryScore = Math.round(1000 * adjustedPF * config.difficultyMultiplier);
        const maxScore = 3000 * config.difficultyMultiplier;
        if (memoryScore > maxScore) memoryScore = maxScore;
        if (memoryScore < 0) memoryScore = 0;

        // Brain Age
        // Smoother curve: 25 + (1 - PF) * 35
        let baseAge = 25;
        let ageChange = (1.0 - adjustedPF) * 35;
        let brainAge = Math.round(baseAge + ageChange);
        if (brainAge < 18) brainAge = 18;
        if (brainAge > 99) brainAge = 99;

        // IQ
        // Smoother curve: 110 + (PF - 1) * 35
        let baseIQ = 110;
        let iqChange = (adjustedPF - 1.0) * 35;
        // Apply consistency to IQ (stable players get better IQ estimates)
        iqChange *= consistencyFactor;

        let iq = Math.round(baseIQ + iqChange);
        if (iq < 75) iq = 75;
        if (iq > 160) iq = 160;

        // Focus Score
        // (mistakeFactor*0.4 + paceFactor*0.2 + timeFactor*0.2 + comboFactor*0.2) * 100
        const mistakeFactor = Math.max(0, 1 - (mistakes / totalPairs)); // 1.0 if 0 mistakes
        const timeFactor = Math.min(1, expectedTime / actualTime);
        const comboFactor = Math.min(1, maxCombo / 5); // 5 combo = max

        let focusScore = Math.round((mistakeFactor * 0.5 + timeFactor * 0.3 + comboFactor * 0.2) * 100);
        if (focusScore > 100) focusScore = 100;

        // Rank
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
            performanceFactor: adjustedPF, // Save for history
            time, // Save for history
            date: new Date().toISOString()
        };
    }

    function saveGameResult(stats) {
        const history = JSON.parse(localStorage.getItem('memoryGameHistory') || '[]');
        history.unshift(stats);
        if (history.length > 50) history.pop();
        localStorage.setItem('memoryGameHistory', JSON.stringify(history));
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('memoryGameHistory') || '[]');
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No games played yet.</p>';
            return;
        }

        history.forEach(game => {
            const date = new Date(game.date).toLocaleDateString();
            const item = document.createElement('div');
            item.classList.add('history-item');
            item.innerHTML = `
                <div class="info">
                    <div class="score">${game.memoryScore} pts</div>
                    <div class="date">${date} • ${game.difficulty}</div>
                </div>
                <div class="stats">
                    IQ: ${game.iq}
                </div>
            `;
            historyList.appendChild(item);
        });
    }

    function updateProfile() {
        const history = JSON.parse(localStorage.getItem('memoryGameHistory') || '[]');

        // Get all profile elements
        const profileBrainAge = document.getElementById('profile-brain-age');
        const profileIQ = document.getElementById('profile-iq');
        const profileScore = document.getElementById('profile-score');
        const profileFocus = document.getElementById('profile-focus');
        const profileRank = document.getElementById('profile-rank');
        const profileGames = document.getElementById('profile-games');
        const profileTrend = document.getElementById('profile-trend');
        const profileStrengths = document.getElementById('profile-strengths');
        const profileWeaknesses = document.getElementById('profile-weaknesses');
        const profileSuggestion = document.getElementById('profile-suggestion');
        const profileInsights = document.getElementById('profile-insights');
        const profileRecommendation = document.getElementById('profile-recommendation');

        if (history.length === 0) {
            profileBrainAge.textContent = '--';
            profileIQ.textContent = '--';
            profileScore.textContent = '--';
            profileFocus.textContent = '--';
            profileRank.textContent = '--';
            profileGames.textContent = '0';
            profileInsights.classList.add('hidden');
            profileRecommendation.classList.add('hidden');
            return;
        }

        // === CORE STATISTICS ===

        // Calculate averages
        const avgBrainAge = Math.round(history.reduce((sum, g) => sum + g.brainAge, 0) / history.length);
        const avgIQ = Math.round(history.reduce((sum, g) => sum + g.iq, 0) / history.length);
        const maxScore = Math.max(...history.map(g => g.memoryScore));
        const avgFocus = Math.round(history.reduce((sum, g) => sum + g.focusScore, 0) / history.length);

        // Calculate current rank (based on recent performance)
        const recentGames = history.slice(0, 5);
        const avgRecentPF = recentGames.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / recentGames.length;
        let currentRank = "Learner";
        if (avgRecentPF > 1.4) currentRank = "Legend";
        else if (avgRecentPF > 1.25) currentRank = "Genius";
        else if (avgRecentPF > 1.10) currentRank = "Pro";
        else if (avgRecentPF > 0.95) currentRank = "Skilled";

        // === PERFORMANCE TRENDS ===
        let trendText = "Stable";
        let trendIndicator = "↔️";

        if (history.length >= 10) {
            const recent5 = history.slice(0, 5);
            const previous5 = history.slice(5, 10);
            const recentAvgPF = recent5.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / 5;
            const previousAvgPF = previous5.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / 5;

            if (recentAvgPF > previousAvgPF * 1.05) {
                trendText = "Improving";
                trendIndicator = "↗️";
            } else if (recentAvgPF < previousAvgPF * 0.95) {
                trendText = "Needs Practice";
                trendIndicator = "↘️";
            }
        } else if (history.length >= 3) {
            // For smaller histories, check if last game is better than average
            const lastPF = history[0].performanceFactor || 1;
            const avgPF = history.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / history.length;

            if (lastPF > avgPF * 1.1) {
                trendText = "Improving";
                trendIndicator = "↗️";
            } else if (lastPF < avgPF * 0.9) {
                trendText = "Needs Practice";
                trendIndicator = "↘️";
            }
        }

        // === STRENGTHS & WEAKNESSES ANALYSIS ===
        const analysis = analyzePerformance(history);

        // === PERSONALIZED RECOMMENDATION ===
        const recommendation = generateRecommendation(history, analysis);

        // === UPDATE UI ===

        // Core stats with trend indicators
        const brainAgeTrend = getTrendIndicatorForMetric(history, 'brainAge', true); // true = lower is better
        const iqTrend = getTrendIndicatorForMetric(history, 'iq', false); // false = higher is better
        const scoreTrend = getTrendIndicatorForMetric(history, 'memoryScore', false);
        const focusTrend = getTrendIndicatorForMetric(history, 'focusScore', false);

        profileBrainAge.textContent = `${avgBrainAge} yrs ${brainAgeTrend}`;
        profileIQ.textContent = `${avgIQ} ${iqTrend}`;
        profileScore.textContent = `${maxScore} ${scoreTrend}`;
        profileFocus.textContent = `${avgFocus}% ${focusTrend}`;
        profileRank.textContent = currentRank;
        profileGames.textContent = history.length;

        // Show insights only if we have enough data
        if (history.length >= 3) {
            profileInsights.classList.remove('hidden');
            profileTrend.textContent = `${trendText} ${trendIndicator}`;
            profileStrengths.textContent = analysis.strengths.join(', ');
            profileWeaknesses.textContent = analysis.weaknesses.join(', ');
        } else {
            profileInsights.classList.add('hidden');
        }

        // Show recommendation
        if (recommendation) {
            profileRecommendation.classList.remove('hidden');
            profileSuggestion.textContent = recommendation;
        } else {
            profileRecommendation.classList.add('hidden');
        }

        // Add rank color coding
        profileRank.className = 'stat-value rank-badge rank-' + currentRank.toLowerCase();
    }

    // Helper: Get trend indicator for a specific metric
    function getTrendIndicatorForMetric(history, metricName, lowerIsBetter = false) {
        if (history.length < 3) return '';

        const recent = history.slice(0, Math.min(3, history.length));
        const older = history.slice(3, Math.min(6, history.length));

        if (older.length === 0) return '';

        const recentAvg = recent.reduce((sum, g) => sum + (g[metricName] || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, g) => sum + (g[metricName] || 0), 0) / older.length;

        const threshold = 1.05; // 5% change threshold
        const isImproving = lowerIsBetter ? (recentAvg < olderAvg / threshold) : (recentAvg > olderAvg * threshold);
        const isDeclining = lowerIsBetter ? (recentAvg > olderAvg * threshold) : (recentAvg < olderAvg / threshold);

        if (isImproving) return '↗️';
        if (isDeclining) return '↘️';
        return '↔️';
    }

    // Analyze performance across key areas
    function analyzePerformance(history) {
        if (history.length < 3) {
            return {
                strengths: ['Not enough data'],
                weaknesses: ['Play more games']
            };
        }

        const scores = {
            speed: 0,
            accuracy: 0,
            consistency: 0,
            focus: 0
        };

        // Analyze each game
        history.forEach(game => {
            const benchmarks = {
                easy: { expectedTime: 30, expectedMoves: 16 },
                medium: { expectedTime: 90, expectedMoves: 36 },
                hard: { expectedTime: 150, expectedMoves: 54 }
            };
            const bench = benchmarks[game.difficulty] || benchmarks.medium;

            // Speed: time performance
            const timeRatio = bench.expectedTime / (game.time || bench.expectedTime);
            scores.speed += timeRatio;

            // Accuracy: move efficiency (we don't have moves in saved data, use PF as proxy)
            const pf = game.performanceFactor || 1;
            scores.accuracy += pf;

            // Focus: based on focus score
            scores.focus += (game.focusScore || 50) / 100;
        });

        // Calculate averages
        Object.keys(scores).forEach(key => {
            scores[key] = scores[key] / history.length;
        });

        // Consistency: calculate standard deviation of performance factors
        const pfs = history.map(g => g.performanceFactor || 1);
        const avgPF = pfs.reduce((a, b) => a + b, 0) / pfs.length;
        const variance = pfs.reduce((sum, pf) => sum + Math.pow(pf - avgPF, 2), 0) / pfs.length;
        const stdDev = Math.sqrt(variance);
        scores.consistency = Math.max(0, 1 - stdDev); // Lower stdDev = higher consistency

        // Identify top 2 strengths and weaknesses
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

    // Generate personalized recommendation
    function generateRecommendation(history, analysis) {
        if (history.length === 0) return null;

        const lastGame = history[0];
        const lastGameDate = new Date(lastGame.date);
        const daysSinceLastGame = Math.floor((Date.now() - lastGameDate) / (1000 * 60 * 60 * 24));

        // Check time since last play
        if (daysSinceLastGame > 7) {
            return "Welcome back! Start with Easy mode to warm up your memory.";
        }

        // Check difficulty progression
        const recentGames = history.slice(0, 5);
        const difficultyCount = {
            easy: recentGames.filter(g => g.difficulty === 'easy').length,
            medium: recentGames.filter(g => g.difficulty === 'medium').length,
            hard: recentGames.filter(g => g.difficulty === 'hard').length
        };

        // Calculate average PF for each difficulty
        const avgPFByDifficulty = {};
        ['easy', 'medium', 'hard'].forEach(diff => {
            const games = history.filter(g => g.difficulty === diff);
            if (games.length > 0) {
                avgPFByDifficulty[diff] = games.reduce((sum, g) => sum + (g.performanceFactor || 1), 0) / games.length;
            }
        });

        // Suggest difficulty progression
        if (avgPFByDifficulty.easy && avgPFByDifficulty.easy > 1.2 && difficultyCount.easy >= 3 && !avgPFByDifficulty.medium) {
            return "You're mastering Easy mode! Try Medium difficulty to challenge yourself.";
        }
        if (avgPFByDifficulty.medium && avgPFByDifficulty.medium > 1.2 && difficultyCount.medium >= 3 && !avgPFByDifficulty.hard) {
            return "Great performance on Medium! You're ready for Hard mode.";
        }

        // Based on weaknesses
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

        // Based on rank
        const lastRank = lastGame.rank || 'Learner';
        if (lastRank === 'Legend' || lastRank === 'Genius') {
            return "Outstanding performance! Keep challenging yourself on Hard mode.";
        }

        // Generic encouragement
        const recentPF = (lastGame.performanceFactor || 1);
        if (recentPF > 1.1) {
            return "Great job! You're performing above average. Keep it up!";
        } else if (recentPF < 0.9) {
            return "Practice makes perfect! Try playing a few games to improve your score.";
        }

        return "Keep practicing to improve your memory and cognitive skills!";
    }
});
