/**
 * Chess.js - Pure JavaScript Chess Library
 * Standalone ES Module providing complete FEN parsing, move generation,
 * legal validation, check/mate/draw detection, and PGN handling.
 */

const SYMBOLS = 'pnbrqkPNBRQK';
const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PAWN = 'p';
const KNIGHT = 'n';
const BISHOP = 'b';
const ROOK = 'r';
const QUEEN = 'q';
const KING = 'k';

const WHITE = 'w';
const BLACK = 'b';

const FLAGS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64
};

const SQUARES = {
    a8: 0,   b8: 1,   c8: 2,   d8: 3,   e8: 4,   f8: 5,   g8: 6,   h8: 7,
    a7: 16,  b7: 17,  c7: 18,  d7: 19,  e7: 20,  f7: 21,  g7: 22,  h7: 23,
    a6: 32,  b6: 33,  c6: 34,  d6: 35,  e6: 36,  f6: 37,  g6: 38,  h6: 39,
    a5: 48,  b5: 49,  c5: 50,  d5: 51,  e5: 52,  f5: 53,  g5: 54,  h5: 55,
    a4: 64,  b4: 65,  c4: 66,  d4: 67,  e4: 68,  f4: 69,  g4: 70,  h4: 71,
    a3: 80,  b3: 81,  c3: 82,  d3: 83,  e3: 84,  f3: 85,  g3: 86,  h3: 87,
    a2: 96,  b2: 97,  c2: 98,  d2: 99,  e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
};

const BITS_KSIDE_CASTLE = 1;
const BITS_QSIDE_CASTLE = 2;

const PIECE_OFFSETS = {
    [KNIGHT]: [-18, -33, -31, -14, 18, 33, 31, 14],
    [BISHOP]: [-17, -15, 17, 15],
    [ROOK]: [-16, 1, 16, -1],
    [QUEEN]: [-17, -16, -15, 1, 17, 16, 15, -1],
    [KING]: [-17, -16, -15, 1, 17, 16, 15, -1]
};

const PAWN_OFFSETS = {
    [WHITE]: {
        move: -16,
        startRank: 6,
        promoRank: 0,
        captures: [-17, -15]
    },
    [BLACK]: {
        move: 16,
        startRank: 1,
        promoRank: 7,
        captures: [15, 17]
    }
};

function algebraic(i) {
    const f = i & 15;
    const r = i >> 4;
    return 'abcdefgh'.charAt(f) + '87654321'.charAt(r);
}

function rank(i) {
    return i >> 4;
}

function file(i) {
    return i & 15;
}

export class Chess {
    constructor(fen = DEFAULT_POSITION) {
        this._board = new Array(128);
        this._kings = { [WHITE]: null, [BLACK]: null };
        this._turn = WHITE;
        this._castling = { [WHITE]: 0, [BLACK]: 0 };
        this._epSquare = null;
        this._halfMoves = 0;
        this._moveNumber = 1;
        this._history = [];
        this._header = {};
        this._comments = {};
        this.load(fen);
    }

    clear() {
        this._board = new Array(128);
        this._kings = { [WHITE]: null, [BLACK]: null };
        this._turn = WHITE;
        this._castling = { [WHITE]: 0, [BLACK]: 0 };
        this._epSquare = null;
        this._halfMoves = 0;
        this._moveNumber = 1;
        this._history = [];
        this._header = {};
    }

    reset() {
        this.load(DEFAULT_POSITION);
    }

