import { supabase } from "./supabase.js";

// Khởi tạo dữ liệu mẫu nếu chưa có dữ liệu trong localStorage
const DEFAULT_PROJECTS = [
  {
    id: "proj-intro",
    name: "Chào hỏi cơ bản (Greeting)",
    description: "Các câu chào hỏi giao tiếp thông thường trong tiếng Nhật.",
    vocab: [
      { id: "v1", japanese: "こんにちは", romaji: "konnichiwa", meaning: "Xin chào (ban ngày)", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "v2", japanese: "ありがとう", romaji: "arigatou", meaning: "Cảm ơn", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "v3", japanese: "すみません", romaji: "sumimasen", meaning: "Xin lỗi / Xin hỏi", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "v4", japanese: "さようなら", romaji: "sayounara", meaning: "Tạm biệt", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "v5", japanese: "おやすみなさい", romaji: "oyasuminasai", meaning: "Chúc ngủ ngon", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "v6", japanese: "はじめまして", romaji: "hajimemashite", meaning: "Rất vui được gặp bạn (lần đầu)", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 }
    ]
  },
  {
    id: "proj-numbers",
    name: "Số đếm 1-10 (Numbers 1-10)",
    description: "Học cách đếm các số cơ bản từ 1 đến 10.",
    vocab: [
      { id: "n1", japanese: "いち (一)", romaji: "ichi", meaning: "Số 1", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "n2", japanese: "に (二)", romaji: "ni", meaning: "Số 2", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "n3", japanese: "さん (三)", romaji: "san", meaning: "Số 3", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "n4", japanese: "よん / し (四)", romaji: "yon", meaning: "Số 4", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "n5", japanese: "ご (五)", romaji: "go", meaning: "Số 5", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "n6", japanese: "ろく (六)", romaji: "roku", meaning: "Số 6", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "n7", japanese: "なな / しち (七)", romaji: "nana", meaning: "Số 7", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "n8", japanese: "はち (八)", romaji: "hachi", meaning: "Số 8", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "n9", japanese: "きゅう / く (九)", romaji: "kyuu", meaning: "Số 9", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 },
      { id: "n10", japanese: "じゅう (十)", romaji: "juu", meaning: "Số 10", correctCount: 0, wrongCount: 0, historyTimes: [], difficultyScore: 0 }
    ]
  }
];

const STORAGE_KEY = "nihongo_flashcard_projects";

const BASE_VOCAB_COLUMNS = new Set([
  "id",
  "project_id",
  "japanese",
  "romaji",
  "meaning",
  "correct_count",
  "wrong_count",
  "difficulty_score"
]);

const LEARNING_VOCAB_COLUMNS = [
  "history_times",
  "last_tested_at",
  "last_time_spent_sec",
  "last_answer_state",
  "times_seen",
  "streak_correct",
  "mastery_score",
  "next_review_at",
  "review_interval_hours",
  "review_stage",
  "lapse_count",
  "review_reason",
  "ease_factor",
  "memory_stability",
  "memory_difficulty",
  "updated_at"
];

let supportedVocabColumns = new Set(BASE_VOCAB_COLUMNS);

// Trạng thái đồng bộ cơ sở dữ liệu
let onSyncStateChangeCallback = null;

export function setOnSyncStateChange(callback) {
  onSyncStateChangeCallback = callback;
}

