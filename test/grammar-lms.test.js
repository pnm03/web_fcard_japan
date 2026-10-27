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
  // 5 mẫu câu ngữ pháp cốt lõi Bài 1:
  // A は B です, A は B じゃありません, A は B ですか, A も B です, N1 の N2
  const patterns = lesson1.patterns;
  assert.equal(patterns.length, 5, "Bài 1 phải có đúng 5 mẫu ngữ pháp (bao gồm trợ từ の)");
  
  assert.ok(patterns.some(p => p.name === "A は B です"), "Phải có mẫu A は B です");
  assert.ok(patterns.some(p => p.name === "A は B じゃありません"), "Phải có mẫu A は B じゃありません");
  assert.ok(patterns.some(p => p.name === "A は B ですか"), "Phải có mẫu A は B ですか");
  assert.ok(patterns.some(p => p.name === "A も B です"), "Phải có mẫu A も B です");
  assert.ok(patterns.some(p => p.name === "N1 の N2"), "Phải có mẫu N1 の N2 về trợ từ の");

  // Mỗi mẫu câu đều có ví dụ kèm audio
  patterns.forEach(p => {
    assert.ok(p.examples.length >= 3, `Mẫu ${p.name} phải có ít nhất 3 ví dụ`);
    assert.ok(p.examples.every(ex => ex.audio), `Ví dụ của ${p.name} phải có text phát âm audio`);
  });

  // Đoạn văn đọc hiểu
  assert.ok(lesson1.readingArticle, "Phải có đoạn văn tự giới thiệu mẫu");
  assert.ok(lesson1.readingArticle.passageJp.includes("はじめまして") || lesson1.readingArticle.passageJp.includes("初めまして"), "Đoạn văn phải có tiếng Nhật");

  // Bài tập đa dạng: Đọc, Nghe, Điền từ, Ngữ pháp, Sắp xếp
  const exercises = lesson1.exercises;
  assert.ok(exercises.length >= 5, "Phải có ít nhất 5 bài tập thực hành đa dạng");
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

test("grammar.js & style.css: Đoạn ngắt phân cách các phần học và widget lộ trình dọc Scrollspy cột phải", async () => {
  const grammarModule = await import("../src/grammar.js");
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  // 1. Kiểm tra export hàm lộ trình & scrollspy
  assert.equal(typeof grammarModule.generateRoadmapStepsHtml, "function", "grammar.js phải export generateRoadmapStepsHtml");
  assert.equal(typeof grammarModule.initGrammarRoadmapScrollspy, "function", "grammar.js phải export initGrammarRoadmapScrollspy");

  // 2. Kiểm tra HTML lộ trình được tạo ra đúng cấu trúc
  const lesson1 = grammarModule.GRAMMAR_CHAPTERS[0].lessons[0];
  const roadmapHtml = grammarModule.generateRoadmapStepsHtml(lesson1);

  assert.ok(roadmapHtml.includes("Khẳng định"), "Lộ trình phải có mốc Khẳng định");
  assert.ok(roadmapHtml.includes("Phủ định"), "Lộ trình phải có mốc Phủ định");
  assert.ok(roadmapHtml.includes("Nghi vấn"), "Lộ trình phải có mốc Nghi vấn");
  assert.ok(roadmapHtml.includes("Trợ từ も"), "Lộ trình phải có mốc Trợ từ も");
  assert.ok(roadmapHtml.includes("Trợ từ の"), "Lộ trình phải có mốc Trợ từ の");
  assert.ok(roadmapHtml.includes("Ứng dụng thực tế"), "Lộ trình phải có mốc Ứng dụng thực tế");
  assert.ok(roadmapHtml.includes("Ví dụ minh họa"), "Lộ trình phải có các mốc con Ví dụ minh họa");
  assert.ok(roadmapHtml.includes("dot-main"), "Lộ trình phải có các dấu chấm chính dot-main");
  assert.ok(roadmapHtml.includes("dot-sub"), "Lộ trình phải có các dấu chấm con dot-sub");

  // 3. Kiểm tra CSS định nghĩa đoạn ngắt bài học
  assert.ok(css.includes(".grammar-section-divider"), "CSS phải có class .grammar-section-divider");
  assert.ok(css.includes(".divider-pill"), "CSS phải có class .divider-pill");
  assert.ok(css.includes(".divider-step-tag"), "CSS phải có class .divider-step-tag");
  assert.ok(css.includes(".divider-phase-1"), "CSS phải có biến thể màu cho Phần 1");
  assert.ok(css.includes(".divider-phase-2"), "CSS phải có biến thể màu cho Phần 2");

  // 4. Kiểm tra CSS định nghĩa widget lộ trình thẳng đứng
  assert.ok(css.includes(".grammar-roadmap-widget"), "CSS phải có class .grammar-roadmap-widget");
  assert.ok(css.includes(".roadmap-line-track"), "CSS phải có đường thẳng đứng .roadmap-line-track");
  assert.ok(css.includes(".roadmap-line-progress"), "CSS phải có thanh chạy tiến độ .roadmap-line-progress");
  assert.ok(css.includes(".roadmap-step-item"), "CSS phải có class .roadmap-step-item");
  assert.ok(css.includes(".roadmap-step-item.active"), "CSS phải có trạng thái active khi cuộn tới");
  assert.ok(css.includes(".roadmap-dot.dot-main"), "CSS phải có dấu chấm tròn chính .dot-main");
  assert.ok(css.includes(".roadmap-dot.dot-sub"), "CSS phải có dấu chấm tròn con .dot-sub");
});

