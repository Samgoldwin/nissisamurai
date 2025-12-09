
import React, { useState, useEffect, useRef } from 'react';
import { Board } from './components/Board';
import { Graveyard } from './components/Graveyard';
import { PieceIcon } from './components/PieceIcon';
import { RulesView } from './components/RulesView';
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
import { RulesModal } from './components/RulesModal';
import { io, Socket } from 'socket.io-client';

// Helper for Online Logic
type AppView = 'RULES' | 'SETUP' | 'LOBBY' | 'GAME';

const App: React.FC = () => {
  // --- View State ---
  const [view, setView] = useState<AppView>('RULES');

  // --- Game State ---
  const [started, setStarted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('PVE');
  const [setupTab, setSetupTab] = useState<'PVE' | 'PVP'>('PVE'); // Local setup tabs
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

  // --- Online State ---
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState('');
  const [myOnlineRole, setMyOnlineRole] = useState<PlayerType | null>(null); // PLAYER (Host) or AI (Joiner)
  const [lobbyStatus, setLobbyStatus] = useState<'IDLE' | 'WAITING'>('IDLE');
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // --- Socket Initialization ---
  useEffect(() => {
    // Connect to server (use env var in production, localhost in dev)
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('room_created', (id: string) => {
      setRoomId(id);
      setLobbyStatus('WAITING');
      setMyOnlineRole(PlayerType.PLAYER); // Creator is Player 1
    });

    newSocket.on('game_start', ({ players }: { players: string[] }) => {
      // Determine role if not set (Joiner)
      // players[0] is Host (PLAYER), players[1] is Joiner (AI side)
      const amIHost = players[0] === newSocket.id;
      const myRole = amIHost ? PlayerType.PLAYER : PlayerType.AI;
      setMyOnlineRole(myRole);

      // Start Game
      startGame(10, 'ONLINE'); // Default online 10 mins? Or sync it. For now fixed.
    });

    newSocket.on('opponent_move', ({ move, newState }: { move: Move, newState?: any }) => {
      // Execute opponent move visually
      // ensuring we don't re-emit
      processMove(move, false);
    });

    newSocket.on('player_left', () => {
      alert('Opponent disconnected.');
      setGameOver(true);
      setStarted(false);
      setView('SETUP');
    });

    newSocket.on('error', (msg: string) => {
      alert(msg);
      setLobbyStatus('IDLE');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []); // Run once on mount

  // --- Timer ---
  useEffect(() => {
    if (!started || gameOver) return;

    // In Online, timer should technically be synced or run locally per turn or simple global.
    // For MVP, just run local decrement visually.
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
    setCurrentPlayer(PlayerType.PLAYER); // Player always starts?
    setGameOver(false);
    setScoring(null);
    setLastMove(null);
    setStarted(true);
    setView('GAME');
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

    // Restriction: Can only click pieces if it's my turn
    // PVE: Can't click AI pieces.
    if (gameMode === 'PVE' && currentPlayer !== PlayerType.PLAYER) return;

    // PVP Local: Can click any piece if owner == currentPlayer (shared mouse).

    // ONLINE: Can only click MY pieces, and only if it is my turn.
    if (gameMode === 'ONLINE') {
      if (currentPlayer !== myOnlineRole) return; // Not my turn
      if (piece.owner !== myOnlineRole) return; // Not my piece
    }

    if (piece.owner !== currentPlayer) return; // Base rule

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

    // ONLINE Check
    if (gameMode === 'ONLINE') {
      if (currentPlayer !== myOnlineRole) return;
    }

    const isVal = validMoves.some(m => m.row === pos.row && m.col === pos.col);
    if (!isVal) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    const move: Move = { from: selectedPiece.position, to: pos };
    processMove(move, true); // true = initiate (emit if online)
  };

  const performAIMove = () => {
    const move = getBestAIMove(pieces);
    if (move) {
      processMove(move, true);
    } else {
      setCurrentPlayer(PlayerType.PLAYER);
    }
  };

  const processMove = (move: Move, isInitiator: boolean = true) => {
    // Execute logic locally
    const result = executeMove(pieces, move);
    setPieces(result.pieces);

    // Online Emission
    if (gameMode === 'ONLINE' && isInitiator && socket) {
      socket.emit('make_move', { roomId, move });
    }

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

  // --- Keyboard Logic (Direct Mapping & Coordinates) ---
  const [coordInput, setCoordInput] = useState<string>('');

  // Mapping remains same, assuming Player is using standard controls.
  // In Online, if I am playing as AI side (Joiner), I might need new key mappings?
  // User asked for "Online friends playing".
  // Let's assume standard keys work for "My Side".
  // Logic: keys select logical pieces.

  const KEY_MAPPING: { [key: string]: string } = {
    'z': 'PLAYER-SAMURAI-6',
    'x': 'PLAYER-SAMURAI-7',
    'c': 'PLAYER-PROTECTOR-8',
    'v': 'PLAYER-SAMURAI-9',
    'b': 'PLAYER-SAMURAI-10',
  };

  // Reverse mapping for UI labels
  const PIECE_KEYS: { [id: string]: string } = Object.entries(KEY_MAPPING).reduce((acc, [key, id]) => {
    acc[id] = key.toUpperCase();
    return acc;
  }, {} as { [id: string]: string });

  // NOTE: If playing as AI side online, these IDs are wrong.
  // However, `pieces` contains all pieces. AI pieces have different IDs.
  // For now, only Player 1 gets keyboard shortcuts.
  // Or I could map keys to my pieces dynamically.
  // Given complexity, let's keep keyboard shortcuts for Player 1 / Local only for now unless requested.
  // Actually, I should probably disable them for Online P2 (AI side) or map them.
  // Implementation: Only enable if I am PlayerType.PLAYER.

  useEffect(() => {
    if (!started || gameOver) return;

    // Allow keyboard for PVE and PVP (All players if shared, or just P1 logic mapped above)
    // Allow for ONLINE only if I am the Host (Player 1).
    if (gameMode === 'ONLINE' && myOnlineRole !== PlayerType.PLAYER) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // ... (Rest of existing key logic) ...
      // 1. Piece Selection (Z, X, C, V, B)
      if (KEY_MAPPING[key]) {
        const pieceId = KEY_MAPPING[key];
        const piece = pieces.find(p => p.id === pieceId);
        if (piece && piece.owner === currentPlayer) {
          handlePieceClick(piece);
          setCoordInput(''); // Reset coord input on new selection
        }
        return;
      }

      // 2. Movement for Selected Piece
      if (selectedPiece && selectedPiece.owner === currentPlayer) {

        // A) Arrow Keys (1-Step Directional)
        const dirMap: { [key: string]: { r: number, c: number } } = {
          'arrowup': { r: -1, c: 0 },
          'arrowdown': { r: 1, c: 0 },
          'arrowleft': { r: 0, c: -1 },
          'arrowright': { r: 0, c: 1 },
        };

        if (dirMap[key]) {
          e.preventDefault();
          const d = dirMap[key];
          const target: Position = {
            row: selectedPiece.position.row + d.r,
            col: selectedPiece.position.col + d.c
          };

          const isValMove = validMoves.some(m => m.row === target.row && m.col === target.col);
          if (isValMove) {
            processMove({ from: selectedPiece.position, to: target }, true);
            setCoordInput('');
          }
          return;
        }

        // B) Coordinate Input
        const isLetter = /^[a-j]$/.test(key);
        const isNumber = /^[0-9]$/.test(key);

        if (isLetter) {
          setCoordInput(key);
        } else if (isNumber && coordInput.length === 1) {
          const colChar = coordInput;
          const rowChar = key;
          const col = colChar.charCodeAt(0) - 'a'.charCodeAt(0);
          const row = parseInt(rowChar);

          if (!isNaN(col) && !isNaN(row)) {
            const target = { row, col };
            const isValMove = validMoves.some(m => m.row === target.row && m.col === target.col);
            if (isValMove) {
              processMove({ from: selectedPiece.position, to: target }, true);
            }
          }
          setCoordInput('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, gameOver, pieces, selectedPiece, validMoves, currentPlayer, coordInput, gameMode, myOnlineRole]);

  // Handle Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPiece(null);
        setValidMoves([]);
        setCoordInput('');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getOpponentName = () => {
    if (gameMode === 'ONLINE') return 'Online Opponent';
    return gameMode === 'PVE' ? 'AI Bot' : 'Player 2';
  };
  const getPlayerName = () => {
    if (gameMode === 'ONLINE') return 'You';
    return gameMode === 'PVE' ? 'You' : 'Player 1';
  }

  // --- Render ---

  if (view === 'RULES') {
    return <RulesView onPlay={() => setView('SETUP')} />;
  }

  if (view === 'SETUP') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-black">CHOOSE MODE</h2>

          <div className="space-y-4">
            {/* Local Tab */}
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Local Play</h3>
              <div className="flex bg-white p-1 rounded-lg border border-gray-300 mb-4">
                <button
                  onClick={() => setSetupTab('PVE')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${setupTab === 'PVE' ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  VS Computer
                </button>
                <button
                  onClick={() => setSetupTab('PVP')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${setupTab === 'PVP' ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  2 Player
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => startGame(5, setupTab)} className="py-2 border-2 border-black rounded font-bold hover:bg-gray-50">5 Min</button>
                <button onClick={() => startGame(10, setupTab)} className="py-2 border-2 border-black rounded font-bold hover:bg-gray-50">10 Min</button>
              </div>
            </div>

            {/* Online Tab */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h3 className="text-sm font-bold text-blue-500 uppercase mb-3">Online Multiplayer</h3>
              <button
                onClick={() => setView('LOBBY')}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                PLAY ONLINE
              </button>
            </div>
          </div>

          <button onClick={() => setView('RULES')} className="text-xs text-gray-400 hover:text-black mt-4 underline">Back to Rules</button>
        </div>
      </div>
    );
  }

  if (view === 'LOBBY') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full text-center space-y-6">
          <h2 className="text-2xl font-black text-black uppercase">Online Lobby</h2>

          {lobbyStatus === 'IDLE' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">JOIN EXISTING ROOM</label>
                <div className="flex gap-2">
                  <input
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="ROOM CODE"
                    className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 font-mono text-center uppercase focus:border-black outline-none font-bold"
                  />
                  <button
                    onClick={() => socket?.emit('join_room', joinCodeInput)}
                    disabled={!joinCodeInput}
                    className="bg-black text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                  >
                    JOIN
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or</span></div>
              </div>

              <button
                onClick={() => {
                  const newId = Math.random().toString(36).substring(2, 6).toUpperCase();
                  socket?.emit('create_room', newId);
                }}
                className="w-full py-3 border-2 border-black text-black font-bold rounded-lg hover:bg-gray-50"
              >
                CREATE NEW ROOM
              </button>
            </div>
          ) : (
            <div className="py-8 space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
              <p className="font-bold text-gray-600">Waiting for Opponent...</p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-xs text-gray-400 uppercase font-bold">Room Code</p>
                <p className="text-4xl font-mono font-black tracking-widest">{roomId}</p>
              </div>
              <p className="text-xs text-gray-400">Share this code with your friend</p>
            </div>
          )}

          <button onClick={() => { setView('SETUP'); setLobbyStatus('IDLE'); }} className="text-sm text-gray-400 hover:text-black underline">Cancel</button>
        </div>
      </div>
    );
  }

  // GAME VIEW
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
            {gameMode === 'PVE' ? 'PVE' : (gameMode === 'ONLINE' ? 'ONLINE' : 'PVP')}
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
          pieceKeys={gameMode === 'ONLINE' ? {} : (gameMode === 'PVE' ? PIECE_KEYS : {})} // Show keys if PVE
          coordInput={coordInput}
        />

        {/* Player Graveyard (Enemies killed) */}
        <Graveyard pieces={graveyard} owner={PlayerType.AI} />

        {/* Status Text */}
        <div className="text-center h-8 flex items-center justify-center relative">
          {!gameOver && (
            <span className={`px-4 py-1 rounded-full text-sm font-bold border ${currentPlayer === PlayerType.PLAYER ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {currentPlayer === PlayerType.PLAYER
                ? "Player 1's Turn"
                : "Opponent's Turn"}
            </span>
          )}

          {/* Rules Button */}
          <button
            onClick={() => setShowRules(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
            title="How to Play"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rules Modal (Overlay during game) */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Game Over Modal */}
      {gameOver && scoring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-black rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
            <h2 className="text-4xl font-extrabold mb-2 text-black">
              {scoring.winner === PlayerType.PLAYER
                ? 'BLUE WINS'
                : scoring.winner === PlayerType.AI
                  ? 'RED WINS'
                  : 'DRAW'}
            </h2>
            <p className="text-gray-500 mb-6 font-medium">{scoring.reason}</p>

            <div className="flex justify-between items-center mb-8 px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase font-bold">BLUE</p>
                <p className="text-3xl font-bold text-blue-600">{scoring.playerScore}</p>
              </div>
              <div className="text-gray-300 font-bold text-xl">VS</div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase font-bold">RED</p>
                <p className="text-3xl font-bold text-red-600">{scoring.aiScore}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setStarted(false);
                setView('SETUP');
              }}
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