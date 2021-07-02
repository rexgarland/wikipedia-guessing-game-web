const instructions = document.getElementById("instructions");
const game = document.getElementById("game");
const status = document.getElementById("status");
const turnNum = document.getElementById("turn-num");
const livesNum = document.getElementById("lives-num");
const sentence = document.getElementById("sentence");
const choices = document.getElementById("choices");

const seed = document.head.querySelector("[name=game-seed]")?.content;

async function getGameData() {
  const data = await fetch(`/data/${seed}`).then(res => res.json());
  return data;
}

function evaluation(i) {
    if (i<10) {
        return "you could use some practice."
    } else if (i<20) {
        return "not bad, not bad."
    } else if (i<40) {
        return "alright, that's respectable."
    } else {
      return "Well done! Now, you should spend your time doing something else."
    }
}

function shuffle(array) {
  var currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function userChoice(levelData, onRight, onWrong) {
  const choiceItems = shuffle(levelData.urls).map(url => {
    const li = document.createElement('li')
    li.innerHTML = `<div class="choice">${url}</div>`
    if (url==levelData.answer) {
      li.onclick = onRight;
    } else {
      li.onclick = onWrong;
    }
    return li;
  }).forEach(choiceElem => {
    choices.appendChild(choiceElem);
  });
}

function runGame(state) {
  // start with a blank slate
  sentence.innerHTML = '';
  choices.innerHTML = '';

  if (state.levels.length==0) {
    // ending is reached
    sentence.innerHTML = 'You finished the game... wow';
  }

  else if (state.lives==0) {
    // player died
    sentence.innerHTML = evaluation(state.turn);
  }

  else {
    // in a turn

    // update status bar
    turnNum.innerHTML = `${state.turn}`;
    livesNum.innerHTML = `${state.lives}`;

    // populate the turn
    const level = state.levels[0];
    sentence.innerHTML = level.sentence;

    const onRight = () => runGame({
      ...state,
      turn: state.turn+1,
      levels: state.levels.slice(1)
    });

    const onWrong = () => runGame({
      ...state,
      lives: state.lives-1,
      turn: state.turn+1,
      levels: state.levels.slice(1)
    });

    userChoice(level, onRight, onWrong);

  }

}

async function start() {
  instructions.style.display = "none";
  game.style.display = "flex";
  status.style.display = "block";

  // get the game data from the server
  const data = await getGameData();

  // run the game loop
  const state = {
    'levels': data,
    'lives': 3,
    'turn': 1
  }
  console.log(state);
  runGame(state);
}