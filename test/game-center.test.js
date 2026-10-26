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

test("game-center.js: Kho từ vựng mở rộng EXTENDED_VOCAB_BANK dồi dào phục vụ bàn cờ lớn tới 25x25", async () => {
  const gameModule = await import("../src/game-center.js");

  assert.ok(Array.isArray(gameModule.EXTENDED_VOCAB_BANK), "EXTENDED_VOCAB_BANK phải là mảng");
  assert.ok(gameModule.EXTENDED_VOCAB_BANK.length >= 80, "Kho từ vựng mở rộng phải có ít nhất 80 từ vựng phong phú");
  
  const sample = gameModule.EXTENDED_VOCAB_BANK[0];
  assert.ok(sample.hiragana || sample.kanji, "Từ vựng mở rộng phải có kana/kanji");
  assert.ok(sample.meaning, "Từ vựng mở rộng phải có nghĩa tiếng Việt");
});

test("game-center.js: Hỗ trợ linh hoạt kích thước bàn cờ Lật thẻ (3x3, 5x5, 8x8, 12x12, 15x15, 20x20, 25x25)", async () => {
  const gameModule = await import("../src/game-center.js");

  // 1. Kiểm tra bàn cờ lẻ 3x3 (9 ô = 4 cặp + 1 Sao May Mắn)
  const state3x3 = gameModule.startMemoryGameForTest("3x3");
  assert.equal(state3x3.cards.length, 9, "Bàn cờ 3x3 phải có đúng 9 thẻ");
  assert.equal(state3x3.cols, 3);
  assert.equal(state3x3.rows, 3);
  const luckyStar3 = state3x3.cards.find(c => c.type === "star");
  assert.ok(luckyStar3, "Bàn cờ lẻ 3x3 phải có thẻ Sao May Mắn ⭐");

  // 2. Kiểm tra bàn cờ lẻ 5x5 (25 ô = 12 cặp + 1 Sao May Mắn)
  const state5x5 = gameModule.startMemoryGameForTest("5x5");
  assert.equal(state5x5.cards.length, 25, "Bàn cờ 5x5 phải có đúng 25 thẻ");
  assert.ok(state5x5.cards.some(c => c.type === "star"), "Bàn cờ 5x5 phải có thẻ Sao May Mắn ⭐");

  // 3. Kiểm tra bàn cờ chẵn 8x8 (64 ô = 32 thẻ JP + 32 thẻ VI)
  const state8x8 = gameModule.startMemoryGameForTest("8x8");
  assert.equal(state8x8.cards.length, 64, "Bàn cờ 8x8 phải có đúng 64 thẻ");
  assert.equal(state8x8.cards.filter(c => c.type === "jp").length, 32);
  assert.equal(state8x8.cards.filter(c => c.type === "vi").length, 32);
  assert.equal(state8x8.cards.filter(c => c.type === "star").length, 0, "Bàn cờ chẵn không có thẻ lẻ");

  // 4. Kiểm tra bàn cờ cực đại 25x25 (625 ô)
  const state25x25 = gameModule.startMemoryGameForTest("25x25");
  assert.equal(state25x25.cards.length, 625, "Bàn cờ 25x25 phải có 625 thẻ");
  assert.equal(state25x25.cols, 25);
  assert.equal(state25x25.rows, 25);
  assert.ok(state25x25.cards.some(c => c.type === "star"), "Bàn cờ 25x25 có 1 thẻ Sao May Mắn");
});

