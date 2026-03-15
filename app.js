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
}

// hero class
class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 98;
    this.height = 75;
    this.type = "Hero";
    this.speed = 5;
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

// key press messages
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
};

// global variables so all functions can access
let heroImg, 
    enemyImg, 
    laserImg,
    canvas, 
    ctx, 
    gameObjects = [], 
    hero, 
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
    hero.y -= 10;
  });

  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 10;
  });

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 10;
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 10;
  });
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

  initGame();
  
  const gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGameObjects(ctx);
  }, 100);
};