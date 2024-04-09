const express = require('express')
const { createServer } = require("http");
const { resolve } = require('path');
const { Server } = require("socket.io");

const app = express()
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(httpServer);

const loadMap = require('./mapLoader');
const { disconnect } = require('process');

const TICK_RATE = 30

const TILE_SIZE = 32

let players = []
let map2D
const inputsMap = {}

const SPEED = {
    x: 5,
    y: 5,
    jump: -12
}

function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.h + rect1.y > rect2.y
    );
}
  
function isCollidingWithMap(player) {
for (let row = 0; row < map2D.length; row++) {
    for (let col = 0; col < map2D[0].length; col++) {
    const tile = map2D[row][col];

    if (
        tile &&
        isColliding(
        {
            x: player.x,
            y: player.y,
            w: 32,
            h: 32,
        },
        {
            x: col * TILE_SIZE,
            y: row * TILE_SIZE,
            w: TILE_SIZE,
            h: TILE_SIZE,
        }
        )
    ) {
        return true;
    }
    }
}
return false;
}

function tick(delta) {
    for (const player of players) {
        const inputs = inputsMap[player.id]
        const previousY = player.y
        const previousX = player.x

        player.y += player.speed.y

        if (isCollidingWithMap(player)) {
            player.y = previousY
            if (inputs.up) {
                player.speed.y = player.speed.jump
            }
            if (player.speed.y > 5) {
                player.speed.y = 5
            }
        }

        player.speed.y += 1

        if (inputs.left) {
            player.x -= player.speed.x
        } else if (inputs.right) {
            player.x += player.speed.x
        }

        if (isCollidingWithMap(player)) {
            player.x = previousX
        }
    }
    io.emit('players', players)
}

async function main() {
    map2D = await loadMap()

    io.on('connect', (socket) => {
        console.log("user connected", socket.id)

        inputsMap[socket.id] = {
            up: false,
            down: false,
            left: false,
            right: false
        }

        players.push({
            id: socket.id,
            x: 50,
            y: 3500,
            speed: SPEED
        })

        socket.emit('map', map2D)

        socket.on('inputs', (inputs) => {
            inputsMap[socket.id] = inputs
        })

        socket.on('disconnect', () => {
            players = players.filter(player => player.id !== socket.id)
        })
    })
    
    app.use(express.static("public"))
    
    httpServer.listen(PORT);

    let lastUpdate = Date.now()
    setInterval(() => {
        const now = Date.now()
        const delta = now - lastUpdate
        tick(delta)
        lastUpdate = now
    }, 1000 / TICK_RATE)
}

main()
