const badSound = new Audio("sounds/bad.wav");
const goodSound = new Audio("sounds/good.wav");
const nextSound = new Audio("sounds/next.wav");
const gameOverSound = new Audio("sounds/gameover.wav");
const GAME_TIME = 30000; // 30 seconds


const timerElement = document.getElementById("timer");
const timerBar = document.getElementById("timerBar");

// Auto image swap
const AUTO_SWAP_INTERVAL = 5000; // milliseconds
let autoSwapTimer;

const GAME_TIME = 30000; // 30 seconds
``
let score = 0;
let startTime;
let timeLeft = 30;
let timerInterval;
const timerElement = document.getElementById("timer");
let timeLeft = 30;
let timerInterval;
let timerBarInterval;
``

const grid = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const endScreen = document.getElementById("endScreen");
const finalScoreText = document.getElementById("finalScore");
const leaderboardElement = document.getElementById("leaderboard");

let images = [];
let cellTimers = {}; // track reaction times per cell

// preload images
function preloadImages() {
    const files = [
        "images/bad1.jpg",
        "images/bad2.jpg",
        "images/bad3.jpg",
        "images/good1.jpg",
        "images/good2.jpg",
        "images/good3.jpg"
    ];

    files.forEach(src => {
        images.push({
            src: src,
            bad: src.includes("bad")
        });
    });
}

function randomImage() {
    return images[Math.floor(Math.random() * images.length)];
}

function autoSwapImages() {
    autoSwapTimer = setInterval(() => {
        for (let i = 0; i < 9; i++) {
            loadCell("cell" + i);
        }
    }, AUTO_SWAP_INTERVAL);
}
function loadCell(cellId) {
    const imgData = randomImage();

    const cell = document.getElementById(cellId);
    const img = cell.querySelector("img");

    img.src = imgData.src;
    img.dataset.isBad = imgData.bad;

    cellTimers[cellId] = Date.now();
    nextSound.play();
}

function createGrid() {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.id = "cell" + i;

        const img = document.createElement("img");
        cell.appendChild(img);

        cell.onclick = () => handleCellClick(cell.id);

        grid.appendChild(cell);

        loadCell(cell.id);
    }
}

function handleCellClick(cellId) {
    const now = Date.now();
    const reaction = now - cellTimers[cellId];

    const cell = document.getElementById(cellId);
    const img = cell.querySelector("img");
    const isBad = img.dataset.isBad === "true";

    if (isBad) {
        let points = Math.max(0, 1000 - reaction);
        score += points;
        badSound.play();
    } else {
        goodSound.play();
    }

    scoreElement.textContent = "Score: " + score;

    // reload that single cell
    loadCell(cellId);
}

function startGame() {
    preloadImages();
    createGrid();

    score = 0;
    timeLeft = 30;

    timerElement.textContent = "Time Left: 30s";
    timerBar.style.width = "100%";

    startTime = Date.now();

    startTimer();
    autoSwapImages();   // <-- NEW
    setTimeout(endGame, GAME_TIME);
}


function endGame() {
    clearInterval(timerInterval);
    clearInterval(timerBarInterval);
    clearInterval(autoSwapTimer);

    gameOverSound.play();

    grid.classList.add("hidden");
    endScreen.classList.remove("hidden");

    finalScoreText.textContent = "Your score: " + score;

    showLeaderboard();
}
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = "Time Left: " + timeLeft + "s";

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);

    // Smooth bar animation (updates 20 times per second)
    let total = GAME_TIME;
    let elapsed = 0;

    timerBarInterval = setInterval(() => {
        elapsed += 50;
        let progress = Math.max(0, 1 - elapsed / total);
        timerBar.style.width = (progress * 100) + "%";

        if (elapsed >= total) {
            clearInterval(timerBarInterval);
        }
    }, 50);
}

function saveScore() {
    let name = document.getElementById("playerName").value;
    if (!name) return;

    let scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    scores.push({ name: name, score: score });

    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(scores));

    showLeaderboard();
}

function showLeaderboard() {
    let scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");

    leaderboardElement.innerHTML = "";
    scores.slice(0, 10).forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name} - ${s.score}`;
        leaderboardElement.appendChild(li);
    });
}

window.onload = startGame;