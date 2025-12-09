import React from 'react';
import { Piece, PlayerType } from '../types';
import { PieceIcon } from './PieceIcon';

interface GraveyardProps {
  pieces: Piece[];
  owner: PlayerType;
}

export const Graveyard: React.FC<GraveyardProps> = ({ pieces, owner }) => {
  const filtered = pieces.filter(p => p.owner === owner);

  return (
    <div className={`flex flex-wrap gap-2 p-2 rounded-lg bg-gray-100 min-h-[50px] items-center border border-gray-300 shadow-inner ${owner === PlayerType.PLAYER ? 'justify-start' : 'justify-end'}`}>
      {filtered.length === 0 && <span className="text-xs text-gray-400 uppercase tracking-widest">No Casualties</span>}
      {filtered.map((piece, idx) => (
        <div key={`${piece.id}-${idx}`} className="w-6 h-6 opacity-60 grayscale hover:grayscale-0 transition-all">
          <PieceIcon type={piece.type} owner={owner} />
        </div>
      ))}
    </div>
  );
};