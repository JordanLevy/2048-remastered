class ExtraLife {

  constructor() {
    ExtraLife.lives = 0;
    ExtraLife.image = "assets/ExtraLifeGrey.png";
    document.getElementById("ExtraLife").innerHTML = ExtraLife.lives;
    document.getElementById("extra-life").src = ExtraLife.image;
  }

  static AddLife() {
    ExtraLife.lives = ExtraLife.lives + 1;
    ExtraLife.image = "assets/ExtraLife.png";
    document.getElementById("ExtraLife").innerHTML = ExtraLife.lives;
    document.getElementById("extra-life").src = ExtraLife.image;
  }

  static useLife() {
    ExtraLife.lives = ExtraLife.lives - 1;
    if (ExtraLife.lives >= 0) {
      document.getElementById("ExtraLife").innerHTML = ExtraLife.lives;
    }
    if (ExtraLife.lives == 0) {
      ExtraLife.image = "assets/ExtraLifeGrey.png";
      document.getElementById("extra-life").src = ExtraLife.image;
    }
    return ExtraLife.lives >= 0 ? true : false;
  }
}
