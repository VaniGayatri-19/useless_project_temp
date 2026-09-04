// STARFIELD

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const stars = Array.from({ length: 170 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  radius: Math.random() * 1.2 + 0.2,
  speed: Math.random() * 0.18 + 0.02
}));

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#F2F0FA";
  stars.forEach(star => {
    ctx.globalAlpha = Math.random() * 0.5 + 0.3;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
    star.y += star.speed;
    if (star.y > canvas.height) star.y = 0;
  });
  requestAnimationFrame(drawStars);
}
drawStars();

// ELEMENTS

const hero = document.getElementById("hero");
const splitBtn = document.getElementById("splitBtn");
const decisionInput = document.getElementById("decision");
const transition = document.getElementById("transition");
const transitionText = document.getElementById("transitionText");
const centralPortal = document.getElementById("centralPortal");
const portalA = document.getElementById("portalA");
const portalB = document.getElementById("portalB");
const portalC = document.getElementById("portalC");
const decisionDisplay = document.getElementById("decisionDisplay");
const results = document.getElementById("results");
const resultDecision = document.getElementById("resultDecision");
const againBtn = document.getElementById("againBtn");
const battleBars = document.getElementById("battleBars");
const battleWinner = document.getElementById("battleWinner");
const battleVerdict = document.getElementById("battleVerdict");

// EVENTS

splitBtn.addEventListener("click", splitReality);

decisionInput.addEventListener("keydown", event => {
  if (event.key === "Enter") splitReality();
});

// MAIN FUNCTION

let isGenerating = false;

