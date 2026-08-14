import test from "node:test";
import assert from "node:assert/strict";

import { buildPersonalizedFsrsProfile, shouldShowRescueCard } from "../src/adaptive-learning.js";
import { Rating, getVocabRetrievability, scheduleVocabWithFsrs } from "../src/fsrs-scheduler.js";
import {
  activateGoalAfterBaseline,
  buildGoalPlan,
  classifyBaselineResult,
  createGoalDraft,
  replanGoal,
  snapToStudyWindow
} from "../src/goal-planner.js";
import { getRomajiAnswerMatch, interleaveQuestionSeeds } from "../src/quiz-signals.js";

const HOUR = 60 * 60 * 1000;

test("FSRS tách độc lập theo từng dạng kiểm tra", () => {
  const now = Date.UTC(2026, 7, 12, 1, 0, 0);
  const vocab = { id: "v1", modeMemoryStates: {} };
  const first = scheduleVocabWithFsrs(vocab, "correct", 2, now, 0.9, {
    mode: "meaning_to_romaji",
    answerSignal: "exact"
  });
  const updated = { ...vocab, ...first, modeMemoryStates: first.modeMemoryStates };

  assert.ok(getVocabRetrievability(updated, now + HOUR, 0.9, "meaning_to_romaji") > 0);
  assert.equal(getVocabRetrievability(updated, now + HOUR, 0.9, "audio_to_meaning"), 0);
});

test("gõ gần đúng không tạo rating Again và biến thể romaji được chấp nhận", () => {
  assert.equal(scheduleVocabWithFsrs({}, "correct", 2, Date.now(), 0.9, {
    mode: "meaning_to_romaji",
    answerSignal: "typo"
  }).rating, Rating.Good);
  assert.ok(["correct", "variant"].includes(getRomajiAnswerMatch("Tōkyō", "toukyou")));
  assert.equal(getRomajiAnswerMatch("gakuse", "gakusei"), "near");
});

test("baseline phân biệt biết nhanh, biết chậm, nhận diện và chưa nhớ", () => {
  assert.equal(classifyBaselineResult([
    { mode: "meaning_to_romaji", answerState: "correct", responseSeconds: 2 }
  ]), "known_fast");
  assert.equal(classifyBaselineResult([
    { mode: "meaning_to_romaji", answerState: "correct_retry", responseSeconds: 6 }
  ]), "known_slow");
  assert.equal(classifyBaselineResult([
    { mode: "jp_to_meaning", answerState: "correct", responseSeconds: 2 },
    { mode: "meaning_to_romaji", answerState: "wrong", responseSeconds: 4 }
  ]), "recognition_only");
  assert.equal(classifyBaselineResult([
    { mode: "meaning_to_romaji", answerState: "wrong", responseSeconds: 2 }
  ]), "failed");
});

test("planner tránh giờ yên tĩnh và đặt mốc quanh giấc ngủ", () => {
  const start = new Date(2026, 7, 12, 20, 0, 0).getTime();
  const settings = {
    wakeTime: "06:30",
    sleepTime: "23:00",
    quietStart: "23:00",
    quietEnd: "06:30",
    availability: [{ start: "06:30", end: "08:30" }, { start: "20:00", end: "23:00" }]
  };
  const snapped = snapToStudyWindow(new Date(2026, 7, 12, 23, 30).getTime(), settings);
  assert.equal(new Date(snapped).getHours(), 6);

  const plan = buildGoalPlan({
    goalId: "g1",
    vocabIds: ["v1", "v2"],
    modes: ["meaning_to_romaji"],
    startsAt: start,
    deadlineAt: start + 36 * HOUR,
    dailyMinutes: 30,
    scheduleSettings: settings
  });
  assert.ok(plan.sessions.some(session => session.anchor === "before_sleep"));
  assert.ok(plan.sessions.some(session => session.anchor === "after_wake"));
  assert.ok(plan.sessions.every(session => {
    const hour = new Date(session.scheduledAt).getHours();
    return hour >= 6 && hour < 23;
  }));
});

