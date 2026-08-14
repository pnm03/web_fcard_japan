import { supabase } from "./supabase.js";
import { answerStateToFsrsRating } from "./fsrs-scheduler.js";
import {
  addRecoverySession,
  activateGoalAfterBaseline,
  createGoalDraft,
  getDueGoalSessions as collectDueGoalSessions,
  getNextGoalSession,
  refreshGoalState,
  replanGoal
} from "./goal-planner.js";
import { getCloudUser, getProjects } from "./storage.js";

const STORAGE_PREFIX = "nihongo_learning_goals_v1";
let goalSchemaAvailable = null;

function storageKey() {
  return `${STORAGE_PREFIX}_${getCloudUser()?.id || "guest"}`;
}

function emitGoalUpdate(goals) {
  window.dispatchEvent(new CustomEvent("nihongo:goals-updated", { detail: goals }));
}

function vocabMap() {
  return new Map(
    getProjects().flatMap(project => (
      project.vocab.map(vocab => [vocab.id, { ...vocab, projectId: project.id, projectName: project.name }])
    ))
  );
}

function normalizeGoal(goal) {
  const normalized = {
    ...goal,
    modes: Array.isArray(goal.modes) ? goal.modes : [],
    items: Array.isArray(goal.items) ? goal.items : [],
    sessions: Array.isArray(goal.sessions) ? goal.sessions : [],
    reviewLogs: Array.isArray(goal.reviewLogs) ? goal.reviewLogs : [],
    scheduleSettings: goal.scheduleSettings || {},
    replanning: goal.replanning || {}
  };
  return refreshGoalState(normalized, vocabMap(), Date.now());
}

function loadLocalGoals() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey()) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeGoal).sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Không đọc được mục tiêu học:", error);
    return [];
  }
}

function saveLocalGoals(goals, { emit = true } = {}) {
  const cleanGoals = goals.map(normalizeGoal).sort((a, b) => b.createdAt - a.createdAt);
  localStorage.setItem(storageKey(), JSON.stringify(cleanGoals));
  if (emit) emitGoalUpdate(cleanGoals);
  return cleanGoals;
}

function isMissingGoalSchema(error) {
  const text = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
  return text.includes("42p01")
    || text.includes("does not exist")
    || text.includes("could not find the table")
    || text.includes("schema cache");
}

function goalRow(goal, userId) {
  return {
    id: goal.id,
    user_id: userId,
    title: goal.title,
    deadline_at: new Date(goal.deadlineAt).toISOString(),
    desired_retention: goal.desiredRetention,
    daily_minutes: goal.dailyMinutes,
    horizon_hours: goal.horizonHours,
    modes: goal.modes,
    status: goal.status,
    plan_estimate: goal.planEstimate || {},
    schedule_settings: goal.scheduleSettings || {},
    replanning: goal.replanning || {},
    fsrs_profile: goal.fsrsProfile || {},
    baseline_completed: goal.baselineCompleted === true,
    created_at: new Date(goal.createdAt).toISOString(),
    updated_at: new Date(goal.updatedAt || Date.now()).toISOString()
  };
}

function itemRows(goal, userId) {
  return goal.items.map(item => ({
    goal_id: goal.id,
    vocab_id: item.vocabId,
    user_id: userId,
    order_index: item.orderIndex || 0,
    status: item.status,
    risk_score: item.riskScore || 0,
    predicted_retention: item.predictedRetention || 0,
    correct_sessions: item.correctSessions || 0,
    required_sessions: item.requiredSessions || 0,
    separated_recall: item.separatedRecall === true,
    mode_coverage: item.modeCoverage || 0,
    passed_modes: item.passedModes || [],
    final_passed: item.finalPassed === true,
    last_result: item.lastResult || "unanswered",
    last_reviewed_at: item.lastReviewedAt ? new Date(item.lastReviewedAt).toISOString() : null,
    completed_at: item.completedAt ? new Date(item.completedAt).toISOString() : null,
    updated_at: new Date(goal.updatedAt || Date.now()).toISOString()
  }));
}

