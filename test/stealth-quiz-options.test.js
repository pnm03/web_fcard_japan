import test from "node:test";
import assert from "node:assert/strict";

import { syncWrongVocabPoolToElectron, startStealthQuizSession } from "../src/ui.js";
import { saveProjects } from "../src/storage.js";

test("startStealthQuizSession truyền đầy đủ allowRetry và repeatWrongPractice sang Electron", () => {
  let capturedData = null;
  global.window = {
    electronAPI: {
      isElectron: true,
      startStealthQuiz: (data) => {
        capturedData = data;
      }
    }
  };

  const store = new Map();
  global.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key)
  };

  const testProjects = [
    {
      id: "p1",
      name: "Test Project",
      vocab: [
        { id: "v1", japanese: "犬", romaji: "inu", meaning: "con chó", wrongCount: 0, correctCount: 0 }
      ]
    }
  ];
  saveProjects(testProjects);

  const dummyConfig = {
    vocabIds: ["v1"],
    questionCount: 1,
    quizMode: "meaning_to_romaji",
    allowRetry: true,
    repeatWrongPractice: true
  };

  startStealthQuizSession(dummyConfig);

  assert.ok(capturedData, "Đã gọi electronAPI.startStealthQuiz");
  assert.equal(capturedData.allowRetry, true, "allowRetry phải được truyền đúng là true");
  assert.equal(capturedData.repeatWrongPractice, true, "repeatWrongPractice phải được truyền đúng là true");
  assert.equal(capturedData.questions.length, 1);
  assert.equal(capturedData.questions[0].romaji, "inu");

  delete global.window;
  delete global.localStorage;
});

test("syncWrongVocabPoolToElectron thu thập đúng các từ có wrongCount > 0 và gửi sang Electron", () => {
  let capturedPool = null;
  global.window = {
    electronAPI: {
      isElectron: true,
      syncWrongWords: (pool) => {
        capturedPool = pool;
      }
    }
  };

  const store = new Map();
  global.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key)
  };

  const testProjects = [
    {
      id: "p1",
      name: "Dự án A",
      vocab: [
        { id: "v1", japanese: "猫", romaji: "neko", meaning: "con mèo", wrongCount: 3, correctCount: 1 },
        { id: "v2", japanese: "本", romaji: "hon", meaning: "quyển sách", wrongCount: 0, correctCount: 5 }
      ]
    }
  ];
  saveProjects(testProjects);

  syncWrongVocabPoolToElectron();

  assert.ok(capturedPool, "Đã gọi syncWrongWords");
  assert.equal(capturedPool.length, 1, "Chỉ lấy từ có wrongCount > 0");
  assert.equal(capturedPool[0].id, "v1");
  assert.equal(capturedPool[0].japanese, "猫");

  delete global.window;
  delete global.localStorage;
});