function updateSyncState(state) {
  if (onSyncStateChangeCallback) {
    onSyncStateChangeCallback(state);
  }
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toFiniteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toNonNegativeInt(value, fallback = 0) {
  return Math.max(0, Math.trunc(toFiniteNumber(value, fallback)));
}

function normalizeHistoryTimes(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => toFiniteNumber(item, NaN))
      .filter(Number.isFinite)
      .slice(-20);
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

function normalizeTimestampToMs(value) {
  if (!value) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeAnswerState(value, fallback = "unanswered") {
  const allowed = new Set(["unanswered", "correct", "correct_retry", "wrong", "revealed"]);
  return allowed.has(value) ? value : fallback;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hoursToMs(hours) {
  return hours * 60 * 60 * 1000;
}

function formatHoursHuman(hours) {
  if (!Number.isFinite(hours) || hours <= 0) return "ngay bây giờ";
  if (hours < 1) return `${Math.round(hours * 60)} phút`;
  if (hours < 24) return `${Math.round(hours)} giờ`;
  const days = hours / 24;
  if (days < 7) return `${Math.round(days)} ngày`;
  const weeks = days / 7;
  if (weeks < 8) return `${Math.round(weeks)} tuần`;
  return `${Math.round(days / 30)} tháng`;
}

function classifyReviewGrade(vocab, answerState, timeSpentSec) {
  const normalizedAnswerState = normalizeAnswerState(answerState);
  const timeSpent = toFiniteNumber(timeSpentSec, 0);
  const difficultyScore = clampNumber(toFiniteNumber(vocab.difficultyScore, 0), 0, 100);

  if (normalizedAnswerState === "wrong" || normalizedAnswerState === "revealed") return "again";
  if (normalizedAnswerState === "correct_retry") return "hard";
  if (timeSpent >= 10 || difficultyScore >= 75) return "hard";
  if (timeSpent > 0 && timeSpent <= 3.5 && difficultyScore <= 40 && (vocab.streakCorrect || 0) >= 2) return "easy";
  return "good";
}

function calculateReviewSchedule(vocab, answerState, timeSpentSec, now = Date.now()) {
  const grade = classifyReviewGrade(vocab, answerState, timeSpentSec);
  const currentInterval = toFiniteNumber(vocab.reviewIntervalHours, 0);
  const currentStage = toNonNegativeInt(vocab.reviewStage, 0);
  const currentEase = clampNumber(toFiniteNumber(vocab.easeFactor, 2.5), 1.3, 3.2);
  const lapseCount = toNonNegativeInt(vocab.lapseCount, 0);
  const difficultyScore = clampNumber(toFiniteNumber(vocab.difficultyScore, 0), 0, 100);
  const masteryScore = clampNumber(toFiniteNumber(vocab.masteryScore, 0), 0, 100);

  let intervalHours = currentInterval;
  let reviewStage = currentStage;
  let easeFactor = currentEase;
  let nextLapseCount = lapseCount;
  let reason = "";

  if (grade === "again") {
    intervalHours = 10 / 60;
    reviewStage = 0;
    easeFactor = clampNumber(easeFactor - 0.2, 1.3, 3.2);
    nextLapseCount += 1;
    reason = "Sai hoặc phải xem đáp án";
  } else if (grade === "hard") {
    intervalHours = currentInterval > 0
      ? Math.max(12, Math.min(currentInterval * 1.25, 72))
      : 12;
    reviewStage = Math.max(1, currentStage);
    easeFactor = clampNumber(easeFactor - 0.12, 1.3, 3.2);
    reason = answerState === "correct_retry" ? "Đúng sau gợi ý" : "Đúng nhưng phản xạ còn chậm/khó";
  } else if (grade === "easy") {
    if (currentStage <= 0) {
      intervalHours = 72;
    } else if (currentInterval <= 0) {
      intervalHours = 72;
    } else {
      intervalHours = currentInterval * (easeFactor + 0.45);
    }
    reviewStage = currentStage + 2;
    easeFactor = clampNumber(easeFactor + 0.08, 1.3, 3.2);
    reason = "Đúng nhanh, tăng khoảng cách ôn";
  } else {
    if (currentStage <= 0) {
      intervalHours = 24;
    } else if (currentStage === 1) {
      intervalHours = 72;
    } else if (currentInterval <= 0) {
      intervalHours = 72;
    } else {
      intervalHours = currentInterval * easeFactor;
    }
    reviewStage = currentStage + 1;
    reason = "Đúng, cần kiểm tra lại theo đường cong lãng quên";
  }

  if (answerState === "correct" && difficultyScore >= 60 && intervalHours > 72) {
    intervalHours = 72;
    reason = "Từ khó vừa trả lời đúng, kiểm tra lại sớm";
  }

  if (masteryScore < 60 && intervalHours > 24) {
    intervalHours = 24;
    reason = "Điểm thuộc còn thấp";
  }

  intervalHours = clampNumber(intervalHours, 10 / 60, 24 * 90);
  const stabilityDays = Math.max(0.1, intervalHours / 24);
  const memoryDifficulty = clampNumber(
    5 + (difficultyScore / 20) + nextLapseCount * 0.7 - (vocab.streakCorrect || 0) * 0.25,
    1,
    10
  );

  return {
    grade,
    nextReviewAt: now + hoursToMs(intervalHours),
    reviewIntervalHours: Number(intervalHours.toFixed(2)),
    reviewStage,
    lapseCount: nextLapseCount,
    reviewReason: reason,
    easeFactor: Number(easeFactor.toFixed(2)),
    memoryStability: Number(stabilityDays.toFixed(2)),
    memoryDifficulty: Number(memoryDifficulty.toFixed(2))
  };
}

function calculateMasteryScore(vocab) {
  const correctCount = toNonNegativeInt(vocab.correctCount ?? vocab.correct_count);
  const wrongCount = toNonNegativeInt(vocab.wrongCount ?? vocab.wrong_count);
  const totalAnswers = correctCount + wrongCount;
  if (totalAnswers === 0) return 0;

  const historyTimes = normalizeHistoryTimes(vocab.historyTimes ?? vocab.history_times);
  const avgTime = historyTimes.length
    ? average(historyTimes)
    : toFiniteNumber(vocab.lastTimeSpent ?? vocab.last_time_spent_sec, 0);
  const difficultyScore = clampNumber(toFiniteNumber(vocab.difficultyScore ?? vocab.difficulty_score, 0), 0, 100);
  const streakCorrect = toNonNegativeInt(vocab.streakCorrect ?? vocab.streak_correct);
  const lastAnswerState = normalizeAnswerState(vocab.lastAnswerState ?? vocab.last_answer_state);

  const accuracyScore = (correctCount / totalAnswers) * 45;
  const exposureScore = Math.min(totalAnswers, 5) * 2;
  const streakScore = Math.min(streakCorrect, 5) * 5;
  const speedScore = avgTime <= 0 ? 0 : avgTime <= 3.5 ? 20 : avgTime <= 7 ? 14 : avgTime <= 10 ? 7 : 0;
  const difficultyPenalty = difficultyScore * 0.3;
  const lastPenalty = lastAnswerState === "wrong" ? 10 : lastAnswerState === "revealed" ? 18 : lastAnswerState === "correct_retry" ? 6 : 0;

  let score = accuracyScore + exposureScore + streakScore + speedScore - difficultyPenalty - lastPenalty;

  if (totalAnswers < 2) score = Math.min(score, 55);
  if (streakCorrect < 2) score = Math.min(score, 72);

  return Math.round(clampNumber(score, 0, 100));
}

function normalizeVocab(vocab) {
  const correctCount = toNonNegativeInt(vocab.correctCount ?? vocab.correct_count);
  const wrongCount = toNonNegativeInt(vocab.wrongCount ?? vocab.wrong_count);
  const historyTimes = normalizeHistoryTimes(vocab.historyTimes ?? vocab.history_times);
  const lastTimeSpent = toFiniteNumber(vocab.lastTimeSpent ?? vocab.last_time_spent_sec, 0);
  const lastAnswerState = normalizeAnswerState(vocab.lastAnswerState ?? vocab.last_answer_state);
  const normalized = {
    ...vocab,
    correctCount,
    wrongCount,
    historyTimes,
    difficultyScore: Math.round(clampNumber(toFiniteNumber(vocab.difficultyScore ?? vocab.difficulty_score, 0), 0, 100)),
    lastTested: normalizeTimestampToMs(vocab.lastTested ?? vocab.last_tested_at),
    lastTimeSpent,
    lastAnswerState,
    timesSeen: toNonNegativeInt(vocab.timesSeen ?? vocab.times_seen, correctCount + wrongCount),
    streakCorrect: toNonNegativeInt(vocab.streakCorrect ?? vocab.streak_correct),
    nextReviewAt: normalizeTimestampToMs(vocab.nextReviewAt ?? vocab.next_review_at),
    reviewIntervalHours: toFiniteNumber(vocab.reviewIntervalHours ?? vocab.review_interval_hours, 0),
    reviewStage: toNonNegativeInt(vocab.reviewStage ?? vocab.review_stage, 0),
    lapseCount: toNonNegativeInt(vocab.lapseCount ?? vocab.lapse_count, 0),
    reviewReason: typeof (vocab.reviewReason ?? vocab.review_reason) === "string" ? (vocab.reviewReason ?? vocab.review_reason) : "",
    easeFactor: clampNumber(toFiniteNumber(vocab.easeFactor ?? vocab.ease_factor, 2.5), 1.3, 3.2),
    memoryStability: toFiniteNumber(vocab.memoryStability ?? vocab.memory_stability, 0),
    memoryDifficulty: clampNumber(toFiniteNumber(vocab.memoryDifficulty ?? vocab.memory_difficulty, 5), 1, 10)
  };

  normalized.masteryScore = Math.round(clampNumber(
    toFiniteNumber(vocab.masteryScore ?? vocab.mastery_score, calculateMasteryScore(normalized)),
    0,
    100
  ));

  return normalized;
}

function rememberVocabColumns(rows = []) {
  if (!rows.length) return;
  supportedVocabColumns = new Set([...BASE_VOCAB_COLUMNS, ...Object.keys(rows[0])]);
}

function supportsVocabColumn(column) {
  return supportedVocabColumns.has(column);
}

function toDbTimestamp(ms) {
  return ms ? new Date(ms).toISOString() : null;
}

function buildVocabUpsertPayload(vocab, projectId) {
  const normalized = normalizeVocab(vocab);
  const payload = {
    id: normalized.id,
    project_id: projectId,
    japanese: normalized.japanese,
    romaji: normalized.romaji,
    meaning: normalized.meaning,
    correct_count: normalized.correctCount,
    wrong_count: normalized.wrongCount,
    difficulty_score: normalized.difficultyScore
  };

  const learningPayload = {
    history_times: normalized.historyTimes,
    last_tested_at: toDbTimestamp(normalized.lastTested),
    last_time_spent_sec: normalized.lastTimeSpent,
    last_answer_state: normalized.lastAnswerState,
    times_seen: normalized.timesSeen,
    streak_correct: normalized.streakCorrect,
    mastery_score: normalized.masteryScore,
    next_review_at: toDbTimestamp(normalized.nextReviewAt),
    review_interval_hours: normalized.reviewIntervalHours,
    review_stage: normalized.reviewStage,
    lapse_count: normalized.lapseCount,
    review_reason: normalized.reviewReason,
    ease_factor: normalized.easeFactor,
    memory_stability: normalized.memoryStability,
    memory_difficulty: normalized.memoryDifficulty,
    updated_at: new Date().toISOString()
  };

  LEARNING_VOCAB_COLUMNS.forEach(column => {
    if (supportsVocabColumn(column)) {
      payload[column] = learningPayload[column];
    }
  });

  return payload;
}

// Bọc tác vụ đồng bộ để báo trạng thái lên giao diện và xử lý ngoại lệ
async function safeSync(actionFn) {
  updateSyncState("syncing");
  try {
    await actionFn();
    updateSyncState("synced");
  } catch (e) {
    console.error("Lỗi đồng bộ Supabase:", e);
    updateSyncState("error");
  }
}

export function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
  }
}

export function getProjects() {
  initializeStorage();
  try {
    const projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return projects.map(project => ({
      ...project,
      vocab: (project.vocab || []).map(normalizeVocab)
    }));
  } catch (e) {
    console.error("Lỗi khi đọc localStorage", e);
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getProjectById(projectId) {
  const projects = getProjects();
  return projects.find(p => p.id === projectId) || null;
}

export function addProject(name, description = "") {
  const projects = getProjects();
  const newProject = {
    id: "proj-" + Date.now(),
    name: name,
    description: description,
    vocab: []
  };
  projects.push(newProject);
  saveProjects(projects);
  
  // Đồng bộ đám mây ngầm
  safeSync(async () => {
    const { error } = await supabase
      .from("projects")
      .upsert({
        id: newProject.id,
        name: newProject.name,
        description: newProject.description
      });
    if (error) throw error;
  });

  return newProject;
}

export function deleteProject(projectId) {
  let projects = getProjects();
  projects = projects.filter(p => p.id !== projectId);
  saveProjects(projects);
  
  // Đồng bộ đám mây ngầm
  safeSync(async () => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);
    if (error) throw error;
  });
}

export function updateProjectInfo(projectId, name, description) {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects[index].name = name;
    projects[index].description = description;
    saveProjects(projects);
    
    // Đồng bộ đám mây ngầm
    const updated = projects[index];
    safeSync(async () => {
      const { error } = await supabase
        .from("projects")
        .upsert({
          id: updated.id,
          name: updated.name,
          description: updated.description
        });
      if (error) throw error;
    });

    return projects[index];
  }
  return null;
}

