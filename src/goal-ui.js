import { buildGoalPlan, GOAL_MODE_LABELS, SESSION_META } from "./goal-planner.js";
import {
  completeGoalSession,
  createLearningGoal,
  deleteLearningGoal,
  getGoalNextSession,
  getGoalVocabulary,
  getLearningGoal,
  getLearningGoals,
  skipGoalSession,
  snoozeGoalSession,
  updateLearningGoal
} from "./goals.js";
import { getProjects } from "./storage.js";

const HOUR_MS = 60 * 60 * 1000;
let selectedGoalId = null;
let selectedVocabIds = new Set();
let startQuizCallback = null;
let switchViewCallback = null;
let speakJapaneseCallback = null;
let primerState = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateTime(timestamp) {
  if (!timestamp) return "Chưa lên lịch";
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function formatClock(timestamp) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
}

function formatRelative(timestamp, now = Date.now()) {
  const deltaMinutes = Math.round((timestamp - now) / 60000);
  if (Math.abs(deltaMinutes) < 2) return "Ngay bây giờ";
  if (deltaMinutes < 0) {
    const overdue = Math.abs(deltaMinutes);
    if (overdue < 60) return `Quá ${overdue} phút`;
    if (overdue < 1440) return `Quá ${Math.round(overdue / 60)} giờ`;
    return `Quá ${Math.round(overdue / 1440)} ngày`;
  }
  if (deltaMinutes < 60) return `Sau ${deltaMinutes} phút`;
  if (deltaMinutes < 1440) return `Sau ${Math.round(deltaMinutes / 60)} giờ`;
  return `Sau ${Math.round(deltaMinutes / 1440)} ngày`;
}

function goalStatusLabel(status) {
  return {
    active: "Đang chạy",
    completed: "Hoàn thành",
    expired: "Hết hạn",
    paused: "Tạm dừng"
  }[status] || status;
}

function itemStatusLabel(status) {
  return {
    new: "Từ mới",
    learning: "Đang học",
    at_risk: "Nguy cơ",
    verified: "Đã xác nhận"
  }[status] || status;
}

function baselineClassLabel(value) {
  return {
    pending: "Chưa đo",
    known_fast: "Đã biết, phản xạ nhanh",
    known_slow: "Đã biết nhưng còn chậm",
    recognition_only: "Mới nhận diện",
    failed: "Chưa nhớ"
  }[value] || value;
}

function setModalOpen(modal, open) {
  modal?.classList.toggle("active", open);
  if (open) {
    document.body.dataset.goalModalScroll = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";
  } else if (!document.querySelector(".goal-create-overlay.active, .goal-primer-overlay.active")) {
    document.body.style.overflow = document.body.dataset.goalModalScroll || "";
    delete document.body.dataset.goalModalScroll;
  }
}

function allVocabulary() {
  return getProjects().flatMap(project => project.vocab.map(vocab => ({
    ...vocab,
    projectId: project.id,
    projectName: project.name
  })));
}

function selectedModes() {
  return [...document.querySelectorAll('input[name="goal-mode"]:checked')].map(input => input.value);
}

function parseAvailability(value) {
  return String(value || "")
    .split(",")
    .map(part => part.trim().match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/))
    .filter(Boolean)
    .map(match => ({ start: match[1], end: match[2] }));
}

function formScheduleSettings() {
  const wakeTime = document.getElementById("goal-wake-time")?.value || "06:30";
  const sleepTime = document.getElementById("goal-sleep-time")?.value || "23:00";
  const availability = parseAvailability(document.getElementById("goal-availability")?.value);
  const weekend = parseAvailability(document.getElementById("goal-weekend-availability")?.value);
  const weekday = availability.length ? availability : undefined;
  const weekendWindows = weekend.length ? weekend : weekday;
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh",
    wakeTime,
    sleepTime,
    quietStart: sleepTime,
    quietEnd: wakeTime,
    availability: weekday ? {
      0: weekendWindows,
      1: weekday,
      2: weekday,
      3: weekday,
      4: weekday,
      5: weekday,
      6: weekendWindows
    } : undefined,
    maximumNotificationsPerDay: Number(document.getElementById("goal-notification-limit")?.value || 5),
    snoozeMinutes: Number(document.getElementById("goal-snooze-minutes")?.value || 30)
  };
}