test("grammar.js & style.css: Bước 4 Ôn tập & Tạo ví dụ riêng, Bộ sinh đề thi JLPT N5 (Dịch câu, Điền từ, Đọc hiểu)", async () => {
  const grammarModule = await import("../src/grammar.js");
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  // 1. Kiểm tra export các hàm cốt lõi cho Ôn tập & Sinh đề
  assert.equal(typeof grammarModule.getCustomExamples, "function", "Phải export getCustomExamples");
  assert.equal(typeof grammarModule.addCustomExample, "function", "Phải export addCustomExample");
  assert.equal(typeof grammarModule.deleteCustomExample, "function", "Phải export deleteCustomExample");
  assert.equal(typeof grammarModule.extractLessonAndProjectVocab, "function", "Phải export extractLessonAndProjectVocab");
  assert.equal(typeof grammarModule.generateLessonReviewQuestions, "function", "Phải export generateLessonReviewQuestions");
  assert.equal(typeof grammarModule.checkTranslationAnswer, "function", "Phải export checkTranslationAnswer");
  assert.equal(typeof grammarModule.normalizeSentenceForComparison, "function", "Phải export normalizeSentenceForComparison");

  // 2. Kiểm tra quản lý ví dụ tự tạo (Custom Examples)
  const lessonId = "n5-lesson-1";
  const initialExamples = grammarModule.getCustomExamples(lessonId);
  assert.ok(Array.isArray(initialExamples), "Custom examples ban đầu phải là một mảng");

  const newExample = grammarModule.addCustomExample(lessonId, {
    jp: "アンさんはがくせいです。",
    romaji: "An san wa gakusei desu.",
    vn: "Bạn An là học sinh.",
    patternId: "pattern-1",
    note: "Ví dụ tự đặt với bạn An"
  });
  assert.ok(newExample.id, "Ví dụ mới phải được gán ID");
  assert.equal(newExample.jp, "アンさんはがくせいです。");

  const listAfterAdd = grammarModule.getCustomExamples(lessonId);
  assert.ok(listAfterAdd.some(ex => ex.id === newExample.id), "Danh sách phải chứa ví dụ vừa thêm");

  const deleted = grammarModule.deleteCustomExample(lessonId, newExample.id);
  assert.ok(deleted, "Xóa ví dụ thành công");
  const listAfterDelete = grammarModule.getCustomExamples(lessonId);
  assert.ok(!listAfterDelete.some(ex => ex.id === newExample.id), "Danh sách không còn chứa ví dụ đã xóa");

  // 3. Kiểm tra trích xuất từ vựng bài học & dự án (extractLessonAndProjectVocab)
  const lesson1 = grammarModule.GRAMMAR_CHAPTERS[0].lessons[0];
  const vocabData = grammarModule.extractLessonAndProjectVocab(lesson1);
  assert.ok(vocabData && typeof vocabData === "object", "Kết quả trích xuất phải là object");
  assert.ok(Array.isArray(vocabData.baseSubjects), "Phải có danh sách chủ ngữ");
  assert.ok(Array.isArray(vocabData.baseNouns), "Phải có danh sách danh từ");
  assert.ok(vocabData.baseSubjects.some(s => s.jp === "わたし" || s.vi.includes("tôi")), "Phải có chủ ngữ 'tôi'");
  assert.ok(vocabData.baseNouns.some(n => n.vi.includes("học sinh")), "Phải có danh từ 'học sinh'");

  // 4. Kiểm tra sinh đề thi đúng 1 dạng theo yêu cầu: translate, cloze, reading
  // Dạng 1: Dịch câu (translate)
  const translateQuestions = grammarModule.generateLessonReviewQuestions(lesson1, "translate");
  assert.equal(translateQuestions.mode, "translate", "Chế độ phải là translate");
  assert.ok(Array.isArray(translateQuestions.questions), "Phải có danh sách câu hỏi");
  assert.ok(translateQuestions.questions.length >= 3, "Phải có ít nhất 3 câu hỏi dịch");
  const qTranslate = translateQuestions.questions[0];
  assert.ok(qTranslate.prompt || qTranslate.vi, "Câu dịch phải có đề bài tiếng Việt");
  assert.ok(qTranslate.targetJp, "Câu dịch phải có đáp án tiếng Nhật");
  assert.ok(qTranslate.targetRomaji, "Câu dịch phải có đáp án Romaji");

  // Dạng 2: Điền từ (cloze)
  const clozeQuestions = grammarModule.generateLessonReviewQuestions(lesson1, "cloze");
  assert.equal(clozeQuestions.mode, "cloze", "Chế độ phải là cloze");
  assert.ok(clozeQuestions.questions.length >= 3, "Phải có ít nhất 3 câu điền từ");
  const qCloze = clozeQuestions.questions[0];
  assert.ok(qCloze.question.includes("[ ... ]") || qCloze.question.includes("（　★　）"), "Câu điền từ phải có chỗ trống khuyết");
  assert.ok(Array.isArray(qCloze.options) && qCloze.options.length === 4, "Phải có đúng 4 phương án trắc nghiệm chuẩn JLPT");
  assert.ok(typeof qCloze.correct === "number" && qCloze.correct >= 0 && qCloze.correct <= 3, "Chỉ số đáp án đúng hợp lệ");

  // Dạng 3: Đọc hiểu đoạn văn & khuyết từ (reading / Dokkai)
  const readingQuestions = grammarModule.generateLessonReviewQuestions(lesson1, "reading");
  assert.equal(readingQuestions.mode, "reading", "Chế độ phải là reading");
  assert.ok(readingQuestions.passage, "Phải có đoạn văn đọc hiểu");
  assert.ok(readingQuestions.passage.jp.length > 20, "Đoạn văn đọc hiểu phải có nội dung đủ dài");
  assert.ok(readingQuestions.questions.length >= 2, "Phải có ít nhất 2 câu hỏi đọc hiểu");

  // 5. Kiểm tra thuật toán chấm điểm dịch câu thông minh (checkTranslationAnswer)
  // Khớp chính xác tiếng Nhật
  const resExactJp = grammarModule.checkTranslationAnswer("わたしはがくせいです。", "わたしはがくせいです。", "watashi wa gakusei desu", []);
  assert.equal(resExactJp.isCorrect, true, "Gõ đúng tiếng Nhật có dấu chấm phải đúng");

  // Khớp không có dấu chấm câu
  const resNoPunct = grammarModule.checkTranslationAnswer("わたしはがくせい です", "わたしはがくせいです。", "watashi wa gakusei desu", []);
  assert.equal(resNoPunct.isCorrect, true, "Bỏ qua khoảng trắng và dấu chấm câu");

  // Khớp Romaji gõ chuẩn
  const resRomaji = grammarModule.checkTranslationAnswer("watashi wa gakusei desu", "わたしはがくせいです。", "watashi wa gakusei desu", []);
  assert.equal(resRomaji.isCorrect, true, "Gõ Romaji chuẩn phải đúng");

  // Gõ Romaji tự động chuyển đổi sang Hiragana để so sánh
  const resRomajiConverted = grammarModule.checkTranslationAnswer("watashiwagakuseidesu", "わたしはがくせいです。", "watashi wa gakusei desu", []);
  assert.equal(resRomajiConverted.isCorrect, true, "Romaji liền nhau phải được Hiragana hóa và so sánh đúng");

  // Trả lời sai
  const resWrong = grammarModule.checkTranslationAnswer("anata wa sensei desu", "わたしはがくせいです。", "watashi wa gakusei desu", []);
  assert.equal(resWrong.isCorrect, false, "Câu trả lời sai nội dung phải bị chấm sai");

  // 6. Kiểm tra CSS cho Ôn tập & Sinh đề thi
  assert.ok(css.includes(".review-view-wrapper"), "CSS phải có .review-view-wrapper");
  assert.ok(css.includes(".custom-examples-container"), "CSS phải có .custom-examples-container");
  assert.ok(css.includes(".custom-example-item-card"), "CSS phải có .custom-example-item-card");
  assert.ok(css.includes(".review-mode-selector-bar"), "CSS phải có thanh chọn dạng bài .review-mode-selector-bar");
  assert.ok(css.includes(".rev-mode-btn"), "CSS phải có .rev-mode-btn");
  assert.ok(css.includes(".review-question-card"), "CSS phải có .review-question-card");
  assert.ok(css.includes(".rev-typing-input"), "CSS phải có input gõ bài dịch .rev-typing-input");
  assert.ok(css.includes(".rev-options-grid"), "CSS phải có lưới chọn phương án JLPT .rev-options-grid");
  assert.ok(css.includes(".dokkai-passage-card"), "CSS phải có thẻ đoạn văn đọc hiểu .dokkai-passage-card");
  assert.ok(css.includes(".review-result-panel"), "CSS phải có bảng tổng kết điểm .review-result-panel");
});

