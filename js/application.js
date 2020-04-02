// Wait till the browser is ready to render the game (avoids glitches)

var boardSize;
var lastHoldTurn = -1;

window.requestAnimationFrame(function () {
  boardSize = 4;
  setup();
});


function changeBoardSize() {
  boardSize = document.getElementById('size').value;
  if (boardSize != GameManager.size) {
    GameManager.grid.cells = GameManager.grid.empty();
  }
  setup();
  GameManager.actuate();
}

function setup() {
  new GameManager(boardSize, KeyboardInputManager, HTMLActuator, LocalStorageManager);
}

function hold() {
  if(GameManager.gridClickEvent == Events.Hold){
    GameManager.gridClickEvent = Events.None;
  }
  else{
    if(HoldTile.value == 0){
      HoldTile.hold();
      lastHoldTurn = GameManager.turns;
      GameManager.gridClickEvent = Events.None;
    }
    else{
      if(lastHoldTurn != -1 && GameManager.turns - lastHoldTurn >= 3) {
        GameManager.gridClickEvent = Events.Hold;
      }
    }
  }
}


function onCellClick(xPos, yPos) {
  switch(GameManager.gridClickEvent) {
  case Events.Hold:
      /*var tile = new Tile({x:xPos, y:yPos}, HoldTile.value, HoldTile.type);
      GameManager.grid.insertTile(tile);*/
      HoldTile.release(xPos, yPos);
      lastHoldTurn = GameManager.turns;
      GameManager.gridClickEvent = Events.None;
      GameManager.actuate();
    break;
  case Events.Explode:
    var isempty = true;
    GameManager.explode(xPos, yPos);
    for (var i = 0; i < GameManager.size; i++) {
      for (var j = 0; j < GameManager.size; j++) {
        if(GameManager.grid.cells[i][j] != null) {
          isempty = false;
        }
      }
    }
    if (isempty) {
      PreviewTile.addPreviewTile();
    }
    ItemSlot.setItem(ItemTypes.None);
    GameManager.gridClickEvent = Events.None;
    break;
  default:
  }
}