export function addVocabToProject(projectId, vocabData) {
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return null;

  const newVocab = {
    id: "v-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
    japanese: vocabData.japanese.trim(),
    romaji: vocabData.romaji.trim().toLowerCase(),
    meaning: vocabData.meaning.trim(),
    correctCount: 0,
    wrongCount: 0,
    historyTimes: [],
    difficultyScore: 0,
    lastTested: 0,
    lastTimeSpent: 0,
    lastAnswerState: "unanswered",
    timesSeen: 0,
    streakCorrect: 0,
    masteryScore: 0,
    nextReviewAt: 0,
    reviewIntervalHours: 0,
    reviewStage: 0,
    lapseCount: 0,
    reviewReason: "",
    easeFactor: 2.5,
    memoryStability: 0,
    memoryDifficulty: 5
  };

  projects[projectIndex].vocab.push(newVocab);
  saveProjects(projects);
  
  // Đồng bộ đám mây ngầm
  safeSync(async () => {
    const { error } = await supabase
      .from("vocab")
      .upsert(buildVocabUpsertPayload(newVocab, projectId));
    if (error) throw error;
  });

  return newVocab;
}

export function updateVocabInProject(projectId, vocabId, updatedData) {
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return false;

  const vocabIndex = projects[projectIndex].vocab.findIndex(v => v.id === vocabId);
  if (vocabIndex === -1) return false;

  const currentVocab = projects[projectIndex].vocab[vocabIndex];
  const nextTextValue = (key, transform = value => value) => {
    const value = updatedData[key];
    if (typeof value !== "string") return currentVocab[key];
    return transform(value.trim());
  };

  const updated = {
    ...currentVocab,
    japanese: nextTextValue("japanese"),
    romaji: nextTextValue("romaji", value => value.toLowerCase()),
    meaning: nextTextValue("meaning")
  };
  projects[projectIndex].vocab[vocabIndex] = updated;

  saveProjects(projects);
  
  // Đồng bộ đám mây ngầm
  safeSync(async () => {
    const { error } = await supabase
      .from("vocab")
      .upsert(buildVocabUpsertPayload(updated, projectId));
    if (error) throw error;
  });

  return true;
}

export function deleteVocabFromProject(projectId, vocabId) {
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return false;

  projects[projectIndex].vocab = projects[projectIndex].vocab.filter(v => v.id !== vocabId);
  saveProjects(projects);
  
  // Đồng bộ đám mây ngầm
  safeSync(async () => {
    const { error } = await supabase
      .from("vocab")
      .delete()
      .eq("id", vocabId);
    if (error) throw error;
  });

  return true;
}