function getDeadlineAt() {
  const duration = document.getElementById("goal-duration-hours")?.value || "24";
  if (duration === "custom") {
    return Date.parse(document.getElementById("goal-custom-deadline")?.value || "");
  }
  if (duration === "today") {
    const deadline = new Date();
    deadline.setHours(22, 0, 0, 0);
    if (deadline.getTime() - Date.now() < 4 * HOUR_MS) deadline.setDate(deadline.getDate() + 1);
    return deadline.getTime();
  }
  return Date.now() + Number(duration) * HOUR_MS;
}

function renderGoalWordPicker() {
  const root = document.getElementById("goal-word-picker");
  if (!root) return;
  const query = (document.getElementById("goal-word-search")?.value || "").trim().toLowerCase();
  const projects = getProjects();

  root.innerHTML = projects.map(project => {
    const words = project.vocab.filter(vocab => (
      !query || `${vocab.japanese} ${vocab.romaji} ${vocab.meaning}`.toLowerCase().includes(query)
    ));
    if (!words.length) return "";
    return `
      <section class="goal-picker-project">
        <h4>${escapeHtml(project.name)} · ${words.length} từ</h4>
        ${words.map(vocab => `
          <label class="goal-picker-word ${selectedVocabIds.has(vocab.id) ? "selected" : ""}">
            <input type="checkbox" data-goal-vocab-id="${escapeHtml(vocab.id)}" ${selectedVocabIds.has(vocab.id) ? "checked" : ""}>
            <span class="jp">${escapeHtml(vocab.japanese)}</span>
            <span>${escapeHtml(vocab.romaji)}</span>
            <span class="meaning" title="${escapeHtml(vocab.meaning)}">${escapeHtml(vocab.meaning)}</span>
          </label>
        `).join("")}
      </section>
    `;
  }).join("") || '<p class="goal-preview-note" style="padding:16px;">Không tìm thấy từ phù hợp.</p>';

  document.getElementById("goal-selected-count").textContent = `${selectedVocabIds.size} từ`;
}

function renderGoalPlanPreview() {
  const root = document.getElementById("goal-plan-preview");
  if (!root) return;
  const deadlineAt = getDeadlineAt();
  const modes = selectedModes();
  const dailyMinutes = Number(document.getElementById("goal-daily-minutes")?.value || 30);

  if (!selectedVocabIds.size || !Number.isFinite(deadlineAt) || deadlineAt <= Date.now()) {
    root.innerHTML = `
      <div class="goal-preview-hero">
        <strong class="goal-preview-number">—</strong>
        <p class="goal-preview-summary">Chọn từ và deadline để hệ thống mô phỏng kế hoạch.</p>
      </div>
    `;
    return;
  }

  const plan = buildGoalPlan({
    goalId: "preview",
    vocabIds: [...selectedVocabIds],
    modes,
    startsAt: Date.now(),
    deadlineAt,
    dailyMinutes,
    scheduleSettings: formScheduleSettings()
  });
  const feasibilityLabels = {
    comfortable: "Khả thi",
    tight: "Khá căng",
    overload: "Quá tải"
  };

  root.innerHTML = `
    <div class="goal-preview-hero">
      <strong class="goal-preview-number">${plan.estimate.totalMinutes}</strong>
      <span>phút dự kiến · ${plan.estimate.sessionCount} buổi</span>
      <p class="goal-preview-summary">
        <span class="goal-feasibility-badge ${plan.estimate.feasibility}">${feasibilityLabels[plan.estimate.feasibility]}</span>
        ${selectedVocabIds.size} từ · ${Math.round(plan.horizonHours)} giờ · mục tiêu ${Math.round(Number(document.getElementById("goal-retention")?.value || 0.9) * 100)}%
      </p>
    </div>
    <div class="goal-preview-timeline">
      ${plan.sessions.map(session => `
        <div class="goal-preview-session">
          <time>${formatClock(session.scheduledAt)}</time>
          <strong>${escapeHtml(SESSION_META[session.type]?.shortLabel || session.type)}</strong>
          <span>${session.durationMinutes}p</span>
        </div>
      `).join("")}
    </div>
    <p class="goal-preview-note">Bạn sẽ làm một bài đo đầu vào trước. Sau đó lịch tự xếp quanh giờ sinh hoạt và lập lại nếu bỏ lỡ.</p>
  `;
}

