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

    // load images
    const heroImg = await loadAsset("player.png");
    const enemyImg = await loadAsset("enemyShip.png");

    // draw black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw hero ship
    ctx.drawImage(
      heroImg,
      canvas.width / 2 - 45,
      canvas.height - canvas.height / 4,
      90,
      90
    );

    // enemy formation constants
    const ENEMY_TOTAL = 5;
    const ENEMY_SPACING = 98;
    const FORMATION_WIDTH = ENEMY_TOTAL * ENEMY_SPACING;
    const START_X = (canvas.width - FORMATION_WIDTH) / 2;
    const STOP_X = START_X + FORMATION_WIDTH;

    // draw enemies
    for (let x = START_X; x < STOP_X; x += ENEMY_SPACING) {
      for (let y = 0; y < 50 * 5; y += 50) {
        ctx.drawImage(enemyImg, x, y, 50, 50);
      }
    }

  } catch (error) {
    console.error("Error loading assets:", error);
  }

}

renderGameScreen();