let seed = 0
let frequency = 0.05
let noiseScale = 100

const cameraSpeed = 10

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

const tileDepth = 1
const tileWidth = 0.866026
const tileSize = 50

var camera = { x: 0, y: 0 }

var pause = false
var debug = {}
var cullDistance = 6
var drawDistance = 1.5
resizeCanvas();

let gridDimensions = {
    width: Math.floor(canvas.width / tileSize),
    height: Math.floor(canvas.height / tileSize)
}

const HexOffsets = [
    [0, 0, 1],    // North East
    [1, 0, 0],    // East
    [0, 0, -1],  // South East
    [-1, 0, -1],  // South West
    [-1, 0, 0],   // West
    [-1, 0, 1],   // North West
    [0, -1, 0],   // Up
    [0, 1, 0],    // Down
]

const HexOddOffsets = [
    [1, 0, 1],    // North East
    [1, 0, 0],    // East
    [1, 0, -1],  // South East
    [0, 0, -1],   // South West
    [-1, 0, 0],   // West
    [0, 0, 1],    // North West
    [0, -1, 0],   // Up
    [0, 1, 0],    // Down
]

const HexVertexLookup = [
    [tileWidth * 0.5, tileDepth],
    [tileWidth, tileDepth * 0.75],
    [tileWidth, tileDepth * 0.25],
    [tileWidth * 0.5, 0.0],
    [0.0, tileDepth * 0.25],
    [0.0, tileDepth * 0.75],
]

const HexIndexLookup = {
    "[0,0,0,0,0,0]": [],
    "[0,1,0,0,0,0]": [[1, 2]],
    "[0,1,1,0,0,1]": [[1, 3], [5, 0]],
    "[0,0,0,1,0,1]": [[3, 4], [5, 0]],
    "[0,1,0,1,0,0]": [[1, 2], [3, 4]],
    "[1,0,0,0,0,0]": [[0, 1]],
    "[1,1,0,1,0,1]": [[5, 2], [3, 4]],
    "[0,0,1,0,1,0]": [[2, 3], [4, 5]],
    "[1,1,0,0,1,0]": [[0, 2], [4, 5]],
    "[0,0,1,0,0,0]": [[2, 3]],
    "[1,1,0,0,0,0]": [[0, 2]],
    "[1,0,1,0,0,0]": [[0, 1], [2, 3]],
    "[0,0,1,0,0,1]": [[2, 3], [5, 0]],
    "[0,0,0,0,1,0]": [[4, 5]],
    "[1,0,0,1,1,0]": [[0, 1], [3, 5]],
    "[0,0,0,1,1,0]": [[3, 5]],
    "[0,0,0,1,0,0]": [[3, 4]],
    "[0,0,0,0,0,1]": [[5, 0]],
    "[1,0,0,1,0,0]": [[0, 1], [3, 4]],
    "[1,0,1,0,0,1]": [[5, 1], [2, 3]],
    "[0,0,1,1,0,0]": [[2, 4]],
    "[1,1,0,0,0,1]": [[5, 2]],
    "[0,1,1,1,0,1]": [[1, 4], [5, 0]],
    "[1,0,1,0,1,0]": [[0, 1], [2, 3], [4, 5]],
    "[1,1,0,1,0,0]": [[0, 2], [3, 4]],
    "[1,1,1,0,0,1]": [[5, 1, 3]],
    "[1,0,1,1,0,0]": [[0, 1], [2, 4]],
    "[0,0,0,1,1,1]": [[3, 0]],
    "[0,1,0,0,1,0]": [[1, 2], [4, 5]],
    "[0,1,1,0,0,0]": [[1, 3]],
    "[0,0,0,0,1,1]": [[4, 0]],
    "[1,0,0,0,1,0]": [[0, 1], [4, 5]],
    "[0,1,0,1,1,0]": [[1, 2], [3, 5]],
    "[0,1,0,0,0,1]": [[1, 2], [5, 0]],
    "[1,1,1,1,0,0]": [[0, 2, 4]],
    "[0,0,1,0,1,1]": [[2, 3], [4, 0]],
    "[1,0,0,1,0,1]": [[5, 1], [3, 4]],
    "[0,0,1,1,0,1]": [[2, 4], [5, 0]],
    "[1,1,1,0,0,0]": [[0, 3]],
    "[1,0,0,0,0,1]": [[5, 1]],
    "[0,1,0,1,0,1]": [[1, 2], [3, 4], [5, 0]],
    "[0,1,0,0,1,1]": [[1, 2], [4, 0]],
    "[0,0,1,1,1,0]": [[2, 5]],
    "[0,1,1,0,1,0]": [[1, 3], [4, 5]],
    "[0,1,1,0,1,1]": [[1, 3], [4, 0]],
    "[0,1,1,1,0,0]": [[1, 4]],
    "[1,1,0,0,1,1]": [[4, 0, 2]],
    "[0,1,1,1,1,0]": [[1, 3, 5]],
    "[1,0,0,0,1,1]": [[4, 1]],
    "[1,0,0,1,1,1]": [[3, 5, 1]],
    "[1,0,1,1,1,0]": [[0, 1], [2, 5]],
    "[1,1,0,1,1,0]": [[0, 2], [3, 5]],
    "[0,0,1,1,1,1]": [[2, 4, 0]],
    "[1,1,1,0,1,0]": [[0, 3], [4, 5]],
    "[0,1,0,1,1,1]": [[1, 2], [3, 0]],
    "[1,1,1,1,1,0]": [[0, 2, 3, 5]],
    "[1,0,1,0,1,1]": [[1, 4], [2, 3]],
    "[1,1,1,1,0,1]": [[5, 1, 2, 4]],
    "[0,1,1,1,1,1]": [[1, 3, 4, 0]],
    "[1,1,1,0,1,1]": [[4, 0, 1, 3]],
    "[1,0,1,1,1,1]": [[2, 4, 5, 1]],
    "[1,0,1,1,0,1]": [[5, 1], [2, 4]],
    "[1,1,0,1,1,1]": [[3, 5, 0, 2]],
    "[1,1,1,1,1,1]": [[0, 1, 2, 3, 4, 5, 0]],
}