    load(fen) {
        const tokens = fen.trim().split(/\s+/);
        if (tokens.length < 2) return false;
        const position = tokens[0];
        let square = 0;

        this.clear();

        for (let i = 0; i < position.length; i++) {
            const piece = position.charAt(i);
            if (piece === '/') {
                square += 8;
            } else if (!isNaN(parseInt(piece, 10))) {
                square += parseInt(piece, 10);
            } else {
                const color = (piece === piece.toUpperCase()) ? WHITE : BLACK;
                const type = piece.toLowerCase();
                this._put({ type, color }, square);
                square++;
            }
        }

        this._turn = tokens[1] === 'b' ? BLACK : WHITE;

        if (tokens[2]) {
            if (tokens[2].indexOf('K') > -1) this._castling[WHITE] |= BITS_KSIDE_CASTLE;
            if (tokens[2].indexOf('Q') > -1) this._castling[WHITE] |= BITS_QSIDE_CASTLE;
            if (tokens[2].indexOf('k') > -1) this._castling[BLACK] |= BITS_KSIDE_CASTLE;
            if (tokens[2].indexOf('q') > -1) this._castling[BLACK] |= BITS_QSIDE_CASTLE;
        }

        this._epSquare = (tokens[3] && tokens[3] !== '-') ? SQUARES[tokens[3]] : null;
        this._halfMoves = parseInt(tokens[4], 10) || 0;
        this._moveNumber = parseInt(tokens[5], 10) || 1;

        return true;
    }

    fen() {
        let empty = 0;
        let fen = '';

        for (let i = 0; i < 128; i++) {
            if (this._board[i] == null) {
                empty++;
            } else {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                const color = this._board[i].color;
                const type = this._board[i].type;
                fen += (color === WHITE) ? type.toUpperCase() : type.toLowerCase();
            }

            if ((i + 1) & 0x88) {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                if (i !== 119) {
                    fen += '/';
                }
                i += 8;
            }
        }

        let cflags = '';
        if (this._castling[WHITE] & BITS_KSIDE_CASTLE) cflags += 'K';
        if (this._castling[WHITE] & BITS_QSIDE_CASTLE) cflags += 'Q';
        if (this._castling[BLACK] & BITS_KSIDE_CASTLE) cflags += 'k';
        if (this._castling[BLACK] & BITS_QSIDE_CASTLE) cflags += 'q';
        if (cflags === '') cflags = '-';

        const ep = (this._epSquare === null) ? '-' : algebraic(this._epSquare);

        return [fen, this._turn, cflags, ep, this._halfMoves, this._moveNumber].join(' ');
    }

    _put(piece, square) {
        this._board[square] = piece;
        if (piece.type === KING) {
            this._kings[piece.color] = square;
        }
    }

    _remove(square) {
        const piece = this._board[square];
        this._board[square] = null;
        if (piece && piece.type === KING) {
            this._kings[piece.color] = null;
        }
        return piece;
    }

    get(square) {
        const sq = typeof square === 'string' ? SQUARES[square] : square;
        return this._board[sq] || null;
    }

    turn() {
        return this._turn;
    }

    board() {
        const output = [];
        let row = [];
        for (let i = 0; i < 128; i++) {
            if (this._board[i] == null) {
                row.push(null);
            } else {
                row.push({
                    square: algebraic(i),
                    type: this._board[i].type,
                    color: this._board[i].color
                });
            }
            if ((i + 1) & 0x88) {
                output.push(row);
                row = [];
                i += 8;
            }
        }
        return output;
    }

    _isAttacked(color, square) {
        for (let i = 0; i < 128; i++) {
            if (i & 0x88) { i += 7; continue; }
            if (this._board[i] == null || this._board[i].color !== color) continue;

            const piece = this._board[i];
            const diff = i - square;
            const index = diff + 119;

            if (piece.type === PAWN) {
                if (color === WHITE) {
                    if (diff === 15 || diff === 17) return true;
                } else {
                    if (diff === -15 || diff === -17) return true;
                }
            } else if (piece.type === KNIGHT) {
                const offsets = PIECE_OFFSETS[KNIGHT];
                for (let j = 0; j < offsets.length; j++) {
                    if (i + offsets[j] === square) return true;
                }
            } else if (piece.type === KING) {
                const offsets = PIECE_OFFSETS[KING];
                for (let j = 0; j < offsets.length; j++) {
                    if (i + offsets[j] === square) return true;
                }
            } else {
                const offsets = PIECE_OFFSETS[piece.type];
                for (let j = 0; j < offsets.length; j++) {
                    let dest = i;
                    while (true) {
                        dest += offsets[j];
                        if (dest & 0x88) break;
                        if (dest === square) return true;
                        if (this._board[dest] != null) break;
                    }
                }
            }
        }
        return false;
    }

