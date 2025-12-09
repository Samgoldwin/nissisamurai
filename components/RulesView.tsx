
import React from 'react';
import { PieceIcon } from './PieceIcon';
import { PieceType, PlayerType } from '../types';

interface RulesViewProps {
    onPlay: () => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ onPlay }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black rounded-3xl p-8 max-w-2xl w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="text-center mb-6 shrink-0">
                    <h1 className="text-5xl font-extrabold text-black uppercase tracking-tighter mb-2">
                        Nissi Samurai
                    </h1>
                    <p className="text-gray-500 font-serif italic text-lg">"Strategy on the Line"</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-8 text-left custom-scrollbar">

                    {/* Section 1: Objective */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-black text-black border-b-2 border-black pb-1 inline-block">
                            1. The Objective
                        </h2>
                        <p className="text-gray-700 leading-relaxed font-medium">
                            Win the game by achieving one of two goals:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <li className="bg-red-50 border border-red-200 p-4 rounded-xl">
                                <span className="block font-bold text-red-600 mb-1">🎯 Assassination (Instant Win)</span>
                                Capture the enemy <span className="font-bold">Protector</span>.
                            </li>
                            <li className="bg-blue-50 border-blue-200 p-4 rounded-xl">
                                <span className="block font-bold text-blue-600 mb-1">⏳ Attrition (Time Win)</span>
                                Have a higher <span className="font-bold">Army Score</span> when timer ends.
                            </li>
                        </ul>
                    </section>

                    {/* Section 2: Units */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-black border-b-2 border-black pb-1 inline-block">
                            2. The Units
                        </h2>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="shrink-0 w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                <div className="w-12 h-12"><PieceIcon type={PieceType.SAMURAI} owner={PlayerType.PLAYER} /></div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Samurai <span className="text-sm font-normal text-gray-500">(5 pts)</span></h3>
                                <p className="text-sm text-gray-600 mt-1">The backbone of your army.</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 font-medium">
                                    <li>Move 1 step <b>Forward</b>, <b>Left</b>, or <b>Right</b>.</li>
                                    <li>Cannot move Backward or Diagonally.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                            <div className="shrink-0 w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                <div className="w-12 h-12"><PieceIcon type={PieceType.PROTECTOR} owner={PlayerType.PLAYER} /></div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Protector <span className="text-sm font-normal text-gray-500">(10 pts)</span></h3>
                                <p className="text-sm text-gray-600 mt-1">Your most valuable unit.</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 font-medium">
                                    <li><b>Normal:</b> Move 1 step in ANY direction.</li>
                                    <li><b>Promotion:</b> Reach the enemy's back row to enter <b>Raging Mode</b> (Moves infinitely like a Queen).</li>
                                    <li className="text-red-600">Leaves Raging Mode if moved off the back row.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Controls */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-black text-black border-b-2 border-black pb-1 inline-block">
                            3. Controls
                        </h2>
                        <div className="bg-gray-900 text-white p-6 rounded-xl space-y-4 font-mono text-sm">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span>Select Unit</span>
                                <span className="text-yellow-400 font-bold">Z, X, C, V, B</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span>Move</span>
                                <span className="text-yellow-400 font-bold">Arrow Keys</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Rocket Jump</span>
                                <span className="text-green-400 font-bold">Type Coord (e.g. "A5")</span>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <button
                        onClick={onPlay}
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white transition-all duration-200 bg-black rounded-lg hover:bg-gray-800 hover:scale-105 hover:shadow-lg w-full sm:w-auto"
                    >
                        <span className="mr-2 text-xl">ENTER THE BATTLEFIELD</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>

            </div>
        </div>
    );
};
