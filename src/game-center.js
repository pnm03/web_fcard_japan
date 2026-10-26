// src/game-center.js
// Trung tâm Trò chơi Học tiếng Nhật (Game Center)
// 1. Tiêu diệt yêu quái (Monster Slayer)
// 2. Giải cứu công chúa 2D Platformer (Super Princess Rescue - Mario Style 2D)
// 3. Lật thẻ trí nhớ ma thuật (Memory Match) với tùy chọn kích thước 3x3, 4x4, 5x5, 8x8, 12x12, 15x15, 20x20, 25x25

import { getProjects } from "./storage.js";
import { GRAMMAR_CHAPTERS } from "./grammar.js";
import { speakJapanese } from "./ui.js";

export const STORAGE_KEY_GAME_PROFILE = "miw_nihongo_game_profile_v1";

// ============================================================================
// HỆ THỐNG DỮ LIỆU TỪ VỰNG PHONG PHÚ CHO TẤT CẢ GAME (KỂ CẢ MAP 25x25)
// ============================================================================
export const EXTENDED_VOCAB_BANK = [
  // Nghề nghiệp & Con người
  { kanji: "私", hiragana: "わたし", romaji: "watashi", meaning: "tôi" },
  { kanji: "あなた", hiragana: "あなた", romaji: "anata", meaning: "bạn / anh / chị" },
  { kanji: "学生", hiragana: "がくせい", romaji: "gakusei", meaning: "học sinh, sinh viên" },
  { kanji: "先生", hiragana: "せんせい", romaji: "sensei", meaning: "giáo viên, thầy cô" },
  { kanji: "会社員", hiragana: "かいしゃいん", romaji: "kaishain", meaning: "nhân viên công ty" },
  { kanji: "医者", hiragana: "いしゃ", romaji: "isha", meaning: "bác sĩ" },
  { kanji: "エンジニア", hiragana: "えんじにあ", romaji: "enjinia", meaning: "kỹ sư" },
  { kanji: "研究者", hiragana: "けんきゅうしゃ", romaji: "kenkyuusha", meaning: "nhà nghiên cứu" },
  { kanji: "銀行員", hiragana: "ぎんこういん", romaji: "ginkouin", meaning: "nhân viên ngân hàng" },
  { kanji: "友達", hiragana: "ともだち", romaji: "tomodachi", meaning: "bạn bè" },
  { kanji: "子供", hiragana: "こども", romaji: "kodomo", meaning: "trẻ em" },
  { kanji: "家族", hiragana: "かぞく", romaji: "kazoku", meaning: "gia đình" },
  { kanji: "父", hiragana: "ちち", romaji: "chichi", meaning: "bố (của mình)" },
  { kanji: "母", hiragana: "はは", romaji: "haha", meaning: "mẹ (của mình)" },
  { kanji: "日本人", hiragana: "にほんじん", romaji: "nihonjin", meaning: "người Nhật Bản" },
  { kanji: "ベトナム人", hiragana: "べとなむじん", romaji: "betonamujin", meaning: "người Việt Nam" },
  { kanji: "アメリカ人", hiragana: "あめりかじん", romaji: "amerikajin", meaning: "người Mỹ" },
  { kanji: "中国人", hiragana: "ちゅうごくじん", romaji: "chuugokujin", meaning: "người Trung Quốc" },
  
  // Địa điểm & Trường học
  { kanji: "大学", hiragana: "だいがく", romaji: "daigaku", meaning: "trường đại học" },
  { kanji: "学校", hiragana: "がっこう", romaji: "gakkou", meaning: "trường học" },
  { kanji: "病院", hiragana: "びょういん", romaji: "byouin", meaning: "bệnh viện" },
  { kanji: "会社", hiragana: "かいしゃ", romaji: "kaisha", meaning: "công ty" },
  { kanji: "部屋", hiragana: "へや", romaji: "heya", meaning: "căn phòng" },
  { kanji: "家", hiragana: "いえ", romaji: "ie", meaning: "ngôi nhà" },
  { kanji: "国", hiragana: "くに", romaji: "kuni", meaning: "đất nước" },
  { kanji: "日本", hiragana: "にほん", romaji: "nihon", meaning: "Nhật Bản" },
  { kanji: "教室", hiragana: "きょうしつ", romaji: "kyoushitsu", meaning: "phòng học" },
  { kanji: "図書館", hiragana: "としょかん", romaji: "toshokan", meaning: "thư viện" },
  { kanji: "駅", hiragana: "えき", romaji: "eki", meaning: "nhà ga" },
  { kanji: "公園", hiragana: "こうえん", romaji: "kouen", meaning: "công viên" },

  // Đồ vật & Phương tiện
  { kanji: "本", hiragana: "ほん", romaji: "hon", meaning: "sách" },
  { kanji: "辞書", hiragana: "じしょ", romaji: "jisho", meaning: "từ điển" },
  { kanji: "車", hiragana: "くるま", romaji: "kuruma", meaning: "xe hơi, ô tô" },
  { kanji: "自転車", hiragana: "じてんしゃ", romaji: "jitensha", meaning: "xe đạp" },
  { kanji: "時計", hiragana: "とけい", romaji: "tokei", meaning: "đồng hồ" },
  { kanji: "鞄", hiragana: "かばん", romaji: "kaban", meaning: "cặp, túi xách" },
  { kanji: "机", hiragana: "つくえ", romaji: "tsukue", meaning: "bàn học" },
  { kanji: "椅子", hiragana: "いす", romaji: "isu", meaning: "ghế ngồi" },
  { kanji: "電話", hiragana: "でんわ", romaji: "denwa", meaning: "điện thoại" },
  { kanji: "手紙", hiragana: "てがみ", romaji: "tegami", meaning: "bức thư" },
  { kanji: "写真", hiragana: "しゃしん", romaji: "shashin", meaning: "bức ảnh" },
  { kanji: "お金", hiragana: "おかね", romaji: "okane", meaning: "tiền bạc" },
  { kanji: "鍵", hiragana: "かぎ", romaji: "kagi", meaning: "chìa khóa" },

  // Ăn uống & Thiên nhiên
  { kanji: "水", hiragana: "みず", romaji: "mizu", meaning: "nước uống" },
  { kanji: "お茶", hiragana: "おちゃ", romaji: "ocha", meaning: "trà" },
  { kanji: "ご飯", hiragana: "ごはん", romaji: "gohan", meaning: "cơm, bữa ăn" },
  { kanji: "肉", hiragana: "にく", romaji: "niku", meaning: "thịt" },
  { kanji: "魚", hiragana: "さかな", romaji: "sakana", meaning: "con cá" },
  { kanji: "野菜", hiragana: "やさい", romaji: "yasai", meaning: "rau củ" },
  { kanji: "果物", hiragana: "くだもの", romaji: "kudamono", meaning: "trái cây" },
  { kanji: "山", hiragana: "やま", romaji: "yama", meaning: "ngọn núi" },
  { kanji: "川", hiragana: "かわ", romaji: "kawa", meaning: "dòng sông" },
  { kanji: "海", hiragana: "うみ", romaji: "umi", meaning: "biển cả" },
  { kanji: "空", hiragana: "そら", romaji: "sora", meaning: "bầu trời" },
  { kanji: "雨", hiragana: "あめ", romaji: "ame", meaning: "cơn mưa" },
  { kanji: "花", hiragana: "はな", romaji: "hana", meaning: "bông hoa" },
  { kanji: "木", hiragana: "き", romaji: "ki", meaning: "cây cối" },

  // Số đếm 1-10
  { kanji: "一", hiragana: "いち", romaji: "ichi", meaning: "số một (1)" },
  { kanji: "二", hiragana: "に", romaji: "ni", meaning: "số hai (2)" },
  { kanji: "三", hiragana: "さん", romaji: "san", meaning: "số ba (3)" },
  { kanji: "四", hiragana: "よん", romaji: "yon", meaning: "số bốn (4)" },
  { kanji: "五", hiragana: "ご", romaji: "go", meaning: "số năm (5)" },
  { kanji: "六", hiragana: "ろく", romaji: "roku", meaning: "số sáu (6)" },
  { kanji: "七", hiragana: "なな", romaji: "nana", meaning: "số bảy (7)" },
  { kanji: "八", hiragana: "はち", romaji: "hachi", meaning: "số tám (8)" },
  { kanji: "九", hiragana: "きゅう", romaji: "kyuu", meaning: "số chín (9)" },
  { kanji: "十", hiragana: "じゅう", romaji: "juu", meaning: "số mười (10)" },
  { kanji: "百", hiragana: "ひゃく", romaji: "hyaku", meaning: "một trăm (100)" },
  { kanji: "千", hiragana: "せん", romaji: "sen", meaning: "một nghìn (1000)" },
  { kanji: "万", hiragana: "まん", romaji: "man", meaning: "mười nghìn (10,000)" },

  // Thời gian & Thứ ngày
  { kanji: "今日", hiragana: "きょう", romaji: "kyou", meaning: "hôm nay" },
  { kanji: "明日", hiragana: "あした", romaji: "ashita", meaning: "ngày mai" },
  { kanji: "昨日", hiragana: "きのう", romaji: "kinou", meaning: "hôm qua" },
  { kanji: "今", hiragana: "いま", romaji: "ima", meaning: "bây giờ" },
  { kanji: "朝", hiragana: "あさ", romaji: "asa", meaning: "buổi sáng" },
  { kanji: "昼", hiragana: "ひる", romaji: "hiru", meaning: "buổi trưa" },
  { kanji: "晩", hiragana: "ばん", romaji: "ban", meaning: "buổi tối" },
  { kanji: "月曜日", hiragana: "げつようび", romaji: "getsuyoubi", meaning: "thứ hai" },
  { kanji: "火曜日", hiragana: "かようび", romaji: "kayoubi", meaning: "thứ ba" },
  { kanji: "水曜日", hiragana: "すいようび", romaji: "suiyoubi", meaning: "thứ tư" },
  { kanji: "木曜日", hiragana: "もくようび", romaji: "mokuyoubi", meaning: "thứ năm" },
  { kanji: "金曜日", hiragana: "きんようび", romaji: "kinyoubi", meaning: "thứ sáu" },
  { kanji: "土曜日", hiragana: "どようび", romaji: "doyoubi", meaning: "thứ bảy" },
  { kanji: "日曜日", hiragana: "にちようび", romaji: "nichiyoubi", meaning: "chủ nhật" },

  // Tính từ
  { kanji: "大きい", hiragana: "おおきい", romaji: "ookii", meaning: "to, lớn" },
  { kanji: "小さい", hiragana: "ちいさい", romaji: "chiisai", meaning: "nhỏ, bé" },
  { kanji: "新しい", hiragana: "あたらしい", romaji: "atarashii", meaning: "mới" },
  { kanji: "古い", hiragana: "ふるい", romaji: "furui", meaning: "cũ" },
  { kanji: "良い", hiragana: "いい", romaji: "ii", meaning: "tốt, đẹp" },
  { kanji: "高い", hiragana: "たかい", romaji: "takai", meaning: "cao, đắt tiền" },
  { kanji: "安い", hiragana: "やすい", romaji: "yasui", meaning: "rẻ" },
  { kanji: "面白い", hiragana: "おもしろい", romaji: "omoshiroi", meaning: "thú vị" },
  { kanji: "美味しい", hiragana: "おいしい", romaji: "oishii", meaning: "ngon miệng" },

  // Động từ cơ bản
  { kanji: "食べます", hiragana: "たべます", romaji: "tabemasu", meaning: "ăn" },
  { kanji: "飲みます", hiragana: "のみます", romaji: "nomimasu", meaning: "uống" },
  { kanji: "見ます", hiragana: "みます", romaji: "mimasu", meaning: "xem, nhìn" },
  { kanji: "聞きます", hiragana: "ききます", romaji: "kikimasu", meaning: "nghe" },
  { kanji: "読みます", hiragana: "よみます", romaji: "yomimasu", meaning: "đọc" },
  { kanji: "書きます", hiragana: "かきます", romaji: "kakimasu", meaning: "viết" },
  { kanji: "買います", hiragana: "かいます", romaji: "kaimasu", meaning: "mua" },
  { kanji: "行きます", hiragana: "いきます", romaji: "ikimasu", meaning: "đi" },
  { kanji: "来ます", hiragana: "きます", romaji: "kimasu", meaning: "đến" },
  { kanji: "帰ります", hiragana: "かえります", romaji: "kaerimasu", meaning: "về" },
  { kanji: "寝ます", hiragana: "ねます", romaji: "nemasu", meaning: "ngủ" },
  { kanji: "起きます", hiragana: "おきます", romaji: "okimasu", meaning: "thức dậy" }
];

