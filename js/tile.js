const TileTypes = {
  None: 'None',
  Explode: 'Explode',
  ExtraLife: 'ExtraLife',
  Trim: 'Trim'
};

function Tile(position, value, type) {
  this.x = position.x;
  this.y = position.y;
  this.value = value || 2;
  this.type = type;

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
}

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
}

Tile.prototype.canMergeByValue = function(t){
  return (t.type == TileTypes.None && this.type == TileTypes.None) && (t.value == this.value);
}

Tile.prototype.canMergeSpecial = function(t){
  return (t.type != TileTypes.None && this.type != TileTypes.None) && (t.type == this.type);
}

Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value,
    type: this.type
  };
}
