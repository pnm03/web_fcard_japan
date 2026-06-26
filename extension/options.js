const STORAGE_KEY = "nihongoReviewSettings";

const fields = {
  supabaseUrl: document.getElementById("supabase-url"),
  supabaseAnonKey: document.getElementById("supabase-key"),
  appUrl: document.getElementById("app-url"),
  checkIntervalMinutes: document.getElementById("check-interval"),
  maxWordsPerSession: document.getElementById("max-words"),
  popupCooldownMinutes: document.getElementById("cooldown"),
  autoOpenReview: document.getElementById("auto-open"),
  strictMode: document.getElementById("strict-mode")
};

const statusEl = document.getElementById("status");

async function loadSettings() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const settings = { ...REVIEW_DEFAULTS, ...(data[STORAGE_KEY] || {}) };
  fields.supabaseUrl.value = settings.supabaseUrl || "";
  fields.supabaseAnonKey.value = settings.supabaseAnonKey || "";
  fields.appUrl.value = settings.appUrl || REVIEW_DEFAULTS.appUrl;
  fields.checkIntervalMinutes.value = settings.checkIntervalMinutes || REVIEW_DEFAULTS.checkIntervalMinutes;
  fields.maxWordsPerSession.value = settings.maxWordsPerSession || REVIEW_DEFAULTS.maxWordsPerSession;
  fields.popupCooldownMinutes.value = settings.popupCooldownMinutes || REVIEW_DEFAULTS.popupCooldownMinutes;
  fields.autoOpenReview.checked = !!settings.autoOpenReview;
  fields.strictMode.checked = settings.strictMode !== false;
}

function readSettings() {
  return {
    supabaseUrl: fields.supabaseUrl.value.trim().replace(/\/+$/, ""),
    supabaseAnonKey: fields.supabaseAnonKey.value.trim(),
    appUrl: fields.appUrl.value.trim() || REVIEW_DEFAULTS.appUrl,
    checkIntervalMinutes: Math.max(5, Number(fields.checkIntervalMinutes.value) || REVIEW_DEFAULTS.checkIntervalMinutes),
    maxWordsPerSession: Math.max(1, Number(fields.maxWordsPerSession.value) || REVIEW_DEFAULTS.maxWordsPerSession),
    popupCooldownMinutes: Math.max(5, Number(fields.popupCooldownMinutes.value) || REVIEW_DEFAULTS.popupCooldownMinutes),
    autoOpenReview: fields.autoOpenReview.checked,
    strictMode: fields.strictMode.checked
  };
}

async function saveSettings() {
  const settings = readSettings();
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
  await chrome.alarms.create("nihongo-review-check", {
    periodInMinutes: settings.checkIntervalMinutes
  });
  statusEl.textContent = "Đã lưu cấu hình.";
  statusEl.style.color = "#1f5f4a";
}

document.getElementById("save-btn").addEventListener("click", saveSettings);

document.getElementById("test-btn").addEventListener("click", async () => {
  await saveSettings();
  statusEl.textContent = "Đang kiểm tra từ đến hạn...";
  chrome.runtime.sendMessage({ type: "CHECK_DUE", openWindow: true }, response => {
    if (!response?.ok) {
      statusEl.textContent = response?.error || "Không kiểm tra được.";
      statusEl.style.color = "#B42318";
      return;
    }
    statusEl.textContent = response.configured
      ? `Tìm thấy ${response.count} từ đến hạn.`
      : "Cần cấu hình Supabase trước.";
    statusEl.style.color = "#1f5f4a";
  });
});

loadSettings();