class Chunk {
    constructor(x, y) {
        this.coords = { x: x, y: y }
        this.data = this.make()
        this.gridOffset = {
            x: (this.coords.x * gridDimensions.width * tileWidth) * tileSize,
            y: (this.coords.y * (gridDimensions.height * (tileDepth * .75))) * tileSize
        }
    }
    make() {
        var grid = []
        for (var x = 0; x < gridDimensions.width; x++) {
            grid[x] = []
            for (var y = 0; y < gridDimensions.height; y++) {
                grid[x][y] = noise.simplex2(x + (this.coords.x * gridDimensions.width) / noiseScale, y + (this.coords.y * gridDimensions.height) / noiseScale) > frequency && 1 || 0
            }
        }
        return grid
    }
    onScreen(camX, camY) {
        if (this.coords.x * tileWidth * gridDimensions.width * tileSize < camX - (tileWidth * gridDimensions.width * tileSize * drawDistance)) {
            return false
        }
        if (this.coords.y * tileDepth * gridDimensions.height * (tileSize * .75) > camY + (tileDepth * gridDimensions.height * (tileSize * .75 * drawDistance))) {
            return false
        }
        if (this.coords.x * tileWidth * gridDimensions.width * tileSize > camX + (tileWidth * gridDimensions.width * tileSize * drawDistance)) {
            return false
        }
        if (this.coords.y * tileDepth * gridDimensions.height * (tileSize * .75) < camY - (tileDepth * gridDimensions.height * (tileSize * .75 * drawDistance))) {
            return false
        }
        return true
    }
    needsToBeCulled(camX, camY) {
        if (this.coords.x * tileWidth * gridDimensions.width * tileSize < camX - (tileWidth * gridDimensions.width * tileSize * cullDistance)) {
            return true
        }
        if (this.coords.y * tileDepth * gridDimensions.height * (tileSize * .75) > camY + (tileDepth * gridDimensions.height * (tileSize * .75 * cullDistance))) {
            return true
        }
        if (this.coords.x * tileWidth * gridDimensions.width * tileSize > camX + (tileWidth * gridDimensions.width * tileSize * cullDistance)) {
            return true
        }
        if (this.coords.y * tileDepth * gridDimensions.height * (tileSize * .75) < camY - (tileDepth * gridDimensions.height * (tileSize * .75 * cullDistance))) {
            return true
        }
        return false
    }
    draw(camX, camY) {
        for (var x = 0; x < gridDimensions.width; x++) {
            for (var y = 0; y < gridDimensions.height; y++) {
                var cell = this.data[x][y]
                if (cell > 0) {
                    if (debug[0]) {
                        var walls = HexIndexLookup["[1,1,1,1,1,1]"]

                        for (var i = 0; i < walls.length; i++) {
                            var directions = walls[i]
                            ctx.beginPath()
                            var xOffset = HexVertexLookup[directions[0]][0]
                            var yOffset = HexVertexLookup[directions[0]][1]
                            var xPos = ((x * tileSize) * tileWidth) + ((xOffset + ((y % 2 !== 0) && tileWidth / 2 || 0)) * tileSize) - camX + this.gridOffset.x
                            var yPos = ((y * tileSize) * (tileDepth * .75)) + (yOffset * tileSize) - camY + this.gridOffset.y
                            ctx.moveTo(xPos, yPos)
                            for (var j = 1; j < directions.length; j++) {
                                xOffset = HexVertexLookup[directions[j]][0]
                                yOffset = HexVertexLookup[directions[j]][1]
                                var xPos = ((x * tileSize) * tileWidth) + ((xOffset + ((y % 2 !== 0) && tileWidth / 2 || 0)) * tileSize) - camX + this.gridOffset.x
                                var yPos = ((y * tileSize) * (tileDepth * .75)) + (yOffset * tileSize) - camY + this.gridOffset.y
                                ctx.lineTo(xPos, yPos)
                            }
                            ctx.fillStyle = "grey"
                            ctx.fill()
                            ctx.closePath()
                        }
                    }
                    continue
                }

                var neighbors = JSON.stringify(getNeighbors(x, y, this.data, [this.coords.x, this.coords.y]))

                var walls = HexIndexLookup[neighbors]

                for (var i = 0; i < walls.length; i++) {
                    var directions = walls[i]
                    ctx.beginPath()
                    var xOffset = HexVertexLookup[directions[0]][0]
                    var yOffset = HexVertexLookup[directions[0]][1]
                    var xPos = ((x * tileSize) * tileWidth) + ((xOffset + ((y % 2 !== 0) && tileWidth / 2 || 0)) * tileSize) - camX + this.gridOffset.x
                    var yPos = ((y * tileSize) * (tileDepth * .75)) + (yOffset * tileSize) - camY + this.gridOffset.y
                    ctx.moveTo(xPos, yPos)
                    for (var j = 1; j < directions.length; j++) {
                        xOffset = HexVertexLookup[directions[j]][0]
                        yOffset = HexVertexLookup[directions[j]][1]
                        var xPos = ((x * tileSize) * tileWidth) + ((xOffset + ((y % 2 !== 0) && tileWidth / 2 || 0)) * tileSize) - camX + this.gridOffset.x
                        var yPos = ((y * tileSize) * (tileDepth * .75)) + (yOffset * tileSize) - camY + this.gridOffset.y
                        ctx.lineTo(xPos, yPos)
                    }
                    ctx.stroke()
                    ctx.closePath()
                }
            }
        }
        if (debug[3]) {
            ctx.font = '48px serif';
            ctx.fillStyle = "red"
            ctx.fillText(JSON.stringify(this.coords), this.gridOffset.x - camX, this.gridOffset.y - camY + 48)
        }
    }
}

