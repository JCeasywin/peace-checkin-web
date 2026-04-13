const questions = [
  ["门铃突然响了，它通常会？", ["第一时间冲过去，看看是谁来了", "在附近停住，先观察局势", "直接消失，像从没存在过"]],
  ["家里来了一个新纸箱，它的反应更像？", ["三分钟内进去，占为己有", "绕着看半天，确认安全再说", "表面不屑，半夜偷偷进去"]],
  ["你回到家开门时，它一般会？", ["立刻出现，像在等你", "过一会儿才慢悠悠过来", "继续睡，假装这件事与它无关"]],
  ["你想抱它一下，它最常见的态度是？", ["勉强配合，甚至主动蹭你", "允许短暂接触，但很快要走", "明确拒绝，并让你知道边界"]],
  ["陌生朋友来家里，它通常会？", ["主动靠近，甚至想闻闻对方", "在远处看着，观察一阵子", "藏起来，等人走了再出来"]],
  ["你买了一个新玩具，它更可能？", ["马上开玩，兴致很高", "先看你演示两遍，再决定", "完全不理，除非它自己哪天突然想玩"]],
  ["你在忙工作，它会怎么打扰你？", ["直接上桌、踩键盘、挡屏幕", "在旁边坐着，用眼神施压", "不来烦你，但会在你最想不到的时候制造动静"]],
  ["它最喜欢的休息位置通常是？", ["离你很近，能随时观察你", "有自己的固定高地或角落", "每天换地方，主打不可预测"]],
  ["你心情不好、坐着不说话时，它一般会？", ["主动靠近，陪在旁边", "远远看着，不一定靠近", "完全照常，该干嘛干嘛"]],
  ["它被你摸到不想摸的时候，通常会？", ["轻轻躲开，给你留体面", "回头看你一眼，提醒你适可而止", "直接上嘴或上爪，边界非常清楚"]],
  ["半夜两三点，它最可能在做什么？", ["在家里高速巡逻", "安静地换个地方继续睡", "突然开始装修，制造巨大存在感"]],
  ["你拿出罐头时，它的状态通常是？", ["立刻出现，动作非常积极", "表面矜持，但会迅速靠近", "仍然保持高冷，直到你真的打开"]],
  ["当它看到窗外的鸟或虫子时，会？", ["整只猫进入战斗模式，注意力拉满", "很认真地观察，但不轻举妄动", "看两眼就算了，继续睡觉更重要"]],
  ["如果家里临时挪了家具，它更可能？", ["立刻巡视，重新接管地盘", "谨慎适应，先观察几天", "明显不高兴，并对新布局表达意见"]],
  ["洗澡、剪指甲、梳毛这类护理项目，它通常表现为？", ["虽然不乐意，但还能合作", "过程里会反复挣扎和抗议", "把这视为原则问题，强烈反对"]],
  ["它对规则的态度更像哪一种？", ["只要你坚持，它大致会配合", "它听得懂，但不一定执行", "它自己就是规则"]],
  ["如果你把它最喜欢待的位置占了，它通常会？", ["直接来挤你，要求你让位", "在旁边盯着你，施加压力", "先去别处，但会一直记得这件事"]],
  ["它对家里其他人通常是？", ["普遍友好，谁都可以接触", "有明显偏爱，只亲近少数几个人", "情绪和态度全看当天心情"]],
  ["拍照时，它最常见的状态是？", ["很配合，甚至知道镜头在哪", "勉强能拍，但很快就不耐烦", "一举起手机它就走，极难留下证据"]],
  ["一天结束时，它更像哪一种猫？", ["需要一点陪伴和互动，才肯安心收工", "有自己的节奏，靠近与离开都很自然", "高贵地下班，像谁都不要打扰它"]],
];

const closenessMap = { 3: [2, 1, 0], 5: [2, 1, 0], 9: [2, 1, 0], 18: [2, 1, 0], 20: [2, 1, 0] };
const boundaryMap = { 2: [2, 1, 0], 4: [0, 1, 2], 8: [0, 2, 1], 10: [0, 1, 2], 15: [0, 1, 2], 16: [0, 1, 2], 17: [2, 1, 1] };
const dramaMap = { 1: [2, 1, 0], 6: [2, 1, 0], 7: [2, 1, 2], 11: [2, 0, 2], 12: [2, 1, 0], 13: [2, 1, 0], 14: [1, 0, 2], 19: [2, 1, 0] };

