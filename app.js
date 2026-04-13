const STORAGE_KEY = "peace-checkin-records";

const button = document.querySelector("#checkin-button");
const message = document.querySelector("#message");
const statusPill = document.querySelector("#status-pill");
const todayLabel = document.querySelector("#today-label");
const lastCheckin = document.querySelector("#last-checkin");
const historyList = document.querySelector("#history-list");
const canvas = document.querySelector("#fireworks");
const ctx = canvas.getContext("2d");

let particles = [];
let animationFrame = null;

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFullDate(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function formatTime(isoString) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getPastDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return date;
  });
}

function renderHistory(records) {
  historyList.innerHTML = "";

  getPastDays(7).forEach((date) => {
    const key = todayKey(date);
    const checked = Boolean(records[key]);
    const cell = document.createElement("div");
    cell.className = `day-cell${checked ? " checked" : ""}`;
    cell.setAttribute("aria-label", `${formatFullDate(date)}${checked ? "已平安" : "未记录"}`);

    const name = document.createElement("span");
    name.className = "day-name";
    name.textContent = new Intl.DateTimeFormat("zh-CN", {
      weekday: "short",
    }).format(date);

    const mark = document.createElement("span");
    mark.className = "day-mark";
    mark.setAttribute("aria-hidden", "true");

    cell.append(name, mark);
    historyList.append(cell);
  });
}

function renderState() {
  const records = loadRecords();
  const checkedAt = records[todayKey()];

  todayLabel.textContent = formatFullDate();
  renderHistory(records);

  if (checkedAt) {
    button.textContent = "今日已平安";
    button.classList.add("done");
    statusPill.textContent = "今天已报平安";
    statusPill.classList.add("done");
    message.textContent = "我知道你今天一切都好。";
    lastCheckin.textContent = `今天 ${formatTime(checkedAt)} 已报平安`;
    return;
  }

  button.textContent = "我今天平安";
  button.classList.remove("done");
  statusPill.textContent = "等待报平安";
  statusPill.classList.remove("done");
  message.textContent = "点完我就知道你今天一切都好。";
  lastCheckin.textContent = "";
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function makeBurst(x, y) {
  const colors = ["#2d6a4f", "#e9b44c", "#cf5c6c", "#3f88c5", "#f7f7f0"];
  const burst = Array.from({ length: 90 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 70 + Math.random() * 28,
      age: 0,
      size: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });
  particles = particles.concat(burst);
}

function animateFireworks() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.035,
      vx: p.vx * 0.99,
      age: p.age + 1,
    }))
    .filter((p) => p.age < p.life);

  particles.forEach((p) => {
    const alpha = 1 - p.age / p.life;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;

  if (particles.length > 0) {
    animationFrame = requestAnimationFrame(animateFireworks);
  } else {
    animationFrame = null;
  }
}

function celebrate() {
  resizeCanvas();
  const width = window.innerWidth;
  const height = window.innerHeight;

  makeBurst(width * 0.5, height * 0.34);
  setTimeout(() => makeBurst(width * 0.28, height * 0.42), 220);
  setTimeout(() => makeBurst(width * 0.72, height * 0.42), 420);

  if (!animationFrame) {
    animateFireworks();
  }
}

button.addEventListener("click", () => {
  const records = loadRecords();
  const key = todayKey();
  const firstCheckinToday = !records[key];

  records[key] = new Date().toISOString();
  saveRecords(records);
  renderState();
  celebrate();

  if (firstCheckinToday) {
    message.textContent = "今日已平安，佳琛可以放心了。";
  }
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
renderState();
