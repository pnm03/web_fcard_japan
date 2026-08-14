import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import {
  isPermissionGranted,
  onAction,
  requestPermission,
  sendNotification
} from "@tauri-apps/plugin-notification";
import { getReviewDueVocab } from "./storage.js";
import { getDueGoalSessions } from "./goals.js";
import { getLearningGoals } from "./goals.js";
import { getGoalScheduleSnapshot } from "./goal-planner.js";

const DESKTOP_SETTINGS_KEY = "nihongo_desktop_settings";
const CHECK_INTERVAL_MS = 15 * 60 * 1000;
const GOAL_CHECK_INTERVAL_MS = 60 * 1000;
const NOTIFICATION_COOLDOWN_MS = 60 * 60 * 1000;

const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  lastNotificationAt: 0,
  lastNotificationSignature: "",
  lastGoalNotificationAt: 0,
  lastGoalNotificationSignature: ""
};

let desktopSettings = { ...DEFAULT_SETTINGS };
let reviewIntervalId = null;
let goalIntervalId = null;

async function publishGoalScheduleToNative() {
  const sessions = desktopSettings.notificationsEnabled
    ? getGoalScheduleSnapshot(getLearningGoals())
    : [];
  await invoke("update_learning_schedule", { sessions });
  return sessions.length;
}

function loadDesktopSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(DESKTOP_SETTINGS_KEY) || "{}");
    desktopSettings = { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    desktopSettings = { ...DEFAULT_SETTINGS };
  }
  return desktopSettings;
}

function saveDesktopSettings(patch = {}) {
  desktopSettings = { ...desktopSettings, ...patch };
  localStorage.setItem(DESKTOP_SETTINGS_KEY, JSON.stringify(desktopSettings));
  return desktopSettings;
}

function setDesktopMessage(text = "", tone = "") {
  const message = document.getElementById("desktop-settings-message");
  if (!message) return;
  message.textContent = text;
  message.className = `account-message${tone ? ` ${tone}` : ""}`;
}

async function ensureNotificationPermission() {
  if (await isPermissionGranted()) return true;
  return (await requestPermission()) === "granted";
}

async function focusReviewCenter() {
  const currentWindow = getCurrentWindow();
  await currentWindow.show();
  await currentWindow.unminimize();
  await currentWindow.setFocus();
  window.dispatchEvent(new CustomEvent("nihongo:desktop-review-requested"));
}

async function focusLearningGoals() {
  const currentWindow = getCurrentWindow();
  await currentWindow.show();
  await currentWindow.unminimize();
  await currentWindow.setFocus();
  window.dispatchEvent(new CustomEvent("nihongo:desktop-goal-requested"));
}

async function notifyDueWords({ force = false } = {}) {
  if (!desktopSettings.notificationsEnabled && !force) return { count: 0, skipped: true };

  const overdueWords = getReviewDueVocab(50, "overdue");
  if (overdueWords.length === 0 && !force) return { count: 0 };

  const signature = overdueWords.map(word => word.id).sort().join("|");
  const now = Date.now();
  const withinCooldown = now - desktopSettings.lastNotificationAt < NOTIFICATION_COOLDOWN_MS;
  if (!force && withinCooldown && signature === desktopSettings.lastNotificationSignature) {
    return { count: overdueWords.length, skipped: true };
  }

  if (!(await ensureNotificationPermission())) {
    setDesktopMessage("Windows chưa cấp quyền gửi thông báo.", "error");
    return { count: overdueWords.length, denied: true };
  }

  const count = overdueWords.length;
  sendNotification({
    id: 901,
    title: force ? "Thông báo Nihongo đã hoạt động" : "Đến hạn ôn tiếng Nhật",
    body: force
      ? "Ứng dụng sẽ nhắc bạn ngay cả khi cửa sổ được thu nhỏ xuống khay hệ thống."
      : `${count} từ đang quá hạn. Mở Nihongo Flashcard để kiểm tra lại.`,
    autoCancel: true,
    extra: { action: "open-review" }
  });

  if (!force) {
    saveDesktopSettings({
      lastNotificationAt: now,
      lastNotificationSignature: signature
    });
  }

  return { count };
}