test("game-center.js: Game Mario 2D Giải Cứu Công Chúa - Vật lý, chém thường, chiêu bùa chú & rơi vàng", async () => {
  const gameModule = await import("../src/game-center.js");

  // Khởi tạo game Mario 2D
  const mario = gameModule.startPrincessGameForTest();
  assert.ok(mario, "Mario state phải được khởi tạo");
  assert.equal(mario.player.hp, 3, "Hiệp sĩ có 3 tim/máu");
  assert.equal(typeof mario.player.w, "number", "Player w phải là số hợp lệ");
  assert.equal(typeof mario.player.h, "number", "Player h phải là số hợp lệ");
  assert.ok(mario.player.w > 0 && mario.player.h > 0, "Kích thước player phải lớn hơn 0");
  assert.ok(mario.enemies.length >= 6, "Phải có nhiều quái vật tuần tra trên đường");
  assert.ok(mario.blocks.length >= 5, "Phải có khối gạch và ô chứa bùa bí ẩn");
  assert.ok(mario.castle && mario.castle.x > 2000, "Phải có lâu đài công chúa ở cuối map");

  // Giả lập tiếp đất: Player rơi từ y:320 xuống mặt đất tại y:340 (block y:390 - h:50)
  for (let f = 0; f < 15; f++) {
    mario.player.vy += 0.58;
    mario.player.y += mario.player.vy;
    mario.player.onGround = false;
    mario.blocks.forEach(b => {
      const p = mario.player;
      if (p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y) {
        if (p.vy > 0) {
          p.y = b.y - p.h;
          p.vy = 0;
          p.onGround = true;
        }
      }
    });
    if (mario.player.onGround) break;
  }
  assert.equal(mario.player.onGround, true, "Player phải tiếp đất an toàn, không bị rơi xuyên sàn");
  assert.equal(mario.player.y, 340, "Tọa độ y khi đứng trên đất phải chuẩn xác");
  assert.equal(mario.player.hp, 3, "HP không bị mất khi đứng trên mặt đất");

  // Đòn đánh thường chém kiếm
  gameModule.triggerMarioNormalAttack();
  assert.equal(mario.player.isAttacking, true, "Phải kích hoạt trạng thái chém kiếm");
  assert.ok(mario.player.attackTimer > 0, "Timer chém kiếm phải lớn hơn 0");

  // Tuyệt chiêu đặc biệt: Phải trả lời câu hỏi tiếng Nhật
  gameModule.triggerMarioSpecialSpell();
  assert.equal(mario.isSpellPaused, true, "Trận đấu phải dừng để người chơi giải mã bùa chú");
  assert.ok(mario.currentSpellQuestion, "Phải tạo câu hỏi tiếng Nhật");
  assert.equal(mario.currentSpellQuestion.options.length, 4, "Câu hỏi phải có 4 đáp án lựa chọn");

  // Trả lời đúng bùa chú
  const correctIdx = mario.currentSpellQuestion.correct;
  gameModule.handleMarioSpellAnswer(correctIdx);
  assert.equal(mario.isSpellPaused, false, "Trận đấu tiếp tục sau khi trả lời");
  assert.ok(mario.specialDragon, "Trả lời đúng phải triệu hồi Hỏa Long Trảm");
  assert.ok(mario.player.coins >= 5, "Phải được thưởng vàng khi kích hoạt Hỏa Long Trảm");

  // Tiêu diệt quái vật làm rơi vàng
  const initialCoins = mario.coins.length;
  const targetEnemy = mario.enemies[0];
  gameModule.killEnemy(targetEnemy);
  assert.equal(targetEnemy.alive, false, "Quái vật phải bị tiêu diệt");
  assert.ok(mario.coins.length >= initialCoins + 3, "Tiêu diệt quái vật phải nổ rơi ra ít nhất 3 đồng xu vàng");
});

