import test from "node:test";
import assert from "node:assert/strict";
import { getProjects, initializeStorage } from "../src/storage.js";
import { getRomajiAnswerMatch } from "../src/quiz-signals.js";
import { getAcceptedMeaningAnswers } from "../src/quiz.js";

test("Dự án Từ vựng bài 2: Chứa đầy đủ 47 từ vựng Minna no Nihongo Bài 2 theo yêu cầu", () => {
  // Mock localStorage
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };

  const projects = getProjects();
  const lesson2 = projects.find(p => p.id === "proj-lesson-2" || p.name === "Từ vựng bài 2");

  assert.ok(lesson2, "Phải có dự án Từ vựng bài 2");
  assert.equal(lesson2.name, "Từ vựng bài 2");
  assert.equal(lesson2.vocab.length, 47, "Phải có chính xác 47 từ vựng bài 2");

  // Kiểm tra các từ cốt lõi
  const findVocab = (jp) => lesson2.vocab.find(v => v.japanese === jp);

  assert.ok(findVocab("これ"), "Có từ これ");
  assert.equal(findVocab("これ").meaning, "Cái này, đây (vật ở gần người nói)");
  assert.equal(findVocab("これ").romaji, "kore");

  assert.ok(findVocab("それ"), "Có từ それ");
  assert.ok(findVocab("あれ"), "Có từ あれ");
  assert.ok(findVocab("この～"), "Có từ この～");
  assert.ok(findVocab("その～"), "Có từ その～");
  assert.ok(findVocab("あの～"), "Có từ あの～");
  assert.ok(findVocab("ほん"), "Có từ ほん (Sách)");
  assert.ok(findVocab("じしょ"), "Có từ じしょ (Từ điển)");
  assert.ok(findVocab("ざっし"), "Có từ ざっし (Tạp chí)");
  assert.ok(findVocab("しんぶん"), "Có từ しんぶん (Báo)");
  assert.ok(findVocab("ノート"), "Có từ ノート (Vở)");
  assert.ok(findVocab("てちょう"), "Có từ てちょう (Sổ tay)");
  assert.ok(findVocab("めいし"), "Có từ めいし (Danh thiếp)");
  assert.ok(findVocab("カード"), "Có từ カード (Thẻ, card)");
  assert.ok(findVocab("テレホンカード"), "Có từ テレホンカード");
  assert.ok(findVocab("えんぴつ"), "Có từ えんぴつ");
  assert.ok(findVocab("ボールペン"), "Có từ ボールペン");
  assert.ok(findVocab("シャープペンシル"), "Có từ シャープペンシル");
  assert.ok(findVocab("かぎ"), "Có từ かぎ");
  assert.ok(findVocab("とけい"), "Có từ とけい");
  assert.ok(findVocab("かさ"), "Có từ かさ");
  assert.ok(findVocab("かばん"), "Có từ かばん");
  assert.ok(findVocab("[カセット] テープ"), "Có từ [カセット] テープ");
  assert.ok(findVocab("テープレコーダー"), "Có từ テープレコーダー");
  assert.ok(findVocab("テレビ"), "Có từ テレビ");
  assert.ok(findVocab("ラジオ"), "Có từ ラジオ");
  assert.ok(findVocab("カメラ"), "Có từ カメラ");
  assert.ok(findVocab("コンピューター"), "Có từ コンピューター");
  assert.ok(findVocab("じどうしゃ"), "Có từ じどうしゃ");
  assert.ok(findVocab("つくえ"), "Có từ つくえ");
  assert.ok(findVocab("いす"), "Có từ いす");
  assert.ok(findVocab("チョコレート"), "Có từ チョコレート");
  assert.ok(findVocab("コーヒー"), "Có từ コーヒー");
  assert.ok(findVocab("えいご"), "Có từ えいご");
  assert.ok(findVocab("にほんご"), "Có từ にほんご");
  assert.ok(findVocab("～ご"), "Có từ ～ご");
  assert.ok(findVocab("なに"), "Có từ なに");
  assert.ok(findVocab("そう"), "Có từ そう");
  assert.ok(findVocab("ちがいます"), "Có từ ちがいます");
  assert.ok(findVocab("そうですか"), "Có từ そうですか");
  assert.ok(findVocab("あのう"), "Có từ あのう");
  assert.ok(findVocab("ほんのきもちです"), "Có từ ほんのきもちです");
  assert.ok(findVocab("どうぞ"), "Có từ どうぞ");
  assert.ok(findVocab("どうも"), "Có từ どうも");
  assert.ok(findVocab("[どうも] ありがとうございます"), "Có từ [どうも] ありがとうございます");
  assert.ok(findVocab("これからおせわになります"), "Có từ これからおせわになります");
  assert.ok(findVocab("こちらこそよろしく"), "Có từ こちらこそよろしく");
});

test("initializeStorage: Tự động seed dự án Từ vựng bài 2 vào kho localStorage đã tồn tại", () => {
  const store = {
    nihongo_flashcard_projects: JSON.stringify([
      { id: "proj-custom", name: "Dự án riêng của tôi", vocab: [] }
    ])
  };

  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };

  initializeStorage();

  const stored = JSON.parse(store.nihongo_flashcard_projects);
  const hasCustom = stored.some(p => p.name === "Dự án riêng của tôi");
  const hasLesson2 = stored.some(p => p.id === "proj-lesson-2" || p.name === "Từ vựng bài 2");

  assert.ok(hasCustom, "Dữ liệu dự án cũ của người dùng phải được bảo toàn");
  assert.ok(hasLesson2, "Dự án Từ vựng bài 2 phải được tự động bổ sung vào danh sách");
});

test("Quiz Matching: Xử lý thông minh từ vựng bài 2 có phần đóng mở ngoặc [ ]", () => {
  // 1. Romaji matching
  assert.equal(getRomajiAnswerMatch("teepu", "[kasetto] teepu"), "correct", "Chấp nhận 'teepu'");
  assert.equal(getRomajiAnswerMatch("kasetto teepu", "[kasetto] teepu"), "correct", "Chấp nhận 'kasetto teepu'");
  assert.equal(getRomajiAnswerMatch("arigatou gozaimasu", "[doumo] arigatou gozaimasu"), "correct", "Chấp nhận 'arigatou gozaimasu'");
  assert.equal(getRomajiAnswerMatch("doumo arigatou gozaimasu", "[doumo] arigatou gozaimasu"), "correct", "Chấp nhận 'doumo arigatou gozaimasu'");

  // 2. Meaning matching
  const thanksMeanings = getAcceptedMeaningAnswers("[Xin] [chân thành] cảm ơn");
  assert.ok(thanksMeanings.some(m => m.toLowerCase().includes("cảm ơn")), "Chấp nhận 'cảm ơn'");
  assert.ok(thanksMeanings.some(m => m.toLowerCase().includes("chân thành cảm ơn") || m.toLowerCase().includes("xin chân thành cảm ơn")), "Chấp nhận dạng đầy đủ");

  const tapeMeanings = getAcceptedMeaningAnswers("Băng (cat-xet)");
  assert.ok(tapeMeanings.some(m => m.toLowerCase().includes("băng")), "Chấp nhận 'Băng'");
});
