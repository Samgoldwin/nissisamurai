
import { useState, useEffect } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Move, PlayerType } from '../types';

export const useOnlineManager = (
    onMoveReceived: (move: Move) => void,
    onGameStart: () => void,
    onOpponentDisconnect: () => void
) => {
    const [peer, setPeer] = useState<Peer | null>(null);
    const [conn, setConn] = useState<DataConnection | null>(null);
    const [roomId, setRoomId] = useState('');
    const [lobbyStatus, setLobbyStatus] = useState<'IDLE' | 'WAITING' | 'CONNECTING'>('IDLE');
    const [myRole, setMyRole] = useState<PlayerType | null>(null);

    useEffect(() => {
        return () => {
            peer?.destroy();
        };
    }, []);

    const createRoom = () => {
        const newPeer = new Peer();
        setPeer(newPeer);
        setLobbyStatus('WAITING');

        newPeer.on('open', (id) => setRoomId(id));
        newPeer.on('connection', (connection) => {
            connection.on('open', () => {
                setMyRole(PlayerType.PLAYER);
                onGameStart();
            });
            setupConnection(connection);
            setConn(connection);
        });
        newPeer.on('error', (err) => {
            alert('Error: ' + err.type);
            setLobbyStatus('IDLE');
        });
    };

    const joinRoom = (targetId: string) => {
        const newPeer = new Peer();
        setPeer(newPeer);
        setLobbyStatus('CONNECTING');

        newPeer.on('open', () => {
            const connection = newPeer.connect(targetId);
            connection.on('open', () => {
                setMyRole(PlayerType.AI);
                onGameStart();
            });
            connection.on('error', () => {
                alert('Could not connect. Check code.');
                setLobbyStatus('IDLE');
            });
            setupConnection(connection);
            setConn(connection);
        });
    };

    const setupConnection = (connection: DataConnection) => {
        connection.on('data', (data: any) => {
            if (data.type === 'MOVE') onMoveReceived(data.move);
        });
        connection.on('close', () => {
            onOpponentDisconnect();
            cleanup();
        });
    };

    const sendMove = (move: Move) => {
        if (conn) conn.send({ type: 'MOVE', move });
    };

    const cleanup = () => {
        peer?.destroy();
        setPeer(null);
        setConn(null);
        setLobbyStatus('IDLE');
        setRoomId('');
    };

    return {
        createRoom,
        joinRoom,
        sendMove,
        cleanup,
        roomId,
        lobbyStatus,
        myRole
    };
};
