const STORAGE_KEY = "nihongoReviewSettings";

let settings = { ...REVIEW_DEFAULTS };
let words = [];
let currentIndex = 0;
let attempts = 0;
let startedAt = Date.now();

const els = {
  card: document.getElementById("review-card"),
  empty: document.getElementById("empty-state"),
  progress: document.getElementById("progress"),
  projectName: document.getElementById("project-name"),
  reason: document.getElementById("review-reason"),
  meaning: document.getElementById("meaning"),
  answer: document.getElementById("answer"),
  feedback: document.getElementById("feedback"),
  submit: document.getElementById("submit-answer"),
  speak: document.getElementById("speak-btn"),
  snooze: document.getElementById("snooze-btn"),
  escape: document.getElementById("escape-btn"),
  closeEmpty: document.getElementById("close-empty"),
  strictLabel: document.getElementById("strict-label")
};

async function loadSettings() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  settings = { ...REVIEW_DEFAULTS, ...(data[STORAGE_KEY] || {}) };
}

function headers() {
  return {
    apikey: settings.supabaseAnonKey,
    Authorization: `Bearer ${settings.supabaseAnonKey}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal"
  };
}

async function supabaseFetch(path, options = {}) {
  const base = (settings.supabaseUrl || "").replace(/\/+$/, "");
  if (!base || !settings.supabaseAnonKey) {
    throw new Error("Chưa cấu hình Supabase trong extension.");
  }
  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...headers(),
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function loadDueWords() {
  const [projects, rows] = await Promise.all([
    supabaseFetch("projects?select=id,name", { headers: { Prefer: "" } }),
    supabaseFetch("vocab?select=*&order=next_review_at.asc.nullslast&limit=1000", { headers: { Prefer: "" } })
  ]);
  const projectMap = new Map((projects || []).map(project => [project.id, project.name]));
  const now = Date.now();
  words = (rows || [])
    .map(row => normalizeDbVocab(row, projectMap.get(row.project_id) || ""))
    .filter(word => reviewStatus(word, now).needsReview)
    .slice(0, settings.maxWordsPerSession || REVIEW_DEFAULTS.maxWordsPerSession);
}

function normalizeAnswer(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, "");
}

function hintAnswer(answer) {
  return answer
    .split("")
    .map((char, index) => index === 0 || index === answer.length - 1 || "aeiou".includes(char) ? char : "*")
    .join("");
}

function currentWord() {
  return words[currentIndex];
}

function render() {
  if (words.length === 0) {
    els.card.style.display = "none";
    els.empty.style.display = "block";
    els.progress.textContent = "0 từ đến hạn";
    return;
  }

  const word = currentWord();
  els.empty.style.display = "none";
  els.card.style.display = "block";
  els.progress.textContent = `${currentIndex + 1} / ${words.length}`;
  els.projectName.textContent = word.projectName || "Không rõ dự án";
  els.reason.textContent = word.reviewReason || "Đến hạn ôn";
  els.meaning.textContent = word.meaning;
  els.answer.value = "";
  els.feedback.textContent = "";
  els.feedback.className = "feedback";
  attempts = 0;
  startedAt = Date.now();
  setTimeout(() => els.answer.focus(), 80);
}

async function patchVocab(word, payload) {
  await supabaseFetch(`vocab?id=eq.${encodeURIComponent(word.id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

async function submitAnswer() {
  const word = currentWord();
  if (!word) return;

  const answer = normalizeAnswer(els.answer.value);
  const expected = normalizeAnswer(word.romaji);
  const elapsedSec = (Date.now() - startedAt) / 1000;

  if (answer !== expected) {
    attempts += 1;
    els.feedback.textContent = `Chưa đúng. Gợi ý: ${hintAnswer(word.romaji)}`;
    els.feedback.className = "feedback bad";
    els.answer.select();
    return;
  }

  const answerState = attempts > 0 ? "correct_retry" : "correct";
  const payload = buildReviewUpdate(word, answerState, elapsedSec);
  await patchVocab(word, payload);

  els.feedback.textContent = answerState === "correct" ? "Đúng ngay. Lịch ôn đã được đẩy xa hơn." : "Đúng sau gợi ý. Từ này sẽ được nhắc lại sớm.";
  els.feedback.className = "feedback good";

  currentIndex += 1;
  if (currentIndex >= words.length) {
    els.progress.textContent = "Hoàn thành";
    els.card.innerHTML = `
      <h2>Hoàn thành phiên ôn</h2>
      <p>Bạn đã xử lý toàn bộ từ đến hạn trong phiên này.</p>
      <button class="primary" id="close-done">Đóng</button>
    `;
    document.getElementById("close-done").addEventListener("click", () => window.close());
    chrome.runtime.sendMessage({ type: "CHECK_DUE", openWindow: false });
    return;
  }

  setTimeout(render, 600);
}

async function snooze() {
  const nextAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await Promise.all(words.slice(currentIndex).map(word => patchVocab(word, {
    next_review_at: nextAt,
    review_reason: "Hoãn từ extension",
    updated_at: new Date().toISOString()
  })));
  window.close();
}

function speakCurrent() {
  const word = currentWord();
  if (!word || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word.japanese.replace(/\([^)]*\)/g, "").trim());
  utterance.lang = "ja-JP";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

async function init() {
  try {
    await loadSettings();
    els.strictLabel.textContent = settings.strictMode ? "Strict mode bật" : "Strict mode tắt";
    await loadDueWords();
    render();
  } catch (error) {
    els.card.style.display = "none";
    els.empty.style.display = "block";
    els.empty.innerHTML = `<h2>Chưa thể tải lịch ôn</h2><p>${error.message}</p><button class="primary" id="open-options">Mở cài đặt</button>`;
    document.getElementById("open-options").addEventListener("click", () => chrome.runtime.openOptionsPage());
  }
}

els.submit.addEventListener("click", submitAnswer);
els.answer.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitAnswer();
  }
});
els.speak.addEventListener("click", speakCurrent);
els.snooze.addEventListener("click", snooze);
els.escape.addEventListener("click", () => window.close());
els.closeEmpty.addEventListener("click", () => window.close());

window.addEventListener("beforeunload", event => {
  if (settings.strictMode && words.length > 0 && currentIndex < words.length) {
    event.preventDefault();
    event.returnValue = "";
  }
});

init();
