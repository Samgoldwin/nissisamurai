
import React, { useState, useEffect } from 'react';
import { Board } from './components/Board';
import { Graveyard } from './components/Graveyard';
import { RulesView } from './components/RulesView';
import { SetupView } from './components/SetupView';
import { LobbyView } from './components/LobbyView';
import { RulesModal } from './components/RulesModal';
import { useGame } from './hooks/useGame';
import { useOnlineManager } from './hooks/useOnlineManager';
import { Piece, PlayerType, Position, Move, GameMode } from './types';
import { getValidMoves } from './utils/gameLogic';

type AppView = 'RULES' | 'SETUP' | 'LOBBY' | 'GAME';

const App: React.FC = () => {
  // --- View State ---
  const [view, setView] = useState<AppView>('RULES');
  const [gameMode, setGameMode] = useState<GameMode>('PVE');
  const [showRules, setShowRules] = useState(false);

  // --- Game State (Hook) ---
  const game = useGame(gameMode);

  // --- Online State (Hook) ---
  const online = useOnlineManager(
    (move) => game.processMove(move), // On Receive Move
    () => { // On Game Start
      game.startGame(10);
      setView('GAME');
    },
    () => { // On Disconnect
      alert('Opponent Disconnected!');
      game.setStarted(false);
      setView('SETUP');
    }
  );

  // --- UI Interaction State ---
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [coordInput, setCoordInput] = useState<string>('');

  // --- Interaction Logic ---
  const handlePieceClick = (piece: Piece) => {
    if (game.gameOver) return;

    // Permission Checks
    if (gameMode === 'PVE' && game.currentPlayer !== PlayerType.PLAYER) return;
    if (gameMode === 'ONLINE') {
      if (game.currentPlayer !== online.myRole) return;
      if (piece.owner !== online.myRole) return;
    }
    if (piece.owner !== game.currentPlayer) return;

    if (selectedPiece?.id === piece.id) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    setSelectedPiece(piece);
    setValidMoves(getValidMoves(piece, game.pieces));
  };

  const handleTileClick = (pos: Position) => {
    if (!selectedPiece || game.gameOver) return;
    // Permission Checks (Double check for safety)
    if (gameMode === 'ONLINE' && game.currentPlayer !== online.myRole) return;

    const isVal = validMoves.some(m => m.row === pos.row && m.col === pos.col);
    if (!isVal) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    const move: Move = { from: selectedPiece.position, to: pos };

    // Execute
    game.processMove(move);
    if (gameMode === 'ONLINE') online.sendMove(move);

    // Cleanup UI
    setSelectedPiece(null);
    setValidMoves([]);
  };

  // --- Keyboard Logic ---
  const KEY_MAPPING: { [key: string]: string } = {
    'z': 'PLAYER-SAMURAI-6', 'x': 'PLAYER-SAMURAI-7', 'c': 'PLAYER-PROTECTOR-8',
    'v': 'PLAYER-SAMURAI-9', 'b': 'PLAYER-SAMURAI-10',
  };
  const PIECE_KEYS: { [id: string]: string } = Object.entries(KEY_MAPPING).reduce((acc, [key, id]) => {
    acc[id] = key.toUpperCase();
    return acc; // Reverse Map for UI
  }, {} as { [id: string]: string });

  useEffect(() => {
    if (!game.started || game.gameOver) return;
    if (gameMode === 'ONLINE' && online.myRole !== PlayerType.PLAYER) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Select
      if (KEY_MAPPING[key]) {
        const p = game.pieces.find(p => p.id === KEY_MAPPING[key]);
        if (p && p.owner === game.currentPlayer) {
          handlePieceClick(p);
          setCoordInput('');
        }
        return;
      }

      // Move
      if (selectedPiece && selectedPiece.owner === game.currentPlayer) {
        // Arrows
        const dirMap: Record<string, { r: number, c: number }> = {
          'arrowup': { r: -1, c: 0 }, 'arrowdown': { r: 1, c: 0 }, 'arrowleft': { r: 0, c: -1 }, 'arrowright': { r: 0, c: 1 }
        };
        if (dirMap[key]) {
          e.preventDefault();
          const d = dirMap[key];
          const target = { row: selectedPiece.position.row + d.r, col: selectedPiece.position.col + d.c };
          if (validMoves.some(m => m.row === target.row && m.col === target.col)) {
            const move = { from: selectedPiece.position, to: target };
            game.processMove(move);
            if (gameMode === 'ONLINE') online.sendMove(move);
            setCoordInput('');
            setSelectedPiece(null);
            setValidMoves([]);
          }
          return;
        }
        // Coords (Simplified for brevity)
        if (/^[a-j0-9]$/.test(key)) {
          const newVal = (coordInput + key).slice(-2);
          setCoordInput(newVal);
          if (newVal.length === 2 && /^[a-j][0-9]$/.test(newVal)) {
            const c = newVal.charCodeAt(0) - 97;
            const r = parseInt(newVal[1]);
            const target = { row: r, col: c };
            if (validMoves.some(m => m.row === target.row && m.col === target.col)) {
              const move = { from: selectedPiece.position, to: target };
              game.processMove(move);
              if (gameMode === 'ONLINE') online.sendMove(move);
              setCoordInput('');
              setSelectedPiece(null);
              setValidMoves([]);
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.started, game.gameOver, game.pieces, selectedPiece, validMoves, game.currentPlayer, coordInput, gameMode, online.myRole]);


  // --- Render Helpers ---
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const getPlayerName = () => gameMode === 'ONLINE' ? 'You' : (gameMode === 'PVE' ? 'You' : 'Player 1');
  const getOpponentName = () => gameMode === 'ONLINE' ? 'Opponent' : (gameMode === 'PVE' ? 'AI Bot' : 'Player 2');

  // --- Views ---
  if (view === 'RULES') return <RulesView onPlay={() => setView('SETUP')} />;

  if (view === 'SETUP') return (
    <SetupView
      onStartLocal={(min, mode) => {
        setGameMode(mode);
        game.startGame(min);
        setView('GAME');
      }}
      onStartOnline={() => {
        setGameMode('ONLINE');
        setView('LOBBY');
      }}
      onBack={() => setView('RULES')}
    />
  );

  if (view === 'LOBBY') return (
    <LobbyView
      status={online.lobbyStatus}
      roomId={online.roomId}
      onCreateRoom={online.createRoom}
      onJoinRoom={online.joinRoom}
      onCancel={() => { online.cleanup(); setView('SETUP'); }}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4 font-sans text-gray-900">
      {/* Header */}
      <div className="w-full max-w-[500px] flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md border border-gray-200">
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">{getOpponentName()}</span>
          <div className="flex items-center gap-2"><span className="font-bold text-red-600 text-xl">{game.currentScore.ai}</span><span className="text-xs text-gray-400">pts</span></div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`text-2xl font-mono font-bold ${game.timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-black'}`}>{formatTime(game.timeLeft)}</div>
          <div className="text-xs text-gray-400 font-medium">{gameMode}</div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">{getPlayerName()}</span>
          <div className="flex items-center gap-2"><span className="font-bold text-blue-600 text-xl">{game.currentScore.player}</span><span className="text-xs text-gray-400">pts</span></div>
        </div>
      </div>

      {/* Board */}
      <div className="space-y-4 w-full max-w-[500px]">
        <Graveyard pieces={game.graveyard} owner={PlayerType.PLAYER} />
        <Board
          pieces={game.pieces}
          selectedPiece={selectedPiece}
          validMoves={validMoves}
          lastMove={game.lastMove}
          onPieceClick={handlePieceClick}
          onTileClick={handleTileClick}
          currentPlayer={game.currentPlayer}
          gameActive={!game.gameOver}
          capturePos={game.capturePos}
          pieceKeys={gameMode === 'ONLINE' ? {} : KEY_MAPPING ? PIECE_KEYS : {}}
          coordInput={coordInput}
        />
        <Graveyard pieces={game.graveyard} owner={PlayerType.AI} />

        {/* Turn Status */}
        <div className="text-center h-8 flex items-center justify-center relative">
          {!game.gameOver && (
            <span className={`px-4 py-1 rounded-full text-sm font-bold border ${game.currentPlayer === PlayerType.PLAYER ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {game.currentPlayer === PlayerType.PLAYER
                ? (gameMode === 'ONLINE' && online.myRole !== PlayerType.PLAYER ? "Opponent's Turn" : "Blue Turn")
                : (gameMode === 'ONLINE' && online.myRole !== PlayerType.AI ? "Opponent's Turn" : "Red Turn")}
            </span>
          )}
          <button onClick={() => setShowRules(true)} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
          </button>
        </div>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Game Over */}
      {game.gameOver && game.scoring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-black rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-4xl font-extrabold mb-2 text-black">
              {game.scoring.winner === PlayerType.PLAYER ? 'BLUE WINS' : game.scoring.winner === PlayerType.AI ? 'RED WINS' : 'DRAW'}
            </h2>
            <p className="text-gray-500 mb-6 font-medium">{game.scoring.reason}</p>
            <div className="flex justify-between items-center mb-8 px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-center"><p className="text-xs text-gray-500 uppercase font-bold">BLUE</p><p className="text-3xl font-bold text-blue-600">{game.scoring.playerScore}</p></div>
              <div className="text-gray-300 font-bold text-xl">VS</div>
              <div className="text-center"><p className="text-xs text-gray-500 uppercase font-bold">RED</p><p className="text-3xl font-bold text-red-600">{game.scoring.aiScore}</p></div>
            </div>
            <button
              onClick={() => { game.setStarted(false); setView('SETUP'); online.cleanup(); }}
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