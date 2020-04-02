const Events = {
	None: 'None',
	Hold: 'Hold',
	Explode: 'Explode'
};

function onCellClick(xPos, yPos) {
  console.log(xPos, yPos);
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
	for (var i = 0; i < GameManager.size; i++) {
	  for (var j = 0; j < GameManager.size; j++) {
	    if(Math.abs(i - xPos) < 2 && Math.abs(j - yPos) < 2 && GameManager.grid.cells[i][j] != null) {
	      GameManager.grid.removeTile(GameManager.grid.cells[i][j]);
	    }
	  }
	}
    if (GameManager.grid.isEmpty()) {
      PreviewTile.addPreviewTile();
    }
    ItemSlot.setItem(ItemTypes.None);
    GameManager.gridClickEvent = Events.None;
    GameManager.actuate();
    break;
  default:
  }
}