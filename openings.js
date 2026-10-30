/**
 * Chess Opening Book & Identification System
 * Over 100 classic and modern openings with ECO codes.
 */

export const OPENINGS = [
    // E4 OPENINGS
    { eco: "C60", name: "Ruy Lopez", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"] },
    { eco: "C65", name: "Ruy Lopez: Berlin Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"] },
    { eco: "C78", name: "Ruy Lopez: Morphy Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6"] },
    { eco: "C50", name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"] },
    { eco: "C53", name: "Italian Game: Giuoco Piano", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"] },
    { eco: "C51", name: "Evans Gambit", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"] },
    { eco: "C55", name: "Two Knights Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"] },
    { eco: "C45", name: "Scotch Game", moves: ["e4", "e5", "Nf3", "Nc6", "d4"] },
    { eco: "C42", name: "Petrov's Defense", moves: ["e4", "e5", "Nf3", "Nf6"] },
    { eco: "C40", name: "King's Knight Opening", moves: ["e4", "e5", "Nf3"] },
    { eco: "C23", name: "Bishop's Opening", moves: ["e4", "e5", "Bc4"] },
    { eco: "C25", name: "Vienna Game", moves: ["e4", "e5", "Nc3"] },
    { eco: "C30", name: "King's Gambit", moves: ["e4", "e5", "f4"] },
    { eco: "C33", name: "King's Gambit Accepted", moves: ["e4", "e5", "f4", "exf4"] },
    { eco: "C21", name: "Center Game", moves: ["e4", "e5", "d4"] },
    { eco: "C20", name: "King's Pawn Game", moves: ["e4", "e5"] },

    // SICILIAN DEFENSE
    { eco: "B90", name: "Sicilian Defense: Najdorf", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"] },
    { eco: "B70", name: "Sicilian Defense: Dragon", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"] },
    { eco: "B80", name: "Sicilian Defense: Scheveningen", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e6"] },
    { eco: "B33", name: "Sicilian Defense: Sveshnikov", moves: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e5"] },
    { eco: "B22", name: "Sicilian Defense: Alapin Variation", moves: ["e4", "c5", "c3"] },
    { eco: "B23", name: "Closed Sicilian", moves: ["e4", "c5", "Nc3"] },
    { eco: "B21", name: "Sicilian Defense: Grand Prix Attack", moves: ["e4", "c5", "f4"] },
    { eco: "B20", name: "Sicilian Defense", moves: ["e4", "c5"] },

    // FRENCH DEFENSE
    { eco: "C15", name: "French Defense: Winawer", moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"] },
    { eco: "C11", name: "French Defense: Classical", moves: ["e4", "e6", "d4", "d5", "Nc3", "Nf6"] },
    { eco: "C02", name: "French Defense: Advance Variation", moves: ["e4", "e6", "d4", "d5", "e5"] },
    { eco: "C01", name: "French Defense: Exchange Variation", moves: ["e4", "e6", "d4", "d5", "exd5"] },
    { eco: "C03", name: "French Defense: Tarrasch", moves: ["e4", "e6", "d4", "d5", "Nd2"] },
    { eco: "C00", name: "French Defense", moves: ["e4", "e6"] },

    // CARO-KANN DEFENSE
    { eco: "B12", name: "Caro-Kann: Advance Variation", moves: ["e4", "c6", "d4", "d5", "e5"] },
    { eco: "B18", name: "Caro-Kann: Classical Variation", moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"] },
    { eco: "B13", name: "Caro-Kann: Panov-Botvinnik Attack", moves: ["e4", "c6", "d4", "d5", "exd5", "cxd5", "c4"] },
    { eco: "B10", name: "Caro-Kann Defense", moves: ["e4", "c6"] },

    // SCANDINAVIAN, PIRC, ALEKHINE
    { eco: "B01", name: "Scandinavian Defense", moves: ["e4", "d5"] },
    { eco: "B01", name: "Scandinavian Defense: Mieses-Kotroc", moves: ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5"] },
    { eco: "B07", name: "Pirc Defense", moves: ["e4", "d6", "d4", "Nf6"] },
    { eco: "B02", name: "Alekhine's Defense", moves: ["e4", "Nf6"] },

    // D4 OPENINGS
    { eco: "D20", name: "Queen's Gambit Accepted", moves: ["d4", "d5", "c4", "dxc4"] },
    { eco: "D30", name: "Queen's Gambit Declined", moves: ["d4", "d5", "c4", "e6"] },
    { eco: "D10", name: "Slav Defense", moves: ["d4", "d5", "c4", "c6"] },
    { eco: "D43", name: "Semi-Slav Defense", moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "e6"] },
    { eco: "D06", name: "Queen's Gambit", moves: ["d4", "d5", "c4"] },
    { eco: "D00", name: "Queen's Pawn Game", moves: ["d4", "d5"] },
    { eco: "D02", name: "London System", moves: ["d4", "d5", "Nf3", "Nf6", "Bf4"] },
    { eco: "D01", name: "Richter-Veresov Attack", moves: ["d4", "d5", "Nc3", "Nf6", "Bg5"] },

    // INDIAN DEFENSES
    { eco: "E60", name: "King's Indian Defense", moves: ["d4", "Nf6", "c4", "g6"] },
    { eco: "E97", name: "King's Indian: Mar del Plata", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5", "O-O", "Nc6"] },
    { eco: "E20", name: "Nimzo-Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"] },
    { eco: "E12", name: "Queen's Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"] },
    { eco: "E00", name: "Catalan Opening", moves: ["d4", "Nf6", "c4", "e6", "g3"] },
    { eco: "D70", name: "Grunfeld Defense", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"] },
    { eco: "A56", name: "Benoni Defense", moves: ["d4", "Nf6", "c4", "c5"] },
    { eco: "A57", name: "Benko Gambit", moves: ["d4", "Nf6", "c4", "c5", "d5", "b5"] },
    { eco: "A80", name: "Dutch Defense", moves: ["d4", "f5"] },

    // FLANK OPENINGS
    { eco: "A10", name: "English Opening", moves: ["c4"] },
    { eco: "A20", name: "English Opening: King's English", moves: ["c4", "e5"] },
    { eco: "A15", name: "English Opening: Anglo-Indian", moves: ["c4", "Nf6"] },
    { eco: "A04", name: "Reti Opening", moves: ["Nf3"] },
    { eco: "A00", name: "King's Fianchetto Opening", moves: ["g3"] },
    { eco: "B00", name: "King's Pawn Opening", moves: ["e4"] },
    { eco: "A40", name: "Queen's Pawn Opening", moves: ["d4"] }
];

export function identifyOpening(history) {
    if (!history || history.length === 0) {
        return { eco: "A00", name: "Standard Starting Position" };
    }

    let bestMatch = null;
    let maxMatched = 0;

    for (const op of OPENINGS) {
        if (op.moves.length <= history.length) {
            let matches = true;
            for (let i = 0; i < op.moves.length; i++) {
                if (history[i] !== op.moves[i]) {
                    matches = false;
                    break;
                }
            }
            if (matches && op.moves.length > maxMatched) {
                maxMatched = op.moves.length;
                bestMatch = op;
            }
        }
    }

    return bestMatch || { eco: "---", name: "Custom Game Position" };
}