export function updateVocabStats(projectId, vocabId, isCorrect, timeSpentSec, answerState = null) {
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return null;

  const vocabIndex = projects[projectIndex].vocab.findIndex(v => v.id === vocabId);
  if (vocabIndex === -1) return null;

  const vocab = normalizeVocab(projects[projectIndex].vocab[vocabIndex]);
  const normalizedTimeSpent = Math.max(0, toFiniteNumber(timeSpentSec, 0));
  const normalizedAnswerState = normalizeAnswerState(
    answerState || (isCorrect ? "correct" : "wrong"),
    isCorrect ? "correct" : "wrong"
  );

  vocab.timesSeen = (vocab.timesSeen || 0) + 1;
  vocab.lastTested = Date.now();
  vocab.lastTimeSpent = normalizedTimeSpent;
  vocab.lastAnswerState = normalizedAnswerState;

  if (normalizedTimeSpent > 0) {
    vocab.historyTimes.push(normalizedTimeSpent);
    if (vocab.historyTimes.length > 20) {
      vocab.historyTimes = vocab.historyTimes.slice(-20);
    }
  }

  if (normalizedAnswerState === "correct") {
    vocab.correctCount += 1;
    vocab.streakCorrect = (vocab.streakCorrect || 0) + 1;
  } else {
    vocab.wrongCount += 1;
    vocab.streakCorrect = 0;
  }

  let currentDifficulty = vocab.difficultyScore || 0;
  if (normalizedAnswerState === "correct") {
    if (normalizedTimeSpent <= 3.5) {
      currentDifficulty = Math.max(0, currentDifficulty - 18);
    } else if (normalizedTimeSpent <= 7.0) {
      currentDifficulty = Math.max(0, currentDifficulty - 10);
    } else if (normalizedTimeSpent <= 10.0) {
      currentDifficulty = Math.max(0, currentDifficulty - 2);
    } else {
      currentDifficulty = Math.min(100, currentDifficulty + 8);
    }
    currentDifficulty = Math.max(0, currentDifficulty - Math.min(10, vocab.streakCorrect * 2));
  } else if (normalizedAnswerState === "correct_retry") {
    currentDifficulty = Math.min(100, currentDifficulty + 15);
  } else if (normalizedAnswerState === "revealed") {
    currentDifficulty = Math.min(100, currentDifficulty + 40);
  } else {
    currentDifficulty = Math.min(100, currentDifficulty + 28);
  }

  vocab.difficultyScore = Math.round(clampNumber(currentDifficulty, 0, 100));
  vocab.masteryScore = calculateMasteryScore(vocab);
  Object.assign(vocab, calculateReviewSchedule(vocab, normalizedAnswerState, normalizedTimeSpent, vocab.lastTested));
  projects[projectIndex].vocab[vocabIndex] = vocab;

  saveProjects(projects);
  
  // Đồng bộ đám mây ngầm
  safeSync(async () => {
    const { error } = await supabase
      .from("vocab")
      .upsert(buildVocabUpsertPayload(vocab, projectId));
    if (error) throw error;
  });

  return vocab;
}

export function markVocabAsMaxDifficulty(projectId, vocabId, timeSpentSec = 0) {
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return null;

  const vocabIndex = projects[projectIndex].vocab.findIndex(v => v.id === vocabId);
  if (vocabIndex === -1) return null;

  const vocab = normalizeVocab(projects[projectIndex].vocab[vocabIndex]);
  vocab.wrongCount = (vocab.wrongCount || 0) + 2;
  vocab.timesSeen = (vocab.timesSeen || 0) + 1;
  vocab.difficultyScore = 100;
  vocab.lastTested = Date.now();
  vocab.lastTimeSpent = Math.max(0, toFiniteNumber(timeSpentSec, 0));
  vocab.lastAnswerState = "revealed";
  vocab.streakCorrect = 0;
  if (vocab.lastTimeSpent > 0) {
    vocab.historyTimes.push(vocab.lastTimeSpent);
    if (vocab.historyTimes.length > 20) {
      vocab.historyTimes = vocab.historyTimes.slice(-20);
    }
  }
  vocab.masteryScore = calculateMasteryScore(vocab);
  Object.assign(vocab, calculateReviewSchedule(vocab, "revealed", vocab.lastTimeSpent, vocab.lastTested));
  projects[projectIndex].vocab[vocabIndex] = vocab;

  saveProjects(projects);
  
  // Đồng bộ đám mây ngầm
  safeSync(async () => {
    const { error } = await supabase
      .from("vocab")
      .upsert(buildVocabUpsertPayload(vocab, projectId));
    if (error) throw error;
  });

  return vocab;
}

// Kéo dữ liệu từ đám mây Supabase về ghi đè LocalStorage
export async function fetchAndSyncFromSupabase() {
  updateSyncState("syncing");
  try {
    const { data: dbProjects, error: projError } = await supabase
      .from("projects")
      .select("*");
    if (projError) throw projError;

    const { data: dbVocab, error: vocabError } = await supabase
      .from("vocab")
      .select("*");
    if (vocabError) throw vocabError;
    rememberVocabColumns(dbVocab || []);

    // Nếu cơ sở dữ liệu trên mây trống trơn, tự động đẩy toàn bộ LocalStorage lên làm bản sao lưu gốc (Backup)
    if ((!dbProjects || dbProjects.length === 0) && (!dbVocab || dbVocab.length === 0)) {
      const localProjects = getProjects();
      if (localProjects.length > 0) {
        console.log("Supabase trống. Tiến hành sao lưu dữ liệu local lên cloud...");
        
        const projectsToUpload = localProjects.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || ""
        }));
        const { error: uploadProjError } = await supabase.from("projects").upsert(projectsToUpload);
        if (uploadProjError) throw uploadProjError;

        const vocabToUpload = [];
        localProjects.forEach(p => {
          p.vocab.forEach(v => {
            vocabToUpload.push(buildVocabUpsertPayload(v, p.id));
          });
        });

        if (vocabToUpload.length > 0) {
          const { error: uploadVocabError } = await supabase.from("vocab").upsert(vocabToUpload);
          if (uploadVocabError) throw uploadVocabError;
        }
      }
      updateSyncState("synced");
      return;
    }

    // Nếu có dữ liệu trên mây, ghi đè LocalStorage
    const mergedProjects = (dbProjects || []).map(p => {
      const projectVocab = (dbVocab || [])
        .filter(v => v.project_id === p.id)
        .map(v => normalizeVocab({
          id: v.id,
          japanese: v.japanese,
          romaji: v.romaji,
          meaning: v.meaning,
          correct_count: v.correct_count,
          wrong_count: v.wrong_count,
          difficulty_score: v.difficulty_score,
          history_times: v.history_times,
          last_tested_at: v.last_tested_at,
          last_time_spent_sec: v.last_time_spent_sec,
          last_answer_state: v.last_answer_state,
          times_seen: v.times_seen,
          streak_correct: v.streak_correct,
          mastery_score: v.mastery_score,
          next_review_at: v.next_review_at,
          review_interval_hours: v.review_interval_hours,
          review_stage: v.review_stage,
          lapse_count: v.lapse_count,
          review_reason: v.review_reason,
          ease_factor: v.ease_factor,
          memory_stability: v.memory_stability,
          memory_difficulty: v.memory_difficulty
        }));
      return {
        id: p.id,
        name: p.name,
        description: p.description || "",
        vocab: projectVocab
      };
    });

    saveProjects(mergedProjects);
    updateSyncState("synced");
  } catch (e) {
    console.error("Lỗi khi kéo dữ liệu từ Supabase:", e);
    updateSyncState("error");
  }
}

