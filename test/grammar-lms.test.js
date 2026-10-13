import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { 
  GRAMMAR_CHAPTERS, 
  loadAllGrammarProgress, 
  saveAllGrammarProgress, 
  getLessonProgress, 
  updateLessonProgress, 
  calculateLessonPercent 
} from "../src/grammar.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock localStorage nếu chạy trong Node test environment
if (typeof globalThis.localStorage === "undefined") {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

test("GRAMMAR_CHAPTERS chứa đầy đủ Chương N5, Bài 1 và 4 mẫu câu theo ảnh yêu cầu", () => {
  assert.ok(GRAMMAR_CHAPTERS.length > 0, "Phải có danh sách chương");
  const n5Chap = GRAMMAR_CHAPTERS.find(c => c.level === "N5");
  assert.ok(n5Chap, "Phải có chương N5");

  const lesson1 = n5Chap.lessons.find(l => l.id === "n5-lesson-1");
  assert.ok(lesson1, "Phải có Bài 1 N5: Giới thiệu bản thân");
  assert.equal(lesson1.number, 1);
  assert.ok(lesson1.title.includes("Giới thiệu bản thân"));

  // 4 mẫu câu theo ảnh người dùng gửi:
  // A は B です, A は B じゃありません, A は B ですか, A も B です
  const patterns = lesson1.patterns;
  assert.equal(patterns.length, 4, "Bài 1 phải có đúng 4 mẫu ngữ pháp");
  
  assert.ok(patterns.some(p => p.name === "A は B です"), "Phải có mẫu A は B です");
  assert.ok(patterns.some(p => p.name === "A は B じゃありません"), "Phải có mẫu A は B じゃありません");
  assert.ok(patterns.some(p => p.name === "A は B ですか"), "Phải có mẫu A は B ですか");
  assert.ok(patterns.some(p => p.name === "A も B です"), "Phải có mẫu A も B です");

  // Mỗi mẫu câu đều có ví dụ kèm audio
  patterns.forEach(p => {
    assert.ok(p.examples.length >= 3, `Mẫu ${p.name} phải có ít nhất 3 ví dụ`);
    assert.ok(p.examples.every(ex => ex.audio), `Ví dụ của ${p.name} phải có text phát âm audio`);
  });

  // Đoạn văn đọc hiểu
  assert.ok(lesson1.readingArticle, "Phải có đoạn văn tự giới thiệu mẫu");
  assert.ok(lesson1.readingArticle.passageJp.includes("初めまして"), "Đoạn văn phải có tiếng Nhật");

  // Bài tập đa dạng: Đọc, Nghe, Điền từ, Ngữ pháp, Sắp xếp
  const exercises = lesson1.exercises;
  assert.equal(exercises.length, 5, "Phải có 5 bài tập thực hành đa dạng");
  assert.ok(exercises.some(e => e.type === "reading"), "Phải có bài đọc hiểu");
  assert.ok(exercises.some(e => e.type === "listening"), "Phải có bài nghe hiểu");
  assert.ok(exercises.some(e => e.type === "fill"), "Phải có bài điền trợ từ");
  assert.ok(exercises.some(e => e.type === "writing"), "Phải có bài sắp xếp câu");

  // Bài kiểm tra đánh giá
  assert.equal(lesson1.testQuestions.length, 8, "Bài kiểm tra phải có 8 câu");

  // Các bài tiếp theo trong lộ trình
  assert.ok(n5Chap.lessons.some(l => l.id === "n5-lesson-2" && l.locked), "Bài 2 phải được khóa ban đầu");
  assert.ok(n5Chap.lessons.some(l => l.id === "n5-lesson-3" && l.locked), "Bài 3 phải được khóa ban đầu");
});

test("Tiến trình học tập và tính phần trăm hoàn thành hoạt động chính xác", () => {
  localStorage.clear();

  // Mặc định
  const p1 = getLessonProgress("n5-lesson-1");
  assert.equal(p1.theoryDone, false);
  assert.equal(p1.exercisesDone, false);
  assert.equal(p1.testPassed, false);
  assert.equal(calculateLessonPercent("n5-lesson-1"), 0);

  // Học xong lý thuyết -> 30%
  updateLessonProgress("n5-lesson-1", { theoryDone: true });
  assert.equal(calculateLessonPercent("n5-lesson-1"), 30);

  // Làm xong bài tập -> 60%
  updateLessonProgress("n5-lesson-1", { exercisesDone: true });
  assert.equal(calculateLessonPercent("n5-lesson-1"), 60);

  // Vượt qua bài kiểm tra -> 100%
  updateLessonProgress("n5-lesson-1", { testPassed: true, testScore: 8 });
  assert.equal(calculateLessonPercent("n5-lesson-1"), 100);

  // Ghi chú cá nhân dạng danh sách
  const noteItem = { text: "Nhớ trợ từ wa viết là ha.", createdAt: "23:00 - 13/10", lessonId: "n5-lesson-1" };
  updateLessonProgress("n5-lesson-1", { notesList: [noteItem] });
  const pSaved = getLessonProgress("n5-lesson-1");
  assert.equal(pSaved.notesList.length, 1);
  assert.equal(pSaved.notesList[0].text, "Nhớ trợ từ wa viết là ha.");
});

test("Mẫu câu 4 có highlight trợ từ も bằng class gp-mo và deepPoints phân tích sâu", () => {
  const lesson1 = GRAMMAR_CHAPTERS[0].lessons[0];
  const pattern4 = lesson1.patterns.find(p => p.id === "pattern-4");
  assert.ok(pattern4, "Phải có mẫu 4 về trợ từ も");
  assert.equal(pattern4.targetHighlight, "も");

  // Kiểm tra công thức và ví dụ chứa class gp-mark gp-mo
  assert.ok(pattern4.formula.includes('gp-mo">も</span>'), "Công thức mẫu 4 phải có highlight trợ từ も");
  assert.ok(pattern4.examples.some(ex => ex.jp.includes('gp-mo">も</span>')), "Ví dụ phải có highlight trợ từ も");

  // Phân tích sâu (deepPoints)
  assert.ok(Array.isArray(pattern4.deepPoints), "Phải có mảng deepPoints phân tích chuyên sâu");
  assert.ok(pattern4.deepPoints.length >= 3, "Phải có ít nhất 3 điểm phân tích cốt lõi");
  assert.ok(pattern4.deepPoints.some(dp => dp.includes("CẤM KỴ")), "Phải có cảnh báo cấm kỵ không dùng はも");

  // Mẫu 1 cũng phải có giải thích vì sao は đọc là wa
  const pattern1 = lesson1.patterns.find(p => p.id === "pattern-1");
  assert.ok(pattern1.deepPoints.some(dp => dp.includes("wa")), "Mẫu 1 phải có mục giải thích vì sao chữ は đọc là wa");
});

test("index.html tích hợp nút điều hướng nav-grammar và cấu trúc 3 cột cho grammar-view", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  assert.ok(html.includes('id="nav-grammar"'), "Phải có nút id nav-grammar trên navbar");
  assert.ok(html.includes('data-target="grammar-view"'), "Nút nav-grammar phải trỏ tới grammar-view");
  assert.ok(html.includes('id="grammar-view"'), "Phải có section id grammar-view");
  assert.ok(html.includes('id="grammar-sidebar-left"'), "Phải có cột trái grammar-sidebar-left");
  assert.ok(html.includes('id="grammar-main-content"'), "Phải có cột giữa grammar-main-content");
  assert.ok(html.includes('id="grammar-sidebar-right"'), "Phải có cột phải grammar-sidebar-right");
});

