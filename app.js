const LOCAL_STORAGE_KEY = "peace-checkin-records";
const CONTACT_STORAGE_KEY = "peace-checkin-contact";
const CREATIVE_STORAGE_KEY = "peace-checkin-creative";
const STATUS_OK = "平安";
const DEFAULT_SENDER = "妈妈";
const DEFAULT_RECEIVER = "臭哄小榴莲";
const LEGACY_DEMO_SENDERS = new Set(["叶酱", "爸爸"]);
const LEGACY_DEMO_RECEIVERS = new Set(["佳琛"]);

const config = window.PEACE_CHECKIN_CONFIG || {};
const params = new URLSearchParams(window.location.search);

const button = document.querySelector("#checkin-button");
const contactForm = document.querySelector("#contact-form");
const senderInput = document.querySelector("#sender-input");
const receiverInput = document.querySelector("#receiver-input");
const senderName = document.querySelector("#sender-name");
const receiverName = document.querySelector("#receiver-name");
const creativeForm = document.querySelector("#creative-form");
const statusInput = document.querySelector("#status-input");
const styleSelect = document.querySelector("#style-select");
const moodInput = document.querySelector("#mood-input");
const detailsInput = document.querySelector("#details-input");
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
const beforeCopy = document.querySelector("#before-copy");
const generatedImage = document.querySelector("#generated-image");
const visualCard = document.querySelector("#visual-card");
const visualDate = document.querySelector("#visual-date");
const visualStatus = document.querySelector("#visual-status");
const visualLine = document.querySelector("#visual-line");
const visualStyle = document.querySelector("#visual-style");
const generationNote = document.querySelector("#generation-note");
const promptPreview = document.querySelector("#prompt-preview");
const shareCopy = document.querySelector("#share-copy");
const copyPromptButton = document.querySelector("#copy-prompt");
const copyShareButton = document.querySelector("#copy-share");
const canvas = document.querySelector("#fireworks");
const ctx = canvas.getContext("2d");

let particles = [];
let animationFrame = null;
let contact = getInitialContact();
let creative = getInitialCreative();
let records = {};
let isSaving = false;
let generatedImageUrl = "";
let isGeneratingImage = false;

const supabaseClient = getSupabaseClient();

function getInitialContact() {
  const saved = loadJson(CONTACT_STORAGE_KEY, {});
  const hasUrlSender = params.has("sender") || params.has("from");
  const hasUrlReceiver = params.has("receiver") || params.has("to");
  const savedSender = normalizeName(saved.sender);
  const savedReceiver = normalizeName(saved.receiver);
  const shouldMigrateLegacyContact =
    !hasUrlSender &&
    !hasUrlReceiver &&
    LEGACY_DEMO_SENDERS.has(savedSender) &&
    LEGACY_DEMO_RECEIVERS.has(savedReceiver);
  const sender =
    params.get("sender") ||
    params.get("from") ||
    (shouldMigrateLegacyContact ? DEFAULT_SENDER : saved.sender) ||
    config.defaultSender ||
    DEFAULT_SENDER;
  const receiver =
    params.get("receiver") ||
    params.get("to") ||
    (shouldMigrateLegacyContact ? DEFAULT_RECEIVER : saved.receiver) ||
    config.defaultReceiver ||
    DEFAULT_RECEIVER;
  const familyKey =
    params.get("family") ||
    saved.familyKey ||
    config.defaultFamilyKey ||
    "default-family";

  const nextContact = {
    sender: normalizeName(sender),
    receiver: normalizeName(receiver),
    familyKey: normalizeName(familyKey),
  };

  if (shouldMigrateLegacyContact) {
    saveJson(CONTACT_STORAGE_KEY, nextContact);
  }

  return nextContact;
}

