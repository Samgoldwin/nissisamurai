
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in this setup
        methods: ["GET", "POST"]
    }
});

// Store room state
// roomID -> { players: [socketId1, socketId2], board: ..., turn: ... }
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', (roomId) => {
        if (rooms.has(roomId)) {
            socket.emit('error', 'Room already exists');
            return;
        }
        rooms.set(roomId, {
            players: [socket.id],
            ready: false
        });
        socket.join(roomId);
        socket.emit('room_created', roomId);
        console.log(`Room ${roomId} created by ${socket.id}`);
    });

    socket.on('join_room', (roomId) => {
        const room = rooms.get(roomId);
        if (!room) {
            socket.emit('error', 'Room does not exist');
            return;
        }
        if (room.players.length >= 2) {
            socket.emit('error', 'Room is full');
            return;
        }

        room.players.push(socket.id);
        room.ready = true;
        socket.join(roomId);

        // Notify both
        io.to(roomId).emit('game_start', {
            players: room.players
        });
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('make_move', ({ roomId, move, newState }) => {
        // Broadcast move to other player in room
        socket.to(roomId).emit('opponent_move', { move, newState });
    });

    // Handle game over, resets, etc.
    socket.on('game_event', ({ roomId, type, data }) => {
        socket.to(roomId).emit('game_event', { type, data });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Cleanup rooms logic would go here (omitted for brevity)
        // For now, if a player leaves, maybe notify the other?
        rooms.forEach((value, key) => {
            if (value.players.includes(socket.id)) {
                io.to(key).emit('player_left');
                rooms.delete(key);
            }
        });
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
