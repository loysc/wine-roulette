const API_URL = "https://ponvjkyegckzqekslezz.supabase.co";
const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbnZqa3llZ2NrenFla3NsZXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODE0NDMsImV4cCI6MjA2NTA1NzQ0M30.ju-EJ-jG_boueVJG_BwwLnSLvfZdJiISsON8qyKLFzQ";

const supabase = window.supabase.createClient(API_URL, API_KEY);

const modal = document.getElementById("nameModal");
const resetModal = document.getElementById("resetModal");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("nameInput");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");
const slot1 = document.getElementById("slot1");
const slot2 = document.getElementById("slot2");
const slot3 = document.getElementById("slot3");
const table = document.querySelector("#resultsTable tbody");
const resetBtn = document.getElementById("resetBtn");
const confirmReset = document.getElementById("confirmReset");
const closeResetModal = document.getElementById("closeResetModal");
const drunkModal = document.getElementById("drunkModal");

let userName = "";
let fireworks = null;

function showResetModal() {
  resetModal.classList.remove("hidden");
}

resetBtn.addEventListener("click", showResetModal);

confirmReset.addEventListener("click", async () => {
  const { error } = await supabase.from("wine_roulette").delete().neq("id", 0);
  if (error) {
    document.getElementById("resetStatus").innerText =
      "Erreur lors de la réinitialisation.";
  } else {
    document.getElementById("resetStatus").innerText = "Réinitialisé !";
    fetchData();
  }
});

async function fetchData() {
  const { data, error } = await supabase
    .from("wine_roulette")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    table.innerHTML = "<tr><td colspan='5'>Erreur de chargement</td></tr>";
    return;
  }
  table.innerHTML = "";
  data.forEach(({ name, color, region, grape, created_at }) => {
    let row = document.createElement("tr");
    row.innerHTML = `<td>${name}</td><td>${color}</td><td>${region}</td><td>${grape}</td><td>${formatDate(
      created_at
    )}</td>`;
    table.appendChild(row);
  });
}

startBtn.addEventListener("click", () => {
  console.log("Bouton Entrer cliqué");
  const name = nameInput.value.trim();
  if (!name) return alert("Entre ton prénom !");
  userName = name.toLowerCase();
  localStorage.setItem("usernameDisplay", name);
  modal.classList.add("hidden");
  document.querySelector(".container").classList.remove("hidden");
  fetchData();
});

function launchRealFireworks() {
  // Effet confetti plein écran, plusieurs salves pour un effet "WOW"
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 80 * (timeLeft / duration);
    // deux salves opposées
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250);
}

const combos = [
  ["Rouge", "Bourgogne", "Pinot Noir"],
  ["Rouge", "Beaujolais", "Gamay"],
  ["Rouge", "Bordeaux", "Merlot"],
  ["Rouge", "Loire", "Cabernet Franc"],
  ["Rouge", "Rhône Nord", "Syrah"],
  ["Rouge", "Rhône Sud", "Grenache"],
  ["Rouge", "Sud-Ouest", "Malbec"],
  ["Rouge", "Corse", "Niellucciu"],
  ["Blanc", "Bourgogne", "Chardonnay"],
  ["Blanc", "Alsace", "Riesling"],
  ["Blanc", "Loire", "Chenin"],
  ["Blanc", "Rhône Nord", "Viognier"],
  ["Blanc", "Sud-Ouest", "Gros Manseng"],
];

// Shuffle combos to randomize the order of assignment
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffleArray(combos);

spinBtn.addEventListener("click", async () => {
  // Récupère les tirages existants
  const { data: tirages, error } = await supabase
    .from("wine_roulette")
    .select("color,region,grape");
  if (error) {
    console.error(error);
    result.innerHTML = "<br>⚠️ Erreur lors de la récupération des tirages";
    return;
  }
  // Limite à 12 tirages
  if (tirages.length >= 12) {
    drunkModal.classList.remove("hidden");
    spinBtn.disabled = false;
    return;
  }

  const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
    row.cells[0].textContent.toLowerCase()
  );
  if (rows.includes(userName)) {
    result.innerHTML = "Tu as déjà tiré ta bouteille 🍷";
    result.classList.remove("hidden");
    return;
  }

  // Récupère les combos déjà utilisés
  const usedCombos = tirages.map((t) => `${t.color}${t.region}${t.grape}`);

  // Trouve le prochain combo disponible
  const availableCombo = combos.find(
    ([c, r, g]) => !usedCombos.includes(`${c}${r}${g}`)
  );
  if (!availableCombo) {
    result.innerHTML = "Toutes les bouteilles ont été attribuées 🎉";
    result.classList.remove("hidden");
    return;
  }

  const [color, region, grape] = availableCombo;

  spinBtn.disabled = true;
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  for (let i = 0; i < 15; i++) {
    slot1.textContent = i % 2 === 0 ? "Rouge" : "Blanc";
    await delay(50);
  }
  slot1.textContent = color;

  for (let i = 0; i < 15; i++) {
    slot2.textContent = combos[Math.floor(Math.random() * combos.length)][1];
    await delay(50);
  }
  slot2.textContent = region;

  for (let i = 0; i < 15; i++) {
    slot3.textContent = combos[Math.floor(Math.random() * combos.length)][2];
    await delay(50);
  }
  slot3.textContent = grape;

  result.innerHTML = `🎉 ${localStorage.getItem(
    "usernameDisplay"
  )}, tu dois ramener un vin ${color} de ${region}, cépage ${grape} !`;
  result.classList.remove("hidden");

  try {
    console.log("Envoi des données au serveur...");
    const { error } = await supabase.from("wine_roulette").insert([
      {
        name: localStorage.getItem("usernameDisplay"),
        color,
        region,
        grape,
      },
    ]);
    if (error) {
      console.error(error);
      result.innerHTML += "<br>⚠️ Erreur lors de l'enregistrement des données";
      spinBtn.disabled = false;
      return;
    }

    launchRealFireworks();
    fetchData();
  } catch (error) {
    console.error("Erreur lors de l'envoi des données:", error);
    result.innerHTML += "<br>⚠️ Erreur lors de l'enregistrement des données";
  }

  spinBtn.disabled = false;
});

function formatDate(dateString) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month} ${hours}:${minutes}`;
}

if (closeResetModal) {
  closeResetModal.addEventListener("click", () => {
    resetModal.classList.add("hidden");
  });
}
