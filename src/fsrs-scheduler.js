import { Rating, State, createEmptyCard, default_w, fsrs } from "ts-fsrs";

const DAY_MS = 24 * 60 * 60 * 1000;

const schedulers = new Map();

export const MEMORY_MODES = [
  "meaning_to_romaji",
  "jp_to_meaning",
  "romaji_to_meaning",
  "meaning_to_japanese",
  "audio_to_meaning"
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function schedulerFor(retention = 0.9, parameters = null) {
  const normalizedRetention = Number(clamp(finite(retention, 0.9), 0.8, 0.97).toFixed(2));
  const weights = Array.isArray(parameters?.w) && parameters.w.length === default_w.length
    ? parameters.w.map(value => finite(value))
    : null;
  const cacheKey = `${normalizedRetention}:${weights ? weights.join(",") : "default"}`;
  if (!schedulers.has(cacheKey)) {
    schedulers.set(cacheKey, fsrs({
      request_retention: normalizedRetention,
      maximum_interval: 3650,
      enable_fuzz: false,
      enable_short_term: true,
      learning_steps: ["10m", "30m"],
      relearning_steps: ["10m", "30m"],
      ...(weights ? { w: weights } : {})
    }));
  }
  return schedulers.get(cacheKey);
}

export function answerStateToFsrsRating(answerState, timeSpentSec = 0, vocab = {}, answerSignal = "") {
  if (answerSignal === "typo") {
    return answerState === "correct" || answerState === "correct_retry" ? Rating.Good : null;
  }
  if (answerSignal === "revealed") return Rating.Again;
  if (answerState === "wrong" || answerState === "revealed") return Rating.Again;
  if (answerState === "correct_retry") return Rating.Hard;

  const timeSpent = finite(timeSpentSec, 0);
  const difficulty = clamp(finite(vocab.difficultyScore, 0), 0, 100);
  const streak = Math.max(0, Math.trunc(finite(vocab.streakCorrect, 0)));

  if (timeSpent >= 10 || difficulty >= 75) return Rating.Hard;
  if (timeSpent > 0 && timeSpent <= 3.5 && difficulty <= 40 && streak >= 2) {
    return Rating.Easy;
  }
  return Rating.Good;
}

function parseStateCollection(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return parseStateCollection(JSON.parse(value));
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? value : {};
}

function hasLegacyMemory(vocab = {}) {
  return finite(vocab.fsrsReps ?? vocab.timesSeen, 0) > 0
    || finite(vocab.fsrsLastReviewAt ?? vocab.lastTested, 0) > 0;
}

function conservativeLegacyState(vocab = {}, mode = "") {
  if (!hasLegacyMemory(vocab)) return null;
  const productionMode = mode === "meaning_to_romaji" || mode === "meaning_to_japanese";
  const stabilityScale = productionMode ? 0.55 : 0.72;
  const reps = Math.max(1, Math.min(3, Math.trunc(finite(vocab.fsrsReps ?? vocab.timesSeen, 1))));
  const lastReviewAt = finite(vocab.fsrsLastReviewAt ?? vocab.lastTested, 0);
  const stability = Math.max(0.1, finite(vocab.fsrsStability ?? vocab.memoryStability, 0.1) * stabilityScale);
  const dueAt = Math.min(
    finite(vocab.fsrsDueAt ?? vocab.nextReviewAt, lastReviewAt),
    lastReviewAt + stability * DAY_MS
  );
  return {
    state: State.Review,
    dueAt,
    lastReviewAt,
    reps,
    lapses: Math.max(0, Math.trunc(finite(vocab.fsrsLapses ?? vocab.lapseCount, 0))),
    scheduledDays: Math.max(0, Math.round(stability)),
    elapsedDays: 0,
    learningSteps: 0,
    stability: Number(stability.toFixed(4)),
    difficulty: clamp(finite(vocab.fsrsDifficulty ?? vocab.memoryDifficulty, 5), 1, 10)
  };
}

export function normalizeModeMemoryStates(value) {
  const source = parseStateCollection(value);
  return Object.fromEntries(MEMORY_MODES.flatMap(mode => {
    const raw = source[mode];
    if (!raw || typeof raw !== "object") return [];
    return [[mode, {
      state: clamp(Math.trunc(finite(raw.state ?? raw.fsrsState, State.New)), State.New, State.Relearning),
      dueAt: finite(raw.dueAt ?? raw.fsrsDueAt, 0),
      lastReviewAt: finite(raw.lastReviewAt ?? raw.fsrsLastReviewAt, 0),
      reps: Math.max(0, Math.trunc(finite(raw.reps ?? raw.fsrsReps, 0))),
      lapses: Math.max(0, Math.trunc(finite(raw.lapses ?? raw.fsrsLapses, 0))),
      scheduledDays: Math.max(0, Math.trunc(finite(raw.scheduledDays ?? raw.fsrsScheduledDays, 0))),
      elapsedDays: Math.max(0, Math.trunc(finite(raw.elapsedDays ?? raw.fsrsElapsedDays, 0))),
      learningSteps: Math.max(0, Math.trunc(finite(raw.learningSteps ?? raw.fsrsLearningSteps, 0))),
      stability: Math.max(0, finite(raw.stability ?? raw.fsrsStability, 0)),
      difficulty: clamp(finite(raw.difficulty ?? raw.fsrsDifficulty, 5), 1, 10),
      lastAnswerSignal: typeof raw.lastAnswerSignal === "string" ? raw.lastAnswerSignal : "",
      lastResponseSeconds: Math.max(0, finite(raw.lastResponseSeconds, 0))
    }]];
  }));
}

export function getModeMemoryState(vocab = {}, mode, { includeLegacy = true } = {}) {
  if (!MEMORY_MODES.includes(mode)) return null;
  const states = normalizeModeMemoryStates(vocab.modeMemoryStates ?? vocab.mode_memory_states);
  if (Object.keys(states).length > 0) return states[mode] || null;
  return includeLegacy ? conservativeLegacyState(vocab, mode) : null;
}

function stateToFsrsShape(state, now) {
  if (!state?.lastReviewAt || !state?.reps) return createEmptyCard(new Date(now));
  return {
    due: new Date(state.dueAt || now),
    stability: Math.max(0.1, finite(state.stability, 0.1)),
    difficulty: clamp(finite(state.difficulty, 5), 1, 10),
    elapsed_days: Math.max(0, Math.round((now - state.lastReviewAt) / DAY_MS)),
    scheduled_days: Math.max(0, Math.round(finite(state.scheduledDays, 0))),
    learning_steps: Math.max(0, Math.trunc(finite(state.learningSteps, 0))),
    reps: Math.max(0, Math.trunc(finite(state.reps, 0))),
    lapses: Math.max(0, Math.trunc(finite(state.lapses, 0))),
    state: clamp(Math.trunc(finite(state.state, State.Review)), State.New, State.Relearning),
    last_review: new Date(state.lastReviewAt)
  };
}

export function vocabToFsrsCard(vocab = {}, now = Date.now()) {
  const reviewedAt = finite(vocab.fsrsLastReviewAt ?? vocab.lastTested, 0);
  const reps = Math.max(0, Math.trunc(finite(vocab.fsrsReps ?? vocab.timesSeen, 0)));
  if (!reviewedAt || reps === 0) {
    return createEmptyCard(new Date(now));
  }

  const intervalDays = Math.max(
    0,
    finite(vocab.fsrsScheduledDays, finite(vocab.reviewIntervalHours, 0) / 24)
  );
  const stability = Math.max(
    0.1,
    finite(vocab.fsrsStability ?? vocab.memoryStability, intervalDays || 0.1)
  );
  const difficulty = clamp(
    finite(vocab.fsrsDifficulty ?? vocab.memoryDifficulty, 5),
    1,
    10
  );
  const dueAt = finite(vocab.fsrsDueAt ?? vocab.nextReviewAt, now);
  const state = clamp(Math.trunc(finite(vocab.fsrsState, State.Review)), State.New, State.Relearning);

  return {
    due: new Date(dueAt || now),
    stability,
    difficulty,
    elapsed_days: Math.max(0, Math.round((now - reviewedAt) / DAY_MS)),
    scheduled_days: Math.max(0, Math.round(intervalDays)),
    learning_steps: Math.max(0, Math.trunc(finite(vocab.fsrsLearningSteps, 0))),
    reps,
    lapses: Math.max(0, Math.trunc(finite(vocab.fsrsLapses ?? vocab.lapseCount, 0))),
    state,
    last_review: new Date(reviewedAt)
  };
}

export function scheduleVocabWithFsrs(
  vocab,
  answerState,
  timeSpentSec,
  now = Date.now(),
  retention = 0.9,
  options = {}
) {
  const mode = MEMORY_MODES.includes(options.mode) ? options.mode : "";
  const answerSignal = options.answerSignal || "";
  const scheduler = schedulerFor(retention, options.parameters);
  const modeState = mode ? getModeMemoryState(vocab, mode) : null;
  const card = modeState ? stateToFsrsShape(modeState, now) : vocabToFsrsCard(vocab, now);
  const rating = answerStateToFsrsRating(answerState, timeSpentSec, vocab, answerSignal);
  if (rating === null) {
    return { rating, modeMemoryStates: normalizeModeMemoryStates(vocab.modeMemoryStates) };
  }
  const result = scheduler.next(card, new Date(now), rating);
  const nextCard = result.card;
  const intervalHours = Math.max(1 / 60, (nextCard.due.getTime() - now) / (60 * 60 * 1000));

  const nextModeState = {
    state: nextCard.state,
    dueAt: nextCard.due.getTime(),
    lastReviewAt: nextCard.last_review?.getTime() || now,
    reps: nextCard.reps,
    lapses: nextCard.lapses,
    scheduledDays: nextCard.scheduled_days,
    elapsedDays: nextCard.elapsed_days,
    learningSteps: nextCard.learning_steps,
    stability: Number(nextCard.stability.toFixed(4)),
    difficulty: Number(nextCard.difficulty.toFixed(4)),
    lastAnswerSignal: answerSignal,
    lastResponseSeconds: Math.max(0, finite(timeSpentSec, 0))
  };
  const modeMemoryStates = normalizeModeMemoryStates(vocab.modeMemoryStates ?? vocab.mode_memory_states);
  if (mode) modeMemoryStates[mode] = nextModeState;
  const memoryValues = Object.values(modeMemoryStates).filter(state => state.reps > 0);
  const aggregateDueAt = memoryValues.length
    ? Math.min(...memoryValues.map(state => state.dueAt || now))
    : nextCard.due.getTime();
  const aggregateLastReviewAt = memoryValues.length
    ? Math.max(...memoryValues.map(state => state.lastReviewAt || 0))
    : nextCard.last_review?.getTime() || now;
  const aggregateStability = memoryValues.length
    ? Math.min(...memoryValues.map(state => Math.max(0.1, state.stability)))
    : nextCard.stability;
  const aggregateDifficulty = memoryValues.length
    ? Math.max(...memoryValues.map(state => state.difficulty))
    : nextCard.difficulty;

  return {
    rating,
    nextReviewAt: aggregateDueAt,
    reviewIntervalHours: Number(Math.max(1 / 60, (aggregateDueAt - now) / (60 * 60 * 1000)).toFixed(2)),
    reviewStage: nextCard.reps,
    lapseCount: nextCard.lapses,
    memoryStability: Number(aggregateStability.toFixed(4)),
    memoryDifficulty: Number(aggregateDifficulty.toFixed(4)),
    fsrsState: nextCard.state,
    fsrsDueAt: aggregateDueAt,
    fsrsLastReviewAt: aggregateLastReviewAt,
    fsrsReps: nextCard.reps,
    fsrsLapses: nextCard.lapses,
    fsrsScheduledDays: nextCard.scheduled_days,
    fsrsElapsedDays: nextCard.elapsed_days,
    fsrsLearningSteps: nextCard.learning_steps,
    fsrsStability: Number(aggregateStability.toFixed(4)),
    fsrsDifficulty: Number(aggregateDifficulty.toFixed(4)),
    modeMemoryStates
  };
}

function stateRetrievability(state, at, retention, parameters = null) {
  if (!state?.lastReviewAt || !state?.reps) return 0;
  try {
    return clamp(schedulerFor(retention, parameters).get_retrievability(stateToFsrsShape(state, at), new Date(at), false), 0, 1);
  } catch {
    const elapsedDays = Math.max(0, (at - state.lastReviewAt) / DAY_MS);
    return clamp(Math.pow(1 + elapsedDays / (9 * Math.max(0.1, state.stability)), -1), 0, 1);
  }
}

export function getVocabRetrievability(vocab, at = Date.now(), retention = 0.9, mode = "", parameters = null) {
  if (mode) return stateRetrievability(getModeMemoryState(vocab, mode), at, retention, parameters);
  const states = normalizeModeMemoryStates(vocab?.modeMemoryStates ?? vocab?.mode_memory_states);
  const values = Object.values(states).map(state => stateRetrievability(state, at, retention, parameters));
  if (values.length) return Math.min(...values);
  const reviewedAt = finite(vocab?.fsrsLastReviewAt ?? vocab?.lastTested, 0);
  const reps = Math.max(0, Math.trunc(finite(vocab?.fsrsReps ?? vocab?.timesSeen, 0)));
  if (!reviewedAt || reps === 0) return 0;

  try {
    const scheduler = schedulerFor(retention, parameters);
    return clamp(scheduler.get_retrievability(vocabToFsrsCard(vocab, at), new Date(at), false), 0, 1);
  } catch {
    const stabilityDays = Math.max(0.1, finite(vocab?.memoryStability, 0.1));
    const elapsedDays = Math.max(0, (at - reviewedAt) / DAY_MS);
    return clamp(Math.pow(1 + elapsedDays / (9 * stabilityDays), -1), 0, 1);
  }
}

export { Rating, State };
