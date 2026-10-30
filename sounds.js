/**
 * Web Audio API Sound Synthesizer for Grandmaster Chess Arena
 * Zero external audio assets required - works 100% offline with zero latency!
 */

class ChessAudio {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('gm_chess_muted') === 'true';
    }

    _initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('gm_chess_muted', this.muted);
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    // Normal move: soft woody wooden board impact
    playMove() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Capture move: sharp snap impact
    playCapture() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Low thump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);

        // High snap
        const snap = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();
        snap.type = 'sine';
        snap.frequency.setValueAtTime(650, now);
        snap.frequency.exponentialRampToValueAtTime(120, now + 0.05);

        snapGain.gain.setValueAtTime(0.3, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        snap.connect(snapGain);
        snapGain.connect(this.ctx.destination);

        snap.start(now);
        snap.stop(now + 0.05);
    }

    // Check alert: subtle urgent two-tone chime
    playCheck() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [ { freq: 520, start: 0, dur: 0.12 }, { freq: 780, start: 0.08, dur: 0.25 } ].forEach(tone => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(tone.freq, now + tone.start);

            gain.gain.setValueAtTime(0, now + tone.start);
            gain.gain.linearRampToValueAtTime(0.4, now + tone.start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + tone.start + tone.dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + tone.start);
            osc.stop(now + tone.start + tone.dur);
        });
    }

    // Castling: double clack
    playCastle() {
        if (this.muted) return;
        this.playMove();
        setTimeout(() => this.playMove(), 80);
    }

    // Pawn Promotion: magical harmonic chime
    playPromote() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(0, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.06 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.22);
        });
    }

    // Game Over: Victory or Defeat
    playGameOver(won = true) {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = won ? [392, 523.25, 659.25, 783.99, 1046.5] : [440, 415.3, 392, 349.23];
        const step = won ? 0.09 : 0.16;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = won ? 'triangle' : 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * step);

            gain.gain.setValueAtTime(0, now + idx * step);
            gain.gain.linearRampToValueAtTime(0.3, now + idx * step + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * step + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * step);
            osc.stop(now + idx * step + 0.35);
        });
    }

    // Low time ticking
    playTick() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    }
}

export const sounds = new ChessAudio();