const resultData = {
  LLL: {
    title: "窗台哲学家",
    tags: ["观察型", "省电型", "自有宇宙"],
    summary: "它不热衷于参与一切，也不急着表达自己。\n比起热闹，它更擅长安静地看着世界发生。\n你以为它只是懒，其实它只是在用自己的方式理解这个家。",
    posterLine: "它不是冷淡。\n它只是更喜欢在窗边，把一切想明白。",
    punchline: "你负责上班，它负责看云。",
    colors: ["#f8f8f4", "#4f6f68", "#e6b94f"],
  },
  LHL: {
    title: "冷面监察官",
    tags: ["边界清晰", "规则敏感", "克制审视"],
    summary: "它不一定黏人，但它对一切都心里有数。\n谁可以靠近，什么时候该退开，哪张椅子本来是谁的，它都记得。\n看着高冷，实际上只是特别懂秩序。",
    posterLine: "它不需要热闹。\n它只需要这个家按它认可的方式运转。",
    punchline: "你以为你在养猫，其实你只是住进了它的管理范围。",
    colors: ["#f3f5f2", "#263c35", "#9aa9a2"],
  },
  LLH: {
    title: "深夜拆迁队",
    tags: ["高动能", "不按牌理", "夜间活跃"],
    summary: "它不一定需要太多亲密，也不太在意规则。\n但它非常擅长在你最意想不到的时刻，提醒你它依然存在。\n白天像隐士，晚上像施工队。",
    posterLine: "白天是猫。\n晚上是工程项目。",
    punchline: "凌晨两点，它会突然觉得这个家还有提升空间。",
    colors: ["#202728", "#f0f0ea", "#f06b42"],
  },
  LHH: {
    title: "高贵独裁者",
    tags: ["主场意识强", "不容反驳", "存在感高"],
    summary: "它不轻易讨好谁，也不轻易让谁越界。\n但一旦它决定表达意见，整个家都会知道。\n它不是难相处，它只是默认自己拥有最终解释权。",
    posterLine: "边界是它定的。\n情绪也是它先发的。",
    punchline: "这不是宠物，是一个脾气不小的制度制定者。",
    colors: ["#2a1f22", "#f2eee8", "#bd4d49"],
  },
  HLL: {
    title: "罐头现实主义者",
    tags: ["务实亲人", "幸福具体", "很会选舒服"],
    summary: "它不太爱折腾，也不喜欢把生活搞复杂。\n但它知道谁对它好，哪里舒服，什么值得靠近。\n它的爱很实际：陪你、蹭你、记得饭点。",
    posterLine: "它不是复杂型猫。\n它只是很清楚什么叫值得。",
    punchline: "谁给罐头，谁就是今天的好人。",
    colors: ["#fbfaf6", "#335d4f", "#f29b49"],
  },
  HHL: {
    title: "黏人小经理",
    tags: ["爱你", "但有要求", "节奏明确"],
    summary: "它愿意靠近你，也确实需要你。\n但它并不是毫无原则地黏人，它对互动方式、时间和边界都有要求。\n本质上，它是一只很会经营关系的猫。",
    posterLine: "爱你，但按它的流程来。",
    punchline: "它会陪你，但也会审核你摸它的方式。",
    colors: ["#f7f9f7", "#2e6358", "#93b6a6"],
  },
  HLH: {
    title: "不可预测的艺术家",
    tags: ["灵感流动", "情绪丰沛", "难以预判"],
    summary: "它很容易投入，也很容易突然改主意。\n它有热情、有表达、有靠近你的时刻，也有完全不讲逻辑的时候。\n和它相处，最重要的不是掌控，而是欣赏。",
    posterLine: "它不是不稳定。\n它只是创作型。",
    punchline: "今天蹭你，明天咬你，后天继续睡你枕头。",
    colors: ["#f8f7f2", "#2e6258", "#e35b61"],
  },
  HHH: {
    title: "家庭气氛操控者",
    tags: ["参与感强", "情绪带场", "全屋核心"],
    summary: "它不仅在这个家里生活，它还会影响这个家的气氛。\n它想参与、想表达、想被看见，也会明确地告诉你什么可以、什么不可以。\n这不是普通的猫，这是家庭能量场的重要角色。",
    posterLine: "它不只是住在家里。\n它本身就是家里的一部分天气。",
    punchline: "全家人的情绪，有时都要看它今天给不给面子。",
    colors: ["#f9faf6", "#315f52", "#d85c4a"],
  },
};