test("mục tiêu chỉ có baseline trước rồi mới kích hoạt lịch chính", () => {
  const now = Date.UTC(2026, 7, 12, 1, 0, 0);
  const goal = createGoalDraft({
    title: "15 từ",
    vocabIds: ["v1", "v2"],
    modes: ["meaning_to_romaji", "jp_to_meaning"],
    deadlineAt: now + 24 * HOUR,
    now
  });
  assert.deepEqual(goal.sessions.map(session => session.type), ["baseline"]);
  goal.sessions[0].status = "completed";
  const activated = activateGoalAfterBaseline(goal, now + HOUR);
  assert.ok(activated.sessions.length > 2);
  assert.equal(activated.sessions[0].type, "baseline");
});

test("bỏ lỡ buổi sẽ dựng lại toàn bộ phần chưa học và giữ buổi đã xong", () => {
  const now = Date.UTC(2026, 7, 12, 1, 0, 0);
  const goal = createGoalDraft({ title: "g", vocabIds: ["v1", "v2"], modes: ["meaning_to_romaji"], deadlineAt: now + 48 * HOUR, now });
  goal.sessions[0].status = "completed";
  goal.items[0].status = "verified";
  const next = replanGoal(goal, now + 4 * HOUR, "missed_session");
  assert.equal(next.sessions.filter(session => session.status === "completed").length, 1);
  assert.ok(next.sessions.filter(session => session.status === "pending").every(session => !session.vocabIds.includes("v1")));
  assert.equal(next.replanning.reason, "missed_session");
});

test("trộn câu tránh cùng từ, hàng xóm và mode liền nhau khi có lựa chọn", () => {
  const seeds = [
    { vocab: { id: "a", projectId: "p", orderIndex: 0 }, forcedMode: "m1" },
    { vocab: { id: "b", projectId: "p", orderIndex: 1 }, forcedMode: "m1" },
    { vocab: { id: "c", projectId: "p", orderIndex: 7 }, forcedMode: "m2" },
    { vocab: { id: "d", projectId: "q", orderIndex: 0 }, forcedMode: "m1" }
  ];
  const output = interleaveQuestionSeeds(seeds, ["m1", "m2"], "mixed");
  assert.equal(output.length, seeds.length);
  assert.notEqual(output[0].forcedMode, output[1].forcedMode);
  assert.ok(Math.abs(output[0].vocab.orderIndex - output[1].vocab.orderIndex) > 1 || output[0].vocab.projectId !== output[1].vocab.projectId);
});

test("thẻ cứu từ và profile cá nhân hóa chỉ bật khi đủ bằng chứng", () => {
  assert.equal(shouldShowRescueCard({ id: "v1", difficultyScore: 20 }, [
    { vocabId: "v1", answerState: "wrong", reviewedAt: 1 },
    { vocabId: "v1", answerState: "wrong", reviewedAt: 2 }
  ]), true);

  const shortProfile = buildPersonalizedFsrsProfile(Array.from({ length: 199 }, (_, index) => ({
    answerSignal: "exact", answerState: "correct", reviewedAt: index + 1, responseSeconds: 2, mode: "m"
  })));
  assert.equal(shortProfile.active, false);
  const fullProfile = buildPersonalizedFsrsProfile(Array.from({ length: 220 }, (_, index) => ({
    answerSignal: index % 5 === 0 ? "wrong_knowledge" : "exact",
    answerState: index % 5 === 0 ? "wrong" : "correct",
    reviewedAt: index + 1,
    responseSeconds: 2,
    mode: "m"
  })));
  assert.equal(fullProfile.active, true);
  assert.equal(fullProfile.w.length > 10, true);
});

test("wrong knowledge vẫn là Again", () => {
  const result = scheduleVocabWithFsrs({}, "wrong", 2, Date.now(), 0.9, {
    mode: "meaning_to_romaji",
    answerSignal: "wrong_knowledge"
  });
  assert.equal(result.rating, Rating.Again);
});