export function isVocabWeak(vocab) {
  const v = normalizeVocab(vocab);
  const totalTests = v.correctCount + v.wrongCount;
  if (totalTests === 0) return false;

  const errorRate = v.wrongCount / totalTests;
  const avgTime = v.historyTimes.length ? average(v.historyTimes) : v.lastTimeSpent;
  const masteryScore = typeof v.masteryScore === "number" ? v.masteryScore : calculateMasteryScore(v);

  return (
    v.lastAnswerState === "wrong" ||
    v.lastAnswerState === "revealed" ||
    v.lastAnswerState === "correct_retry" ||
    v.difficultyScore > 40 ||
    errorRate > 0.25 ||
    avgTime > 7.0 ||
    masteryScore < 60
  );
}

export function getReviewStatus(vocab, now = Date.now()) {
  const v = normalizeVocab(vocab);
  const totalTests = v.correctCount + v.wrongCount;
  const nextReviewAt = v.nextReviewAt || 0;
  const lastTested = v.lastTested || 0;
  const msUntilDue = nextReviewAt ? nextReviewAt - now : 0;
  const hoursUntilDue = msUntilDue / (60 * 60 * 1000);
  const daysSinceLast = lastTested ? (now - lastTested) / (24 * 60 * 60 * 1000) : null;
  const isOverdue = nextReviewAt > 0 && msUntilDue <= 0;
  const isDueSoon = nextReviewAt > 0 && msUntilDue > 0 && msUntilDue <= hoursToMs(12);
  const isStale = totalTests > 0 && daysSinceLast !== null && daysSinceLast >= 7 && v.masteryScore < 85;
  const isHardRecentCorrect = v.lastAnswerState === "correct" && v.difficultyScore >= 55 && nextReviewAt > 0 && msUntilDue <= hoursToMs(72);
  const needsReview = isOverdue || isDueSoon || isStale || isHardRecentCorrect;

  let label = "Chưa có lịch ôn";
  let reason = v.reviewReason || "";
  let urgency = "none";

  if (isOverdue) {
    label = `Quá hạn ${formatHoursHuman(Math.abs(hoursUntilDue))}`;
    urgency = "overdue";
  } else if (isDueSoon) {
    label = `Sắp đến hạn trong ${formatHoursHuman(hoursUntilDue)}`;
    urgency = "soon";
  } else if (isStale) {
    label = `Lâu chưa học ${Math.round(daysSinceLast)} ngày`;
    reason = reason || "Lâu chưa kiểm tra lại";
    urgency = "stale";
  } else if (isHardRecentCorrect) {
    label = "Từ khó vừa đúng";
    reason = reason || "Cần xác nhận lại để chắc đã thuộc";
    urgency = "hard_correct";
  } else if (nextReviewAt > 0) {
    label = `Ôn lại sau ${formatHoursHuman(hoursUntilDue)}`;
    urgency = "scheduled";
  } else if (totalTests === 0) {
    label = "Từ mới";
    urgency = "new";
  }

  return {
    ...v,
    needsReview,
    isOverdue,
    isDueSoon,
    isStale,
    isHardRecentCorrect,
    daysSinceLast,
    hoursUntilDue,
    label,
    reason,
    urgency
  };
}

function collectAllVocabWithProject() {
  const projects = getProjects();
  const allVocab = [];

  projects.forEach(p => {
    p.vocab.forEach(v => {
      allVocab.push({
        ...v,
        projectId: p.id,
        projectName: p.name
      });
    });
  });

  return allVocab;
}

export function getReviewDueVocab(limit = 30, filter = "due") {
  const now = Date.now();
  const enriched = collectAllVocabWithProject().map(v => getReviewStatus(v, now));
  const filtered = enriched.filter(v => {
    if (filter === "overdue") return v.isOverdue;
    if (filter === "soon") return v.isDueSoon;
    if (filter === "stale") return v.isStale;
    if (filter === "hard_correct") return v.isHardRecentCorrect;
    return v.needsReview;
  });

  const urgencyRank = {
    overdue: 0,
    hard_correct: 1,
    stale: 2,
    soon: 3,
    scheduled: 4,
    new: 5,
    none: 6
  };

  filtered.sort((a, b) => {
    const rankDiff = (urgencyRank[a.urgency] ?? 9) - (urgencyRank[b.urgency] ?? 9);
    if (rankDiff !== 0) return rankDiff;
    const aDue = a.nextReviewAt || Number.MAX_SAFE_INTEGER;
    const bDue = b.nextReviewAt || Number.MAX_SAFE_INTEGER;
    if (aDue !== bDue) return aDue - bDue;
    return (a.masteryScore || 0) - (b.masteryScore || 0);
  });

  return filtered.slice(0, limit);
}

export function getReviewOverview() {
  const now = Date.now();
  const all = collectAllVocabWithProject().map(v => getReviewStatus(v, now));
  return {
    total: all.length,
    due: all.filter(v => v.needsReview).length,
    overdue: all.filter(v => v.isOverdue).length,
    soon: all.filter(v => v.isDueSoon).length,
    stale: all.filter(v => v.isStale).length,
    hardCorrect: all.filter(v => v.isHardRecentCorrect).length,
    scheduled: all.filter(v => v.nextReviewAt > 0).length,
    newWords: all.filter(v => (v.correctCount + v.wrongCount) === 0).length
  };
}

