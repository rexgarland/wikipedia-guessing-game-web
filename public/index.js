const instructions = document.getElementById("instructions");
const game = document.getElementById("game");
const sentence = document.getElementById("sentence");
const choices = document.getElementById("choices");

const seed = document.head.querySelector("[name=game-seed]")?.content;

function start() {
  instructions.style.display = "none";
  game.style.display = "flex";

  let lives = 3;
  let turn = 1;

  // get the game data from the server
  console.log(seed);

}