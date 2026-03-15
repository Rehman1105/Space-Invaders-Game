// helper function to load images
function loadAsset(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = "assets/" + src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

async function renderGameScreen() {
  try {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    // Draw black background 
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load game textures
    const heroImg = await loadAsset("player.png");
    const enemyImg = await loadAsset("enemyShip.png");

    // Draw hero ship
    const HERO_WIDTH = 90;
    const HERO_HEIGHT = 90;
    const heroX = canvas.width / 2 - HERO_WIDTH / 2;
    const heroY = canvas.height - canvas.height / 4;

    ctx.drawImage(heroImg, heroX, heroY, HERO_WIDTH, HERO_HEIGHT);

    // Draw 5×5 enemy formation
    const ENEMY_TOTAL = 5;
    const ENEMY_SIZE = 50;
    const ENEMY_SPACING = 98;

    const FORMATION_WIDTH = ENEMY_TOTAL * ENEMY_SPACING;
    const START_X = (canvas.width - FORMATION_WIDTH) / 2;
    const STOP_X = START_X + FORMATION_WIDTH;

    for (let x = START_X; x < STOP_X; x += ENEMY_SPACING) {
      for (let y = 0; y < ENEMY_SIZE * ENEMY_TOTAL; y += ENEMY_SIZE) {
        ctx.drawImage(enemyImg, x, y, ENEMY_SIZE, ENEMY_SIZE);
      }
    }
  } catch (error) {
    console.error("Error loading assets:", error);
  }
}

renderGameScreen();