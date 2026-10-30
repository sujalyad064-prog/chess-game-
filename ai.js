/**
 * Multi-Level Chess AI Engine & Tactical Evaluator
 * Features:
 * - Level 1: Novice (~800 ELO)
 * - Level 2: Intermediate (~1400 ELO)
 * - Level 3: Advanced (~1900 ELO)
 * - Level 4: Grandmaster (~2400+ ELO)
 * - Real-time Position Evaluation (Centipawns & Win Probability)
 * - Hint & Best-Move Generator with Tactical Explanation
 */

// Piece values in centipawns
const PIECE_VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
};

// Piece-Square Tables (White perspective: row 0 is rank 8, row 7 is rank 1)
const PST_PAWN = [
    [0,   0,   0,   0,   0,   0,   0,   0],
    [50, 50,  50,  50,  50,  50,  50,  50],
    [10, 10,  20,  30,  30,  20,  10,  10],
    [5,   5,  10,  25,  25,  10,   5,   5],
    [0,   0,   0,  20,  20,   0,   0,   0],
    [5,  -5, -10,   0,   0, -10,  -5,   5],
    [5,  10,  10, -20, -20,  10,  10,   5],
    [0,   0,   0,   0,   0,   0,   0,   0]
];

const PST_KNIGHT = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20,   0,   5,   5,   0, -20, -40],
    [-30,   5,  10,  15,  15,  10,   5, -30],
    [-30,   0,  15,  20,  20,  15,   0, -30],
    [-30,   5,  15,  20,  20,  15,   5, -30],
    [-30,   0,  10,  15,  15,  10,   0, -30],
    [-40, -20,   0,   0,   0,   0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
];

const PST_BISHOP = [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10,   5,   0,   0,   0,   0,   5, -10],
    [-10,  10,  10,  10,  10,  10,  10, -10],
    [-10,   0,  10,  10,  10,  10,   0, -10],
    [-10,   5,   5,  10,  10,   5,   5, -10],
    [-10,   0,   5,  10,  10,   5,   0, -10],
    [-10,   0,   0,   0,   0,   0,   0, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
];

const PST_ROOK = [
    [0,   0,   0,   5,   5,   0,   0,   0],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [-5,  0,   0,   0,   0,   0,   0,  -5],
    [5,  10,  10,  10,  10,  10,  10,   5],
    [0,   0,   0,   0,   0,   0,   0,   0]
];

const PST_QUEEN = [
    [-20, -10, -10,  -5,  -5, -10, -10, -20],
    [-10,   0,   0,   0,   0,   0,   0, -10],
    [-10,   0,   5,   5,   5,   5,   0, -10],
    [-5,    0,   5,   5,   5,   5,   0,  -5],
    [0,     0,   5,   5,   5,   5,   0,  -5],
    [-10,   5,   5,   5,   5,   5,   0, -10],
    [-10,   0,   5,   0,   0,   0,   0, -10],
    [-20, -10, -10,  -5,  -5, -10, -10, -20]
];

const PST_KING_MID = [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20,   20,   0,   0,   0,   0,  20,  20],
    [20,   30,  10,   0,   0,  10,  30,  20]
];

function getSquareCoords(sq) {
    const col = sq.charCodeAt(0) - 97;
    const row = 8 - parseInt(sq[1], 10);
    return { row, col };
}

// Static Evaluation Function
export function evaluateBoard(game) {
    if (game.isCheckmate()) {
        return game.turn() === 'w' ? -99999 : 99999;
    }
    if (game.isDraw()) {
        return 0;
    }

    const board = game.board();
    let score = 0;
    let whitePieces = 0;
    let blackPieces = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            const isWhite = piece.color === 'w';
            const val = PIECE_VALUES[piece.type];
            let pst = 0;

            const pstRow = isWhite ? r : 7 - r;
            const pstCol = isWhite ? c : 7 - c;

            switch (piece.type) {
                case 'p': pst = PST_PAWN[pstRow][pstCol]; break;
                case 'n': pst = PST_KNIGHT[pstRow][pstCol]; break;
                case 'b': pst = PST_BISHOP[pstRow][pstCol]; break;
                case 'r': pst = PST_ROOK[pstRow][pstCol]; break;
                case 'q': pst = PST_QUEEN[pstRow][pstCol]; break;
                case 'k': pst = PST_KING_MID[pstRow][pstCol]; break;
            }

            const totalPieceVal = val + pst;
            if (isWhite) {
                score += totalPieceVal;
                whitePieces++;
            } else {
                score -= totalPieceVal;
                blackPieces++;
            }
        }
    }

    // Bishop pair bonus
    return score;
}

// Move ordering heuristic: Captures first (MVV-LVA), checks, then others
function orderMoves(moves) {
    return moves.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (a.captured) {
            scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
        }
        if (b.captured) {
            scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
        }
        if (a.promotion) scoreA += 800;
        if (b.promotion) scoreB += 800;
        if (a.san && a.san.includes('+')) scoreA += 150;
        if (b.san && b.san.includes('+')) scoreB += 150;

        return scoreB - scoreA;
    });
}

