
import React, { useState } from 'react';

interface SetupViewProps {
    onStartLocal: (minutes: number, mode: 'PVE' | 'PVP') => void;
    onStartOnline: () => void;
    onBack: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({ onStartLocal, onStartOnline, onBack }) => {
    const [localTab, setLocalTab] = useState<'PVE' | 'PVP'>('PVE');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full text-center space-y-6">
                <h2 className="text-3xl font-extrabold text-black">CHOOSE MODE</h2>

                <div className="space-y-4">
                    {/* Local Section */}
                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Local Play</h3>

                        <div className="flex bg-white p-1 rounded-lg border border-gray-300 mb-4">
                            <button
                                onClick={() => setLocalTab('PVE')}
                                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${localTab === 'PVE' ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                VS Computer
                            </button>
                            <button
                                onClick={() => setLocalTab('PVP')}
                                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${localTab === 'PVP' ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                2 Player
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onStartLocal(5, localTab)} className="py-2 border-2 border-black rounded font-bold hover:bg-gray-50">5 Min</button>
                            <button onClick={() => onStartLocal(10, localTab)} className="py-2 border-2 border-black rounded font-bold hover:bg-gray-50">10 Min</button>
                        </div>
                    </div>

                    {/* Online Section */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <h3 className="text-sm font-bold text-blue-500 uppercase mb-3">Online Multiplayer</h3>
                        <button
                            onClick={onStartOnline}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                        >
                            PLAY ONLINE
                        </button>
                    </div>
                </div>

                <button onClick={onBack} className="text-xs text-gray-400 hover:text-black mt-4 underline">Back to Rules</button>
            </div>
        </div>
    );
};
