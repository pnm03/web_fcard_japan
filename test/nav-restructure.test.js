import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("index.html: Navbar có Trang chủ (đổi từ Dashboard) và 4 nhóm menu dropdown", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  // 1. Trang chủ (đổi từ Dashboard)
  const dashboardBtn = html.match(/<button[^>]*id="nav-dashboard"[^>]*>([\s\S]*?)<\/button>/);
  assert.ok(dashboardBtn, "Phải có nút id nav-dashboard");
  assert.ok(dashboardBtn[1].includes("Trang chủ"), "Nút nav-dashboard phải đổi nhãn thành Trang chủ");

  // 2. Nhóm Dự án (Quản lý dự án, Tra từ)
  assert.ok(html.includes('data-nav-group="projects"'), "Phải có nhóm dropdown projects");
  assert.ok(html.includes('id="nav-projects"'), "Phải có nút Quản lý dự án id nav-projects");
  assert.ok(html.includes('id="nav-dictionary"'), "Phải có nút Tra từ id nav-dictionary");

  // 3. Nhóm Ôn tập (Lịch ôn, Mục tiêu, Ôn từ yếu)
  assert.ok(html.includes('data-nav-group="review"'), "Phải có nhóm dropdown review");
  assert.ok(html.includes('id="nav-smart-review"'), "Phải có nút Lịch ôn id nav-smart-review");
  assert.ok(html.includes('id="nav-learning-goals"'), "Phải có nút Mục tiêu id nav-learning-goals");
  assert.ok(html.includes('id="nav-weak-vocab"'), "Phải có nút Ôn từ yếu id nav-weak-vocab");

  // 4. Nhóm Kiểm tra (Kiểm tra, Luyện chữ cái)
  assert.ok(html.includes('data-nav-group="quiz"'), "Phải có nhóm dropdown quiz");
  assert.ok(html.includes('id="nav-quiz-setup"'), "Phải có nút Kiểm tra id nav-quiz-setup");
  assert.ok(html.includes('id="nav-kana"'), "Phải có nút Luyện chữ cái id nav-kana");

  // 5. Nhóm Học tập (Ngữ pháp N5, Lưu ý văn nói)
  assert.ok(html.includes('data-nav-group="learn"'), "Phải có nhóm dropdown learn");
  assert.ok(html.includes('id="nav-grammar"'), "Phải có nút Ngữ pháp N5 id nav-grammar");
  assert.ok(html.includes('id="nav-spoken-notes"'), "Phải có nút Lưu ý văn nói id nav-spoken-notes");
});

test("style.css: Định nghĩa quy tắc hiển thị và hover mượt mà cho nav-dropdown", () => {
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  assert.ok(css.includes(".nav-dropdown"), "CSS phải có .nav-dropdown");
  assert.ok(css.includes(".nav-dropdown-menu"), "CSS phải có .nav-dropdown-menu");
  assert.ok(css.includes(".nav-dropdown-item"), "CSS phải có .nav-dropdown-item");
  assert.ok(css.includes(".dropdown-chevron"), "CSS phải có .dropdown-chevron");
});

test("index.html & style.css: Thay thế emoji bằng badge vector SVG chuyên nghiệp", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  // Kiểm tra không còn dùng các emoji thô trong menu dropdown
  const navDropdownMatch = html.match(/<nav class="main-nav">([\s\S]*?)<\/nav>/);
  assert.ok(navDropdownMatch, "Phải có thẻ main-nav");
  const navContent = navDropdownMatch[1];

  assert.ok(!navContent.includes("📁"), "Không còn emoji 📁");
  assert.ok(!navContent.includes("🔍"), "Không còn emoji 🔍");
  assert.ok(!navContent.includes("📅"), "Không còn emoji 📅");
  assert.ok(!navContent.includes("🎯"), "Không còn emoji 🎯");
  assert.ok(!navContent.includes("⚡"), "Không còn emoji ⚡");
  assert.ok(!navContent.includes("📝"), "Không còn emoji 📝");
  assert.ok(!navContent.includes("🈸"), "Không còn emoji 🈸 (thay bằng ký tự あ tinh tế)");
  assert.ok(!navContent.includes("📖"), "Không còn emoji 📖");
  assert.ok(!navContent.includes("🗣️"), "Không còn emoji 🗣️");
  assert.ok(!navContent.includes("📌"), "Không còn emoji 📌");

  // Kiểm tra hệ thống badge vector SVG
  assert.ok(html.includes("item-icon-badge"), "Menu phải sử dụng hệ thống item-icon-badge");
  assert.ok(html.includes("badge-blue"), "Có badge-blue");
  assert.ok(html.includes("badge-amber"), "Có badge-amber");
  assert.ok(html.includes("badge-indigo"), "Có badge-indigo");
  assert.ok(html.includes("badge-emerald"), "Có badge-emerald");
  assert.ok(html.includes("badge-rose"), "Có badge-rose");
  assert.ok(html.includes("badge-cyan"), "Có badge-cyan");
  assert.ok(html.includes("badge-purple"), "Có badge-purple");
  assert.ok(html.includes("kana-glyph"), "Luyện chữ cái hiển thị kana-glyph あ");

  // Kiểm tra CSS cho badge
  assert.ok(css.includes(".item-icon-badge"), "CSS phải có quy tắc định kiểu cho .item-icon-badge");
  assert.ok(css.includes(".item-icon-badge.badge-blue"), "CSS phải có màu badge-blue");
});