// Lấy danh sách các từ vựng yếu / chưa nhớ trên toàn hệ thống hoặc theo dự án
export function getWeakVocab(projectId = null, limit = 20) {
  const projects = getProjects();
  let allVocab = [];

  projects.forEach(p => {
    if (projectId === null || p.id === projectId) {
      p.vocab.forEach(v => {
        // Thêm projectId và projectName vào đối tượng từ vựng để hiển thị dễ dàng
        allVocab.push({
          ...v,
          projectId: p.id,
          projectName: p.name
        });
      });
    }
  });

  const weakList = allVocab.filter(isVocabWeak);

  weakList.sort((a, b) => {
    const masteryDiff = (a.masteryScore || 0) - (b.masteryScore || 0);
    if (masteryDiff !== 0) return masteryDiff;
    if (b.difficultyScore !== a.difficultyScore) {
      return b.difficultyScore - a.difficultyScore;
    }
    const aTotal = a.correctCount + a.wrongCount;
    const bTotal = b.correctCount + b.wrongCount;
    const aRate = aTotal > 0 ? a.wrongCount / aTotal : 0;
    const bRate = bTotal > 0 ? b.wrongCount / bTotal : 0;
    return bRate - aRate;
  });

  return weakList.slice(0, limit);
}

// Hàm chuẩn hóa chuỗi tiếng Việt không dấu để so sánh tìm kiếm
export function removeVietnameseTones(str) {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ă, Ơ, Ư
  return str;
}

