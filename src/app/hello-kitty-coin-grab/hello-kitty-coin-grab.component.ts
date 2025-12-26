import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedY: number;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-hello-kitty-coin-grab',
  templateUrl: './hello-kitty-coin-grab.component.html',
  styleUrls: ['./hello-kitty-coin-grab.component.scss'],
  imports: [CommonModule]
})
export class HelloKittyCoinGrabComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];

  private kitty = {
    x: 50,
    y: 180,
    width: 50,
    height: 50,
    speed: 4,
    velocityY: 0,
    isJumping: false
  };

  private coin = {
    x: 400,
    y: 0,
    width: 35,
    height: 35
  };

  private obstacle = {
    x: 500,
    y: 0,
    width: 45,
    height: 45,
    speed: 3
  };

  score = 0;
  gameOver = false;
  private up = false;
  private down = false;
  private spacePressed = false;
  private animationFrameId: number | null = null;

  constructor() {
    this.coin.y = this.getRandomSpawnY();
    this.obstacle.y = this.getRandomSpawnY();
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.startGame();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private isOnGround(): boolean {
    return this.kitty.y >= this.canvas.height - this.kitty.height;
  }

  private getRandomSpawnY(): number {
    // Spawn coins and obstacles in a reachable range (50-330 pixels from top)
    return 50 + Math.random() * 280;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') this.up = true;
    if (event.key === 'ArrowDown') this.down = true;
    if (event.key === ' ') {
      event.preventDefault();
      this.spacePressed = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') this.up = false;
    if (event.key === 'ArrowDown') this.down = false;
    if (event.key === ' ') {
      this.spacePressed = false;
    }
  }

  private createHeart(x: number, y: number): void {
    this.particles.push({ x, y, size: 10, alpha: 1, speedY: -1 });
  }

  private startGame(): void {
    this.gameLoop();
  }

  private drawKitty(): void {
    // Draw heart particles
    this.particles.forEach((p) => {
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = '#ff66aa';
      this.ctx.font = '16px Comic Sans MS';
      this.ctx.fillText('💖', p.x, p.y);
      p.y += p.speedY;
      p.alpha -= 0.02;
    });

    // Remove faded particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (this.particles[i].alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Extra sparkles
    this.ctx.globalAlpha = 0.8;
    for (let i = 0; i < 3; i++) {
      const sx = this.kitty.x + 10 + Math.random() * 20;
      const sy = this.kitty.y + 10 + Math.random() * 20;
      this.ctx.fillStyle = '#ffb3e6';
      this.ctx.fillText('✨', sx, sy);
    }

    // Draw Kitty
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = '#ffccdd';
    this.ctx.beginPath();
    this.ctx.arc(this.kitty.x + 25, this.kitty.y + 25, 25, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#000';
    this.ctx.fillText('😺', this.kitty.x + 8, this.kitty.y + 38);
  }

  private drawCoin(): void {
    this.ctx.fillStyle = 'gold';
    this.ctx.beginPath();
    this.ctx.arc(this.coin.x + 17, this.coin.y + 17, 15, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#000';
    this.ctx.fillText('✨', this.coin.x + 5, this.coin.y + 25);
  }

  private drawObstacle(): void {
    this.ctx.fillStyle = '#ff4444';
    this.ctx.fillRect(this.obstacle.x, this.obstacle.y, this.obstacle.width, this.obstacle.height);
    this.ctx.fillStyle = '#000';
    this.ctx.fillText('💣', this.obstacle.x + 8, this.obstacle.y + 35);
  }

  private update(): void {
    // Up/down movement with arrow keys (works anytime)
    if (this.up && this.kitty.y > 0) {
      this.kitty.y -= this.kitty.speed;
    }
    if (this.down && this.kitty.y < this.canvas.height - this.kitty.height) {
      this.kitty.y += this.kitty.speed;
    }

    // Continuous jumping while spacebar is held and on ground
    if (this.spacePressed && this.isOnGround() && !this.kitty.isJumping) {
      this.kitty.velocityY = -8;
      this.createHeart(this.kitty.x + 20, this.kitty.y + 40);
      this.kitty.isJumping = true;
    }

    // Gravity
    this.kitty.velocityY += 0.5;
    this.kitty.y += this.kitty.velocityY;

    // Ground limit
    if (this.kitty.y >= this.canvas.height - this.kitty.height) {
      this.kitty.y = this.canvas.height - this.kitty.height;
      this.kitty.velocityY = 0;
      this.kitty.isJumping = false;
    }

    // Coin movement
    this.coin.x -= 2;
    if (this.coin.x < -35) {
      this.coin.x = 500;
      this.coin.y = this.getRandomSpawnY();
    }

    // Obstacle movement
    this.obstacle.x -= this.obstacle.speed;
    if (this.obstacle.x < -45) {
      this.obstacle.x = 500;
      this.obstacle.y = this.getRandomSpawnY();
    }

    // Collision with coin
    if (
      this.kitty.x < this.coin.x + this.coin.width &&
      this.kitty.x + this.kitty.width > this.coin.x &&
      this.kitty.y < this.coin.y + this.coin.height &&
      this.kitty.y + this.kitty.height > this.coin.y
    ) {
      this.score++;
      this.coin.x = 500;
      this.coin.y = this.getRandomSpawnY();
    }

    // Collision with obstacle
    if (
      this.kitty.x < this.obstacle.x + this.obstacle.width &&
      this.kitty.x + this.kitty.width > this.obstacle.x &&
      this.kitty.y < this.obstacle.y + this.obstacle.height &&
      this.kitty.y + this.kitty.height > this.obstacle.y
    ) {
      this.gameOver = true;
    }
  }

  private drawScore(): void {
    this.ctx.fillStyle = '#ff66aa';
    this.ctx.font = '20px Comic Sans MS';
    this.ctx.fillText('Score: ' + this.score, 10, 25);
  }

  private gameLoop = (): void => {
    if (this.gameOver) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#ff66aa';
      this.ctx.font = '40px Comic Sans MS';
      this.ctx.fillText('GAME OVER 💔', 120, 200);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawKitty();
    this.drawCoin();
    this.drawObstacle();
    this.drawScore();
    this.update();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  retry(): void {
    this.kitty.x = 50;
    this.kitty.y = 180;
    this.kitty.velocityY = 0;
    this.kitty.isJumping = false;

    this.coin.x = 400;
    this.coin.y = this.getRandomSpawnY();

    this.obstacle.x = 500;
    this.obstacle.y = this.getRandomSpawnY();

    this.score = 0;
    this.gameOver = false;
    this.particles = [];

    this.gameLoop();
  }
}
