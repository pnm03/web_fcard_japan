import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SPOKEN_NOTES_DATA } from "../src/spoken-notes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("SPOKEN_NOTES_DATA chứa đầy đủ 3 phần lưu ý quan trọng theo yêu cầu", () => {
  assert.equal(SPOKEN_NOTES_DATA.length, 3, "Phải có đủ 3 mục lưu ý");

  // 1. anata -> anta
  const anataNote = SPOKEN_NOTES_DATA.find(n => n.id === "anata-anta");
  assert.ok(anataNote, "Mục anata -> anta phải tồn tại");
  assert.ok(anataNote.title.includes("あんた"), "Tiêu đề phải có あんた");
  assert.ok(anataNote.details.explanation.includes("TUYỆT ĐỐI KHÔNG DÙNG"), "Phải có cảnh báo cấm kỵ");
  assert.ok(anataNote.details.examples.length >= 3, "Phải có ít nhất 3 ví dụ cho anta");

  // 2. watashi -> washi, watakushi, atashi, boku, ore...
  const watashiNote = SPOKEN_NOTES_DATA.find(n => n.id === "watashi-washi-watakushi");
  assert.ok(watashiNote, "Mục watashi -> washi phải tồn tại");
  assert.ok(watashiNote.details.explanation.includes("わし"), "Phải có giải thích về washi cho người già");
  assert.ok(watashiNote.details.explanation.includes("わたくし"), "Phải có giải thích về watakushi cho Keigo");
  assert.ok(watashiNote.details.examples.length >= 3, "Phải có ít nhất 3 ví dụ cho các đại từ");

  // 3. desu ka -> nano?
  const nanoNote = SPOKEN_NOTES_DATA.find(n => n.id === "desuka-nano");
  assert.ok(nanoNote, "Mục desu ka -> nano? phải tồn tại");
  assert.ok(nanoNote.title.includes("なの？"), "Tiêu đề phải có なの？");
  assert.ok(nanoNote.details.explanation.includes("先生なの？"), "Phải giải thích rõ quy tắc ghép nối với Danh từ");
  assert.ok(nanoNote.details.examples.some(ex => ex.jp.includes("なの？")), "Phải có ví dụ đuôi なの？");
});

test("Giao diện index.html có nav-spoken-notes, spoken-notes-view và spoken-note-modal", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  assert.ok(html.includes('id="nav-spoken-notes"'), "Navbar phải có nút id nav-spoken-notes");
  assert.ok(html.includes('data-target="spoken-notes-view"'), "Nav button phải trỏ tới data-target spoken-notes-view");
  assert.ok(html.includes('id="spoken-notes-view"'), "Phải có section id spoken-notes-view");
  assert.ok(html.includes('id="spoken-notes-grid"'), "Phải có container id spoken-notes-grid");
  assert.ok(html.includes('id="spoken-note-modal"'), "Phải có modal id spoken-note-modal");
  assert.ok(html.includes('id="spoken-modal-content"'), "Modal phải có id spoken-modal-content");
});

test("CSS chứa các quy tắc giao diện thẻ và modal cho spoken notes", () => {
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  assert.ok(css.includes(".spoken-notes-grid"), "CSS phải có .spoken-notes-grid");
  assert.ok(css.includes(".spoken-note-card"), "CSS phải có .spoken-note-card");
  assert.ok(css.includes(".note-warning-box"), "CSS phải có .note-warning-box");
  assert.ok(css.includes(".speak-note-btn"), "CSS phải có .speak-note-btn");
});