const state = {
  answers: Array(questions.length).fill(null),
  image: null,
};

const els = {
  answeredCount: document.querySelector("#answeredCount"),
  questions: document.querySelector("#questions"),
  resultBtn: document.querySelector("#resultBtn"),
  missingText: document.querySelector("#missingText"),
  resetBtn: document.querySelector("#resetBtn"),
  catPhoto: document.querySelector("#catPhoto"),
  photoPreview: document.querySelector("#photoPreview"),
  uploadBox: document.querySelector(".upload-box"),
  catName: document.querySelector("#catName"),
  resultSection: document.querySelector("#resultSection"),
  resultTitle: document.querySelector("#resultTitle"),
  resultTags: document.querySelector("#resultTags"),
  resultSummary: document.querySelector("#resultSummary"),
  dimensionChips: document.querySelector("#dimensionChips"),
  resultPunchline: document.querySelector("#resultPunchline"),
  posterCanvas: document.querySelector("#posterCanvas"),
  downloadBtn: document.querySelector("#downloadBtn"),
  rerenderBtn: document.querySelector("#rerenderBtn"),
};

function renderQuestions() {
  els.questions.innerHTML = questions
    .map((question, index) => {
      const options = question[1]
        .map((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex);
          return `
            <label class="option">
              <input type="radio" name="q${index}" value="${optionIndex}" />
              <span>${letter}. ${option}</span>
            </label>
          `;
        })
        .join("");

      return `
        <article class="question-card">
          <p class="question-title">${index + 1}. ${question[0]}</p>
          <div class="option-grid">${options}</div>
        </article>
      `;
    })
    .join("");
}

function updateProgress() {
  const count = state.answers.filter((answer) => answer !== null).length;
  const missing = questions.length - count;
  els.answeredCount.textContent = count;
  els.resultBtn.disabled = missing > 0;
  els.missingText.textContent = missing === 0 ? "可以查看结果了" : `还差 ${missing} 题`;
}

function scoreDimension(map) {
  return Object.entries(map).reduce((sum, [questionNumber, values]) => {
    const answer = state.answers[Number(questionNumber) - 1];
    return sum + (answer === null ? 0 : values[answer]);
  }, 0);
}

function getResult() {
  const closeness = scoreDimension(closenessMap);
  const boundary = scoreDimension(boundaryMap);
  const drama = scoreDimension(dramaMap);
  const levels = {
    closeness: closeness >= 6 ? "H" : "L",
    boundary: boundary >= 8 ? "H" : "L",
    drama: drama >= 9 ? "H" : "L",
  };
  const key = `${levels.closeness}${levels.boundary}${levels.drama}`;
  return {
    key,
    data: resultData[key],
    dimensions: [
      ["靠近你", levels.closeness === "H" ? "高" : "低"],
      ["守住自己", levels.boundary === "H" ? "高" : "低"],
      ["存在感", levels.drama === "H" ? "高" : "低"],
    ],
  };
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = [];
  text.split("\n").forEach((paragraph) => {
    let line = "";
    [...paragraph].forEach((char) => {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = testLine;
      }
    });
    lines.push(line);
  });

  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function coverImage(ctx, image, x, y, width, height) {
  const ratio = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function containImage(ctx, image, x, y, width, height) {
  const ratio = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function fillRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function drawPhotoFrame(ctx, image, x, y, width, height, primary) {
  ctx.save();
  ctx.fillStyle = "#f4f7f0";
  fillRoundRect(ctx, x, y, width, height, 28);
  ctx.clip();

  if (image) {
    ctx.globalAlpha = 0.55;
    ctx.filter = "blur(18px)";
    coverImage(ctx, image, x - 36, y - 36, width + 72, height + 72);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(248, 250, 246, 0.28)";
    ctx.fillRect(x, y, width, height);
    containImage(ctx, image, x + 28, y + 28, width - 56, height - 56);
  } else {
    drawPlaceholderCat(ctx, x, y, width, height, primary);
  }

  ctx.restore();
}

function drawPlaceholderCat(ctx, x, y, width, height, accent) {
  ctx.fillStyle = "#eef2ed";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + width / 2, y + height / 2 + 24, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + width / 2 - 112, y + height / 2 - 78);
  ctx.lineTo(x + width / 2 - 64, y + height / 2 - 220);
  ctx.lineTo(x + width / 2 - 8, y + height / 2 - 84);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + width / 2 + 112, y + height / 2 - 78);
  ctx.lineTo(x + width / 2 + 64, y + height / 2 - 220);
  ctx.lineTo(x + width / 2 + 8, y + height / 2 - 84);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fbfbf8";
  ctx.beginPath();
  ctx.arc(x + width / 2 - 52, y + height / 2 + 6, 12, 0, Math.PI * 2);
  ctx.arc(x + width / 2 + 52, y + height / 2 + 6, 12, 0, Math.PI * 2);
  ctx.fill();
}

