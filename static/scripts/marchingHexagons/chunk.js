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
        ctx.strokeStyle = "grey"
        for (var x = 0; x < gridDimensions.width; x++) {
            for (var y = 0; y < gridDimensions.height; y++) {
                var cell = this.data[x][y]
                if (cell > 0) {
                    var walls = HexIndexLookup["[1,1,1,1,1,1]"]

                    for (var i = 0; i < walls.length; i++) {
                        var directions = walls[i]
                        ctx.beginPath()
                        var xOffset = HexVertexLookup[directions[0]][0]
                        var yOffset = HexVertexLookup[directions[0]][1]
                        var xPos = ((x * tileSize) * tileWidth) + ((xOffset + ((y % 2 !== 0) && tileWidth / 2 || 0)) * tileSize) - camX + this.gridOffset.x
                        var yPos = ((y * tileSize) * (tileDepth * .75)) + (yOffset * tileSize) - camY + this.gridOffset.y
                        ctx.moveTo((xPos), (yPos))
                        for (var j = 1; j < directions.length; j++) {
                            xOffset = HexVertexLookup[directions[j]][0]
                            yOffset = HexVertexLookup[directions[j]][1]
                            var xPos = ((x * tileSize) * tileWidth) + ((xOffset + ((y % 2 !== 0) && tileWidth / 2 || 0)) * tileSize) - camX + this.gridOffset.x
                            var yPos = ((y * tileSize) * (tileDepth * .75)) + (yOffset * tileSize) - camY + this.gridOffset.y
                            ctx.lineTo(xPos, yPos)
                        }
                        ctx.fillStyle = "grey"
                        ctx.fill()
                        ctx.stroke()
                        ctx.closePath()
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
                    ctx.fillStyle = "grey"
                    ctx.fill()
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