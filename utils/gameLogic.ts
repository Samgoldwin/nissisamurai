import { Piece, PieceType, PlayerType, Position, Move, Scoring } from '../types';
import { GRID_SIZE, POINTS } from '../constants';

// --- Helpers ---

export const generateBoard = (): Piece[] => {
  const pieces: Piece[] = [];
  let idCounter = 1;

  const addPiece = (type: PieceType, owner: PlayerType, r: number, c: number) => {
    pieces.push({
      id: `${owner}-${type}-${idCounter++}`,
      type,
      owner,
      position: { row: r, col: c },
      isPromoted: false,
    });
  };

  // Nissi Samurai Setup: All 5 pawns on the first line (Row 0 for AI, Row 9 for Player)
  // Grid is 10x10. Center cols are 4 and 5.
  // Formation: Samurai, Samurai, Protector, Samurai, Samurai

  // AI (Top - Row 0)
  addPiece(PieceType.SAMURAI, PlayerType.AI, 0, 3);
  addPiece(PieceType.SAMURAI, PlayerType.AI, 0, 4);
  addPiece(PieceType.PROTECTOR, PlayerType.AI, 0, 5); // Center-Right
  addPiece(PieceType.SAMURAI, PlayerType.AI, 0, 6);
  addPiece(PieceType.SAMURAI, PlayerType.AI, 0, 7);

  // Player (Bottom - Row 9)
  addPiece(PieceType.SAMURAI, PlayerType.PLAYER, GRID_SIZE - 1, 3);
  addPiece(PieceType.SAMURAI, PlayerType.PLAYER, GRID_SIZE - 1, 4);
  addPiece(PieceType.PROTECTOR, PlayerType.PLAYER, GRID_SIZE - 1, 5); // Center-Right relative
  addPiece(PieceType.SAMURAI, PlayerType.PLAYER, GRID_SIZE - 1, 6);
  addPiece(PieceType.SAMURAI, PlayerType.PLAYER, GRID_SIZE - 1, 7);

  return pieces;
};

export const isPositionEqual = (p1: Position, p2: Position) => p1.row === p2.row && p1.col === p2.col;

export const getPieceAt = (pieces: Piece[], pos: Position): Piece | undefined => {
  return pieces.find((p) => isPositionEqual(p.position, pos));
};

export const isValidPos = (pos: Position) => {
  return pos.row >= 0 && pos.row < GRID_SIZE && pos.col >= 0 && pos.col < GRID_SIZE;
};

// --- Movement Logic ---

export const getValidMoves = (piece: Piece, allPieces: Piece[]): Position[] => {
  const moves: Position[] = [];
  const { row, col } = piece.position;
  const forwardDir = piece.owner === PlayerType.PLAYER ? -1 : 1;

  // Target rows for promotion mechanics
  const opponentEndRow = piece.owner === PlayerType.PLAYER ? 0 : GRID_SIZE - 1;

  if (piece.type === PieceType.SAMURAI) {
    // Samurai: 1 step forward OR 1 step sideways (Left/Right)
    const potentialMoves: Position[] = [
      { row: row + forwardDir, col: col }, // Forward
      { row: row, col: col - 1 },          // Left
      { row: row, col: col + 1 }           // Right
    ];

    for (const potential of potentialMoves) {
      if (isValidPos(potential)) {
        // Can move if empty OR opponent (capture)
        const target = getPieceAt(allPieces, potential);
        if (!target || target.owner !== piece.owner) {
          moves.push(potential);
        }
      }
    }
  } else if (piece.type === PieceType.PROTECTOR) {
    // RULE UPDATE: Multi-step moves are only allowed WHILE the piece is standing in the opponent's end row.
    // If it is anywhere else, it is a single-step walker.
    const isInPowerZone = row === opponentEndRow;

    if (isInPowerZone) {
      // POWER ZONE BEHAVIOR: Infinite diagonal/orthogonal (Queen-like)
      // This allows the Protector to "snipe" or relocate anywhere from the end zone.
      // NOTE: If it moves out of the end row, it will lose this power next turn.
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];

      for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (isValidPos({ row: r, col: c })) {
          const target = getPieceAt(allPieces, { row: r, col: c });
          if (target) {
            if (target.owner !== piece.owner) {
              moves.push({ row: r, col: c }); // Capture and stop
            }
            break; // Blocked by anyone
          }
          moves.push({ row: r, col: c });
          r += dr;
          c += dc;
        }
      }

    } else {
      // NORMAL BEHAVIOR: 1 step any direction
      // It must walk step-by-step to reach the end.
      const offsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];
      for (const [dr, dc] of offsets) {
        const potential = { row: row + dr, col: col + dc };
        if (isValidPos(potential)) {
          const target = getPieceAt(allPieces, potential);
          if (!target || target.owner !== piece.owner) {
            moves.push(potential);
          }
        }
      }
    }
  }

  return moves;
};

