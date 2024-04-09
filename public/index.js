const mapImage = new Image();
mapImage.src = "/tiles.png";

const santaImage = new Image();
santaImage.src = "/santa.png";

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
    right: false
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'z') {
        inputs['up'] = true
    } else if (e.key === 's') {
        inputs['down'] = true
    } else if (e.key === 'q') {
        inputs['left'] = true
    } else if (e.key === 'd') {
        inputs['right'] = true
    }
    socket.emit('inputs', inputs)
})

window.addEventListener('keyup', (e) => {
    if (e.key === 'z') {
        inputs['up'] = false
    } else if (e.key === 's') {
        inputs['down'] = false
    } else if (e.key === 'q') {
        inputs['left'] = false
    } else if (e.key === 'd') {
        inputs['right'] = false
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
    canvas.drawImage(santaImage, player.x - cameraX, player.y - cameraY)
  }

  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