    isCheck() {
        return this.inCheck();
    }

    inCheck() {
        const kingSq = this._kings[this._turn];
        if (kingSq === null || kingSq === undefined) return false;
        const opponent = this._turn === WHITE ? BLACK : WHITE;
        return this._isAttacked(opponent, kingSq);
    }

    isCheckmate() {
        return this.inCheck() && this.moves().length === 0;
    }

    isStalemate() {
        return !this.inCheck() && this.moves().length === 0;
    }

    isInsufficientMaterial() {
        const pieces = {};
        const bishops = [];
        let numPieces = 0;
        let sqColor = 0;

        for (let i = 0; i < 128; i++) {
            if (i & 0x88) { i += 7; continue; }
            const piece = this._board[i];
            if (piece) {
                pieces[piece.type] = (pieces[piece.type] || 0) + 1;
                if (piece.type === BISHOP) {
                    bishops.push((rank(i) + file(i)) % 2);
                }
                numPieces++;
            }
        }

        // K vs K
        if (numPieces === 2) return true;

        // K+B vs K or K+N vs K
        if (numPieces === 3 && (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)) return true;

        // K+B vs K+B with bishops on the same color
        if (numPieces === 4 && pieces[BISHOP] === 2 && bishops[0] === bishops[1]) return true;

        return false;
    }

    isThreefoldRepetition() {
        const hash = {};
        for (let i = 0; i < this._history.length; i++) {
            const h = this._history[i].position;
            hash[h] = (hash[h] || 0) + 1;
            if (hash[h] >= 3) return true;
        }
        return false;
    }

    isDraw() {
        return (
            this._halfMoves >= 100 ||
            this.isStalemate() ||
            this.isInsufficientMaterial() ||
            this.isThreefoldRepetition()
        );
    }

    isGameOver() {
        return this.isCheckmate() || this.isDraw();
    }

