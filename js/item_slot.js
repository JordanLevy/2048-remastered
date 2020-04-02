const ItemTypes = {
  None: 'None',
  Explode: 'Explode',
  Trim: 'Trim'
};

class ItemSlot {

  static setItem(i) {
    ItemSlot.item = i;
    document.getElementById("item-slot").src = "assets/item_" + i + ".png";
  }
}

function useItem() {
  switch(ItemSlot.item) {
  case ItemTypes.Explode:
    if(GameManager.gridClickEvent == Events.Explode){
      GameManager.gridClickEvent = Events.None;
    }
    else{
      GameManager.gridClickEvent = Events.Explode;
    }
    break;
  case ItemTypes.Trim:
    for (var x = 0; x < GameManager.grid.size; x++) {
      for (var y = 0; y < GameManager.grid.size; y++) {
        if (GameManager.grid.cells[x][y] && GameManager.grid.cells[x][y].type == ItemTypes.None && GameManager.grid.cells[x][y].value <= 4) {
          GameManager.grid.removeTile(GameManager.grid.cells[x][y]);
        }
      }
    }
    GameManager.actuate();
    ItemSlot.setItem(ItemTypes.None);
    break;
  default:
  }
}