function resetGoalForm() {
  selectedVocabIds = new Set();
  document.getElementById("goal-create-form")?.reset();
  document.getElementById("goal-duration-hours").value = "24";
  document.querySelectorAll("#goal-duration-options button").forEach(button => {
    button.classList.toggle("active", button.dataset.hours === "24");
  });
  document.getElementById("goal-custom-deadline").hidden = true;
  document.getElementById("goal-create-message").textContent = "";
  renderGoalWordPicker();
  renderGoalPlanPreview();
}

function openCreateGoalModal() {
  resetGoalForm();
  setModalOpen(document.getElementById("goal-create-modal"), true);
  setTimeout(() => document.getElementById("goal-title-input")?.focus(), 80);
}

function closeCreateGoalModal() {
  setModalOpen(document.getElementById("goal-create-modal"), false);
}

function renderGoalList(goals, activeId) {
  return `
    <aside class="goal-list-panel">
      <div class="goal-list-heading">Các mục tiêu</div>
      ${goals.map(goal => `
        <button type="button" class="goal-list-item ${goal.id === activeId ? "active" : ""}" data-goal-select="${escapeHtml(goal.id)}">
          <strong>${escapeHtml(goal.title)}</strong>
          <span>${goal.progress.verified}/${goal.progress.total} từ · ${formatRelative(goal.deadlineAt)}</span>
          <span class="goal-list-progress"><i style="width:${goal.progress.percent}%"></i></span>
        </button>
      `).join("")}
    </aside>
  `;
}

