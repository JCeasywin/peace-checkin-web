const LOCAL_STORAGE_KEY = "peace-checkin-records";
const CONTACT_STORAGE_KEY = "peace-checkin-contact";
const STATUS_OK = "平安";

const config = window.PEACE_CHECKIN_CONFIG || {};
const params = new URLSearchParams(window.location.search);

const button = document.querySelector("#checkin-button");
const contactForm = document.querySelector("#contact-form");
const senderInput = document.querySelector("#sender-input");
const receiverInput = document.querySelector("#receiver-input");
const senderName = document.querySelector("#sender-name");
const receiverName = document.querySelector("#receiver-name");
const message = document.querySelector("#message");
const statusPill = document.querySelector("#status-pill");
const todayLabel = document.querySelector("#today-label");
const lastCheckin = document.querySelector("#last-checkin");
const historyList = document.querySelector("#history-list");
const successCard = document.querySelector("#success-card");
const successTime = document.querySelector("#success-time");
const successReceiver = document.querySelector("#success-receiver");
const successStatus = document.querySelector("#success-status");
const setupNote = document.querySelector("#setup-note");
const canvas = document.querySelector("#fireworks");
const ctx = canvas.getContext("2d");

let particles = [];
let animationFrame = null;
let contact = getInitialContact();
let records = {};
let isSaving = false;

const supabaseClient = getSupabaseClient();

function getInitialContact() {
  const saved = loadJson(CONTACT_STORAGE_KEY, {});
  const sender =
    params.get("sender") ||
    params.get("from") ||
    saved.sender ||
    config.defaultSender ||
    "爸爸";
  const receiver =
    params.get("receiver") ||
    params.get("to") ||
    saved.receiver ||
    config.defaultReceiver ||
    "佳琛";
  const familyKey =
    params.get("family") ||
    saved.familyKey ||
    config.defaultFamilyKey ||
    "default-family";

  return {
    sender: normalizeName(sender),
    receiver: normalizeName(receiver),
    familyKey: normalizeName(familyKey),
  };
}

function getSupabaseClient() {
  const hasConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);

  if (!hasConfig || !window.supabase) {
    return null;
  }

  return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
}

function normalizeName(value) {
  return String(value || "").trim();
}

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

function formatDateTime(isoString) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getLocalRecordKey() {
  return `${contact.familyKey}:${contact.sender}:${contact.receiver}`;
}

function loadLocalRecords() {
  const allRecords = loadJson(LOCAL_STORAGE_KEY, {});
  return allRecords[getLocalRecordKey()] || {};
}

function saveLocalRecords(nextRecords) {
  const allRecords = loadJson(LOCAL_STORAGE_KEY, {});
  allRecords[getLocalRecordKey()] = nextRecords;
  saveJson(LOCAL_STORAGE_KEY, allRecords);
}

function mapSupabaseRows(rows) {
  return rows.reduce((nextRecords, row) => {
    nextRecords[row.checkin_date] = {
      checkedAt: row.checked_at,
      receiver: row.receiver_name,
      sender: row.sender_name,
      status: row.status || STATUS_OK,
    };
    return nextRecords;
  }, {});
}

async function fetchRecords() {
  if (!supabaseClient) {
    showSetupNote("当前是本机演示模式：配置 Supabase 后，记录才会跨设备同步。");
    return loadLocalRecords();
  }

  const { data, error } = await supabaseClient
    .from(config.tableName || "peace_checkins")
    .select("checkin_date, checked_at, receiver_name, sender_name, status")
    .eq("family_key", contact.familyKey)
    .eq("sender_name", contact.sender)
    .eq("receiver_name", contact.receiver)
    .order("checkin_date", { ascending: true });

  if (error) {
    throw error;
  }

  hideSetupNote();
  return mapSupabaseRows(data || []);
}