export const BASE_GAME_VOCAB = EXTENDED_VOCAB_BANK.slice(0, 15);

// Danh sách quái vật trong game Tiêu diệt yêu quái
export const MONSTER_ROSTER = [
  { id: "m-kappa", name: "Kappa Thủy Quái (河童)", title: "Tiểu yêu bờ sông", avatar: "🥒", hp: 40, maxHp: 40, attackPower: 15, attackName: "Phun tia nước xoáy", color: "#059669" },
  { id: "m-tengu", name: "Tengu Quạ Đỏ (天狗)", title: "Yêu quái quạt gió", avatar: "👺", hp: 60, maxHp: 60, attackPower: 20, attackName: "Cuồng phong trảm", color: "#dc2626" },
  { id: "m-kitsune", name: "Hồ Ly 9 Đuôi (九尾の狐)", title: "Yêu hồ ảo thuật", avatar: "🦊", hp: 80, maxHp: 80, attackPower: 25, attackName: "Hồ ly hỏa diễm", color: "#ea580c" },
  { id: "m-oni", name: "Quỷ Vương Dạ Xoa (鬼王 - Boss)", title: "Đại Ma Vương Lâu Đài", avatar: "👹", hp: 100, maxHp: 100, attackPower: 30, attackName: "Búa gai sấm sét", color: "#7c3aed" }
];

export const PRINCESS_TOWER_FLOORS = [
  { floor: 1, name: "Tầng 1: Cổng Thành Rêu Phong", challenge: "Giải mã chữ Hán (Kanji)", icon: "🚪" },
  { floor: 2, name: "Tầng 2: Cầu Thang Hắc Ám", challenge: "Ổ khóa Trợ từ bí ẩn (は · も · か)", icon: "🗝️" },
  { floor: 3, name: "Tầng 3: Hành Lang Ma Thuật", challenge: "Phá giải bùa chú Phủ định (じゃありません)", icon: "🛡️" },
  { floor: 4, name: "Tầng 4: Phòng Thí Nghiệm Cổ", challenge: "Sắp xếp mật mã ngôi sao ★ (文の組み立て)", icon: "⭐" },
  { floor: 5, name: "Đỉnh Tháp: Lồng Giam Công Chúa", challenge: "Đánh thức công chúa bằng câu chào hỏi hoàn chỉnh", icon: "👑" }
];

// Runtime State
let currentGameMode = "hub"; // hub | monster | princess | memory
let selectedProjectId = "all";

// Runtime Monster Game
let monsterState = null;

// Runtime 2D Mario Princess Game
let marioState = null;
let marioAnimFrame = null;
let marioKeys = { left: false, right: false, up: false, attack: false, spell: false };

// Runtime Memory Game
let memoryGridSize = "4x4"; // 3x3 | 4x4 | 5x5 | 8x8 | 12x12 | 15x15 | 20x20 | 25x25
let memoryZoom = 1;
let memoryState = null;

// ============================================================================
// 1. KHỞI TẠO SỰ KIỆN GIAO DIỆN
// ============================================================================
export function setupGameCenterUI() {
  if (typeof document === "undefined") return;
  const container = document.getElementById("game-center-view");
  if (!container) return;

  // Lắng nghe phím bàn phím cho 2D Mario Game
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if (currentGameMode !== "princess" || !marioState || marioState.isSpellPaused) return;

      if (e.code === "ArrowLeft" || e.code === "KeyA") marioKeys.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") marioKeys.right = true;
      if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") {
        marioKeys.up = true;
        e.preventDefault();
      }
      if (e.code === "KeyJ" || e.code === "KeyZ") triggerMarioNormalAttack();
      if (e.code === "KeyK" || e.code === "KeyX") triggerMarioSpecialSpell();
    });

    window.addEventListener("keyup", (e) => {
      if (currentGameMode !== "princess" || !marioState) return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") marioKeys.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") marioKeys.right = false;
      if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") marioKeys.up = false;
    });
  }

  container.addEventListener("click", (e) => {
    // 1. Mở game từ Game Hub
    const launchBtn = e.target.closest("[data-launch-game]");
    if (launchBtn) {
      const mode = launchBtn.getAttribute("data-launch-game");
      if (mode) startSpecificGame(mode);
      return;
    }

    // 2. Quay lại Game Hub
    const backBtn = e.target.closest(".btn-back-to-game-hub");
    if (backBtn) {
      cleanupMarioGame();
      currentGameMode = "hub";
      renderGameCenterView();
      return;
    }

    // 3. Game Tiêu diệt yêu quái
    const monsterAnsBtn = e.target.closest(".monster-answer-btn");
    if (monsterAnsBtn && monsterState && !monsterState.isAnswering) {
      const idx = parseInt(monsterAnsBtn.getAttribute("data-idx"), 10);
      handleMonsterAnswer(idx);
      return;
    }

    const nextMonsterBtn = e.target.closest("#next-monster-btn");
    if (nextMonsterBtn && monsterState) {
      advanceNextMonster();
      return;
    }

    const retryMonsterBtn = e.target.closest("#retry-monster-btn");
    if (retryMonsterBtn) {
      startMonsterGame();
      return;
    }

    // 4. Game Lật thẻ: Đổi kích thước bàn cờ (3x3, 4x4, 5x5, 8x8, 12x12, 15x15, 20x20, 25x25)
    const sizeBtn = e.target.closest("[data-mem-size]");
    if (sizeBtn) {
      memoryGridSize = sizeBtn.getAttribute("data-mem-size");
      startMemoryGame();
      return;
    }

    // Zoom bàn cờ thẻ nhớ
    const zoomInBtn = e.target.closest("#mem-zoom-in");
    if (zoomInBtn) {
      memoryZoom = Math.min(2, memoryZoom + 0.15);
      applyMemoryZoom();
      return;
    }
    const zoomOutBtn = e.target.closest("#mem-zoom-out");
    if (zoomOutBtn) {
      memoryZoom = Math.max(0.4, memoryZoom - 0.15);
      applyMemoryZoom();
      return;
    }
    const zoomResetBtn = e.target.closest("#mem-zoom-reset");
    if (zoomResetBtn) {
      memoryZoom = 1;
      applyMemoryZoom();
      return;
    }

    // Lật thẻ
    const memCard = e.target.closest(".memory-card");
    if (memCard && memoryState && !memoryState.isLocked) {
      const cardIdx = parseInt(memCard.getAttribute("data-card-idx"), 10);
      handleMemoryCardFlip(cardIdx);
      return;
    }

    const retryMemBtn = e.target.closest("#restart-memory-game-btn");
    if (retryMemBtn) {
      startMemoryGame();
      return;
    }

    // 5. Game Mario 2D: Nút điều khiển ảo On-screen controls
    const ctrlBtn = e.target.closest("[data-mario-ctrl]");
    if (ctrlBtn && marioState) {
      const action = ctrlBtn.getAttribute("data-mario-ctrl");
      if (action === "jump") {
        if (marioState.player.onGround) marioState.player.vy = -12;
      } else if (action === "attack") {
        triggerMarioNormalAttack();
      } else if (action === "spell") {
        triggerMarioSpecialSpell();
      }
      return;
    }

    // Câu trả lời câu hỏi Bùa chú Tuyệt Chiêu trong Mario 2D
    const spellAnsBtn = e.target.closest(".mario-spell-ans-btn");
    if (spellAnsBtn && marioState && marioState.isSpellPaused) {
      const idx = parseInt(spellAnsBtn.getAttribute("data-spell-opt-idx"), 10);
      handleMarioSpellAnswer(idx);
      return;
    }

    const retryMarioBtn = e.target.closest("#retry-mario-game-btn");
    if (retryMarioBtn) {
      startPrincessGame();
      return;
    }

    // 6. Phát âm TTS
    const audioBtn = e.target.closest(".game-tts-btn");
    if (audioBtn) {
      const text = audioBtn.getAttribute("data-tts");
      if (text) speakJapanese(text);
      return;
    }
  });

  // Nút giữ phím cảm ứng trái/phải trên màn hình
  container.addEventListener("mousedown", handleOnScreenCtrlDown);
  container.addEventListener("mouseup", handleOnScreenCtrlUp);
  container.addEventListener("touchstart", handleOnScreenCtrlDown, { passive: true });
  container.addEventListener("touchend", handleOnScreenCtrlUp, { passive: true });

  // Chọn dự án nguồn từ vựng
  container.addEventListener("change", (e) => {
    if (e.target && e.target.id === "game-project-filter") {
      selectedProjectId = e.target.value;
      if (currentGameMode === "monster") startMonsterGame();
      else if (currentGameMode === "princess") startPrincessGame();
      else if (currentGameMode === "memory") startMemoryGame();
    }
  });
}

function handleOnScreenCtrlDown(e) {
  const btn = e.target.closest("[data-mario-dir]");
  if (!btn || !marioState) return;
  const dir = btn.getAttribute("data-mario-dir");
  if (dir === "left") marioKeys.left = true;
  if (dir === "right") marioKeys.right = true;
}

function handleOnScreenCtrlUp(e) {
  const btn = e.target.closest("[data-mario-dir]");
  if (!btn || !marioState) return;
  const dir = btn.getAttribute("data-mario-dir");
  if (dir === "left") marioKeys.left = false;
  if (dir === "right") marioKeys.right = false;
}

// 2. Render View chính
export function renderGameCenterView() {
  if (typeof document === "undefined") return;
  const container = document.getElementById("game-center-view");
  if (!container) return;

  if (currentGameMode === "monster") {
    container.innerHTML = renderMonsterGameHtml();
  } else if (currentGameMode === "princess") {
    container.innerHTML = renderPrincessGameHtml();
    initMarioCanvasGame();
  } else if (currentGameMode === "memory") {
    container.innerHTML = renderMemoryGameHtml();
    applyMemoryZoom();
  } else {
    container.innerHTML = renderGameHubHtml();
  }
}

