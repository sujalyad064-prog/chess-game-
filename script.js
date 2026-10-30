/**
 * Grandmaster Chess Arena Pro - Main Application Controller
 * High-performance chess orchestration: Multi-level AI, SVG graphics, Clocks,
 * Puzzles, Openings, Analysis & Web Audio sound effects.
 */

import { Chess } from "./chess.js";
import { getPieceSvg } from "./pieces.js";
import { sounds } from "./sounds.js";
import { identifyOpening } from "./openings.js";
import { PUZZLES, getPuzzlesByLevel } from "./puzzles.js";
import { getBestMove, getTacticalHint, evaluateBoard } from "./ai.js";

// DOM ELEMENTS
const boardElement = document.getElementById("chessboard");
const moveListElement = document.getElementById("move-list");
const gameStatus = document.getElementById("game-status");
const statusDescription = document.getElementById("status-description");
const statusIndicator = document.getElementById("status-indicator");
const whiteStatus = document.getElementById("white-status");
const blackStatus = document.getElementById("black-status");
const openingBadge = document.getElementById("opening-badge");
const sidebarOpeningName = document.getElementById("sidebar-opening-name");
const sidebarEco = document.getElementById("sidebar-eco");
const openingDesc = document.getElementById("opening-desc");
const evalBarFill = document.getElementById("eval-bar-fill");
const evalScoreText = document.getElementById("eval-score-text");
const boardArrows = document.getElementById("board-arrows");
const hintContent = document.getElementById("hint-content");
const promotionModal = document.getElementById("promotion-modal");
const promotionChoices = document.getElementById("promotion-choices");
const gameOverOverlay = document.getElementById("game-over-overlay");
const gameOverTitle = document.getElementById("game-over-title");
const gameOverSubtitle = document.getElementById("game-over-subtitle");
const topCaptured = document.getElementById("top-captured");
const bottomCaptured = document.getElementById("bottom-captured");
const topMaterial = document.getElementById("top-material");
const bottomMaterial = document.getElementById("bottom-material");
const topClock = document.getElementById("top-clock");
const bottomClock = document.getElementById("bottom-clock");
const topPlayerName = document.getElementById("top-player-name");
const topPlayerElo = document.getElementById("top-player-elo");
const bottomPlayerName = document.getElementById("bottom-player-name");
const bottomPlayerElo = document.getElementById("bottom-player-elo");
const modeBadge = document.getElementById("mode-badge");
const fenInput = document.getElementById("fen-input");
const pgnTextarea = document.getElementById("pgn-textarea");
const soundToggleBtn = document.getElementById("sound-toggle-btn");
const soundIcon = document.getElementById("sound-icon");
const themeSelector = document.getElementById("theme-selector");

// APPLICATION STATE
let game = new Chess();
let currentMode = "ai"; // "ai", "pass", "puzzle", "analysis"
let aiLevel = 3; // 1: Novice, 2: Intermediate, 3: Advanced, 4: Grandmaster
let humanColor = "w"; // "w", "b", or "random"
let actualHumanColor = "w";
let flipped = false;
let selectedSquare = null;
let legalMoves = [];
let pendingPromotion = null;
let isReviewingHistory = false;
let historyIndex = -1;

// CLOCK TIMERS
let timeControlSeconds = 600; // 10 min default
let whiteTime = 600;
let blackTime = 600;
let timerInterval = null;

// PUZZLE STATE
let currentPuzzles = PUZZLES;
let currentPuzzleIndex = 0;
let solvedCount = 0;
let puzzleActive = false;

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

// INITIALIZE APPLICATION
function initApp() {
    setupEventListeners();
    setupThemeAndSound();
    startNewGame();
}

// SETUP THEMES & AUDIO DEFAULTS
function setupThemeAndSound() {
    const savedTheme = localStorage.getItem("gm_chess_theme") || "theme-wood";
    document.body.className = `intro-active ${savedTheme}`;
    themeSelector.value = savedTheme;

    if (sounds.isMuted()) {
        soundIcon.textContent = "🔇";
    }

    // Skip Intro Button
    const skipBtn = document.getElementById("skip-intro-btn");
    const fireIntro = document.getElementById("fire-intro");
    if (skipBtn && fireIntro) {
        skipBtn.addEventListener("click", () => {
            fireIntro.classList.add("skipped");
            document.body.classList.remove("intro-active");
        });
    }

    // Auto-remove intro class after animation finishes
    setTimeout(() => {
        document.body.classList.remove("intro-active");
    }, 2800);
}