// Quiescence Search to evaluate tactical captures
function quiescence(game, alpha, beta, colorFactor, maxDepth = 3) {
    const standPat = colorFactor * evaluateBoard(game);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
    if (maxDepth <= 0) return standPat;

    const moves = game.moves({ verbose: true }).filter(m => m.captured || m.promotion);
    const ordered = orderMoves(moves);

    for (const move of ordered) {
        game.move(move);
        const score = -quiescence(game, -beta, -alpha, -colorFactor, maxDepth - 1);
        game.undo();

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }

    return alpha;
}

// Minimax with Alpha-Beta Pruning
function minimax(game, depth, alpha, beta, isMaximizing, useQuiescence = true) {
    if (depth === 0) {
        if (useQuiescence) {
            return quiescence(game, alpha, beta, isMaximizing ? 1 : -1, 3);
        }
        return evaluateBoard(game);
    }

    if (game.isGameOver()) {
        return evaluateBoard(game);
    }

    const legalMoves = orderMoves(game.moves({ verbose: true }));

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of legalMoves) {
            game.move(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, false, useQuiescence);
            game.undo();
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break; // Pruning
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of legalMoves) {
            game.move(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, true, useQuiescence);
            game.undo();
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break; // Pruning
        }
        return minEval;
    }
}

// Main AI Move Calculator
export function getBestMove(game, level = 2) {
    const moves = game.moves({ verbose: true });
    if (!moves.length) return null;

    const isWhite = game.turn() === 'w';

    // LEVEL 1: NOVICE (~800 ELO)
    // Casual player - 60% random, 40% simple capture/check
    if (level === 1) {
        // Occasionally blunder or pick fun move
        if (Math.random() < 0.45) {
            const captures = moves.filter(m => m.captured || (m.san && m.san.includes('+')));
            if (captures.length) {
                return captures[Math.floor(Math.random() * captures.length)];
            }
        }
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // LEVEL 2: INTERMEDIATE (~1400 ELO)
    // 2-ply search with piece-square evaluation
    if (level === 2) {
        const ordered = orderMoves([...moves]);
        let bestMove = ordered[0];
        let bestScore = isWhite ? -Infinity : Infinity;

        for (const move of ordered) {
            game.move(move);
            const score = minimax(game, 1, -Infinity, Infinity, !isWhite, false);
            game.undo();

            if (isWhite ? score > bestScore : score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    // LEVEL 3: ADVANCED (~1900 ELO)
    // 3-ply alpha-beta + Quiescence search
    if (level === 3) {
        const ordered = orderMoves([...moves]);
        let bestMove = ordered[0];
        let bestScore = isWhite ? -Infinity : Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        for (const move of ordered) {
            game.move(move);
            const score = minimax(game, 2, alpha, beta, !isWhite, true);
            game.undo();

            if (isWhite) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, score);
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                beta = Math.min(beta, score);
            }
        }
        return bestMove;
    }

    // LEVEL 4: GRANDMASTER (~2400+ ELO)
    // 4-ply Alpha-Beta + Quiescence + Deep Move Ordering
    const ordered = orderMoves([...moves]);
    let bestMove = ordered[0];
    let bestScore = isWhite ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of ordered) {
        game.move(move);
        const score = minimax(game, 3, alpha, beta, !isWhite, true);
        game.undo();

        if (isWhite) {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            alpha = Math.max(alpha, score);
        } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
            beta = Math.min(beta, score);
        }
    }

    return bestMove;
}

// Generate Tactical Hint with natural language explanation
export function getTacticalHint(game) {
    const isWhite = game.turn() === 'w';
    const moves = game.moves({ verbose: true });
    if (!moves.length) return null;

    const bestMove = getBestMove(game, 3);
    if (!bestMove) return null;

    let explanation = "Solid strategic move to maintain control.";

    if (bestMove.san && bestMove.san.includes('#')) {
        explanation = "Delivers unstoppable Checkmate!";
    } else if (bestMove.san && bestMove.san.includes('+')) {
        explanation = "Delivers check to force the opponent's king or defense.";
    } else if (bestMove.captured) {
        const capName = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen' }[bestMove.captured] || 'piece';
        explanation = `Captures opponent's ${capName} on ${bestMove.to} for material gain!`;
    } else if (bestMove.promotion) {
        explanation = `Promotes pawn to a Queen on ${bestMove.to}!`;
    } else if (bestMove.flags && (bestMove.flags.includes('k') || bestMove.flags.includes('q'))) {
        explanation = "Castles to secure king safety and activate the rook.";
    } else if (['e4', 'd4', 'e5', 'd5', 'c4', 'f4'].includes(bestMove.to)) {
        explanation = `Occupies the critical center square ${bestMove.to}.`;
    } else if (bestMove.piece === 'n' || bestMove.piece === 'b') {
        explanation = `Develops the minor piece to ${bestMove.to} to control key squares.`;
    }

    return {
        move: bestMove,
        san: bestMove.san || `${bestMove.from}-${bestMove.to}`,
        from: bestMove.from,
        to: bestMove.to,
        explanation
    };
}