// --- Game State Updates ---

export const executeMove = (pieces: Piece[], move: Move): { pieces: Piece[], killed: Piece | null } => {
  const movingPieceIndex = pieces.findIndex(p => isPositionEqual(p.position, move.from));
  if (movingPieceIndex === -1) return { pieces, killed: null };

  const movingPiece = { ...pieces[movingPieceIndex] };

  // Check capture
  const targetIndex = pieces.findIndex(p => isPositionEqual(p.position, move.to));
  let killed: Piece | null = null;

  let nextPieces = [...pieces];

  if (targetIndex !== -1) {
    killed = pieces[targetIndex];
    nextPieces.splice(targetIndex, 1);
  }

  // Update position
  movingPiece.position = move.to;

  // RULE UPDATE: Check Promotion Status based on NEW position
  // The 'isPromoted' flag is used for UI (Raging effect).
  // It is true ONLY if the piece is currently sitting in the opponent's end row.
  if (movingPiece.type === PieceType.PROTECTOR) {
    const promotionRow = movingPiece.owner === PlayerType.PLAYER ? 0 : GRID_SIZE - 1;
    movingPiece.isPromoted = (movingPiece.position.row === promotionRow);
  }

  // Update array (we need to find index again because splice might have shifted it if target was before mover)
  nextPieces = nextPieces.filter(p => p.id !== movingPiece.id);
  nextPieces.push(movingPiece);

  return { pieces: nextPieces, killed };
};

export const calculateCurrentScore = (pieces: Piece[]): { player: number, ai: number } => {
  let player = 0;
  let ai = 0;
  pieces.forEach(p => {
    const val = p.type === PieceType.PROTECTOR ? POINTS.PROTECTOR : POINTS.SAMURAI;
    if (p.owner === PlayerType.PLAYER) player += val;
    else ai += val;
  });
  return { player, ai };
};

export const calculateScore = (pieces: Piece[], graveyard: Piece[]): Scoring => {
  const scores = calculateCurrentScore(pieces);

  let winner: PlayerType | 'DRAW' | null = null;
  if (scores.player > scores.ai) winner = PlayerType.PLAYER;
  else if (scores.ai > scores.player) winner = PlayerType.AI;
  else winner = 'DRAW';

  return {
    playerScore: scores.player,
    aiScore: scores.ai,
    winner,
    reason: 'Time limit reached.'
  };
};

export const checkInstantWin = (graveyard: Piece[]): PlayerType | null => {
  const killedPlayerP = graveyard.find(p => p.type === PieceType.PROTECTOR && p.owner === PlayerType.PLAYER);
  if (killedPlayerP) return PlayerType.AI;

  const killedAiP = graveyard.find(p => p.type === PieceType.PROTECTOR && p.owner === PlayerType.AI);
  if (killedAiP) return PlayerType.PLAYER;

  return null;
};


// --- Engineered AI (Minimax with Alpha-Beta Pruning) ---

// AI Tuning Parameters
const MAX_DEPTH = 3; // Look 3 moves ahead (Ply)
const SCORES = {
  WIN: 100000,
  PROTECTOR: 2000,
  SAMURAI: 100,
  MOBILITY: 5,
  ADVANCE: 10,
  CENTER_CONTROL: 15,
  THREAT: 50
};