function sessionRows(goal, userId) {
  return goal.sessions.map(session => ({
    id: session.id,
    goal_id: goal.id,
    user_id: userId,
    sequence: session.sequence || 0,
    session_type: session.type,
    scheduled_at: new Date(session.scheduledAt).toISOString(),
    duration_minutes: session.durationMinutes || 0,
    status: session.status,
    vocab_ids: session.vocabIds || [],
    modes: session.modes || [],
    result_summary: session.resultSummary || {},
    anchor: session.anchor || "adaptive",
    completed_at: session.completedAt ? new Date(session.completedAt).toISOString() : null,
    created_at: new Date(session.createdAt || goal.createdAt).toISOString(),
    updated_at: new Date(goal.updatedAt || Date.now()).toISOString()
  }));
}

function logRows(goal, userId) {
  return goal.reviewLogs.map(log => ({
    id: log.id,
    goal_id: goal.id,
    session_id: log.sessionId,
    vocab_id: log.vocabId,
    user_id: userId,
    session_type: log.sessionType,
    mode: log.mode || "",
    answer_state: log.answerState,
    answer_signal: log.answerSignal || "",
    baseline_class: log.baselineClass || "",
    fsrs_rating: log.fsrsRating,
    response_seconds: log.responseSeconds || 0,
    reviewed_at: new Date(log.reviewedAt).toISOString()
  }));
}

async function syncGoalToCloud(goal) {
  const userId = getCloudUser()?.id;
  if (!userId || goalSchemaAvailable === false) return;

  try {
    const { error: goalError } = await supabase.from("learning_goals").upsert(goalRow(goal, userId));
    if (goalError) throw goalError;

    const itemPayload = itemRows(goal, userId);
    if (itemPayload.length) {
      const { error } = await supabase.from("learning_goal_vocab").upsert(itemPayload);
      if (error) throw error;
    }

    const sessionPayload = sessionRows(goal, userId);
    const { error: staleSessionError } = await supabase
      .from("learning_goal_sessions")
      .delete()
      .eq("goal_id", goal.id)
      .eq("user_id", userId)
      .eq("status", "pending");
    if (staleSessionError) throw staleSessionError;
    if (sessionPayload.length) {
      const { error } = await supabase.from("learning_goal_sessions").upsert(sessionPayload);
      if (error) throw error;
    }

    const reviewPayload = logRows(goal, userId);
    if (reviewPayload.length) {
      const { error } = await supabase.from("learning_review_logs").upsert(reviewPayload);
      if (error) throw error;
    }
    goalSchemaAvailable = true;
  } catch (error) {
    if (isMissingGoalSchema(error)) {
      goalSchemaAvailable = false;
      return;
    }
    console.warn("Chưa đồng bộ được mục tiêu học:", error);
  }
}

function rowTime(value) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildGoalFromRows(row, itemRowsData, sessionRowsData, logRowsData) {
  return normalizeGoal({
    id: row.id,
    title: row.title,
    deadlineAt: rowTime(row.deadline_at),
    desiredRetention: Number(row.desired_retention) || 0.9,
    dailyMinutes: Number(row.daily_minutes) || 30,
    horizonHours: Number(row.horizon_hours) || 24,
    modes: Array.isArray(row.modes) ? row.modes : [],
    status: row.status || "active",
    planEstimate: row.plan_estimate || {},
    scheduleSettings: row.schedule_settings || {},
    replanning: row.replanning || {},
    fsrsProfile: row.fsrs_profile || null,
    baselineCompleted: row.baseline_completed === true,
    createdAt: rowTime(row.created_at),
    updatedAt: rowTime(row.updated_at),
    items: itemRowsData.filter(item => item.goal_id === row.id).map(item => ({
      vocabId: item.vocab_id,
      orderIndex: item.order_index,
      status: item.status,
      riskScore: Number(item.risk_score) || 0,
      predictedRetention: Number(item.predicted_retention) || 0,
      correctSessions: item.correct_sessions || 0,
      requiredSessions: item.required_sessions || 0,
      separatedRecall: item.separated_recall === true,
      modeCoverage: Number(item.mode_coverage) || 0,
      passedModes: item.passed_modes || [],
      finalPassed: item.final_passed === true,
      lastResult: item.last_result || "unanswered",
      lastReviewedAt: rowTime(item.last_reviewed_at),
      completedAt: rowTime(item.completed_at)
    })),
    sessions: sessionRowsData.filter(session => session.goal_id === row.id).map(session => ({
      id: session.id,
      goalId: row.id,
      sequence: session.sequence,
      type: session.session_type,
      scheduledAt: rowTime(session.scheduled_at),
      durationMinutes: session.duration_minutes,
      status: session.status,
      vocabIds: session.vocab_ids || [],
      modes: session.modes || [],
      resultSummary: session.result_summary || null,
      completedAt: rowTime(session.completed_at),
      anchor: session.anchor || "adaptive",
      createdAt: rowTime(session.created_at)
    })),
    reviewLogs: logRowsData.filter(log => log.goal_id === row.id).map(log => ({
      id: log.id,
      goalId: row.id,
      sessionId: log.session_id,
      vocabId: log.vocab_id,
      sessionType: log.session_type,
      mode: log.mode,
      answerState: log.answer_state,
      answerSignal: log.answer_signal || "",
      baselineClass: log.baseline_class || "",
      fsrsRating: log.fsrs_rating,
      responseSeconds: Number(log.response_seconds) || 0,
      reviewedAt: rowTime(log.reviewed_at)
    }))
  });
}