test("Tùy chỉnh cỡ chữ (bánh răng cài đặt), Từ vựng Bài 1 thuần Hiragana và click phát âm từ khóa", async () => {
  const grammarModule = await import("../src/grammar.js");
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  // 1. Kiểm tra HTML: Không còn badge LMS thô cứng, thay bằng nút bánh răng cài đặt và popover tùy chỉnh cỡ chữ
  assert.ok(!html.includes("🌟 Không Gian Học Tập LMS"), "Đã gỡ bỏ badge LMS thô cứng");
  assert.ok(html.includes('id="grammar-settings-btn"'), "HTML phải có nút bánh răng #grammar-settings-btn");
  assert.ok(html.includes('id="grammar-settings-popover"'), "HTML phải có popover tùy chỉnh #grammar-settings-popover");
  assert.ok(html.includes('id="grammar-font-slider"'), "HTML phải có thanh trượt điều chỉnh cỡ chữ #grammar-font-slider");
  assert.ok(html.includes('data-size="15"'), "HTML phải có preset cỡ chữ nhỏ A-");
  assert.ok(html.includes('data-size="21"'), "HTML phải có preset cỡ chữ lớn A++");

  // 2. Kiểm tra CSS: Định nghĩa kiểu dáng bánh răng, popover, cỡ chữ lớn và hiệu ứng click phát âm
  assert.ok(css.includes(".grammar-settings-btn"), "CSS phải có .grammar-settings-btn");
  assert.ok(css.includes(".grammar-settings-popover"), "CSS phải có .grammar-settings-popover");
  assert.ok(css.includes(".gp-speaking"), "CSS phải có hiệu ứng phát âm .gp-speaking");
  assert.ok(css.includes("cursor: pointer"), "CSS .gp-mark phải có con trỏ pointer để người dùng biết bấm được");

  // 3. Kiểm tra dữ liệu Bài 1: Dùng Hiragana cho từ vựng mới học (Bài 1 chưa học Hán tự)
  const lesson1 = grammarModule.GRAMMAR_CHAPTERS[0].lessons[0];
  const allExamplesJp = lesson1.patterns.flatMap(p => p.examples.map(ex => ex.jp)).join(" ");
  
  // Phải dùng Hiragana
  assert.ok(allExamplesJp.includes("かいしゃいん"), "Bài 1 phải dùng 'かいしゃいん' thay vì 会社員");
  assert.ok(allExamplesJp.includes("いしゃ"), "Bài 1 phải dùng 'いしゃ' thay vì 医者");
  assert.ok(allExamplesJp.includes("がくせい"), "Bài 1 phải dùng 'がくせい' thay vì 学生");
  assert.ok(allExamplesJp.includes("ベトナムじん"), "Bài 1 phải dùng 'ベトナムじん' thay vì ベトナム人");
  
  // Không chứa Hán tự chưa học ở Bài 1
  assert.ok(!allExamplesJp.includes("会社員"), "Bài 1 không được chứa Hán tự 会社員");
  assert.ok(!allExamplesJp.includes("医者"), "Bài 1 không được chứa Hán tự 医者");
  assert.ok(!allExamplesJp.includes("学生"), "Bài 1 không được chứa Hán tự 学生");
  assert.ok(!allExamplesJp.includes("ベトナム人"), "Bài 1 không được chứa Hán tự ベトナム人");
  assert.ok(!allExamplesJp.includes("日本人"), "Bài 1 không được chứa Hán tự 日本人");

  // 4. Kiểm tra các hàm logic trong grammar.js
  assert.equal(typeof grammarModule.applyGrammarFontSize, "function", "Phải export applyGrammarFontSize");
  assert.equal(typeof grammarModule.playGrammarWordAudio, "function", "Phải export playGrammarWordAudio");
  assert.equal(typeof grammarModule.initGrammarSettings, "function", "Phải export initGrammarSettings");
});

