import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Giả lập localStorage cho môi trường kiểm thử Node.js
if (typeof globalThis.localStorage === "undefined") {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

test("index.html: Tích hợp nút nav-jlpt-exam trong menu Học tập và view section jlpt-exam-view", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  // Kiểm tra nút menu trong dropdown Học tập
  assert.ok(html.includes('id="nav-jlpt-exam"'), "Phải có id nav-jlpt-exam trong index.html");
  assert.ok(html.includes('data-target="jlpt-exam-view"'), "nav-jlpt-exam phải có data-target trỏ tới jlpt-exam-view");
  assert.ok(html.includes("Tạo bài thi JLPT"), "Nhãn menu phải có chữ Tạo bài thi JLPT");

  // Kiểm tra section view
  assert.ok(html.includes('id="jlpt-exam-view"'), "Phải có section id jlpt-exam-view");
  assert.ok(html.includes('class="view-section"'), "jlpt-exam-view phải có class view-section");
});

test("ui.js: switchView hỗ trợ nhóm learn với jlpt-exam-view và export setupJlptExamUI", async () => {
  const uiContent = fs.readFileSync(path.resolve(__dirname, "../src/ui.js"), "utf-8");

  assert.ok(uiContent.includes("jlpt-exam.js"), "ui.js phải import từ jlpt-exam.js");
  assert.ok(uiContent.includes("setupJlptExamUI"), "ui.js phải gọi setupJlptExamUI");
  assert.ok(uiContent.includes('viewId === "jlpt-exam-view"'), "switchView phải xử lý viewId jlpt-exam-view");
});

test("jlpt-exam.js: generateJlptExam sinh đề thi chuẩn cấu trúc JLPT N5 (Từ vựng, Ngữ pháp, Đọc hiểu)", async () => {
  const jlptModule = await import("../src/jlpt-exam.js");

  // Sinh đề 10 câu
  const exam10 = jlptModule.generateJlptExam({ count: 10, sections: ["vocab", "grammar", "reading"] });
  assert.ok(exam10.id, "Đề thi phải có ID duy nhất");
  assert.equal(exam10.questions.length, 10, "Số lượng câu hỏi phải đúng 10 câu");
  assert.equal(typeof exam10.timeMinutes, "number", "Phải có thời gian làm bài (phút)");

  // Kiểm tra các phần thi có mặt đầy đủ
  const hasVocab = exam10.questions.some(q => q.section === "vocab");
  const hasGrammar = exam10.questions.some(q => q.section === "grammar");
  const hasReading = exam10.questions.some(q => q.section === "reading");

  assert.ok(hasVocab, "Đề thi phải có câu hỏi Phần Từ vựng (文字・語彙)");
  assert.ok(hasGrammar, "Đề thi phải có câu hỏi Phần Ngữ pháp (文法)");
  assert.ok(hasReading, "Đề thi phải có câu hỏi Phần Đọc hiểu (読解)");

  // Kiểm tra từng câu hỏi có đúng 4 phương án trắc nghiệm chuẩn JLPT
  exam10.questions.forEach((q, idx) => {
    assert.ok(Array.isArray(q.options), `Câu ${idx + 1} phải có mảng options`);
    assert.equal(q.options.length, 4, `Câu ${idx + 1} phải có đúng 4 phương án lựa chọn`);
    assert.ok(typeof q.correct === "number" && q.correct >= 0 && q.correct <= 3, `Câu ${idx + 1} phải có chỉ số đáp án đúng (0-3)`);
    assert.ok(q.explanation && q.explanation.length > 5, `Câu ${idx + 1} phải có giải thích chi tiết`);
  });

  // Kiểm tra dạng sắp xếp dấu sao ★ trong ngữ pháp
  const starQ = exam10.questions.find(q => q.mondaiLabel && q.mondaiLabel.includes("ngôi sao ★"));
  if (starQ) {
    assert.ok(starQ.questionHtml.includes("★"), "Câu sắp xếp phải có ký hiệu ngôi sao ★");
    assert.equal(starQ.options.length, 4, "Câu sắp xếp phải có 4 phương án lựa chọn vị trí");
  }

  // Kiểm tra dạng bài đọc hiểu có đoạn văn kèm theo
  const readingQ = exam10.questions.find(q => q.section === "reading");
  assert.ok(readingQ, "Phải có câu hỏi đọc hiểu");
  assert.ok(readingQ.passage && readingQ.passage.jp, "Câu đọc hiểu phải có bài đọc tiếng Nhật");
});