// ============================================================================
// GAME HUB (TRUNG TÂM TRÒ CHƠI)
// ============================================================================
function renderGameHubHtml() {
  const profile = getGameProfile();
  const projects = getProjects() || [];
  const pool = extractVocabForGame(selectedProjectId);

  return `
    <div class="game-hub-container">
      <div class="game-hub-hero glass-panel">
        <div class="game-hero-content">
          <div class="game-title-row">
            <span class="game-badge-arcade">ARCADE 2D LEARNING</span>
            <span class="game-level-tag">🏆 Cấp độ: Hiệp Sĩ Cấp ${profile.level || 1}</span>
          </div>
          <h2 class="game-hero-h2">Đấu Trường Trò Chơi Tiếng Nhật (ゲーム)</h2>
          <p class="game-hero-sub">
            Vừa chơi vừa học! Vượt ải Platformer 2D phong cách Mario, quyết chiến yêu quái và thách thức trí nhớ siêu đẳng với bàn cờ lên tới 25x25.
          </p>

          <div class="knight-stats-bar">
            <div class="knight-stat-pill"><span class="k-icon">⭐</span><span>Tổng EXP: <strong>${profile.exp || 0}</strong></span></div>
            <div class="knight-stat-pill"><span class="k-icon">⚔️</span><span>Yêu quái đã diệt: <strong>${profile.monstersDefeated || 0}</strong></span></div>
            <div class="knight-stat-pill"><span class="k-icon">👑</span><span>Công chúa đã cứu: <strong>${profile.princessRescued || 0}</strong></span></div>
            <div class="knight-stat-pill"><span class="k-icon">🎴</span><span>Lật thẻ hoàn hảo: <strong>${profile.memoryWins || 0}</strong></span></div>
          </div>
        </div>

        <div class="game-vocab-source-panel">
          <label for="game-project-filter" class="source-label"><span>🎯 Nguồn từ vựng thi đấu:</span></label>
          <select id="game-project-filter" class="form-control game-select">
            <option value="all" ${selectedProjectId === 'all' ? 'selected' : ''}>Tất cả dự án (${pool.length} từ vựng sẵn sàng)</option>
            ${projects.map(p => `<option value="${p.id}" ${selectedProjectId === p.id ? 'selected' : ''}>📁 ${p.name} (${(p.vocab || []).length} từ)</option>`).join("")}
          </select>
          <small class="source-hint">Tự động tích hợp kho từ vựng cá nhân và ngữ pháp N5 vào các màn chơi!</small>
        </div>
      </div>

      <div class="game-cards-catalog">
        <!-- Game 2: Mario 2D Giải Cứu Công Chúa -->
        <div class="game-card-banner card-princess-theme glass-panel">
          <div class="card-art-col">
            <div class="art-badge">🎮 MARIO 2D ACTION</div>
            <div class="mario-preview-icons">
              <span class="m-avatar">🤺</span>
              <span class="m-arrow">➔</span>
              <span class="m-mob">👾</span>
              <span class="m-coin">🪙</span>
              <span class="m-castle">🏰</span>
              <span class="m-princess">👸</span>
            </div>
          </div>
          <div class="card-details-col">
            <h3 class="card-game-title">Giải Cứu Công Chúa (Mario 2D Adventure - スーパー・プリンセス)</h3>
            <p class="card-game-desc">
              Game 2D hành động đỉnh cao y hệt Mario! Di chuyển hiệp sĩ chạy nhảy trên các khối gạch, dậm đầu quái vật rơi vàng 🪙, chém kiếm thường và 
              dùng <strong>Tuyệt chiêu Hỏa Long Trảm</strong> bằng cách giải mã bùa chú tiếng Nhật để giải cứu công chúa ở Lâu Đài cuối map!
            </p>
            <div class="card-tags-row">
              <span class="gtag">Bản đồ 2D cuộn ngang</span>
              <span class="gtag">Đánh thường & Tuyệt chiêu tiếng Nhật</span>
              <span class="gtag">Dậm quái rơi tiền vàng 🪙</span>
              <span class="gtag">Khối dấu hỏi \`?\` bí ẩn</span>
            </div>
            <div class="card-action-row">
              <button type="button" class="btn btn-primary btn-game-play btn-princess" data-launch-game="princess">
                👑 Khởi Hành Phiêu Lưu Mario 2D
              </button>
            </div>
          </div>
        </div>

        <!-- Game 3: Lật Thẻ Trí Nhớ Ma Thuật (Tùy chọn 3x3 đến 25x25) -->
        <div class="game-card-banner card-memory-theme glass-panel">
          <div class="card-art-col">
            <div class="art-badge">🎴 SIÊU TRÍ NHỚ VŨ TRỤ</div>
            <div class="memory-grid-size-badges">
              <span>3x3</span><span>5x5</span><span>8x8</span><span>12x12</span><span>15x15</span><span>20x20</span><span class="boss-size">25x25</span>
            </div>
          </div>
          <div class="card-details-col">
            <h3 class="card-game-title">Lật Thẻ Trí Nhớ Ma Thuật (Memory Match - 魔法のカード)</h3>
            <p class="card-game-desc">
              Chơi cực chất với đa dạng kích thước bàn cờ: <strong>3x3, 5x5, 8x8, 12x12, 15x15, 20x20 đến 25x25 (625 thẻ!)</strong>. 
              Hiệu ứng xoay lật 3D, ô Sao May Mắn ⭐ và giọng đọc phát âm chuẩn từng từ.
            </p>
            <div class="card-tags-row">
              <span class="gtag">Tùy chọn 8 kích thước từ 3x3 đến 25x25</span>
              <span class="gtag">Ô Sao May Mắn ⭐</span>
              <span class="gtag">Công cụ Phóng to / Thu nhỏ Zoom bàn cờ</span>
            </div>
            <div class="card-action-row">
              <button type="button" class="btn btn-primary btn-game-play btn-memory" data-launch-game="memory">
                🎴 Thách Thức Bàn Cờ Lật Thẻ
              </button>
            </div>
          </div>
        </div>

        <!-- Game 1: Tiêu Diệt Yêu Quái -->
        <div class="game-card-banner card-monster-theme glass-panel">
          <div class="card-art-col">
            <div class="art-badge">⚔️ HÀNH ĐỘNG CHIẾN ĐẤU</div>
            <div class="art-avatars-row">
              <span>🥒</span><span>👺</span><span>🦊</span><span class="boss-glow">👹</span>
            </div>
          </div>
          <div class="card-details-col">
            <h3 class="card-game-title">Tiêu Diệt Yêu Quái (妖怪討伐 - Youkai Slayer)</h3>
            <p class="card-game-desc">
              Đấu trường theo lượt kịch tính! Vận dụng kiến thức từ vựng và ngữ pháp N5 để chém kiếm, kích hoạt sấm sét hạ gục 4 đại yêu quái.
            </p>
            <div class="card-tags-row">
              <span class="gtag">Đấu Boss theo lượt</span>
              <span class="gtag">Thanh máu HP & Combo</span>
              <span class="gtag">Âm thanh tiếng Nhật</span>
            </div>
            <div class="card-action-row">
              <button type="button" class="btn btn-primary btn-game-play" data-launch-game="monster">
                ⚔️ Xuất Kích Tiêu Diệt Quái Vật
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// GAME 2: MARIO 2D PLATFORMER - GIẢI CỨU CÔNG CHÚA
// ============================================================================
function startPrincessGame() {
  cleanupMarioGame();
  currentGameMode = "princess";

  marioState = {
    canvasWidth: 840,
    canvasHeight: 460,
    worldWidth: 2600,
    cameraX: 0,
    animTick: 0,
    sakuraPetals: Array.from({ length: 28 }, () => ({
      x: Math.random() * 2600,
      y: Math.random() * 460,
      speedX: 0.8 + Math.random() * 1.0,
      speedY: 0.5 + Math.random() * 0.8,
      size: 4 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    })),
    player: {
      x: 80,
      y: 320,
      w: 36,
      h: 50,
      width: 36,
      height: 50,
      vx: 0,
      vy: 0,
      speed: 5.2,
      jumpForce: -13,
      onGround: false,
      facing: "right",
      animTimer: 0,
      runFrame: 0,
      isAttacking: false,
      attackTimer: 0,
      hp: 3,
      maxHp: 3,
      coins: 0,
      score: 0,
      attackCooldown: 0,
      isInvincible: false,
      invincibleTimer: 0,
      slashArc: null
    },
    blocks: [
      { x: 0, y: 390, w: 750, h: 70, type: "ground" },
      { x: 860, y: 390, w: 700, h: 70, type: "ground" },
      { x: 1680, y: 390, w: 920, h: 70, type: "ground" },
      { x: 220, y: 280, w: 40, h: 40, type: "brick" },
      { x: 260, y: 280, w: 40, h: 40, type: "question", hit: false, content: "coin", bounceY: 0 },
      { x: 300, y: 280, w: 40, h: 40, type: "brick" },
      { x: 480, y: 220, w: 80, h: 30, type: "brick" },
      { x: 600, y: 280, w: 40, h: 40, type: "question", hit: false, content: "spell", bounceY: 0 },
      { x: 940, y: 270, w: 40, h: 40, type: "question", hit: false, content: "coin", bounceY: 0 },
      { x: 980, y: 270, w: 80, h: 30, type: "brick" },
      { x: 1060, y: 270, w: 40, h: 40, type: "question", hit: false, content: "spell", bounceY: 0 },
      { x: 1250, y: 210, w: 100, h: 30, type: "brick" },
      { x: 1420, y: 260, w: 40, h: 40, type: "brick" },
      { x: 1780, y: 280, w: 40, h: 40, type: "question", hit: false, content: "heart", bounceY: 0 },
      { x: 1820, y: 280, w: 80, h: 30, type: "brick" }
    ],
    enemies: [
      { id: "e1", x: 420, y: 350, w: 34, h: 34, vx: -1.4, alive: true, type: "slime", minX: 300, maxX: 650 },
      { id: "e2", x: 620, y: 350, w: 36, h: 38, vx: 1.6, alive: true, type: "oni", minX: 520, maxX: 720 },
      { id: "e3", x: 1100, y: 350, w: 34, h: 34, vx: -1.8, alive: true, type: "slime", minX: 900, maxX: 1300 },
      { id: "e4", x: 1350, y: 350, w: 36, h: 38, vx: 1.5, alive: true, type: "oni", minX: 1200, maxX: 1520 },
      { id: "e5", x: 1850, y: 350, w: 36, h: 38, vx: -2.0, alive: true, type: "oni", minX: 1720, maxX: 2050 },
      { id: "e6", x: 2150, y: 345, w: 40, h: 42, vx: -1.2, alive: true, type: "tengu", minX: 2000, maxX: 2280 }
    ],
    coins: [],
    particles: [],
    castle: { x: 2320, y: 150, w: 220, h: 240 },
    princess: { x: 2400, y: 210, w: 36, h: 54, rescued: false },
    specialDragon: null,
    isSpellPaused: false,
    currentSpellQuestion: null,
    gameOver: false,
    victory: false
  };

  renderGameCenterView();
}

function cleanupMarioGame() {
  if (typeof cancelAnimationFrame !== "undefined" && marioAnimFrame) {
    cancelAnimationFrame(marioAnimFrame);
    marioAnimFrame = null;
  }
}

function initMarioCanvasGame() {
  if (typeof document === "undefined") return;
  const canvas = document.getElementById("mario-canvas");
  if (!canvas || !marioState) return;
  const ctx = canvas.getContext("2d");

  function loop() {
    if (!marioState) return;
    updateMarioPhysics();
    renderMarioCanvas(ctx);
    if (!marioState.gameOver && !marioState.victory) {
      marioAnimFrame = requestAnimationFrame(loop);
    }
  }

  cleanupMarioGame();
  marioAnimFrame = requestAnimationFrame(loop);
}

function updateMarioPhysics() {
  if (!marioState || marioState.isSpellPaused || marioState.gameOver || marioState.victory) return;

  marioState.animTick = (marioState.animTick || 0) + 1;
  const p = marioState.player;
  p.animTimer = (p.animTimer || 0) + 1;

  // Sakura petals drift
  if (marioState.sakuraPetals) {
    marioState.sakuraPetals.forEach(sp => {
      sp.x += sp.speedX;
      sp.y += sp.speedY;
      sp.angle += sp.rotationSpeed;
      if (sp.y > marioState.canvasHeight + 10) {
        sp.y = -10;
        sp.x = marioState.cameraX + Math.random() * marioState.canvasWidth;
      }
    });
  }

  // Question blocks bounce return
  marioState.blocks.forEach(b => {
    if (b.bounceY && b.bounceY < 0) {
      b.bounceY += 1;
      if (b.bounceY > 0) b.bounceY = 0;
    }
  });

  // Di chuyển ngang
  if (marioKeys.left) {
    p.vx = -p.speed;
    p.facing = "left";
    p.runFrame += 0.25;
  } else if (marioKeys.right) {
    p.vx = p.speed;
    p.facing = "right";
    p.runFrame += 0.25;
  } else {
    p.vx *= 0.75;
    if (Math.abs(p.vx) < 0.1) p.vx = 0;
    p.runFrame = 0;
  }

  // Nhảy
  if (marioKeys.up && p.onGround) {
    p.vy = p.jumpForce;
    p.onGround = false;
  }

  // Trọng lực
  p.vy += 0.58;
  if (p.vy > 14) p.vy = 14;

  p.x += p.vx;
  if (p.x < 10) p.x = 10;
  checkPlayerHorizontalCollisions();

  p.y += p.vy;
  p.onGround = false;
  checkPlayerVerticalCollisions();

  // Rơi vực thẳm
  if (p.y > marioState.canvasHeight + 40) {
    p.hp -= 1;
    if (p.hp <= 0) {
      marioState.gameOver = true;
      renderGameCenterView();
      return;
    } else {
      // Hồi sinh an toàn tại khối đất gần nhất bên trái
      const safeBlock = marioState.blocks.find(b => b.type === "ground" && b.x <= p.x && b.x + b.w >= p.x)
        || marioState.blocks[0];
      p.x = Math.max(safeBlock.x + 20, p.x - 120);
      p.y = safeBlock.y - p.h;
      p.vy = 0;
      p.isInvincible = true;
      p.invincibleTimer = 90;
      spawnFloatingText("⚠️ RƠI VỰC! -1 ❤️", p.x, p.y - 30, "#ef4444");
    }
  }

  // Camera cuộn mượt mà theo nhân vật
  const targetCamX = p.x - marioState.canvasWidth * 0.38;
  marioState.cameraX += (targetCamX - marioState.cameraX) * 0.12;
  if (marioState.cameraX < 0) marioState.cameraX = 0;
  const maxCamX = marioState.worldWidth - marioState.canvasWidth;
  if (marioState.cameraX > maxCamX) marioState.cameraX = maxCamX;

  // Thời gian bất tử sau khi dính đòn
  if (p.isInvincible) {
    p.invincibleTimer -= 1;
    if (p.invincibleTimer <= 0) p.isInvincible = false;
  }

  // Thời gian chém kiếm thường
  if (p.slashArc) {
    p.slashArc.timer -= 1;
    if (p.slashArc.timer <= 0) {
      p.slashArc = null;
      p.isAttacking = false;
      p.attackTimer = 0;
    }
  }

  // Tuyệt chiêu Hỏa Long Trảm quét màn hình
  if (marioState.specialDragon) {
    const dragon = marioState.specialDragon;
    dragon.x += 18;
    marioState.enemies.forEach(e => {
      if (e.alive && Math.abs(e.x - dragon.x) < 85) {
        killEnemy(e, true);
      }
    });
    if (dragon.x > marioState.cameraX + marioState.canvasWidth + 250) {
      marioState.specialDragon = null;
    }
  }

  // Quái vật tuần tra & va chạm
  marioState.enemies.forEach(e => {
    if (!e.alive) return;
    e.x += e.vx;
    if (e.x < e.minX || e.x > e.maxX) e.vx *= -1;

    if (checkAABB(p.x, p.y, p.w, p.h, e.x, e.y, e.w, e.h)) {
      // Đạp lên đầu quái vật (Stomp)
      if (p.vy > 0 && p.y + p.h - p.vy <= e.y + 18) {
        killEnemy(e, false);
        p.vy = -11; // Bật nảy lên cao
        p.score += 150;
        spawnFloatingText("💥 ĐẠP QUÁI! +150", e.x, e.y - 20, "#fbbf24");
      } else if (!p.isInvincible) {
        // Bị quái vật cắn trúng
        p.hp -= 1;
        p.isInvincible = true;
        p.invincibleTimer = 90;
        p.vx = (p.x < e.x ? -6 : 6);
        p.vy = -6;
        spawnFloatingText("💔 -1 TIM", p.x, p.y - 25, "#ef4444");
        if (p.hp <= 0) {
          marioState.gameOver = true;
          renderGameCenterView();
        }
      }
    }
  });

  // Đồng xu vàng rơi
  marioState.coins.forEach(c => {
    c.x += c.vx;
    c.y += c.vy;
    c.vy += 0.45;
    c.rotation = (c.rotation || 0) + 0.15;
    if (c.y > 380) {
      c.y = 380;
      c.vy *= -0.4;
      c.vx *= 0.8;
    }

    if (!c.collected && Math.hypot(p.x + p.w / 2 - c.x, p.y + p.h / 2 - c.y) < 32) {
      c.collected = true;
      p.coins += 1;
      p.score += 50;
      spawnFloatingText("🪙 +50", c.x, c.y - 10, "#fbbf24");
    }
  });
  marioState.coins = marioState.coins.filter(c => !c.collected);

  // Hiệu ứng hạt chữ bay
  marioState.particles.forEach(pt => {
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.alpha -= 0.025;
  });
  marioState.particles = marioState.particles.filter(pt => pt.alpha > 0);

  // Đến Lâu Đài và giải cứu Công Chúa
  if (p.x >= marioState.castle.x + 40 && !marioState.princess.rescued) {
    marioState.princess.rescued = true;
    marioState.victory = true;
    addGameExp(300);
    recordPrincessRescued();
    renderGameCenterView();
  }
}

function checkPlayerHorizontalCollisions() {
  const p = marioState.player;
  marioState.blocks.forEach(b => {
    const blockY = b.y + (b.bounceY || 0);
    if (checkAABB(p.x, p.y, p.w, p.h, b.x, blockY, b.w, b.h)) {
      if (p.vx > 0) p.x = b.x - p.w;
      else if (p.vx < 0) p.x = b.x + b.w;
    }
  });
}

function checkPlayerVerticalCollisions() {
  const p = marioState.player;
  marioState.blocks.forEach(b => {
    const blockY = b.y + (b.bounceY || 0);
    if (checkAABB(p.x, p.y, p.w, p.h, b.x, blockY, b.w, b.h)) {
      if (p.vy > 0) {
        p.y = blockY - p.h;
        p.vy = 0;
        p.onGround = true;
      } else if (p.vy < 0) {
        p.y = blockY + b.h;
        p.vy = 1;
        if (b.type === "question" && !b.hit) {
          b.hit = true;
          b.bounceY = -10;
          handleQuestionBlockHit(b);
        }
      }
    }
  });
}

function handleQuestionBlockHit(b) {
  if (b.content === "coin") {
    marioState.player.coins += 1;
    marioState.player.score += 100;
    spawnCoinBurst(b.x + b.w / 2, b.y - 10, 2);
    spawnFloatingText("🪙 CHÍNH XÁC!", b.x, b.y - 20, "#fbbf24");
  } else if (b.content === "heart") {
    marioState.player.hp = Math.min(marioState.player.maxHp, marioState.player.hp + 1);
    spawnFloatingText("❤️ HỒI MÁU!", b.x, b.y - 20, "#ef4444");
  } else if (b.content === "spell") {
    triggerMarioSpecialSpell(true);
  }
}

function triggerMarioNormalAttack() {
  if (!marioState || marioState.isSpellPaused || marioState.gameOver || marioState.victory) return;
  const p = marioState.player;
  p.isAttacking = true;
  p.attackTimer = 14;
  const attackX = p.facing === "right" ? p.x + p.w : p.x - 45;
  p.slashArc = { x: attackX, y: p.y + p.h / 2, radius: 48, timer: 14 };

  marioState.enemies.forEach(e => {
    if (e.alive && Math.hypot(attackX - (e.x + e.w / 2), (p.y + p.h / 2) - (e.y + e.h / 2)) < 65) {
      killEnemy(e, false);
      p.score += 120;
      spawnFloatingText("⚔️ TRẢM KIẾM! +120", e.x, e.y - 20, "#38bdf8");
    }
  });
}

function triggerMarioSpecialSpell(isLuckyBlock = false) {
  if (!marioState || marioState.isSpellPaused) return;

  const vocabList = extractVocabForGame(selectedProjectId);
  const q = generateBattleQuestion(vocabList, 1);
  marioState.isSpellPaused = true;
  marioState.currentSpellQuestion = {
    ...q,
    isLuckyBlock,
    title: isLuckyBlock ? "✨ BÙA CHÚ MAY MẮN TỪ KHỐI `?`" : "⚡ KÍCH HOẠT HỎA LONG TRẢM (火竜斬り)"
  };

  renderGameCenterView();
}

function handleMarioSpellAnswer(selectedIdx) {
  if (!marioState || !marioState.currentSpellQuestion) return;
  const q = marioState.currentSpellQuestion;
  const isCorrect = selectedIdx === q.correct;

  marioState.isSpellPaused = false;
  marioState.currentSpellQuestion = null;

  if (isCorrect) {
    marioState.specialDragon = {
      x: marioState.player.x,
      y: marioState.player.y - 20
    };
    marioState.player.score += 300;
    marioState.player.coins += 5;
    spawnFloatingText("🔥 HỎA LONG TRẢM QUÉT SẠCH QUÁI!", marioState.player.x, marioState.player.y - 40, "#f97316");
    addGameExp(50);
  } else {
    marioState.player.hp -= 1;
    spawnFloatingText("❌ BÙA CHÚ PHẢN PHỆ -1 HP!", marioState.player.x, marioState.player.y - 30, "#ef4444");
    if (marioState.player.hp <= 0) {
      marioState.gameOver = true;
    }
  }

  renderGameCenterView();
  initMarioCanvasGame();
}

function killEnemy(enemy, isInstantVaporize = false) {
  enemy.alive = false;
  spawnCoinBurst(enemy.x + enemy.w / 2, enemy.y, 3);
  spawnFloatingText(isInstantVaporize ? "⚡ THIÊU RỤI! +100" : "🎯 ĐÃ DIỆT! +100", enemy.x, enemy.y - 15, "#10b981");
  recordMonsterDefeated();
}

function spawnCoinBurst(x, y, count = 3) {
  if (!marioState) return;
  for (let i = 0; i < count; i++) {
    marioState.coins.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: -6 - Math.random() * 4,
      collected: false,
      rotation: Math.random() * Math.PI * 2
    });
  }
}

function spawnFloatingText(text, x, y, color = "#fff") {
  if (!marioState) return;
  marioState.particles.push({
    text,
    x,
    y,
    vx: 0,
    vy: -1.2,
    color,
    alpha: 1
  });
}

function checkAABB(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function renderMarioCanvas(ctx) {
  if (!marioState) return;
  const cw = marioState.canvasWidth;
  const ch = marioState.canvasHeight;
  const camX = marioState.cameraX;
  const p = marioState.player;
  const tick = marioState.animTick || 0;

  ctx.clearRect(0, 0, cw, ch);

  // 1. Sky Gradient (Bầu trời bình minh Nhật Bản tươi sáng)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
  skyGrad.addColorStop(0, "#38bdf8");
  skyGrad.addColorStop(0.55, "#7dd3fc");
  skyGrad.addColorStop(0.85, "#fef08a");
  skyGrad.addColorStop(1, "#fed7aa");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, cw, ch);

  // Vầng dương mặt trời tỏa sáng nhẹ
  const sunGrad = ctx.createRadialGradient(cw * 0.22, 100, 10, cw * 0.22, 100, 75);
  sunGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  sunGrad.addColorStop(0.3, "rgba(254, 240, 138, 0.7)");
  sunGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(cw * 0.22, 100, 75, 0, Math.PI * 2);
  ctx.fill();

  // Núi Phú Sĩ tuyết trắng ở hậu cảnh xa (Mount Fuji)
  const fujiX = cw * 0.68 - camX * 0.05;
  ctx.fillStyle = "#6366f1";
  ctx.beginPath();
  ctx.moveTo(fujiX - 160, 370);
  ctx.lineTo(fujiX, 140);
  ctx.lineTo(fujiX + 160, 370);
  ctx.closePath();
  ctx.fill();

  // Mũ tuyết trắng Phú Sĩ
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(fujiX - 42, 195);
  ctx.lineTo(fujiX, 140);
  ctx.lineTo(fujiX + 42, 195);
  ctx.lineTo(fujiX + 24, 210);
  ctx.lineTo(fujiX + 8, 202);
  ctx.lineTo(fujiX - 10, 212);
  ctx.lineTo(fujiX - 26, 204);
  ctx.closePath();
  ctx.fill();

  // Cổng Torii đền thần thoại ở xa
  const toriiX = 360 - camX * 0.15;
  if (toriiX > -60 && toriiX < cw + 60) {
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(toriiX - 24, 250, 48, 5);
    ctx.fillRect(toriiX - 20, 257, 40, 4);
    ctx.fillRect(toriiX - 15, 255, 4, 75);
    ctx.fillRect(toriiX + 11, 255, 4, 75);
  }

  // Mây trôi bồng bềnh (Clouds)
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  const cloudOffset = (camX * 0.25) % 450;
  drawCloud(ctx, 110 - cloudOffset, 70, 46);
  drawCloud(ctx, 360 - cloudOffset, 90, 56);
  drawCloud(ctx, 620 - cloudOffset, 65, 42);
  drawCloud(ctx, 880 - cloudOffset, 80, 50);

  // Đồi núi xanh tầng trung (Mid-ground green hills)
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.moveTo(0, ch);
  for (let x = 0; x <= cw; x += 60) {
    const hillY = 325 + Math.sin((x + camX * 0.35) * 0.012) * 32;
    ctx.lineTo(x, hillY);
  }
  ctx.lineTo(cw, ch);
  ctx.fill();

  // Cánh hoa anh đào Sakura bay lượn trong gió
  if (marioState.sakuraPetals) {
    marioState.sakuraPetals.forEach(sp => {
      const renderX = sp.x - camX * 0.65;
      if (renderX < -20 || renderX > cw + 20) return;
      ctx.save();
      ctx.translate(renderX, sp.y);
      ctx.rotate(sp.angle);
      ctx.fillStyle = "rgba(244, 114, 182, 0.78)";
      ctx.beginPath();
      ctx.ellipse(0, 0, sp.size, sp.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // Bắt đầu vẽ đối tượng trong thế giới theo tọa độ camera
  ctx.save();
  ctx.translate(-camX, 0);

  // Lâu đài và Công chúa
  drawCastle(ctx, marioState.castle.x, marioState.castle.y, marioState.castle.w, marioState.castle.h);
  drawPrincess(ctx, marioState.princess.x, marioState.princess.y, marioState.princess.rescued, tick);

  // Địa hình & Khối gạch
  marioState.blocks.forEach(b => {
    if (b.type === "ground") {
      // Mặt đất cỏ xanh sống động
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(b.x, b.y, b.w, 14);

      // Chi tiết sợi cỏ xanh
      ctx.fillStyle = "#22c55e";
      for (let gx = b.x; gx < b.x + b.w; gx += 16) {
        ctx.beginPath();
        ctx.moveTo(gx, b.y);
        ctx.lineTo(gx + 3, b.y - 4);
        ctx.lineTo(gx + 6, b.y);
        ctx.fill();
      }

      // Đất trầm tích nhiều lớp
      ctx.fillStyle = "#78350f";
      ctx.fillRect(b.x, b.y + 14, b.w, b.h - 14);

      // Đá sỏi dưới lòng đất
      ctx.fillStyle = "#92400e";
      for (let gx = b.x; gx < b.x + b.w; gx += 32) {
        ctx.fillRect(gx + 8, b.y + 24, 14, 8);
        ctx.fillRect(gx + 18, b.y + 42, 10, 6);
      }
    } else if (b.type === "brick") {
      // Khối gạch đá cổ đền đài 3D
      ctx.fillStyle = "#b45309";
      ctx.fillRect(b.x, b.y, b.w, b.h);

      ctx.fillStyle = "#d97706";
      ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);

      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      // Đường viền chia gạch
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.h / 2);
      ctx.lineTo(b.x + b.w, b.y + b.h / 2);
      ctx.stroke();
    } else if (b.type === "question") {
      drawQuestionBlock(ctx, b, tick);
    }
  });

  // Đồng xu vàng 3D lơ lửng & nổ rơi
  marioState.coins.forEach(c => {
    ctx.save();
    ctx.translate(c.x, c.y);
    const scaleX = Math.abs(Math.cos(c.rotation || 0)) * 0.7 + 0.3;
    ctx.scale(scaleX, 1);

    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d97706";
    ctx.fillRect(-2, -2, 4, 4);

    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  });

  // Quái vật
  marioState.enemies.forEach(e => {
    if (!e.alive) return;
    drawEnemy(ctx, e, tick);
  });

  // Hiệp Sĩ (Hero Knight)
  if (!p.isInvincible || Math.floor(p.invincibleTimer / 4) % 2 === 0) {
    drawKnight(ctx, p, tick);
  }

  // Đường chém kiếm ánh sáng (Slash Arc)
  if (p.slashArc) {
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.slashArc.x, p.slashArc.y, p.slashArc.radius, -0.7, 0.7, p.facing === "left");
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Hỏa Long Trảm
  if (marioState.specialDragon) {
    drawFireDragon(ctx, marioState.specialDragon.x, marioState.specialDragon.y, tick);
  }

  // Chữ nổi thông báo (Floating Texts)
  marioState.particles.forEach(pt => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.alpha);
    ctx.fillStyle = pt.color;
    ctx.font = "bold 15px var(--font-display, sans-serif)";
    ctx.textAlign = "center";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.fillText(pt.text, pt.x, pt.y);
    ctx.restore();
  });

  ctx.restore();

  // 3. In-Game HUD Bar (Kính mờ hiện đại & trực quan)
  drawMarioHUD(ctx, p, marioState);
}

function drawCloud(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
  ctx.arc(x + r * 0.4, y - r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x + r * 0.9, y, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawKnight(ctx, p, animTick) {
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  if (p.facing === "left") ctx.scale(-1, 1);

  // 1. Áo choàng đỏ anh hùng bay lượn theo gió
  const capeWave = Math.sin(animTick * 0.25) * (p.onGround ? 6 : 14);
  const capeSpeedOffset = (Math.abs(p.vx) > 0.5 ? -14 : -6);
  ctx.fillStyle = "#b91c1c";
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.quadraticCurveTo(-18 + capeSpeedOffset, 8 + capeWave, -22 + capeSpeedOffset, 20 + capeWave);
  ctx.lineTo(-12 + capeSpeedOffset, 24 + capeWave);
  ctx.quadraticCurveTo(-10, 8, -2, -6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.quadraticCurveTo(-14 + capeSpeedOffset, 6 + capeWave, -18 + capeSpeedOffset, 18 + capeWave);
  ctx.lineTo(-10 + capeSpeedOffset, 20 + capeWave);
  ctx.quadraticCurveTo(-8, 6, 0, -4);
  ctx.closePath();
  ctx.fill();

  // 2. Chân & Giày giáp (Chu kỳ chạy chuyển động mượt mà)
  const legCycle = p.onGround ? Math.sin(p.runFrame || 0) * 8 : 4;
  ctx.fillStyle = "#334155";
  ctx.fillRect(-10, 14, 7, 10 + (p.onGround ? -legCycle : 0));
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(-12, 22 + (p.onGround ? -legCycle : 0), 10, 4);

  ctx.fillStyle = "#475569";
  ctx.fillRect(3, 14, 7, 10 + (p.onGround ? legCycle : 0));
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(1, 22 + (p.onGround ? legCycle : 0), 10, 4);

  // 3. Thân & Áo giáp hiệp sĩ
  ctx.fillStyle = "#1e3a8a"; // Áo chẽn xanh hoàng gia
  ctx.fillRect(-11, -10, 22, 25);

  ctx.fillStyle = "#94a3b8"; // Tấm giáp ngực bạc
  ctx.fillRect(-9, -8, 18, 20);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(-7, -6, 6, 16);

  // Huy hiệu hoàng kim giữa ngực
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(4, 2);
  ctx.lineTo(0, 8);
  ctx.lineTo(-4, 2);
  ctx.closePath();
  ctx.fill();

  // Thắt lưng da & khóa vàng
  ctx.fillStyle = "#d97706";
  ctx.fillRect(-9, 10, 18, 4);
  ctx.fillStyle = "#fef08a";
  ctx.fillRect(-3, 9, 6, 6);

  // 4. Mũ sắt & Mặt nạ hiệp sĩ
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.arc(0, -15, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.arc(-2, -16, 10, 0, Math.PI * 2);
  ctx.fill();

  // Khe mắt phát sáng xanh lam
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(1, -17, 10, 4);
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(3, -16, 7, 2);

  // Lông vũ hoàng kim trên đỉnh nón giáp
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(-4, -26);
  ctx.quadraticCurveTo(-14, -30, -18, -20);
  ctx.quadraticCurveTo(-8, -22, -2, -24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(-2, -25);
  ctx.quadraticCurveTo(-10, -28, -14, -20);
  ctx.quadraticCurveTo(-6, -21, 0, -23);
  ctx.closePath();
  ctx.fill();

  // 5. Thanh kiếm Katana trong tay
  if (p.isAttacking) {
    ctx.save();
    ctx.rotate(0.5);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(12, 2, 4, 10);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(14, 5, 26, 4);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(16, 6, 22, 2);
    ctx.restore();
  } else {
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(8, -2, 4, 8);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(10, 0, 18, 4);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(11, 1, 16, 2);
  }

  ctx.restore();
}

function drawEnemy(ctx, e, animTick) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  const facingLeft = e.vx < 0;
  if (!facingLeft) ctx.scale(-1, 1);

  const bob = Math.sin(animTick * 0.2 + (e.id.charCodeAt(1) || 0)) * 2;

  if (e.type === "slime") {
    // Kappa (🥒) - Yêu quái sông nước đáng yêu
    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.ellipse(0, 3 + bob, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.ellipse(-2, 1 + bob, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mai rùa trên lưng
    ctx.fillStyle = "#92400e";
    ctx.beginPath();
    ctx.ellipse(-12, 3 + bob, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Đĩa nước trên đỉnh đầu
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.ellipse(0, -10 + bob, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0284c7";
    ctx.beginPath();
    ctx.ellipse(0, -10 + bob, 8, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Đôi mắt to tròn
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(3, -2 + bob, 5, 0, Math.PI * 2);
    ctx.arc(11, -2 + bob, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(5, -2 + bob, 2.5, 0, Math.PI * 2);
    ctx.arc(12, -2 + bob, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Mỏ vịt vàng
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(6, 4 + bob);
    ctx.lineTo(14, 4 + bob);
    ctx.lineTo(8, 8 + bob);
    ctx.closePath();
    ctx.fill();
  } else if (e.type === "oni") {
    // Aka-Oni (👹) - Đại Quỷ Đỏ hung tợn
    ctx.fillStyle = "#b91c1c";
    ctx.beginPath();
    ctx.roundRect(-16, -14 + bob, 32, 32, 8);
    ctx.fill();

    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.roundRect(-14, -12 + bob, 28, 28, 6);
    ctx.fill();

    // Đôi sừng nhọn ngà voi
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.moveTo(-10, -12 + bob);
    ctx.lineTo(-14, -26 + bob);
    ctx.lineTo(-5, -14 + bob);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(5, -14 + bob);
    ctx.lineTo(14, -26 + bob);
    ctx.lineTo(10, -12 + bob);
    ctx.closePath();
    ctx.fill();

    // Đôi mắt vàng phát sáng
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(-5, -3 + bob, 4, 0, Math.PI * 2);
    ctx.arc(7, -3 + bob, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.arc(-4, -3 + bob, 2, 0, Math.PI * 2);
    ctx.arc(8, -3 + bob, 2, 0, Math.PI * 2);
    ctx.fill();

    // Hàm răng nanh sắc nhọn
    ctx.fillStyle = "#450a0a";
    ctx.fillRect(-7, 6 + bob, 16, 5);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(-5, 11 + bob);
    ctx.lineTo(-3, 6 + bob);
    ctx.lineTo(-1, 11 + bob);
    ctx.moveTo(3, 11 + bob);
    ctx.lineTo(5, 6 + bob);
    ctx.lineTo(7, 11 + bob);
    ctx.fill();

    // Khố da hổ
    ctx.fillStyle = "#d97706";
    ctx.fillRect(-14, 15 + bob, 28, 6);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-10, 16 + bob, 4, 5);
    ctx.fillRect(4, 16 + bob, 4, 5);

    // Chuỳ sắt Kanabō có gai
    ctx.fillStyle = "#334155";
    ctx.fillRect(15, -16 + bob, 6, 26);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(14, -14 + bob, 8, 3);
    ctx.fillRect(14, -8 + bob, 8, 3);
  } else {
    // Karasu-Tengu (👺) - Thiên Cẩu sải cánh
    const wingAngle = Math.sin(animTick * 0.3) * 0.35;
    ctx.fillStyle = "#1e293b";
    ctx.save();
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.ellipse(-14, -2 + bob, 14, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(-wingAngle);
    ctx.beginPath();
    ctx.ellipse(14, -2 + bob, 14, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Thân áo đen
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(-12, -8 + bob, 24, 26, 6);
    ctx.fill();

    // Mặt nạ Tengu đỏ
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(0, -12 + bob, 11, 0, Math.PI * 2);
    ctx.fill();

    // Chiếc mũi dài trứ danh
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(4, -13 + bob);
    ctx.lineTo(18, -13 + bob);
    ctx.lineTo(4, -9 + bob);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(0, -15 + bob, 4, 3);
  }

  ctx.restore();
}

function drawQuestionBlock(ctx, b, animTick) {
  const by = b.y + (b.bounceY || 0);

  if (b.hit) {
    // Khối gạch đồng sau khi đã húc
    ctx.fillStyle = "#78716c";
    ctx.fillRect(b.x, by, b.w, b.h);
    ctx.fillStyle = "#57534e";
    ctx.fillRect(b.x + 2, by + 2, b.w - 4, b.h - 4);
    ctx.strokeStyle = "#44403c";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, by, b.w, b.h);

    ctx.fillStyle = "#292524";
    ctx.fillRect(b.x + b.w / 2 - 3, by + b.h / 2 - 3, 6, 6);
  } else {
    // Khối vàng kim loại sáng bóng 3D
    const pulse = Math.sin(animTick * 0.12) * 1.5;

    const blockGrad = ctx.createLinearGradient(b.x, by, b.x, by + b.h);
    blockGrad.addColorStop(0, "#fde047");
    blockGrad.addColorStop(0.3, "#f59e0b");
    blockGrad.addColorStop(1, "#b45309");
    ctx.fillStyle = blockGrad;
    ctx.fillRect(b.x, by, b.w, b.h);

    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x, by + b.h);
    ctx.lineTo(b.x, by);
    ctx.lineTo(b.x + b.w, by);
    ctx.stroke();

    ctx.strokeStyle = "#78350f";
    ctx.beginPath();
    ctx.moveTo(b.x + b.w, by);
    ctx.lineTo(b.x + b.w, by + b.h);
    ctx.lineTo(b.x, by + b.h);
    ctx.stroke();

    // 4 Đinh tán kim loại góc
    ctx.fillStyle = "#78350f";
    ctx.fillRect(b.x + 4, by + 4, 3, 3);
    ctx.fillRect(b.x + b.w - 7, by + 4, 3, 3);
    ctx.fillRect(b.x + 4, by + b.h - 7, 3, 3);
    ctx.fillRect(b.x + b.w - 7, by + b.h - 7, 3, 3);

    // Dấu hỏi tỏa hào quang
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${22 + pulse}px var(--font-display, monospace)`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#fde047";
    ctx.shadowBlur = 6;
    ctx.fillText("?", b.x + b.w / 2, by + b.h / 2);
    ctx.shadowBlur = 0;
  }
}