    _generateMoves(options = {}) {
        const moves = [];
        const us = this._turn;
        const them = us === WHITE ? BLACK : WHITE;
        const legalOnly = options.legal !== false;

        const firstSquare = options.square ? SQUARES[options.square] : 0;
        const lastSquare = options.square ? SQUARES[options.square] : 127;

        for (let i = firstSquare; i <= lastSquare; i++) {
            if (i & 0x88) { i += 7; continue; }
            const piece = this._board[i];
            if (!piece || piece.color !== us) continue;

            if (piece.type === PAWN) {
                const conf = PAWN_OFFSETS[us];
                // single push
                const to1 = i + conf.move;
                if (!(to1 & 0x88) && this._board[to1] == null) {
                    if (rank(to1) === conf.promoRank) {
                        [QUEEN, ROOK, BISHOP, KNIGHT].forEach(p => {
                            moves.push(this._buildMove(piece, i, to1, FLAGS.PROMOTION, null, p));
                        });
                    } else {
                        moves.push(this._buildMove(piece, i, to1, FLAGS.NORMAL));
                        // double push
                        if (rank(i) === conf.startRank) {
                            const to2 = i + conf.move * 2;
                            if (this._board[to2] == null) {
                                moves.push(this._buildMove(piece, i, to2, FLAGS.BIG_PAWN));
                            }
                        }
                    }
                }

                // captures
                for (let c = 0; c < conf.captures.length; c++) {
                    const toCap = i + conf.captures[c];
                    if (toCap & 0x88) continue;
                    const target = this._board[toCap];
                    if (target && target.color === them) {
                        if (rank(toCap) === conf.promoRank) {
                            [QUEEN, ROOK, BISHOP, KNIGHT].forEach(p => {
                                moves.push(this._buildMove(piece, i, toCap, FLAGS.PROMOTION | FLAGS.CAPTURE, target.type, p));
                            });
                        } else {
                            moves.push(this._buildMove(piece, i, toCap, FLAGS.CAPTURE, target.type));
                        }
                    } else if (toCap === this._epSquare) {
                        moves.push(this._buildMove(piece, i, toCap, FLAGS.EP_CAPTURE, PAWN));
                    }
                }
            } else if (piece.type === KING) {
                const offsets = PIECE_OFFSETS[KING];
                for (let o = 0; o < offsets.length; o++) {
                    const to = i + offsets[o];
                    if (to & 0x88) continue;
                    const target = this._board[to];
                    if (!target) {
                        moves.push(this._buildMove(piece, i, to, FLAGS.NORMAL));
                    } else if (target.color === them) {
                        moves.push(this._buildMove(piece, i, to, FLAGS.CAPTURE, target.type));
                    }
                }

                // Castling
                if (!this.inCheck()) {
                    // Kingside
                    if (this._castling[us] & BITS_KSIDE_CASTLE) {
                        const sq1 = i + 1;
                        const sq2 = i + 2;
                        if (this._board[sq1] == null && this._board[sq2] == null) {
                            if (!this._isAttacked(them, sq1) && !this._isAttacked(them, sq2)) {
                                moves.push(this._buildMove(piece, i, sq2, FLAGS.KSIDE_CASTLE));
                            }
                        }
                    }
                    // Queenside
                    if (this._castling[us] & BITS_QSIDE_CASTLE) {
                        const sq1 = i - 1;
                        const sq2 = i - 2;
                        const sq3 = i - 3;
                        if (this._board[sq1] == null && this._board[sq2] == null && this._board[sq3] == null) {
                            if (!this._isAttacked(them, sq1) && !this._isAttacked(them, sq2)) {
                                moves.push(this._buildMove(piece, i, sq2, FLAGS.QSIDE_CASTLE));
                            }
                        }
                    }
                }
            } else {
                // Knight, Bishop, Rook, Queen
                const offsets = PIECE_OFFSETS[piece.type];
                const isSingleStep = piece.type === KNIGHT;

                for (let o = 0; o < offsets.length; o++) {
                    let to = i;
                    while (true) {
                        to += offsets[o];
                        if (to & 0x88) break;
                        const target = this._board[to];
                        if (!target) {
                            moves.push(this._buildMove(piece, i, to, FLAGS.NORMAL));
                        } else {
                            if (target.color === them) {
                                moves.push(this._buildMove(piece, i, to, FLAGS.CAPTURE, target.type));
                            }
                            break;
                        }
                        if (isSingleStep) break;
                    }
                }
            }
        }

        if (!legalOnly) return moves;

        // Filter illegal moves that leave king in check
        const legalMoves = [];
        for (let m = 0; m < moves.length; m++) {
            this._makeMove(moves[m]);
            if (!this._isAttacked(them, this._kings[us])) {
                legalMoves.push(moves[m]);
            }
            this._undoMove();
        }

        return legalMoves;
    }

    _buildMove(piece, from, to, flags, captured = null, promotion = null) {
        return {
            color: piece.color,
            from: from,
            to: to,
            piece: piece.type,
            flags: flags,
            captured: captured,
            promotion: promotion,
            fromStr: algebraic(from),
            toStr: algebraic(to)
        };
    }

