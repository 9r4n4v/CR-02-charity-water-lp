const playfield = document.getElementById("playfield");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const livesEl = document.getElementById("lives");
const msgEl = document.getElementById("message");

const startOverlay = document.getElementById("startOverlay");
const endOverlay = document.getElementById("endOverlay");
const startBtn = document.getElementById("startBtn");
const replayBtn = document.getElementById("replayBtn");
const endTitle = document.getElementById("endTitle");
const endSummary = document.getElementById("endSummary");

const GAME_SECONDS = 30;
const START_LIVES = 3;


const CAN_IMG_SRC = "img/water-can-transparent.png";

let score = 0;
let timeLeft = GAME_SECONDS;
let lives = START_LIVES;
let running = false;
let spawnTimer = null;
let countdownTimer = null;

function setMessage(t) { msgEl.textContent = t; }
function updateHud() {
  scoreEl.textContent = String(score);
  timeEl.textContent = String(timeLeft);
  livesEl.textContent = String(lives);
}
function clearDrops() { [...playfield.querySelectorAll(".drop")].forEach(d => d.remove()); }

function reset() {
  score = 0;
  timeLeft = GAME_SECONDS;
  lives = START_LIVES;
  updateHud();
  clearDrops();
  setMessage("Ready when you are.");
}

function endGame(reason) {
  running = false;
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  spawnTimer = null;
  countdownTimer = null;
  clearDrops();

  endTitle.textContent = reason === "lives" ? "Pollution got you!" : "Time’s up!";
  endSummary.textContent = `Final score: ${score}. Tap “Play Again” to try to beat it.`;
  endOverlay.classList.remove("hidden");
}

function award(delta, msg) {
  score = Math.max(0, score + delta);
  updateHud();
  if (msg) setMessage(msg);
}

function loseLife(msg) {
  lives -= 1;
  updateHud();
  setMessage(msg);
  if (lives <= 0) endGame("lives");
}

function randomType() {
  const r = Math.random();
  if (r < 0.06) return "can";   // ~6%
  if (r < 0.28) return "bad";   // ~22%
  return "good";                // ~72%
}

function spawn() {
  if (!running) return;

  const type = randomType();
  const el = document.createElement("div");
  el.className = `drop ${type}`;

  if (type === "good") {
    const span = document.createElement("span");
    span.textContent = "💧";
    el.appendChild(span);
  } else if (type === "bad") {
    const img = document.createElement("img");
    img.src = CAN_IMG_SRC;
    img.alt = "pollution";
    img.className = "drop-icon pollution";
    el.appendChild(img);
  } else {
    const img = document.createElement("img");
    img.src = CAN_IMG_SRC;
    img.alt = "bonus";
    img.className = "drop-icon bonus";
    el.appendChild(img);
  }

  el.style.left = `${Math.random() * 92}%`;
  const dur = (type === "can") ? (2.2 + Math.random()) : (1.8 + Math.random() * 1.8);
  el.style.animationDuration = `${dur.toFixed(2)}s`;

  let clicked = false;

  function cleanup() {
    el.removeEventListener("pointerdown", hit);
    el.removeEventListener("animationend", miss);
    el.remove();
  }

  function hit(e) {
    e.preventDefault();
    if (!running || clicked) return;
    clicked = true;

    if (type === "good") award(10, "+10 clean drop!");
    if (type === "can") award(50, "+50 bonus can!");
    if (type === "bad") {
      award(-15, "-15 pollution!");
      loseLife("Lost a life from pollution.");
    }

    cleanup();
  }

  function miss() {
    if (!running || clicked) return;
    // punish only for missing clean drops
    if (type === "good") loseLife("Missed a clean drop.");
    cleanup();
  }

  el.addEventListener("pointerdown", hit, { passive: false });
  el.addEventListener("animationend", miss);
  playfield.appendChild(el);
}

function start() {
  reset();
  running = true;
  startOverlay.classList.add("hidden");
  endOverlay.classList.add("hidden");
  setMessage("Go! Collect clean drops.");

  spawnTimer = setInterval(() => {
    spawn();
    if (timeLeft <= 15 && Math.random() < 0.25) spawn();
    if (timeLeft <= 7 && Math.random() < 0.35) spawn();
  }, 550);

  countdownTimer = setInterval(() => {
    if (!running) return;
    timeLeft -= 1;
    updateHud();
    if (timeLeft <= 0) endGame("time");
  }, 1000);
}


function bindStart(btn) {
  if (!btn) return;
  btn.addEventListener("click", start);
  btn.addEventListener(
    "pointerdown",
    (e) => {
      e.preventDefault();
      start();
    },
    { passive: false }
  );
}

bindStart(startBtn);
bindStart(replayBtn);

reset();