async function splitReality() {

  if (isGenerating) return;

  const decision = decisionInput.value.trim();

  if (!decision) {
    decisionInput.focus();
    decisionInput.style.borderColor = "#E93FD1";
    setTimeout(() => {
      decisionInput.style.borderColor = "rgba(255,255,255,0.13)";
    }, 1000);
    return;
  }

  isGenerating = true;
  splitBtn.disabled = true;

  decisionDisplay.textContent = `"${decision}"`;
  resultDecision.textContent = "Generating your realities...";

  resetRealityCardsToLoading();
  resetBattleToLoading();

  hero.style.opacity = "0.12";
  hero.style.filter = "blur(8px)";
  hero.style.transform = "scale(0.96)";

  transition.classList.remove("hidden");
  resetPortals();
  startPortalSequence();

  const minAnimationTime = new Promise(resolve => setTimeout(resolve, 9000));

  let realities = null;
  let errorMessage = null;

  try {
    const response = await fetch("/api/split", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed (${response.status})`);
    }

    realities = await response.json();
    console.log("AI realities:", realities);

  } catch (error) {
    console.error("Generation error:", error);
    errorMessage = error.message;
  }

  await minAnimationTime;

  if (realities) {
    updateRealityCards(realities);
    updateBattle(realities);
    resultDecision.textContent = `Your decision: "${decision}"`;
  } else {
    setRealityCardsToError();
    setBattleToError();
    resultDecision.textContent = "⚠️ " + errorMessage;
  }

  finishTransition();

  isGenerating = false;
  splitBtn.disabled = false;
  splitBtn.innerHTML = `<span>🔮</span> SPLIT MY REALITY`;
}

// LOADING / ERROR STATES — CARDS

function resetRealityCardsToLoading() {
  [".card-a", ".card-b", ".card-c"].forEach(selector => {
    const card = document.querySelector(selector);
    card.querySelector("h3").textContent = "Generating...";
    card.querySelector(".card-description").textContent = "Consulting the multiverse...";
    card.querySelectorAll(".timeline-mini div p").forEach(p => p.textContent = "...");
    card.querySelectorAll(".stat-fill").forEach(bar => bar.style.width = "0%");
  });
}

function setRealityCardsToError() {
  [".card-a", ".card-b", ".card-c"].forEach(selector => {
    const card = document.querySelector(selector);
    card.querySelector("h3").textContent = "Generation failed";
    card.querySelector(".card-description").textContent =
      "Couldn't reach the multiverse this time — try again in a moment.";
    card.querySelectorAll(".timeline-mini div p").forEach(p => p.textContent = "—");
    card.querySelectorAll(".stat-fill").forEach(bar => bar.style.width = "0%");
  });
}

// LOADING / ERROR STATES — BATTLE

function resetBattleToLoading() {
  battleBars.innerHTML = "";
  battleWinner.textContent = "Calculating...";
  battleVerdict.textContent = "";
}

function setBattleToError() {
  battleBars.innerHTML = "";
  battleWinner.textContent = "Battle unavailable";
  battleVerdict.textContent = "Couldn't determine a winner this time.";
}

// PORTAL ANIMATION

function resetPortals() {
  centralPortal.classList.remove("active");
  portalA.classList.remove("active");
  portalB.classList.remove("active");
  portalC.classList.remove("active");
}

function startPortalSequence() {

  transitionText.textContent = "DECISION LOCKED";

  setTimeout(() => {
    transitionText.textContent = "QUANTUM BRANCH DETECTED...";
    centralPortal.classList.add("active");
  }, 1300);

  setTimeout(() => {
    transitionText.textContent = "SEARCHING ALTERNATE TIMELINES...";
  }, 3000);

  setTimeout(() => {
    transitionText.textContent = "CREATING ALTERNATE SELVES...";
  }, 4500);

  setTimeout(() => portalA.classList.add("active"), 5500);
  setTimeout(() => portalB.classList.add("active"), 6200);
  setTimeout(() => portalC.classList.add("active"), 6900);

  setTimeout(() => {
    transitionText.textContent = "3 REALITIES FOUND.";
  }, 7900);
}

function finishTransition() {
  transition.classList.add("hidden");

  setTimeout(() => {
    hero.style.display = "none";
    results.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 700);
}

// SPLIT ANOTHER REALITY

againBtn.addEventListener("click", () => {
  results.classList.add("hidden");
  hero.style.display = "flex";
  hero.style.opacity = "1";
  hero.style.filter = "blur(0)";
  hero.style.transform = "scale(1)";
  decisionInput.value = "";
  decisionInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// UPDATE CARDS WITH AI RESULTS

function updateRealityCards(data) {
  fillCard(".card-a", data.realityA);
  fillCard(".card-b", data.realityB);
  fillCard(".card-c", data.realityC);
}

function fillCard(selector, reality) {

  const card = document.querySelector(selector);

  card.querySelector("h3").textContent = reality.title;
  card.querySelector(".card-description").textContent = reality.description;

  const timeline = card.querySelectorAll(".timeline-mini div p");
  timeline[0].textContent = reality.now;
  timeline[1].textContent = reality.twoYears;
  timeline[2].textContent = reality.fiveYears;

  setTimeout(() => {
    card.querySelector(".stat-happiness").style.width = clampPercent(reality.happiness) + "%";
    card.querySelector(".stat-wealth").style.width = clampPercent(reality.wealth) + "%";
    card.querySelector(".stat-stress").style.width = clampPercent(reality.stress) + "%";
    card.querySelector(".stat-chaos").style.width = clampPercent(reality.chaos) + "%";
  }, 100);
}

function clampPercent(value) {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

// UNIVERSE BATTLE

function updateBattle(data) {

  const realities = { A: data.realityA, B: data.realityB, C: data.realityC };

  battleBars.innerHTML = "";

  ["A", "B", "C"].forEach(letter => {

    const reality = realities[letter];

    const overallScore = Math.round(
      (reality.happiness + reality.wealth + (100 - reality.stress) + (reality.chaos * 0.3)) / 3.3
    );

    const item = document.createElement("div");
    item.className = "battle-bar-item";

    item.innerHTML = `
      <div class="battle-label">
        <span>REALITY ${letter}</span>
        <span class="battle-score">${clampPercent(overallScore)}</span>
      </div>
      <div class="stat-bar">
        <div class="stat-fill stat-happiness" style="width: 0%"></div>
      </div>
    `;

    battleBars.appendChild(item);

    setTimeout(() => {
      item.querySelector(".stat-fill").style.width = clampPercent(overallScore) + "%";
    }, 100);
  });

  const winnerLetter = (data.battle && data.battle.winner) ? data.battle.winner.toUpperCase() : "A";
  const winnerTitle = realities[winnerLetter]?.title || "Unknown";

  battleWinner.textContent = `REALITY ${winnerLetter} WINS — "${winnerTitle}"`;
  battleVerdict.textContent = (data.battle && data.battle.verdict)
    ? data.battle.verdict
    : "The multiverse has spoken.";
}