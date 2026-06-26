const REVIEW_DEFAULTS = {
  appUrl: "https://web-fcard-japan.vercel.app/",
  checkIntervalMinutes: 15,
  autoOpenReview: true,
  strictMode: true,
  popupCooldownMinutes: 60,
  maxWordsPerSession: 10
};

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAnswerState(value, fallback = "unanswered") {
  return ["unanswered", "correct", "correct_retry", "wrong", "revealed"].includes(value) ? value : fallback;
}

function normalizeHistoryTimes(value) {
  if (Array.isArray(value)) {
    return value.map(item => toNumber(item, NaN)).filter(Number.isFinite).slice(-20);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      return normalizeHistoryTimes(JSON.parse(value));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeDbVocab(row, projectName = "") {
  const correctCount = Math.max(0, Math.trunc(toNumber(row.correct_count, 0)));
  const wrongCount = Math.max(0, Math.trunc(toNumber(row.wrong_count, 0)));
  const historyTimes = normalizeHistoryTimes(row.history_times);
  const normalized = {
    id: row.id,
    projectId: row.project_id,
    projectName,
    japanese: row.japanese || "",
    romaji: row.romaji || "",
    meaning: row.meaning || "",
    correctCount,
    wrongCount,
    difficultyScore: clamp(toNumber(row.difficulty_score, 0), 0, 100),
    historyTimes,
    lastTested: row.last_tested_at ? Date.parse(row.last_tested_at) : 0,
    lastTimeSpent: toNumber(row.last_time_spent_sec, 0),
    lastAnswerState: normalizeAnswerState(row.last_answer_state),
    timesSeen: Math.max(0, Math.trunc(toNumber(row.times_seen, correctCount + wrongCount))),
    streakCorrect: Math.max(0, Math.trunc(toNumber(row.streak_correct, 0))),
    masteryScore: clamp(toNumber(row.mastery_score, 0), 0, 100),
    nextReviewAt: row.next_review_at ? Date.parse(row.next_review_at) : 0,
    reviewIntervalHours: toNumber(row.review_interval_hours, 0),
    reviewStage: Math.max(0, Math.trunc(toNumber(row.review_stage, 0))),
    lapseCount: Math.max(0, Math.trunc(toNumber(row.lapse_count, 0))),
    reviewReason: row.review_reason || "",
    easeFactor: clamp(toNumber(row.ease_factor, 2.5), 1.3, 3.2),
    memoryStability: toNumber(row.memory_stability, 0),
    memoryDifficulty: clamp(toNumber(row.memory_difficulty, 5), 1, 10)
  };

  if (!normalized.masteryScore && (correctCount + wrongCount) > 0) {
    normalized.masteryScore = calculateMasteryScore(normalized);
  }

  return normalized;
}

function calculateMasteryScore(vocab) {
  const total = (vocab.correctCount || 0) + (vocab.wrongCount || 0);
  if (total === 0) return 0;

  const avgTime = vocab.historyTimes.length ? average(vocab.historyTimes) : (vocab.lastTimeSpent || 0);
  const accuracyScore = ((vocab.correctCount || 0) / total) * 45;
  const exposureScore = Math.min(total, 5) * 2;
  const streakScore = Math.min(vocab.streakCorrect || 0, 5) * 5;
  const speedScore = avgTime <= 0 ? 0 : avgTime <= 3.5 ? 20 : avgTime <= 7 ? 14 : avgTime <= 10 ? 7 : 0;
  const difficultyPenalty = (vocab.difficultyScore || 0) * 0.3;
  const lastPenalty = vocab.lastAnswerState === "wrong" ? 10 : vocab.lastAnswerState === "revealed" ? 18 : vocab.lastAnswerState === "correct_retry" ? 6 : 0;

  let score = accuracyScore + exposureScore + streakScore + speedScore - difficultyPenalty - lastPenalty;
  if (total < 2) score = Math.min(score, 55);
  if ((vocab.streakCorrect || 0) < 2) score = Math.min(score, 72);
  return Math.round(clamp(score, 0, 100));
}

function classifyReviewGrade(vocab, answerState, timeSpentSec) {
  const state = normalizeAnswerState(answerState);
  const timeSpent = toNumber(timeSpentSec, 0);
  if (state === "wrong" || state === "revealed") return "again";
  if (state === "correct_retry") return "hard";
  if (timeSpent >= 10 || (vocab.difficultyScore || 0) >= 75) return "hard";
  if (timeSpent > 0 && timeSpent <= 3.5 && (vocab.difficultyScore || 0) <= 40 && (vocab.streakCorrect || 0) >= 2) return "easy";
  return "good";
}

function calculateReviewSchedule(vocab, answerState, timeSpentSec, now = Date.now()) {
  const grade = classifyReviewGrade(vocab, answerState, timeSpentSec);
  let intervalHours = vocab.reviewIntervalHours || 0;
  let stage = vocab.reviewStage || 0;
  let ease = clamp(vocab.easeFactor || 2.5, 1.3, 3.2);
  let lapse = vocab.lapseCount || 0;
  let reason = "";

  if (grade === "again") {
    intervalHours = 10 / 60;
    stage = 0;
    ease = clamp(ease - 0.2, 1.3, 3.2);
    lapse += 1;
    reason = "Sai hoặc phải xem đáp án";
  } else if (grade === "hard") {
    intervalHours = intervalHours > 0 ? Math.max(12, Math.min(intervalHours * 1.25, 72)) : 12;
    stage = Math.max(1, stage);
    ease = clamp(ease - 0.12, 1.3, 3.2);
    reason = answerState === "correct_retry" ? "Đúng sau gợi ý" : "Đúng nhưng phản xạ còn chậm/khó";
  } else if (grade === "easy") {
    intervalHours = stage <= 0 || intervalHours <= 0 ? 72 : intervalHours * (ease + 0.45);
    stage += 2;
    ease = clamp(ease + 0.08, 1.3, 3.2);
    reason = "Đúng nhanh, tăng khoảng cách ôn";
  } else {
    if (stage <= 0) intervalHours = 24;
    else if (stage === 1) intervalHours = 72;
    else intervalHours = intervalHours > 0 ? intervalHours * ease : 72;
    stage += 1;
    reason = "Đúng, cần kiểm tra lại theo đường cong lãng quên";
  }

  if (answerState === "correct" && (vocab.difficultyScore || 0) >= 60 && intervalHours > 72) {
    intervalHours = 72;
    reason = "Từ khó vừa trả lời đúng, kiểm tra lại sớm";
  }
  if ((vocab.masteryScore || 0) < 60 && intervalHours > 24) {
    intervalHours = 24;
    reason = "Điểm thuộc còn thấp";
  }

  intervalHours = clamp(intervalHours, 10 / 60, 24 * 90);
  return {
    next_review_at: new Date(now + intervalHours * 60 * 60 * 1000).toISOString(),
    review_interval_hours: Number(intervalHours.toFixed(2)),
    review_stage: stage,
    lapse_count: lapse,
    review_reason: reason,
    ease_factor: Number(ease.toFixed(2)),
    memory_stability: Number(Math.max(0.1, intervalHours / 24).toFixed(2)),
    memory_difficulty: Number(clamp(5 + ((vocab.difficultyScore || 0) / 20) + lapse * 0.7 - (vocab.streakCorrect || 0) * 0.25, 1, 10).toFixed(2))
  };
}

function buildReviewUpdate(vocab, answerState, timeSpentSec) {
  const now = Date.now();
  const timeSpent = Math.max(0, toNumber(timeSpentSec, 0));
  const next = { ...vocab };
  next.timesSeen = (next.timesSeen || 0) + 1;
  next.lastTested = now;
  next.lastTimeSpent = timeSpent;
  next.lastAnswerState = answerState;
  if (timeSpent > 0) next.historyTimes = [...(next.historyTimes || []), timeSpent].slice(-20);

  if (answerState === "correct") {
    next.correctCount = (next.correctCount || 0) + 1;
    next.streakCorrect = (next.streakCorrect || 0) + 1;
    next.difficultyScore = Math.max(0, (next.difficultyScore || 0) - (timeSpent <= 3.5 ? 18 : timeSpent <= 7 ? 10 : 2));
  } else {
    next.wrongCount = (next.wrongCount || 0) + 1;
    next.streakCorrect = 0;
    next.difficultyScore = Math.min(100, (next.difficultyScore || 0) + (answerState === "correct_retry" ? 15 : 28));
  }

  next.masteryScore = calculateMasteryScore(next);
  const schedule = calculateReviewSchedule(next, answerState, timeSpent, now);

  return {
    correct_count: next.correctCount,
    wrong_count: next.wrongCount,
    difficulty_score: Math.round(next.difficultyScore),
    history_times: next.historyTimes,
    last_tested_at: new Date(now).toISOString(),
    last_time_spent_sec: timeSpent,
    last_answer_state: answerState,
    times_seen: next.timesSeen,
    streak_correct: next.streakCorrect,
    mastery_score: next.masteryScore,
    updated_at: new Date(now).toISOString(),
    ...schedule
  };
}

function reviewStatus(vocab, now = Date.now()) {
  const msUntilDue = vocab.nextReviewAt ? vocab.nextReviewAt - now : 0;
  const daysSinceLast = vocab.lastTested ? (now - vocab.lastTested) / (24 * 60 * 60 * 1000) : null;
  const isOverdue = vocab.nextReviewAt > 0 && msUntilDue <= 0;
  const isDueSoon = vocab.nextReviewAt > 0 && msUntilDue > 0 && msUntilDue <= 12 * 60 * 60 * 1000;
  const isStale = ((vocab.correctCount || 0) + (vocab.wrongCount || 0)) > 0 && daysSinceLast !== null && daysSinceLast >= 7 && (vocab.masteryScore || 0) < 85;
  const isHardRecentCorrect = vocab.lastAnswerState === "correct" && (vocab.difficultyScore || 0) >= 55 && vocab.nextReviewAt > 0 && msUntilDue <= 72 * 60 * 60 * 1000;
  return {
    needsReview: isOverdue || isDueSoon || isStale || isHardRecentCorrect,
    isOverdue,
    isDueSoon,
    isStale,
    isHardRecentCorrect
  };
}
