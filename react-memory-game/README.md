# Memory Master - React Version

A modern memory card matching game built with React, featuring brain age assessment, IQ estimation, and detailed performance analytics.

## Features

- 🎮 Three difficulty levels (Easy, Medium, Hard)
- 🧠 Brain age and IQ estimation
- 📊 Performance tracking and analytics
- 📈 Detailed game history
- 💡 Personalized recommendations
- 🎨 Beautiful, modern UI with glassmorphism design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd react-memory-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
react-memory-game/
├── public/
│   ├── images/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Card.js
│   │   ├── GameScreen.js
│   │   ├── GameOverModal.js
│   │   └── StartScreen.js
│   ├── styles/
│   │   ├── Card.css
│   │   ├── GameOverModal.css
│   │   ├── GameScreen.css
│   │   └── StartScreen.css
│   ├── utils/
│   │   └── gameLogic.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## Technologies Used

- React 18.2.0
- CSS3 (with CSS Variables and Animations)
- LocalStorage API for data persistence

## Game Mechanics

The game uses an advanced scoring algorithm that considers:
- Time taken to complete
- Number of moves
- Mistakes made
- Combo streaks
- Consistency across games

For detailed scoring logic, see `SCORING_LOGIC.md` in the parent directory.

## License

© 2025 Memory Master. All rights reserved.

Crafted with ❤️ by Harshit Singh Chouhan

