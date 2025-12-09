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
  capturePos
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
    <div className="relative w-full max-w-[500px] aspect-square mx-auto bg-white rounded-xl shadow-xl overflow-hidden border-2 border-black select-none">
      
      {/* Background Grid Lines - Black on White */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" width="100%" height="100%">
        {/* Horizontal Lines */}
        {Array.from({length: GRID_SIZE}).map((_, i) => (
            <line 
                key={`h-${i}`} 
                x1="0" 
                y1={`${(i * 100) / GRID_SIZE + (50/GRID_SIZE)}%`} 
                x2="100%" 
                y2={`${(i * 100) / GRID_SIZE + (50/GRID_SIZE)}%`} 
                stroke="black"
                strokeWidth="1.5"
                opacity="0.8"
            />
        ))}
        {/* Vertical Lines */}
        {Array.from({length: GRID_SIZE}).map((_, i) => (
            <line 
                key={`v-${i}`} 
                x1={`${(i * 100) / GRID_SIZE + (50/GRID_SIZE)}%`} 
                y1="0" 
                x2={`${(i * 100) / GRID_SIZE + (50/GRID_SIZE)}%`} 
                y2="100%" 
                stroke="black"
                strokeWidth="1.5"
                opacity="0.8"
            />
        ))}
       </svg>

      {/* Promotion Zones Indicators */}
      <div className="absolute inset-0 pointer-events-none w-full h-full">
         {/* Player Target Zone (Row 0) */}
         <div className="absolute top-0 left-0 w-full h-[10%] bg-blue-100/30 border-b border-blue-200/50 flex items-center justify-center">
            <span className="text-[10px] text-blue-300 uppercase tracking-[0.5em] opacity-40 font-bold">Player Promotion Zone</span>
         </div>
         {/* AI Target Zone (Row 9) */}
         <div className="absolute bottom-0 left-0 w-full h-[10%] bg-red-100/30 border-t border-red-200/50 flex items-center justify-center">
            <span className="text-[10px] text-red-300 uppercase tracking-[0.5em] opacity-40 font-bold">Opponent Promotion Zone</span>
         </div>
      </div>

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
                        <div className="absolute w-[80%] h-[80%] z-10 pointer-events-none">
                            <PieceIcon 
                                type={piece.type} 
                                owner={piece.owner} 
                                isPromoted={piece.isPromoted} 
                            />
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};