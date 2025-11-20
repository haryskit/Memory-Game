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
    const finalIQ = document.getElementById('final-iq');
    const finalMemoryScore = document.getElementById('final-memory-score');

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
    const difficultyBtns = document.querySelectorAll('.btn-difficulty');

    // Sections
    const heroSection = document.querySelector('.hero-section');
    const difficultySection = document.getElementById('difficulty-section');
    const dashboardGrid = document.querySelector('.dashboard-grid');
    const historyList = document.getElementById('history-list');

    // Profile Elements
    const profileBrainAge = document.getElementById('profile-brain-age');
    const profileIQ = document.getElementById('profile-iq');
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
            disableCards();
        } else {
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
        finalIQ.textContent = stats.iq;
        finalMemoryScore.textContent = stats.memoryScore;

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
        // Base values
        let baseScore = 1000;
        let difficultyMultiplier = 1;

        if (difficulty === 'medium') difficultyMultiplier = 1.5;
        if (difficulty === 'hard') difficultyMultiplier = 2;

        // Memory Score Calculation
        const timePenalty = time * 2;
        const movePenalty = moves * 5;
        let memoryScore = Math.max(0, Math.round((baseScore * difficultyMultiplier) - timePenalty - movePenalty));

        // Brain Age Calculation
        let baseAge = 20;
        let agePenalty = Math.max(0, (600 - memoryScore) / 20);
        let brainAge = Math.round(baseAge + agePenalty);
        if (brainAge < 18) brainAge = 18;
        if (brainAge > 90) brainAge = 90;

        // IQ Calculation
        let baseIQ = 100;
        let iqBonus = Math.max(0, (memoryScore - 500) / 10);
        let iq = Math.round(baseIQ + iqBonus);

        return {
            memoryScore,
            brainAge,
            iq,
            difficulty,
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

        if (history.length === 0) {
            profileBrainAge.textContent = '--';
            profileIQ.textContent = '--';
            profileScore.textContent = '--';
            return;
        }

        const totalBrainAge = history.reduce((sum, game) => sum + game.brainAge, 0);
        const totalIQ = history.reduce((sum, game) => sum + game.iq, 0);
        const maxScore = Math.max(...history.map(game => game.memoryScore));

        profileBrainAge.textContent = Math.round(totalBrainAge / history.length) + ' yrs';
        profileIQ.textContent = Math.round(totalIQ / history.length);
        profileScore.textContent = maxScore;
    }
});
