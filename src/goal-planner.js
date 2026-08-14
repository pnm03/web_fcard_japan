import { getVocabRetrievability } from "./fsrs-scheduler.js";
import { buildPersonalizedFsrsProfile } from "./adaptive-learning.js";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const GOAL_MODE_LABELS = {
  meaning_to_romaji: "Nghĩa → Romaji",
  jp_to_meaning: "Tiếng Nhật → Nghĩa",
  romaji_to_meaning: "Romaji → Nghĩa",
  meaning_to_japanese: "Nghĩa → Tiếng Nhật",
  audio_to_meaning: "Âm thanh → Nghĩa"
};

export const SESSION_META = {
  baseline: { label: "Đo trí nhớ đầu vào", shortLabel: "Đánh giá đầu vào", tone: "accent" },
  acquisition: { label: "Làm quen & gọi lại", shortLabel: "Học ban đầu", tone: "accent" },
  reinforcement: { label: "Chặn quên nhanh", shortLabel: "Ôn nhanh", tone: "warning" },
  retrieval: { label: "Gọi lại cách quãng", shortLabel: "Gọi lại", tone: "good" },
  mixed: { label: "Đảo chiều phản xạ", shortLabel: "Kiểm tra trộn", tone: "accent" },
  risk: { label: "Cứu nhóm có nguy cơ", shortLabel: "Từ nguy cơ", tone: "warning" },
  final: { label: "Kiểm tra xác nhận", shortLabel: "Chốt mục tiêu", tone: "error" },
  recovery: { label: "Khôi phục từ vừa sai", shortLabel: "Học bù", tone: "warning" }
};

