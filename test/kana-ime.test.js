import test from "node:test";
import assert from "node:assert/strict";

import {
  romajiToHiragana,
  normalizeTelexAccents,
  removeVietnameseAccents,
  hiraganaToKatakana,
  katakanaToHiragana,
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

test("romajiToHiragana xử lý câu dài và cụm từ như kochirawa san desu", () => {
  assert.equal(romajiToHiragana("kochirawa san desu"), "こちらわ さん です");
  assert.equal(romajiToHiragana("kochirawa san de", { finalize: false }), "こちらわ さん で");
  assert.equal(romajiToHiragana("こちらわ さnd", { finalize: false }), "こちらわ さんd");
  assert.equal(romajiToHiragana("こちらわ さnde", { finalize: false }), "こちらわ さんで");
  assert.equal(romajiToHiragana("コチラワ san desu"), "コチラワ さん です");
});

test("romajiToHiragana và bindKanaInput kiểm tra và chuyển đổi tức thì trên từng ký tự (s -> sa -> san -> sanjuuroku)", () => {
  assert.equal(romajiToHiragana("s"), "s");
  assert.equal(romajiToHiragana("sa"), "さ");
  assert.equal(romajiToHiragana("san"), "さん");
  assert.equal(romajiToHiragana("sana"), "さな");
  assert.equal(romajiToHiragana("sanjuuroku"), "さんじゅうろく");

  const listeners = {};
  const dummyEl = {
    value: "",
    selectionStart: 0,
    selectionEnd: 0,
    setSelectionRange(s, e) {
      this.selectionStart = s;
      this.selectionEnd = e;
    },
    addEventListener(evt, fn) {
      listeners[evt] = fn;
    },
    removeEventListener(evt) {
      delete listeners[evt];
    }
  };

  bindKanaInput(dummyEl, { mode: "kana" });

  function type(char) {
    const before = dummyEl.value.slice(0, dummyEl.selectionStart);
    const after = dummyEl.value.slice(dummyEl.selectionEnd);
    dummyEl.value = before + char + after;
    dummyEl.selectionStart = before.length + char.length;
    dummyEl.selectionEnd = dummyEl.selectionStart;
    listeners.input();
  }

  // Gõ s
  type("s");
  assert.equal(dummyEl.value, "s");

  // Gõ a -> thành さ ngay lập tức
  type("a");
  assert.equal(dummyEl.value, "さ");

  // Gõ n -> thành さん ngay lập tức mà không cần bấm cách hay enter
  type("n");
  assert.equal(dummyEl.value, "さん");

  // Gõ j -> thành さんj
  type("j");
  assert.equal(dummyEl.value, "さんj");

  // Gõ u -> thành さんじゅ
  type("u");
  assert.equal(dummyEl.value, "さんじゅ");

  // Gõ u -> thành さんじゅう
  type("u");
  assert.equal(dummyEl.value, "さんじゅう");

  // Gõ r -> thành さんじゅうr
  type("r");
  assert.equal(dummyEl.value, "さんじゅうr");

  // Gõ o -> thành さんじゅうろ
  type("o");
  assert.equal(dummyEl.value, "さんじゅうろ");

  // Gõ k -> thành さんじゅうろk
  type("k");
  assert.equal(dummyEl.value, "さんじゅうろk");

  // Gõ u -> thành さんじゅうろく
  type("u");
  assert.equal(dummyEl.value, "さんじゅうろく");
});

test("normalizeTelexAccents khử sạch dấu Telex từ Unikey", () => {
  assert.equal(normalizeTelexAccents("kás"), "kas");
  assert.equal(normalizeTelexAccents("nê"), "ne");
  assert.equal(normalizeTelexAccents("thô"), "tho");
  assert.equal(normalizeTelexAccents("đo"), "do");
  assert.equal(normalizeTelexAccents("こちらư"), "こちらw");
  assert.equal(normalizeTelexAccents("こちらưa"), "こちらwa");
  // Khi kết hợp với romajiToHiragana
  assert.equal(romajiToHiragana("kása"), "かさ");
  assert.equal(romajiToHiragana("nêkô"), "ねこ");
});

test("removeVietnameseAccents loại bỏ toàn bộ dấu tiếng Việt cho Romaji", () => {
  assert.equal(removeVietnameseAccents("kása"), "kasa");
  assert.equal(removeVietnameseAccents("đesu"), "desu");
  assert.equal(removeVietnameseAccents("sản"), "san");
  assert.equal(removeVietnameseAccents("watáshi"), "watashi");
  assert.equal(removeVietnameseAccents("arigatô"), "arigato");
  assert.equal(removeVietnameseAccents("cái ô"), "cai o");
});

test("hiraganaToKatakana và katakanaToHiragana chuyển đổi qua lại chính xác", () => {
  assert.equal(hiraganaToKatakana("こーひー"), "コーヒー");
  assert.equal(hiraganaToKatakana("あめりか"), "アメリカ");
  assert.equal(hiraganaToKatakana("こちらわ"), "コチラワ");
  assert.equal(katakanaToHiragana("コチラワ"), "こちらわ");
});

test("bindKanaInput hỗ trợ chế độ romaji khử dấu và chế độ kana giữ đúng chữ", () => {
  const listeners = {};
  const dummyEl = {
    value: "kása",
    selectionStart: 4,
    selectionEnd: 4,
    setSelectionRange(s, e) {
      this.selectionStart = s;
      this.selectionEnd = e;
    },
    addEventListener(evt, fn) {
      listeners[evt] = fn;
    },
    removeEventListener(evt) {
      delete listeners[evt];
    }
  };

  const controller = bindKanaInput(dummyEl, { mode: "romaji" });
  assert.ok(controller);
  assert.equal(controller.getMode(), "romaji");

  // Giả lập nhập kása ở chế độ romaji -> tự động thành kasa
  dummyEl.value = "kása";
  listeners.input();
  assert.equal(dummyEl.value, "kasa");

  // Chuyển sang kana
  controller.setMode("kana");
  dummyEl.value = "kochirawa san desu";
  listeners.input();
  assert.equal(dummyEl.value, "こちらわ さん です");

  // Chuyển sang raw
  controller.setMode("raw");
  assert.equal(controller.getMode(), "raw");
});

import { QuizSession } from "../src/quiz.js";
import { getRomajiAnswerMatch } from "../src/quiz-signals.js";
import { saveProjects } from "../src/storage.js";

test("getRomajiAnswerMatch chấp nhận đáp án Romaji dù người dùng có gõ dính dấu Telex", () => {
  assert.equal(getRomajiAnswerMatch("kása", "kasa"), "correct");
  assert.equal(getRomajiAnswerMatch("đesu", "desu"), "correct");
  assert.equal(getRomajiAnswerMatch("sản", "san"), "correct");
  assert.equal(getRomajiAnswerMatch("watáshi", "watashi"), "correct");
});

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

  // Kiểm tra nhập tiếng Việt có dấu và không dấu
  const sessionVi1 = new QuizSession({
    quizMode: "jp_to_meaning",
    vocabIds: ["v1"],
    questionCount: 1
  });
  const resultVi1 = sessionVi1.submitAnswer("cái ô");
  assert.equal(resultVi1.status, "correct");

  const sessionVi2 = new QuizSession({
    quizMode: "jp_to_meaning",
    vocabIds: ["v1"],
    questionCount: 1
  });
  const resultVi2 = sessionVi2.submitAnswer("cai o");
  assert.equal(resultVi2.status, "correct");
});