// START NEW GAME
function startNewGame() {
    clearInterval(timerInterval);
    game.reset();
    selectedSquare = null;
    legalMoves = [];
    isReviewingHistory = false;
    historyIndex = -1;
    clearArrows();
    hideGameOver();

    // Color assignment
    if (currentMode === "ai") {
        if (humanColor === "random") {
            actualHumanColor = Math.random() < 0.5 ? "w" : "b";
        } else {
            actualHumanColor = humanColor;
        }
        flipped = (actualHumanColor === "b");
    } else {
        actualHumanColor = "w";
        flipped = false;
    }

    // Reset Clocks
    whiteTime = timeControlSeconds;
    blackTime = timeControlSeconds;
    updateClockDisplays();

    if (timeControlSeconds > 0 && currentMode !== "puzzle") {
        startClocks();
    }

    updatePlayerHeaders();
    drawBoard();
    updateUI();

    // If human is Black in vs-AI, computer makes first move
    if (currentMode === "ai" && actualHumanColor === "b" && game.turn() === "w") {
        triggerAiMove();
    }
}

// UPDATE HEADER INFO
function updatePlayerHeaders() {
    const eloLabels = { 1: "800 ELO", 2: "1400 ELO", 3: "1900 ELO", 4: "2400+ ELO" };
    const nameLabels = { 1: "Novice AI", 2: "Club Player AI", 3: "Tactician AI", 4: "Grandmaster AI" };

    if (currentMode === "ai") {
        if (actualHumanColor === "w") {
            topPlayerName.textContent = nameLabels[aiLevel];
            topPlayerElo.textContent = eloLabels[aiLevel];
            bottomPlayerName.textContent = "You";
            bottomPlayerElo.textContent = "HUMAN";
        } else {
            topPlayerName.textContent = "You";
            topPlayerElo.textContent = "HUMAN";
            bottomPlayerName.textContent = nameLabels[aiLevel];
            bottomPlayerElo.textContent = eloLabels[aiLevel];
        }
        modeBadge.textContent = `🤖 VS COMPUTER (${nameLabels[aiLevel].toUpperCase()})`;
    } else if (currentMode === "pass") {
        topPlayerName.textContent = "Player 2 (Black)";
        topPlayerElo.textContent = "LOCAL";
        bottomPlayerName.textContent = "Player 1 (White)";
        bottomPlayerElo.textContent = "LOCAL";
        modeBadge.textContent = "👥 PASS & PLAY (2 PLAYERS)";
    } else if (currentMode === "puzzle") {
        modeBadge.textContent = "🧩 TACTICS PUZZLE TRAINER";
    } else {
        modeBadge.textContent = "🔍 ANALYSIS BOARD & SANDBOX";
    }
}

// CLOCK MANAGEMENT
function startClocks() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (game.isGameOver()) {
            clearInterval(timerInterval);
            return;
        }

        if (game.turn() === "w") {
            if (whiteTime > 0) whiteTime--;
            if (whiteTime <= 0) handleTimeOut("w");
        } else {
            if (blackTime > 0) blackTime--;
            if (blackTime <= 0) handleTimeOut("b");
        }

        if ((game.turn() === "w" && whiteTime === 10) || (game.turn() === "b" && blackTime === 10)) {
            sounds.playTick();
        }

        updateClockDisplays();
    }, 1000);
}

function handleTimeOut(flaggedColor) {
    clearInterval(timerInterval);
    const winner = flaggedColor === "w" ? "Black" : "White";
    sounds.playGameOver(winner.toLowerCase()[0] === actualHumanColor);
    showGameOver("FLAG FALL / TIME OUT", `${winner} won on time!`);
}