    _makeMove(move) {
        const us = this._turn;
        const them = us === WHITE ? BLACK : WHITE;

        this._history.push({
            move: move,
            kings: { [WHITE]: this._kings[WHITE], [BLACK]: this._kings[BLACK] },
            turn: this._turn,
            castling: { [WHITE]: this._castling[WHITE], [BLACK]: this._castling[BLACK] },
            epSquare: this._epSquare,
            halfMoves: this._halfMoves,
            moveNumber: this._moveNumber,
            position: this.fen().split(' ').slice(0, 4).join(' ')
        });

        this._board[move.to] = this._board[move.from];
        this._board[move.from] = null;

        if (move.flags & FLAGS.EP_CAPTURE) {
            const epCaptureSquare = us === WHITE ? move.to + 16 : move.to - 16;
            this._board[epCaptureSquare] = null;
        }

        if (move.promotion) {
            this._board[move.to] = { type: move.promotion, color: us };
        }

        if (this._board[move.to].type === KING) {
            this._kings[us] = move.to;

            if (move.flags & FLAGS.KSIDE_CASTLE) {
                const rookFrom = move.to + 1;
                const rookTo = move.to - 1;
                this._board[rookTo] = this._board[rookFrom];
                this._board[rookFrom] = null;
            } else if (move.flags & FLAGS.QSIDE_CASTLE) {
                const rookFrom = move.to - 2;
                const rookTo = move.to + 1;
                this._board[rookTo] = this._board[rookFrom];
                this._board[rookFrom] = null;
            }

            this._castling[us] = 0;
        }

        // Castling rights update if rooks move or get captured
        if (this._castling[us]) {
            if (move.from === SQUARES.a1 || move.from === SQUARES.a8) this._castling[us] &= ~BITS_QSIDE_CASTLE;
            if (move.from === SQUARES.h1 || move.from === SQUARES.h8) this._castling[us] &= ~BITS_KSIDE_CASTLE;
        }
        if (this._castling[them]) {
            if (move.to === SQUARES.a1 || move.to === SQUARES.a8) this._castling[them] &= ~BITS_QSIDE_CASTLE;
            if (move.to === SQUARES.h1 || move.to === SQUARES.h8) this._castling[them] &= ~BITS_KSIDE_CASTLE;
        }

        if (move.flags & FLAGS.BIG_PAWN) {
            this._epSquare = us === WHITE ? move.to + 16 : move.to - 16;
        } else {
            this._epSquare = null;
        }

        if (move.piece === PAWN || (move.flags & FLAGS.CAPTURE)) {
            this._halfMoves = 0;
        } else {
            this._halfMoves++;
        }

        if (us === BLACK) {
            this._moveNumber++;
        }

        this._turn = them;
    }

    _undoMove() {
        const old = this._history.pop();
        if (!old) return null;

        const move = old.move;
        this._kings = old.kings;
        this._turn = old.turn;
        this._castling = old.castling;
        this._epSquare = old.epSquare;
        this._halfMoves = old.halfMoves;
        this._moveNumber = old.moveNumber;

        const us = this._turn;

        this._board[move.from] = { type: move.piece, color: us };
        this._board[move.to] = null;

        if (move.flags & FLAGS.CAPTURE) {
            this._board[move.to] = { type: move.captured, color: us === WHITE ? BLACK : WHITE };
        } else if (move.flags & FLAGS.EP_CAPTURE) {
            const epSquare = us === WHITE ? move.to + 16 : move.to - 16;
            this._board[epSquare] = { type: PAWN, color: us === WHITE ? BLACK : WHITE };
        }

        if (move.flags & FLAGS.KSIDE_CASTLE) {
            const rookFrom = move.to + 1;
            const rookTo = move.to - 1;
            this._board[rookFrom] = this._board[rookTo];
            this._board[rookTo] = null;
        } else if (move.flags & FLAGS.QSIDE_CASTLE) {
            const rookFrom = move.to - 2;
            const rookTo = move.to + 1;
            this._board[rookFrom] = this._board[rookTo];
            this._board[rookTo] = null;
        }

        return move;
    }

    undo() {
        const move = this._undoMove();
        if (!move) return null;
        return {
            color: move.color,
            from: move.fromStr,
            to: move.toStr,
            piece: move.piece,
            captured: move.captured,
            promotion: move.promotion,
            san: move.san || ''
        };
    }

    moves(options = { verbose: false }) {
        const legal = this._generateMoves(options);
        if (options.verbose) {
            return legal.map(m => this._formatMove(m));
        }
        return legal.map(m => this._moveToSAN(m));
    }

    _formatMove(move) {
        return {
            color: move.color,
            from: move.fromStr,
            to: move.toStr,
            piece: move.piece,
            captured: move.captured || undefined,
            promotion: move.promotion || undefined,
            flags: this._flagsToString(move.flags),
            san: this._moveToSAN(move)
        };
    }