function renderGoalTimeline(goal, now) {
  return `
    <div class="goal-timeline">
      ${goal.sessions.map(session => {
        const due = session.status === "pending" && session.scheduledAt <= now;
        return `
          <div class="goal-timeline-item ${session.status} ${due ? "due" : ""}">
            <time>${formatDateTime(session.scheduledAt)}</time>
            <strong>${escapeHtml(SESSION_META[session.type]?.shortLabel || session.type)}</strong>
            <small>${session.vocabIds.length} từ · ${session.durationMinutes} phút</small>
            <small>${session.status === "completed" ? `Đã xong · ${session.resultSummary?.accuracy ?? 0}%` : due ? "Đang đến hạn" : formatRelative(session.scheduledAt, now)}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderGoalWordTable(goal) {
  const words = getGoalVocabulary(goal).sort((a, b) => b.goalItem.riskScore - a.goalItem.riskScore);
  return `
    <div class="goal-word-table-wrap">
      <table class="goal-word-table">
        <thead><tr><th>Từ</th><th>Nghĩa</th><th>Đầu vào</th><th>Nguy cơ</th><th>Nhớ thấp nhất</th><th>Buổi đúng</th></tr></thead>
        <tbody>
          ${words.map(word => {
            const item = word.goalItem;
            const riskColor = item.riskScore >= 65 ? "var(--error)" : item.riskScore >= 35 ? "var(--warning)" : "var(--good)";
            return `
              <tr>
                <td class="goal-word-main"><strong>${escapeHtml(word.japanese)}</strong><span>${escapeHtml(word.romaji)}</span></td>
                <td>${escapeHtml(word.meaning)}</td>
                <td><span class="goal-word-status ${item.status}">${escapeHtml(baselineClassLabel(item.baselineClass))}</span></td>
                <td><span class="goal-risk-meter"><i style="--risk-width:${item.riskScore}%;--risk-color:${riskColor}"></i>${item.riskScore}</span></td>
                <td>${Math.round(item.predictedRetention * 100)}%</td>
                <td>${item.correctSessions}/${item.requiredSessions}${item.separatedRecall ? " · cách quãng" : ""}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function goalQuizConfig(goal, session) {
  const modes = goal.modes.length ? goal.modes : ["meaning_to_romaji"];
  const modeIndex = Math.max(0, (session.sequence - 1) % modes.length);
  const sessionMode = session.type === "mixed" ? "mixed" : modes[modeIndex];
  const ensureModeCoverage = session.type === "final";
  const baseline = session.type === "baseline";
  return {
    vocabIds: session.vocabIds,
    questionCount: (ensureModeCoverage || baseline) ? session.vocabIds.length * modes.length : session.vocabIds.length,
    quizMode: (ensureModeCoverage || baseline) ? "mixed" : sessionMode,
    quizModes: modes,
    ensureModeCoverage: ensureModeCoverage || baseline,
    order: "random",
    allowRetry: true,
    repeatWrongPractice: true,
    answerSource: "selected",
    desiredRetention: goal.desiredRetention,
    fsrsParameters: goal.fsrsProfile,
    goalContext: {
      goalId: goal.id,
      sessionId: session.id,
      sessionType: session.type
    }
  };
}

function ensurePrimerModal() {
  if (document.getElementById("goal-primer-modal")) return;
  const modal = document.createElement("div");
  modal.id = "goal-primer-modal";
  modal.className = "modal-overlay goal-primer-overlay";
  modal.innerHTML = `
    <div class="modal-container goal-primer-modal" role="dialog" aria-modal="true" aria-labelledby="goal-primer-title">
      <header class="goal-create-header">
        <div><span>Active recall primer</span><h2 id="goal-primer-title">Nạp nhóm từ đầu tiên</h2></div>
        <button type="button" class="modal-close-btn" id="close-goal-primer-btn" aria-label="Đóng">×</button>
      </header>
      <div class="goal-primer-body">
        <div class="goal-primer-progress"><span id="goal-primer-progress-fill"></span></div>
        <p id="goal-primer-instruction"></p>
        <div class="goal-primer-words" id="goal-primer-words"></div>
      </div>
      <footer class="goal-primer-actions">
        <button type="button" class="btn btn-secondary" id="goal-primer-prev-btn">Nhóm trước</button>
        <button type="button" class="btn btn-primary" id="goal-primer-next-btn">Nhóm tiếp theo</button>
      </footer>
    </div>
  `;
  document.getElementById("app").appendChild(modal);
  modal.addEventListener("click", event => {
    if (event.target === modal) closePrimer();
  });
  modal.querySelector("#close-goal-primer-btn").onclick = closePrimer;
  modal.querySelector("#goal-primer-prev-btn").onclick = () => {
    primerState.batchIndex = Math.max(0, primerState.batchIndex - 1);
    renderPrimer();
  };
  modal.querySelector("#goal-primer-next-btn").onclick = advancePrimer;
}

function closePrimer() {
  primerState = null;
  setModalOpen(document.getElementById("goal-primer-modal"), false);
}

function renderPrimer() {
  if (!primerState) return;
  const { words, batchIndex } = primerState;
  const batches = Math.ceil(words.length / 5);
  const batch = words.slice(batchIndex * 5, batchIndex * 5 + 5);
  document.getElementById("goal-primer-title").textContent = `Nhóm ${batchIndex + 1}/${batches} · ${batch.length} từ`;
  document.getElementById("goal-primer-progress-fill").style.width = `${((batchIndex + 1) / batches) * 100}%`;
  document.getElementById("goal-primer-instruction").textContent = "Nhìn ngắn, nghe phát âm, rồi tự nhẩm lại trước khi chuyển nhóm. Đừng cố đọc lặp vô thức.";
  document.getElementById("goal-primer-words").innerHTML = batch.map((word, index) => `
    <article class="goal-primer-word">
      <span>${String(batchIndex * 5 + index + 1).padStart(2, "0")}</span>
      <div><strong>${escapeHtml(word.japanese)}</strong><small>${escapeHtml(word.romaji)}</small></div>
      <p>${escapeHtml(word.meaning)}</p>
      <button type="button" class="btn btn-secondary btn-icon" data-primer-speak="${escapeHtml(word.id)}" title="Nghe phát âm">♪</button>
    </article>
  `).join("");
  document.querySelectorAll("[data-primer-speak]").forEach(button => {
    button.onclick = () => {
      const word = words.find(item => item.id === button.dataset.primerSpeak);
      if (word) speakJapaneseCallback?.(word.japanese, true);
    };
  });
  document.getElementById("goal-primer-prev-btn").disabled = batchIndex === 0;
  const nextButton = document.getElementById("goal-primer-next-btn");
  nextButton.textContent = batchIndex === batches - 1 ? "Che lại & bắt đầu gọi nhớ" : "Nhóm tiếp theo";
}

function advancePrimer() {
  if (!primerState) return;
  const batches = Math.ceil(primerState.words.length / 5);
  if (primerState.batchIndex < batches - 1) {
    primerState.batchIndex += 1;
    renderPrimer();
    return;
  }
  const { goal, session } = primerState;
  session.primedAt = Date.now();
  updateLearningGoal({
    ...goal,
    sessions: goal.sessions.map(item => item.id === session.id ? session : item)
  });
  closePrimer();
  startQuizCallback?.(goalQuizConfig(goal, session));
}

function startGoalSession(goal, session) {
  if (!session?.vocabIds?.length) {
    alert("Buổi này hiện không còn từ cần học.");
    return;
  }
  if (session.type === "acquisition" && !session.primedAt) {
    ensurePrimerModal();
    primerState = {
      goal,
      session: { ...session },
      words: getGoalVocabulary(goal).filter(word => session.vocabIds.includes(word.id)),
      batchIndex: 0
    };
    renderPrimer();
    setModalOpen(document.getElementById("goal-primer-modal"), true);
    return;
  }
  startQuizCallback?.(goalQuizConfig(goal, session));
}

function renderGoalDetail(goal) {
  const now = Date.now();
  const nextSession = getGoalNextSession(goal, now);
  const modeLabels = goal.modes.map(mode => GOAL_MODE_LABELS[mode] || mode).join(" · ");
  return `
    <div class="goal-detail">
      <header class="goal-detail-hero">
        <div>
          <div class="goal-detail-title-line">
            <h2>${escapeHtml(goal.title)}</h2>
            <span class="goal-status-pill ${goal.status}">${goalStatusLabel(goal.status)}</span>
          </div>
          <p class="goal-detail-subtitle">Hạn ${formatDateTime(goal.deadlineAt)} · Mục tiêu ${Math.round(goal.desiredRetention * 100)}% · ${escapeHtml(modeLabels)}</p>
        </div>
        <div class="goal-hero-actions">
          ${nextSession && goal.status === "active" ? '<button type="button" class="btn btn-primary" id="goal-start-next-btn">Học buổi tiếp theo</button>' : ""}
          <button type="button" class="btn btn-secondary" id="goal-delete-btn">Xóa mục tiêu</button>
        </div>
      </header>

      <div class="goal-progress-strip">
        <div class="goal-progress-main">
          <header><span>Tiến độ xác nhận</span><strong>${goal.progress.percent}%</strong></header>
          <div class="goal-progress-track"><span style="width:${goal.progress.percent}%"></span></div>
        </div>
        <div class="goal-stat-cell"><span>Đã thuộc</span><strong>${goal.progress.verified}/${goal.progress.total}</strong></div>
        <div class="goal-stat-cell"><span>Nguy cơ</span><strong>${goal.progress.atRisk}</strong></div>
        <div class="goal-stat-cell"><span>Nhớ tại hạn</span><strong>${goal.progress.predictedRetention}%</strong></div>
        <div class="goal-stat-cell"><span>Còn lại</span><strong>${formatRelative(goal.deadlineAt, now)}</strong></div>
      </div>

      ${nextSession ? `
        <section class="goal-next-session">
          <div class="goal-next-time">${formatClock(nextSession.scheduledAt)}<br>${formatRelative(nextSession.scheduledAt, now)}</div>
          <div><h3>${escapeHtml(SESSION_META[nextSession.type]?.label || nextSession.type)}</h3><p>${nextSession.vocabIds.length} từ · khoảng ${nextSession.durationMinutes} phút · ${nextSession.type === "baseline" ? "chưa tính là đã thuộc, dùng để dựng lịch đúng sức" : "đã ưu tiên nhóm có nguy cơ cao"}</p></div>
          <div class="goal-hero-actions">
            <button type="button" class="btn btn-primary" id="goal-start-session-btn">${nextSession.scheduledAt <= now ? "Bắt đầu ngay" : "Học sớm"}</button>
            ${nextSession.scheduledAt <= now ? `<button type="button" class="btn btn-secondary" id="goal-snooze-session-btn">Nhắc sau ${goal.scheduleSettings?.snoozeMinutes || 30}p</button>` : ""}
          </div>
        </section>
      ` : ""}

      <section class="goal-detail-section">
        <header><div><h3>Lịch học thích ứng</h3><p>Mỗi buổi tự thu gọn; lịch sẽ được dựng đầy đủ sau đánh giá đầu vào.</p></div></header>
        ${renderGoalTimeline(goal, now)}
      </section>

      ${goal.replanning?.count ? `<section class="goal-replan-note"><strong>Đã lập lại lịch ${goal.replanning.count} lần</strong><span>Còn ${goal.replanning.remainingWords} từ · ${goal.replanning.requiredMinutes} phút · mức ${goal.replanning.feasibility}</span></section>` : ""}

      <section class="goal-detail-section">
        <header><div><h3>Bản đồ ghi nhớ</h3><p>Xếp theo nguy cơ cao trước. Lần sửa ngay sau gợi ý không được tính là đã thuộc.</p></div></header>
        ${renderGoalWordTable(goal)}
      </section>
    </div>
  `;
}

function bindGoalDetailEvents(goal) {
  const nextSession = getGoalNextSession(goal);
  document.getElementById("goal-start-next-btn")?.addEventListener("click", () => startGoalSession(goal, nextSession));
  document.getElementById("goal-start-session-btn")?.addEventListener("click", () => startGoalSession(goal, nextSession));
  document.getElementById("goal-snooze-session-btn")?.addEventListener("click", () => {
    snoozeGoalSession(goal.id, nextSession.id, goal.scheduleSettings?.snoozeMinutes || 30);
    renderLearningGoalsView(goal.id);
  });
  document.getElementById("goal-delete-btn")?.addEventListener("click", () => {
    if (!confirm(`Xóa mục tiêu “${goal.title}”? Lịch sử kiểm tra từ vựng vẫn được giữ.`)) return;
    deleteLearningGoal(goal.id);
    selectedGoalId = null;
    renderLearningGoalsView();
  });
}

export function renderLearningGoalsView(preferredGoalId = selectedGoalId) {
  const root = document.getElementById("learning-goals-root");
  if (!root) return;
  const goals = getLearningGoals();
  if (!goals.length) {
    selectedGoalId = null;
    root.innerHTML = `
      <div class="goal-empty-state">
        <div><span class="goal-empty-mark">目</span><h2>Chưa có mục tiêu học</h2><p>Chọn một nhóm từ, đặt deadline, rồi hệ thống sẽ chia thành các lượt gọi nhớ cách quãng và một bài kiểm tra xác nhận.</p><button type="button" class="btn btn-primary" id="goal-empty-create-btn">Tạo mục tiêu đầu tiên</button></div>
      </div>
    `;
    document.getElementById("goal-empty-create-btn")?.addEventListener("click", openCreateGoalModal);
    return;
  }

  const activeGoal = goals.find(goal => goal.id === preferredGoalId)
    || goals.find(goal => goal.status === "active")
    || goals[0];
  selectedGoalId = activeGoal.id;
  root.innerHTML = `<div class="goal-layout">${renderGoalList(goals, activeGoal.id)}${renderGoalDetail(activeGoal)}</div>`;
  root.querySelectorAll("[data-goal-select]").forEach(button => {
    button.addEventListener("click", () => renderLearningGoalsView(button.dataset.goalSelect));
  });
  bindGoalDetailEvents(activeGoal);
}

export function renderDashboardGoalWidget() {
  const root = document.getElementById("dashboard-goal-widget");
  if (!root) return;
  const goal = getLearningGoals().find(item => item.status === "active");
  if (!goal) {
    root.innerHTML = "";
    return;
  }
  const nextSession = getGoalNextSession(goal);
  root.innerHTML = `
    <section class="goal-dashboard-band">
      <div>
        <span class="goal-page-kicker">Mục tiêu đang chạy</span>
        <h2>${escapeHtml(goal.title)}</h2>
        <p>${goal.progress.verified}/${goal.progress.total} từ đã xác nhận · ${goal.progress.atRisk} từ có nguy cơ · hạn ${formatDateTime(goal.deadlineAt)}</p>
        <div class="goal-dashboard-metrics"><span><strong>${goal.progress.percent}%</strong> tiến độ</span><span><strong>${goal.progress.predictedRetention}%</strong> nhớ tại hạn</span>${nextSession ? `<span><strong>${escapeHtml(formatRelative(nextSession.scheduledAt))}</strong> buổi tiếp theo</span>` : ""}</div>
      </div>
      <button type="button" class="btn btn-primary" id="dashboard-open-goal-btn">Mở kế hoạch</button>
    </section>
  `;
  document.getElementById("dashboard-open-goal-btn")?.addEventListener("click", () => {
    switchViewCallback?.("learning-goals-view");
    renderLearningGoalsView(goal.id);
  });
}

function submitGoalForm(event) {
  event.preventDefault();
  const message = document.getElementById("goal-create-message");
  const deadlineAt = getDeadlineAt();
  const modes = selectedModes();
  if (!selectedVocabIds.size) {
    message.textContent = "Hãy chọn ít nhất một từ.";
    return;
  }
  if (modes.length === 0) {
    message.textContent = "Hãy chọn ít nhất một dạng kiểm tra.";
    return;
  }
  if (!Number.isFinite(deadlineAt) || deadlineAt - Date.now() < 4 * HOUR_MS) {
    message.textContent = "Deadline cần cách hiện tại ít nhất 4 giờ để có một lượt nhớ lại cách quãng.";
    return;
  }

  const titleInput = document.getElementById("goal-title-input");
  const result = createLearningGoal({
    title: titleInput.value.trim() || `Thuộc ${selectedVocabIds.size} từ`,
    vocabIds: [...selectedVocabIds],
    modes,
    deadlineAt,
    desiredRetention: Number(document.getElementById("goal-retention").value),
    dailyMinutes: Number(document.getElementById("goal-daily-minutes").value),
    scheduleSettings: formScheduleSettings(),
    now: Date.now()
  });
  closeCreateGoalModal();
  selectedGoalId = result.goal.id;
  switchViewCallback?.("learning-goals-view");
  renderLearningGoalsView(result.goal.id);
  renderDashboardGoalWidget();
}

export function recordGoalQuizReport(context, report) {
  if (!context?.goalId || !context?.sessionId) return null;
  const result = completeGoalSession(context.goalId, context.sessionId, report);
  renderDashboardGoalWidget();
  if (result) {
    selectedGoalId = context.goalId;
  }
  return result;
}

export function setupLearningGoalsUI({ startQuiz, switchView, speakJapanese }) {
  startQuizCallback = startQuiz;
  switchViewCallback = switchView;
  speakJapaneseCallback = speakJapanese;

  document.getElementById("open-create-goal-btn")?.addEventListener("click", openCreateGoalModal);
  document.getElementById("close-create-goal-btn")?.addEventListener("click", closeCreateGoalModal);
  document.getElementById("cancel-create-goal-btn")?.addEventListener("click", closeCreateGoalModal);
  document.getElementById("goal-create-modal")?.addEventListener("click", event => {
    if (event.target.id === "goal-create-modal") closeCreateGoalModal();
  });
  document.getElementById("goal-create-form")?.addEventListener("submit", submitGoalForm);
  document.getElementById("goal-word-search")?.addEventListener("input", renderGoalWordPicker);
  document.getElementById("goal-word-picker")?.addEventListener("change", event => {
    const id = event.target?.dataset?.goalVocabId;
    if (!id) return;
    if (event.target.checked) selectedVocabIds.add(id);
    else selectedVocabIds.delete(id);
    event.target.closest(".goal-picker-word")?.classList.toggle("selected", event.target.checked);
    document.getElementById("goal-selected-count").textContent = `${selectedVocabIds.size} từ`;
    renderGoalPlanPreview();
  });
  document.getElementById("goal-select-all-btn")?.addEventListener("click", () => {
    selectedVocabIds = new Set(allVocabulary().map(vocab => vocab.id));
    renderGoalWordPicker();
    renderGoalPlanPreview();
  });
  document.getElementById("goal-clear-all-btn")?.addEventListener("click", () => {
    selectedVocabIds.clear();
    renderGoalWordPicker();
    renderGoalPlanPreview();
  });

  document.querySelectorAll("#goal-duration-options button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#goal-duration-options button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      document.getElementById("goal-duration-hours").value = button.dataset.hours;
      document.getElementById("goal-custom-deadline").hidden = button.dataset.hours !== "custom";
      renderGoalPlanPreview();
    });
  });
  ["goal-custom-deadline", "goal-daily-minutes", "goal-retention", "goal-wake-time", "goal-sleep-time", "goal-availability", "goal-weekend-availability", "goal-notification-limit", "goal-snooze-minutes"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", renderGoalPlanPreview);
  });
  document.querySelectorAll('input[name="goal-mode"]').forEach(input => {
    input.addEventListener("change", renderGoalPlanPreview);
  });

  window.addEventListener("nihongo:goals-updated", () => {
    renderDashboardGoalWidget();
    if (document.getElementById("learning-goals-view")?.classList.contains("active")) {
      renderLearningGoalsView();
    }
  });
  window.addEventListener("nihongo:desktop-goal-requested", event => {
    switchViewCallback?.("learning-goals-view");
    renderLearningGoalsView(event.detail?.goalId || null);
  });
}
