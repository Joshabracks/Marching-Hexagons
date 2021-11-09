var seed = 0
var frequency = 0.05
var noiseScale = 100
var cameraSpeed = 10

var pause = false
var debug = {}
var cullDistance = 8
var drawDistance = 1.5
var camera = { x: 0, y: 0 }

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')


resizeCanvas();

var gridDimensions = {
    width: Math.floor(canvas.width / tileSize),
    height: Math.floor(canvas.height / tileSize)
}

var chunks = { "0,0": new Chunk(0, 0) }

var fps = 0
var lastLoop = new Date()
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
    ctx.lineWidth = 1
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
