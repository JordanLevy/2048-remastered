class GameManager {

  constructor(size, InputManager, Actuator, StorageManager) {
    GameManager.size           = size; // Size of the grid
    GameManager.inputManager   = new InputManager;
    GameManager.storageManager = new StorageManager;
    GameManager.actuator       = new Actuator;
    GameManager.startTiles     = 2;
    GameManager.grid           = new Grid(GameManager.size);
    GameManager.score          = 0;
    GameManager.over           = false;
    GameManager.won            = false;
    GameManager.keepPlaying    = false;
    GameManager.grid.cells     = GameManager.grid.empty();
    GameManager.gridClickEvent = Events.None;
    ItemSlot.setItem(ItemTypes.None);
    new ExtraLife();
    HoldTile.clear();
    GameManager.turns = 0;

    PreviewTile.value = 0;
    HoldTile.value = 0;

    GameManager.lastMoveTime = (new Date()).getTime();
    GameManager.moveCooldown = 50;
    GameManager.inputManager.on("move", GameManager.move);
    GameManager.inputManager.on("restart", GameManager.restart);
    GameManager.inputManager.on("keepPlaying", GameManager.keepPlaying);
  
    GameManager.setup();
  }

  // Restart the game
  static restart() {
    GameManager.storageManager.clearGameState();
    GameManager.actuator.continueGame(); // Clear the game won/lost message
    GameManager.grid = new Grid(GameManager.size);
    GameManager.setup();
  }

  // Keep playing after winning (allows going over 2048)
  static keepPlaying() {
    GameManager.keepPlaying = true;
    GameManager.actuator.continueGame(); // Clear the game won/lost message
  }


  // Return true if the game is lost, or has won and the user hasn't kept playing
  static isGameTerminated() {
    if (GameManager.over && ExtraLife.useLife()) {
      GameManager.over = false;
      var max = GameManager.grid.getMaxValue();
      for (var x = 0; x < GameManager.grid.size; x++) {
        for (var y = 0; y < GameManager.grid.size; y++) {
          if (GameManager.grid.cells[x][y].value > 4 && GameManager.grid.cells[x][y].value < max) {
            GameManager.grid.removeTile(GameManager.grid.cells[x][y]);
          }
          // if(this.cells[x][y] && GameManager.grid.cells[x][y].value > currMax){
          //   currMax = this.cells[x][y].value;
          // }
        }
      }
    }
    return GameManager.over || (GameManager.won && !GameManager.keepPlaying);
  }

  // Set up the game
  static setup() {
    // Add the initial tiles
    GameManager.addStartTiles();
    GameManager.setupBoardSize();
    GameManager.setupTileCSS();
    // Update the actuator
    GameManager.actuate();
  }

  // Creates necessary HTML elements to create the game grid depending on board size
  static setupBoardSize() {
    var b = document.getElementsByClassName("game-container")[0];
    var numPixels = GameManager.size*106.25 + 15*GameManager.size + 15;
    b.style.width = numPixels.toString() + "px";
    b.style.height = numPixels.toString() + "px";

    
    var g = document.getElementsByClassName("grid-container")[0];
    g.innerHTML = "";

    var gr = "";
    for (var i = 0; i < GameManager.size; i++) {
      gr += `<div class="grid-row">`;
      for (var j = 0; j < GameManager.size; j++) {
        gr += "<div class=\"grid-cell\" onclick=\"onCellClick(" + j + "," + i + ")\"></div>";
      }
      gr += `</div>`;
    }

    g.innerHTML = gr;

  }

  // Creates necessary CSS properties to create the tiles depending on board size
  static setupTileCSS() {

    var tags = document.getElementsByTagName('style');
    for (var i = tags.length - 1; i >= 0; i--) {
      tags[i].parentNode.removeChild(tags[i]);
    }
    var style = document.createElement('style');
    var transformCSS = ``
    for(var i = 1; i <= GameManager.size; i++){
      var n = ((i - 1)*121).toString() + `px,`;
      for(var j = 1; j <= GameManager.size; j++){
        var m = ((j - 1)*121).toString() + `px`;
        var p = n + m;
        transformCSS += `
        .tile.tile-position-` + i.toString() + `-` + j.toString() + ` {
        -webkit-transform: translate(` + p + `);
        -moz-transform: translate(` + p + `);
        -ms-transform: translate(` + p + `);
        transform: translate(` + p + `); }
        `;
      }
    }
    
    style.innerHTML = transformCSS;
    document.head.appendChild(style);
  }

  // Set up the initial tiles to start the game with
  static addStartTiles() {
      PreviewTile.setPreviewTile();
      PreviewTile.addPreviewTile();
      PreviewTile.addPreviewTile();
  }

  // Adds a tile in a random position
  static addRandomTile() {
    if (GameManager.grid.cellsAvailable()) {
      var value = Math.random() < 0.9 ? 2 : 4;
      var tile = new Tile(GameManager.grid.randomAvailableCell(), value, TileTypes.None);

      GameManager.grid.insertTile(tile);
    }
  }

  // Sends the updated grid to the actuator
  static actuate() {
    if (GameManager.storageManager.getBestScore() < GameManager.score) {
      GameManager.storageManager.setBestScore(GameManager.score);
    }

    // Clear the state when the game is over (game over only, not win)
    if (GameManager.over) {
      GameManager.storageManager.clearGameState();
    } else {
      GameManager.storageManager.setGameState(GameManager.serialize());
    }

    GameManager.actuator.actuate(GameManager.grid, {
      score:      GameManager.score,
      over:       GameManager.over,
      won:        GameManager.won,
      bestScore:  GameManager.storageManager.getBestScore(),
      terminated: GameManager.isGameTerminated()
    });

  }

  // Represent the current game as an object
  static serialize() {
    return {
      grid:        GameManager.grid.serialize(),
      score:       GameManager.score,
      over:        GameManager.over,
      won:         GameManager.won,
      keepPlaying: GameManager.keepPlaying
    };
  }

  // Save all tile positions and remove merger info
  static prepareTiles() {
    GameManager.grid.eachCell(function (x, y, tile) {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  // Move a tile and its representation
  static moveTile(tile, cell) {
    GameManager.grid.cells[tile.x][tile.y] = null;
    GameManager.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }

  // Move tiles on the grid in the specified direction
  static move(direction) {
    // 0: up, 1: right, 2: down, 3: left
    var self = GameManager;
    var currTime = (new Date()).getTime();
    if (GameManager.isGameTerminated() || currTime - GameManager.lastMoveTime <= GameManager.moveCooldown) return; // Don't do anything if the game's over

    GameManager.lastMoveTime = currTime;

    var cell, tile;

    var vector     = GameManager.getVector(direction);
    var traversals = GameManager.buildTraversals(vector);
    var moved      = false;

    // Save the current tile positions and remove merger information
    GameManager.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y };
        tile = self.grid.cellContent(cell);

        if (tile) {
          var positions = self.findFarthestPosition(cell, vector);
          var next      = self.grid.cellContent(positions.next);

          // Only one merger per row traversal?
          //Merge regular tiles by value
          if (next && next.canMergeByValue(tile) && !next.mergedFrom) {
            var merged = new Tile(positions.next, tile.value * 2, TileTypes.None);
            merged.mergedFrom = [tile, next];

            self.grid.insertTile(merged);
            self.grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(positions.next);

            // Update the score
            self.score += merged.value;

            // The mighty 2048 tile
            if (merged.value === 2048){
              self.won = true;
            }
          }
          //Merge special tiles by type
          else if (next && next.canMergeSpecial(tile) && !next.mergedFrom) {
            var merged = new Tile(positions.next, Math.max(self.grid.getMaxValue()/2, 2), TileTypes.None);
            merged.mergedFrom = [tile, next];
            GameManager.onSpecialTileMerge(merged.x, merged.y, tile.type);
            self.grid.insertTile(merged);
            self.grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(positions.next);

            // Update the score
            self.score += merged.value;
          }
          else {
            self.moveTile(tile, positions.farthest);
          }

          if (!self.positionsEqual(cell, tile)) {
            moved = true; // The tile moved from its original cell!
          }
        }
      });
    });

    if (moved) {
      GameManager.turns += 1;
      PreviewTile.addPreviewTile();

      if (!GameManager.movesAvailable()) {
        GameManager.over = true; // Game over!
      }

      GameManager.actuate();
    }
  }

  static onSpecialTileMerge(x, y, tileType){
    switch(tileType) {
    case TileTypes.Explode:
      ItemSlot.setItem(ItemTypes.Explode);
      break;
    case TileTypes.Trim:
      ItemSlot.setItem(ItemTypes.Trim);
      break;
    case TileTypes.ExtraLife:
      ExtraLife.AddLife();
      break;
    default:
    
    }
  }

  // Get the vector representing the chosen direction
  static getVector(direction) {
    // Vectors representing tile movement
    var map = {
      0: { x: 0,  y: -1 }, // Up
      1: { x: 1,  y: 0 },  // Right
      2: { x: 0,  y: 1 },  // Down
      3: { x: -1, y: 0 }   // Left
    };

    return map[direction];
  }

  // Build a list of positions to traverse in the right order
  static buildTraversals(vector) {
    var traversals = { x: [], y: [] };

    for (var pos = 0; pos < GameManager.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  }

  static findFarthestPosition(cell, vector) {
    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
      previous = cell;
      cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (GameManager.grid.withinBounds(cell) &&
            GameManager.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell // Used to check if a merge is required
    };
  }

  static movesAvailable() {
    return GameManager.tileMatchesAvailable() || (GameManager.grid.availableCells().length != 0) || ItemSlot.item != ItemTypes.None;
  }

  // Check for available matches between tiles (more expensive check)
  static tileMatchesAvailable() {
    var self = this;

    var tile;

    for (var x = 0; x < GameManager.size; x++) {
      for (var y = 0; y < GameManager.size; y++) {
        tile = GameManager.grid.cellContent({ x: x, y: y });

        if (tile) {
          for (var direction = 0; direction < 4; direction++) {
            var vector = self.getVector(direction);
            var cell   = { x: x + vector.x, y: y + vector.y };

            var other  = self.grid.cellContent(cell);

            if (other && (other.canMergeByValue(tile) || other.canMergeSpecial(tile))) {
              return true; // These two tiles can be merged
            }
          }
        }
      }
    }

    return false;
  }

  static positionsEqual(first, second) {
    return first.x === second.x && first.y === second.y;
  }
  
  static explode(x, y) {
    for (var i = 0; i < GameManager.size; i++) {
      for (var j = 0; j < GameManager.size; j++) {
        if(Math.abs(i - x) < 2 && Math.abs(j - y) < 2 && GameManager.grid.cells[i][j] != null) {
          GameManager.grid.removeTile(GameManager.grid.cells[i][j]);
        }
      }
    }
    GameManager.actuate();
  }
}