test("game-center.js: Hệ thống Mana, Quái vật nhiều HP & Đòn kết liễu, Rương kho báu và Bẫy lồng giam Công Chúa", async () => {
  const gameModule = await import("../src/game-center.js");

  // Khởi tạo game Mario
  const mario = gameModule.startPrincessGameForTest();
  assert.equal(mario.player.mana, 100, "Mana khởi điểm phải là 100");
  assert.equal(mario.player.maxMana, 100, "Max mana phải là 100");
  assert.ok(mario.chests && mario.chests.length >= 4, "Phải có ít nhất 4 rương báu trên map");

  // Quái vật có nhiều HP
  const enemy = mario.enemies[0];
  assert.ok(enemy.hp >= 2, "Quái vật thông thường phải có ít nhất 2 HP");
  const initHp = enemy.hp;

  // Chém thường: quái mất 1 HP
  gameModule.damageEnemy(enemy, 1, mario.player);
  assert.equal(enemy.hp, initHp - 1, "Quái phải mất 1 HP sau khi bị chém đòn 1");
  assert.equal(enemy.alive, true, "Quái chưa chết sau đòn 1");

  // Đòn 2 chí mạng: Quái hết HP -> Kích hoạt Đòn kết liễu (Finisher Modal)
  gameModule.damageEnemy(enemy, 1, mario.player);
  assert.equal(mario.isSpellPaused, true, "Đòn kết liễu phải tạm dừng game để trả lời câu hỏi");
  assert.equal(mario.modalContext, "finisher", "Modal context phải là finisher");
  assert.ok(mario.currentSpellQuestion.title.includes("ĐÒN KẾT LIỄU"), "Tiêu đề phải là ĐÒN KẾT LIỄU");

  // Trả lời đúng đòn kết liễu -> Quái chết, thưởng điểm và hồi 25 mana
  const manaBeforeFinisher = mario.player.mana;
  const correctIdx = mario.currentSpellQuestion.correct;
  gameModule.handleMarioSpellAnswer(correctIdx);
  assert.equal(enemy.alive, false, "Trả lời đúng kết liễu quái vật phải chết");
  assert.equal(mario.isSpellPaused, false, "Game tiếp tục sau khi kết liễu thành công");
  assert.ok(mario.player.mana >= manaBeforeFinisher, "Đòn kết liễu thành công phải hồi Mana");

  // Hồi Mana (R / button)
  mario.player.mana = 10;
  gameModule.triggerMarioManaRecharge();
  assert.equal(mario.isSpellPaused, true, "Hồi mana phải mở câu hỏi");
  assert.equal(mario.modalContext, "mana", "Context phải là mana");
  gameModule.handleMarioSpellAnswer(mario.currentSpellQuestion.correct);
  assert.equal(mario.player.mana, 100, "Trả lời đúng hồi mana phải nạp đầy 100 Mana");

  // Mở rương kho báu
  const chest = mario.chests[0];
  gameModule.triggerChestModal(chest);
  assert.equal(mario.modalContext, "chest", "Context phải là chest");
  gameModule.handleMarioSpellAnswer(mario.currentSpellQuestion.correct);
  assert.equal(chest.opened, true, "Trả lời đúng phải mở rương báu");

  // Cạm bẫy Lồng Giam Công Chúa: Trả lời sai -> Sập bẫy, trừ máu và dịch chuyển về đầu map
  mario.player.x = 4450;
  mario.player.y = 200;
  mario.player.hp = 3;
  gameModule.triggerPrincessSealModal();
  assert.equal(mario.modalContext, "princess_seal", "Context phải là princess_seal");
  
  // Trả lời SAI
  const wrongIdx = (mario.currentSpellQuestion.correct + 1) % 4;
  gameModule.handleMarioSpellAnswer(wrongIdx);
  assert.equal(mario.player.hp, 2, "Trả lời sai phong ấn phải bị mất 1 máu do sập bẫy");
  assert.equal(mario.player.x, 80, "Trả lời sai phong ấn phải bị đưa ngược về đầu map (x=80)");
  assert.equal(mario.cameraX, 0, "Camera phải reset về 0");

  // Trả lời ĐÚNG phong ấn -> Chiến thắng giải cứu công chúa
  gameModule.triggerPrincessSealModal();
  gameModule.handleMarioSpellAnswer(mario.currentSpellQuestion.correct);
  assert.equal(mario.victory, true, "Giải mã thành công phong ấn phải chiến thắng giải cứu công chúa!");
});

test("style.css: Chứa đầy đủ CSS sàn đấu quái vật, lâu đài công chúa, Mario 2D và lật thẻ đa kích thước", () => {
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  assert.ok(css.includes(".game-hub-container"), "CSS phải có .game-hub-container");
  assert.ok(css.includes(".game-card-banner"), "CSS phải có .game-card-banner");
  assert.ok(css.includes(".battle-stage-card"), "CSS phải có sàn đấu .battle-stage-card");
  assert.ok(css.includes(".combatant-hp-bar-box"), "CSS phải có thanh máu .combatant-hp-bar-box");
  assert.ok(css.includes(".monster-answer-btn"), "CSS phải có nút đòn đánh .monster-answer-btn");
  assert.ok(css.includes(".memory-card"), "CSS phải có thẻ trí nhớ .memory-card");
  assert.ok(css.includes(".memory-card-inner"), "CSS phải có hiệu ứng xoay lật 3D .memory-card-inner");

  // Mario 2D Game CSS
  assert.ok(css.includes(".mario-game-wrapper"), "CSS phải có .mario-game-wrapper");
  assert.ok(css.includes(".mario-canvas-container"), "CSS phải có .mario-canvas-container");
  assert.ok(css.includes("#mario-canvas"), "CSS phải có #mario-canvas");
  assert.ok(css.includes(".mario-touch-controls-bar"), "CSS phải có .mario-touch-controls-bar");
  assert.ok(css.includes(".touch-btn-spell"), "CSS phải có nút bùa chú .touch-btn-spell");
  assert.ok(css.includes(".touch-btn-recharge"), "CSS phải có nút nạp mana .touch-btn-recharge");
  assert.ok(css.includes(".mario-spell-modal-overlay"), "CSS phải có modal tuyệt chiêu .mario-spell-modal-overlay");

  // Memory Game Grid Sizing CSS
  assert.ok(css.includes(".mem-size-pill"), "CSS phải có pill chọn kích thước .mem-size-pill");
  assert.ok(css.includes(".memory-cards-grid-scalable"), "CSS phải có grid lật thẻ co giãn .memory-cards-grid-scalable");
  assert.ok(css.includes(".card-size-25x25"), "CSS phải có style cho bàn cờ .card-size-25x25");
  assert.ok(css.includes(".card-front-star"), "CSS phải có style ô sao may mắn .card-front-star");
});