function formatTime(seconds) {
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function updateClockDisplays() {
    if (timeControlSeconds === 0) {
        topClock.textContent = "∞:--";
        bottomClock.textContent = "∞:--";
        topClock.classList.remove("low-time");
        bottomClock.classList.remove("low-time");
        return;
    }

    const tTime = flipped ? whiteTime : blackTime;
    const bTime = flipped ? blackTime : whiteTime;

    topClock.textContent = formatTime(tTime);
    bottomClock.textContent = formatTime(bTime);

    topClock.classList.toggle("low-time", tTime <= 30);
    bottomClock.classList.toggle("low-time", bTime <= 30);
}

// DRAW BOARD SQUARES & SVG PIECES
function drawBoard() {
    boardElement.innerHTML = "";

    const board = game.board();
    const history = game.history({ verbose: true });
    const lastMove = history.length ? history[history.length - 1] : null;

    const rows = flipped ? [...Array(8).keys()] : [...Array(8).keys()].reverse();
    const cols = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

    rows.forEach(row => {
        cols.forEach(col => {
            const squareName = files[col] + (8 - row);
            const square = document.createElement("div");
            square.className = "square";
            square.dataset.square = squareName;

            const isLight = (row + col) % 2 === 0;
            square.classList.add(isLight ? "light" : "dark");

            // Last move highlight
            if (lastMove && (squareName === lastMove.from || squareName === lastMove.to)) {
                square.classList.add("last-move");
            }

            // Selected square highlight
            if (selectedSquare === squareName) {
                square.classList.add("selected");
            }

            // Legal moves highlight (Dot or Capture Ring)
            if (legalMoves.some(m => m.to === squareName)) {
                const targetPiece = game.get(squareName);
                if (targetPiece || legalMoves.some(m => m.to === squareName && m.flags.includes("e"))) {
                    square.classList.add("capture");
                } else {
                    square.classList.add("legal");
                }
            }

            // Piece rendering
            const piece = board[row][col];
            if (piece) {
                const pieceWrap = document.createElement("div");
                pieceWrap.className = `piece ${piece.color === "w" ? "white" : "black"}`;
                pieceWrap.innerHTML = getPieceSvg(piece.color, piece.type);
                pieceWrap.draggable = !isReviewingHistory;

                // Drag & Drop
                pieceWrap.addEventListener("dragstart", e => {
                    if (isReviewingHistory) { e.preventDefault(); return; }
                    if (currentMode === "ai" && game.turn() !== actualHumanColor) { e.preventDefault(); return; }
                    e.dataTransfer.setData("text/plain", squareName);
                    handleSquareSelect(squareName);
                });

                square.appendChild(pieceWrap);
            }

            // King Check highlight
            if (piece && piece.type === "k" && piece.color === game.turn() && game.inCheck()) {
                square.classList.add("in-check");
            }

            // Click handling
            square.addEventListener("click", () => {
                if (isReviewingHistory) return;
                handleSquareClick(squareName);
            });

            // Dragover & Drop
            square.addEventListener("dragover", e => e.preventDefault());
            square.addEventListener("drop", e => {
                e.preventDefault();
                const from = e.dataTransfer.getData("text/plain");
                if (from && from !== squareName) {
                    attemptMove(from, squareName);
                }
            });

            boardElement.appendChild(square);
        });
    });

    updateCoordinates();
}

// UPDATE COORDINATES (1-8 & A-H)
function updateCoordinates() {
    const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    const fileOrder = flipped ? [...files].reverse() : files;

    document.getElementById("rank-labels").innerHTML = ranks.map(r => `<span>${r}</span>`).join("");
    document.getElementById("file-labels").innerHTML = fileOrder.map(f => `<span>${f}</span>`).join("");
}

// HANDLE USER SQUARE CLICK
function handleSquareClick(square) {
    if (game.isGameOver()) return;

    // In AI mode, ignore clicks when it's AI's turn
    if (currentMode === "ai" && game.turn() !== actualHumanColor) return;

    // In Puzzle mode, ensure it's player's turn in puzzle
    if (currentMode === "puzzle" && !puzzleActive) return;

    const piece = game.get(square);

    if (selectedSquare) {
        if (selectedSquare === square) {
            // Deselect
            selectedSquare = null;
            legalMoves = [];
            drawBoard();
            return;
        }

        const isLegal = legalMoves.some(m => m.to === square);
        if (isLegal) {
            attemptMove(selectedSquare, square);
            return;
        }
    }

    // Select piece
    if (piece && piece.color === game.turn()) {
        handleSquareSelect(square);
    } else {
        selectedSquare = null;
        legalMoves = [];
        drawBoard();
    }
}

function handleSquareSelect(square) {
    selectedSquare = square;
    legalMoves = game.moves({ square: square, verbose: true });
    drawBoard();
}

// ATTEMPT MOVE & HANDLE PAWN PROMOTION
function attemptMove(from, to) {
    const piece = game.get(from);
    if (!piece) return;

    // Check if move is pawn promotion
    const isPromotion = piece.type === "p" && (to.endsWith("8") || to.endsWith("1"));
    const isLegal = legalMoves.some(m => m.to === to);

    if (!isLegal) {
        selectedSquare = null;
        legalMoves = [];
        drawBoard();
        return;
    }

    if (isPromotion) {
        pendingPromotion = { from, to };
        showPromotionModal(piece.color);
        return;
    }

    executeMove({ from, to });
}

// EXECUTE MOVE
function executeMove(moveObj) {
    const isCapture = !!game.get(moveObj.to) || (game.get(moveObj.from) && game.get(moveObj.from).type === "p" && moveObj.from[0] !== moveObj.to[0]);
    const move = game.move(moveObj);

    if (!move) {
        selectedSquare = null;
        legalMoves = [];
        drawBoard();
        return;
    }

    // Clear hints & selections
    clearArrows();
    selectedSquare = null;
    legalMoves = [];

    // Play appropriate sound
    if (move.flags && (move.flags.includes("k") || move.flags.includes("q"))) {
        sounds.playCastle();
    } else if (move.promotion) {
        sounds.playPromote();
    } else if (isCapture || (move.flags && move.flags.includes("e"))) {
        sounds.playCapture();
    } else if (game.inCheck()) {
        sounds.playCheck();
    } else {
        sounds.playMove();
    }

    // Draw updated board
    drawBoard();
    updateUI();

    // Check Puzzle verification
    if (currentMode === "puzzle") {
        checkPuzzleMove(move);
        return;
    }

    // Check Game Over
    if (game.isGameOver()) {
        handleGameOverState();
        return;
    }

    // AI Turn trigger
    if (currentMode === "ai" && game.turn() !== actualHumanColor) {
        triggerAiMove();
    }
}

// AI MOVE TRIGGER WITH DELAY
function triggerAiMove() {
    blackStatus.textContent = "THINKING...";
    whiteStatus.textContent = "WAITING";

    // Thinking delay based on AI level
    const delay = aiLevel === 1 ? 250 : aiLevel === 2 ? 450 : 650;

    setTimeout(() => {
        if (game.isGameOver()) return;

        const bestMove = getBestMove(game, aiLevel);
        if (bestMove) {
            executeMove(bestMove);
        }
    }, delay);
}

// PROMOTION MODAL
function showPromotionModal(color) {
    promotionChoices.innerHTML = "";
    const promoTypes = ["q", "n", "r", "b"];

    promoTypes.forEach(type => {
        const btn = document.createElement("button");
        btn.className = "promo-btn";
        btn.innerHTML = getPieceSvg(color, type);
        btn.addEventListener("click", () => {
            promotionModal.classList.add("hidden");
            if (pendingPromotion) {
                executeMove({ ...pendingPromotion, promotion: type });
                pendingPromotion = null;
            }
        });
        promotionChoices.appendChild(btn);
    });

    promotionModal.classList.remove("hidden");
}

// GAME OVER HANDLING
function handleGameOverState() {
    clearInterval(timerInterval);

    if (game.isCheckmate()) {
        const winner = game.turn() === "w" ? "Black" : "White";
        const won = (winner === "White" && actualHumanColor === "w") || (winner === "Black" && actualHumanColor === "b");
        sounds.playGameOver(won);
        showGameOver("CHECKMATE!", `${winner} conquered the arena!`);
    } else if (game.isStalemate()) {
        sounds.playGameOver(false);
        showGameOver("STALEMATE", "The game ends in a strategic draw.");
    } else if (game.isThreefoldRepetition()) {
        sounds.playGameOver(false);
        showGameOver("DRAW", "Draw by threefold repetition.");
    } else if (game.isInsufficientMaterial()) {
        sounds.playGameOver(false);
        showGameOver("DRAW", "Draw by insufficient mating material.");
    } else if (game.isDraw()) {
        sounds.playGameOver(false);
        showGameOver("DRAW", "Match ended in a draw.");
    }
}

function showGameOver(title, subtitle) {
    gameOverTitle.textContent = title;
    gameOverSubtitle.textContent = subtitle;
    gameOverOverlay.classList.remove("hidden");
}

function hideGameOver() {
    gameOverOverlay.classList.add("hidden");
}

// UPDATE ENTIRE UI (STATUS, NOTATION, EVAL, CAPTURED PIECES, OPENINGS)
function updateUI() {
    updateGameStatus();
    updateMoveHistory();
    updateEvaluationBar();
    updateCapturedPieces();
    updateOpeningName();
    updateFenAndPgn();
}

// STATUS CARDS & PLAYER TURN STATUS
function updateGameStatus() {
    const turn = game.turn();
    const isWhite = turn === "w";

    whiteStatus.textContent = isWhite ? "YOUR TURN" : "WAITING";
    blackStatus.textContent = !isWhite ? (currentMode === "ai" ? "THINKING..." : "YOUR TURN") : "WAITING";

    whiteStatus.classList.toggle("active", isWhite);
    blackStatus.classList.toggle("active", !isWhite);

    if (game.isCheckmate()) {
        const winner = isWhite ? "Black" : "White";
        gameStatus.textContent = "CHECKMATE!";
        statusDescription.textContent = `${winner} Wins!`;
        statusIndicator.style.background = "var(--accent-red)";
    } else if (game.inCheck()) {
        gameStatus.textContent = "CHECK!";
        statusDescription.textContent = `${isWhite ? "White" : "Black"} King is under siege!`;
        statusIndicator.style.background = "var(--accent-red)";
    } else if (game.isDraw()) {
        gameStatus.textContent = "DRAW";
        statusDescription.textContent = "Game ended peacefully";
        statusIndicator.style.background = "var(--text-muted)";
    } else {
        gameStatus.textContent = `${isWhite ? "White" : "Black"}'s Turn`;
        statusDescription.textContent = "Make your move";
        statusIndicator.style.background = "var(--accent-green)";
    }
}

// REAL-TIME ADVANTAGE EVALUATION BAR
function updateEvaluationBar() {
    const centipawns = evaluateBoard(game);
    // Convert centipawns to win percentage (logistic sigmoid)
    // 0 = 50%, +400 = ~80%, -400 = ~20%
    const winPercentage = 50 + 50 * (2 / (1 + Math.exp(-0.0035 * centipawns)) - 1);
    const clampedWin = Math.max(5, Math.min(95, winPercentage));

    evalBarFill.style.height = `${clampedWin}%`;

    const scoreFormatted = (centipawns / 100).toFixed(1);
    const displayText = centipawns > 0 ? `+${scoreFormatted}` : `${scoreFormatted}`;
    evalScoreText.textContent = Math.abs(centipawns) > 9000 ? (centipawns > 0 ? "M" : "-M") : displayText;
}

// CAPTURED PIECES & MATERIAL DIFFERENCE
function updateCapturedPieces() {
    const fullSet = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const currentWhite = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const currentBlack = { p: 0, n: 0, b: 0, r: 0, q: 0 };

    game.board().forEach(row => {
        row.forEach(piece => {
            if (piece) {
                if (piece.color === "w") currentWhite[piece.type]++;
                else currentBlack[piece.type]++;
            }
        });
    });

    const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    let whiteLostHtml = "";
    let blackLostHtml = "";
    let whiteMaterial = 0;
    let blackMaterial = 0;

    Object.keys(fullSet).forEach(type => {
        // White lost (captured by Black)
        const whiteLostCount = fullSet[type] - currentWhite[type];
        for (let i = 0; i < whiteLostCount; i++) {
            whiteLostHtml += getPieceSvg("w", type);
            blackMaterial += values[type];
        }

        // Black lost (captured by White)
        const blackLostCount = fullSet[type] - currentBlack[type];
        for (let i = 0; i < blackLostCount; i++) {
            blackLostHtml += getPieceSvg("b", type);
            whiteMaterial += values[type];
        }
    });

    // Render trays based on flipped state
    if (flipped) {
        topCaptured.innerHTML = blackLostHtml;
        bottomCaptured.innerHTML = whiteLostHtml;
        topMaterial.textContent = blackMaterial > whiteMaterial ? `+${blackMaterial - whiteMaterial}` : "";
        bottomMaterial.textContent = whiteMaterial > blackMaterial ? `+${whiteMaterial - blackMaterial}` : "";
    } else {
        topCaptured.innerHTML = whiteLostHtml;
        bottomCaptured.innerHTML = blackLostHtml;
        topMaterial.textContent = whiteMaterial > blackMaterial ? `+${whiteMaterial - blackMaterial}` : "";
        bottomMaterial.textContent = blackMaterial > whiteMaterial ? `+${blackMaterial - whiteMaterial}` : "";
    }
}

// OPENING NAME IDENTIFICATION
function updateOpeningName() {
    const history = game.history();
    const opening = identifyOpening(history);

    openingBadge.textContent = `${opening.eco} ${opening.name}`;
    sidebarEco.textContent = opening.eco;
    sidebarOpeningName.textContent = opening.name;

    if (history.length <= 4) {
        openingDesc.textContent = "Opening phase: Developing minor pieces and claiming the center.";
    } else {
        openingDesc.textContent = `Theory recognized: ${opening.name}.`;
    }
}

// MOVE HISTORY LIST WITH CLICKABLE PAST MOVES
function updateMoveHistory() {
    const history = game.history();
    moveListElement.innerHTML = "";

    if (history.length === 0) {
        moveListElement.innerHTML = `<p class="empty-moves">No moves made yet...</p>`;
        return;
    }

    for (let i = 0; i < history.length; i += 2) {
        const row = document.createElement("div");
        row.className = "move-row";

        const num = document.createElement("span");
        num.className = "move-number";
        num.textContent = `${i / 2 + 1}.`;

        const whiteMove = document.createElement("span");
        whiteMove.className = `move-cell ${historyIndex === i ? "active-history" : ""}`;
        whiteMove.textContent = history[i];
        whiteMove.addEventListener("click", () => reviewHistoryAt(i));

        const blackMove = document.createElement("span");
        blackMove.className = `move-cell ${historyIndex === i + 1 ? "active-history" : ""}`;
        blackMove.textContent = history[i + 1] || "";
        if (history[i + 1]) {
            blackMove.addEventListener("click", () => reviewHistoryAt(i + 1));
        }

        row.append(num, whiteMove, blackMove);
        moveListElement.appendChild(row);
    }

    if (!isReviewingHistory) {
        moveListElement.scrollTop = moveListElement.scrollHeight;
    }
}

// HISTORY REVIEW STEPPING
function reviewHistoryAt(targetIndex) {
    const fullHistory = game.history();
    if (targetIndex < 0 || targetIndex >= fullHistory.length) return;

    isReviewingHistory = true;
    historyIndex = targetIndex;

    const replayGame = new Chess();
    for (let i = 0; i <= targetIndex; i++) {
        replayGame.move(fullHistory[i]);
    }

    // Render snapshot
    drawBoardSnapshot(replayGame);
    updateMoveHistory();
}

function drawBoardSnapshot(snapshotGame) {
    boardElement.innerHTML = "";
    const board = snapshotGame.board();
    const rows = flipped ? [...Array(8).keys()] : [...Array(8).keys()].reverse();
    const cols = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

    rows.forEach(row => {
        cols.forEach(col => {
            const squareName = files[col] + (8 - row);
            const square = document.createElement("div");
            square.className = "square";
            square.classList.add((row + col) % 2 === 0 ? "light" : "dark");

            const piece = board[row][col];
            if (piece) {
                const pieceWrap = document.createElement("div");
                pieceWrap.className = "piece";
                pieceWrap.innerHTML = getPieceSvg(piece.color, piece.type);
                square.appendChild(pieceWrap);
            }
            boardElement.appendChild(square);
        });
    });
}

function returnToLiveGame() {
    isReviewingHistory = false;
    historyIndex = -1;
    drawBoard();
    updateMoveHistory();
}

// FEN & PGN TOOL UPDATES
function updateFenAndPgn() {
    fenInput.value = game.fen();
    pgnTextarea.value = game.pgn() || "1. ...";
}

// TACTICAL HINT & ARROWS
function triggerHint() {
    if (game.isGameOver()) return;

    const hint = getTacticalHint(game);
    if (!hint) return;

    hintContent.innerHTML = `
        <div class="hint-active-box">
            <span class="hint-move-tag">${hint.san}</span>
            <p class="hint-reason">${hint.explanation}</p>
        </div>
    `;

    drawArrowOnBoard(hint.from, hint.to);
}

// DRAW ARROW ON SVG CANVAS
function drawArrowOnBoard(from, to) {
    clearArrows();

    const fromCol = files.indexOf(from[0]);
    const fromRow = 8 - parseInt(from[1], 10);
    const toCol = files.indexOf(to[0]);
    const toRow = 8 - parseInt(to[1], 10);

    const actualFromCol = flipped ? 7 - fromCol : fromCol;
    const actualFromRow = flipped ? 7 - fromRow : fromRow;
    const actualToCol = flipped ? 7 - toCol : toCol;
    const actualToRow = flipped ? 7 - toRow : toRow;

    const x1 = (actualFromCol + 0.5) * 12.5;
    const y1 = (actualFromRow + 0.5) * 12.5;
    const x2 = (actualToCol + 0.5) * 12.5;
    const y2 = (actualToRow + 0.5) * 12.5;

    boardArrows.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
            </marker>
        </defs>
        <line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round" marker-end="url(#arrowhead)" opacity="0.85"/>
    `;
}

function clearArrows() {
    boardArrows.innerHTML = "";
}

// PUZZLE MODE IMPLEMENTATION
function loadPuzzle(index) {
    if (index < 0 || index >= currentPuzzles.length) index = 0;
    currentPuzzleIndex = index;
    const p = currentPuzzles[index];

    puzzleActive = true;
    game.load(p.fen);
    actualHumanColor = p.turn;
    flipped = (p.turn === "b");

    document.getElementById("puzzle-title").textContent = p.title;
    document.getElementById("puzzle-theme").textContent = p.theme;
    document.getElementById("puzzle-rating").textContent = `${p.rating} ELO`;
    document.getElementById("puzzle-prompt").textContent = p.prompt;
    document.getElementById("puzzle-feedback").textContent = "";
    document.getElementById("puzzle-feedback").className = "puzzle-feedback";

    drawBoard();
    updateUI();
}

function checkPuzzleMove(move) {
    const p = currentPuzzles[currentPuzzleIndex];
    const expected = p.moves[0];

    const isMatch = (expected.from === move.from && expected.to === move.to);

    const feedback = document.getElementById("puzzle-feedback");
    if (isMatch) {
        feedback.textContent = "★ EXCELLENT! Puzzle Solved!";
        feedback.className = "puzzle-feedback success";
        sounds.playGameOver(true);
        solvedCount++;
        document.getElementById("puzzle-score").textContent = `Solved: ${solvedCount}`;
        puzzleActive = false;
    } else {
        feedback.textContent = "Not quite! Try another move.";
        feedback.className = "puzzle-feedback wrong";
        setTimeout(() => {
            game.undo();
            drawBoard();
            updateUI();
        }, 800);
    }
}

// ATTACH EVENT LISTENERS
function setupEventListeners() {
    // Mode Switcher
    document.querySelectorAll(".mode-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll(".mode-pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentMode = pill.dataset.mode;

            if (currentMode === "puzzle") {
                // Switch sidebar to Puzzles tab automatically
                switchSidebarTab("puzzles-tab");
                loadPuzzle(0);
            } else {
                startNewGame();
            }
        });
    });

    // Theme Selector
    themeSelector.addEventListener("change", e => {
        const theme = e.target.value;
        document.body.className = `intro-active ${theme}`;
        localStorage.setItem("gm_chess_theme", theme);
    });

    // Sound Toggle
    soundToggleBtn.addEventListener("click", () => {
        const muted = sounds.toggleMute();
        soundIcon.textContent = muted ? "🔇" : "🔊";
    });

    // Fullscreen Toggle
    document.getElementById("fullscreen-btn").addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    // Quick Action Buttons
    document.getElementById("new-game-btn").addEventListener("click", () => {
        if (confirm("Start a new game?")) startNewGame();
    });

    document.getElementById("undo-btn").addEventListener("click", () => {
        if (isReviewingHistory) {
            returnToLiveGame();
            return;
        }

        if (currentMode === "ai") {
            // Undo 2 half-moves (AI move + User move)
            game.undo();
            game.undo();
        } else {
            game.undo();
        }

        selectedSquare = null;
        legalMoves = [];
        clearArrows();
        drawBoard();
        updateUI();
    });

    document.getElementById("hint-btn").addEventListener("click", triggerHint);

    document.getElementById("flip-btn").addEventListener("click", () => {
        flipped = !flipped;
        drawBoard();
        updateCapturedPieces();
    });

    document.getElementById("resign-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to resign?")) {
            sounds.playGameOver(false);
            showGameOver("RESIGNATION", "You resigned the match.");
        }
    });

    // Sidebar Tab Navigation
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            switchSidebarTab(btn.dataset.tab);
        });
    });

    // Move History Controls
    document.getElementById("nav-start").addEventListener("click", () => reviewHistoryAt(0));
    document.getElementById("nav-prev").addEventListener("click", () => {
        const target = isReviewingHistory ? historyIndex - 1 : game.history().length - 2;
        reviewHistoryAt(Math.max(0, target));
    });
    document.getElementById("nav-next").addEventListener("click", () => {
        if (isReviewingHistory) {
            if (historyIndex >= game.history().length - 1) returnToLiveGame();
            else reviewHistoryAt(historyIndex + 1);
        }
    });
    document.getElementById("nav-end").addEventListener("click", returnToLiveGame);

    // AI Difficulty Buttons
    document.querySelectorAll(".diff-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            aiLevel = parseInt(btn.dataset.level, 10);
            updatePlayerHeaders();
        });
    });

    // Color Selector Buttons
    document.querySelectorAll(".color-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            humanColor = btn.dataset.color;
        });
    });

    // Time Control Select
    document.getElementById("time-control-select").addEventListener("change", e => {
        timeControlSeconds = parseInt(e.target.value, 10);
    });

    document.getElementById("apply-settings-btn").addEventListener("click", () => {
        startNewGame();
        switchSidebarTab("status-tab");
    });

    // Puzzles Controls
    document.querySelectorAll(".p-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".p-filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentPuzzles = getPuzzlesByLevel(btn.dataset.pfilter);
            loadPuzzle(0);
        });
    });

    document.getElementById("puzzle-hint-btn").addEventListener("click", () => {
        const p = currentPuzzles[currentPuzzleIndex];
        document.getElementById("puzzle-feedback").textContent = `Hint: ${p.hint}`;
        document.getElementById("puzzle-feedback").className = "puzzle-feedback";
    });

    document.getElementById("puzzle-reset-btn").addEventListener("click", () => loadPuzzle(currentPuzzleIndex));
    document.getElementById("puzzle-next-btn").addEventListener("click", () => {
        loadPuzzle((currentPuzzleIndex + 1) % currentPuzzles.length);
    });

    // PGN / FEN Utility Buttons
    document.getElementById("copy-fen-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(fenInput.value);
        alert("FEN copied to clipboard!");
    });

    document.getElementById("load-fen-btn").addEventListener("click", () => {
        const fen = document.getElementById("load-fen-input").value.trim();
        if (fen) {
            const success = game.load(fen);
            if (success) {
                drawBoard();
                updateUI();
                alert("Position loaded successfully!");
            } else {
                alert("Invalid FEN string format.");
            }
        }
    });

    document.getElementById("copy-pgn-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(pgnTextarea.value);
        alert("PGN copied to clipboard!");
    });

    document.getElementById("download-pgn-btn").addEventListener("click", () => {
        const blob = new Blob([pgnTextarea.value], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chess_game_${Date.now()}.pgn`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Game Over Rematch and Review
    document.getElementById("modal-rematch-btn").addEventListener("click", () => {
        hideGameOver();
        startNewGame();
    });

    document.getElementById("modal-review-btn").addEventListener("click", () => {
        hideGameOver();
        currentMode = "analysis";
        document.querySelectorAll(".mode-pill").forEach(p => p.classList.remove("active"));
        document.querySelector(`.mode-pill[data-mode="analysis"]`).classList.add("active");
        updatePlayerHeaders();
    });

    // Keyboard Shortcuts
    window.addEventListener("keydown", e => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "f" || e.key === "F") {
            flipped = !flipped;
            drawBoard();
            updateCapturedPieces();
        } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
            document.getElementById("undo-btn").click();
        } else if (e.key === "h" || e.key === "H") {
            triggerHint();
        } else if (e.key === "ArrowLeft") {
            document.getElementById("nav-prev").click();
        } else if (e.key === "ArrowRight") {
            document.getElementById("nav-next").click();
        }
    });
}

function switchSidebarTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.tab === tabId);
    });
    document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.toggle("active", content.id === tabId);
    });
}

// START APP ON LOAD
initApp();
