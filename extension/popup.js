const STORAGE_KEY = "nihongoReviewSettings";
const statusEl = document.getElementById("status");

async function getSettings() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return { ...REVIEW_DEFAULTS, ...(data[STORAGE_KEY] || {}) };
}

document.getElementById("review-now").addEventListener("click", () => {
  statusEl.textContent = "Đang kiểm tra...";
  chrome.runtime.sendMessage({ type: "CHECK_DUE", openWindow: true }, response => {
    if (!response?.ok) {
      statusEl.textContent = response?.error || "Không kiểm tra được.";
      statusEl.style.color = "#B42318";
      return;
    }
    statusEl.textContent = response.count ? `Đã mở ${response.count} từ cần ôn.` : "Chưa có từ đến hạn.";
    statusEl.style.color = "#1f5f4a";
  });
});

document.getElementById("open-app").addEventListener("click", async () => {
  const settings = await getSettings();
  chrome.tabs.create({ url: settings.appUrl || REVIEW_DEFAULTS.appUrl });
});

document.getElementById("open-options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
