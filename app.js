class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = "";
    this.width = 0;
    this.height = 0;
    this.img = undefined;
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  // 
  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width
    };
  }
}

// hero class
class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 98;
    this.height = 75;
    this.type = "Hero";
    this.speed = { x: 0, y: 0 };  // speed as object now
    this.cooldown = 0;  // firing cooldown
    this.life = 3; // 3 lives
    this.points = 0; // start with 0 points
  }

  // Fire method
  fire() {
    gameObjects.push(new Laser(this.x + 45, this.y - 10));
    this.cooldown = 10;
  }

  // Check if hero can fire
  canFire() {
    return this.cooldown === 0;
  }

  // decrease life
  decrementLife() {
  this.life--;
  if (this.life === 0) {
    this.dead = true;
    }
  }

  // increase life
  incrementPoints() {
    this.points += 100;
  }
}

// enemy class
class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 98;
    this.height = 50;
    this.type = "Enemy";
    const id = setInterval(() => {
      if (this.y < canvas.height - this.height) {
        this.y += 5;
      } else {
        console.log('Stopped at', this.y);
        clearInterval(id);
      }
    }, 300);
  }
}

// laser class for projectiles
class Laser extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 9;
    this.height = 33;
    this.type = 'Laser';
    this.img = laserImg;
    
    // Laser moves by itself with setInterval
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 15;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100);
  }
}

// event emitters
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }

  emit(message) {
    if (this.listeners[message]) {
      this.listeners[message].forEach(listener => listener());
    }
  }
}

// rectangle intersection algorithm
function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top);
}

// key press messages
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
};

// global variables so all functions can access
let heroImg, 
    enemyImg, 
    laserImg,
    canvas, 
    ctx, 
    gameObjects = [], 
    hero,
    lifeImg, 
    eventEmitter = new EventEmitter();


// helper function to load images
function loadAsset(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = "assets/" + src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

// keyboard event listeners
const onKeyDown = function (e) {
  console.log(e.keyCode);
  switch (e.keyCode) {
    case 37:
    case 39:
    case 38:
    case 40: // arrow keys
    case 32:
      e.preventDefault();
      break; // Space
    default:
      break;
  }
};

window.addEventListener("keydown", onKeyDown);

window.addEventListener("keyup", (evt) => {
  if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
  } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
  } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if (evt.key === ' ') { // space bar
    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
  }
});

// replaced old RenderGameScreen() function with these 2 new functions below

// uses enemy class and adds them to gameObjects array
function createEnemies() {
  const MONSTER_TOTAL = 5;
  const MONSTER_WIDTH = MONSTER_TOTAL * 98;
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;

  for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) {
      const enemy = new Enemy(x, y);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
    }
  }
}

// creates the heroes using Hero class and addes to gameObjects array
function createHero() {
  hero = new Hero(
    canvas.width / 2 - 45,
    canvas.height - canvas.height / 4
  );
  hero.img = heroImg;
  gameObjects.push(hero);
}

// create lasers using laser class and add to gameObjects array
function createLaser() {
  const laser = new Laser(hero.x + 45, hero.y);
  laser.img = laserImg;
  gameObjects.push(laser);
}

// calls the draw() method on each game object
function drawGameObjects(ctx) {
  gameObjects.forEach(go => go.draw(ctx));
}

// clears gameObjects array, creates enemies and hero and moves hero based on keyboard events
function initGame() {
  gameObjects = [];
  createEnemies();
  createHero();

  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -= 5; 
  });

  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 5; 
  });

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 5; 
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 5; 
  });

  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });

  // laser-enemy colission
  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
    hero.incrementPoints(); // increment points when laser hits enemy
  });

  // enemy-hero collision
  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    enemy.dead = true;
    hero.decrementLife(); // decrease life when player is hit
  });
}

function updateGameObjects() {
  const enemies = gameObjects.filter(go => go.type === 'Enemy');
  const lasers = gameObjects.filter(go => go.type === "Laser");
  
  // Test laser-enemy collisions
  lasers.forEach((laser) => {
    enemies.forEach((enemy) => {
      if (intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
          first: laser,
          second: enemy,
        });
      }
    });
  });

  // enemy-hero collisions
  enemies.forEach((enemy) => {
    const heroRect = hero.rectFromGameObject();
    if (intersectRect(heroRect, enemy.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
    }
  });

  // Remove destroyed objects
  gameObjects = gameObjects.filter(go => !go.dead);
}

// Draw life icons on screen
function drawLife() {
  const START_POS = canvas.width - 180;
  for(let i=0; i < hero.life; i++ ) {
    ctx.drawImage(
      lifeImg, 
      START_POS + (45 * (i+1) ), 
      canvas.height - 37);
  }
}

// Draw points on screen
function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("Points: " + hero.points, 10, canvas.height - 20);
}

// Helper function to draw text
function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}

// replaced renderGameScreen(); with this, which loads images into global variables 
// called initGame() instead of creating objects manually
// sets up a game loop with setInterval() which runs every 100ms
// game loop clears canvas, draws background, then calls drawGameObjects

window.onload = async () => {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  
  heroImg = await loadAsset("player.png");
  enemyImg = await loadAsset("enemyShip.png");
  laserImg = await loadAsset("laserRed.png");
  lifeImg = await loadAsset("life.png");

  initGame();
  
  const gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateGameObjects()
    
    // deincrement cooldown so you can fire again
    if (hero.cooldown > 0) {
      hero.cooldown -= 1;
    }

    drawGameObjects(ctx);

    drawPoints();
    drawLife();
  }, 100);
};