export const getBestAIMove = (pieces: Piece[]): Move | null => {
  // 1. Get all possible moves for AI
  const aiPieces = pieces.filter(p => p.owner === PlayerType.AI);
  let allMoves: { move: Move, score: number }[] = [];

  for (const piece of aiPieces) {
    const validMoves = getValidMoves(piece, pieces);
    for (const to of validMoves) {
      allMoves.push({ move: { from: piece.position, to }, score: 0 });
    }
  }

  // Shuffle to avoid predictable behavior on tied scores
  allMoves = allMoves.sort(() => Math.random() - 0.5);

  let bestMove: Move | null = null;
  let bestValue = -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  // 2. Run Minimax on each root move
  for (const item of allMoves) {
    // Execute move virtually
    const result = executeMove(pieces, item.move);

    // Check for Instant Win immediately
    if (result.killed && result.killed.type === PieceType.PROTECTOR && result.killed.owner === PlayerType.PLAYER) {
      return item.move;
    }

    // Call recursive Minimax
    const boardValue = minimax(result.pieces, MAX_DEPTH - 1, false, alpha, beta);

    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = item.move;
    }

    alpha = Math.max(alpha, bestValue);
  }

  return bestMove;
};

const minimax = (
  currentPieces: Piece[],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number => {

  // Base Case: Leaf node or Depth limit
  if (depth === 0) {
    return evaluateBoard(currentPieces);
  }

  const currentPlayer = isMaximizing ? PlayerType.AI : PlayerType.PLAYER;
  const activePieces = currentPieces.filter(p => p.owner === currentPlayer);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const piece of activePieces) {
      const validMoves = getValidMoves(piece, currentPieces);
      for (const to of validMoves) {

        const result = executeMove(currentPieces, { from: piece.position, to });

        // Critical: Check Win/Loss conditions inside recursion
        if (result.killed && result.killed.type === PieceType.PROTECTOR) {
          // If AI killed Player Protector -> Huge Win
          if (result.killed.owner === PlayerType.PLAYER) return SCORES.WIN + depth; // Prefer winning sooner
        }

        const evalScore = minimax(result.pieces, depth - 1, false, alpha, beta);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // Prune
      }
      if (beta <= alpha) break;
    }
    return maxEval === -Infinity ? evaluateBoard(currentPieces) : maxEval; // Handle no moves
  } else {
    // Minimizing Player (Human)
    let minEval = Infinity;
    for (const piece of activePieces) {
      const validMoves = getValidMoves(piece, currentPieces);
      for (const to of validMoves) {

        const result = executeMove(currentPieces, { from: piece.position, to });

        if (result.killed && result.killed.type === PieceType.PROTECTOR) {
          // If Player killed AI Protector -> Huge Loss
          if (result.killed.owner === PlayerType.AI) return -SCORES.WIN - depth;
        }

        const evalScore = minimax(result.pieces, depth - 1, true, alpha, beta);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // Prune
      }
      if (beta <= alpha) break;
    }
    return minEval === Infinity ? evaluateBoard(currentPieces) : minEval;
  }
};

const evaluateBoard = (pieces: Piece[]): number => {
  let score = 0;

  for (const p of pieces) {
    const isAi = p.owner === PlayerType.AI;
    const multiplier = isAi ? 1 : -1;

    // 1. Material Score
    let materialVal = p.type === PieceType.PROTECTOR ? SCORES.PROTECTOR : SCORES.SAMURAI;
    score += materialVal * multiplier;

    // 2. Positional Score (Advance towards enemy)
    // AI starts 0, wants 9. Player starts 9, wants 0.
    const advanceRow = isAi ? p.position.row : (GRID_SIZE - 1 - p.position.row);
    score += (advanceRow * SCORES.ADVANCE) * multiplier;

    // 3. Center Control (Encourage fighting in the middle)
    if (p.position.col >= 3 && p.position.col <= 6) {
      score += SCORES.CENTER_CONTROL * multiplier;
    }

    // 4. Killer Instinct (Threats) & Safety
    // This is expensive to calculate fully, so we use simplified heuristics
    // e.g. if Samurai is very close to enemy Protector
    if (p.type === PieceType.SAMURAI) {
      // Find enemy protector
      const enemyProt = pieces.find(ep => ep.owner !== p.owner && ep.type === PieceType.PROTECTOR);
      if (enemyProt) {
        const dist = Math.abs(p.position.row - enemyProt.position.row) + Math.abs(p.position.col - enemyProt.position.col);
        if (dist <= 3) {
          score += (SCORES.THREAT / dist) * multiplier; // Closer = More threat score
        }
      }
    }
  }

  return score;
};