var chunks = { "0,0": new Chunk(0, 0) }

var lastLoop = new Date()
var fps = 0
function loop() {
    // camera.x ++
    if (!pause) {
        drawChunks()
        moveCamera()
    }

    if (debug[2]) {
        var thisLoop = new Date()
        fps = 1000 / (thisLoop - lastLoop)
        lastLoop = thisLoop
        ctx.fillStyle = "blue"
        ctx.fillText("FPS: " + Math.floor(fps), 20, 200)
    }

    window.requestAnimationFrame(loop)
}

function getOffset(z, dir) {
    if ((z % 2 == 0 || z == 0)) {
        return HexOffsets[dir];
    }
    else {
        return HexOddOffsets[dir];
    }
}

function getNeighbors(x, y, grid, gridKey) {
    var neighbors = []
    for (var i = 0; i < 6; i++) {
        var offset = getOffset(y, i)
        var neighborCoord = [x + offset[0], y + offset[2]]

        var neighbor = () => {
            var xValue
            if (neighborCoord[0] < 0) {
                xValue = gridKey[0] - 1
            } else if (neighborCoord[0] > gridDimensions.width - 1) {
                xValue = gridKey[0] + 1
            } else {
                xValue = gridKey[0] + 0
            }

            var yValue
            if (neighborCoord[1] < 0) {
                yValue = gridKey[1] - 1
            } else if (neighborCoord[1] > gridDimensions.height - 1) {
                yValue = gridKey[1] + 1
            } else {
                yValue = gridKey[1] + 0
            }

            var gk = [xValue, yValue]
            if (gk.join(',') == gridKey.join(',')) {
                return grid[neighborCoord[0]][neighborCoord[1]]
            } else {
                var xVal
                if (neighborCoord[0] < 0) {
                    xVal = gridDimensions.width - 1
                } else if (neighborCoord[0] > gridDimensions.width - 1) {
                    xVal = 0
                } else { xVal = neighborCoord[0] }

                var yVal
                if (neighborCoord[1] < 0) {
                    yVal = gridDimensions.height - 1
                } else if (neighborCoord[1] > gridDimensions.height - 1) {
                    yVal = 0
                } else { yVal = neighborCoord[1] }

                var key = gk.join(",")
                if (!chunks[key]) {
                    chunks[key] = new Chunk(gk[0], gk[1])
                }

                return chunks[key].data[xVal][yVal]
            }
        }
        var n = neighbor()
        neighbors.push(n || 0)
    }
    return neighbors
}


