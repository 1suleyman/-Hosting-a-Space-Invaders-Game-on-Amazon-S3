// Get the canvas and its 2D context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const gameEndMessage = document.querySelector('.game-end-message');
const messageText = document.getElementById('message-text');
const playAgainBtn = document.getElementById('play-again-btn');

// Set canvas dimensions
canvas.width = 600;
canvas.height = 600;

// Game state
let gameRunning = true;
let invaderMovementInterval;

// Player variables
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 50,
  width: 50,
  height: 30,
  speed: 5,
  color: 'lime',
};

// Player movement
let keys = {};
document.addEventListener('keydown', (e) => (keys[e.key] = true));
document.addEventListener('keyup', (e) => (keys[e.key] = false));

// Bullets
const bullets = [];
const bulletSpeed = 7;
let canShoot = true;

function createBullet() {
  if (canShoot) {
    bullets.push({
      x: player.x + player.width / 2 - 2.5,
      y: player.y,
      width: 5,
      height: 10,
      color: 'white',
    });
    canShoot = false;
    setTimeout(() => {
      canShoot = true;
    }, 200); // 200ms delay between shots
  }
}

// Enemies
let enemies = [];
const enemyWidth = 40;
const enemyHeight = 30;
let invaderDirection = 1; // 1 for right, -1 for left
let invaderSpeed = 1;

function createEnemies() {
  const enemyGrid = {
    rows: 4,
    cols: 8,
    spacing: 50,
    xOffset: 50,
    yOffset: 30,
  };
  for (let row = 0; row < enemyGrid.rows; row++) {
    for (let col = 0; col < enemyGrid.cols; col++) {
      enemies.push({
        x: enemyGrid.xOffset + col * enemyGrid.spacing,
        y: enemyGrid.yOffset + row * enemyGrid.spacing,
        width: enemyWidth,
        height: enemyHeight,
        color: 'red',
      });
    }
  }
}

function moveInvaders() {
  if (!gameRunning) return;

  let hitEdge = false;
  enemies.forEach((enemy) => {
    enemy.x += invaderSpeed * invaderDirection;
    if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
      hitEdge = true;
    }
  });

  if (hitEdge) {
    invaderDirection *= -1; // Reverse direction
    enemies.forEach((enemy) => {
      enemy.y += 20; // Move down
      if (enemy.y + enemy.height >= player.y) {
        gameOver(false); // Game over if invaders reach the player's level
      }
    });
  }
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;

  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  // Player movement
  if (keys['ArrowLeft'] && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }
  if (keys[' ']) {
    createBullet();
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bulletSpeed;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }

  // Collision detection
  for (let b = bullets.length - 1; b >= 0; b--) {
    for (let e = enemies.length - 1; e >= 0; e--) {
      const bullet = bullets[b];
      const enemy = enemies[e];

      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // Collision
        bullets.splice(b, 1);
        enemies.splice(e, 1);
        scoreDisplay.textContent = parseInt(scoreDisplay.textContent) + 10;
        break;
      }
    }
  }

  // Check for win condition
  if (enemies.length === 0) {
    gameOver(true);
  }
}

function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw bullets
  ctx.fillStyle = 'white';
  bullets.forEach((bullet) => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

function gameOver(didWin) {
  gameRunning = false;
  clearInterval(invaderMovementInterval);

  if (didWin) {
    messageText.textContent = 'You Win!';
  } else {
    messageText.textContent = 'Game Over';
  }
  gameEndMessage.style.display = 'block';
}

// Play again
playAgainBtn.addEventListener('click', () => {
  window.location.reload();
});

// Initialize the game
createEnemies();
gameLoop();
invaderMovementInterval = setInterval(moveInvaders, 25);