// Cơ sở dữ liệu từ điển nhúng sẵn
const DICTIONARY_DB = [
  { japanese: "こんにちは", romaji: "konnichiwa", meaning: "xin chào (ban ngày)" },
  { japanese: "おはよう", romaji: "ohayou", meaning: "chào buổi sáng" },
  { japanese: "こんばんは", romaji: "konbanwa", meaning: "chào buổi tối" },
  { japanese: "おやすみ", romaji: "oyasumi", meaning: "chúc ngủ ngon" },
  { japanese: "ありがとう", romaji: "arigatou", meaning: "cảm ơn" },
  { japanese: "すみません", romaji: "sumimasen", meaning: "xin lỗi, xin hỏi" },
  { japanese: "ごめんなさい", romaji: "gomenasai", meaning: "xin lỗi" },
  { japanese: "はじめまして", romaji: "hajimemashite", meaning: "rất vui được gặp bạn (lần đầu)" },
  { japanese: "さようなら", romaji: "sayounara", meaning: "tạm biệt" },
  { japanese: "ただいま", romaji: "tadaima", meaning: "tôi đã về đây" },
  { japanese: "おかえり", romaji: "okaeri", meaning: "chào mừng bạn đã về" },
  { japanese: "いってきます", romaji: "ittekimasu", meaning: "tôi đi đây (hẹn gặp lại)" },
  { japanese: "いetteらっしゃい", romaji: "itterasshai", meaning: "bạn đi nhé" },
  { japanese: "どうも", romaji: "doumo", meaning: "cảm ơn, xin chào (ngắn gọn)" },
  { japanese: "どうぞ", romaji: "douzo", meaning: "xin mời" },
  { japanese: "いち (一)", romaji: "ichi", meaning: "số 1" },
  { japanese: "に (二)", romaji: "ni", meaning: "số 2" },
  { japanese: "san (三)", romaji: "san", meaning: "số 3" },
  { japanese: "よん / し (四)", romaji: "yon", meaning: "số 4" },
  { japanese: "ご (五)", romaji: "go", meaning: "số 5" },
  { japanese: "ろく (六)", romaji: "roku", meaning: "số 6" },
  { japanese: "なな / しち (七)", romaji: "nana", meaning: "số 7" },
  { japanese: "はち (八)", romaji: "hachi", meaning: "số 8" },
  { japanese: "きゅう / く (九)", romaji: "kyuu", meaning: "số 9" },
  { japanese: "じゅう (十)", romaji: "juu", meaning: "số 10" },
  { japanese: "ひゃく (百)", romaji: "hyaku", meaning: "số 100" },
  { japanese: "せん (千)", romaji: "sen", meaning: "số 1000" },
  { japanese: "まん (万)", romaji: "man", meaning: "số 1 vạn, 10000" },
  { japanese: "私 (わたし)", romaji: "watashi", meaning: "tôi" },
  { japanese: "あなた", romaji: "anata", meaning: "bạn" },
  { japanese: "彼 (かれ)", romaji: "kare", meaning: "anh ấy, bạn trai" },
  { japanese: "彼女 (かのじょ)", romaji: "kanojo", meaning: "cô ấy, bạn gái" },
  { japanese: "人 (ひと)", romaji: "hito", meaning: "người" },
  { japanese: "友達 (ともだch)", romaji: "tomodachi", meaning: "bạn bè" },
  { japanese: "家族 (かぞく)", romaji: "kazoku", meaning: "gia đình" },
  { japanese: "父 (ちち)", romaji: "chichi", meaning: "bố (của mình)" },
  { japanese: "母 (haha)", romaji: "haha", meaning: "mẹ (của mình)" },
  { japanese: "兄 (あに)", romaji: "ani", meaning: "anh trai (của mình)" },
  { japanese: "姉 (あね)", romaji: "ane", meaning: "chị gái (của mình)" },
  { japanese: "弟 (おとうto)", romaji: "otouto", meaning: "em trai" },
  { japanese: "妹 (いもうと)", romaji: "imou-to", meaning: "em gái" },
  { japanese: "お父さん (おとうさん)", romaji: "otousan", meaning: "bố (của người khác / xưng hô)" },
  { japanese: "お母さん (おかあさん)", romaji: "okaasan", meaning: "mẹ (của người khác / xưng hô)" },
  { japanese: "子供 (こども)", romaji: "kodomo", meaning: "trẻ con, con cái" },
  { japanese: "先生 (せんせい)", romaji: "sensei", meaning: "thầy cô giáo, bác sĩ" },
  { japanese: "学生 (がくせい)", romaji: "gucsei", meaning: "học sinh, sinh viên" },
  { japanese: "家 (いえ / うち)", romaji: "ie", meaning: "ngôi nhà" },
  { japanese: "部屋 (へや)", romaji: "heya", meaning: "căn phòng" },
  { japanese: "gắccou (がっこう)", romaji: "gakkou", meaning: "trường học" },
  { japanese: "教室 (きょうしつ)", romaji: "kyoushitsu", meaning: "lớp học" },
  { japanese: "駅 (えき)", romaji: "eki", meaning: "nhà ga" },
  { japanese: "公園 (kouen)", romaji: "kouen", meaning: "công viên" },
  { japanese: "銀行 (ぎんこう)", romaji: "ginkou", meaning: "ngân hàng" },
  { japanese: "病院 (びょういん)", romaji: "byouin", meaning: "bệnh viện" },
  { japanese: "本屋 (ほんや)", romaji: "honya", meaning: "hiệu sách" },
  { japanese: "食堂 (しょくどう)", romaji: "shokudou", meaning: "nhà ăn, canteen" },
  { japanese: "レストラン", romaji: "resutoran", meaning: "nhà hàng" },
  { japanese: "海 (うみ)", romaji: "umi", meaning: "biển" },
  { japanese: "山 (やま)", romaji: "yama", meaning: "núi" },
  { japanese: "川 (かわ)", romaji: "kawa", meaning: "sông" },
  { japanese: "上 (うえ)", romaji: "ue", meaning: "phía trên" },
  { japanese: "下 (した)", romaji: "shita", meaning: "phía dưới" },
  { japanese: "前 (まえ)", romaji: "mae", meaning: "phía trước" },
  { japanese: "後ろ (うしろ)", romaji: "ushiro", meaning: "phía sau" },
  { japanese: "右 (みぎ)", romaji: "migi", meaning: "bên phải" },
  { japanese: "左 (ひだり)", romaji: "hidari", meaning: "bên trái" },
  { japanese: "中 (なか)", romaji: "naka", meaning: "bên trong" },
  { japanese: "外 (そと)", romaji: "soto", meaning: "bên ngoài" },
  { japanese: "隣 (となり)", romaji: "tonari", meaning: "bên cạnh, hàng xóm" },
  { japanese: "本 (ほん)", romaji: "hon", meaning: "sách" },
  { japanese: "辞書 (じしょ)", romaji: "jisho", meaning: "từ điển" },
  { japanese: "雑誌 (ざっし)", romaji: "zasshi", meaning: "tạp chí" },
  { japanese: "新聞 (しんぶん)", romaji: "shinbun", meaning: "báo chí" },
  { japanese: "ノート", romaji: "no-to", meaning: "vở ghi chép" },
  { japanese: "鉛筆 (えんぴつ)", romaji: "enpitsu", meaning: "bút chì" },
  { japanese: "ペン", romaji: "pen", meaning: "bút bi, bút mực" },
  { japanese: "鞄 (かばん)", romaji: "kaban", meaning: "cặp sách, túi xách" },
  { japanese: "傘 (かasa)", romaji: "kasa", meaning: "cái ô, cây dù" },
  { japanese: "靴 (くつ)", romaji: "kutsu", meaning: "giày, dép" },
  { japanese: "洋服 (ようふく)", romaji: "youfuku", meaning: "quần áo nói chung" },
  { japanese: "時計 (とけい)", romaji: "tokei", meaning: "đồng hồ" },
  { japanese: "鍵 (かぎ)", romaji: "kagi", meaning: "chìa khóa" },
  { japanese: "携帯電話 (けいたいでんわ)", romaji: "keitai", meaning: "điện thoại di động" },
  { japanese: "車 (くるま)", romaji: "kuruma", meaning: "xe hơi, ô tô" },
  { japanese: "自転車 (じてんしゃ)", romaji: "jitensha", meaning: "xe đạp" },
  { japanese: "机 (つくえ)", romaji: "tsukue", meaning: "cái bàn" },
  { japanese: "椅子 (いす)", romaji: "isu", meaning: "cái ghế" },
  { japanese: "水 (みず)", romaji: "mizu", meaning: "nước" },
  { japanese: "お茶 (おちゃ)", romaji: "ocha", meaning: "trà, chè" },
  { japanese: "牛乳 (ぎゅうにゅう)", romaji: "gyuunyuu", meaning: "sữa bò" },
  { japanese: "コーヒー", romaji: "koohii", meaning: "cà phê" },
  { japanese: "お酒 (おさけ)", romaji: "osake", meaning: "rượu, rượu sake" },
  { japanese: "ビール", romaji: "biiru", meaning: "bia" },
  { japanese: "ご飯 (ごはん)", romaji: "gohan", meaning: "cơm, bữa ăn" },
  { japanese: "朝御飯 (あさごはん)", romaji: "asagohan", meaning: "bữa ăn sáng" },
  { japanese: "昼御飯 (ひるごはん)", romaji: "hirugohan", meaning: "bữa ăn trưa" },
  { japanese: "晩御飯 (ばんごはん)", romaji: "bangohan", meaning: "bữa ăn tối" },
  { japanese: "肉 (にく)", romaji: "niku", meaning: "thịt" },
  { japanese: "魚 (sakana)", romaji: "sakana", meaning: "con cá" },
  { japanese: "野菜 (やさい)", romaji: "yasai", meaning: "rau củ" },
  { japanese: "果物 (くだもの)", romaji: "kudamono", meaning: "hoa quả, trái cây" },
  { japanese: "りんご", romaji: "ringo", meaning: "quả táo" },
  { japanese: "卵 (たまご)", romaji: "tamago", meaning: "quả trứng" },
  { japanese: "パン", romaji: "pan", meaning: "bánh mì" },
  { japanese: "食べる (たべる)", romaji: "taberu", meaning: "ăn" },
  { japanese: "飲む (のむ)", romaji: "nomu", meaning: "uống" },
  { japanese: "行く (いく)", romaji: "iku", meaning: "đi" },
  { japanese: "来る (くる)", romaji: "kuru", meaning: "đến" },
  { japanese: "帰る (かえる)", romaji: "kaeru", meaning: "trở về nhà" },
  { japanese: "起きる (おきる)", romaji: "okiru", meaning: "thức dậy" },
  { japanese: "寝る (ねる)", romaji: "neru", meaning: "đi ngủ" },
  { japanese: "見る (みる)", romaji: "miru", meaning: "nhìn, xem, quan sát" },
  { japanese: "聞く (きく)", romaji: "kiku", meaning: "nghe, hỏi" },
  { japanese: "話す (はなす)", romaji: "hanasu", meaning: "nói chuyện" },
  { japanese: "読む (よむ)", romaji: "yomu", meaning: "đọc" },
  { japanese: "書く (かく)", romaji: "kaku", meaning: "viết, vẽ" },
  { japanese: "買う (かう)", romaji: "kau", meaning: "mua" },
  { japanese: "売る (うる)", romaji: "uru", meaning: "bán" },
  { japanese: "勉強する (べんきょうする)", romaji: "benkyousuru", meaning: "học tập" },
  { japanese: "する", romaji: "suru", meaning: "làm (hành động)" },
  { japanese: "働く (はたらく)", romaji: "hataraku", meaning: "làm việc, lao động" },
  { japanese: "会う (あう)", romaji: "au", meaning: "gặp gỡ" },
  { japanese: "遊ぶ (あそぶ)", romaji: "asobu", meaning: "chơi đùa" },
  { japanese: "待つ (まつ)", romaji: "matsu", meaning: "chờ đợi" },
  { japanese: "呼ぶ (よぶ)", romaji: "yobu", meaning: "gọi, réo" },
  { japanese: "歌う (うたう)", romaji: "utau", meaning: "hát" },
  { japanese: "作る (つくる)", romaji: "tsukuru", meaning: "chế tạo, nấu ăn" },
  { japanese: "使う (つかう)", romaji: "tsukau", meaning: "sử dụng" },
  { japanese: "早い (はやい)", romaji: "hayai", meaning: "nhanh, sớm" },
  { japanese: "遅い (おそい)", romaji: "osoi", meaning: "chậm, muộn" },
  { japanese: "暑い (あつい)", romaji: "atsui", meaning: "nóng (thời tiết)" },
  { japanese: "熱い (あつい)", romaji: "atsui", meaning: "nóng (nhiệt độ đồ vật)" },
  { japanese: "寒い (さむい)", romaji: "samui", meaning: "lạnh (thời tiết)" },
  { japanese: "冷たい (つめたい)", romaji: "tsumetai", meaning: "lạnh, mát (đồ vật/cảm giác)" },
  { japanese: "美味しい (おいしい)", romaji: "oishii", meaning: "ngon miệng" },
  { japanese: "安い (やすい)", romaji: "yasui", meaning: "rẻ tiền" },
  { japanese: "高い (たかい)", romaji: "takai", meaning: "đắt, cao" },
  { japanese: "新しい (あたらしい)", romaji: "atarashii", meaning: "mới" },
  { japanese: "古い (ふるい)", romaji: "furui", meaning: "cũ" },
  { japanese: "元気 (げんき)", romaji: "genki", meaning: "khỏe mạnh" },
  { japanese: "可愛い (かわいい)", romaji: "kawaii", meaning: "đáng yêu, dễ thương" },
  { japanese: "かっこいい", romaji: "kakkoii", meaning: "ngầu, đẹp trai" },
  { japanese: "ありがとう", romaji: "arigatou", meaning: "cảm ơn" },
  { japanese: "さようなら", romaji: "sayounara", meaning: "tạm biệt" },
  { japanese: "親切 (しんせつ)", romaji: "shinsetsu", meaning: "tốt bụng, thân thiện" },
  { japanese: "面白い (おもしろい)", romaji: "omoshiroi", meaning: "thú vị, buồn cười, hài hước" },
  { japanese: "青い (あおい)", romaji: "aoi", meaning: "màu xanh dương" },
  { japanese: "蚊 (か)", romaji: "ka", meaning: "con muỗi" },
  { japanese: "木 (き)", romaji: "ki", meaning: "cây" },
  { japanese: "柿 (かき)", romaji: "kaki", meaning: "quả hồng" },
  { japanese: "赤い (あかい)", romaji: "akai", meaning: "màu đỏ" },
  { japanese: "行く (いく)", romaji: "iku", meaning: "đi" },
  { japanese: "書く (かく)", romaji: "kaku", meaning: "viết" },
  { japanese: "池 (いけ)", romaji: "ike", meaning: "cái ao" },
  { japanese: "ここ", romaji: "koko", meaning: "ở đây" },
  { japanese: "声 (こえ)", romaji: "koe", meaning: "giọng" },
  { japanese: "傘 (かさ)", romaji: "kasa", meaning: "cái ô" },
  { japanese: "坂 (さか)", romaji: "saka", meaning: "con dốc" },
  { japanese: "塩 (しお)", romaji: "sio", meaning: "muối ăn" },
  { japanese: "酢 (す)", romaji: "su", meaning: "giấm" },
  { japanese: "寿司 (すし)", romaji: "susi", meaning: "cơm cuộn" },
  { japanese: "世界 (せかい)", romaji: "sekai", meaning: "thế giới" },
  { japanese: "そこ", romaji: "soko", meaning: "ở đó" },
  { japanese: "嘘 (うそ)", romaji: "uso", meaning: "nói dối" }
];

