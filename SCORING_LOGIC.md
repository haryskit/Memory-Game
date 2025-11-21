# Enhanced Memory Game Scoring Logic

This document explains the advanced scoring algorithms used in the Memory Game. The system is designed to be fair, robust, and rewarding.

## Core Concept: Benchmarks & Performance

The game compares your performance against "Expected Benchmarks" for a competent player.

| Difficulty | Expected Moves | Expected Time (s) | Difficulty Multiplier |
| :--- | :--- | :--- | :--- |
| **Easy** | 16 | 30 | 1.0x |
| **Medium** | 36 | 90 | 1.5x |
| **Hard** | 54 | 150 | 2.5x |

### 1. Base Performance Factor (PF)
We use a power function to calculate performance, ensuring that extremely fast or slow times don't break the scoring.

$$
\text{MoveScore} = \left( \frac{\text{ExpectedMoves}}{\text{ActualMoves}} \right)^{0.8}
$$
$$
\text{TimeScore} = \left( \frac{\text{ExpectedTime}}{\text{ActualTime}} \right)^{0.6}
$$
$$
\text{BasePF} = (\text{MoveScore} \times 0.6) + (\text{TimeScore} \times 0.4)
$$

---

## 2. Penalties & Bonuses

### Mistake Penalty
- **Mistake**: Flipping a card that you have seen before but failing to match it.
- **Penalty**: 10% reduction in score for every full set of mistakes (relative to total pairs).
- **Max Penalty**: Capped at 25%.

### Combo Bonus
- **Combo**: Consecutive matches without a mistake.
- **Bonus**: +2% score boost per combo point.
- **Max Bonus**: Capped at +25%.

### Consistency Factor
- Analyzes your last 5 games.
- If you play consistently (low standard deviation in time), your score is stabilized.
- **Range**: 0.9x to 1.1x.

### Dynamic Difficulty Scaling (DDS)
- If you consistently perform well (PF > 1.2) on a difficulty, the game slightly increases the expectations for you, making it harder to get a high score but more rewarding.

---

## 3. Final Stats Calculation

### Memory Score
$$
\text{Score} = 1000 \times \text{AdjustedPF} \times \text{DifficultyMultiplier}
$$

### Brain Age
Smoother curve to prevent wild swings.
$$
\text{Brain Age} = 25 + (1.0 - \text{AdjustedPF}) \times 35
$$
*   **Range**: 18 - 99

### Estimated IQ
$$
\text{IQ} = 110 + (\text{AdjustedPF} - 1.0) \times 35 \times \text{ConsistencyFactor}
$$
*   **Range**: 75 - 160

### Focus Score (New!)
A percentage score based on your precision and flow.
*   **Factors**: Low Mistakes (50%), Speed (30%), Combos (20%).

### Rank (New!)
Your performance tier based on your Adjusted PF.

| Rank | Required PF |
| :--- | :--- |
| **Legend** | > 1.40 |
| **Genius** | > 1.25 |
| **Pro** | > 1.10 |
| **Skilled** | > 0.95 |
| **Learner** | < 0.95 |
