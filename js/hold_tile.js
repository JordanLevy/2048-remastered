class HoldTile {

  //Holds the current preview tile for use later
  static hold() {
    var tile = new Tile(GameManager.grid.randomAvailableCell(), PreviewTile.value, PreviewTile.type);

    HoldTile.value = PreviewTile.value;
    HoldTile.type = PreviewTile.type;

    PreviewTile.setPreviewTile();

    GameManager.actuator.clearHoldTile();
    GameManager.actuator.addHoldTile(tile);
  }

  //Adds the current hold tile to the board at a given position
  static release(xPos, yPos) {
    if (GameManager.grid.cellsAvailable()) {
      var tile = new Tile({x:xPos, y:yPos}, HoldTile.value, HoldTile.type);
      GameManager.grid.insertTile(tile);
    }
    PreviewTile.setPreviewTile();
    HoldTile.value = 0;
    GameManager.actuator.clearHoldTile();
  }

  static clear(){
    HoldTile.value = 0;
    HoldTile.type = TileTypes.None;
    GameManager.actuator.clearHoldTile();
  }
}