const instructions = document.getElementById("instructions");
const game = document.getElementById("game");
const lives = document.getElementById("lives");
const livesNum = document.getElementById("lives-num");
const sentence = document.getElementById("sentence");
const choices = document.getElementById("choices");

const seed = document.head.querySelector("[name=game-seed]")?.content;

function start() {
  instructions.style.display = "none";
  game.style.display = "flex";
  lives.style.display = "block";

  let numLives = 3;
  let turn = 1;

  livesNum.innerHTML = `${numLives}`;

  // get the game data from the server
  console.log(seed);

}