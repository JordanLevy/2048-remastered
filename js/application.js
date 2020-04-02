// Wait till the browser is ready to render the game (avoids glitches)

var boardSize;
var lastHoldTurn = -1;

window.requestAnimationFrame(function () {
  boardSize = 4;
  setup();
});


function changeBoardSize() {
  boardSize = document.getElementById('size').value;
  if(boardSize < 3 || boardSize > 10){
    alert("Board size must be between 3-10");
    return;
  }
  if (boardSize != GameManager.size) {
    GameManager.grid.cells = GameManager.grid.empty();
  }
  setup();
  GameManager.actuate();
}

function setup() {
  new GameManager(boardSize, KeyboardInputManager, HTMLActuator, LocalStorageManager);
}