const DEFAULT_AVAILABILITY = [
  { start: "07:00", end: "08:00" },
  { start: "12:00", end: "13:30" },
  { start: "19:00", end: "22:30" }
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function createId(prefix) {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

function parseClock(value, fallback) {
  const match = String(value || fallback).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return parseClock(fallback, "00:00");
  return clamp(Number(match[1]), 0, 23) * 60 + clamp(Number(match[2]), 0, 59);
}

function atLocalMinute(day, minute) {
  const date = new Date(day);
  date.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
  return date.getTime();
}

function windowsForDay(day, availability) {
  const weekday = new Date(day).getDay();
  const source = Array.isArray(availability)
    ? availability
    : availability?.[weekday] || availability?.[String(weekday)] || DEFAULT_AVAILABILITY;
  return (source?.length ? source : DEFAULT_AVAILABILITY).flatMap(window => {
    const startMinute = parseClock(window.start, "07:00");
    const endMinute = parseClock(window.end, "22:30");
    if (endMinute <= startMinute) return [];
    return [{ start: atLocalMinute(day, startMinute), end: atLocalMinute(day, endMinute) }];
  });
}

function isInWrappedRange(timestamp, startClock, endClock) {
  const date = new Date(timestamp);
  const minute = date.getHours() * 60 + date.getMinutes();
  const start = parseClock(startClock, "22:30");
  const end = parseClock(endClock, "06:30");
  return start <= end ? minute >= start && minute < end : minute >= start || minute < end;
}

export function snapToStudyWindow(targetAt, settings = {}, deadlineAt = Number.POSITIVE_INFINITY) {
  const quietStart = settings.quietStart || settings.sleepTime || "22:30";
  const quietEnd = settings.quietEnd || settings.wakeTime || "06:30";
  const roundedTarget = Math.ceil(targetAt / (5 * 60 * 1000)) * 5 * 60 * 1000;
  for (let dayOffset = 0; dayOffset <= 14; dayOffset += 1) {
    const day = new Date(roundedTarget);
    day.setDate(day.getDate() + dayOffset);
    day.setHours(0, 0, 0, 0);
    for (const window of windowsForDay(day, settings.availability)) {
      let candidate = Math.max(roundedTarget, window.start);
      while (candidate <= window.end && candidate <= deadlineAt) {
        if (!isInWrappedRange(candidate, quietStart, quietEnd)) return candidate;
        candidate += 15 * 60 * 1000;
      }
    }
  }
  const finiteDeadline = Number.isFinite(deadlineAt) ? deadlineAt : roundedTarget + 14 * DAY_MS;
  for (let dayOffset = 0; dayOffset <= 14; dayOffset += 1) {
    const day = new Date(finiteDeadline);
    day.setDate(day.getDate() - dayOffset);
    day.setHours(0, 0, 0, 0);
    const windows = windowsForDay(day, settings.availability).slice().reverse();
    for (const window of windows) {
      let candidate = Math.min(finiteDeadline, window.end - 5 * 60 * 1000);
      while (candidate >= window.start) {
        if (!isInWrappedRange(candidate, quietStart, quietEnd)) return candidate;
        candidate -= 15 * 60 * 1000;
      }
    }
  }
  return Math.min(roundedTarget, finiteDeadline);
}

function sessionOffsetsForHorizon(horizonHours) {
  if (horizonHours <= 18) return [["acquisition", 0], ["reinforcement", 0.5], ["retrieval", 2], ["mixed", 6], ["risk", horizonHours - 3], ["final", horizonHours - 0.5]];
  if (horizonHours <= 36) return [["acquisition", 0], ["reinforcement", 0.5], ["retrieval", 3], ["mixed", 10], ["risk", horizonHours - 5], ["final", horizonHours - 1]];
  if (horizonHours <= 84) return [["acquisition", 0], ["reinforcement", 2], ["retrieval", 12], ["mixed", 24], ["risk", horizonHours - 12], ["final", horizonHours - 2]];
  if (horizonHours <= 8 * 24) return [["acquisition", 0], ["reinforcement", 3], ["retrieval", 24], ["mixed", 72], ["risk", horizonHours - 24], ["final", horizonHours - 3]];
  return [["acquisition", 0], ["reinforcement", 4], ["retrieval", 24], ["mixed", horizonHours * 0.25], ["risk", horizonHours * 0.55], ["risk", horizonHours - 24], ["final", horizonHours - 3]];
}

function sessionDurationMinutes(type, vocabCount, modeCount) {
  const base = {
    baseline: Math.max(4, Math.ceil(vocabCount * Math.max(1, modeCount) * 0.18)),
    acquisition: Math.max(8, Math.ceil(vocabCount * 0.8)),
    reinforcement: Math.max(3, Math.ceil(vocabCount * 0.28)),
    retrieval: Math.max(4, Math.ceil(vocabCount * 0.38)),
    mixed: Math.max(4, Math.ceil(vocabCount * 0.34)),
    risk: Math.max(3, Math.ceil(vocabCount * 0.28)),
    final: Math.max(5, Math.ceil(vocabCount * Math.max(1, modeCount) * 0.22)),
    recovery: Math.max(3, Math.ceil(vocabCount * 0.3))
  };
  return base[type] || 5;
}

function specialSleepAnchors(startsAt, deadlineAt, settings) {
  if (deadlineAt - startsAt < 14 * HOUR_MS) return [];
  const anchors = [];
  const startDay = new Date(startsAt);
  startDay.setHours(0, 0, 0, 0);
  for (let offset = 0; offset < 14; offset += 1) {
    const day = new Date(startDay);
    day.setDate(day.getDate() + offset);
    const sleepMinute = parseClock(settings.sleepTime, "23:00");
    const wakeMinute = parseClock(settings.wakeTime, "06:30");
    const beforeSleep = atLocalMinute(day, sleepMinute) - 35 * 60 * 1000;
    const afterWake = atLocalMinute(day, wakeMinute) + 25 * 60 * 1000;
    if (beforeSleep > startsAt + HOUR_MS && beforeSleep < deadlineAt - HOUR_MS) anchors.push({ type: "risk", targetAt: beforeSleep, anchor: "before_sleep" });
    if (afterWake > startsAt + HOUR_MS && afterWake < deadlineAt - HOUR_MS) anchors.push({ type: "retrieval", targetAt: afterWake, anchor: "after_wake" });
  }
  if (deadlineAt - startsAt <= 36 * HOUR_MS) {
    return [
      anchors.find(anchor => anchor.anchor === "before_sleep"),
      anchors.find(anchor => anchor.anchor === "after_wake")
    ].filter(Boolean);
  }
  return anchors.slice(0, 4);
}

function estimatePlan(sessions, dailyMinutes, startsAt, deadlineAt) {
  const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const availableDays = Math.max(1, Math.ceil((deadlineAt - startsAt) / DAY_MS));
  const availableMinutes = Math.max(5, dailyMinutes) * availableDays;
  const workloadRatio = totalMinutes / availableMinutes;
  return {
    totalMinutes,
    availableMinutes,
    sessionCount: sessions.length,
    workloadRatio: Number(workloadRatio.toFixed(2)),
    feasibility: workloadRatio <= 1.05 ? "comfortable" : workloadRatio <= 1.45 ? "tight" : "overload"
  };
}

function buildSession({ goalId, type, scheduledAt, vocabIds, modes, startsAt, anchor = "adaptive", sequence = 0 }) {
  return {
    id: createId("goal-session"),
    goalId,
    sequence,
    type,
    scheduledAt: Math.round(scheduledAt),
    durationMinutes: sessionDurationMinutes(type, vocabIds.length, modes.length),
    status: "pending",
    vocabIds: [...vocabIds],
    modes: type === "final" || type === "baseline" ? [...modes] : [],
    anchor,
    createdAt: startsAt,
    completedAt: 0,
    resultSummary: null
  };
}

export function buildGoalPlan({
  goalId,
  vocabIds,
  modes,
  startsAt = Date.now(),
  deadlineAt,
  dailyMinutes = 30,
  scheduleSettings = {},
  includeBaseline = false
}) {
  const safeVocabIds = [...new Set(vocabIds || [])];
  const safeModes = [...new Set(modes || [])];
  const horizonHours = Math.max(1, (deadlineAt - startsAt) / HOUR_MS);
  const targetEntries = sessionOffsetsForHorizon(horizonHours).map(([type, offset]) => ({
    type,
    targetAt: startsAt + clamp(offset, 0, Math.max(0, horizonHours - 0.2)) * HOUR_MS,
    anchor: "adaptive"
  }));
  targetEntries.push(...specialSleepAnchors(startsAt, deadlineAt, scheduleSettings));
  targetEntries.sort((a, b) => a.targetAt - b.targetAt);

  const compact = [];
  let previousAt = startsAt - HOUR_MS;
  targetEntries.forEach(entry => {
    const snapped = snapToStudyWindow(Math.max(entry.targetAt, previousAt + 20 * 60 * 1000), scheduleSettings, deadlineAt - 10 * 60 * 1000);
    if (snapped >= deadlineAt) return;
    const duplicate = compact.find(item => Math.abs(item.scheduledAt - snapped) < 15 * 60 * 1000);
    if (duplicate) {
      if (entry.anchor !== "adaptive" && duplicate.anchor === "adaptive") duplicate.anchor = entry.anchor;
      return;
    }
    compact.push({ ...entry, scheduledAt: snapped });
    previousAt = snapped;
  });

  let sessions = compact.map((entry, index) => buildSession({
    goalId,
    type: entry.type,
    scheduledAt: entry.scheduledAt,
    vocabIds: safeVocabIds,
    modes: safeModes,
    startsAt,
    anchor: entry.anchor,
    sequence: index + 1
  }));
  if (includeBaseline) {
    const baseline = buildSession({
      goalId,
      type: "baseline",
      scheduledAt: startsAt,
      vocabIds: safeVocabIds,
      modes: safeModes,
      startsAt,
      anchor: "baseline",
      sequence: 1
    });
    sessions = [baseline, ...sessions.map((session, index) => ({ ...session, sequence: index + 2 }))];
  }
  return {
    horizonHours,
    sessions,
    estimate: estimatePlan(sessions, dailyMinutes, startsAt, deadlineAt)
  };
}

function sortedCorrectLogs(logs) {
  return logs.filter(log => log.answerState === "correct").sort((a, b) => a.reviewedAt - b.reviewedAt);
}

function hasSeparatedRecall(logs, horizonHours, modes) {
  const requiredGapHours = clamp(horizonHours * 0.2, 1.5, 6);
  return modes.every(mode => {
    const correctLogs = sortedCorrectLogs(logs.filter(log => log.mode === mode));
    return correctLogs.some((entry, index) => correctLogs.slice(index + 1).some(next => (next.reviewedAt - entry.reviewedAt) / HOUR_MS >= requiredGapHours));
  });
}

function baselineClassification(logs) {
  if (!logs.length) return "pending";
  const recognitionModes = new Set(["jp_to_meaning", "romaji_to_meaning", "audio_to_meaning"]);
  const recognition = logs.filter(log => recognitionModes.has(log.mode));
  const production = logs.filter(log => !recognitionModes.has(log.mode));
  const recognitionPassed = recognition.length > 0 && recognition.every(log => log.answerState === "correct");
  const productionFailed = production.some(log => log.answerState === "wrong" || log.answerState === "revealed");
  if (recognitionPassed && productionFailed) return "recognition_only";
  if (logs.some(log => log.answerState === "wrong" || log.answerState === "revealed")) return "failed";
  if (logs.some(log => log.answerState === "correct_retry" || log.responseSeconds > 8)) return "known_slow";
  if (logs.every(log => recognitionModes.has(log.mode))) return "recognition_only";
  return "known_fast";
}

function itemAnalysis(goal, item, vocab, logs, now) {
  const itemLogs = logs.filter(log => log.vocabId === item.vocabId);
  const nonBaselineLogs = itemLogs.filter(log => log.sessionType !== "baseline");
  const modes = goal.modes || [];
  const correctLogs = sortedCorrectLogs(nonBaselineLogs);
  const distinctCorrectSessions = new Set(correctLogs.map(log => log.sessionId)).size;
  const passedModes = new Set(correctLogs.map(log => log.mode).filter(Boolean));
  const modeCoverage = modes.length ? modes.filter(mode => passedModes.has(mode)).length / modes.length : 1;
  const horizonHours = finite(goal.horizonHours, Math.max(1, (goal.deadlineAt - goal.createdAt) / HOUR_MS));
  const requiredSessions = horizonHours <= 30 ? 2 : 3;
  const separatedRecall = hasSeparatedRecall(nonBaselineLogs, horizonHours, modes);
  const finalLogs = nonBaselineLogs.filter(log => log.sessionType === "final");
  const latestFinalSessionId = finalLogs.slice().sort((a, b) => b.reviewedAt - a.reviewedAt)[0]?.sessionId;
  const latestFinalLogs = latestFinalSessionId ? finalLogs.filter(log => log.sessionId === latestFinalSessionId) : [];
  const finalPassed = modes.length
    ? modes.every(mode => latestFinalLogs.some(log => log.mode === mode && log.answerState === "correct"))
      && !latestFinalLogs.some(log => log.answerState !== "correct")
    : latestFinalLogs.some(log => log.answerState === "correct");
  const modeRetentions = modes.map(mode => getVocabRetrievability(vocab || {}, goal.deadlineAt, goal.desiredRetention, mode, goal.fsrsProfile));
  const predictedRetention = modeRetentions.length ? Math.min(...modeRetentions) : getVocabRetrievability(vocab || {}, goal.deadlineAt, goal.desiredRetention);
  const lastLog = nonBaselineLogs.slice().sort((a, b) => b.reviewedAt - a.reviewedAt)[0] || null;
  const recentFailure = lastLog && (lastLog.answerState !== "correct" || lastLog.answerSignal === "revealed");
  const verified = distinctCorrectSessions >= requiredSessions && separatedRecall && modeCoverage >= 1 && finalPassed && predictedRetention >= goal.desiredRetention - 0.02 && !recentFailure;
  const missingSessionRatio = clamp((requiredSessions - distinctCorrectSessions) / requiredSessions, 0, 1);
  const weakestMode = modes.slice().sort((a, b) => getVocabRetrievability(vocab || {}, goal.deadlineAt, goal.desiredRetention, a) - getVocabRetrievability(vocab || {}, goal.deadlineAt, goal.desiredRetention, b))[0] || "";
  const riskScore = Math.round(clamp((1 - predictedRetention) * 45 + missingSessionRatio * 20 + (1 - modeCoverage) * 12 + finite(vocab?.difficultyScore, 50) / 100 * 8 + (recentFailure ? 20 : 0) + (!separatedRecall ? 8 : 0), 0, 100));
  let status = "new";
  if (verified) status = "verified";
  else if (recentFailure || riskScore >= 65) status = "at_risk";
  else if (nonBaselineLogs.length > 0 || item.baselineClass !== "pending") status = "learning";
  return {
    ...item,
    status,
    baselineClass: baselineClassification(itemLogs.filter(log => log.sessionType === "baseline")),
    predictedRetention: Number(predictedRetention.toFixed(4)),
    modeRetentions: Object.fromEntries(modes.map((mode, index) => [mode, Number(modeRetentions[index].toFixed(4))])),
    weakestMode,
    riskScore,
    correctSessions: distinctCorrectSessions,
    requiredSessions,
    separatedRecall,
    modeCoverage: Number(modeCoverage.toFixed(2)),
    passedModes: [...passedModes],
    finalPassed,
    lastResult: lastLog?.answerState || "unanswered",
    lastReviewedAt: lastLog?.reviewedAt || 0,
    completedAt: verified ? (item.completedAt || now) : 0
  };
}

function chooseSessionVocabIds(session, analyses) {
  if (session.type === "baseline") return analyses.map(item => item.vocabId);
  if (session.type === "acquisition") return analyses.filter(item => item.baselineClass !== "known_fast" && item.status !== "verified").map(item => item.vocabId);
  if (session.type === "retrieval" || session.type === "final") return analyses.filter(item => session.type === "final" || item.status !== "verified").map(item => item.vocabId);
  const threshold = session.type === "reinforcement" ? 35 : session.type === "mixed" ? 28 : 22;
  const selected = analyses.filter(item => item.status !== "verified" && (item.riskScore >= threshold || item.lastResult !== "correct")).sort((a, b) => b.riskScore - a.riskScore).map(item => item.vocabId);
  return selected.length ? selected : analyses.filter(item => item.status !== "verified").sort((a, b) => b.riskScore - a.riskScore).slice(0, 5).map(item => item.vocabId);
}

export function refreshGoalState(goal, vocabById, now = Date.now()) {
  const logs = goal.reviewLogs || [];
  const userHistoryLogs = [...vocabById.values()].flatMap(vocab => (
    (vocab.answerHistory || []).map((entry, index) => ({
      vocabId: vocab.id,
      mode: entry.mode,
      answerState: entry.state,
      answerSignal: entry.signal,
      responseSeconds: entry.timeSpentSec,
      reviewedAt: entry.at || index + 1
    }))
  ));
  const candidateProfile = buildPersonalizedFsrsProfile([...userHistoryLogs, ...logs]);
  const fsrsProfile = candidateProfile.active
    ? candidateProfile
    : goal.fsrsProfile?.active
      ? goal.fsrsProfile
      : candidateProfile;
  const goalWithProfile = { ...goal, fsrsProfile };
  const analyses = (goal.items || []).map(item => itemAnalysis(goalWithProfile, item, vocabById.get(item.vocabId), logs, now));
  const sessions = (goal.sessions || []).map(session => session.status === "completed" || session.status === "skipped" ? session : { ...session, vocabIds: chooseSessionVocabIds(session, analyses) });
  const verifiedCount = analyses.filter(item => item.status === "verified").length;
  const averageRetention = analyses.length ? analyses.reduce((sum, item) => sum + item.predictedRetention, 0) / analyses.length : 0;
  const completed = analyses.length > 0 && verifiedCount === analyses.length;
  return {
    ...goal,
    fsrsProfile,
    items: analyses,
    sessions,
    baselineCompleted: sessions.some(session => session.type === "baseline" && session.status === "completed"),
    status: completed ? "completed" : now >= goal.deadlineAt ? "expired" : goal.status === "paused" ? "paused" : "active",
    progress: {
      total: analyses.length,
      verified: verifiedCount,
      learning: analyses.filter(item => item.status === "learning").length,
      atRisk: analyses.filter(item => item.status === "at_risk").length,
      newCount: analyses.filter(item => item.status === "new").length,
      percent: analyses.length ? Math.round(verifiedCount / analyses.length * 100) : 0,
      predictedRetention: Math.round(averageRetention * 100)
    },
    updatedAt: goal.updatedAt || now
  };
}

export function replanGoal(goal, now = Date.now(), reason = "missed_session", resumeAt = now) {
  const completed = (goal.sessions || []).filter(session => session.status === "completed");
  const skipped = (goal.sessions || []).filter(session => session.status === "skipped");
  const remainingIds = goal.items.filter(item => item.status !== "verified").sort((a, b) => b.riskScore - a.riskScore).map(item => item.vocabId);
  const plan = buildGoalPlan({
    goalId: goal.id,
    vocabIds: remainingIds,
    modes: goal.modes,
    startsAt: resumeAt,
    deadlineAt: goal.deadlineAt,
    dailyMinutes: goal.dailyMinutes,
    scheduleSettings: goal.scheduleSettings,
    includeBaseline: false
  });
  const sessions = [...completed, ...skipped, ...plan.sessions].sort((a, b) => a.scheduledAt - b.scheduledAt).map((session, index) => ({ ...session, sequence: index + 1 }));
  return {
    ...goal,
    sessions,
    planEstimate: plan.estimate,
    replanning: {
      count: finite(goal.replanning?.count, 0) + 1,
      lastAt: now,
      reason,
      remainingWords: remainingIds.length,
      requiredMinutes: plan.estimate.totalMinutes,
      feasibility: plan.estimate.feasibility
    }
  };
}

export function addRecoverySession(goal, vocabIds, now = Date.now(), sessionType = "recovery") {
  if (!vocabIds.length || goal.deadlineAt - now <= 20 * 60 * 1000) return goal;
  const scheduledAt = snapToStudyWindow(now + 30 * 60 * 1000, goal.scheduleSettings || {}, goal.deadlineAt - 10 * 60 * 1000);
  if (goal.sessions.some(session => session.status === "pending" && session.type === sessionType && Math.abs(session.scheduledAt - scheduledAt) < 20 * 60 * 1000)) return goal;
  const recovery = buildSession({ goalId: goal.id, type: sessionType, scheduledAt, vocabIds: [...new Set(vocabIds)], modes: goal.modes || [], startsAt: now, anchor: "recovery", sequence: goal.sessions.length + 1 });
  return { ...goal, sessions: [...goal.sessions, recovery].sort((a, b) => a.scheduledAt - b.scheduledAt) };
}

export function createGoalDraft({ title, vocabIds, modes, deadlineAt, desiredRetention = 0.9, dailyMinutes = 30, scheduleSettings = {}, now = Date.now() }) {
  const id = createId("goal");
  const safeModes = [...new Set(modes || [])];
  const safeIds = [...new Set(vocabIds || [])];
  const baseline = buildSession({ goalId: id, type: "baseline", scheduledAt: now, vocabIds: safeIds, modes: safeModes, startsAt: now, anchor: "baseline", sequence: 1 });
  return {
    id,
    title: String(title || "Mục tiêu học từ").trim(),
    createdAt: now,
    updatedAt: now,
    deadlineAt,
    desiredRetention: clamp(finite(desiredRetention, 0.9), 0.8, 0.97),
    dailyMinutes: Math.max(5, Math.trunc(finite(dailyMinutes, 30))),
    horizonHours: Number(((deadlineAt - now) / HOUR_MS).toFixed(2)),
    modes: safeModes,
    status: "active",
    scheduleSettings: {
      timezone: scheduleSettings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh",
      sleepTime: scheduleSettings.sleepTime || "23:00",
      wakeTime: scheduleSettings.wakeTime || "06:30",
      quietStart: scheduleSettings.quietStart || scheduleSettings.sleepTime || "23:00",
      quietEnd: scheduleSettings.quietEnd || scheduleSettings.wakeTime || "06:30",
      availability: scheduleSettings.availability || DEFAULT_AVAILABILITY,
      maximumNotificationsPerDay: clamp(Math.trunc(finite(scheduleSettings.maximumNotificationsPerDay, 5)), 1, 12),
      snoozeMinutes: clamp(Math.trunc(finite(scheduleSettings.snoozeMinutes, 30)), 5, 180)
    },
    planEstimate: estimatePlan([baseline], dailyMinutes, now, deadlineAt),
    baselineCompleted: false,
    fsrsProfile: null,
    replanning: { count: 0, lastAt: 0, reason: "", remainingWords: safeIds.length, requiredMinutes: 0, feasibility: "pending" },
    items: safeIds.map((vocabId, index) => ({ vocabId, orderIndex: index, status: "new", baselineClass: "pending", riskScore: 100, predictedRetention: 0, modeRetentions: {}, weakestMode: "", correctSessions: 0, requiredSessions: (deadlineAt - now) / HOUR_MS <= 30 ? 2 : 3, separatedRecall: false, modeCoverage: 0, passedModes: [], finalPassed: false, lastResult: "unanswered", lastReviewedAt: 0, completedAt: 0 })),
    sessions: [baseline],
    reviewLogs: [],
    progress: { total: safeIds.length, verified: 0, learning: 0, atRisk: 0, newCount: safeIds.length, percent: 0, predictedRetention: 0 }
  };
}

export function activateGoalAfterBaseline(goal, now = Date.now()) {
  const plan = buildGoalPlan({ goalId: goal.id, vocabIds: goal.items.map(item => item.vocabId), modes: goal.modes, startsAt: now + 10 * 60 * 1000, deadlineAt: goal.deadlineAt, dailyMinutes: goal.dailyMinutes, scheduleSettings: goal.scheduleSettings, includeBaseline: false });
  return { ...goal, sessions: [...goal.sessions.filter(session => session.status === "completed"), ...plan.sessions].map((session, index) => ({ ...session, sequence: index + 1 })), planEstimate: plan.estimate, baselineCompleted: true };
}

export function classifyBaselineResult(logs) {
  return baselineClassification(logs);
}

export function getNextGoalSession(goal, now = Date.now()) {
  const pending = (goal.sessions || []).filter(session => session.status === "pending" && session.vocabIds.length > 0).sort((a, b) => a.scheduledAt - b.scheduledAt);
  return pending.find(session => session.scheduledAt <= now) || pending[0] || null;
}

export function getDueGoalSessions(goals, now = Date.now()) {
  return (goals || []).filter(goal => goal.status === "active").flatMap(goal => (goal.sessions || []).map(session => ({ ...session, goal }))).filter(entry => entry.status === "pending" && entry.vocabIds.length > 0 && entry.scheduledAt <= now).sort((a, b) => a.scheduledAt - b.scheduledAt);
}

export function getGoalScheduleSnapshot(goals, now = Date.now()) {
  return (goals || []).filter(goal => goal.status === "active").flatMap(goal => (goal.sessions || []).filter(session => session.status === "pending" && session.scheduledAt > now - DAY_MS).map(session => ({ id: session.id, goalId: goal.id, goalTitle: goal.title, scheduledAt: session.scheduledAt, deadlineAt: goal.deadlineAt, vocabCount: session.vocabIds.length, durationMinutes: session.durationMinutes, notificationLimit: goal.scheduleSettings?.maximumNotificationsPerDay || 5 }))).sort((a, b) => a.scheduledAt - b.scheduledAt);
}

export { DAY_MS, HOUR_MS };
