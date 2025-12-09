import React, { useMemo } from 'react';
import { GRID_SIZE } from '../constants';
import { Piece, Position, Move, PlayerType } from '../types';
import { isPositionEqual } from '../utils/gameLogic';
import { PieceIcon } from './PieceIcon';

interface BoardProps {
  pieces: Piece[];
  selectedPiece: Piece | null;
  validMoves: Position[];
  lastMove: Move | null;
  onPieceClick: (piece: Piece) => void;
  onTileClick: (pos: Position) => void;
  currentPlayer: PlayerType;
  gameActive: boolean;
  capturePos: Position | null; // For animation
  pieceKeys: { [id: string]: string };
  coordInput: string;
}

export const Board: React.FC<BoardProps> = ({
  pieces,
  selectedPiece,
  validMoves,
  lastMove,
  onPieceClick,
  onTileClick,
  currentPlayer,
  gameActive,
  capturePos,
  pieceKeys,
  coordInput
}) => {
  // Create grid points
  const gridPoints = useMemo(() => {
    const points: Position[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        points.push({ row: r, col: c });
      }
    }
    return points;
  }, []);

  return (
    <div className="relative">

      {/* Top Coordinate Labels (A-J) */}
      <div className="flex pl-8 mb-1">
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <div key={i} className="flex-1 text-center font-mono text-sm font-bold text-gray-500">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Left Coordinate Labels (0-9) */}
        <div className="flex flex-col w-8 pr-1 pt-1 space-y-[2px]">
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center justify-end font-mono text-sm font-bold text-gray-500">
              {i}
            </div>
          ))}
        </div>

        {/* Main Board */}
        <div className="relative flex-1 aspect-square bg-white rounded-xl shadow-xl overflow-visible border-2 border-black select-none">

          {/* Background Grid Lines - Black on White */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" width="100%" height="100%">
            {/* Horizontal Lines */}
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={`${(i * 100) / GRID_SIZE + (50 / GRID_SIZE)}%`}
                x2="100%"
                y2={`${(i * 100) / GRID_SIZE + (50 / GRID_SIZE)}%`}
                stroke="black"
                strokeWidth="1.5"
                opacity="0.8"
              />
            ))}
            {/* Vertical Lines */}
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${(i * 100) / GRID_SIZE + (50 / GRID_SIZE)}%`}
                y1="0"
                x2={`${(i * 100) / GRID_SIZE + (50 / GRID_SIZE)}%`}
                y2="100%"
                stroke="black"
                strokeWidth="1.5"
                opacity="0.8"
              />
            ))}
          </svg>

          {/* Promotion Zones Indicators */}
          <div className="absolute inset-0 pointer-events-none w-full h-full">
            <div className="absolute top-0 left-0 w-full h-[10%] bg-blue-100/30 border-b border-blue-200/50" />
            <div className="absolute bottom-0 left-0 w-full h-[10%] bg-red-100/30 border-t border-red-200/50" />
          </div>

          {/* Coordinate Input Feedback Overlay */}
          {coordInput && (
            <div className="absolute top-4 right-4 z-50 bg-black text-white px-3 py-1 rounded shadow-lg font-mono text-xl animate-pulse">
              Target: <span className="text-yellow-400">{coordInput.toUpperCase()}_</span>
            </div>
          )}

          {/* Interactive Layer */}
          <div
            className="w-full h-full grid relative z-10"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {gridPoints.map((pos) => {
              const piece = pieces.find(p => isPositionEqual(p.position, pos));
              const isValidMove = validMoves.some(m => isPositionEqual(m, pos));
              const isSelected = selectedPiece && isPositionEqual(selectedPiece.position, pos);
              const isLastFrom = lastMove && isPositionEqual(lastMove.from, pos);
              const isLastTo = lastMove && isPositionEqual(lastMove.to, pos);
              const isCapture = capturePos && isPositionEqual(capturePos, pos);

              // Show key label if piece is user's
              const pieceKey = piece && pieceKeys[piece.id] ? pieceKeys[piece.id] : null;

              return (
                <div
                  key={`${pos.row}-${pos.col}`}
                  className={`relative flex items-center justify-center cursor-pointer`}
                  onClick={() => {
                    if (!gameActive) return;
                    if (piece && piece.owner === currentPlayer) {
                      onPieceClick(piece);
                    } else if (isValidMove) {
                      onTileClick(pos);
                    } else if (piece && piece.owner !== currentPlayer) {
                      if (selectedPiece && isValidMove) {
                        onTileClick(pos);
                      }
                    }
                  }}
                >
                  {/* The "Point" visual - Black Dot */}
                  <div className={`w-2 h-2 rounded-full z-0 transition-all duration-300
                            ${isLastFrom || isLastTo ? 'bg-yellow-500 scale-150' : 'bg-black'}
                            ${isValidMove && !piece ? 'bg-green-500 scale-[2]' : ''}
                        `} />

                  {/* Move Indicator Ring */}
                  {isValidMove && !piece && (
                    <div className="absolute w-4 h-4 rounded-full border border-green-500 animate-ping" />
                  )}

                  {/* Capture Indicator Ring (Target) */}
                  {isValidMove && piece && (
                    <div className="absolute w-10 h-10 rounded-full border-2 border-red-500 animate-pulse bg-red-500/10" />
                  )}

                  {/* Selection Highlight */}
                  {isSelected && (
                    <div className="absolute w-full h-full bg-blue-100/50 rounded-full scale-90 animate-pulse border-2 border-blue-500" />
                  )}

                  {/* Capture Animation Effect (Slash) */}
                  {isCapture && (
                    <div className="absolute z-20 w-full h-full flex items-center justify-center pointer-events-none">
                      <div className="w-[120%] h-1 bg-red-600 shadow-[0_0_10px_red] slash-effect"></div>
                    </div>
                  )}

                  {/* Piece */}
                  {piece && (
                    <div className="absolute w-[80%] h-[80%] z-10 pointer-events-none relative">
                      <PieceIcon
                        type={piece.type}
                        owner={piece.owner}
                        isPromoted={piece.isPromoted}
                      />
                      {/* Key Label Overlay */}
                      {pieceKey && (piece.owner === PlayerType.PLAYER) && (
                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-md z-20">
                          {pieceKey}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};