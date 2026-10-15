import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("index.html: Brand logo đổi thành MIW Nihongo và không còn banner xanh stealth ở dashboard", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  // Kiểm tra title
  assert.ok(html.includes("<title>MIW Nihongo"), "Title trang phải chứa MIW Nihongo");

  // Kiểm tra logo navbar
  const logoMatch = html.match(/<a[^>]*class="logo"[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(logoMatch, "Phải có thẻ logo");
  assert.ok(logoMatch[1].includes("MIW Nihongo"), "Logo text phải là MIW Nihongo");
  assert.ok(!logoMatch[1].includes("Nihongo Flashcard"), "Logo text không còn chứa Nihongo Flashcard");

  // Kiểm tra banner xanh stealth card đã được gỡ bỏ khỏi dashboard
  assert.ok(!html.includes("stealth-banner-card"), "Banner xanh stealth-banner-card phải được gỡ bỏ khỏi dashboard");
  assert.ok(!html.includes("Chế Độ Popup Ghim 2 Ô Mini (Văn Phòng Stealth)"), "Tiêu đề banner xanh stealth phải được gỡ bỏ");

  // Kiểm tra welcome text
  assert.ok(html.includes('id="welcome-text"'), "Phải có phần tử #welcome-text để hiển thị lời chào");
  assert.ok(html.includes("Kính chào Học viên!"), "Mặc định hiển thị Kính chào Học viên!");
});

test("ui.js: export hàm updateWelcomeGreeting và cập nhật chính xác tên học viên", async () => {
  const uiModule = await import("../src/ui.js");
  assert.equal(typeof uiModule.updateWelcomeGreeting, "function", "ui.js phải export hàm updateWelcomeGreeting");

  // Mock DOM
  const mockElement = { textContent: "" };
  const originalGetElementById = global.document?.getElementById;
  global.document = {
    ...(global.document || {}),
    getElementById: (id) => {
      if (id === "welcome-text") return mockElement;
      return null;
    }
  };

  try {
    uiModule.updateWelcomeGreeting("MINHKA");
    assert.equal(mockElement.textContent, "Kính chào Học viên MINHKA!", "Tên học viên phải được thêm vào lời chào");

    uiModule.updateWelcomeGreeting("");
    assert.equal(mockElement.textContent, "Kính chào Học viên!", "Khi không có tên thì giữ nguyên Kính chào Học viên!");

    uiModule.updateWelcomeGreeting("Chế độ Local (Offline)");
    assert.equal(mockElement.textContent, "Kính chào Học viên!", "Chế độ local không hiển thị tên hệ thống");
  } finally {
    if (originalGetElementById) {
      global.document.getElementById = originalGetElementById;
    }
  }
});

test("index.html: tích hợp favicon con cáo và logo morph switcher (dạng chữ và dạng ảnh)", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  // Kiểm tra favicon con cáo
  assert.ok(html.includes('href="/favicon.png"'), "Header phải có link icon favicon.png");

  // Kiểm tra bộ switcher dạng chữ và dạng ảnh
  assert.ok(html.includes('id="logo-variant-text"'), "Phải có logo-variant-text cho dạng chữ");
  assert.ok(html.includes('id="logo-variant-image"'), "Phải có logo-variant-image cho dạng ảnh");
  assert.ok(html.includes('src="/assets/logo-fox.png"'), "Phải sử dụng ảnh icon con cáo logo-fox.png");
  assert.ok(html.includes('src="/assets/logo-torii.png"'), "Phải sử dụng ảnh logo Torii logo-torii.png");
});

test("ui.js: export toggleLogoMode và setupLogoMorphTransition cho hiệu ứng lật chuyển đổi", async () => {
  const uiModule = await import("../src/ui.js");
  assert.equal(typeof uiModule.toggleLogoMode, "function", "ui.js phải export toggleLogoMode");
  assert.equal(typeof uiModule.setupLogoMorphTransition, "function", "ui.js phải export setupLogoMorphTransition");
});

test("index.html & style.css: Logo mặc định dạng chữ, hiệu ứng lật 3D card và nghiêng ảnh khi hover", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  // HTML: Cấu trúc 3D flip card
  assert.ok(html.includes("logo-icon-card"), "Logo icon phải có class logo-icon-card");
  assert.ok(html.includes("logo-icon-inner"), "Logo icon phải có khung lật 3D logo-icon-inner");
  assert.ok(html.includes("logo-icon-front"), "Logo icon phải có mặt trước logo-icon-front");
  assert.ok(html.includes("logo-icon-back"), "Logo icon phải có mặt sau logo-icon-back");

  // CSS: Hiệu ứng phóng to khi hover logo
  assert.ok(css.includes(".logo:hover"), "CSS phải có quy tắc hover cho .logo");
  assert.ok(css.includes("transform: scale"), "CSS phải có transform: scale khi hover logo");

  // CSS: Hiệu ứng nghiêng ảnh và lật 3D
  assert.ok(css.includes(".logo:hover .logo-icon"), "CSS phải có hover cho .logo-icon");
  assert.ok(css.includes("rotateZ"), "CSS phải có hiệu ứng xoay nghiêng rotateZ");
  assert.ok(css.includes(".logo:hover .logo-icon-inner"), "CSS phải có hover cho .logo-icon-inner");
  assert.ok(css.includes("rotateY(180deg)"), "CSS phải có hiệu ứng lật 3D rotateY(180deg)");
});

