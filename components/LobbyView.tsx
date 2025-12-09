
import React, { useState } from 'react';

interface LobbyViewProps {
    status: 'IDLE' | 'WAITING' | 'CONNECTING';
    roomId: string;
    onCreateRoom: () => void;
    onJoinRoom: (id: string) => void;
    onCancel: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ status, roomId, onCreateRoom, onJoinRoom, onCancel }) => {
    const [joinInput, setJoinInput] = useState('');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full text-center space-y-6">
                <h2 className="text-2xl font-black text-black uppercase">Online Lobby</h2>

                {status === 'IDLE' ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400">JOIN EXISTING ROOM</label>
                            <div className="flex gap-2">
                                <input
                                    value={joinInput}
                                    onChange={(e) => setJoinInput(e.target.value)}
                                    placeholder="Enter Room ID"
                                    className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 font-mono text-center focus:border-black outline-none font-bold"
                                />
                                <button
                                    onClick={() => onJoinRoom(joinInput)}
                                    disabled={!joinInput}
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
                            onClick={onCreateRoom}
                            className="w-full py-3 border-2 border-black text-black font-bold rounded-lg hover:bg-gray-50"
                        >
                            CREATE NEW ROOM
                        </button>
                    </div>
                ) : (
                    <div className="py-8 space-y-4">
                        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
                        <p className="font-bold text-gray-600">
                            {status === 'CONNECTING' ? "Connecting to Room..." : "Waiting for Opponent..."}
                        </p>
                        {roomId && (
                            <>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Room Code</p>
                                    <p className="text-2xl font-mono font-black break-all">{roomId}</p>
                                </div>
                                <p className="text-xs text-gray-400">Share this code with your friend</p>
                            </>
                        )}
                    </div>
                )}

                <button onClick={onCancel} className="text-sm text-gray-400 hover:text-black underline">Cancel</button>
            </div>
        </div>
    );
};