test("Mẫu câu 5: Trợ từ の (Sở hữu & liên kết danh từ N1 の N2)", async () => {
  const grammarModule = await import("../src/grammar.js");
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  const lesson1 = grammarModule.GRAMMAR_CHAPTERS[0].lessons[0];
  const pattern5 = lesson1.patterns.find(p => p.id === "pattern-5");
  assert.ok(pattern5, "Bài 1 phải có mẫu ngữ pháp pattern-5 về trợ từ の");
  assert.equal(pattern5.name, "N1 の N2");
  assert.equal(pattern5.targetHighlight, "の");

  // Kiểm tra công thức và highlight gp-no
  assert.ok(pattern5.formula.includes('gp-no">の</span>'), "Công thức mẫu 5 phải có highlight gp-no cho trợ từ の");
  assert.ok(pattern5.examples.some(ex => ex.jp.includes('gp-no">の</span>')), "Ví dụ mẫu 5 phải có highlight gp-no cho trợ từ の");

  // Phân tích chuyên sâu (deepPoints)
  assert.ok(Array.isArray(pattern5.deepPoints), "Phải có deepPoints phân tích sâu về trợ từ の");
  assert.ok(pattern5.deepPoints.length >= 4, "deepPoints phải có ít nhất 4 điểm phân tích cốt lõi");
  assert.ok(pattern5.deepPoints.some(dp => dp.includes("IMC")), "Phải có ví dụ phân tích tổ chức như IMC");

  // Kiểm tra CSS highlight trợ từ の và divider phase 5
  assert.ok(css.includes(".gp-no"), "CSS phải định nghĩa .gp-no để highlight trợ từ の");
  assert.ok(css.includes(".divider-phase-5"), "CSS phải có class .divider-phase-5 cho giai đoạn 5");

  // Kiểm tra ví dụ câu của mẫu 5 dùng thuần Hiragana (trừ Katakana tên riêng)
  const pattern5Jp = pattern5.examples.map(ex => ex.jp).join(" ");
  assert.ok(pattern5Jp.includes("IMC"), "Ví dụ chứa tên công ty IMC");
  assert.ok(pattern5Jp.includes("しゃいん"), "Ví dụ chứa 'しゃいん' ở dạng Hiragana");
  assert.ok(!pattern5Jp.includes("社員"), "Ví dụ không được dùng Hán tự 社員 chưa học");

  // Đoạn văn đọc hiểu mẫu có áp dụng trợ từ の
  assert.ok(lesson1.readingArticle.passageJp.includes('gp-no">の</span>'), "Đoạn văn đọc hiểu mẫu phải có sử dụng trợ từ の");
});