test("style.css định nghĩa các quy tắc layout LMS 3 cột, highlight gp-mo đỏ gạch chân và panel thu gọn", () => {
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  assert.ok(css.includes(".grammar-workspace-grid"), "CSS phải có .grammar-workspace-grid");
  assert.ok(css.includes(".grammar-sidebar-left"), "CSS phải có .grammar-sidebar-left");
  assert.ok(css.includes(".grammar-main-content"), "CSS phải có .grammar-main-content");
  assert.ok(css.includes(".grammar-sidebar-right"), "CSS phải có .grammar-sidebar-right");
  assert.ok(css.includes(".grammar-pattern-card"), "CSS phải có .grammar-pattern-card");
  assert.ok(css.includes(".exercise-item-card"), "CSS phải có .exercise-item-card");

  // Highlight targets
  assert.ok(css.includes(".gp-mark"), "CSS phải có class .gp-mark");
  assert.ok(css.includes(".gp-mo"), "CSS phải có class .gp-mo để in đỏ gạch chân trợ từ も");
  assert.ok(css.includes("#dc2626"), "CSS .gp-mo phải có màu đỏ đậm #dc2626");

  // Sub-step tree and collapsible right panel
  assert.ok(css.includes(".acc-sub-steps-tree"), "CSS phải có .acc-sub-steps-tree cho lộ trình Bài 1");
  assert.ok(css.includes(".is-collapsed"), "CSS phải có .is-collapsed cho cột phải thu gọn");
  assert.ok(css.includes(".active-highlight"), "CSS phải có .active-highlight cho tab đang chọn");
  assert.ok(css.includes(".deep-points-box"), "CSS phải có .deep-points-box cho phân tích chuyên sâu");
});