export function getLearningGoals() {
  return loadLocalGoals();
}

export function getLearningGoal(goalId) {
  return getLearningGoals().find(goal => goal.id === goalId) || null;
}

export function getGoalVocabulary(goal) {
  const map = vocabMap();
  return goal.items.map(item => ({ ...map.get(item.vocabId), goalItem: item })).filter(item => item.id);
}

export function createLearningGoal(input) {
  const goal = refreshGoalState(createGoalDraft(input), vocabMap());
  const goals = saveLocalGoals([goal, ...getLearningGoals().filter(item => item.id !== goal.id)]);
  syncGoalToCloud(goal);
  return { goal, goals };
}

export function updateLearningGoal(goal) {
  const updated = refreshGoalState({ ...goal, updatedAt: Date.now() }, vocabMap());
  const goals = saveLocalGoals(getLearningGoals().map(item => item.id === updated.id ? updated : item));
  syncGoalToCloud(updated);
  return updated;
}

export function snoozeGoalSession(goalId, sessionId, minutes = 30) {
  const goal = getLearningGoal(goalId);
  if (!goal) return null;
  const now = Date.now();
  goal.sessions = goal.sessions.map(session => session.id === sessionId ? {
    ...session,
    scheduledAt: Math.min(now + Math.max(5, minutes) * 60 * 1000, goal.deadlineAt - 10 * 60 * 1000)
  } : session);
  return updateLearningGoal(replanGoal(goal, now, "snoozed", now + Math.max(5, minutes) * 60 * 1000));
}

export function skipGoalSession(goalId, sessionId) {
  const goal = getLearningGoal(goalId);
  if (!goal) return null;
  goal.sessions = goal.sessions.map(session => session.id === sessionId ? {
    ...session,
    status: "skipped",
    completedAt: Date.now()
  } : session);
  return updateLearningGoal(replanGoal(goal, Date.now(), "skipped"));
}

export function deleteLearningGoal(goalId) {
  const goals = saveLocalGoals(getLearningGoals().filter(goal => goal.id !== goalId));
  const userId = getCloudUser()?.id;
  if (userId && goalSchemaAvailable !== false) {
    supabase.from("learning_goals").delete().eq("id", goalId).eq("user_id", userId).then(({ error }) => {
      if (error && !isMissingGoalSchema(error)) console.warn("Chưa xóa được mục tiêu trên cloud:", error);
    });
  }
  return goals;
}

