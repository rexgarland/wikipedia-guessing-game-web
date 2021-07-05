const seed = document.getElementById("seed");
const seedNum = document.getElementById("seed-num").innerHTML;

const status = document.getElementById("status");
const turnNum = document.getElementById("turn-num");
const livesNum = document.getElementById("lives-num");

const instructions = document.getElementById("instructions");

const game = document.getElementById("game");
const sentence = document.getElementById("sentence");
const choices = document.getElementById("choices");


async function getGameData() {
  const data = await fetch(`/data/${seedNum}`).then(res => res.json());
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

const GREEN = "#ccf9b7";
const RED = "#f7c3c3";

let timer;

const delay = fn => {
  timer = setTimeout(() => {
    fn()
    clearTimeout(timer);
  }, 1000);
}

const animateCorrect = li => callback => {
  return () => {
    li.style.background = GREEN;
    delay(callback);
  }
}

const animateIncorrect = liCorrect => li => callback => {
  return () => {
    liCorrect.style.background = GREEN;
    li.style.background = RED;
    delay(callback);
  }
}

function userChoice(levelData, onRight, onWrong) {
  let correctChoice;
  const choiceItems = shuffle(levelData.urls).map(url => {
    const li = document.createElement('li');
    li.className = "choice";
    li.innerHTML = `<div class="choice-text">${url}</div>`
    li.dataset.URL = url;
    if (url==levelData.answer) {
      correctChoice = li;
    }
    return li;
  });
  correctChoice.onclick = animateCorrect(correctChoice)(onRight);
  choiceItems.forEach(li => {
    choices.appendChild(li);
    if (li!==correctChoice) {
      li.onclick = animateIncorrect(correctChoice)(li)(onWrong);
    }
  });
}

function stepGame(state) {
  // start with a blank slate
  sentence.innerHTML = '';
  choices.innerHTML = '';

  // update status bar
  turnNum.innerHTML = `${state.turn}`;
  livesNum.innerHTML = `${state.lives}`;

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

    // populate the turn
    const level = state.levels[0];
    sentence.innerHTML = level.sentence;

    const onRight = () => stepGame({
      ...state,
      turn: state.turn+1,
      levels: state.levels.slice(1)
    });

    const onWrong = () => stepGame({
      ...state,
      lives: state.lives-1,
      turn: state.turn+1,
      levels: state.levels.slice(1)
    });

    userChoice(level, onRight, onWrong);

  }

}

async function start() {
  seed.style.display = "block";
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
  stepGame(state);
}