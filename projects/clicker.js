// Load game progress from local storage or set default values
let points = localStorage.getItem("points") ? parseInt(localStorage.getItem("points")) : 0;
let pointsPerClick = localStorage.getItem("pointsPerClick") ? parseInt(localStorage.getItem("pointsPerClick")) : 1;
let autoPoints = localStorage.getItem("autoPoints") ? parseInt(localStorage.getItem("autoPoints")) : 0;
let upgrade1Cost = localStorage.getItem("upgrade1Cost") ? parseInt(localStorage.getItem("upgrade1Cost")) : 10;
let upgrade2Cost = localStorage.getItem("upgrade2Cost") ? parseInt(localStorage.getItem("upgrade2Cost")) : 100;

const scoreDisplay = document.getElementById("score");
const pointsPerClickDisplay = document.getElementById("points-per-click");
const clickerButton = document.getElementById("clicker-btn");
const upgrade1Btn = document.getElementById("upgrade-1-btn");
const upgrade2Btn = document.getElementById("upgrade-2-btn");
const upgrade1CostDisplay = document.getElementById("upgrade-1-cost");
const upgrade2CostDisplay = document.getElementById("upgrade-2-cost");

const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");

// Save the game data into local storage
function updateScore() {
    scoreDisplay.textContent = `Points: ${points}`;
    localStorage.setItem("points", points);
    localStorage.setItem("pointsPerClick", pointsPerClick);
    localStorage.setItem("autoPoints", autoPoints);
    localStorage.setItem("upgrade1Cost", upgrade1Cost);
    localStorage.setItem("upgrade2Cost", upgrade2Cost);
}

// Handle clicker button click
clickerButton.addEventListener("click", () => {
    points += pointsPerClick;
    updateScore();
});

// Handle buying upgrade 1
upgrade1Btn.addEventListener("click", () => {
    if (points >= upgrade1Cost) {
        points -= upgrade1Cost;
        pointsPerClick++;
        upgrade1Cost = Math.floor(upgrade1Cost * (1 + Math.random() * 3));  // Increase cost by 200% to 500%
        updateScore();
        upgrade1CostDisplay.textContent = upgrade1Cost;
    } else {
        alert("Not enough points!");
    }
});

// Handle buying upgrade 2
upgrade2Btn.addEventListener("click", () => {
    if (points >= upgrade2Cost) {
        points -= upgrade2Cost;
        autoPoints++;
        upgrade2Cost = Math.floor(upgrade2Cost * (1 + Math.random() * 3));  // Increase cost by 200% to 500%
        updateScore();
        upgrade2CostDisplay.textContent = upgrade2Cost;

        // Start automatic points addition every 1-3 seconds
        startAutoPoints();
    } else {
        alert("Not enough points!");
    }
});

// Start adding points randomly every 1-3 seconds
function startAutoPoints() {
    setInterval(() => {
        points += 1;  // Add 1 point
        updateScore();  // Update the displayed score
    }, Math.random() * (3000 - 1000) + 1000);  // Random interval between 1 and 3 seconds
}

// Save progress
saveBtn.addEventListener("click", () => {
    localStorage.setItem("points", points);
    localStorage.setItem("pointsPerClick", pointsPerClick);
    localStorage.setItem("autoPoints", autoPoints);
    localStorage.setItem("upgrade1Cost", upgrade1Cost);
    localStorage.setItem("upgrade2Cost", upgrade2Cost);
    alert("Progress saved!");
});

// Reset game
resetBtn.addEventListener("click", () => {
    localStorage.clear();
    points = 0;
    pointsPerClick = 1;
    autoPoints = 0;
    upgrade1Cost = 10;
    upgrade2Cost = 100;
    updateScore();
    alert("Game reset!");
});

// Initial score display
updateScore();

// Copy code to clipboard
document.getElementById('view-code-btn').addEventListener('click', () => {
    window.location.href = '/projects/clicker.txt'; // Redirect to the txt file containing all the code
});