    _flagsToString(flags) {
        let res = '';
        if (flags & FLAGS.CAPTURE) res += 'c';
        if (flags & FLAGS.BIG_PAWN) res += 'b';
        if (flags & FLAGS.EP_CAPTURE) res += 'e';
        if (flags & FLAGS.PROMOTION) res += 'p';
        if (flags & FLAGS.KSIDE_CASTLE) res += 'k';
        if (flags & FLAGS.QSIDE_CASTLE) res += 'q';
        if (!res) res = 'n';
        return res;
    }

    _moveToSAN(move) {
        if (move.flags & FLAGS.KSIDE_CASTLE) return 'O-O';
        if (move.flags & FLAGS.QSIDE_CASTLE) return 'O-O-O';

        let san = '';
        if (move.piece !== PAWN) {
            san += move.piece.toUpperCase();
            // Disambiguation if needed
            const disambiguator = this._getDisambiguator(move);
            san += disambiguator;
        } else if (move.flags & FLAGS.CAPTURE || move.flags & FLAGS.EP_CAPTURE) {
            san += move.fromStr[0];
        }

        if (move.flags & FLAGS.CAPTURE || move.flags & FLAGS.EP_CAPTURE) {
            san += 'x';
        }

        san += move.toStr;

        if (move.promotion) {
            san += '=' + move.promotion.toUpperCase();
        }

        // Check if move gives check or checkmate
        this._makeMove(move);
        if (this.isCheckmate()) {
            san += '#';
        } else if (this.inCheck()) {
            san += '+';
        }
        this._undoMove();

        move.san = san;
        return san;
    }

    _getDisambiguator(move) {
        const moves = this._generateMoves({ legal: true });
        const from = move.from;
        const to = move.to;
        const piece = move.piece;

        let ambiguities = 0;
        let sameFile = 0;
        let sameRank = 0;

        for (let i = 0; i < moves.length; i++) {
            const m = moves[i];
            if (m.piece === piece && m.from !== from && m.to === to) {
                ambiguities++;
                if (file(m.from) === file(from)) sameFile++;
                if (rank(m.from) === rank(from)) sameRank++;
            }
        }

        if (ambiguities === 0) return '';
        if (sameFile === 0) return algebraic(from)[0];
        if (sameRank === 0) return algebraic(from)[1];
        return algebraic(from);
    }

    move(moveInput) {
        let fromStr = null;
        let toStr = null;
        let promo = 'q';

        if (typeof moveInput === 'string') {
            // SAN move input
            const legal = this._generateMoves({ legal: true });
            for (let i = 0; i < legal.length; i++) {
                if (this._moveToSAN(legal[i]) === moveInput) {
                    const m = legal[i];
                    this._makeMove(m);
                    return this._formatMove(m);
                }
            }
            return null;
        } else if (typeof moveInput === 'object') {
            fromStr = moveInput.from;
            toStr = moveInput.to;
            promo = (moveInput.promotion || 'q').toLowerCase();
        }

        if (!fromStr || !toStr) return null;

        const from = SQUARES[fromStr];
        const to = SQUARES[toStr];
        if (from === undefined || to === undefined) return null;

        const legal = this._generateMoves({ square: fromStr, legal: true });
        for (let i = 0; i < legal.length; i++) {
            const m = legal[i];
            if (m.to === to && (!m.promotion || m.promotion === promo)) {
                const formatted = this._formatMove(m);
                this._makeMove(m);
                return formatted;
            }
        }

        return null;
    }

    history(options = { verbose: false }) {
        if (!options.verbose) {
            return this._history.map(h => h.move.san || this._moveToSAN(h.move));
        }
        return this._history.map(h => this._formatMove(h.move));
    }

    pgn() {
        const moves = this.history();
        let pgn = '';
        for (let i = 0; i < moves.length; i++) {
            if (i % 2 === 0) {
                pgn += (i / 2 + 1) + '. ';
            }
            pgn += moves[i] + ' ';
        }
        return pgn.trim();
    }
}