function drawCastle(ctx, x, y, w, h) {
  // Tường đá pháo đài chính
  ctx.fillStyle = "#475569";
  ctx.fillRect(x, y + 70, w, h - 70);

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1.5;
  for (let sy = y + 75; sy < y + h; sy += 22) {
    ctx.beginPath();
    ctx.moveTo(x, sy);
    ctx.lineTo(x + w, sy);
    ctx.stroke();
  }

  // Tháp canh hai bên
  ctx.fillStyle = "#334155";
  ctx.fillRect(x - 24, y + 20, 56, h - 20);
  ctx.fillRect(x + w - 32, y + 20, 56, h - 20);

  // Mái ngói cong ngọc bích đậm chất Nhật Bản
  ctx.fillStyle = "#047857";
  ctx.beginPath();
  ctx.moveTo(x - 34, y + 20);
  ctx.lineTo(x + 4, y - 16);
  ctx.lineTo(x + 42, y + 20);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w - 42, y + 20);
  ctx.lineTo(x + w - 4, y - 16);
  ctx.lineTo(x + w + 34, y + 20);
  ctx.closePath();
  ctx.fill();

  // Mái tầng trung tâm
  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 70);
  ctx.lineTo(x + w / 2, y + 24);
  ctx.lineTo(x + w - 10, y + 70);
  ctx.closePath();
  ctx.fill();

  // Đỉnh tháp mạ vàng Shachihoko
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(x + 2, y - 22, 4, 8);
  ctx.fillRect(x + w - 6, y - 22, 4, 8);

  // Lá cờ hồng công chúa tung bay
  ctx.fillStyle = "#ec4899";
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 20);
  ctx.lineTo(x + 28, y - 14);
  ctx.lineTo(x + 4, y - 8);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w - 4, y - 20);
  ctx.lineTo(x + w + 20, y - 14);
  ctx.lineTo(x + w - 4, y - 8);
  ctx.closePath();
  ctx.fill();

  // Cổng vòm lớn
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h, 42, Math.PI, 0);
  ctx.fill();

  // Ánh đèn lồng ấm áp hắt ra từ cổng thành
  const gateGlow = ctx.createRadialGradient(x + w / 2, y + h - 10, 5, x + w / 2, y + h - 10, 42);
  gateGlow.addColorStop(0, "rgba(254, 240, 138, 0.85)");
  gateGlow.addColorStop(0.6, "rgba(245, 158, 11, 0.4)");
  gateGlow.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = gateGlow;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h, 42, Math.PI, 0);
  ctx.fill();
}

