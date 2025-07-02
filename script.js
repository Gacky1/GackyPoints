/* === Esports Tournament Manager JS === */

// Dark mode toggle
const toggleBtn = document.getElementById("darkModeToggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

// Restore dark mode from localStorage
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

const gameSelect = document.getElementById("gameSelect");
const addRoundBtn = document.getElementById("addRoundBtn");
const roundNameInput = document.getElementById("roundName");
const matchCountInput = document.getElementById("matchCount");
const teamCountInput = document.getElementById("teamCount");
const teamInputsContainer = document.getElementById("teamInputs");
const generateTeamsBtn = document.getElementById("generateTeamsBtn");
const matchResultsContainer = document.getElementById("matchResultsContainer");
const calculateBtn = document.getElementById("calculateBtn");
const leaderboardTable = document.getElementById("leaderboardTable");
const exportImageBtn = document.getElementById("exportImageBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");

let teams = [];
let rounds = [];

// Predefined point systems
const pointSystems = {
  freefire: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0],
  bgmi: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0],
};

// Generate team inputs
generateTeamsBtn.addEventListener("click", () => {
  const count = parseInt(teamCountInput.value);
  if (!count || count < 2) return;
  teamInputsContainer.innerHTML = "";
  teams = [];
  for (let i = 0; i < count; i++) {
    const input = document.createElement("input");
    input.placeholder = `Team ${i + 1} Name`;
    input.dataset.index = i;
    input.required = true;
    input.addEventListener("input", () => {
      teams[i] = input.value.trim();
    });
    teamInputsContainer.appendChild(input);
  }
});

// Add a round with matches
addRoundBtn.addEventListener("click", () => {
  const roundName = roundNameInput.value.trim();
  const matchCount = parseInt(matchCountInput.value);
  if (!roundName || !matchCount || matchCount < 1) return;
  const round = {
    name: roundName,
    matches: []
  };

  for (let m = 0; m < matchCount; m++) {
    const match = {
      scores: Array(teams.length).fill(0)
    };
    round.matches.push(match);
  }

  rounds.push(round);
  renderMatchResults();
});

function renderMatchResults() {
  matchResultsContainer.innerHTML = "";
  rounds.forEach((round, rIndex) => {
    const roundDiv = document.createElement("div");
    roundDiv.innerHTML = `<h3>${round.name}</h3>`;

    round.matches.forEach((match, mIndex) => {
      const matchDiv = document.createElement("div");
      matchDiv.innerHTML = `<h4>Match ${mIndex + 1}</h4>`;
      teams.forEach((team, tIndex) => {
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = `${team} points`;

        if (gameSelect.value !== "manual") {
          const points = pointSystems[gameSelect.value][tIndex] || 0;
          input.value = points;
        }

        input.addEventListener("input", () => {
          rounds[rIndex].matches[mIndex].scores[tIndex] = parseInt(input.value || 0);
        });

        matchDiv.appendChild(input);
      });
      roundDiv.appendChild(matchDiv);
    });

    matchResultsContainer.appendChild(roundDiv);
  });
}

// Calculate and show leaderboard
calculateBtn.addEventListener("click", () => {
  const leaderboard = teams.map((team, index) => {
    let total = 0;
    rounds.forEach((round) => {
      round.matches.forEach((match) => {
        total += match.scores[index];
      });
    });
    return { name: team, points: total };
  });

  leaderboard.sort((a, b) => b.points - a.points);
  displayLeaderboard(leaderboard);
});

function displayLeaderboard(data) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  thead.innerHTML = `<tr><th>Rank</th><th>Team</th><th>Total Points</th></tr>`;
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  data.forEach((team, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${index + 1}</td><td>${team.name}</td><td>${team.points}</td>`;
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  leaderboardTable.innerHTML = "";
  leaderboardTable.appendChild(table);

  localStorage.setItem("leaderboard", JSON.stringify(data));
}

// Export as image
exportImageBtn.addEventListener("click", () => {
  html2canvas(leaderboardTable).then(canvas => {
    const link = document.createElement("a");
    link.download = "leaderboard.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

// Export as PDF
exportPdfBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Esports Leaderboard", 20, 20);
  html2canvas(leaderboardTable).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", 10, 30, 180, 100);
    doc.save("leaderboard.pdf");
  });
});