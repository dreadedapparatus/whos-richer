import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Play, RefreshCw, XCircle } from 'lucide-react';
import { CELEBRITIES, Celebrity } from './data/celebrities';
import { CelebrityCard } from './components/CelebrityCard';

type GameState = 'start' | 'playing' | 'gameover';

const getRandomPair = (celebrities: Celebrity[], exclude?: Celebrity[], score: number = 0): [Celebrity, Celebrity] => {
  let pool = celebrities;
  if (exclude && exclude.length > 0) {
    pool = celebrities.filter(c => !exclude.find(e => e.name === c.name));
  }
  
  if (pool.length < 2) {
    pool = celebrities; // fallback
  }

  // Generate all possible pairs
  const allPairs: [Celebrity, Celebrity, number][] = [];
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const diff = Math.abs(pool[i].netWorth - pool[j].netWorth);
      allPairs.push([pool[i], pool[j], diff]);
    }
  }

  // Sort pairs by difference descending (easiest to hardest)
  allPairs.sort((a, b) => b[2] - a[2]);

  // Calculate window based on score
  // Max difficulty reached at score 30
  const maxScore = 30;
  const difficultyProgress = Math.min(score / maxScore, 1);
  
  // Window size: 10% of all pairs, minimum 50
  const windowSize = Math.max(50, Math.floor(allPairs.length * 0.1));
  
  // Slide the window down the sorted array as score increases
  const maxStartIndex = allPairs.length - windowSize;
  const startIndex = Math.floor(difficultyProgress * maxStartIndex);
  
  const validPairs = allPairs.slice(startIndex, startIndex + windowSize);

  // Pick a random pair from the window
  const selected = validPairs[Math.floor(Math.random() * validPairs.length)];

  // Randomize the left/right position
  if (Math.random() > 0.5) {
    return [selected[0], selected[1]];
  } else {
    return [selected[1], selected[0]];
  }
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [currentPair, setCurrentPair] = useState<[Celebrity, Celebrity] | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('netWorthHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setStrikes(0);
    setGameState('playing');
    setIsRevealed(false);
    setSelectedIdx(null);
    setWinnerIdx(null);
    setCurrentPair(getRandomPair(CELEBRITIES, undefined, 0));
  }, []);

  const handleGuess = (idx: number) => {
    if (isRevealed || !currentPair) return;

    setSelectedIdx(idx);
    setIsRevealed(true);

    const celeb1 = currentPair[0];
    const celeb2 = currentPair[1];

    const actualWinnerIdx = celeb1.netWorth >= celeb2.netWorth ? 0 : 1;
    setWinnerIdx(actualWinnerIdx);

    const isCorrect = idx === actualWinnerIdx;

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('netWorthHighScore', newScore.toString());
      }
      
      setTimeout(() => {
        setIsRevealed(false);
        setSelectedIdx(null);
        setWinnerIdx(null);
        // Get a completely new pair, excluding the current pair to avoid consecutive repeats
        setCurrentPair(getRandomPair(CELEBRITIES, currentPair, newScore));
      }, 2000);
    } else {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      
      setTimeout(() => {
        if (newStrikes >= 3) {
          setGameState('gameover');
        } else {
          setIsRevealed(false);
          setSelectedIdx(null);
          setWinnerIdx(null);
          // Get a completely new pair, excluding the current pair
          setCurrentPair(getRandomPair(CELEBRITIES, currentPair, score));
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full p-3 sm:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-zinc-950 to-transparent">
        <div className="flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-bold tracking-tight">
          <span className="text-emerald-400">$</span>
          <span>NetWorth</span>
          <span className="text-zinc-500">Guesser</span>
        </div>
        
        {gameState === 'playing' && (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Score</span>
              <span className="text-2xl font-black">{score}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <Trophy className="w-3 h-3" /> High
              </span>
              <span className="text-2xl font-black text-amber-400">{highScore}</span>
            </div>
            <div className="flex gap-1 ml-2 sm:ml-4">
              {[...Array(3)].map((_, i) => (
                <X 
                  key={i} 
                  strokeWidth={3}
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${i < strikes ? 'text-red-500' : 'text-zinc-700'}`} 
                />
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 md:pt-24 md:pb-12 px-4 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-5xl sm:text-8xl font-black tracking-tighter mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                Who is Richer?
              </h1>
              <p className="text-lg sm:text-xl text-zinc-400 mb-8 sm:mb-12 leading-relaxed">
                Test your knowledge of the world's wealthiest people. 
                Guess correctly to build your streak. 3 strikes and you're out!
              </p>
              <button 
                onClick={startGame}
                className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 md:px-8 md:py-4 bg-white text-zinc-950 font-bold text-lg sm:text-xl rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="w-6 h-6 fill-current" /> Play Now
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && currentPair && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-6xl mx-auto"
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
                <div className="w-full md:w-1/2 flex justify-end">
                  <CelebrityCard 
                    celebrity={currentPair[0]}
                    isRevealed={isRevealed}
                    isWinner={winnerIdx === 0}
                    isSelected={selectedIdx === 0}
                    onClick={() => handleGuess(0)}
                    disabled={isRevealed}
                  />
                </div>
                
                <div className="flex items-center justify-center z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-800 border-4 border-zinc-950 flex items-center justify-center text-sm md:text-xl font-black text-zinc-400 shadow-2xl">
                    VS
                  </div>
                </div>

                <div className="w-full md:w-1/2 flex justify-start">
                  <CelebrityCard 
                    celebrity={currentPair[1]}
                    isRevealed={isRevealed}
                    isWinner={winnerIdx === 1}
                    isSelected={selectedIdx === 1}
                    onClick={() => handleGuess(1)}
                    disabled={isRevealed}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md mx-auto bg-zinc-900/80 backdrop-blur-xl p-12 rounded-3xl border border-zinc-800 shadow-2xl"
            >
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-4xl font-black mb-2">Game Over</h2>
              <p className="text-zinc-400 mb-8">You got 3 strikes!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <div className="text-sm text-zinc-500 uppercase tracking-widest font-semibold mb-1">Score</div>
                  <div className="text-3xl font-black">{score}</div>
                </div>
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <div className="text-sm text-zinc-500 uppercase tracking-widest font-semibold mb-1 flex items-center justify-center gap-1">
                    <Trophy className="w-3 h-3" /> High
                  </div>
                  <div className="text-3xl font-black text-amber-400">{highScore}</div>
                </div>
              </div>

              <button 
                onClick={startGame}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-lg rounded-2xl transition-colors"
              >
                <RefreshCw className="w-5 h-5" /> Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