function drawPrincess(ctx, x, y, rescued, animTick) {
  ctx.save();
  const bounce = rescued ? Math.abs(Math.sin(animTick * 0.2)) * 8 : 0;
  ctx.translate(x, y - bounce);

  // 1. Mái tóc vàng óng ả
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(0, -6, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(0, -7, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(-17, -4, 5, 26);
  ctx.fillRect(12, -4, 5, 26);

  // 2. Váy lụa công chúa màu hồng phấn lộng lẫy
  ctx.fillStyle = "#ec4899";
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(20, 48);
  ctx.lineTo(-20, 48);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f472b6";
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(14, 48);
  ctx.lineTo(-14, 48);
  ctx.closePath();
  ctx.fill();

  // Viền ren trắng
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-7, 20, 14, 24);
  ctx.fillStyle = "#fbcfe8";
  ctx.fillRect(-9, 12, 18, 4);

  // 3. Gương mặt anime xinh xắn
  ctx.fillStyle = "#fed7aa";
  ctx.beginPath();
  ctx.arc(0, -4, 11, 0, Math.PI * 2);
  ctx.fill();

  // Đôi mắt to tròn xanh biếc
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(-5, -6, 3, 5);
  ctx.fillRect(2, -6, 3, 5);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-5, -6, 1.5, 2);
  ctx.fillRect(2, -6, 1.5, 2);

  // Má hồng e ấp
  ctx.fillStyle = "rgba(244, 114, 182, 0.6)";
  ctx.beginPath();
  ctx.arc(-6, -1, 3, 0, Math.PI * 2);
  ctx.arc(6, -1, 3, 0, Math.PI * 2);
  ctx.fill();

  // Nụ cười rạng rỡ
  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -1, 3, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // 4. Vương miện vàng đính ngọc lam
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(-9, -13);
  ctx.lineTo(-9, -22);
  ctx.lineTo(-4, -16);
  ctx.lineTo(0, -24);
  ctx.lineTo(4, -16);
  ctx.lineTo(9, -22);
  ctx.lineTo(9, -13);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(-2, -18, 4, 4);

  // 5. Cử chỉ tay
  ctx.fillStyle = "#fed7aa";
  if (rescued) {
    const waveHand = Math.sin(animTick * 0.3) * 4;
    ctx.fillRect(-20, -12 + waveHand, 6, 16);
    ctx.fillRect(14, -12 - waveHand, 6, 16);

    ctx.fillStyle = "#f43f5e";
    ctx.font = "14px sans-serif";
    ctx.fillText("💖", -18, -26 - (animTick % 30));
    ctx.fillText("✨", 14, -28 - ((animTick + 15) % 30));
  } else {
    ctx.fillRect(-6, 14, 12, 6);
  }

  ctx.restore();
}

