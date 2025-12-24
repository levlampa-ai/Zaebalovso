import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Direction, Point } from '../types';

const TILE_COUNT = 20; 
const SPEED = 150;

const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
  </svg>
);

interface GameBtnProps {
  onClick: () => void;
  rotate?: number;
}

const GameBtn: React.FC<GameBtnProps> = ({ onClick, rotate = 0 }) => (
  <button 
    className="h-16 w-16 bg-gradient-to-b from-white to-gray-200 rounded-2xl shadow-[0_5px_0_rgb(180,180,180),0_10px_20px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[5px] flex items-center justify-center text-gray-700 transition-all border border-white/50"
    onPointerDown={(e) => { e.preventDefault(); onClick(); }}
  >
    <div style={{ transform: `rotate(${rotate}deg)` }}>
      <ChevronIcon />
    </div>
  </button>
);

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawnFood = () => ({
    x: Math.floor(Math.random() * TILE_COUNT),
    y: Math.floor(Math.random() * TILE_COUNT),
  });

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(spawnFood());
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
  };

  const handleInput = useCallback((newDir: Direction) => {
    const currentDir = directionRef.current;
    if (newDir === 'UP' && currentDir !== 'DOWN') directionRef.current = 'UP';
    if (newDir === 'DOWN' && currentDir !== 'UP') directionRef.current = 'DOWN';
    if (newDir === 'LEFT' && currentDir !== 'RIGHT') directionRef.current = 'LEFT';
    if (newDir === 'RIGHT' && currentDir !== 'LEFT') directionRef.current = 'RIGHT';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': handleInput('UP'); break;
        case 'ArrowDown': handleInput('DOWN'); break;
        case 'ArrowLeft': handleInput('LEFT'); break;
        case 'ArrowRight': handleInput('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, gameStarted]);

  useEffect(() => {
    if (gameOver || !gameStarted) return;
    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        const currentDir = directionRef.current;
        setDirection(currentDir);
        if (currentDir === 'UP') head.y -= 1;
        if (currentDir === 'DOWN') head.y += 1;
        if (currentDir === 'LEFT') head.x -= 1;
        if (currentDir === 'RIGHT') head.x += 1;
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT || prevSnake.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }
        const newSnake = [head, ...prevSnake];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood(spawnFood());
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };
    gameLoopRef.current = setInterval(moveSnake, SPEED);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [food, gameOver, gameStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width; 
    const tileSize = size / TILE_COUNT;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(food.x * tileSize + tileSize / 2, food.y * tileSize + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    snake.forEach((segment) => {
      ctx.beginPath();
      ctx.roundRect(segment.x * tileSize + 1, segment.y * tileSize + 1, tileSize - 2, tileSize - 2, 4);
      ctx.fill();
    });
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="mb-6 flex justify-between items-center w-full px-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Survival Mode</span>
          <span className="text-xl font-black text-gray-800 tracking-tighter">SNAKE GAME</span>
        </div>
        <div className="bg-white/80 px-4 py-1 rounded-full border border-gray-200 shadow-sm flex items-center gap-3">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           <span className="text-2xl font-black text-gray-900 tabular-nums">{score}</span>
        </div>
      </div>

      <div className="relative group">
        <canvas
          ref={canvasRef}
          width="400"
          height="400"
          className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-white w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xl flex flex-col items-center justify-center rounded-[2rem] transition-all duration-500">
            {gameOver && (
              <div className="text-center mb-6">
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter">Game Over</h3>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Score: {score}</p>
              </div>
            )}
            <button
              onClick={resetGame}
              className="px-10 py-4 bg-white text-gray-900 font-black rounded-2xl hover:bg-indigo-50 transition shadow-2xl uppercase text-sm tracking-[0.2em] active:scale-95 transform"
            >
              {gameOver ? 'Try Again' : 'Start Mission'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="mt-10 grid grid-cols-3 gap-5 md:hidden">
        <div /> <GameBtn onClick={() => handleInput('UP')} /> <div />
        <GameBtn onClick={() => handleInput('LEFT')} rotate={-90} />
        <GameBtn onClick={() => handleInput('DOWN')} rotate={180} />
        <GameBtn onClick={() => handleInput('RIGHT')} rotate={90} />
      </div>

      <div className="hidden md:flex mt-8 items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-default">
        <div className="flex gap-1">
          <kbd className="px-2 py-1 bg-white rounded-md border border-gray-300 text-[9px] font-black shadow-sm">▲</kbd>
          <kbd className="px-2 py-1 bg-white rounded-md border border-gray-300 text-[9px] font-black shadow-sm">▼</kbd>
          <kbd className="px-2 py-1 bg-white rounded-md border border-gray-300 text-[9px] font-black shadow-sm">◀</kbd>
          <kbd className="px-2 py-1 bg-white rounded-md border border-gray-300 text-[9px] font-black shadow-sm">▶</kbd>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Arrow keys to move</span>
      </div>
    </div>
  );
};
