import test from "node:test";
import assert from "node:assert/strict";

import { Rating } from "../src/fsrs-scheduler.js";
import {
  addRecoverySession,
  buildGoalPlan,
  createGoalDraft,
  refreshGoalState
} from "../src/goal-planner.js";
import { answerStateToFsrsRating } from "../src/fsrs-scheduler.js";

const HOUR = 60 * 60 * 1000;

test("15 từ trong 24 giờ tạo lịch tăng dần và có bài chốt sát deadline", () => {
  const now = Date.UTC(2026, 7, 10, 1, 0, 0);
  const deadlineAt = now + 24 * HOUR;
  const vocabIds = Array.from({ length: 15 }, (_, index) => `v-${index + 1}`);
  const plan = buildGoalPlan({
    goalId: "goal-test",
    vocabIds,
    modes: ["meaning_to_romaji", "jp_to_meaning"],
    startsAt: now,
    deadlineAt,
    dailyMinutes: 45
  });

  assert.ok(plan.sessions.length >= 6);
  assert.equal(plan.sessions[0].type, "acquisition");
  assert.equal(plan.sessions.at(-1).type, "final");
  assert.ok(plan.sessions.every((session, index) => index === 0 || session.scheduledAt > plan.sessions[index - 1].scheduledAt));
  assert.ok(deadlineAt - plan.sessions.at(-1).scheduledAt <= HOUR);
  assert.ok(plan.estimate.totalMinutes >= 30);
  assert.ok(["comfortable", "tight"].includes(plan.estimate.feasibility));
});

test("đúng lặp trong cùng một buổi không đủ để xác nhận đã thuộc", () => {
  const now = Date.UTC(2026, 7, 10, 1, 0, 0);
  const goal = createGoalDraft({
    title: "15 từ",
    vocabIds: ["v-1"],
    modes: ["meaning_to_romaji", "jp_to_meaning"],
    deadlineAt: now + 24 * HOUR,
    now
  });
  goal.reviewLogs = [
    { vocabId: "v-1", sessionId: "same", sessionType: "final", mode: "meaning_to_romaji", answerState: "correct", reviewedAt: now + HOUR },
    { vocabId: "v-1", sessionId: "same", sessionType: "final", mode: "jp_to_meaning", answerState: "correct", reviewedAt: now + HOUR + 60_000 }
  ];
  const vocab = new Map([["v-1", {
    id: "v-1",
    difficultyScore: 20,
    fsrsState: 2,
    fsrsReps: 4,
    fsrsStability: 8,
    fsrsDifficulty: 4,
    fsrsLastReviewAt: now + HOUR,
    fsrsDueAt: now + 8 * HOUR
  }]]);

  const refreshed = refreshGoalState(goal, vocab, now + 2 * HOUR);
  assert.notEqual(refreshed.items[0].status, "verified");
  assert.equal(refreshed.items[0].correctSessions, 1);
  assert.equal(refreshed.items[0].separatedRecall, false);
});

test("đủ buổi cách quãng, đủ chế độ và bài chốt mới xác nhận từ", () => {
  const now = Date.UTC(2026, 7, 10, 1, 0, 0);
  const deadlineAt = now + 24 * HOUR;
  const goal = createGoalDraft({
    title: "Một từ",
    vocabIds: ["v-1"],
    modes: ["meaning_to_romaji", "jp_to_meaning"],
    deadlineAt,
    desiredRetention: 0.9,
    now
  });
  goal.reviewLogs = [
    { vocabId: "v-1", sessionId: "s1", sessionType: "retrieval", mode: "meaning_to_romaji", answerState: "correct", reviewedAt: now + HOUR },
    { vocabId: "v-1", sessionId: "s2", sessionType: "mixed", mode: "jp_to_meaning", answerState: "correct", reviewedAt: now + 7 * HOUR },
    { vocabId: "v-1", sessionId: "sf", sessionType: "final", mode: "meaning_to_romaji", answerState: "correct", reviewedAt: deadlineAt - 30 * 60 * 1000 },
    { vocabId: "v-1", sessionId: "sf", sessionType: "final", mode: "jp_to_meaning", answerState: "correct", reviewedAt: deadlineAt - 29 * 60 * 1000 }
  ];
  const vocab = new Map([["v-1", {
    id: "v-1",
    difficultyScore: 20,
    fsrsState: 2,
    fsrsReps: 7,
    fsrsStability: 30,
    fsrsDifficulty: 3.5,
    fsrsLastReviewAt: deadlineAt - 30 * 60 * 1000,
    fsrsDueAt: deadlineAt + 20 * HOUR
  }]]);

  const refreshed = refreshGoalState(goal, vocab, deadlineAt - 20 * 60 * 1000);
  assert.equal(refreshed.items[0].status, "verified");
  assert.equal(refreshed.progress.percent, 100);
  assert.equal(refreshed.status, "completed");
});

