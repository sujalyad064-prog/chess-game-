/**
 * Curated Chess Tactics & Puzzles: Basic to Advance
 * Famous textbook themes: Mate in 1, Back Rank, Arabian Mate,
 * Epaulette Mate, Smothered Mate, Greek Gift, Anastasia's Mate.
 */

export const PUZZLES = [
    // BASIC PUZZLES (Level 1: 800 - 1200)
    {
        id: 1,
        title: "Scholar's Kiss",
        level: "Basic",
        rating: 850,
        theme: "Mate in 1",
        turn: "w",
        fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5",
        prompt: "White to move: Deliver instantaneous Checkmate!",
        hint: "The f7 square is weak and guarded only by the black king.",
        moves: [{ from: "f3", to: "f7", san: "Qxf7#" }]
    },
    {
        id: 2,
        title: "Back Rank Execution",
        level: "Basic",
        rating: 950,
        theme: "Back Rank Mate",
        turn: "w",
        fen: "6k1/5ppp/8/8/8/8/4rPPP/1R4K1 w - - 0 1",
        prompt: "White to move: Punish the undefended back rank!",
        hint: "Black's king is trapped behind its own pawns. Use your rook!",
        moves: [{ from: "b1", to: "b8", san: "Rb8#" }]
    },
    {
        id: 3,
        title: "Fool's Diagonal",
        level: "Basic",
        rating: 900,
        theme: "Mate in 1",
        turn: "b",
        fen: "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2",
        prompt: "Black to move: Punish White's fatal pawn weakness!",
        hint: "The e1-h4 diagonal is completely exposed.",
        moves: [{ from: "d8", to: "h4", san: "Qh4#" }]
    },
    {
        id: 4,
        title: "Corridor Mate",
        level: "Basic",
        rating: 1050,
        theme: "Back Rank Mate",
        turn: "w",
        fen: "3r2k1/p4ppp/8/8/8/8/P4PPP/3RR1K1 w - - 0 1",
        prompt: "White to move: Seize the open d-file with checkmate!",
        hint: "Capture the black rook on d8.",
        moves: [{ from: "d1", to: "d8", san: "Rxd8#" }]
    },

    // INTERMEDIATE PUZZLES (Level 2: 1300 - 1700)
    {
        id: 5,
        title: "Arabian Checkmate",
        level: "Intermediate",
        rating: 1350,
        theme: "Arabian Mate",
        turn: "w",
        fen: "7k/R7/5N2/8/8/8/8/7K w - - 0 1",
        prompt: "White to move: The legendary Knight and Rook combo!",
        hint: "Rook to h7 delivers checkmate protected by the knight.",
        moves: [{ from: "a7", to: "h7", san: "Rh7#" }]
    },
    {
        id: 6,
        title: "Epaulette Mate",
        level: "Intermediate",
        rating: 1450,
        theme: "Epaulette Mate",
        turn: "w",
        fen: "3rkr2/8/8/8/8/8/8/4Q1K1 w - - 0 1",
        prompt: "White to move: Exploit Black's trapped king between its rooks!",
        hint: "Infiltrate with your Queen on e7.",
        moves: [{ from: "e1", to: "e7", san: "Qe7#" }]
    },
    {
        id: 7,
        title: "Anastasia's Vault",
        level: "Intermediate",
        rating: 1550,
        theme: "Anastasia's Mate",
        turn: "w",
        fen: "7k/4N1pp/8/8/8/8/8/R6K w - - 0 1",
        prompt: "White to move: Knight cuts off the escape squares!",
        hint: "Invade the 8th rank with your rook.",
        moves: [{ from: "a1", to: "a8", san: "Ra8#" }]
    },
    {
        id: 8,
        title: "Free Queen Deflection",
        level: "Intermediate",
        rating: 1500,
        theme: "Hanging Piece",
        turn: "w",
        fen: "r4rk1/ppp2ppp/8/8/1b1q4/8/PP2RPPP/R1BQ2K1 w - - 0 1",
        prompt: "White to move: Free capture of Black's central queen!",
        hint: "The Queen on d4 is undefended.",
        moves: [{ from: "d1", to: "d4", san: "Qxd4" }]
    },

    // ADVANCED PUZZLES (Level 3: 1800 - 2400)
    {
        id: 9,
        title: "The Greek Gift Strike",
        level: "Advance",
        rating: 1850,
        theme: "Bishop Sacrifice",
        turn: "w",
        fen: "r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
        prompt: "White to move: Smash Black's castle with a thematic sacrifice!",
        hint: "Bxh7+ tears open the kingside defenses.",
        moves: [{ from: "d3", to: "h7", san: "Bxh7+" }]
    },
    {
        id: 10,
        title: "Smothered Knight Infiltration",
        level: "Advance",
        rating: 1950,
        theme: "Knight Dominance",
        turn: "w",
        fen: "r1b2r1k/pp3ppp/2n5/4N3/2B5/8/PP3PPP/R2QR1K1 w - - 0 1",
        prompt: "White to move: Devastating knight blow on f7!",
        hint: "Nxf7# seals the king's fate.",
        moves: [{ from: "e5", to: "f7", san: "Nxf7#" }]
    },
    {
        id: 11,
        title: "Boden's Mate Cross-Bishops",
        level: "Advance",
        rating: 2100,
        theme: "Criss-Cross Mate",
        turn: "w",
        fen: "2kr4/ppp2ppp/8/8/2B5/8/PP3PPP/R1B1K2R w KQ - 0 1",
        prompt: "White to move: Attack the vulnerable c8 square!",
        hint: "Bxf7 or bishop attack.",
        moves: [{ from: "c4", to: "f7", san: "Bxf7" }]
    },
    {
        id: 12,
        title: "Corner Net Checkmate",
        level: "Advance",
        rating: 2350,
        theme: "Endgame Mate",
        turn: "w",
        fen: "k7/8/1K6/8/8/8/8/R7 w - - 0 1",
        prompt: "White to move: Finish the king in 1 move!",
        hint: "Rook to a7 or h1.",
        moves: [{ from: "a1", to: "a7", san: "Ra7#" }]
    }
];

export function getPuzzlesByLevel(level) {
    if (!level || level === "All") return PUZZLES;
    return PUZZLES.filter(p => p.level.toLowerCase() === level.toLowerCase());
}
