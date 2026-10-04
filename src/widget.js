import { getProjects, updateVocabStats, recordStudyActivity, removeVietnameseTones } from "./storage.js";
import { HIRAGANA_LIST } from "./kana.js";

// Các phần tử DOM
const widgetBox = document.getElementById("widget-box");
const displayWord = document.getElementById("display-word");
const displaySub = document.getElementById("display-sub");
const speakBtn = document.getElementById("speak-btn");
const answerInput = document.getElementById("answer-input");
const answerHintOverlay = document.getElementById("answer-hint-overlay");
const hintText = document.getElementById("hint-text");
const settingsBtn = document.getElementById("settings-toggle-btn");
const settingsPanel = document.getElementById("settings-panel");
const closeBtn = document.getElementById("close-btn");
const modeSelect = document.getElementById("mode-select");
const projectSelect = document.getElementById("project-select");
const openFullAppBtn = document.getElementById("open-full-app-btn");

const WIDGET_SETTINGS_KEY = "nihongo_stealth_widget_settings";

let questionQueue = [];
let currentItem = null;
let lastAnsweredId = null;
let isAnswerLocked = false;
let autoNextTimer = null;
let questionStartTime = Date.now();
let isSettingsOpen = false;

// Web Audio API phản hồi âm thanh nhanh nhẹn
function playBeep(isSuccess) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isSuccess) {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.07); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
}

// Phát âm tiếng Nhật với SpeechSynthesis
let cachedJaVoice = null;
function speakJapanese(text) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();

  const clean = text.replace(/\([^)]*\)/g, "").replace(/（[^）]*）/g, "").trim();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "ja-JP";
  utterance.rate = 0.92;

  if (!cachedJaVoice) {
    const voices = window.speechSynthesis.getVoices();
    cachedJaVoice = voices.find(v => v.lang.startsWith("ja") || v.lang === "ja_JP");
  }
  if (cachedJaVoice) utterance.voice = cachedJaVoice;

  window.speechSynthesis.speak(utterance);
}

