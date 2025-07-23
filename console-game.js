(function () {
  const GAME_KEY = "consoleGameLeaderboard";
  const PLAYER_KEY = "consoleGamePlayer";

  const actions = [
    "🗡️ Fight monsters",
    "🎒 Collect loot",
    "❤️ Rest at camp",
    "🧭 Explore unknown lands",
    "🔥 Upgrade skills"
  ];

  let player = JSON.parse(localStorage.getItem(PLAYER_KEY));
  if (!player) {
    const name = prompt("🎮 Enter your player name:");
    player = {
      name: name || "Anonymous",
      score: 0,
      level: 1,
      xp: 0
    };
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
    console.log(`👋 Welcome, ${player.name}!`);
  } else {
    console.log(`🔄 Welcome back, ${player.name}!`);
  }

  const leaderboard = JSON.parse(localStorage.getItem(GAME_KEY)) || [];

  function saveLeaderboard() {
    const index = leaderboard.findIndex(p => p.name === player.name);
    if (index !== -1) leaderboard[index] = player;
    else leaderboard.push(player);
    localStorage.setItem(GAME_KEY, JSON.stringify(leaderboard));
  }

  function printLeaderboard() {
    console.log("🏆 Leaderboard:");
    leaderboard
      .sort((a, b) => b.score - a.score)
      .forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} — Score: ${p.score}, Level: ${p.level}`);
      });
  }

  function randomAction() {
    const action = actions[Math.floor(Math.random() * actions.length)];
    let xpGain = Math.floor(Math.random() * 10) + 5;
    player.xp += xpGain;
    player.score += xpGain;

    if (player.xp >= player.level * 50) {
      player.level++;
      player.xp = 0;
      console.log(`🎉 Level up! You're now level ${player.level}!`);
    }

    console.log(`➡️ ${action} (+${xpGain} XP) — Total Score: ${player.score}`);
    saveLeaderboard();
  }

  function gameLoop() {
    randomAction();
    setTimeout(gameLoop, 5000); // 5 seconds loop
  }

  window.consoleGame = {
   start: (clearConsole = false) => {
  if (clearConsole) console.clear();
  console.log("🕹️ Console Game Started");
  printLeaderboard();
  gameLoop();
},
    leaderboard: printLeaderboard,
    reset: () => {
      localStorage.removeItem(PLAYER_KEY);
      console.log("🔄 Player reset. Refresh the page to start again.");
    }
  };
})();
