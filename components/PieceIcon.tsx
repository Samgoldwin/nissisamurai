import React from 'react';
import { PieceType, PlayerType } from '../types';

interface Props {
  type: PieceType;
  owner: PlayerType;
  isPromoted?: boolean;
  className?: string;
}

export const PieceIcon: React.FC<Props> = ({ type, owner, isPromoted, className = '' }) => {
  // Stronger contrast colors for white background
  const colorClass = owner === PlayerType.PLAYER 
    ? 'text-blue-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]' 
    : 'text-red-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]';
    
  const strokeClass = owner === PlayerType.PLAYER ? 'stroke-blue-700' : 'stroke-red-700';
  const fillClass = owner === PlayerType.PLAYER ? 'fill-blue-600' : 'fill-red-600';
  
  // Raging animation classes
  const ragingClass = isPromoted ? 'animate-bounce drop-shadow-[0_0_15px_rgba(255,165,0,0.8)]' : '';

  if (type === PieceType.PROTECTOR) {
    return (
      <div className={`${className} ${colorClass} ${ragingClass} transition-all duration-300 transform`}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Raging Aura if promoted */}
            {isPromoted && (
               <circle cx="12" cy="12" r="11" className="fill-orange-400/30 animate-pulse" />
            )}

            {/* Shield Shape */}
            <path 
                d="M12 2L4 5V11C4 16.55 7.4 21.74 12 23C16.6 21.74 20 16.55 20 11V5L12 2Z" 
                className={`${strokeClass} ${isPromoted ? 'fill-orange-500' : fillClass} ${isPromoted ? '' : 'fill-opacity-20'}`} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            
            {/* Inner Detail */}
            <path d="M12 6V19" className={`${isPromoted ? 'stroke-white' : strokeClass}`} strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 11H16" className={`${isPromoted ? 'stroke-white' : strokeClass}`} strokeWidth="1.5" strokeLinecap="round"/>
            
            {isPromoted && (
                 <>
                   <path d="M7 6L5 4" className="stroke-orange-600" strokeWidth="2" />
                   <path d="M17 6L19 4" className="stroke-orange-600" strokeWidth="2" />
                 </>
            )}
        </svg>
      </div>
    );
  }

  // Samurai (Katana/Sword style)
  return (
    <div className={`${className} ${colorClass} transition-all duration-300 transform hover:scale-110`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
         <path d="M14.5 4L5 20" className={`${strokeClass}`} strokeWidth="2" strokeLinecap="round"/>
         <path d="M10 5L19 20" className={`${strokeClass}`} strokeWidth="2" strokeLinecap="round"/>
         <path d="M12 3V5" className={`${strokeClass}`} strokeWidth="2"/>
         <path d="M5 20L7 22" className={`${strokeClass}`} strokeWidth="2"/>
         <path d="M19 20L17 22" className={`${strokeClass}`} strokeWidth="2"/>
         {/* Hilt */}
         <circle cx="12" cy="14" r="2" className={`${strokeClass} ${fillClass} fill-opacity-20`} strokeWidth="1.5"/>
      </svg>
    </div>
  );
};