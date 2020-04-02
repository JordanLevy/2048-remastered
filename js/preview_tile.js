class PreviewTile {

  //On every turn, the chance of getting a 4 is 0.4, chance of getting a 2 is 0.6.
  //If the max-value on board is 2^n (and >= 8), then the chance of getting the max value is 0.4*0.8^n
  //All other probabilities are interpolated using an exponential function
  //There is a 25% chance that the tile is special, in which case the tile is given a type that is not None
  static setPreviewTile() {
    var maxVal = GameManager.grid.getMaxValue();
    var rand = Math.random();
    var numPossibleTiles = Math.log2(maxVal);
    var value = 0;
    var type = TileTypes.None;

    //if the highest on board is a 2
    if(numPossibleTiles == 1){
      value = 2;
    }
    //if the highest on board is a 4
    else if(numPossibleTiles == 2){
      //40% chance of 4, 60% chance of 2
      value = Math.random() < 0.4 ? 4 : 2;
    }
    else{
      var k = Math.log(Math.pow(0.8, numPossibleTiles))/(numPossibleTiles-2);
      var prob = 0;
      var found = false;
      for(var i = numPossibleTiles - 2; i >= 0; i--){
      //for(var i = 0; i <= numPossibleTiles - 2; i++){
        prob = 0.4*Math.exp(k*i);
        //console.log(Math.pow(2, i+2), prob);
        if(rand <= prob){
          value = Math.pow(2, i+2);
          found = true;
          break;
        }
      }
      if(!found){
        value = 2;
      }
    }

    //8% chance extralife, 8% chance explosion, 8% chance trim, 68% chance regular
    rand = Math.random();
    if(rand <= 0.08){
      type = TileTypes.ExtraLife;
    }
    else if(rand <= 0.16){
      type = TileTypes.Explode;
    }
    else if(rand <= 0.24){
      type = TileTypes.Trim;
    }
    else{
      type = TileTypes.None;
    }
    var tile = new Tile({x:0, y:0}, value, type);

    PreviewTile.value = value;
    PreviewTile.type = type;

    GameManager.actuator.clearPreviewTile();
    GameManager.actuator.addPreviewTile(tile);
  }

  // Adds the previewed tile in a random position
  static addPreviewTile() {
    if (GameManager.grid.cellsAvailable()) {
      var tile = new Tile(GameManager.grid.randomAvailableCell(), PreviewTile.value, PreviewTile.type);
      GameManager.grid.insertTile(tile);
    }
    PreviewTile.setPreviewTile();
  }
}