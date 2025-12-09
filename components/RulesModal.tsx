import React from 'react';
import { PieceIcon } from './PieceIcon';
import { PieceType, PlayerType } from '../types';

interface RulesModalProps {
    onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white border-2 border-black rounded-2xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-extrabold text-black uppercase tracking-tighter">How to Play</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-8">

                    {/* Protector Section */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                                <div className="w-10 h-10"><PieceIcon type={PieceType.PROTECTOR} owner={PlayerType.PLAYER} /></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-blue-900">The Protector</h3>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Your Key Unit (10 Pts)</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-sm text-gray-700">
                            <p>
                                <strong>1. Normal Form:</strong> By default, the Protector moves <strong>1 step</strong> in any direction (like a King in Chess).
                            </p>
                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-100">
                                <span className="text-2xl">🐢</span>
                                <span>Walk it carefully towards the enemy base.</span>
                            </div>

                            <p>
                                <strong>2. Promotion (Raging Mode):</strong> If your Protector reaches the <strong>Top Row (Row 0)</strong>, it becomes Promoted!
                            </p>
                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-red-100 shadow-sm">
                                <span className="text-2xl">🔥</span>
                                <span>Once in the Top Row, it can move <strong>infinite distance</strong> (like a Queen) to snipe enemies anywhere!</span>
                            </div>
                            <p className="text-xs text-gray-500 italic">
                                *Note: If it leaves the Top Row, it loses this power until it returns.
                            </p>
                        </div>
                    </div>

                    {/* Samurai Section */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                            <div className="w-10 h-10"><PieceIcon type={PieceType.SAMURAI} owner={PlayerType.PLAYER} /></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">The Samurai (5 Pts)</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Moves 1 step <strong>Forward</strong> or <strong>Sideways</strong>. Cannot move diagonally or backwards. Use them as a shield wall.
                            </p>
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="font-bold text-gray-900 mb-2">Controls</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li><kbd className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300 font-mono">Z</kbd> <kbd className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300 font-mono">X</kbd> ... Select specific pieces.</li>
                            <li><kbd className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300 font-mono">Arrows</kbd> Move selected piece 1 step.</li>
                            <li><kbd className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300 font-mono">Letter</kbd> + <kbd className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300 font-mono">Number</kbd> (e.g., "A5") allows long-distance jumps for the Promoted Protector.</li>
                        </ul>
                    </div>

                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};