async function saveCheckin() {
  const checkedAt = new Date().toISOString();
  const date = todayKey();
  const row = {
    family_key: contact.familyKey,
    sender_name: contact.sender,
    receiver_name: contact.receiver,
    checkin_date: date,
    status: STATUS_OK,
    checked_at: checkedAt,
    updated_at: checkedAt,
  };

  if (!supabaseClient) {
    const nextRecords = {
      ...records,
      [date]: {
        checkedAt,
        receiver: contact.receiver,
        sender: contact.sender,
        status: STATUS_OK,
      },
    };
    saveLocalRecords(nextRecords);
    return nextRecords;
  }

  const { data, error } = await supabaseClient
    .from(config.tableName || "peace_checkins")
    .upsert(row, {
      onConflict: "family_key,sender_name,receiver_name,checkin_date",
    })
    .select("checkin_date, checked_at, receiver_name, sender_name, status")
    .single();

  if (error) {
    throw error;
  }

  return {
    ...records,
    [data.checkin_date]: {
      checkedAt: data.checked_at,
      receiver: data.receiver_name,
      sender: data.sender_name,
      status: data.status || STATUS_OK,
    },
  };
}

function getPastDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return date;
  });
}

function renderContact() {
  senderInput.value = contact.sender;
  receiverInput.value = contact.receiver;
  senderName.textContent = contact.sender;
  receiverName.textContent = contact.receiver;
  button.textContent = `${contact.sender}今天平安`;
}

function renderHistory(nextRecords) {
  historyList.innerHTML = "";

  getPastDays(7).forEach((date) => {
    const key = todayKey(date);
    const record = nextRecords[key];
    const checked = Boolean(record);
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

    const state = document.createElement("span");
    state.className = "day-state";
    state.textContent = checked ? "平安" : "未记";

    cell.append(name, mark, state);
    historyList.append(cell);
  });
}

function renderSuccessCard(record) {
  if (!record) {
    successCard.hidden = true;
    return;
  }

  successTime.textContent = formatDateTime(record.checkedAt);
  successReceiver.textContent = record.receiver;
  successStatus.textContent = record.status;
  successCard.hidden = false;
}

function renderState() {
  const checked = records[todayKey()];

  todayLabel.textContent = formatFullDate();
  renderContact();
  renderHistory(records);
  renderSuccessCard(checked);

  if (checked) {
    button.textContent = "今日已平安";
    button.classList.add("done");
    statusPill.textContent = "今天已报平安";
    statusPill.classList.add("done");
    message.textContent = `${contact.receiver}已经能看到${contact.sender}今天平安。`;
    lastCheckin.textContent = `今天 ${formatTime(checked.checkedAt)} 已报平安`;
    return;
  }

  button.classList.remove("done");
  statusPill.textContent = "等待报平安";
  statusPill.classList.remove("done");
  message.textContent = `点完以后，${contact.receiver}就能跨设备看到今日状态。`;
  lastCheckin.textContent = "";
}

function showSetupNote(text) {
  setupNote.textContent = text;
  setupNote.hidden = false;
}

function hideSetupNote() {
  setupNote.hidden = true;
}

function showError(error) {
  const details = error?.message ? `：${error.message}` : "";
  showSetupNote(`云端同步失败${details}`);
}

async function refreshRecords() {
  statusPill.textContent = "正在读取记录";

  try {
    records = await fetchRecords();
  } catch (error) {
    records = loadLocalRecords();
    showError(error);
  }

  renderState();
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

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  contact = {
    ...contact,
    sender: normalizeName(senderInput.value) || contact.sender,
    receiver: normalizeName(receiverInput.value) || contact.receiver,
  };
  saveJson(CONTACT_STORAGE_KEY, contact);
  await refreshRecords();
});

button.addEventListener("click", async () => {
  if (isSaving) {
    return;
  }

  isSaving = true;
  button.disabled = true;
  button.textContent = "正在同步";

  try {
    const firstCheckinToday = !records[todayKey()];
    records = await saveCheckin();
    renderState();
    celebrate();

    if (firstCheckinToday) {
      message.textContent = `今日已平安，${contact.receiver}可以放心了。`;
    }
  } catch (error) {
    renderState();
    showError(error);
  } finally {
    isSaving = false;
    button.disabled = false;
  }
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
refreshRecords();
