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
    // Samurai: 1 step forward only
    const potential: Position = { row: row + forwardDir, col: col };
    
    if (isValidPos(potential)) {
       // Can move if empty OR opponent (capture)
       const target = getPieceAt(allPieces, potential);
       if (!target || target.owner !== piece.owner) {
         moves.push(potential);
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
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
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
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
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


// --- Simple AI (Greedy / Minimax-lite) ---

export const getBestAIMove = (pieces: Piece[]): Move | null => {
  const aiPieces = pieces.filter(p => p.owner === PlayerType.AI);
  let bestMove: Move | null = null;
  let bestScore = -Infinity;

  for (const piece of aiPieces) {
    const validMoves = getValidMoves(piece, pieces);
    for (const to of validMoves) {
      // Simulate
      const target = getPieceAt(pieces, to);
      
      // Instant Win Check
      if (target && target.type === PieceType.PROTECTOR && target.owner === PlayerType.PLAYER) {
        return { from: piece.position, to };
      }

      let currentScore = 0;

      // Heuristic: Capture Logic
      if (target) {
        currentScore += (target.type === PieceType.PROTECTOR ? 10000 : 100);
      }

      // Heuristic: Promotion logic
      // AI wants to reach Row 9
      if (piece.type === PieceType.PROTECTOR) {
        // If not at end, highly incentivize getting closer
        if (piece.position.row !== GRID_SIZE - 1) {
             if (to.row === GRID_SIZE - 1) currentScore += 1000; // Get to power zone
             else if (to.row > piece.position.row) currentScore += 50; // Move forward
        } else {
             // If ALREADY at end (Power Zone)
             // Incentivize using the power to kill, but be careful about leaving
             if (target) currentScore += 500; // Good to leave if we get a kill
        }
      }

      // Aggression with Samurai
      if (piece.type === PieceType.SAMURAI) {
        currentScore += 10;
        // Bias towards center
        if (to.col >= 3 && to.col <= 6) currentScore += 5;
      }

      currentScore += Math.random() * 10;

      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestMove = { from: piece.position, to };
      }
    }
  }

  return bestMove;
};