function renderPoster(result) {
  const canvas = els.posterCanvas;
  const ctx = canvas.getContext("2d");
  const [bg, primary, accent] = result.data.colors;
  const catName = els.catName.value.trim() || "你家猫";
  const funFont = '"Arial Rounded MT Bold", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = accent;
  ctx.fillRect(54, 54, 972, 18);

  drawPhotoFrame(ctx, state.image, 54, 96, 972, 580, primary);

  ctx.fillStyle = accent;
  fillRoundRect(ctx, 54, 712, 972, 630, 30);
  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  fillRoundRect(ctx, 84, 742, 912, 570, 24);

  ctx.fillStyle = primary;
  ctx.font = `900 38px ${funFont}`;
  ctx.fillText(`${catName} 的猫格测试`, 120, 812);

  ctx.fillStyle = primary;
  ctx.font = `900 86px ${funFont}`;
  ctx.fillText(result.data.title, 120, 908);

  let tagX = 120;
  ctx.font = `900 30px ${funFont}`;
  result.data.tags.forEach((tag) => {
    const width = ctx.measureText(tag).width + 52;
    ctx.fillStyle = primary;
    fillRoundRect(ctx, tagX, 944, width, 58, 18);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(tag, tagX + 26, 983);
    tagX += width + 16;
  });

  ctx.fillStyle = "#252724";
  ctx.font = `800 46px ${funFont}`;
  const afterPosterLine = wrapCanvasText(ctx, result.data.posterLine, 120, 1076, 820, 64);

  ctx.fillStyle = primary;
  fillRoundRect(ctx, 120, afterPosterLine + 24, 12, 92, 6);
  ctx.fillStyle = "#252724";
  ctx.font = `900 34px ${funFont}`;
  wrapCanvasText(ctx, result.data.punchline, 154, afterPosterLine + 64, 760, 50);

  ctx.fillStyle = "#6a6d64";
  ctx.font = `700 24px ${funFont}`;
  ctx.fillText("上传猫照 · 回答 20 题 · 生成海报", 72, 1370);
}

function showResult() {
  const result = getResult();
  els.resultTitle.textContent = `你家猫是：${result.data.title}`;
  els.resultTags.innerHTML = result.data.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
  els.resultSummary.textContent = result.data.summary;
  els.dimensionChips.innerHTML = result.dimensions
    .map(([name, level]) => `<span class="dimension">${name}：${level}</span>`)
    .join("");
  els.resultPunchline.textContent = result.data.punchline;
  els.resultSection.hidden = false;
  renderPoster(result);
  els.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetQuiz() {
  state.answers.fill(null);
  document.querySelectorAll("input[type='radio']").forEach((input) => {
    input.checked = false;
  });
  els.resultSection.hidden = true;
  updateProgress();
}

renderQuestions();
updateProgress();

els.questions.addEventListener("change", (event) => {
  if (!event.target.matches("input[type='radio']")) return;
  const index = Number(event.target.name.replace("q", ""));
  state.answers[index] = Number(event.target.value);
  updateProgress();
});

els.catPhoto.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    els.photoPreview.src = reader.result;
    els.uploadBox.classList.add("has-image");
    const image = new Image();
    image.onload = () => {
      state.image = image;
      if (!els.resultSection.hidden) renderPoster(getResult());
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

els.catName.addEventListener("input", () => {
  if (!els.resultSection.hidden) renderPoster(getResult());
});

els.resultBtn.addEventListener("click", showResult);
els.resetBtn.addEventListener("click", resetQuiz);
els.rerenderBtn.addEventListener("click", () => renderPoster(getResult()));
els.downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  const name = els.catName.value.trim() || "cat";
  link.download = `${name}-cat-personality-poster.png`;
  link.href = els.posterCanvas.toDataURL("image/png");
  link.click();
});
