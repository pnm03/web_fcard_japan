import test from "node:test";
import assert from "node:assert/strict";

import {
  romajiToHiragana,
  normalizeTelexAccents,
  hiraganaToKatakana,
  bindKanaInput
} from "../src/kana-ime.js";

test("romajiToHiragana chuyển đổi chính xác các từ cơ bản", () => {
  assert.equal(romajiToHiragana("kasa"), "かさ");
  assert.equal(romajiToHiragana("arigatou"), "ありがとう");
  assert.equal(romajiToHiragana("sayounara"), "さようなら");
  assert.equal(romajiToHiragana("mizu"), "みず");
  assert.equal(romajiToHiragana("taberu"), "たべる");
});

test("romajiToHiragana xử lý âm ngắt (sokuon: っ)", () => {
  assert.equal(romajiToHiragana("gakkou"), "がっこう");
  assert.equal(romajiToHiragana("chotto"), "ちょっと");
  assert.equal(romajiToHiragana("kitte"), "きって");
  assert.equal(romajiToHiragana("ippon"), "いっぽん");
});

test("romajiToHiragana xử lý âm ghép (yoon: きゃ, しゃ, ちょ...)", () => {
  assert.equal(romajiToHiragana("toukyou"), "とうきょう");
  assert.equal(romajiToHiragana("shashin"), "しゃしん");
  assert.equal(romajiToHiragana("densha"), "でんしゃ");
  assert.equal(romajiToHiragana("ryokou"), "りょこう");
  assert.equal(romajiToHiragana("byouin"), "びょういん");
});

test("romajiToHiragana xử lý âm n và n cuối câu", () => {
  assert.equal(romajiToHiragana("kankan"), "かんかん");
  assert.equal(romajiToHiragana("nihon", { finalize: true }), "にほん");
  assert.equal(romajiToHiragana("konnichiwa"), "こんにちわ");
  assert.equal(romajiToHiragana("konnichiha"), "こんにちは");
});

test("normalizeTelexAccents khử sạch dấu Telex từ Unikey", () => {
  assert.equal(normalizeTelexAccents("kás"), "kas");
  assert.equal(normalizeTelexAccents("nê"), "ne");
  assert.equal(normalizeTelexAccents("thô"), "tho");
  assert.equal(normalizeTelexAccents("đo"), "do");
  // Khi kết hợp với romajiToHiragana
  assert.equal(romajiToHiragana("kása"), "かさ");
  assert.equal(romajiToHiragana("nêkô"), "ねこ");
});

test("hiraganaToKatakana chuyển đổi Hiragana sang Katakana", () => {
  assert.equal(hiraganaToKatakana("こーひー"), "コーヒー");
  assert.equal(hiraganaToKatakana("あめりか"), "アメリカ");
});

test("bindKanaInput khởi tạo controller và điều khiển chế độ", () => {
  const dummyEl = {
    value: "kasa",
    selectionStart: 4,
    setSelectionRange() {},
    addEventListener() {},
    removeEventListener() {}
  };

  const controller = bindKanaInput(dummyEl, { mode: "kana" });
  assert.ok(controller);
  assert.equal(controller.getMode(), "kana");

  controller.setMode("raw");
  assert.equal(controller.getMode(), "raw");

  controller.setMode("kana");
  assert.equal(controller.getMode(), "kana");
});

import { QuizSession } from "../src/quiz.js";
import { saveProjects } from "../src/storage.js";

test("QuizSession chấp nhận câu trả lời dạng Kana khi từ vựng là chữ Hán (Kanji)", () => {
  const store = new Map();
  global.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key)
  };

  saveProjects([
    {
      id: "p1",
      name: "Test Project",
      vocab: [
        {
          id: "v1",
          japanese: "傘",
          romaji: "kasa",
          meaning: "cái ô"
        }
      ]
    }
  ]);

  const session1 = new QuizSession({
    quizMode: "meaning_to_japanese",
    vocabIds: ["v1"],
    questionCount: 1
  });
  const result1 = session1.submitAnswer("かさ");
  assert.equal(result1.status, "correct");

  const session2 = new QuizSession({
    quizMode: "meaning_to_japanese",
    vocabIds: ["v1"],
    questionCount: 1
  });
  const result2 = session2.submitAnswer("傘");
  assert.equal(result2.status, "correct");

  const session3 = new QuizSession({
    quizMode: "meaning_to_japanese",
    vocabIds: ["v1"],
    questionCount: 1
  });
  const result3 = session3.submitAnswer("kasa");
  assert.equal(result3.status, "correct");
});