export function completeGoalSession(goalId, sessionId, report) {
  let goal = getLearningGoal(goalId);
  if (!goal) return null;
  const session = goal.sessions.find(item => item.id === sessionId);
  if (!session) return null;
  if (session.status === "completed") {
    return { goal, session, recoveryCount: 0, alreadyCompleted: true };
  }

  const reviewedAt = Date.now();
  const newLogs = report.details.map((detail, index) => ({
    id: `goal-log-${globalThis.crypto?.randomUUID?.() || `${reviewedAt}-${index}-${Math.random().toString(36).slice(2)}`}`,
    goalId,
    sessionId,
    vocabId: detail.id,
    sessionType: session.type,
    mode: detail.mode,
    answerState: detail.answerState,
    answerSignal: detail.answerSignal || "",
    fsrsRating: answerStateToFsrsRating(detail.answerState, detail.timeSpent, {}, detail.answerSignal)?.valueOf() ?? 0,
    responseSeconds: Number(detail.timeSpent) || 0,
    reviewedAt: reviewedAt + index
  }));

  goal.reviewLogs = [...goal.reviewLogs, ...newLogs];
  goal.sessions = goal.sessions.map(item => item.id === sessionId ? {
    ...item,
    status: "completed",
    completedAt: reviewedAt,
    resultSummary: {
      accuracy: report.accuracy,
      correct: report.correctCount,
      retry: report.correctRetryCount,
      wrong: report.wrongCount,
      averageTime: Number(report.averageTime.toFixed(2))
    }
  } : item);

  const recoveryIds = [...new Set(
    report.details
      .filter(detail => detail.answerState !== "correct" || detail.timeSpent > 8)
      .map(detail => detail.id)
  )];
  if (session.type === "baseline") {
    goal = refreshGoalState(goal, vocabMap(), reviewedAt);
    goal = activateGoalAfterBaseline(goal, reviewedAt);
  } else {
    goal = addRecoverySession(goal, recoveryIds, reviewedAt, session.type === "final" ? "final" : "recovery");
  }
  goal = updateLearningGoal(goal);

  return {
    goal,
    session,
    recoveryCount: recoveryIds.length
  };
}

export function getDueGoalSessions(now = Date.now()) {
  const goals = getLearningGoals();
  let replanned = false;
  const nextGoals = goals.map(goal => {
    const missed = goal.status === "active" && goal.sessions.some(session => (
      session.status === "pending"
      && session.type !== "baseline"
      && session.scheduledAt < now - 90 * 60 * 1000
    ));
    if (!missed || now - Number(goal.replanning?.lastAt || 0) < 30 * 60 * 1000) return goal;
    replanned = true;
    return refreshGoalState(replanGoal(goal, now, "missed_session"), vocabMap(), now);
  });
  if (replanned) saveLocalGoals(nextGoals);
  return collectDueGoalSessions(replanned ? nextGoals : goals, now);
}

export function getGoalNextSession(goal, now = Date.now()) {
  return getNextGoalSession(goal, now);
}

export async function syncLearningGoalsFromCloud() {
  const userId = getCloudUser()?.id;
  const localGoals = getLearningGoals();
  if (!userId) return localGoals;

  try {
    const [goalsResult, itemsResult, sessionsResult, logsResult] = await Promise.all([
      supabase.from("learning_goals").select("*").eq("user_id", userId),
      supabase.from("learning_goal_vocab").select("*").eq("user_id", userId),
      supabase.from("learning_goal_sessions").select("*").eq("user_id", userId),
      supabase.from("learning_review_logs").select("*").eq("user_id", userId)
    ]);
    const firstError = [goalsResult, itemsResult, sessionsResult, logsResult].find(result => result.error)?.error;
    if (firstError) throw firstError;
    goalSchemaAvailable = true;

    const cloudGoals = (goalsResult.data || []).map(row => buildGoalFromRows(
      row,
      itemsResult.data || [],
      sessionsResult.data || [],
      logsResult.data || []
    ));
    const merged = new Map(cloudGoals.map(goal => [goal.id, goal]));
    localGoals.forEach(goal => {
      const cloudGoal = merged.get(goal.id);
      if (!cloudGoal || goal.updatedAt > cloudGoal.updatedAt) {
        merged.set(goal.id, goal);
        syncGoalToCloud(goal);
      }
    });
    return saveLocalGoals([...merged.values()]);
  } catch (error) {
    if (isMissingGoalSchema(error)) {
      goalSchemaAvailable = false;
      return localGoals;
    }
    console.warn("Chưa kéo được mục tiêu học từ cloud:", error);
    return localGoals;
  }
}

export function isGoalSchemaReady() {
  return goalSchemaAvailable !== false;
}

export function clearLearningGoalsForUser(userId = getCloudUser()?.id) {
  if (!userId) return;
  localStorage.removeItem(`${STORAGE_PREFIX}_${userId}`);
}
