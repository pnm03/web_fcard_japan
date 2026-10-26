import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Giả lập localStorage cho Node.js test environment
if (typeof globalThis.localStorage === "undefined") {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

test("index.html: Tích hợp nút nav-games trên thanh điều hướng và view section game-center-view", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  // Nút trên Navbar
  assert.ok(html.includes('id="nav-games"'), "Phải có id nav-games trên navbar");
  assert.ok(html.includes('data-target="game-center-view"'), "nav-games phải trỏ tới data-target game-center-view");
  assert.ok(html.includes("Trò chơi 🎮"), "Nút điều hướng phải có nhãn Trò chơi");

  // Section view trong main
  assert.ok(html.includes('id="game-center-view"'), "Phải có section id game-center-view");
  assert.ok(html.includes('class="view-section"'), "game-center-view phải có class view-section");
});

test("ui.js: Hỗ trợ chuyển đổi switchView sang game-center-view và gọi setupGameCenterUI", () => {
  const uiContent = fs.readFileSync(path.resolve(__dirname, "../src/ui.js"), "utf-8");

  assert.ok(uiContent.includes("game-center.js"), "ui.js phải import từ game-center.js");
  assert.ok(uiContent.includes("setupGameCenterUI"), "ui.js phải gọi setupGameCenterUI");
  assert.ok(uiContent.includes('viewId === "game-center-view"'), "switchView phải xử lý viewId game-center-view");
});

test("game-center.js: Cấu hình dữ liệu trò chơi (MONSTER_ROSTER, PRINCESS_TOWER_FLOORS, BASE_GAME_VOCAB)", async () => {
  const gameModule = await import("../src/game-center.js");

  // 1. Quái vật
  assert.ok(Array.isArray(gameModule.MONSTER_ROSTER), "Phải có danh sách quái vật");
  assert.equal(gameModule.MONSTER_ROSTER.length, 4, "Phải có đủ 4 quái vật");
  assert.ok(gameModule.MONSTER_ROSTER.some(m => m.name.includes("Kappa")), "Phải có Kappa");
  assert.ok(gameModule.MONSTER_ROSTER.some(m => m.name.includes("Tengu")), "Phải có Tengu");
  assert.ok(gameModule.MONSTER_ROSTER.some(m => m.name.includes("Hồ Ly")), "Phải có Hồ Ly");
  assert.ok(gameModule.MONSTER_ROSTER.some(m => m.name.includes("Quỷ Vương") || m.name.includes("Boss")), "Phải có Boss Quỷ Vương");

  // 2. Tầng tháp công chúa
  assert.ok(Array.isArray(gameModule.PRINCESS_TOWER_FLOORS), "Phải có danh sách các tầng tháp");
  assert.equal(gameModule.PRINCESS_TOWER_FLOORS.length, 5, "Tháp phải có 5 tầng thử thách");
  assert.equal(gameModule.PRINCESS_TOWER_FLOORS[4].name, "Đỉnh Tháp: Lồng Giam Công Chúa");

  // 3. Từ vựng nền tảng
  assert.ok(Array.isArray(gameModule.BASE_GAME_VOCAB), "Phải có danh sách từ vựng nền tảng");
  assert.ok(gameModule.BASE_GAME_VOCAB.length >= 10, "Từ vựng nền tảng phải có ít nhất 10 từ");
});

test("game-center.js: extractVocabForGame trích xuất và kết hợp từ vựng chính xác", async () => {
  const gameModule = await import("../src/game-center.js");

  const vocabList = gameModule.extractVocabForGame("all");
  assert.ok(Array.isArray(vocabList), "Danh sách từ vựng phải là mảng");
  assert.ok(vocabList.length >= 10, "Phải có ít nhất 10 từ vựng cho game");

  const sample = vocabList[0];
  assert.ok(sample.hiragana || sample.kanji, "Từ vựng phải có tiếng Nhật");
  assert.ok(sample.meaning, "Từ vựng phải có nghĩa");
});

test("game-center.js: Quản lý hồ sơ game và điểm thưởng (Game Profile & Storage)", async () => {
  const gameModule = await import("../src/game-center.js");

  // Khởi tạo profile
  const profile = gameModule.getGameProfile();
  assert.ok(profile && typeof profile === "object", "Profile phải là một object");
  assert.equal(typeof profile.level, "number");
  assert.equal(typeof profile.exp, "number");

  // Tích lũy EXP
  const initialExp = profile.exp || 0;
  gameModule.addGameExp(150);
  const pAfterExp = gameModule.getGameProfile();
  assert.equal(pAfterExp.exp, initialExp + 150);

  // Ghi nhận thành tích
  const initialMonsters = pAfterExp.monstersDefeated || 0;
  gameModule.recordMonsterDefeated();
  assert.equal(gameModule.getGameProfile().monstersDefeated, initialMonsters + 1);

  const initialPrincess = pAfterExp.princessRescued || 0;
  gameModule.recordPrincessRescued();
  assert.equal(gameModule.getGameProfile().princessRescued, initialPrincess + 1);

  const initialMem = pAfterExp.memoryWins || 0;
  gameModule.recordMemoryWin();
  assert.equal(gameModule.getGameProfile().memoryWins, initialMem + 1);
});

test("style.css: Chứa đầy đủ CSS sàn đấu quái vật, lâu đài công chúa và lật thẻ 3D", () => {
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  assert.ok(css.includes(".game-hub-container"), "CSS phải có .game-hub-container");
  assert.ok(css.includes(".game-card-banner"), "CSS phải có .game-card-banner");
  assert.ok(css.includes(".battle-stage-card"), "CSS phải có sàn đấu .battle-stage-card");
  assert.ok(css.includes(".combatant-hp-bar-box"), "CSS phải có thanh máu .combatant-hp-bar-box");
  assert.ok(css.includes(".monster-answer-btn"), "CSS phải có nút đòn đánh .monster-answer-btn");
  assert.ok(css.includes(".castle-tower-stage"), "CSS phải có tháp lâu đài .castle-tower-stage");
  assert.ok(css.includes(".tower-floor-row"), "CSS phải có các tầng tháp .tower-floor-row");
  assert.ok(css.includes(".memory-card"), "CSS phải có thẻ trí nhớ .memory-card");
  assert.ok(css.includes(".memory-card-inner"), "CSS phải có hiệu ứng xoay lật 3D .memory-card-inner");
});
