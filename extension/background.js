importScripts("scheduler.js");

const STORAGE_KEY = "nihongoReviewSettings";

async function getSettings() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return { ...REVIEW_DEFAULTS, ...(data[STORAGE_KEY] || {}) };
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}

function supabaseHeaders(settings) {
  return {
    apikey: settings.supabaseAnonKey,
    Authorization: `Bearer ${settings.supabaseAnonKey}`,
    "Content-Type": "application/json"
  };
}

async function supabaseFetch(settings, path, options = {}) {
  const base = (settings.supabaseUrl || "").replace(/\/+$/, "");
  if (!base || !settings.supabaseAnonKey) {
    throw new Error("Chưa cấu hình Supabase URL/Anon key.");
  }

  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...supabaseHeaders(settings),
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

async function loadDueWords(settings) {
  const [projects, rows] = await Promise.all([
    supabaseFetch(settings, "projects?select=id,name"),
    supabaseFetch(settings, "vocab?select=*&order=next_review_at.asc.nullslast&limit=1000")
  ]);
  const projectMap = new Map((projects || []).map(project => [project.id, project.name]));
  const words = (rows || []).map(row => normalizeDbVocab(row, projectMap.get(row.project_id) || ""));
  const now = Date.now();

  return words
    .filter(word => reviewStatus(word, now).needsReview)
    .sort((a, b) => {
      const statusA = reviewStatus(a, now);
      const statusB = reviewStatus(b, now);
      const rank = status => status.isOverdue ? 0 : status.isHardRecentCorrect ? 1 : status.isStale ? 2 : status.isDueSoon ? 3 : 4;
      const rankDiff = rank(statusA) - rank(statusB);
      if (rankDiff !== 0) return rankDiff;
      return (a.nextReviewAt || Number.MAX_SAFE_INTEGER) - (b.nextReviewAt || Number.MAX_SAFE_INTEGER);
    })
    .slice(0, settings.maxWordsPerSession || REVIEW_DEFAULTS.maxWordsPerSession);
}

async function openReviewWindow(force = false) {
  const settings = await getSettings();
  if (!settings.autoOpenReview && !force) return;

  const now = Date.now();
  const cooldownMs = (settings.popupCooldownMinutes || REVIEW_DEFAULTS.popupCooldownMinutes) * 60 * 1000;
  if (!force && settings.lastPopupAt && now - settings.lastPopupAt < cooldownMs) return;

  settings.lastPopupAt = now;
  await saveSettings(settings);

  await chrome.windows.create({
    url: chrome.runtime.getURL("review.html"),
    type: "popup",
    state: "maximized",
    focused: true
  });
}

async function checkDueWords({ openWindow = false } = {}) {
  const settings = await getSettings();
  if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
    await chrome.action.setBadgeText({ text: "!" });
    await chrome.action.setBadgeBackgroundColor({ color: "#B42318" });
    return { count: 0, configured: false };
  }

  const dueWords = await loadDueWords(settings);
  await chrome.action.setBadgeText({ text: dueWords.length ? String(dueWords.length) : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#B42318" });

  if (dueWords.length > 0) {
    await chrome.notifications.create("nihongo-review-due", {
      type: "basic",
      iconUrl: "icon.svg",
      title: "Đến hạn ôn tiếng Nhật",
      message: `${dueWords.length} từ cần kiểm tra lại ngay.`
    });

    if (openWindow || settings.autoOpenReview) {
      await openReviewWindow(openWindow);
    }
  }

  return { count: dueWords.length, configured: true };
}

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  await saveSettings(settings);
  chrome.alarms.create("nihongo-review-check", {
    periodInMinutes: settings.checkIntervalMinutes || REVIEW_DEFAULTS.checkIntervalMinutes
  });
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings();
  chrome.alarms.create("nihongo-review-check", {
    periodInMinutes: settings.checkIntervalMinutes || REVIEW_DEFAULTS.checkIntervalMinutes
  });
  checkDueWords().catch(console.error);
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "nihongo-review-check") {
    checkDueWords().catch(console.error);
  }
});

chrome.notifications.onClicked.addListener(notificationId => {
  if (notificationId === "nihongo-review-due") {
    openReviewWindow(true).catch(console.error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "CHECK_DUE") {
    checkDueWords({ openWindow: !!message.openWindow })
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});
