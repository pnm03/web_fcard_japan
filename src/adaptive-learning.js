import { default_w } from "ts-fsrs";

const QUALITY_SIGNALS = new Set(["exact", "accepted_variant", "slow", "wrong_knowledge", "revealed"]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function buildPersonalizedFsrsProfile(logs = [], minimumLogs = 200) {
  const qualityLogs = logs.filter(log => (
    QUALITY_SIGNALS.has(log.answerSignal)
    && Number(log.reviewedAt) > 0
    && Number(log.responseSeconds) >= 0
    && log.mode
  ));
  if (qualityLogs.length < minimumLogs) {
    return {
      active: false,
      sampleSize: qualityLogs.length,
      minimumLogs,
      version: "fsrs6-adaptive-v1",
      w: [...default_w]
    };
  }

  const failures = qualityLogs.filter(log => log.answerState === "wrong" || log.answerState === "revealed").length;
  const slow = qualityLogs.filter(log => log.responseSeconds > 8).length;
  const retry = qualityLogs.filter(log => log.answerState === "correct_retry").length;
  const failureRate = failures / qualityLogs.length;
  const frictionRate = (slow + retry) / qualityLogs.length;
  const weights = [...default_w];

  // Conservative calibration: only tune initial stability and difficulty. A full
  // optimizer can replace this profile once review logs are exported to FSRS fit.
  const stabilityScale = clamp(1.08 - failureRate * 0.65 - frictionRate * 0.25, 0.72, 1.08);
  for (let index = 0; index < 4; index += 1) weights[index] *= stabilityScale;
  weights[4] = clamp(weights[4] + failureRate * 1.2 + frictionRate * 0.4, 1, 10);

  return {
    active: true,
    sampleSize: qualityLogs.length,
    minimumLogs,
    version: "fsrs6-adaptive-v1",
    fittedAt: Math.max(...qualityLogs.map(log => Number(log.reviewedAt) || 0)),
    failureRate: Number(failureRate.toFixed(4)),
    frictionRate: Number(frictionRate.toFixed(4)),
    w: weights.map(value => Number(value.toFixed(6)))
  };
}

export function shouldShowRescueCard(vocab = {}, recentLogs = []) {
  const relevant = recentLogs
    .filter(log => log.vocabId === vocab.id)
    .sort((a, b) => b.reviewedAt - a.reviewedAt)
    .slice(0, 6);
  const failures = relevant.filter(log => log.answerState === "wrong" || log.answerState === "revealed").length;
  const lapses = Math.max(
    Number(vocab.fsrsLapses || 0),
    ...Object.values(vocab.modeMemoryStates || {}).map(state => Number(state.lapses || 0))
  );
  return failures >= 2 || lapses >= 2 || Number(vocab.difficultyScore || 0) >= 85;
}

export function buildRescueCardModel(vocab = {}) {
  const card = vocab.rescueCard || {};
  return {
    japanese: vocab.japanese || "",
    romaji: vocab.romaji || "",
    meaning: vocab.meaning || "",
    example: card.example || "",
    translation: card.translation || "",
    mnemonic: card.mnemonic || "",
    confusionPairIds: Array.isArray(card.confusionPairIds) ? card.confusionPairIds : [],
    rescueCount: Number(card.rescueCount || 0)
  };
}

export function incrementRescueCard(vocab = {}, now = Date.now()) {
  return {
    ...(vocab.rescueCard || {}),
    rescueCount: Number(vocab.rescueCard?.rescueCount || 0) + 1,
    lastShownAt: now
  };
}
