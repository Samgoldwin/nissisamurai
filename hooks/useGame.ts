
import { useState, useEffect, useCallback } from 'react';
import {
    generateBoard,
    executeMove,
    checkInstantWin,
    calculateScore,
    calculateCurrentScore,
    getBestAIMove,
    getValidMoves
} from '../utils/gameLogic';
import { Piece, PlayerType, Position, Move, Scoring, GameMode } from '../types';

export const useGame = (gameMode: GameMode) => {
    const [pieces, setPieces] = useState<Piece[]>([]);
    const [graveyard, setGraveyard] = useState<Piece[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<PlayerType>(PlayerType.PLAYER);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [scoring, setScoring] = useState<Scoring | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(300); // 5 mins default
    const [started, setStarted] = useState(false);
    const [lastMove, setLastMove] = useState<Move | null>(null);
    const [capturePos, setCapturePos] = useState<Position | null>(null);
    const [currentScore, setCurrentScore] = useState({ player: 0, ai: 0 });

    // Init
    const startGame = useCallback((minutes: number) => {
        setTimeLeft(minutes * 60);
        setPieces(generateBoard());
        setGraveyard([]);
        setCurrentPlayer(PlayerType.PLAYER);
        setGameOver(false);
        setScoring(null);
        setLastMove(null);
        setStarted(true);
    }, []);

    const endGame = useCallback((reason: 'TIME_UP' | 'INSTANT_WIN', instantWinner?: PlayerType) => {
        setGameOver(true);
        if (reason === 'TIME_UP') {
            setScoring(calculateScore(pieces, graveyard));
        } else {
            const winner = instantWinner || PlayerType.PLAYER;
            const scores = calculateCurrentScore(pieces);
            setScoring({
                playerScore: scores.player,
                aiScore: scores.ai,
                winner,
                reason: 'General Defeated!'
            });
        }
    }, [pieces, graveyard]);

    // Timer
    useEffect(() => {
        if (!started || gameOver) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame('TIME_UP');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [started, gameOver, endGame]);

    // Score Tracking
    useEffect(() => {
        if (started) setCurrentScore(calculateCurrentScore(pieces));
    }, [pieces, started]);

    // AI
    useEffect(() => {
        if (started && !gameOver && gameMode === 'PVE' && currentPlayer === PlayerType.AI) {
            const timer = setTimeout(() => {
                const move = getBestAIMove(pieces);
                if (move) processMove(move);
                else setCurrentPlayer(PlayerType.PLAYER);
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, started, gameOver, pieces, gameMode]);

    const processMove = useCallback((move: Move) => {
        const result = executeMove(pieces, move);
        setPieces(result.pieces);
        setLastMove(move);

        if (result.killed) {
            setCapturePos(move.to);
            setTimeout(() => setCapturePos(null), 500);
            setGraveyard(prev => [...prev, result.killed!]);
        }

        // Check Win
        const currentGraveyard = [...graveyard, ...(result.killed ? [result.killed] : [])];
        const instantWinner = checkInstantWin(currentGraveyard);

        if (instantWinner) {
            endGame('INSTANT_WIN', instantWinner);
        } else {
            setCurrentPlayer(prev => prev === PlayerType.PLAYER ? PlayerType.AI : PlayerType.PLAYER);
        }
    }, [pieces, graveyard, endGame]);

    return {
        pieces,
        graveyard,
        currentPlayer,
        gameOver,
        scoring,
        timeLeft,
        started,
        lastMove,
        capturePos,
        currentScore,
        startGame,
        processMove,
        setStarted
    };
};