function drawChunks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var key in chunks) {
        var chunk = chunks[key]
        if (debug[1]) {
            ctx.fillStyle = "lightgrey"
            ctx.fillRect(chunk.gridOffset.x - camera.x + 10, chunk.gridOffset.y - camera.y + 10, (gridDimensions.width * tileWidth * tileSize) - 20, (gridDimensions.height * tileDepth * tileSize * .75) - 20)
        }
    }
    ctx.lineWidth = 5
    ctx.strokeStyle = "black"
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    var chunksRendered = 0
    for (var key in chunks) {
        var chunk = chunks[key]
        if (chunk.onScreen(camera.x, camera.y)) {
            chunksRendered++
            chunk.draw(camera.x, camera.y)
        } else if (chunk.needsToBeCulled(camera.x, camera.y)) {
            delete chunks[chunk.coords.x + "," + chunk.coords.y]
        }
    }

    if (debug[2]) {
        ctx.fillStyle = "blue"
        ctx.fillText("Chunks Rendering: " + chunksRendered, 20, 250)
        ctx.fillText("Chunks in Memory: " + Object.keys(chunks).length, 20, 300)
    }
}


var controllerState = {
    w: false,
    a: false,
    s: false,
    d: false,
}

function moveCamera() {
    var xMove = 0
    var yMove = 0
    if (controllerState.w) {
        yMove -= cameraSpeed
    }
    if (controllerState.a) {
        xMove -= cameraSpeed
    }
    if (controllerState.s) {
        yMove += cameraSpeed
    }
    if (controllerState.d) {
        xMove += cameraSpeed
    }
    if (xMove !== 0 && yMove !== 0) {
        xMove /= 2
        yMove /= 2
    }
    camera.x += xMove
    camera.y += yMove
}

document.addEventListener('keydown', (e) => {
    // console.log(e.key)
    switch (e.key) {
        case "w":
            controllerState.w = true
            break
        case "a":
            controllerState.a = true
            break
        case "s":
            controllerState.s = true
            break
        case "d":
            controllerState.d = true
            break
        case "1":
            toggleDebug(1)
            break
        case "0":
            toggleDebug(0)
            break
        case "2":
            toggleDebug(2)
            break
        case "3":
            toggleDebug(3)
    }
})

function toggleDebug(value) {
    if (debug[value]) {
        debug[value] = false
    } else {
        debug[value] = true
    }
}

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case "w":
            controllerState.w = false
            break
        case "a":
            controllerState.a = false
            break
        case "s":
            controllerState.s = false
            break
        case "d":
            controllerState.d = false
    }
})

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


loop()