function drawFireDragon(ctx, x, y, animTick) {
  ctx.save();
  ctx.translate(x, y);

  for (let i = 0; i < 7; i++) {
    const segX = -i * 26 + Math.sin(animTick * 0.3 + i) * 6;
    const segY = Math.cos(animTick * 0.3 + i * 0.8) * 10;
    const radius = 24 - i * 2.5;

    const fireGrad = ctx.createRadialGradient(segX, segY, 4, segX, segY, radius);
    fireGrad.addColorStop(0, "#fef08a");
    fireGrad.addColorStop(0.4, "#f97316");
    fireGrad.addColorStop(1, "rgba(220, 38, 38, 0)");

    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(segX, segY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ea580c";
  ctx.beginPath();
  ctx.moveTo(10, -18);
  ctx.lineTo(65, -8);
  ctx.lineTo(75, 4);
  ctx.lineTo(55, 18);
  ctx.lineTo(10, 14);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.moveTo(18, -16);
  ctx.lineTo(6, -34);
  ctx.lineTo(26, -20);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.arc(42, -5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(44, -5, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fef08a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(56, 4);
  ctx.quadraticCurveTo(80, 20 + Math.sin(animTick * 0.4) * 8, 95, 12);
  ctx.stroke();

  ctx.restore();
}

function drawMarioHUD(ctx, p, marioState) {
  const cw = marioState.canvasWidth;

  // Thanh kính HUD mờ hiện đại
  ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
  ctx.beginPath();
  ctx.roundRect(14, 12, cw - 28, 48, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 1. Tim máu (❤️)
  for (let i = 0; i < p.maxHp; i++) {
    const hx = 34 + i * 28;
    const hy = 36;
    if (i < p.hp) {
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(hx - 5, hy - 4, 6, Math.PI, 0, false);
      ctx.arc(hx + 5, hy - 4, 6, Math.PI, 0, false);
      ctx.lineTo(hx, hy + 9);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fca5a5";
      ctx.beginPath();
      ctx.arc(hx - 6, hy - 6, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(hx - 5, hy - 4, 6, Math.PI, 0, false);
      ctx.arc(hx + 5, hy - 4, 6, Math.PI, 0, false);
      ctx.lineTo(hx, hy + 9);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 2. Đồng xu vàng
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(142, 36, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b45309";
  ctx.fillRect(139, 33, 6, 6);

  ctx.fillStyle = "#fef08a";
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`x${p.coins}`, 158, 36);

  // 3. Điểm số
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px var(--font-display, sans-serif)";
  ctx.fillText(`⭐ ${p.score}`, 226, 36);

  // 4. Thanh cự ly đến lâu đài
  const progW = 140;
  const progX = 350;
  const progY = 32;
  const pct = Math.min(1, Math.max(0, p.x / (marioState.worldWidth - 280)));

  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.roundRect(progX, progY, progW, 8, 4);
  ctx.fill();

  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.roundRect(progX, progY, progW * pct, 8, 4);
  ctx.fill();

  ctx.font = "12px sans-serif";
  ctx.fillText("🏰", progX + progW + 8, progY + 5);

  // 5. Trạng thái Tuyệt chiêu
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 13px var(--font-display, sans-serif)";
  ctx.textAlign = "right";
  ctx.fillText("⚡ [K] Hỏa Long Trảm", cw - 32, 36);
  ctx.textAlign = "left";
}

function renderPrincessGameHtml() {
  if (!marioState) return "";

  return `
    <div class="mario-game-wrapper">
      <div class="battle-top-nav glass-panel">
        <button type="button" class="btn btn-secondary btn-sm btn-back-to-game-hub">⬅ Quay lại Game Hub</button>
        <div class="battle-round-badge princess-round">
          <span>👑 Giải Cứu Công Chúa: Mario 2D Adventure</span>
        </div>
        <div class="mario-quick-keys-hint">
          <span>Phím: <strong>A/D</strong> (Chạy) · <strong>Space</strong> (Nhảy) · <strong>J</strong> (Chém) · <strong>K</strong> (Tuyệt chiêu)</span>
        </div>
      </div>

      <div class="mario-canvas-container">
        <canvas id="mario-canvas" width="840" height="460"></canvas>
      </div>

      <div class="mario-touch-controls-bar">
        <div class="touch-ctrl-dpad">
          <button type="button" class="touch-btn touch-btn-dir" data-mario-dir="left">◀ Trái (A)</button>
          <button type="button" class="touch-btn touch-btn-dir" data-mario-dir="right">Phải ▶ (D)</button>
        </div>
        <div class="touch-ctrl-actions">
          <button type="button" class="touch-btn touch-btn-jump" data-mario-ctrl="jump">▲ Nhảy (Space)</button>
          <button type="button" class="touch-btn touch-btn-attack" data-mario-ctrl="attack">⚔️ Chém (J)</button>
          <button type="button" class="touch-btn touch-btn-spell" data-mario-ctrl="spell">⚡ Tuyệt chiêu (K)</button>
        </div>
      </div>

      ${marioState.isSpellPaused && marioState.currentSpellQuestion ? `
        <div class="mario-spell-modal-overlay">
          <div class="mario-spell-box glass-panel">
            <div class="spell-box-header">
              <span class="spell-tag">${marioState.currentSpellQuestion.title}</span>
              <span class="spell-timer-badge">⏱️ Giải mã nhanh!</span>
            </div>
            <p class="spell-desc-sub">Trả lời chính xác để phóng Hỏa Long Trảm quét sạch toàn bộ quái vật trên đường đi!</p>
            
            <div class="spell-prompt-text">${marioState.currentSpellQuestion.prompt}</div>

            <div class="mario-spell-options-grid">
              ${marioState.currentSpellQuestion.options.map((opt, idx) => `
                <button type="button" class="mario-spell-ans-btn" data-spell-opt-idx="${idx}">
                  <span>（${idx + 1}）</span> <strong>${opt}</strong>
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      ` : ''}

      ${marioState.gameOver ? `
        <div class="mario-spell-modal-overlay">
          <div class="battle-end-modal glass-panel game-over-box">
            <div class="end-icon">💀</div>
            <h3>HIỆP SĨ ĐÃ HẾT MÁU!</h3>
            <p>Công chúa vẫn đang ngóng chờ bạn ở Lâu Đài. Hãy củng cố từ vựng và thử lại nhé!</p>
            <div class="end-actions">
              <button type="button" class="btn btn-primary btn-lg" id="retry-mario-game-btn">🔄 Chơi Lại Từ Đầu</button>
              <button type="button" class="btn btn-secondary btn-back-to-game-hub">Quay lại Game Hub</button>
            </div>
          </div>
        </div>
      ` : ''}

      ${marioState.victory ? `
        <div class="mario-spell-modal-overlay">
          <div class="battle-end-modal glass-panel victory-box">
            <div class="end-icon">👸👑🎉</div>
            <h3>CHÚC MỪNG! GIẢI CỨU CÔNG CHÚA THÀNH CÔNG!</h3>
            <p>
              Bạn đã vượt qua mọi cạm bẫy quái vật và tiến thẳng vào Lâu Đài Lộng Lẫy! 
              Công chúa trao tặng bạn Vương Miện Hiệp Sĩ Cứu Thế.
            </p>
            <div class="victory-stat-summary">
              <span>🪙 Vàng nhặt được: <strong>${marioState.player.coins}</strong></span>
              <span>⭐ Tổng điểm: <strong>${marioState.player.score}</strong></span>
              <span>🏆 Thưởng EXP: <strong>+300 EXP</strong></span>
            </div>
            <div class="end-actions">
              <button type="button" class="btn btn-primary btn-lg" id="retry-mario-game-btn">🎮 Chơi Lại Màn Mới</button>
              <button type="button" class="btn btn-secondary btn-back-to-game-hub">Quay lại Game Hub</button>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ============================================================================
// GAME 3: LẬT THẺ TRÍ NHỚ MA THUẬT (3x3 ĐẾN 25x25)
// ============================================================================
function startMemoryGame() {
  currentGameMode = "memory";

  const [cols, rows] = memoryGridSize.split("x").map(n => parseInt(n, 10));
  const totalSlots = cols * rows;
  const isOddGrid = totalSlots % 2 !== 0;
  const pairCount = isOddGrid ? Math.floor(totalSlots / 2) : totalSlots / 2;

  const rawPool = extractVocabForGame(selectedProjectId);
  const combinedPool = [...rawPool];
  EXTENDED_VOCAB_BANK.forEach(bv => {
    if (!combinedPool.some(r => r.kanji === bv.kanji || r.hiragana === bv.hiragana)) {
      combinedPool.push(bv);
    }
  });

  let neededVocab = [];
  while (neededVocab.length < pairCount) {
    const remaining = pairCount - neededVocab.length;
    const batch = [...combinedPool].sort(() => 0.5 - Math.random());
    neededVocab.push(...batch.slice(0, remaining));
  }

  const cards = [];
  neededVocab.forEach((v, idx) => {
    cards.push({
      id: `c-jp-${idx}`,
      pairId: `pair-${idx}`,
      type: "jp",
      display: v.kanji || v.hiragana,
      subDisplay: v.hiragana !== v.kanji ? v.hiragana : (v.romaji || ""),
      tts: v.hiragana || v.kanji,
      isFlipped: false,
      isMatched: false
    });
    cards.push({
      id: `c-vi-${idx}`,
      pairId: `pair-${idx}`,
      type: "vi",
      display: v.meaning,
      subDisplay: "Nghĩa tiếng Việt",
      tts: v.hiragana || v.kanji,
      isFlipped: false,
      isMatched: false
    });
  });

  if (isOddGrid) {
    cards.push({
      id: "card-lucky-star",
      pairId: "pair-lucky-star",
      type: "star",
      display: "⭐ SAO MAY MẮN",
      subDisplay: "Lucky Star +100 EXP",
      tts: "ラッキースター",
      isFlipped: false,
      isMatched: false
    });
  }

  cards.sort(() => 0.5 - Math.random());

  memoryState = {
    gridSize: memoryGridSize,
    cols,
    rows,
    cards,
    flippedIndices: [],
    matchedCount: 0,
    totalPairs: pairCount + (isOddGrid ? 1 : 0),
    flips: 0,
    isLocked: false,
    completed: false
  };

  renderGameCenterView();
}

function renderMemoryGameHtml() {
  if (!memoryState) return "";

  const gridSizesList = ["3x3", "4x4", "5x5", "8x8", "12x12", "15x15", "20x20", "25x25"];

  return `
    <div class="memory-game-container">
      <div class="battle-top-nav glass-panel">
        <button type="button" class="btn btn-secondary btn-sm btn-back-to-game-hub">⬅ Quay lại Game Hub</button>
        <div class="battle-round-badge memory-badge">
          <span>🎴 Bàn cờ <strong>${memoryState.gridSize}</strong> (${memoryState.cards.length} thẻ) · Ghép: <strong>${memoryState.matchedCount}/${memoryState.totalPairs}</strong></span>
        </div>
        <div class="battle-score-pill">
          <span>Lượt lật: <strong>${memoryState.flips}</strong></span>
          <button type="button" class="btn btn-outline btn-sm" id="restart-memory-game-btn" style="margin-left: 6px;">🔄 Chia lại</button>
        </div>
      </div>

      <div class="memory-config-bar glass-panel">
        <div class="grid-size-selector-pills">
          <span class="sel-title">Kích thước:</span>
          ${gridSizesList.map(sz => `
            <button type="button" class="mem-size-pill ${memoryState.gridSize === sz ? 'active' : ''}" data-mem-size="${sz}">
              ${sz}
            </button>
          `).join("")}
        </div>
        <div class="memory-zoom-controls">
          <button type="button" class="btn btn-outline btn-sm" id="mem-zoom-out" title="Thu nhỏ bàn cờ">🔍 -</button>
          <button type="button" class="btn btn-outline btn-sm" id="mem-zoom-reset" title="Đặt lại tỷ lệ">100%</button>
          <button type="button" class="btn btn-outline btn-sm" id="mem-zoom-in" title="Phóng to bàn cờ">🔍 +</button>
        </div>
      </div>

      ${memoryState.completed ? `
        <div class="battle-end-modal glass-panel victory-box" style="margin-top: 14px;">
          <div class="end-icon">🎴✨🎉</div>
          <h3>TUYỆT VỜI! HOÀN THÀNH BÀN CỜ ${memoryState.gridSize}!</h3>
          <p>Trí nhớ của bạn thật phi thường! Bạn đã chinh phục toàn bộ <strong>${memoryState.cards.length} thẻ</strong> chỉ trong <strong>${memoryState.flips} lượt lật</strong>.</p>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="restart-memory-game-btn">🔄 Chơi Ván Mới</button>
            <button type="button" class="btn btn-secondary btn-back-to-game-hub">Quay lại Game Hub</button>
          </div>
        </div>
      ` : `
        <div class="memory-board-viewport" id="memory-viewport">
          <div class="memory-cards-grid-scalable" 
               id="memory-grid-scalable"
               style="--cols: ${memoryState.cols}; transform: scale(${memoryZoom});">
            ${memoryState.cards.map((card, idx) => {
              const isRevealed = card.isFlipped || card.isMatched;
              return `
                <div class="memory-card card-size-${memoryState.gridSize} ${isRevealed ? 'is-flipped' : ''} ${card.isMatched ? 'is-matched' : ''}" 
                     data-card-idx="${idx}">
                  <div class="memory-card-inner">
                    <div class="memory-card-back">
                      <span class="card-back-pattern">🎴</span>
                      <span class="card-back-text">MIW</span>
                    </div>
                    <div class="memory-card-front card-front-${card.type}">
                      <div class="front-display-main">${card.display}</div>
                      <div class="front-display-sub">${card.subDisplay}</div>
                      ${card.isMatched ? '<span class="match-check">✓ Đã ghép</span>' : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `}
    </div>
  `;
}

function handleMemoryCardFlip(cardIdx) {
  if (!memoryState || memoryState.isLocked) return;
  const card = memoryState.cards[cardIdx];
  if (!card || card.isFlipped || card.isMatched) return;

  card.isFlipped = true;

  if (card.type === "star") {
    card.isMatched = true;
    memoryState.matchedCount += 1;
    addGameExp(100);
    if (card.tts) speakJapanese(card.tts);
    if (memoryState.matchedCount >= memoryState.totalPairs) {
      memoryState.completed = true;
      recordMemoryWin();
    }
    renderGameCenterView();
    return;
  }

  memoryState.flippedIndices.push(cardIdx);
  if (card.tts) speakJapanese(card.tts);
  renderGameCenterView();

  if (memoryState.flippedIndices.length === 2) {
    memoryState.flips += 1;
    memoryState.isLocked = true;

    const idx1 = memoryState.flippedIndices[0];
    const idx2 = memoryState.flippedIndices[1];
    const card1 = memoryState.cards[idx1];
    const card2 = memoryState.cards[idx2];

    if (card1.pairId === card2.pairId && card1.id !== card2.id) {
      setTimeout(() => {
        card1.isMatched = true;
        card2.isMatched = true;
        memoryState.flippedIndices = [];
        memoryState.matchedCount += 1;
        memoryState.isLocked = false;

        if (memoryState.matchedCount >= memoryState.totalPairs) {
          memoryState.completed = true;
          addGameExp(150);
          recordMemoryWin();
        }
        renderGameCenterView();
      }, 400);
    } else {
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        memoryState.flippedIndices = [];
        memoryState.isLocked = false;
        renderGameCenterView();
      }, 900);
    }
  }
}

function applyMemoryZoom() {
  if (typeof document === "undefined") return;
  const el = document.getElementById("memory-grid-scalable");
  if (el) el.style.transform = `scale(${memoryZoom})`;
}

// ============================================================================
// GAME 1: MONSTER SLAYER
// ============================================================================
function startMonsterGame() {
  currentGameMode = "monster";
  const vocabList = extractVocabForGame(selectedProjectId);

  monsterState = {
    playerHp: 100,
    playerMaxHp: 100,
    currentMonsterIndex: 0,
    monsterHp: MONSTER_ROSTER[0].hp,
    streak: 0,
    score: 0,
    isAnswering: false,
    battleLog: `Trận đấu bắt đầu! Yêu quái ${MONSTER_ROSTER[0].name} xuất hiện!`,
    currentQuestion: generateBattleQuestion(vocabList, 0),
    gameOver: false,
    victory: false,
    attackEffect: null
  };

  renderGameCenterView();
}

function renderMonsterGameHtml() {
  if (!monsterState) return "";
  const monster = MONSTER_ROSTER[monsterState.currentMonsterIndex];
  const q = monsterState.currentQuestion;
  const playerHpPct = Math.max(0, Math.round((monsterState.playerHp / monsterState.playerMaxHp) * 100));
  const monsterHpPct = Math.max(0, Math.round((monsterState.monsterHp / monster.maxHp) * 100));

  return `
    <div class="monster-battle-arena-container">
      <div class="battle-top-nav glass-panel">
        <button type="button" class="btn btn-secondary btn-sm btn-back-to-game-hub">⬅ Quay lại Game Hub</button>
        <div class="battle-round-badge">
          <span>⚔️ Vòng ${monsterState.currentMonsterIndex + 1} / ${MONSTER_ROSTER.length}: ${monster.title}</span>
        </div>
        <div class="battle-score-pill">
          <span>Điểm: <strong>${monsterState.score}</strong></span>
          <span class="streak-tag">🔥 Combo: ${monsterState.streak}</span>
        </div>
      </div>

      <div class="battle-stage-card glass-panel ${monsterState.attackEffect === 'monster' ? 'screen-shake' : ''}">
        <div class="battle-combatant player-side ${monsterState.attackEffect === 'player' ? 'player-attack-anim' : ''}">
          <div class="combatant-hp-bar-box">
            <div class="combatant-name-label"><span>🛡️ Hiệp Sĩ</span><strong>${monsterState.playerHp}/${monsterState.playerMaxHp} HP</strong></div>
            <div class="hp-bar-track"><div class="hp-bar-fill player-hp-fill" style="width: ${playerHpPct}%;"></div></div>
          </div>
          <div class="combatant-sprite player-sprite">
            <span class="sprite-avatar">🤺</span>
            ${monsterState.attackEffect === 'player' ? '<div class="slash-effect">⚡ CHIÊU THỨC TRẢM!</div>' : ''}
          </div>
        </div>

        <div class="battle-versus-zone">
          <span class="vs-text">VS</span>
          <div class="battle-log-toast">${monsterState.battleLog}</div>
        </div>

        <div class="battle-combatant monster-side ${monsterState.attackEffect === 'monster' ? 'monster-attack-anim' : ''}">
          <div class="combatant-hp-bar-box">
            <div class="combatant-name-label"><span style="color: ${monster.color};">${monster.name}</span><strong>${monsterState.monsterHp}/${monster.maxHp} HP</strong></div>
            <div class="hp-bar-track"><div class="hp-bar-fill monster-hp-fill" style="width: ${monsterHpPct}%; background: ${monster.color};"></div></div>
          </div>
          <div class="combatant-sprite monster-sprite">
            <span class="sprite-avatar monster-avatar-emoji">${monster.avatar}</span>
            ${monsterState.attackEffect === 'monster' ? `<div class="monster-hit-text">💥 ${monster.attackName}!</div>` : ''}
          </div>
        </div>
      </div>

      ${monsterState.gameOver ? `
        <div class="battle-end-modal glass-panel game-over-box">
          <div class="end-icon">💀</div>
          <h3>HIỆP SĨ ĐÃ BỊ ĐÁNH BẠI!</h3>
          <p>Yêu quái quá hung bạo! Hãy củng cố từ vựng và thử lại nhé.</p>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="retry-monster-btn">🔄 Thử Thách Lại</button>
            <button type="button" class="btn btn-secondary btn-back-to-game-hub">Quay lại Game Hub</button>
          </div>
        </div>
      ` : (monsterState.victory ? `
        <div class="battle-end-modal glass-panel victory-box">
          <div class="end-icon">🎉</div>
          <h3>XUẤT SẮC! TIÊU DIỆT HOÀN TOÀN QUÁI VẬT!</h3>
          <p>Bạn đã quét sạch 4 đại yêu quái bảo vệ ngôi làng! Điểm số: <strong>${monsterState.score} EXP</strong>.</p>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="retry-monster-btn">⚔️ Chơi Lại Vòng Mới</button>
            <button type="button" class="btn btn-secondary btn-back-to-game-hub">Quay lại Game Hub</button>
          </div>
        </div>
      ` : (monsterState.monsterHp <= 0 ? `
        <div class="battle-end-modal glass-panel next-round-box">
          <div class="end-icon">💥</div>
          <h3>YÊU QUÁI ${monster.name} ĐÃ BỊ HẠ GỤC!</h3>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="next-monster-btn">➡️ Khiêu Chiến Quái Vật Tiếp Theo!</button>
          </div>
        </div>
      ` : `
        <div class="battle-question-deck glass-panel">
          <div class="question-deck-header">
            <span class="spell-tag">🔮 CÂU THẦN CHÚ CHIẾN ĐẤU</span>
            ${q.tts ? `<button type="button" class="btn-tts game-tts-btn" data-tts="${q.tts}">🔊 Nghe phát âm</button>` : ''}
          </div>
          <div class="question-prompt-text">${q.prompt}</div>
          <div class="monster-answers-grid">
            ${q.options.map((opt, idx) => `
              <button type="button" class="monster-answer-btn" data-idx="${idx}">
                <span class="attack-num">（${idx + 1}）</span>
                <span class="attack-label">${opt}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `))}
    </div>
  `;
}

function handleMonsterAnswer(selectedIdx) {
  if (!monsterState || monsterState.isAnswering) return;
  monsterState.isAnswering = true;

  const q = monsterState.currentQuestion;
  const monster = MONSTER_ROSTER[monsterState.currentMonsterIndex];
  const isCorrect = selectedIdx === q.correct;

  if (isCorrect) {
    const damage = 20 + monsterState.streak * 5;
    monsterState.monsterHp = Math.max(0, monsterState.monsterHp - damage);
    monsterState.streak += 1;
    monsterState.score += damage * 2;
    monsterState.attackEffect = "player";
    monsterState.battleLog = `🎯 CHÍNH XÁC! Hiệp sĩ thi triển kiếm quang chém trúng ${monster.name} gây -${damage} HP!`;

    if (monsterState.monsterHp <= 0) {
      addGameExp(150);
      recordMonsterDefeated();
      if (monsterState.currentMonsterIndex >= MONSTER_ROSTER.length - 1) {
        monsterState.victory = true;
      }
    }
  } else {
    const damage = monster.attackPower;
    monsterState.playerHp = Math.max(0, monsterState.playerHp - damage);
    monsterState.streak = 0;
    monsterState.attackEffect = "monster";
    monsterState.battleLog = `⚠️ SAI RỒI! ${monster.name} dùng chiêu '${monster.attackName}' đánh trúng bạn gây -${damage} HP!`;

    if (monsterState.playerHp <= 0) {
      monsterState.gameOver = true;
    }
  }

  renderGameCenterView();

  setTimeout(() => {
    if (monsterState) {
      monsterState.attackEffect = null;
      monsterState.isAnswering = false;
      if (!monsterState.gameOver && !monsterState.victory && monsterState.monsterHp > 0) {
        const vocabList = extractVocabForGame(selectedProjectId);
        monsterState.currentQuestion = generateBattleQuestion(vocabList, monsterState.currentMonsterIndex);
      }
      renderGameCenterView();
    }
  }, 1200);
}

function advanceNextMonster() {
  if (!monsterState) return;
  monsterState.currentMonsterIndex += 1;
  const nextMonster = MONSTER_ROSTER[monsterState.currentMonsterIndex];
  monsterState.monsterHp = nextMonster.hp;
  monsterState.playerHp = Math.min(monsterState.playerMaxHp, monsterState.playerHp + 30);
  monsterState.battleLog = `Yêu quái mới ${nextMonster.name} xuất kích!`;
  const vocabList = extractVocabForGame(selectedProjectId);
  monsterState.currentQuestion = generateBattleQuestion(vocabList, monsterState.currentMonsterIndex);
  renderGameCenterView();
}

// ============================================================================
// CÁC HÀM TRÍCH XUẤT TỪ VỰNG & SINH CÂU HỎI
// ============================================================================
export function extractVocabForGame(projectId = "all") {
  const projects = getProjects() || [];
  const result = [];

  projects.forEach(p => {
    if (projectId === "all" || p.id === projectId) {
      if (Array.isArray(p.vocab)) {
        p.vocab.forEach(v => {
          if (v && v.japanese && v.meaning) {
            let kanji = v.japanese.trim();
            let hiragana = v.japanese.trim();
            const matchParen = v.japanese.match(/^(.*?)\s*[\(（](.*?)[\)）]$/);
            if (matchParen) {
              kanji = matchParen[1].trim();
              hiragana = matchParen[2].trim();
            }

            result.push({
              kanji,
              hiragana,
              romaji: v.romaji || "",
              meaning: v.meaning.split(/[\(\/]/)[0].trim()
            });
          }
        });
      }
    }
  });

  BASE_GAME_VOCAB.forEach(bv => {
    if (!result.some(r => r.kanji === bv.kanji || r.hiragana === bv.hiragana)) {
      result.push(bv);
    }
  });

  return result;
}

function generateBattleQuestion(vocabList, roundIndex) {
  const mode = Math.random() > 0.4 ? "vocab" : "grammar";

  if (mode === "grammar") {
    const grammarQuestions = [
      { prompt: "Chọn trợ từ đúng: わたし（　　）学生です。", options: ["は", "も", "か", "の"], correct: 0, tts: "わたしはがくせいです" },
      { prompt: "Chọn trợ từ đồng nhất: タインさんはベトナム人です。マイさん（　　）ベトナム人です。", options: ["は", "も", "が", "か"], correct: 1, tts: "マイさんもベトナムじんです" },
      { prompt: "Chọn thể phủ định đúng: ミラーさんは医者（　　）。会社員です。", options: ["です", "じゃありません", "ですか", "もです"], correct: 1, tts: "ミラーさんはいしゃじゃありません" },
      { prompt: "Chọn câu hỏi xác nhận: あなたはエンジニア（　　）。", options: ["ですか", "じゃありません", "ですね", "でした"], correct: 0, tts: "あなたはエンジニアですか" }
    ];
    return grammarQuestions[Math.floor(Math.random() * grammarQuestions.length)];
  }

  const target = vocabList[Math.floor(Math.random() * vocabList.length)];
  const distractors = vocabList.filter(v => v !== target).sort(() => 0.5 - Math.random()).slice(0, 3);
  const options = [target.meaning, ...distractors.map(d => d.meaning)].sort(() => 0.5 - Math.random());
  const correct = options.indexOf(target.meaning);

  return {
    prompt: `Từ vựng <strong>【${target.kanji || target.hiragana}】</strong> (${target.hiragana}) có nghĩa là gì?`,
    options,
    correct,
    tts: target.hiragana || target.kanji
  };
}

// ============================================================================
// PROFILE & TIẾN ĐỘ CHƠI GAME
// ============================================================================
export function getGameProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAME_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { level: 1, exp: 0, monstersDefeated: 0, princessRescued: 0, memoryWins: 0 };
}

export function saveGameProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY_GAME_PROFILE, JSON.stringify(profile));
  } catch (e) {}
}

export function addGameExp(amount) {
  const profile = getGameProfile();
  profile.exp = (profile.exp || 0) + amount;
  profile.level = Math.floor(profile.exp / 300) + 1;
  saveGameProfile(profile);
}

export function recordMonsterDefeated() {
  const profile = getGameProfile();
  profile.monstersDefeated = (profile.monstersDefeated || 0) + 1;
  saveGameProfile(profile);
}

export function recordPrincessRescued() {
  const profile = getGameProfile();
  profile.princessRescued = (profile.princessRescued || 0) + 1;
  saveGameProfile(profile);
}

export function recordMemoryWin() {
  const profile = getGameProfile();
  profile.memoryWins = (profile.memoryWins || 0) + 1;
  saveGameProfile(profile);
}

function startSpecificGame(gameKey) {
  if (gameKey === "monster") startMonsterGame();
  else if (gameKey === "princess") startPrincessGame();
  else if (gameKey === "memory") startMemoryGame();
}

// Export test helpers & sub-modules for automated testing
export function startMemoryGameForTest(gridSize = "4x4") {
  memoryGridSize = gridSize;
  startMemoryGame();
  return memoryState;
}

export function startPrincessGameForTest() {
  startPrincessGame();
  return marioState;
}

export function getMarioState() {
  return marioState;
}

export function getMemoryState() {
  return memoryState;
}

export {
  triggerMarioNormalAttack,
  triggerMarioSpecialSpell,
  handleMarioSpellAnswer,
  killEnemy
};

