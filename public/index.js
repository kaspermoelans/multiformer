const mapImage = new Image();
mapImage.src = "/tiles.png";

const right_red_santaImage = new Image();
right_red_santaImage.src = "/right_red_santa.png";
const left_red_santaImage = new Image();
left_red_santaImage.src = "/left_red_santa.png";

const right_pink_santaImage = new Image();
right_pink_santaImage.src = "/right_pink_santa.png";
const left_pink_santaImage = new Image();
left_pink_santaImage.src = "/left_pink_santa.png";

const right_bananaImage = new Image();
right_bananaImage.src = "/right_banana.png";
const left_bananaImage = new Image();
left_bananaImage.src = "/left_banana.png";

const right_tomatoImage = new Image();
right_tomatoImage.src = "/right_tomato.png";
const left_tomatoImage = new Image();
left_tomatoImage.src = "/left_tomato.png";

const canvasEl = document.getElementById("canvas");
canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;
const canvas = canvasEl.getContext("2d");

const socket = io();

let map = [[]];
let players = []

const TILE_SIZE = 32;

socket.on("connect", () => {
  console.log("connected");
});

socket.on("map", (loadedMap) => {
  map = loadedMap
});

socket.on('players', (serverPlayers) => {
    players = serverPlayers
})

const inputs = {
    up: false,
    down: false,
    left: false,
    right: false,
  switchSkin: false
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'z' || e.key === 'ArrowUp' || e.key === 'Space') {
        inputs['up'] = true
    } else if (e.key === 's' || e.key === 'ArrowDown') {
        inputs['down'] = true
    } else if (e.key === 'q' || e.key === 'ArrowLeft') {
        inputs['left'] = true
    } else if (e.key === 'd' || e.key === 'ArrowRight') {
        inputs['right'] = true
    } else if (e.key === 'e') {
      inputs['switchSkin'] = true
    }
    socket.emit('inputs', inputs)
})

window.addEventListener('keyup', (e) => {
    if (e.key === 'z' || e.key === 'ArrowUp' || e.key === 'Space') {
        inputs['up'] = false
    } else if (e.key === 's' || e.key === 'ArrowDown') {
        inputs['down'] = false
    } else if (e.key === 'q' || e.key === 'ArrowLeft') {
        inputs['left'] = false
    } else if (e.key === 'd' || e.key === 'ArrowRight') {
        inputs['right'] = false
    } else if (e.key === 'e') {
      inputs['switchSkin'] = false
    }
    socket.emit('inputs', inputs)
})

function loop() {
  canvas.clearRect(0, 0, canvasEl.width, canvasEl.height);
  canvas.fillStyle = 'lightblue'
  canvas.fillRect(0, 0, canvasEl.width, canvasEl.height)

  const myPlayer = players.find((player) => player.id === socket.id)

  let cameraX = 0
  let cameraY = 0

  if (myPlayer) {
    cameraX = parseInt(myPlayer.x - canvasEl.width / 2)
    cameraY = parseInt(myPlayer.y - canvasEl.height / 2)
  }

  const TILES_IN_ROW = 8;

  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[0].length; col++) {
      let { id } = map[row][col] ?? {id: undefined}
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = id % TILES_IN_ROW;
      canvas.drawImage(
        mapImage,
        imageCol * TILE_SIZE,
        imageRow * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        col * TILE_SIZE - cameraX,
        row * TILE_SIZE - cameraY,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  for (const player of players) {
    if (player.direction === "left") {
      if (player.skin === "red_santa") {
        canvas.drawImage(left_red_santaImage, player.x - cameraX, player.y - cameraY)
      } else if (player.skin === "pink_santa") {
        canvas.drawImage(left_pink_santaImage, player.x - cameraX, player.y - cameraY)
      } else if (player.skin === "banana") {
        canvas.drawImage(left_bananaImage, player.x - cameraX, player.y - cameraY)
      } else if (player.skin === "tomato") {
        canvas.drawImage(left_tomatoImage, player.x - cameraX, player.y - cameraY)
      } else {
        canvas.drawImage(left_red_santaImage, player.x - cameraX, player.y - cameraY)
      }
    } else if (player.direction === "right") {
      if (player.skin === "red_santa") {
        canvas.drawImage(right_red_santaImage, player.x - cameraX, player.y - cameraY)
      } else if (player.skin === "pink_santa") {
        canvas.drawImage(right_pink_santaImage, player.x - cameraX, player.y - cameraY)
      } else if (player.skin === "banana") {
        canvas.drawImage(right_bananaImage, player.x - cameraX, player.y - cameraY)
      } else if (player.skin === "tomato") {
        canvas.drawImage(right_tomatoImage, player.x - cameraX, player.y - cameraY)
      } else {
        canvas.drawImage(right_red_santaImage, player.x - cameraX, player.y - cameraY)
      }
    }
  }

  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
