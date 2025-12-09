import React, { useState, useEffect } from 'react';
import { Board } from './components/Board';
import { Graveyard } from './components/Graveyard';
import { PieceIcon } from './components/PieceIcon';
import { 
  generateBoard, 
  getValidMoves, 
  executeMove, 
  checkInstantWin, 
  calculateScore, 
  calculateCurrentScore,
  getBestAIMove 
} from './utils/gameLogic';
import { Piece, PlayerType, Position, Move, Scoring, PieceType, GameMode } from './types';

const App: React.FC = () => {
  // --- State ---
  const [started, setStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('PVE');
  const [setupTab, setSetupTab] = useState<GameMode>('PVE'); 
  const [timeLimit, setTimeLimit] = useState<number>(5); 
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60);
  
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [graveyard, setGraveyard] = useState<Piece[]>([]);
  
  const [currentPlayer, setCurrentPlayer] = useState<PlayerType>(PlayerType.PLAYER);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  
  // Visual states
  const [capturePos, setCapturePos] = useState<Position | null>(null);
  const [currentScore, setCurrentScore] = useState({ player: 0, ai: 0 });
  
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [scoring, setScoring] = useState<Scoring | null>(null);

  // --- Timer ---
  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame('TIME_UP');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, gameOver]);

  // --- Score Update ---
  useEffect(() => {
    if (started) {
      setCurrentScore(calculateCurrentScore(pieces));
    }
  }, [pieces, started]);

  // --- AI Turn ---
  useEffect(() => {
    if (started && !gameOver && gameMode === 'PVE' && currentPlayer === PlayerType.AI) {
      const timer = setTimeout(() => {
        performAIMove();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, started, gameOver, pieces, gameMode]);

  const startGame = (minutes: number, mode: GameMode) => {
    setGameMode(mode);
    setTimeLimit(minutes);
    setTimeLeft(minutes * 60);
    setPieces(generateBoard());
    setGraveyard([]);
    setCurrentPlayer(PlayerType.PLAYER);
    setGameOver(false);
    setScoring(null);
    setLastMove(null);
    setStarted(true);
  };

  const endGame = (reason: 'TIME_UP' | 'INSTANT_WIN', instantWinner?: PlayerType) => {
    setGameOver(true);
    if (reason === 'TIME_UP') {
      const result = calculateScore(pieces, graveyard);
      setScoring(result);
    } else {
      let finalWinner = instantWinner || PlayerType.PLAYER;
      const scores = calculateCurrentScore(pieces);
      setScoring({
        playerScore: scores.player,
        aiScore: scores.ai,
        winner: finalWinner,
        reason: 'General Defeated!'
      });
    }
  };

  const handlePieceClick = (piece: Piece) => {
    if (gameOver) return;
    if (gameMode === 'PVE' && currentPlayer !== PlayerType.PLAYER) return;
    if (piece.owner !== currentPlayer) return;

    if (selectedPiece && selectedPiece.id === piece.id) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    setSelectedPiece(piece);
    const moves = getValidMoves(piece, pieces);
    setValidMoves(moves);
  };

  const handleTileClick = (pos: Position) => {
    if (!selectedPiece || gameOver) return;
    if (gameMode === 'PVE' && currentPlayer !== PlayerType.PLAYER) return;

    const isVal = validMoves.some(m => m.row === pos.row && m.col === pos.col);
    if (!isVal) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    const move: Move = { from: selectedPiece.position, to: pos };
    processMove(move);
  };

  const performAIMove = () => {
    const move = getBestAIMove(pieces);
    if (move) {
      processMove(move);
    } else {
      setCurrentPlayer(PlayerType.PLAYER);
    }
  };

  const processMove = (move: Move) => {
    const result = executeMove(pieces, move);
    setPieces(result.pieces);
    
    // Handle Capture Animation and Logic
    if (result.killed) {
      setCapturePos(move.to);
      setTimeout(() => setCapturePos(null), 500); // Clear animation
      setGraveyard(prev => [...prev, result.killed!]);
    }
    
    setLastMove(move);
    setSelectedPiece(null);
    setValidMoves([]);

    const currentGraveyard = [...graveyard, ...(result.killed ? [result.killed] : [])];
    const instantWinner = checkInstantWin(currentGraveyard);
    
    if (instantWinner) {
      endGame('INSTANT_WIN', instantWinner);
    } else {
      setCurrentPlayer(prev => prev === PlayerType.PLAYER ? PlayerType.AI : PlayerType.PLAYER);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getOpponentName = () => gameMode === 'PVE' ? 'AI Bot' : 'Player 2';
  const getPlayerName = () => gameMode === 'PVE' ? 'You' : 'Player 1';

  // --- Render ---

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-black uppercase tracking-tighter">
              Nissi Samurai
            </h1>
            <p className="text-gray-600 font-serif italic">"Strategy on the Line"</p>
          </div>
          
          <div className="flex justify-center space-x-6 py-4 border-t border-b border-gray-200">
             <div className="flex flex-col items-center">
                <div className="w-12 h-12 mb-2"><PieceIcon type={PieceType.PROTECTOR} owner={PlayerType.PLAYER} /></div>
                <span className="text-xs font-bold text-gray-500">Protector (10pts)</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="w-12 h-12 mb-2"><PieceIcon type={PieceType.SAMURAI} owner={PlayerType.PLAYER} /></div>
                <span className="text-xs font-bold text-gray-500">Samurai (5pts)</span>
             </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-300">
             <button 
                onClick={() => setSetupTab('PVE')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${setupTab === 'PVE' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
             >
                VS Computer
             </button>
             <button 
                onClick={() => setSetupTab('PVP')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${setupTab === 'PVP' ? 'bg-white text-red-600 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
             >
                2 Player (Local)
             </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-800 text-sm font-bold">Select Duel Duration:</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => startGame(5, setupTab)}
                className="py-3 bg-white border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
              >
                5 Minutes
              </button>
              <button 
                onClick={() => startGame(10, setupTab)}
                className="py-3 bg-white border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
              >
                10 Minutes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4 font-sans text-gray-900">
      {/* Header */}
      <div className="w-full max-w-[500px] flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md border border-gray-200">
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">{getOpponentName()}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600 text-xl">{currentScore.ai}</span>
            <span className="text-xs text-gray-400">pts</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
             <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-black'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-gray-400 font-medium">
                {gameMode === 'PVE' ? 'PVE' : 'PVP'}
            </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">{getPlayerName()}</span>
           <div className="flex items-center gap-2">
            <span className="font-bold text-blue-600 text-xl">{currentScore.player}</span>
            <span className="text-xs text-gray-400">pts</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="space-y-4 w-full max-w-[500px]">
        {/* Opponent Graveyard */}
        <Graveyard pieces={graveyard} owner={PlayerType.PLAYER} /> 

        {/* Board */}
        <Board 
          pieces={pieces}
          selectedPiece={selectedPiece}
          validMoves={validMoves}
          lastMove={lastMove}
          onPieceClick={handlePieceClick}
          onTileClick={handleTileClick}
          currentPlayer={currentPlayer}
          gameActive={!gameOver}
          capturePos={capturePos}
        />

        {/* Player Graveyard (Enemies killed) */}
        <Graveyard pieces={graveyard} owner={PlayerType.AI} />
        
        {/* Status Text */}
        <div className="text-center h-8 flex items-center justify-center">
            {!gameOver && (
                <span className={`px-4 py-1 rounded-full text-sm font-bold border ${currentPlayer === PlayerType.PLAYER ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                    {currentPlayer === PlayerType.PLAYER 
                      ? `${getPlayerName()}'s Turn` 
                      : (gameMode === 'PVE' ? "AI Thinking..." : `${getOpponentName()}'s Turn`)}
                </span>
            )}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && scoring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-black rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
            <h2 className="text-4xl font-extrabold mb-2 text-black">
              {scoring.winner === PlayerType.PLAYER 
                ? 'VICTORY' 
                : scoring.winner === PlayerType.AI 
                  ? 'DEFEAT' 
                  : 'DRAW'}
            </h2>
            <p className="text-gray-500 mb-6 font-medium">{scoring.reason}</p>

            <div className="flex justify-between items-center mb-8 px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">{getPlayerName()}</p>
                    <p className="text-3xl font-bold text-blue-600">{scoring.playerScore}</p>
                </div>
                <div className="text-gray-300 font-bold text-xl">VS</div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">{getOpponentName()}</p>
                    <p className="text-3xl font-bold text-red-600">{scoring.aiScore}</p>
                </div>
            </div>

            <button 
              onClick={() => setStarted(false)}
              className="w-full py-3 bg-black text-white font-bold rounded-lg shadow-lg hover:bg-gray-800 transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;