function getInitialCreative() {
  const saved = loadJson(CREATIVE_STORAGE_KEY, {});
  const status = params.get("status") || saved.status || STATUS_OK;
  const style = params.get("style") || saved.style || "手写卡片";
  const mood = params.get("mood") || saved.mood || "放心、温暖、傍晚、家人";
  const details =
    params.get("details") ||
    saved.details ||
    "画面像一张发给家人的安心卡片，有留白、有日期、有一句清楚的报平安文字。";

  return {
    status: normalizeName(status) || STATUS_OK,
    style: normalizeName(style) || "手写卡片",
    mood: normalizeName(mood) || "放心、温暖、傍晚、家人",
    details: normalizeName(details),
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

function getPromptText() {
  return [
    `请基于 Wan 2.7 生成一张中文家庭报平安视觉卡片。`,
    `发送人：${contact.sender}`,
    `接收人：${contact.receiver}`,
    `今日状态：${creative.status}`,
    `情绪关键词：${creative.mood}`,
    `画面风格：${creative.style}`,
    `画面补充：${creative.details}`,
    `构图要求：竖版手机海报，适合发给家人，主体文字清晰可读，氛围温暖克制，不要夸张庆祝。`,
    `合规要求：不要出现真实公众人物、商标 Logo、医疗承诺、政治敏感、暴力或恐怖元素。`,
    `输出重点：让接收人一眼看懂“今天已平安”，并感到安心。`,
  ].join("\n");
}

function getShareText() {
  return [
    `今日平安：${contact.sender} 已向 ${contact.receiver} 报平安。`,
    `状态：${creative.status}`,
    `时间：${formatDateTime(new Date().toISOString())}`,
    `这是一张由「报个平安 Skill」生成的家庭关怀卡。`,
  ].join("\n");
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
      generatedImageUrl: row.generated_image_url || "",
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
    .select("checkin_date, checked_at, receiver_name, sender_name, status, generated_image_url")
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
    status: creative.status,
    prompt: getPromptText(),
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
        status: creative.status,
        generatedImageUrl: "",
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
    .select("checkin_date, checked_at, receiver_name, sender_name, status, generated_image_url")
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
      generatedImageUrl: data.generated_image_url || "",
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

function renderCreative() {
  statusInput.value = creative.status;
  styleSelect.value = creative.style;
  moodInput.value = creative.mood;
  detailsInput.value = creative.details;

  beforeCopy.textContent = `${contact.sender} 今天对 ${contact.receiver} 说：${creative.status}`;
  visualDate.textContent = formatFullDate();
  visualStatus.textContent = `今日${creative.status}`;
  visualLine.textContent = `${contact.sender} 已经向 ${contact.receiver} 报平安。`;
  visualStyle.textContent = `${creative.style} · ${creative.mood}`;
  promptPreview.textContent = getPromptText();
  shareCopy.textContent = getShareText();

  if (generatedImageUrl) {
    generatedImage.src = generatedImageUrl;
    generatedImage.hidden = false;
    visualCard.hidden = true;
    generationNote.textContent = "已通过 Wan API 生成情绪视觉卡。";
  } else {
    generatedImage.hidden = true;
    visualCard.hidden = false;
    generationNote.textContent = supabaseClient
      ? "点击报平安后会尝试调用 Wan API；未配置 DASHSCOPE_API_KEY 时显示本地预览。"
      : "当前显示本地预览；配置 Supabase Edge Function 后会替换为 Wan 生成图。";
  }
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
  generatedImageUrl = record.generatedImageUrl || generatedImageUrl;
  successCard.hidden = false;
}

function renderState() {
  const checked = records[todayKey()];

  todayLabel.textContent = formatFullDate();
  renderContact();
  renderHistory(records);
  renderSuccessCard(checked);
  renderCreative();

  if (checked) {
    button.textContent = "今日已平安";
    button.classList.add("done");
    statusPill.textContent = "今天已报平安";
    statusPill.classList.add("done");
    message.textContent = `${contact.receiver}已经能看到${contact.sender}今天${checked.status}。`;
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

async function generateCardImage() {
  if (!supabaseClient) {
    return "";
  }

  isGeneratingImage = true;
  generationNote.textContent = "正在调用 Wan API 生成情绪视觉卡...";

  const { data, error } = await supabaseClient.functions.invoke("generate-card", {
    body: {
      prompt: getPromptText(),
      sender: contact.sender,
      receiver: contact.receiver,
      status: creative.status,
      style: creative.style,
      mood: creative.mood,
    },
  });

  isGeneratingImage = false;

  if (error) {
    throw error;
  }

  return data?.imageUrl || "";
}

async function saveGeneratedImage(imageUrl) {
  if (!supabaseClient || !imageUrl) {
    return;
  }

  await supabaseClient
    .from(config.tableName || "peace_checkins")
    .update({
      generated_image_url: imageUrl,
      prompt: getPromptText(),
      updated_at: new Date().toISOString(),
    })
    .eq("family_key", contact.familyKey)
    .eq("sender_name", contact.sender)
    .eq("receiver_name", contact.receiver)
    .eq("checkin_date", todayKey());
}

async function copyText(text, buttonElement, doneText) {
  const originalText = buttonElement.textContent;

  try {
    await navigator.clipboard.writeText(text);
    buttonElement.textContent = doneText;
  } catch {
    buttonElement.textContent = "复制失败";
  }

  setTimeout(() => {
    buttonElement.textContent = originalText;
  }, 1500);
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

creativeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  creative = {
    status: normalizeName(statusInput.value) || STATUS_OK,
    style: normalizeName(styleSelect.value) || "手写卡片",
    mood: normalizeName(moodInput.value) || "放心、温暖、傍晚、家人",
    details: normalizeName(detailsInput.value) || "画面像一张发给家人的安心卡片。",
  };
  saveJson(CREATIVE_STORAGE_KEY, creative);
  renderState();
});

statusInput.addEventListener("input", () => {
  creative = { ...creative, status: normalizeName(statusInput.value) || STATUS_OK };
  saveJson(CREATIVE_STORAGE_KEY, creative);
  renderCreative();
});

styleSelect.addEventListener("change", () => {
  creative = { ...creative, style: normalizeName(styleSelect.value) || "手写卡片" };
  saveJson(CREATIVE_STORAGE_KEY, creative);
  renderCreative();
});

moodInput.addEventListener("input", () => {
  creative = { ...creative, mood: normalizeName(moodInput.value) };
  saveJson(CREATIVE_STORAGE_KEY, creative);
  renderCreative();
});

detailsInput.addEventListener("input", () => {
  creative = { ...creative, details: normalizeName(detailsInput.value) };
  saveJson(CREATIVE_STORAGE_KEY, creative);
  renderCreative();
});

copyPromptButton.addEventListener("click", () => {
  copyText(getPromptText(), copyPromptButton, "已复制");
});

copyShareButton.addEventListener("click", () => {
  copyText(getShareText(), copyShareButton, "已复制");
});

button.addEventListener("click", async () => {
  if (isSaving) {
    return;
  }

  isSaving = true;
  button.disabled = true;
  button.textContent = "正在生成安心卡";
  generatedImageUrl = "";

  try {
    const firstCheckinToday = !records[todayKey()];
    records = await saveCheckin();
    renderState();

    try {
      generatedImageUrl = await generateCardImage();
      await saveGeneratedImage(generatedImageUrl);
      renderCreative();
    } catch (error) {
      showSetupNote(`Wan 图片生成暂未完成：${error?.message || "请检查 Edge Function 和 API Key 配置"}`);
    }

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
