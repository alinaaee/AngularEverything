import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// ── Canvas constants ─────────────────────────────────────────────────────────
const CW         = 600;
const CH         = 420;
const GROUND_Y   = 340;   // y of the ground surface (kitty feet rest here)
const GRAVITY    = 0.55;
const JUMP_VEL   = -13;   // negative = upward; peak rise ≈ 154 px → coins are placed within range
const KITTY_SPD  = 5;
const KITTY_W    = 48;
const KITTY_H    = 48;

// Coin placement tiers — all reachable by a single jump from ground level
const COIN_TIERS = [
  GROUND_Y - 20,   // on-ground roll
  GROUND_Y - 80,   // low float
  GROUND_Y - 140,  // mid float
  GROUND_Y - 190,  // peak-of-jump float
];

interface Coin     { x: number; y: number; r: number; active: boolean; spin: number; }
interface Obstacle { x: number; y: number; w: number; h: number; spd: number; }
interface Particle { x: number; y: number; vx: number; vy: number; alpha: number; text: string; }

@Component({
  selector: 'app-hello-kitty-coin-grab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hello-kitty-coin-grab.component.html',
  styleUrls: ['./hello-kitty-coin-grab.component.scss'],
})
export class HelloKittyCoinGrabComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  // ── Exposed to template ──
  score    = 0;
  lives    = 3;
  gameOver = false;
  muted    = false;

  // ── Audio ────────────────────────────────────────────────────────────────
  private audioCtx: AudioContext | null = null;

  private getAudio(): AudioContext | null {
    if (this.muted) return null;
    if (!this.audioCtx) this.audioCtx = new AudioContext();
    // Resume in case browser suspended it
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
  }

  private tone(
    freq: number, type: OscillatorType,
    startVol: number, duration: number,
    freqEnd?: number, delay = 0
  ): void {
    const ctx = this.getAudio();
    if (!ctx) return;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    const t = ctx.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
    gain.gain.setValueAtTime(startVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  private playJump():    void { this.tone(320, 'sine',     0.28, 0.14, 640); }
  private playHit():     void { this.tone(200, 'sawtooth', 0.40, 0.28, 55); }

  private playCoin(): void {
    // Mario-style two-note ding: E6 → G6
    this.tone(1318.5, 'sine', 0.32, 0.12, undefined, 0);
    this.tone(1567.9, 'sine', 0.28, 0.14, undefined, 0.09);
  }

  private playLevelUp(): void {
    // Ascending C-E-G-C arpeggio
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone(f, 'sine', 0.28, 0.18, undefined, i * 0.10)
    );
  }

  private playGameOver(): void {
    // Descending sad 4-note phrase
    [523.25, 493.88, 466.16, 392].forEach((f, i) =>
      this.tone(f, 'sine', 0.32, 0.22, undefined, i * 0.20)
    );
  }

  toggleMute(): void { this.muted = !this.muted; }

  // ── Kitty state ──
  private kitty = {
    x: 100, y: GROUND_Y - KITTY_H,
    vx: 0, vy: 0,
    isJumping: false,
    invincible: 0,   // invincibility frames after a hit (blink effect)
  };

  // ── World state ──
  private coins:     Coin[]     = [];
  private obstacles: Obstacle[] = [];
  private particles: Particle[] = [];
  private keys:      Record<string, boolean> = {};
  private frame      = 0;
  private worldSpd   = 3;   // increases with score
  private bgX        = 0;   // background scroll offset
  private animId: number | null = null;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx    = this.canvas.getContext('2d')!;
    this.spawnInitialCoins();
    this.animId = requestAnimationFrame(this.loop);
  }

  ngOnDestroy(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.audioCtx?.close();
  }

  // ── Input ────────────────────────────────────────────────────────────────
  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    // Bootstrap AudioContext on first gesture (browser autoplay policy)
    if (!this.audioCtx) this.getAudio();
    this.keys[e.key] = true;
    if (e.key === ' ' || e.key === 'ArrowUp') e.preventDefault();
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    this.keys[e.key] = false;
  }

  // ── Spawning ─────────────────────────────────────────────────────────────
  private spawnInitialCoins(): void {
    for (let i = 0; i < 3; i++) this.spawnCoin(280 + i * 170);
  }

  private spawnCoin(x?: number): void {
    const tier = COIN_TIERS[Math.floor(Math.random() * COIN_TIERS.length)];
    this.coins.push({ x: x ?? CW + 20, y: tier, r: 14, active: true, spin: 0 });
  }

  private spawnObstacle(): void {
    // Obstacle height varies — kitty must jump over it (all ground-level)
    const h = 36 + Math.random() * 28;
    this.obstacles.push({
      x: CW + 20,
      y: GROUND_Y - h,
      w: 44,
      h,
      spd: this.worldSpd + Math.random() * 1.5,
    });
  }

  private spawnParticles(x: number, y: number, text: string, count = 5): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: -2 - Math.random() * 3,
        alpha: 1,
        text,
      });
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────
  private update(): void {
    if (this.gameOver) return;
    this.frame++;
    this.worldSpd = 3 + Math.floor(this.score / 5) * 0.4;

    // Jump — Space or ArrowUp, only when grounded
    if ((this.keys[' '] || this.keys['ArrowUp']) && !this.kitty.isJumping) {
      this.kitty.vy = JUMP_VEL;
      this.kitty.isJumping = true;
      this.spawnParticles(this.kitty.x + KITTY_W / 2, this.kitty.y + KITTY_H, '💨', 3);
      this.playJump();
    }

    // Horizontal movement — limited to left half of canvas
    if (this.keys['ArrowLeft'])  this.kitty.vx = -KITTY_SPD;
    else if (this.keys['ArrowRight']) this.kitty.vx = KITTY_SPD;
    else this.kitty.vx *= 0.65;

    // Physics
    this.kitty.vy += GRAVITY;
    this.kitty.x   = Math.max(10, Math.min(CW / 2, this.kitty.x + this.kitty.vx));
    this.kitty.y  += this.kitty.vy;

    // Ground clamp
    if (this.kitty.y >= GROUND_Y - KITTY_H) {
      this.kitty.y = GROUND_Y - KITTY_H;
      this.kitty.vy = 0;
      this.kitty.isJumping = false;
    }

    // Ceiling clamp
    if (this.kitty.y < 0) { this.kitty.y = 0; this.kitty.vy = 0; }

    // Invincibility countdown
    if (this.kitty.invincible > 0) this.kitty.invincible--;

    // Spawn schedule
    if (this.frame % 85  === 0) this.spawnCoin();
    if (this.frame % 110 === 0) this.spawnObstacle();

    // Coins
    for (const c of this.coins) {
      if (!c.active) continue;
      c.x -= this.worldSpd;
      c.spin += 0.08;
      if (this.overlaps(
        this.kitty.x + 4, this.kitty.y + 4, KITTY_W - 8, KITTY_H - 8,
        c.x - c.r, c.y - c.r, c.r * 2, c.r * 2
      )) {
        c.active = false;
        this.score++;
        this.playCoin();
        if (this.score % 5 === 0) this.playLevelUp();
        this.spawnParticles(c.x, c.y, '⭐', 6);
      }
    }
    this.coins = this.coins.filter(c => c.active && c.x > -40);

    // Obstacles — shrunk hitbox so it feels fair
    for (const o of this.obstacles) {
      o.x -= o.spd;
      if (this.kitty.invincible === 0 && this.overlaps(
        this.kitty.x + 8, this.kitty.y + 6, KITTY_W - 16, KITTY_H - 10,
        o.x + 4, o.y, o.w - 8, o.h
      )) {
        this.lives--;
        this.kitty.invincible = 90;    // ~1.5 s blink
        this.spawnParticles(this.kitty.x + KITTY_W / 2, this.kitty.y + KITTY_H / 2, '💥', 8);
        this.playHit();
        if (this.lives <= 0) {
          this.gameOver = true;
          this.playGameOver();
        }
      }
    }
    this.obstacles = this.obstacles.filter(o => o.x > -70);

    // Particles
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.12;
      p.alpha -= 0.028;
    }
    this.particles = this.particles.filter(p => p.alpha > 0);

    // Background parallax
    this.bgX = (this.bgX - this.worldSpd * 0.4 + CW * 4) % CW;
  }

  // ── Draw ─────────────────────────────────────────────────────────────────
  private draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CW, CH);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#fce4ec');
    sky.addColorStop(1, '#fff9fb');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CW, GROUND_Y);

    // Scrolling clouds
    ctx.globalAlpha = 0.55;
    ctx.font = '32px serif';
    const cloudX = [60, 230, 420];
    for (const cx of cloudX) {
      ctx.fillText('☁️', (this.bgX * 0.5 + cx) % CW, 55);
      ctx.fillText('☁️', (this.bgX * 0.5 + cx + CW) % CW, 55);
    }
    ctx.globalAlpha = 1;

    // Ground
    ctx.fillStyle = '#c8f0a0';
    ctx.fillRect(0, GROUND_Y, CW, CH - GROUND_Y);
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, GROUND_Y, CW, 10);

    // Ground flowers
    ctx.font = '16px serif';
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 7; i++) {
      const gx = ((this.bgX + i * 90 + CW * 3) % CW);
      ctx.fillText('🌸', gx, GROUND_Y + 34);
    }
    ctx.globalAlpha = 1;

    // ── Coins ──
    for (const c of this.coins) {
      if (!c.active) continue;

      // Dashed guide line down to ground (helps player see where coin is)
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,193,7,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + c.r);
      ctx.lineTo(c.x, GROUND_Y);
      ctx.stroke();
      ctx.restore();

      // Shadow
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(c.x, GROUND_Y + 3, c.r * 0.8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Coin spin (scale x for 3-D spin illusion)
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(Math.abs(Math.cos(c.spin)), 1);
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, c.r);
      glow.addColorStop(0, '#fff9c4');
      glow.addColorStop(1, '#FFC107');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FF8F00';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', 0, 4);
      ctx.textAlign = 'left';
      ctx.restore();
    }

    // ── Obstacles ──
    for (const o of this.obstacles) {
      // Shadow
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(o.x + o.w / 2, GROUND_Y + 4, o.w / 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#e53935';
      this.roundRect(o.x, o.y, o.w, o.h, 8);
      ctx.fill();
      ctx.strokeStyle = '#b71c1c';
      ctx.lineWidth = 2;
      this.roundRect(o.x, o.y, o.w, o.h, 8);
      ctx.stroke();

      ctx.font = '26px serif';
      ctx.fillText('💣', o.x + 4, o.y + o.h - 4);
    }

    // ── Kitty ──
    const blink = this.kitty.invincible > 0 && Math.floor(this.kitty.invincible / 6) % 2 === 0;
    ctx.globalAlpha = blink ? 0.3 : 1;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(this.kitty.x + KITTY_W / 2, GROUND_Y + 5, KITTY_W / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#fff0f5';
    ctx.beginPath();
    ctx.arc(this.kitty.x + KITTY_W / 2, this.kitty.y + KITTY_H / 2, KITTY_W / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffb3d9';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Face
    ctx.font = '34px serif';
    ctx.fillText('😺', this.kitty.x + 6, this.kitty.y + KITTY_H - 4);
    ctx.globalAlpha = 1;

    // ── Particles ──
    ctx.font = '18px serif';
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;

    // ── HUD ──
    // Score
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    this.roundRect(10, 10, 148, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#c2185b';
    ctx.font = 'bold 17px "Comic Sans MS", cursive';
    ctx.fillText(`⭐ Score: ${this.score}`, 18, 33);

    // Lives
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    this.roundRect(CW - 115, 10, 105, 36, 18);
    ctx.fill();
    ctx.font = '20px serif';
    ctx.fillText('❤️'.repeat(this.lives) || '💀', CW - 110, 33);

    // Speed indicator
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    this.roundRect(CW / 2 - 50, 10, 100, 28, 14);
    ctx.fill();
    ctx.fillStyle = '#6a1b9a';
    ctx.font = '12px "Comic Sans MS", cursive';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv ${Math.floor(this.score / 5) + 1}  🚀 ${this.worldSpd.toFixed(1)}x`, CW / 2, 28);
    ctx.textAlign = 'left';

    // Controls hint — first 3 s
    if (this.frame < 180) {
      ctx.globalAlpha = Math.min(1, (180 - this.frame) / 60);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      this.roundRect(CW / 2 - 155, CH - 54, 310, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#6a1b9a';
      ctx.font = '13px "Comic Sans MS", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('↑ / Space: Jump   ←→: Move left/right', CW / 2, CH - 31);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    // Game over overlay
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CW, CH);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 42px "Comic Sans MS", cursive';
      ctx.fillText('Game Over! 💔', CW / 2, CH / 2 - 20);
      ctx.font = '22px "Comic Sans MS", cursive';
      ctx.fillText(`Final Score: ${this.score} ⭐`, CW / 2, CH / 2 + 20);
      ctx.textAlign = 'left';
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private overlaps(ax: number, ay: number, aw: number, ah: number,
                   bx: number, by: number, bw: number, bh: number): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  /** Cross-browser rounded rectangle path (no ctx.roundRect dependency) */
  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Game loop ────────────────────────────────────────────────────────────
  private loop = (): void => {
    this.update();
    this.draw();
    if (!this.gameOver) {
      this.animId = requestAnimationFrame(this.loop);
    }
  };

  // ── Public actions ───────────────────────────────────────────────────────
  retry(): void {
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.frame = 0;
    this.worldSpd = 3;
    this.bgX = 0;

    this.kitty = { x: 100, y: GROUND_Y - KITTY_H, vx: 0, vy: 0, isJumping: false, invincible: 0 };
    this.coins = [];
    this.obstacles = [];
    this.particles = [];
    this.spawnInitialCoins();
    this.animId = requestAnimationFrame(this.loop);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
