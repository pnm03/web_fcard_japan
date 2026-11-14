import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("index.html & style.css: Có container hiển thị đáp án của bạn để đối chiếu khi làm sai", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const cssPath = path.resolve(__dirname, "../src/style.css");

  const htmlContent = fs.readFileSync(htmlPath, "utf-8");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  // Kiểm tra có ID quiz-bottom-sheet-user-answer trong HTML
  assert.ok(
    htmlContent.includes('id="quiz-bottom-sheet-user-answer"'),
    "index.html phải có phần tử id='quiz-bottom-sheet-user-answer' trong quiz-bottom-sheet"
  );

  assert.ok(
    htmlContent.includes('id="kana-quiz-bottom-sheet-user-answer"'),
    "index.html phải có phần tử id='kana-quiz-bottom-sheet-user-answer' trong kana-quiz-bottom-sheet"
  );

  // Kiểm tra CSS cho hàng đáp án của bạn
  assert.ok(
    cssContent.includes(".quiz-bottom-sheet-user-answer"),
    "style.css phải định nghĩa class .quiz-bottom-sheet-user-answer"
  );
  assert.ok(
    cssContent.includes(".user-answer-val"),
    "style.css phải định nghĩa class .user-answer-val"
  );
});

test("ui.js: showWrongAnswerSheet render hàng đối chiếu 'Đáp án của bạn: ...'", () => {
  const uiPath = path.resolve(__dirname, "../src/ui.js");
  const uiContent = fs.readFileSync(uiPath, "utf-8");

  assert.ok(
    uiContent.includes('quiz-bottom-sheet-user-answer'),
    "ui.js phải truy xuất phần tử quiz-bottom-sheet-user-answer"
  );
  assert.ok(
    uiContent.includes("Đáp án của bạn:"),
    "ui.js phải định dạng văn bản 'Đáp án của bạn: '"
  );
  assert.ok(
    uiContent.includes("showWrongAnswerSheet(result.correctAnswer, activeQuizSession.canPracticeRepeatCurrentQuestion(), answer)"),
    "handleQuizAnswerSubmit phải truyền answer của người dùng vào showWrongAnswerSheet"
  );
});