export function searchDictionary(query) {
  if (!query || !query.trim()) return [];
  const normalizedQuery = query.trim().toLowerCase();
  const queryNoTone = removeVietnameseTones(normalizedQuery);
  const queryNoSpace = normalizedQuery.replace(/\s+/g, "");
  const queryNoToneNoSpace = queryNoTone.replace(/\s+/g, "");

  const cachedDict = getCachedDictionary();
  const mergedDb = [...DICTIONARY_DB, ...cachedDict];

  const uniqueDb = [];
  const seen = new Set();
  for (const item of mergedDb) {
    const key = item.japanese.toLowerCase() + "|" + (item.romaji || "").toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDb.push(item);
    }
  }

  return uniqueDb.filter(item => {
    const jpClean = item.japanese.toLowerCase().replace(/\s+/g, "");
    const jpMatch = jpClean.includes(normalizedQuery) || jpClean.includes(queryNoSpace);
    
    const rmClean = item.romaji.toLowerCase().replace(/\s+/g, "");
    const rmMatch = rmClean.includes(normalizedQuery) || rmClean.includes(queryNoSpace);
    
    const meaningLower = item.meaning.toLowerCase();
    const meaningNoTone = removeVietnameseTones(meaningLower);
    
    const mnClean = meaningLower.replace(/\s+/g, "");
    const mnCleanNoTone = meaningNoTone.replace(/\s+/g, "");
    
    const mnMatch = meaningLower.includes(normalizedQuery) || 
                    meaningNoTone.includes(queryNoTone) ||
                    mnClean.includes(queryNoSpace) ||
                    mnCleanNoTone.includes(queryNoToneNoSpace);
    
    return jpMatch || rmMatch || mnMatch;
  });
}

function getCachedDictionary() {
  try {
    const cached = localStorage.getItem("nihongo_dictionary_cache");
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error("Lỗi đọc cache từ điển:", e);
    return [];
  }
}

export function saveToDictionaryCache(item) {
  if (!item || !item.japanese || !item.meaning) return;
  try {
    const cache = getCachedDictionary();
    const cleanJp = item.japanese.trim();
    const exists = cache.some(c => c.japanese.toLowerCase() === cleanJp.toLowerCase());
    if (!exists) {
      cache.push({
        japanese: cleanJp,
        romaji: item.romaji || "",
        meaning: item.meaning.trim()
      });
      localStorage.setItem("nihongo_dictionary_cache", JSON.stringify(cache));
    }
  } catch (e) {
    console.error("Lỗi lưu cache từ điển:", e);
  }
}