async function notifyDueGoalSessions() {
  // Lịch mục tiêu trên desktop được Rust giữ và nhắc độc lập với WebView.
  if (isTauri()) return { count: 0, native: true };
  if (!desktopSettings.notificationsEnabled) return { count: 0, skipped: true };
  const dueSessions = getDueGoalSessions();
  if (!dueSessions.length) return { count: 0 };

  const signature = dueSessions.map(session => session.id).sort().join("|");
  const now = Date.now();
  if (
    signature === desktopSettings.lastGoalNotificationSignature
    && now - desktopSettings.lastGoalNotificationAt < NOTIFICATION_COOLDOWN_MS
  ) {
    return { count: dueSessions.length, skipped: true };
  }

  if (!(await ensureNotificationPermission())) return { count: dueSessions.length, denied: true };
  const next = dueSessions[0];
  const hoursLeft = Math.max(0, (next.goal.deadlineAt - now) / (60 * 60 * 1000));
  const deadlineText = hoursLeft < 24
    ? `còn ${Math.max(1, Math.round(hoursLeft))} giờ`
    : `còn ${Math.max(1, Math.round(hoursLeft / 24))} ngày`;

  sendNotification({
    id: 902,
    title: `Đến giờ: ${next.goal.title}`,
    body: `${next.vocabIds.length} từ · khoảng ${next.durationMinutes} phút · ${deadlineText}.`,
    autoCancel: true,
    extra: { action: "open-goal", goalId: next.goal.id }
  });
  saveDesktopSettings({
    lastGoalNotificationAt: now,
    lastGoalNotificationSignature: signature
  });
  return { count: dueSessions.length };
}

async function setupDesktopSettingsUI() {
  const notificationsInput = document.getElementById("desktop-notifications-enabled");
  const autostartInput = document.getElementById("desktop-autostart-enabled");
  const testButton = document.getElementById("desktop-test-notification-btn");

  if (notificationsInput) {
    notificationsInput.checked = desktopSettings.notificationsEnabled;
    notificationsInput.addEventListener("change", async () => {
      if (notificationsInput.checked && !(await ensureNotificationPermission())) {
        notificationsInput.checked = false;
        saveDesktopSettings({ notificationsEnabled: false });
        setDesktopMessage("Windows chưa cấp quyền gửi thông báo.", "error");
        return;
      }
      saveDesktopSettings({ notificationsEnabled: notificationsInput.checked });
      await publishGoalScheduleToNative();
      setDesktopMessage("Đã lưu cài đặt thông báo.", "success");
    });
  }

  if (autostartInput) {
    autostartInput.checked = await isEnabled();
    autostartInput.addEventListener("change", async () => {
      autostartInput.disabled = true;
      try {
        if (autostartInput.checked) await enable();
        else await disable();
        autostartInput.checked = await isEnabled();
        setDesktopMessage(
          autostartInput.checked ? "Ứng dụng sẽ chạy cùng Windows." : "Đã tắt khởi động cùng Windows.",
          "success"
        );
      } catch (error) {
        autostartInput.checked = await isEnabled().catch(() => false);
        setDesktopMessage(error?.message || "Chưa đổi được cài đặt khởi động.", "error");
      } finally {
        autostartInput.disabled = false;
      }
    });
  }

  testButton?.addEventListener("click", async () => {
    testButton.disabled = true;
    setDesktopMessage("Đang gửi thông báo thử...");
    try {
      await notifyDueWords({ force: true });
      setDesktopMessage("Đã gửi thông báo thử.", "success");
    } catch (error) {
      setDesktopMessage(error?.message || "Chưa gửi được thông báo.", "error");
    } finally {
      testButton.disabled = false;
    }
  });
}

export async function initDesktopRuntime() {
  if (!isTauri()) return false;

  document.documentElement.dataset.desktopApp = "true";
  document.body.classList.add("desktop-app");
  loadDesktopSettings();

  try {
    await Promise.all([
      listen("desktop-review-requested", focusReviewCenter),
      listen("desktop-goal-requested", focusLearningGoals),
      onAction(notification => {
        if (notification?.extra?.action === "open-review") focusReviewCenter();
        if (notification?.extra?.action === "open-goal") {
          const currentWindow = getCurrentWindow();
          currentWindow.show();
          currentWindow.unminimize();
          currentWindow.setFocus();
          window.dispatchEvent(new CustomEvent("nihongo:desktop-goal-requested", {
            detail: { goalId: notification.extra.goalId }
          }));
        }
      }),
      setupDesktopSettingsUI()
    ]);
    await publishGoalScheduleToNative();

    window.setTimeout(() => {
      notifyDueWords().catch(console.warn);
      notifyDueGoalSessions().catch(console.warn);
    }, 12_000);
    reviewIntervalId = window.setInterval(
      () => notifyDueWords().catch(console.warn),
      CHECK_INTERVAL_MS
    );
    goalIntervalId = window.setInterval(
      () => notifyDueGoalSessions().catch(console.warn),
      GOAL_CHECK_INTERVAL_MS
    );
    window.addEventListener("nihongo:goals-updated", () => {
      publishGoalScheduleToNative().catch(console.warn);
      window.setTimeout(() => notifyDueGoalSessions().catch(console.warn), 800);
    });
  } catch (error) {
    console.error("Không khởi tạo được tính năng desktop:", error);
    setDesktopMessage(error?.message || "Tính năng desktop chưa khởi tạo được.", "error");
  }

  window.addEventListener("beforeunload", () => {
    if (reviewIntervalId) window.clearInterval(reviewIntervalId);
    if (goalIntervalId) window.clearInterval(goalIntervalId);
  }, { once: true });

  return true;
}