test("sai một chiều trong bài chốt không được lấy kết quả cũ bù vào", () => {
  const now = Date.UTC(2026, 7, 10, 1, 0, 0);
  const deadlineAt = now + 24 * HOUR;
  const goal = createGoalDraft({
    title: "Không bù kết quả cũ",
    vocabIds: ["v-1"],
    modes: ["meaning_to_romaji", "jp_to_meaning"],
    deadlineAt,
    desiredRetention: 0.9,
    now
  });
  goal.reviewLogs = [
    { vocabId: "v-1", sessionId: "s1", sessionType: "retrieval", mode: "meaning_to_romaji", answerState: "correct", reviewedAt: now + HOUR },
    { vocabId: "v-1", sessionId: "s2", sessionType: "mixed", mode: "jp_to_meaning", answerState: "correct", reviewedAt: now + 7 * HOUR },
    { vocabId: "v-1", sessionId: "sf", sessionType: "final", mode: "meaning_to_romaji", answerState: "correct", reviewedAt: deadlineAt - 30 * 60 * 1000 },
    { vocabId: "v-1", sessionId: "sf", sessionType: "final", mode: "jp_to_meaning", answerState: "wrong", reviewedAt: deadlineAt - 29 * 60 * 1000 }
  ];
  const vocab = new Map([["v-1", {
    id: "v-1",
    difficultyScore: 30,
    fsrsState: 2,
    fsrsReps: 7,
    fsrsStability: 30,
    fsrsDifficulty: 4,
    fsrsLastReviewAt: deadlineAt - 29 * 60 * 1000,
    fsrsDueAt: deadlineAt + 20 * HOUR
  }]]);

  const refreshed = refreshGoalState(goal, vocab, deadlineAt - 20 * 60 * 1000);
  assert.equal(refreshed.items[0].finalPassed, false);
  assert.notEqual(refreshed.items[0].status, "verified");
});

test("bài chốt lại thành công thay thế kết quả chốt cũ đã sai", () => {
  const now = Date.UTC(2026, 7, 10, 1, 0, 0);
  const deadlineAt = now + 24 * HOUR;
  const goal = createGoalDraft({
    title: "Chốt lại thành công",
    vocabIds: ["v-1"],
    modes: ["meaning_to_romaji", "jp_to_meaning"],
    deadlineAt,
    desiredRetention: 0.9,
    now
  });
  goal.reviewLogs = [
    { vocabId: "v-1", sessionId: "s1", sessionType: "retrieval", mode: "meaning_to_romaji", answerState: "correct", reviewedAt: now + HOUR },
    { vocabId: "v-1", sessionId: "s2", sessionType: "mixed", mode: "jp_to_meaning", answerState: "correct", reviewedAt: now + 7 * HOUR },
    { vocabId: "v-1", sessionId: "sf-old", sessionType: "final", mode: "meaning_to_romaji", answerState: "correct", reviewedAt: deadlineAt - 90 * 60 * 1000 },
    { vocabId: "v-1", sessionId: "sf-old", sessionType: "final", mode: "jp_to_meaning", answerState: "wrong", reviewedAt: deadlineAt - 89 * 60 * 1000 },
    { vocabId: "v-1", sessionId: "sf-new", sessionType: "final", mode: "meaning_to_romaji", answerState: "correct", reviewedAt: deadlineAt - 30 * 60 * 1000 },
    { vocabId: "v-1", sessionId: "sf-new", sessionType: "final", mode: "jp_to_meaning", answerState: "correct", reviewedAt: deadlineAt - 29 * 60 * 1000 }
  ];
  const vocab = new Map([["v-1", {
    id: "v-1",
    difficultyScore: 20,
    fsrsState: 2,
    fsrsReps: 8,
    fsrsStability: 30,
    fsrsDifficulty: 3.5,
    fsrsLastReviewAt: deadlineAt - 29 * 60 * 1000,
    fsrsDueAt: deadlineAt + 20 * HOUR
  }]]);

  const refreshed = refreshGoalState(goal, vocab, deadlineAt - 20 * 60 * 1000);
  assert.equal(refreshed.items[0].finalPassed, true);
  assert.equal(refreshed.items[0].status, "verified");
});

test("từ vừa sai được chèn buổi học bù trước deadline", () => {
  const now = Date.UTC(2026, 7, 10, 1, 0, 0);
  const goal = createGoalDraft({
    title: "Học bù",
    vocabIds: ["v-1", "v-2"],
    modes: ["meaning_to_romaji"],
    deadlineAt: now + 12 * HOUR,
    now
  });
  const next = addRecoverySession(goal, ["v-2"], now + HOUR);
  const recovery = next.sessions.find(session => session.type === "recovery");

  assert.ok(recovery);
  assert.deepEqual(recovery.vocabIds, ["v-2"]);
  assert.ok(recovery.scheduledAt < goal.deadlineAt);
});

test("sai ở bài chốt tạo một bài chốt lại cho đúng nhóm từ sai", () => {
  const now = Date.UTC(2026, 7, 10, 1, 0, 0);
  const goal = createGoalDraft({
    title: "Chốt lại",
    vocabIds: ["v-1", "v-2"],
    modes: ["meaning_to_romaji", "jp_to_meaning"],
    deadlineAt: now + 12 * HOUR,
    now
  });
  const originalSessionIds = new Set(goal.sessions.map(session => session.id));
  const next = addRecoverySession(goal, ["v-2"], now + HOUR, "final");
  const retest = next.sessions.find(session => !originalSessionIds.has(session.id));

  assert.ok(retest);
  assert.deepEqual(retest.vocabIds, ["v-2"]);
  assert.deepEqual(retest.modes, goal.modes);
  assert.ok(retest.scheduledAt < goal.deadlineAt);
});

test("kết quả quiz được ánh xạ đúng sang rating FSRS", () => {
  assert.equal(answerStateToFsrsRating("wrong", 2, {}), Rating.Again);
  assert.equal(answerStateToFsrsRating("correct_retry", 4, {}), Rating.Hard);
  assert.equal(answerStateToFsrsRating("correct", 12, {}), Rating.Hard);
  assert.equal(answerStateToFsrsRating("correct", 2, { difficultyScore: 20, streakCorrect: 3 }), Rating.Easy);
  assert.equal(answerStateToFsrsRating("correct", 5, { difficultyScore: 40, streakCorrect: 1 }), Rating.Good);
});
