import test from "node:test";
import assert from "node:assert/strict";
import {
  getProjects,
  initializeStorage,
  resolveCloudProjectVocabOrder,
  saveProjects
} from "../src/storage.js";
import { getRomajiAnswerMatch } from "../src/quiz-signals.js";
import { QuizSession, getAcceptedMeaningAnswers } from "../src/quiz.js";
import { bindKanaInput, romajiToKatakana } from "../src/kana-ime.js";

function setupMockLocalStorage(initial = {}) {
  const store = { ...initial };
  global.localStorage = {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
  return store;
}

test("Dự án Từ vựng bài 2: Chứa đầy đủ 47 từ vựng Minna no Nihongo Bài 2 theo yêu cầu", () => {
  setupMockLocalStorage();

  const projects = getProjects();
  const lesson2 = projects.find(p => p.id === "proj-lesson-2" || p.name === "Từ vựng bài 2");

  assert.ok(lesson2, "Phải có dự án Từ vựng bài 2");
  assert.equal(lesson2.name, "Từ vựng bài 2");
  assert.equal(lesson2.vocab.length, 47, "Phải có chính xác 47 từ vựng bài 2");

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

  // Kiểm tra sắp xếp theo cặp liên quan (Ko-So-A-Do đi theo cặp, nhóm âm Ka-)
  assert.deepEqual(
    lesson2.vocab.slice(0, 7).map(v => v.japanese),
    ["これ", "この～", "それ", "その～", "あれ", "あの～", "なに"],
    "7 từ đầu phải xếp theo cặp Ko-So-A-Do và từ hỏi なに"
  );
  const kaStartIdx = lesson2.vocab.findIndex(v => v.japanese === "かぎ");
  assert.deepEqual(
    lesson2.vocab.slice(kaStartIdx, kaStartIdx + 4).map(v => v.japanese),
    ["かぎ", "かさ", "かばん", "カメラ"],
    "Nhóm đồ cá nhân đầu âm Ka- phải đứng cạnh nhau"
  );
});

test("initializeStorage: Tự động seed dự án Từ vựng bài 2 vào kho localStorage đã tồn tại", () => {
  const store = setupMockLocalStorage({
    nihongo_flashcard_projects: JSON.stringify([
      { id: "proj-custom", name: "Dự án riêng của tôi", vocab: [] }
    ])
  });

  initializeStorage();

  const stored = JSON.parse(store.nihongo_flashcard_projects);
  const hasCustom = stored.some(p => p.name === "Dự án riêng của tôi");
  const hasLesson2 = stored.some(p => p.id === "proj-lesson-2" || p.name === "Từ vựng bài 2");

  assert.ok(hasCustom, "Dữ liệu dự án cũ của người dùng phải được bảo toàn");
  assert.ok(hasLesson2, "Dự án Từ vựng bài 2 phải được tự động bổ sung vào danh sách");
});

test("Quiz Matching: Xử lý thông minh từ vựng bài 2 có phần đóng mở ngoặc [ ]", () => {
  assert.equal(getRomajiAnswerMatch("teepu", "[kasetto] teepu"), "correct", "Chấp nhận 'teepu'");
  assert.equal(getRomajiAnswerMatch("kasetto", "[kasetto] teepu"), "correct", "Chấp nhận 'kasetto' (từ trong ngoặc)");
  assert.equal(getRomajiAnswerMatch("kasetto teepu", "[kasetto] teepu"), "correct", "Chấp nhận 'kasetto teepu'");
  assert.equal(getRomajiAnswerMatch("doumo", "[doumo] arigatou gozaimasu"), "correct", "Chấp nhận 'doumo' (từ trong ngoặc)");
  assert.equal(getRomajiAnswerMatch("arigatou gozaimasu", "[doumo] arigatou gozaimasu"), "correct", "Chấp nhận 'arigatou gozaimasu'");
  assert.equal(getRomajiAnswerMatch("doumo arigatou gozaimasu", "[doumo] arigatou gozaimasu"), "correct", "Chấp nhận 'doumo arigatou gozaimasu'");

  // Kiểm tra QuizSession cho [カセット] テープ trong các mode không có ngoặc
  setupMockLocalStorage();
  const projects = getProjects();
  const lesson2 = projects.find(p => p.id === "proj-lesson-2");
  const tapeVocab = lesson2.vocab.find(v => v.id === "v2-23");

  const japaneseAnswers = [
    "カセットテープ",
    "カセット テープ",
    "カセット",
    "テープ",
    "kasetto teepu",
    "kasetto",
    "teepu",
    "te-pu"
  ];

  japaneseAnswers.forEach(ans => {
    const sessionJp = new QuizSession({
      quizMode: "meaning_to_japanese",
      vocabIds: [tapeVocab.id],
      questionCount: 1
    });
    const res = sessionJp.submitAnswer(ans);
    assert.equal(res.status, "correct", `Gõ "${ans}" không cần ngoặc phải được chấp nhận ở meaning_to_japanese`);
  });

  const thanksMeanings = getAcceptedMeaningAnswers("[Xin] [chân thành] cảm ơn");
  assert.equal(thanksMeanings.length, 1, "Không tách sai nghĩa có ngoặc vuông thành 2 nghĩa bắt buộc");
  assert.equal(thanksMeanings[0].toLowerCase(), "cảm ơn");

  const thanksVocab = lesson2.vocab.find(v => v.id === "v2-45");

  const sessionFull = new QuizSession({
    quizMode: "jp_to_meaning",
    vocabIds: [thanksVocab.id],
    questionCount: 1
  });
  const resFull = sessionFull.submitAnswer("Xin chân thành cảm ơn");
  assert.equal(resFull.status, "correct", "Chấp nhận dạng đầy đủ 1 lần cho [Xin] [chân thành] cảm ơn");

  const tapeMeanings = getAcceptedMeaningAnswers("Băng (cat-xet)");
  assert.ok(tapeMeanings.some(m => m.toLowerCase().includes("băng")), "Chấp nhận 'Băng'");

  // Kiểm tra đáp án Tiếng Việt cho từ Băng (cat-xet)
  const testTapeAnswers = [
    "băng cat-xet",
    "bang cat-xet",
    "băng cat xet",
    "bang cat xet",
    "băng cát-xét",
    "băng cát xét",
    "băng cassette",
    "băng",
    "bang",
    "cat-xet",
    "cát-xét"
  ];

  testTapeAnswers.forEach(ans => {
    const sessionTape = new QuizSession({
      quizMode: "romaji_to_meaning",
      vocabIds: [tapeVocab.id],
      questionCount: 1
    });
    const resTape = sessionTape.submitAnswer(ans);
    assert.equal(resTape.status, "correct", `Đáp án "${ans}" cho "Băng (cat-xet)" phải được chấp nhận`);
  });
});

test("Quiz Matching: Tự động bỏ qua dấu ~ khi nhập đáp án nhưng trả về fullAnswerNote đầy đủ", () => {
  setupMockLocalStorage();

  // ano ~ : ~ kia
  const sessionMeaning = new QuizSession({
    quizMode: "romaji_to_meaning",
    vocabIds: ["v2-6"],
    questionCount: 1
  });
  const resMeaning = sessionMeaning.submitAnswer("kia");
  assert.equal(resMeaning.status, "correct", "Nhập 'kia' cho '~ kia' phải cho qua");
  assert.equal(resMeaning.fullAnswerNote, "~ kia", "Phải trả về thông báo đáp án đầy đủ '~ kia'");

  // ~ご : Tiếng ~
  const sessionGo = new QuizSession({
    quizMode: "jp_to_meaning",
    vocabIds: ["v2-36"],
    questionCount: 1
  });
  const resGo = sessionGo.submitAnswer("tieng");
  assert.equal(resGo.status, "correct", "Nhập 'tieng' cho 'Tiếng ~' phải cho qua");
  assert.equal(resGo.fullAnswerNote, "Tiếng ~", "Phải trả về thông báo đáp án đầy đủ 'Tiếng ~'");

  // meaning_to_japanese cho あの～: nhập あの vẫn qua và hiện あの～
  const sessionJp = new QuizSession({
    quizMode: "meaning_to_japanese",
    vocabIds: ["v2-6"],
    questionCount: 1
  });
  const resJp = sessionJp.submitAnswer("あの");
  assert.equal(resJp.status, "correct", "Nhập 'あの' cho 'あの～' phải cho qua");
  assert.equal(resJp.fullAnswerNote, "あの～", "Phải trả về thông báo đáp án đầy đủ 'あの～'");

  // Nhập chính xác luôn '~ kia' thì không cần notice dư thừa
  const sessionExact = new QuizSession({
    quizMode: "romaji_to_meaning",
    vocabIds: ["v2-6"],
    questionCount: 1
  });
  const resExact = sessionExact.submitAnswer("~ kia");
  assert.equal(resExact.status, "correct");
  assert.equal(resExact.fullAnswerNote, "", "Đã gõ đúng ~ kia thì không cần hiện note nhắc lại");
});

test("Katakana IME & Quiz: Gõ trực tiếp ra Katakana (ノート) và chấp nhận mọi biến thể Kana", () => {
  setupMockLocalStorage();

  // Kiểm tra romajiToKatakana
  assert.equal(romajiToKatakana("no-to"), "ノート");
  assert.equal(romajiToKatakana("ko-hi-"), "コーヒー");
  assert.equal(romajiToKatakana("ka-do"), "カード");

  // Giả lập gõ từng phím trong chế độ katakana của bindKanaInput (n -> o -> - -> t -> o)
  const listeners = {};
  const inputEl = {
    value: "",
    selectionStart: 0,
    selectionEnd: 0,
    setSelectionRange(s, e) {
      this.selectionStart = s;
      this.selectionEnd = e;
    },
    addEventListener(evt, fn) { listeners[evt] = fn; },
    removeEventListener(evt) { delete listeners[evt]; }
  };

  const controller = bindKanaInput(inputEl, { mode: "katakana" });
  const type = (ch) => {
    const before = inputEl.value.slice(0, inputEl.selectionStart);
    const after = inputEl.value.slice(inputEl.selectionEnd);
    inputEl.value = before + ch + after;
    inputEl.selectionStart = before.length + ch.length;
    inputEl.selectionEnd = inputEl.selectionStart;
    listeners.input();
  };

  type("n");
  assert.equal(inputEl.value, "ン");
  type("o");
  assert.equal(inputEl.value, "ノ");
  type("-");
  assert.equal(inputEl.value, "ノー");
  type("t");
  assert.equal(inputEl.value, "ノーt");
  type("o");
  assert.equal(inputEl.value, "ノート");

  controller.cycleKanaMode(); // katakana -> raw
  assert.equal(controller.getMode(), "raw");
  controller.cycleKanaMode(); // raw -> kana
  assert.equal(controller.getMode(), "kana");
  controller.cycleKanaMode(); // kana -> katakana
  assert.equal(controller.getMode(), "katakana");

  // Kiểm tra QuizSession cho từ Katakana Vở (ノート, romaji: nooto)
  ["ノート", "ノオト", "のーと", "のおと", "nooto"].forEach(ans => {
    const session = new QuizSession({
      quizMode: "meaning_to_japanese",
      vocabIds: ["v2-11"],
      questionCount: 1
    });
    const res = session.submitAnswer(ans);
    assert.equal(res.status, "correct", `Đáp án "${ans}" cho "ノート" phải được chấp nhận`);
  });
});

test("Ordering Stability: Từ đã học không bị tụt xuống cuối khi đồng bộ Supabase hoặc reload", () => {
  // 1. Giả lập dữ liệu cloud bị PostgreSQL đẩy 5 từ vừa học (v2-1..v2-5) xuống cuối với order_index lỗi
  const rawCloudShuffled = [
    { id: "v2-6", japanese: "あの～", order_index: 0 },
    { id: "v2-7", japanese: "ほん", order_index: 0 },
    { id: "v2-8", japanese: "じしょ", order_index: 0 },
    { id: "v2-1", japanese: "これ", order_index: 0 },
    { id: "v2-2", japanese: "それ", order_index: 1 },
    { id: "v2-3", japanese: "あれ", order_index: 2 },
    { id: "v2-4", japanese: "この～", order_index: 3 },
    { id: "v2-5", japanese: "その～", order_index: 4 }
  ];

  const { orderedVocab, needsOrderRepair } = resolveCloudProjectVocabOrder("proj-lesson-2", rawCloudShuffled);
  assert.equal(needsOrderRepair, true);
  assert.deepEqual(
    orderedVocab.map(v => v.id),
    ["v2-1", "v2-4", "v2-2", "v2-5", "v2-3", "v2-6", "v2-7", "v2-8"],
    "Phải khôi phục đúng thứ tự chuẩn theo cặp của Từ vựng bài 2 dù DB bị xáo trộn"
  );

  // 2. Giả lập dự án tùy chỉnh của người dùng khi bảng vocab chưa có cột order_index
  const customCloudRows = [
    { id: "v-103", japanese: "単語3" },
    { id: "v-101", japanese: "単語1" },
    { id: "v-102", japanese: "単語2" }
  ];
  const localCustomVocab = [
    { id: "v-101", japanese: "単語1", orderIndex: 0 },
    { id: "v-102", japanese: "単語2", orderIndex: 1 },
    { id: "v-103", japanese: "単語3", orderIndex: 2 }
  ];

  const customResolved = resolveCloudProjectVocabOrder("proj-user-1", customCloudRows, {
    localVocab: localCustomVocab
  });
  assert.deepEqual(
    customResolved.orderedVocab.map(v => v.id),
    ["v-101", "v-102", "v-103"],
    "Dự án cá nhân phải giữ nguyên thứ tự local khi cloud thiếu order_index"
  );

  // 3. Giả lập localStorage của người dùng đã bị trót lưu sai thứ tự trước đây -> initializeStorage phải tự sửa lại
  const store = setupMockLocalStorage();
  saveProjects([
    {
      id: "proj-lesson-2",
      name: "Từ vựng bài 2",
      vocab: [
        { id: "v2-7", japanese: "ほん", romaji: "hon", meaning: "Sách", orderIndex: 0 },
        { id: "v2-1", japanese: "これ", romaji: "kore", meaning: "Cái này", orderIndex: 1 },
        { id: "v2-4", japanese: "この～", romaji: "kono", meaning: "~ này", orderIndex: 2 }
      ]
    }
  ]);

  initializeStorage();
  const repairedProjects = JSON.parse(store.nihongo_flashcard_projects);
  const repairedLesson2 = repairedProjects.find(p => p.id === "proj-lesson-2");
  assert.deepEqual(
    repairedLesson2.vocab.map(v => v.id),
    ["v2-1", "v2-4", "v2-7"],
    "initializeStorage phải tự sửa lại thứ tự Từ vựng bài 2 đã bị tụt xuống cuối"
  );
});

test("Phát âm TTS tiếng Nhật: cleanJapaneseForSpeech loại bỏ ngoặc, tilde và đọc chuẩn Katakana/Romaji", async () => {
  const { cleanJapaneseForSpeech, speakJapanese } = await import("../src/ui.js");

  assert.equal(cleanJapaneseForSpeech("[カセット] テープ"), "カセット テープ", "Loại bỏ ngoặc vuông nhưng giữ chữ để đọc tự nhiên");
  assert.equal(cleanJapaneseForSpeech("テープレコーダー"), "テープレコーダー", "Giữ nguyên trường âm Katakana cho máy ghi âm");
  assert.equal(cleanJapaneseForSpeech("この～"), "この", "Bỏ dấu tilde nối từ");
  assert.equal(cleanJapaneseForSpeech("あの～"), "あの", "Bỏ dấu tilde");
  assert.equal(cleanJapaneseForSpeech("～ご"), "ご", "Bỏ dấu tilde đầu từ");
  assert.equal(cleanJapaneseForSpeech("[どうも] ありがとうございます"), "どうも ありがとうございます");
  assert.equal(cleanJapaneseForSpeech("いち (一)"), "いち");
  assert.equal(cleanJapaneseForSpeech("書く (かく)"), "かく");
  assert.equal(cleanJapaneseForSpeech("kasetto teepu"), "かせっと てえぷ", "Romaji được tự động chuyển sang Kana để TTS phát âm đúng giọng Nhật");

  // Đảm bảo hàm speakJapanese gọi an toàn trong môi trường Node / Test
  assert.doesNotThrow(() => {
    speakJapanese("[カセット] テープ", true);
    speakJapanese("テープレコーダー", true);
  });
});