test("jlpt-exam.js: gradeJlptExam tính điểm chính xác, xét điều kiện Đỗ/Trượt và điểm liệt", async () => {
  const jlptModule = await import("../src/jlpt-exam.js");

  const mockExam = {
    id: "mock-exam-test",
    title: "Bài thi mẫu test",
    questions: [
      { id: "q1", section: "vocab", correct: 1 },
      { id: "q2", section: "vocab", correct: 0 },
      { id: "q3", section: "grammar", correct: 2 },
      { id: "q4", section: "grammar", correct: 3 },
      { id: "q5", section: "reading", correct: 0 },
      { id: "q6", section: "reading", correct: 1 }
    ]
  };

  // Trường hợp 1: Đúng hết 6/6 (100%) ➔ ĐỖ
  const ansAllCorrect = { q1: 1, q2: 0, q3: 2, q4: 3, q5: 0, q6: 1 };
  const res100 = jlptModule.gradeJlptExam(mockExam, ansAllCorrect);
  assert.equal(res100.score, 6);
  assert.equal(res100.percentage, 100);
  assert.equal(res100.passed, true, "Đúng 100% phải ĐỖ");

  // Trường hợp 2: Sai hết 0/6 (0%) ➔ TRƯỢT
  const ansAllWrong = { q1: 0, q2: 1, q3: 0, q4: 0, q5: 2, q6: 3 };
  const res0 = jlptModule.gradeJlptExam(mockExam, ansAllWrong);
  assert.equal(res0.score, 0);
  assert.equal(res0.percentage, 0);
  assert.equal(res0.passed, false, "0% phải TRƯỢT");

  // Trường hợp 3: Tổng điểm 50% (3/6) nhưng bị liệt phần Đọc hiểu (0/2) ➔ TRƯỢT do điểm liệt
  const ansLieReading = { q1: 1, q2: 0, q3: 2, q4: 0, q5: 3, q6: 3 }; // vocab: 2/2 (100%), grammar: 1/2 (50%), reading: 0/2 (0%)
  const resLiet = jlptModule.gradeJlptExam(mockExam, ansLieReading);
  assert.equal(resLiet.score, 3);
  assert.equal(resLiet.percentage, 50);
  assert.equal(resLiet.passed, false, "Có phần thi 0% (< 35%) thì phải TRƯỢT do điểm liệt");
});

test("jlpt-exam.js: Quản lý lịch sử thi (saveExamHistory, getExamHistory, clearExamHistory)", async () => {
  const jlptModule = await import("../src/jlpt-exam.js");

  jlptModule.clearExamHistory();
  assert.deepEqual(jlptModule.getExamHistory(), [], "Lịch sử ban đầu sau khi xóa phải là rỗng");

  const mockResult = {
    examId: "test-save-1",
    title: "Đề thi thử N5 (20 câu)",
    score: 18,
    total: 20,
    percentage: 90,
    passed: true,
    dateFormatted: "10:30 - 26/10/2026",
    timestamp: Date.now()
  };

  jlptModule.saveExamHistory(mockResult);
  const hist = jlptModule.getExamHistory();
  assert.equal(hist.length, 1);
  assert.equal(hist[0].examId, "test-save-1");
  assert.equal(hist[0].score, 18);

  jlptModule.clearExamHistory();
  assert.equal(jlptModule.getExamHistory().length, 0, "Sau khi clear phải rỗng");
});

test("style.css: Chứa các quy tắc giao diện phòng thi JLPT, đồng hồ và bảng câu hỏi palette", () => {
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  assert.ok(css.includes(".jlpt-exam-page-container"), "CSS phải có .jlpt-exam-page-container");
  assert.ok(css.includes(".jlpt-hero-banner"), "CSS phải có .jlpt-hero-banner");
  assert.ok(css.includes(".jlpt-active-exam-container"), "CSS phải có .jlpt-active-exam-container");
  assert.ok(css.includes(".jlpt-timer-box"), "CSS phải có đồng hồ .jlpt-timer-box");
  assert.ok(css.includes(".jlpt-palette-sidebar"), "CSS phải có bảng câu hỏi .jlpt-palette-sidebar");
  assert.ok(css.includes(".jlpt-pal-item"), "CSS phải có nút câu hỏi palette .jlpt-pal-item");
  assert.ok(css.includes(".jlpt-question-card"), "CSS phải có thẻ câu hỏi .jlpt-question-card");
  assert.ok(css.includes(".star-order-sentence"), "CSS phải có dạng câu sắp xếp sao .star-order-sentence");
  assert.ok(css.includes(".jlpt-result-hero-card"), "CSS phải có bảng kết quả .jlpt-result-hero-card");
  assert.ok(css.includes(".jlpt-review-details-arena"), "CSS phải có khu vực giải thích chi tiết .jlpt-review-details-arena");
});
