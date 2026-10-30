# ♔ Grandmaster Chess Arena Pro (V2.0)

> **A professional, high-performance, tournament-grade Chess web application built from Basic to Grandmaster level.**

---

## 🌟 Key Features & Highlights

### 1. 🤖 Multi-Level AI Opponents (Basic to Advanced)
- **Level 1 • Novice (~800 ELO):** Fun, fast, casual play with occasional tactical oversights. Perfect for beginners learning piece movements.
- **Level 2 • Intermediate (~1400 ELO):** Solid fundamentals, 2-ply Minimax search, Piece-Square Tables (PST) controlling the center and guarding loose pieces.
- **Level 3 • Advanced (~1900 ELO):** 3-ply Alpha-Beta pruning with **Quiescence Search** on tactical captures, eliminating the horizon effect.
- **Level 4 • Grandmaster (~2400+ ELO):** Deep Alpha-Beta search, MVV-LVA (Most Valuable Victim - Least Valuable Attacker) move ordering, check prioritization, and deep positional evaluation.

---

### 2. 📊 Real-Time Advantage Evaluation Bar
- Dynamic vertical evaluation bar placed right next to the board (similar to Chess.com & Lichess).
- Shows live advantage score in centipawns (e.g. `+1.8`, `0.0`, `-2.4`, or `M` for forced Mate).
- Converts position evaluation into win probability percentage with smooth animated transitions.

---

### 3. 📖 Real-Time Opening Book & Theory Explorer
- Comprehensive opening detection engine covering **100+ standard openings and variations**.
- Displays opening name and ECO code (e.g. `B90 Sicilian Defense: Najdorf`, `C60 Ruy Lopez`, `D06 Queen's Gambit`, `B10 Caro-Kann`) in real-time as moves are played!

---

### 4. 💡 Tactical Advisor & Best Move Hint Engine
- Click **"💡 Hint"** (or press keyboard key `H`) anytime to see the recommended best move.
- Draws an animated **directional tactical arrow** directly onto the chessboard overlay.
- Gives a natural language explanation (e.g. *"Captures opponent's Rook on d8 for material gain!"*, *"Occupies the critical center square e4"*, *"Delivers check to force king defense"*).

---

### 5. 🧩 Tactics Puzzles Trainer (Basic to Advance)
- Curated collection of famous tactical themes:
  - **Basic:** Scholar's Kiss, Back-Rank Mate, Fool's Diagonal, Corridor Mate.
  - **Intermediate:** Arabian Checkmate, Epaulette Mate, Anastasia's Vault, Queen Deflection.
  - **Advance:** Greek Gift Sacrifice, Smothered Knight Infiltration, Boden's Criss-Cross, Corner Net Mate.
- Filter by level (`All`, `Basic`, `Intermediate`, `Advance`).
- Step-by-step verification, hints, and solved counters.

---

### 6. ⏱️ Tournament Clocks & Time Controls
- Dual millisecond-accurate digital clocks for White and Black with monospace typography.
- Time control choices:
  - **Casual (Untimed)**
  - **1 Min (Bullet)**
  - **3 Min (Blitz)**
  - **10 Min (Rapid)**
  - **30 Min (Classical)**
- Turn indicator glow, low-time warning (<30s amber, <10s pulsing red with ticking audio), and flag-fall timeout adjudication.

---

### 7. 🎨 Scalable Vector SVG Pieces & 4 Board Themes
- **Neo Tournament SVG Vector Pieces:** Hand-crafted, crisp vector graphics for all 12 pieces with subtle gradients, shadows, and contours. Looks pin-sharp on 4K, laptops, and mobile screens.
- **Dynamic Board Themes (Switchable anytime):**
  1. 🪵 **Wood Master:** Rich mahogany and ivory cream with warm amber borders.
  2. 🌲 **Emerald Classic:** Iconic Chess.com tournament green and cream.
  3. ⚡ **Cyberpunk Neon:** Slate dark squares, neon cyan highlights, glowing magenta rings.
  4. 🌌 **Midnight Glass:** Deep space obsidian glass with polished metallic silver.

---

### 8. 🔊 Web Audio API Sound Synthesizer
- **Zero external audio file dependencies** — 100% offline, zero latency, guaranteed to work anywhere without broken CDN links!
- Realistic synthesized sound effects:
  - Soft woody move clack
  - Crisp capture impact
  - Two-tone check alert chime
  - Double-click castle slide
  - Harmonic pawn promotion chime
  - Triumphant victory arpeggio & defeat cadence
  - Clock tick-tock

---

### 9. 📋 Notation, PGN & FEN Tools
- Full algebraic move history (e.g., `1. e4 e5 2. Nf3 Nc6`).
- Interactive move navigation buttons (`|◀ First`, `◀ Prev`, `▶ Next`, `▶| Latest`) to review and analyze past board states.
- 1-click **Copy FEN**, **Load custom FEN**, **Copy PGN**, and **Download `.pgn`** file.

---

### 10. 👑 Custom Pawn Promotion Popover
- Sleek floating popover modal directly over the board with Queen, Knight, Rook, Bishop vector buttons. No ugly default browser alerts or prompts!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `H` | Request Tactical Hint & Best Move Arrow |
| `F` | Flip Board Perspective (White ⇋ Black) |
| `Ctrl + Z` / `Cmd + Z` | Undo Move |
| `←` (Left Arrow) | Step Backward in Move History |
| `→` (Right Arrow) | Step Forward in Move History |

---

## 📁 File Structure

```
c:\Users\sujal\Desktop\chess\
├── index.html        # Modern HTML5 responsive layout, arena intro, modals, clocks, tabs
├── style.css         # CSS Variables, dynamic board themes, animations, glassmorphism
├── script.js         # Core application controller, event handlers, clock loops, drag-and-drop
├── chess.js          # Standalone, robust ES6 Chess Engine (0x88 board, move gen, FEN/PGN)
├── ai.js             # 4-Level AI Engine (Minimax, Alpha-Beta, Quiescence, PST, Hint Advisor)
├── pieces.js         # Crystal-clear Scalable SVG vector definitions for all 12 chess pieces
├── sounds.js         # Web Audio API Sound Synthesizer (Move, Capture, Check, Castle, Win)
├── openings.js       # Opening book detector covering 100+ variations with ECO codes
├── puzzles.js        # Curated chess puzzles bank ranging from Basic to Advance
└── README.md         # Full project documentation & guide
```

---

## 🚀 How to Run

Simply **double-click `index.html`** in your file explorer to open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or Brave! No server, npm install, or internet connection required.