// Chuẩn hóa chuỗi so khớp thông minh
function normalize(str) {
  return (str || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isSmartMatch(userAnswer, correctAnswer) {
  const u = normalize(userAnswer);
  const c = normalize(correctAnswer);
  if (!u || !c) return false;
  if (u === c) return true;

  // So sánh không dấu
  const uNo = removeVietnameseTones ? removeVietnameseTones(u) : u;
  const cNo = removeVietnameseTones ? removeVietnameseTones(c) : c;
  if (uNo === cNo) return true;

  // Tách các phân đoạn nghĩa (dấu phẩy, gạch chéo, chấm phẩy)
  const parts = correctAnswer.split(/[,/;\n]+/).map(p => normalize(p)).filter(Boolean);
  for (const part of parts) {
    if (u === part) return true;
    const pNo = removeVietnameseTones ? removeVietnameseTones(part) : part;
    if (uNo === pNo) return true;
  }

  return false;
}

// Cấu hình widget
function loadSettings() {
  const defaults = {
    mode: "jp_to_meaning",
    project: "all",
    opacity: 90
  };
  try {
    const saved = localStorage.getItem(WIDGET_SETTINGS_KEY);
    if (saved) return { ...defaults, ...JSON.parse(saved) };
  } catch (e) {}
  return defaults;
}

function saveSettings(settings) {
  try {
    localStorage.setItem(WIDGET_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

// Lấy danh sách từ vựng gốc theo project
function getBasePool() {
  const settings = loadSettings();
  const projects = getProjects();
  let pool = [];

  if (settings.project === "all") {
    projects.forEach(p => {
      (p.vocab || []).forEach(v => {
        pool.push({ ...v, projectId: p.id, projectName: p.name });
      });
    });
  } else if (settings.project === "weak") {
    projects.forEach(p => {
      (p.vocab || []).forEach(v => {
        if ((v.wrongCount || 0) > 0 || (v.difficultyScore || 0) > 30) {
          pool.push({ ...v, projectId: p.id, projectName: p.name });
        }
      });
    });
    if (pool.length === 0) {
      projects.forEach(p => {
        (p.vocab || []).forEach(v => pool.push({ ...v, projectId: p.id, projectName: p.name }));
      });
    }
  } else {
    const found = projects.find(p => p.id === settings.project);
    if (found) {
      pool = (found.vocab || []).map(v => ({ ...v, projectId: found.id, projectName: found.name }));
    }
  }

  // Fallback nếu rỗng: Kana
  if (pool.length === 0) {
    pool = HIRAGANA_LIST.map(k => ({
      id: "kana-" + k.romaji,
      japanese: k.kana,
      romaji: k.romaji,
      meaning: k.romaji,
      projectId: "default-kana"
    }));
  }

  return pool;
}

// ============================================================================
// THUẬT TOÁN SINH HÀNG ĐỢI CÂU HỎI (Weighted Spaced Repetition + Strict No Duplicate)
// 1. Nếu N >= M: đảm bảo M từ xuất hiện ít nhất 1 lần.
// 2. Từ hay sai / khó (wrongCount, difficultyScore cao) có trọng số xuất hiện cao hơn.
// 3. TUYỆT ĐỐI KHÔNG 2 TỪ LIÊN TIẾP GIỐNG NHAU (luôn là a-b-a hoặc a-b-c).
// ============================================================================
function buildQuestionQueue(basePool, targetSize = 25, excludeLeadingId = null) {
  const M = basePool.length;
  if (M === 0) return [];
  if (M === 1) return [basePool[0]];

  // 1. Tính trọng số cho từng từ
  const weights = basePool.map(v => {
    const diff = Number(v.difficultyScore || 0);
    const wrong = Number(v.wrongCount || 0);
    const correct = Number(v.correctCount || 0);
    const total = correct + wrong;
    const mastery = Number(v.masteryScore || 0);
    const streak = Number(v.streakCorrect || 0);

    let w = 1.0;
    w += (diff / 100) * 4.0;
    if (total > 0) {
      w += (wrong / total) * 3.5;
    } else {
      w += 1.5; // Từ mới chưa luyện
    }
    w += ((100 - Math.min(100, mastery)) / 100) * 3.0;

    if (mastery >= 85 && streak >= 3) {
      w *= 0.5; // Đã nhớ kỹ thì giảm tần suất lặp
    }
    return Math.max(0.2, w);
  });

  const totalWeight = weights.reduce((acc, val) => acc + val, 0);

  // 2. Gom danh sách ban đầu
  let selected = [];
  if (targetSize <= M) {
    // Lấy targetSize từ không lặp
    const poolCopy = [...basePool];
    for (let i = poolCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
    }
    selected = poolCopy.slice(0, targetSize);
  } else {
    // Đảm bảo đủ M từ xuất hiện ít nhất 1 lần
    selected = [...basePool];

    // Các vị trí dư chọn theo trọng số
    const extraCount = targetSize - M;
    for (let k = 0; k < extraCount; k++) {
      let r = Math.random() * totalWeight;
      let pickedIndex = 0;
      for (let i = 0; i < M; i++) {
        r -= weights[i];
        if (r <= 0) {
          pickedIndex = i;
          break;
        }
      }
      selected.push(basePool[pickedIndex]);
    }

    // Shuffle Fisher-Yates
    for (let i = selected.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }
  }

  // 3. Khử trường hợp từ đầu tiên trùng với từ vừa làm ở lượt trước (excludeLeadingId)
  if (excludeLeadingId && selected.length > 1 && selected[0].id === excludeLeadingId) {
    for (let j = 1; j < selected.length; j++) {
      if (selected[j].id !== excludeLeadingId) {
        [selected[0], selected[j]] = [selected[j], selected[0]];
        break;
      }
    }
  }

  // 4. CHỐNG LẶP TUYỆT ĐỐI: Không bao giờ có a-a (chỉ a-b-a hoặc a-b-c)
  for (let i = 1; i < selected.length; i++) {
    if (selected[i].id === selected[i - 1].id) {
      let swapped = false;
      // Tìm vị trí phía sau không bị trùng cả trước và sau
      for (let j = i + 1; j < selected.length; j++) {
        const canPlaceAtI = selected[j].id !== selected[i - 1].id;
        const canPlaceAtJ = (j + 1 >= selected.length || selected[i].id !== selected[j + 1].id);
        if (canPlaceAtI && canPlaceAtJ) {
          [selected[i], selected[j]] = [selected[j], selected[i]];
          swapped = true;
          break;
        }
      }
      // Nếu không swap được phía sau, dịch chuyển vào vị trí hợp lệ phía trước
      if (!swapped) {
        for (let j = 0; j < i - 1; j++) {
          const prevJ = j > 0 ? selected[j - 1].id : null;
          const nextJ = selected[j + 1].id;
          if (selected[j].id !== selected[i].id && prevJ !== selected[i].id && nextJ !== selected[i].id) {
            const [item] = selected.splice(i, 1);
            selected.splice(j + 1, 0, item);
            swapped = true;
            break;
          }
        }
      }
    }
  }

  return selected;
}

// Cập nhật dropdown dự án
function updateProjectDropdown() {
  const projects = getProjects();
  const settings = loadSettings();

  projectSelect.innerHTML = `
    <option value="all">Tất cả từ vựng</option>
    <option value="weak">Từ hay sai / Cần ôn tập</option>
  `;

  projects.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} (${(p.vocab || []).length})`;
    projectSelect.appendChild(opt);
  });

  projectSelect.value = settings.project || "all";
}

// Hiển thị câu hỏi tiếp theo
function nextQuestion() {
  if (autoNextTimer) {
    clearTimeout(autoNextTimer);
    autoNextTimer = null;
  }

  // Nạp lại hàng đợi nếu hết
  if (questionQueue.length === 0) {
    const basePool = getBasePool();
    questionQueue = buildQuestionQueue(basePool, 30, lastAnsweredId);
  }

  currentItem = questionQueue.shift();
  if (!currentItem) return;

  lastAnsweredId = currentItem.id;
  isAnswerLocked = false;
  questionStartTime = Date.now();

  const settings = loadSettings();
  widgetBox.classList.remove("correct", "wrong");
  answerHintOverlay.classList.remove("show");

  answerInput.value = "";
  answerInput.disabled = false;
  setTimeout(() => answerInput.focus(), 30);

  if (settings.mode === "jp_to_meaning") {
    displayWord.textContent = currentItem.japanese;
    displaySub.textContent = currentItem.romaji ? `[${currentItem.romaji}]` : "";
    answerInput.placeholder = "Nghĩa tiếng Việt... ↵";
  } else if (settings.mode === "jp_to_romaji") {
    displayWord.textContent = currentItem.japanese;
    displaySub.textContent = "";
    answerInput.placeholder = "Romaji... ↵";
  } else if (settings.mode === "meaning_to_romaji") {
    displayWord.textContent = currentItem.meaning;
    displaySub.textContent = "";
    answerInput.placeholder = "Romaji / Nhật... ↵";
  }
}

// Kiểm tra đáp án khi bấm Enter
function checkAnswer() {
  if (isAnswerLocked || !currentItem) return;

  const userVal = answerInput.value.trim();
  if (!userVal) return;

  isAnswerLocked = true;
  const settings = loadSettings();
  const timeSpentSec = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
  let isCorrect = false;
  let correctSolution = "";

  if (settings.mode === "jp_to_meaning") {
    correctSolution = currentItem.meaning;
    isCorrect = isSmartMatch(userVal, correctSolution);
  } else if (settings.mode === "jp_to_romaji") {
    correctSolution = currentItem.romaji;
    isCorrect = normalize(userVal) === normalize(correctSolution);
  } else if (settings.mode === "meaning_to_romaji") {
    correctSolution = currentItem.romaji;
    isCorrect = normalize(userVal) === normalize(correctSolution) || userVal === currentItem.japanese;
  }

  // Cập nhật thống kê vào hệ thống
  if (currentItem.projectId && currentItem.projectId !== "default-kana") {
    try {
      updateVocabStats(currentItem.projectId, currentItem.id, isCorrect, timeSpentSec);
      recordStudyActivity(1, isCorrect ? 1 : 0);
    } catch (e) {}
  }

  if (isCorrect) {
    widgetBox.classList.add("correct");
    playBeep(true);
    speakJapanese(currentItem.japanese);

    // Chuyển câu mượt và dứt khoát
    autoNextTimer = setTimeout(() => {
      nextQuestion();
    }, 280);
  } else {
    widgetBox.classList.add("wrong");
    playBeep(false);

    hintText.textContent = `Đ/Á: ${correctSolution}`;
    answerHintOverlay.classList.add("show");

    // Tự động qua sau 2.2 giây, hoặc người dùng ấn Enter để qua ngay
    autoNextTimer = setTimeout(() => {
      nextQuestion();
    }, 2200);
  }
}

// Bật/tắt Panel cài đặt nhanh
function toggleSettingsPanel() {
  isSettingsOpen = !isSettingsOpen;
  if (isSettingsOpen) {
    settingsPanel.classList.add("open");
    if (window.electronAPI && window.electronAPI.resizeWidget) {
      window.electronAPI.resizeWidget(410, 270);
    }
  } else {
    settingsPanel.classList.remove("open");
    if (window.electronAPI && window.electronAPI.resizeWidget) {
      window.electronAPI.resizeWidget(410, 58);
    }
  }
}

function hideWidget() {
  if (window.electronAPI && window.electronAPI.hideWidget) {
    window.electronAPI.hideWidget();
  } else {
    widgetBox.style.opacity = "0.2";
    setTimeout(() => { widgetBox.style.opacity = "1"; }, 1500);
  }
}

function setWidgetOpacity(percent) {
  const val = Math.max(0.25, Math.min(1.0, percent / 100));
  widgetBox.style.opacity = val.toString();

  const settings = loadSettings();
  settings.opacity = percent;
  saveSettings(settings);

  if (window.electronAPI && window.electronAPI.setOpacity) {
    window.electronAPI.setOpacity(percent);
  }
}

// Gắn sự kiện bàn phím & chuột
function setupEvents() {
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      // Nếu đang hiển thị gợi ý đáp án sai, bấm Enter sẽ bỏ qua ngay
      if (answerHintOverlay.classList.contains("show")) {
        nextQuestion();
        return;
      }

      checkAnswer();
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (currentItem && currentItem.japanese) {
        speakJapanese(currentItem.japanese);
      }
    } else if (e.key === "Escape") {
      if (isSettingsOpen) {
        toggleSettingsPanel();
      } else {
        hideWidget();
      }
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isSettingsOpen) {
        toggleSettingsPanel();
      } else {
        hideWidget();
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (currentItem && currentItem.japanese) {
        speakJapanese(currentItem.japanese);
      }
    }
  });

  speakBtn.addEventListener("click", () => {
    if (currentItem && currentItem.japanese) {
      speakJapanese(currentItem.japanese);
    }
    answerInput.focus();
  });

  closeBtn.addEventListener("click", () => {
    hideWidget();
  });

  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSettingsPanel();
  });

  modeSelect.addEventListener("change", () => {
    const settings = loadSettings();
    settings.mode = modeSelect.value;
    saveSettings(settings);
    nextQuestion();
  });

  projectSelect.addEventListener("change", () => {
    const settings = loadSettings();
    settings.project = projectSelect.value;
    saveSettings(settings);
    questionQueue = [];
    nextQuestion();
  });

  document.querySelectorAll(".btn-chip[data-opacity]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-chip[data-opacity]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const opacity = parseInt(btn.dataset.opacity, 10);
      setWidgetOpacity(opacity);
    });
  });

  openFullAppBtn.addEventListener("click", () => {
    if (window.electronAPI && window.electronAPI.openMainWindow) {
      window.electronAPI.openMainWindow();
    } else {
      window.open("/index.html", "_blank");
    }
  });
}

function init() {
  const settings = loadSettings();
  modeSelect.value = settings.mode || "jp_to_meaning";
  updateProjectDropdown();

  const savedOpacity = settings.opacity || 90;
  setWidgetOpacity(savedOpacity);
  document.querySelectorAll(".btn-chip[data-opacity]").forEach(b => {
    if (parseInt(b.dataset.opacity, 10) === savedOpacity) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  setupEvents();
  nextQuestion();
}

document.addEventListener("DOMContentLoaded", init);
