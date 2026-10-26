// src/game-center.js
// Trung tâm Trò chơi Học tiếng Nhật (Game Center)
// Học từ vựng và ngữ pháp qua các trò chơi tương tác: Tiêu diệt yêu quái, Giải cứu công chúa, Lật thẻ trí nhớ

import { getProjects } from "./storage.js";
import { GRAMMAR_CHAPTERS } from "./grammar.js";
import { speakJapanese } from "./ui.js";

export const STORAGE_KEY_GAME_PROFILE = "miw_nihongo_game_profile_v1";

// Danh sách quái vật trong game Tiêu diệt yêu quái
export const MONSTER_ROSTER = [
  {
    id: "m-kappa",
    name: "Kappa Thủy Quái (河童)",
    title: "Tiểu yêu bờ sông",
    avatar: "🥒",
    hp: 40,
    maxHp: 40,
    attackPower: 15,
    attackName: "Phun tia nước xoáy",
    color: "#059669",
    dialogue: "Ngươi muốn qua sông sao? Hãy dịch đúng từ vựng này xem!"
  },
  {
    id: "m-tengu",
    name: "Tengu Quạ Đỏ (天狗)",
    title: "Yêu quái quạt gió",
    avatar: "👺",
    hp: 60,
    maxHp: 60,
    attackPower: 20,
    attackName: "Cuồng phong trảm",
    color: "#dc2626",
    dialogue: "Gió lốc của ta sẽ thổi bay kẻ không thuộc ngữ pháp trợ từ!"
  },
  {
    id: "m-kitsune",
    name: "Hồ Ly 9 Đuôi (九尾の狐)",
    title: "Yêu hồ ảo thuật",
    avatar: "🦊",
    hp: 80,
    maxHp: 80,
    attackPower: 25,
    attackName: "Hồ ly hỏa diễm",
    color: "#ea580c",
    dialogue: "Đừng để ảo ảnh chữ Hán của ta đánh lừa ngươi!"
  },
  {
    id: "m-oni",
    name: "Quỷ Vương Dạ Xoa (鬼王 - Boss)",
    title: "Đại Ma Vương Lâu Đài",
    avatar: "👹",
    hp: 100,
    maxHp: 100,
    attackPower: 30,
    attackName: "Búa gai sấm sét",
    color: "#7c3aed",
    dialogue: "Gaaaa! Ngươi dám đến tận sào huyệt của ta sao? Chết đi!"
  }
];

// Danh sách các tầng của Tháp Lâu Đài trong game Giải cứu công chúa
export const PRINCESS_TOWER_FLOORS = [
  { floor: 1, name: "Tầng 1: Cổng Thành Rêu Phong", challenge: "Giải mã cách đọc chữ Hán (Kanji)", icon: "🚪" },
  { floor: 2, name: "Tầng 2: Cầu Thang Hắc Ám", challenge: "Chìa khóa Trợ từ bí ẩn (は · も · か)", icon: "🗝️" },
  { floor: 3, name: "Tầng 3: Hành Lang Ma Thuật", challenge: "Phá giải bùa chú Phủ định (じゃありません)", icon: "🛡️" },
  { floor: 4, name: "Tầng 4: Phòng Thí Nghiệm Cổ", challenge: "Sắp xếp mật mã dấu sao ★ (文の組み立て)", icon: "⭐" },
  { floor: 5, name: "Đỉnh Tháp: Lồng Giam Công Chúa", challenge: "Đánh thức công chúa bằng câu chào hỏi hoàn chỉnh", icon: "👑" }
];

// Từ vựng nền tảng hỗ trợ nếu dự án cá nhân còn ít từ
export const BASE_GAME_VOCAB = [
  { kanji: "学生", hiragana: "がくせい", romaji: "gakusei", meaning: "học sinh, sinh viên" },
  { kanji: "先生", hiragana: "せんせい", romaji: "sensei", meaning: "giáo viên, thầy cô" },
  { kanji: "会社員", hiragana: "かいしゃいん", romaji: "kaishain", meaning: "nhân viên công ty" },
  { kanji: "医者", hiragana: "いしゃ", romaji: "isha", meaning: "bác sĩ" },
  { kanji: "エンジニア", hiragana: "えんじにあ", romaji: "enjinia", meaning: "kỹ sư" },
  { kanji: "日本人", hiragana: "にほんじん", romaji: "nihonjin", meaning: "người Nhật Bản" },
  { kanji: "ベトナム人", hiragana: "べとなむじん", romaji: "betonamujin", meaning: "người Việt Nam" },
  { kanji: "アメリカ人", hiragana: "あめりかじん", romaji: "amerikajin", meaning: "người Mỹ" },
  { kanji: "病院", hiragana: "びょういん", romaji: "byouin", meaning: "bệnh viện" },
  { kanji: "大学", hiragana: "だいがく", romaji: "daigaku", meaning: "trường đại học" },
  { kanji: "本", hiragana: "ほん", romaji: "hon", meaning: "sách" },
  { kanji: "私", hiragana: "わたし", romaji: "watashi", meaning: "tôi" },
  { kanji: "友達", hiragana: "ともだち", romaji: "tomodachi", meaning: "bạn bè" },
  { kanji: "車", hiragana: "くるま", romaji: "kuruma", meaning: "xe hơi, ô tô" },
  { kanji: "水", hiragana: "みず", romaji: "mizu", meaning: "nước" }
];

// Trạng thái runtime
let currentGameMode = "hub"; // hub | monster | princess | memory
let selectedProjectId = "all";

// Runtime Monster Game
let monsterState = null;

// Runtime Princess Game
let princessState = null;

// Runtime Memory Game
let memoryState = null;

// 1. Khởi tạo sự kiện giao diện Game Center
export function setupGameCenterUI() {
  const container = document.getElementById("game-center-view");
  if (!container) return;

  container.addEventListener("click", (e) => {
    // A. Chọn Game từ Game Hub
    const launchBtn = e.target.closest("[data-launch-game]");
    if (launchBtn) {
      const mode = launchBtn.getAttribute("data-launch-game");
      if (mode) {
        startSpecificGame(mode);
      }
      return;
    }

    // B. Quay về Game Hub
    const backBtn = e.target.closest(".btn-back-to-game-hub");
    if (backBtn) {
      currentGameMode = "hub";
      renderGameCenterView();
      return;
    }

    // C. Thay đổi dự án nguồn từ vựng
    const projSelect = e.target.closest("#game-project-filter");
    if (projSelect) {
      selectedProjectId = projSelect.value;
      return;
    }

    // D. Xử lý click trong Game Tiêu diệt yêu quái (Monster Slayer)
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

    // E. Xử lý click trong Game Giải cứu công chúa (Princess Rescue)
    const towerAnsBtn = e.target.closest(".tower-answer-btn");
    if (towerAnsBtn && princessState && !princessState.isAnswering) {
      const idx = parseInt(towerAnsBtn.getAttribute("data-idx"), 10);
      handlePrincessAnswer(idx);
      return;
    }

    const nextFloorBtn = e.target.closest("#next-floor-btn");
    if (nextFloorBtn && princessState) {
      advancePrincessFloor();
      return;
    }

    const retryPrincessBtn = e.target.closest("#retry-princess-btn");
    if (retryPrincessBtn) {
      startPrincessGame();
      return;
    }

    // F. Xử lý click trong Game Lật thẻ trí nhớ (Memory Match)
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

    // G. Phát âm âm thanh tiếng Nhật
    const audioBtn = e.target.closest(".game-tts-btn");
    if (audioBtn) {
      const text = audioBtn.getAttribute("data-tts");
      if (text) speakJapanese(text);
      return;
    }
  });

  // Sự kiện thay đổi select dự án
  container.addEventListener("change", (e) => {
    if (e.target && e.target.id === "game-project-filter") {
      selectedProjectId = e.target.value;
      if (currentGameMode === "monster") startMonsterGame();
      else if (currentGameMode === "princess") startPrincessGame();
      else if (currentGameMode === "memory") startMemoryGame();
    }
  });
}

// 2. Render View chính
export function renderGameCenterView() {
  const container = document.getElementById("game-center-view");
  if (!container) return;

  if (currentGameMode === "monster") {
    container.innerHTML = renderMonsterGameHtml();
  } else if (currentGameMode === "princess") {
    container.innerHTML = renderPrincessGameHtml();
  } else if (currentGameMode === "memory") {
    container.innerHTML = renderMemoryGameHtml();
  } else {
    container.innerHTML = renderGameHubHtml();
  }
}

// ============================================================================
// MÀN HÌNH CHÍNH: GAME HUB (TRUNG TÂM TRÒ CHƠI)
// ============================================================================
function renderGameHubHtml() {
  const profile = getGameProfile();
  const projects = getProjects() || [];
  const pool = extractVocabForGame(selectedProjectId);

  return `
    <div class="game-hub-container">
      <!-- 1. Hero Header -->
      <div class="game-hub-hero glass-panel">
        <div class="game-hero-content">
          <div class="game-title-row">
            <span class="game-badge-arcade">ARCADE LEARNING</span>
            <span class="game-level-tag">🏆 Cấp độ: Hiệp Sĩ Cấp ${profile.level || 1}</span>
          </div>
          <h2 class="game-hero-h2">Đấu Trường Trò Chơi Tiếng Nhật (ゲーム)</h2>
          <p class="game-hero-sub">
            Vừa chơi vui nhộn vừa ghi nhớ từ vựng và khắc sâu ngữ pháp N5! 
            Hãy chọn trò chơi yêu thích, vượt qua các thử thách để nhận điểm thưởng EXP và mở khóa danh hiệu vinh danh.
          </p>

          <!-- Thống kê thành tích hiệp sĩ -->
          <div class="knight-stats-bar">
            <div class="knight-stat-pill">
              <span class="k-icon">⭐</span>
              <span>Tổng EXP: <strong>${profile.exp || 0}</strong></span>
            </div>
            <div class="knight-stat-pill">
              <span class="k-icon">⚔️</span>
              <span>Yêu quái đã diệt: <strong>${profile.monstersDefeated || 0}</strong></span>
            </div>
            <div class="knight-stat-pill">
              <span class="k-icon">👑</span>
              <span>Công chúa đã cứu: <strong>${profile.princessRescued || 0}</strong></span>
            </div>
            <div class="knight-stat-pill">
              <span class="k-icon">🎴</span>
              <span>Lật thẻ hoàn hảo: <strong>${profile.memoryWins || 0}</strong></span>
            </div>
          </div>
        </div>

        <!-- Bộ lọc nguồn từ vựng dự án -->
        <div class="game-vocab-source-panel">
          <label for="game-project-filter" class="source-label">
            <span>🎯 Nguồn từ vựng thi đấu:</span>
          </label>
          <select id="game-project-filter" class="form-control game-select">
            <option value="all" ${selectedProjectId === 'all' ? 'selected' : ''}>
              Tất cả dự án (${pool.length} từ vựng sẵn sàng)
            </option>
            ${projects.map(p => `
              <option value="${p.id}" ${selectedProjectId === p.id ? 'selected' : ''}>
                📁 ${p.name} (${(p.vocab || []).length} từ)
              </option>
            `).join("")}
          </select>
          <small class="source-hint">Hệ thống tự động đồng bộ từ vựng và ngữ pháp N5 Bài 1 vào game!</small>
        </div>
      </div>

      <!-- 2. Danh Sách Các Trò Chơi -->
      <div class="game-cards-catalog">
        <!-- Game 1: Tiêu Diệt Yêu Quái -->
        <div class="game-card-banner card-monster-theme glass-panel">
          <div class="card-art-col">
            <div class="art-badge">⚔️ HÀNH ĐỘNG CHIẾN ĐẤU</div>
            <div class="art-avatars-row">
              <span class="avatar-icon">🥒</span>
              <span class="avatar-icon">👺</span>
              <span class="avatar-icon">🦊</span>
              <span class="avatar-icon boss-glow">👹</span>
            </div>
          </div>
          <div class="card-details-col">
            <h3 class="card-game-title">Tiêu Diệt Yêu Quái (妖怪討伐 - Youkai Slayer)</h3>
            <p class="card-game-desc">
              Ngôi làng đang bị quái vật quấy phá! Sử dụng kiến thức từ vựng và ngữ pháp để thi triển kiếm thuật 
              và phép thuật sấm sét, hạ gục 4 con quái vật hung hãn trước khi bị chúng phản công cạn máu.
            </p>
            <div class="card-tags-row">
              <span class="gtag">Từ vựng Kanji & Hiragana</span>
              <span class="gtag">Trợ từ は · も · か</span>
              <span class="gtag">Thanh máu HP & Combo</span>
            </div>
            <div class="card-action-row">
              <button type="button" class="btn btn-primary btn-game-play" data-launch-game="monster">
                ⚔️ Xuất Kích Tiêu Diệt Quái Vật
              </button>
            </div>
          </div>
        </div>

        <!-- Game 2: Giải Cứu Công Chúa -->
        <div class="game-card-banner card-princess-theme glass-panel">
          <div class="card-art-col">
            <div class="art-badge">🏰 PHIÊU LƯU VƯỢT THÁP</div>
            <div class="tower-stairs-visual">
              <span class="st-icon">👑</span>
              <span class="st-icon">⭐</span>
              <span class="st-icon">🛡️</span>
              <span class="st-icon">🗝️</span>
              <span class="st-icon">🚪</span>
            </div>
          </div>
          <div class="card-details-col">
            <h3 class="card-game-title">Giải Cứu Công Chúa (姫救出 - Castle Tower Rescue)</h3>
            <p class="card-game-desc">
              Công chúa bị nhốt trên tầng 5 của Tháp Lâu Đài Phép Thuật. Vượt qua 5 cánh cổng thử thách: 
              từ mật mã chữ Hán, ổ khóa trợ từ đến sắp xếp câu tìm ngôi sao bí ẩn ★ để giải cứu nàng!
            </p>
            <div class="card-tags-row">
              <span class="gtag">Tháp 5 Tầng Phép Thuật</span>
              <span class="gtag">Mật mã ngôi sao ★</span>
              <span class="gtag">Khắc sâu mẫu câu khẳng định & phủ định</span>
            </div>
            <div class="card-action-row">
              <button type="button" class="btn btn-primary btn-game-play btn-princess" data-launch-game="princess">
                👑 Đột Kích Tháp Lâu Đài
              </button>
            </div>
          </div>
        </div>

        <!-- Game 3: Lật Thẻ Trí Nhớ Ma Thuật -->
        <div class="game-card-banner card-memory-theme glass-panel">
          <div class="card-art-col">
            <div class="art-badge">🎴 LUYỆN TRÍ NHỚ & PHẢN XẠ</div>
            <div class="memory-cards-mini-grid">
              <div class="mini-card-preview">私</div>
              <div class="mini-card-preview flip">Tôi</div>
              <div class="mini-card-preview flip">先生</div>
              <div class="mini-card-preview">Thầy</div>
            </div>
          </div>
          <div class="card-details-col">
            <h3 class="card-game-title">Lật Thẻ Trí Nhớ Ma Thuật (魔法のカード - Memory Match)</h3>
            <p class="card-game-desc">
              Thử thách trí nhớ siêu phàm! Lật các thẻ bài ma thuật để ghép đôi chính xác giữa chữ Nhật (Kanji/Kana) 
              với nghĩa tiếng Việt tương ứng. Tích hợp giọng đọc bản xứ chuẩn từng thẻ bài.
            </p>
            <div class="card-tags-row">
              <span class="gtag">12 - 16 Thẻ Bài Ma Thuật</span>
              <span class="gtag">Hiệu ứng lật 3D</span>
              <span class="gtag">Phát âm chuẩn từng từ</span>
            </div>
            <div class="card-action-row">
              <button type="button" class="btn btn-primary btn-game-play btn-memory" data-launch-game="memory">
                🎴 Thách Thức Trí Nhớ Ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// GAME 1: TIÊU DIỆT YÊU QUÁI (YOUKAI SLAYER)
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
    attackEffect: null // 'player' | 'monster'
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
      <!-- Thanh Top Bar -->
      <div class="battle-top-nav glass-panel">
        <button type="button" class="btn btn-secondary btn-sm btn-back-to-game-hub">
          ⬅ Quay lại Game Hub
        </button>
        <div class="battle-round-badge">
          <span>⚔️ Vòng ${monsterState.currentMonsterIndex + 1} / ${MONSTER_ROSTER.length}: ${monster.title}</span>
        </div>
        <div class="battle-score-pill">
          <span>Điểm: <strong>${monsterState.score}</strong></span>
          <span class="streak-tag">🔥 Combo: ${monsterState.streak}</span>
        </div>
      </div>

      <!-- Sàn Đấu Trận Chiến (Battle Stage) -->
      <div class="battle-stage-card glass-panel ${monsterState.attackEffect === 'monster' ? 'screen-shake' : ''}">
        <!-- Nhân vật Hiệp Sĩ (Bên Trái) -->
        <div class="battle-combatant player-side ${monsterState.attackEffect === 'player' ? 'player-attack-anim' : ''}">
          <div class="combatant-hp-bar-box">
            <div class="combatant-name-label">
              <span>🛡️ Hiệp Sĩ (Bạn)</span>
              <strong>${monsterState.playerHp}/${monsterState.playerMaxHp} HP</strong>
            </div>
            <div class="hp-bar-track">
              <div class="hp-bar-fill player-hp-fill" style="width: ${playerHpPct}%;"></div>
            </div>
          </div>
          <div class="combatant-sprite player-sprite">
            <span class="sprite-avatar">🤺</span>
            ${monsterState.attackEffect === 'player' ? '<div class="slash-effect">⚡ CHIÊU THỨC TRẢM!</div>' : ''}
          </div>
        </div>

        <!-- Khu vực Hiệu ứng giữa sân -->
        <div class="battle-versus-zone">
          <span class="vs-text">VS</span>
          <div class="battle-log-toast">${monsterState.battleLog}</div>
        </div>

        <!-- Quái Vật (Bên Phải) -->
        <div class="battle-combatant monster-side ${monsterState.attackEffect === 'monster' ? 'monster-attack-anim' : ''}">
          <div class="combatant-hp-bar-box">
            <div class="combatant-name-label">
              <span style="color: ${monster.color};">${monster.name}</span>
              <strong>${monsterState.monsterHp}/${monster.maxHp} HP</strong>
            </div>
            <div class="hp-bar-track">
              <div class="hp-bar-fill monster-hp-fill" style="width: ${monsterHpPct}%; background: ${monster.color};"></div>
            </div>
          </div>
          <div class="combatant-sprite monster-sprite">
            <span class="sprite-avatar monster-avatar-emoji">${monster.avatar}</span>
            ${monsterState.attackEffect === 'monster' ? `<div class="monster-hit-text">💥 ${monster.attackName}!</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Khung Câu Đố Chiến Đấu (Question Arena) -->
      ${monsterState.gameOver ? `
        <div class="battle-end-modal glass-panel game-over-box">
          <div class="end-icon">💀</div>
          <h3>HIỆP SĨ ĐÃ BỊ ĐÁNH BẠI!</h3>
          <p>Yêu quái đã cướp hết máu của bạn. Đừng nản lòng, hãy củng cố từ vựng và thử lại nhé!</p>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="retry-monster-btn">🔄 Thử Thách Lại</button>
            <button type="button" class="btn btn-secondary btn-back-to-game-hub">Quay lại Game Hub</button>
          </div>
        </div>
      ` : (monsterState.victory ? `
        <div class="battle-end-modal glass-panel victory-box">
          <div class="end-icon">🎉</div>
          <h3>XUẤT SẮC! TIÊU DIỆT HOÀN TOÀN QUÁI VẬT!</h3>
          <p>Bạn đã quét sạch 4 đại yêu quái và bảo vệ yên bình cho ngôi làng! Điểm số: <strong>${monsterState.score} EXP</strong>.</p>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="retry-monster-btn">⚔️ Chơi Lại Vòng Mới</button>
            <button type="button" class="btn btn-secondary btn-back-to-game-hub">Quay lại Game Hub</button>
          </div>
        </div>
      ` : (monsterState.monsterHp <= 0 ? `
        <div class="battle-end-modal glass-panel next-round-box">
          <div class="end-icon">💥</div>
          <h3>YÊU QUÁI ${monster.name} ĐÃ BỊ HẠ GỤC!</h3>
          <p>Chiêu thức của bạn quá mạnh mẽ! Bạn nhận được +100 điểm thưởng.</p>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="next-monster-btn">
              ➡️ Khiêu Chiến Quái Vật Tiếp Theo!
            </button>
          </div>
        </div>
      ` : `
        <div class="battle-question-deck glass-panel">
          <div class="question-deck-header">
            <span class="spell-tag">🔮 CÂU THẦN CHÚ CHIẾN ĐẤU</span>
            ${q.tts ? `
              <button type="button" class="btn-tts game-tts-btn" data-tts="${q.tts}">🔊 Nghe phát âm</button>
            ` : ''}
          </div>

          <div class="question-prompt-text">${q.prompt}</div>

          <!-- 4 Lựa chọn đòn đánh -->
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
    // Người chơi chém trúng quái vật
    const damage = 20 + monsterState.streak * 5;
    monsterState.monsterHp = Math.max(0, monsterState.monsterHp - damage);
    monsterState.streak += 1;
    monsterState.score += damage * 2;
    monsterState.attackEffect = "player";
    monsterState.battleLog = `🎯 CHÍNH XÁC! Hiệp sĩ thi triển kiếm quang chém trúng ${monster.name} gây -${damage} HP!`;

    // Nếu quái vật chết
    if (monsterState.monsterHp <= 0) {
      addGameExp(150);
      recordMonsterDefeated();
      if (monsterState.currentMonsterIndex >= MONSTER_ROSTER.length - 1) {
        monsterState.victory = true;
        monsterState.battleLog = "🎉 BẠN ĐÃ ĐÁNH BẠI ĐẠI QUỶ VƯƠNG! CHIẾN THẮNG!";
      }
    }
  } else {
    // Người chơi sai, quái vật phản công
    const damage = monster.attackPower;
    monsterState.playerHp = Math.max(0, monsterState.playerHp - damage);
    monsterState.streak = 0;
    monsterState.attackEffect = "monster";
    monsterState.battleLog = `⚠️ SAI RỒI! ${monster.name} dùng chiêu '${monster.attackName}' đánh trúng bạn gây -${damage} HP! (Đáp án đúng: ${q.options[q.correct]})`;

    if (monsterState.playerHp <= 0) {
      monsterState.gameOver = true;
      monsterState.battleLog = "💀 Bạn đã cạn kiệt sinh lực!";
    }
  }

  renderGameCenterView();

  // Reset hiệu ứng và tạo câu hỏi mới sau 1 giây
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
  // Hồi phục 30 HP cho người chơi khi qua màn
  monsterState.playerHp = Math.min(monsterState.playerMaxHp, monsterState.playerHp + 30);
  monsterState.battleLog = `Yêu quái mới ${nextMonster.name} xuất kích! Hãy cẩn thận!`;
  const vocabList = extractVocabForGame(selectedProjectId);
  monsterState.currentQuestion = generateBattleQuestion(vocabList, monsterState.currentMonsterIndex);
  renderGameCenterView();
}

// ============================================================================
// GAME 2: GIẢI CỨU CÔNG CHÚA (PRINCESS RESCUE)
// ============================================================================
function startPrincessGame() {
  currentGameMode = "princess";
  const vocabList = extractVocabForGame(selectedProjectId);

  princessState = {
    currentFloor: 1,
    maxFloors: 5,
    score: 0,
    keysCollected: 0,
    currentQuestion: generatePrincessQuestion(vocabList, 1),
    isAnswering: false,
    doorOpen: false,
    completed: false,
    feedbackText: "Cánh cổng Tầng 1 đang khóa chặt bằng bùa chú chữ Hán. Hãy giải mã chìa khóa để leo tháp!"
  };

  renderGameCenterView();
}

function renderPrincessGameHtml() {
  if (!princessState) return "";

  const floorData = PRINCESS_TOWER_FLOORS[princessState.currentFloor - 1];
  const q = princessState.currentQuestion;

  return `
    <div class="princess-rescue-container">
      <!-- Top Bar -->
      <div class="battle-top-nav glass-panel">
        <button type="button" class="btn btn-secondary btn-sm btn-back-to-game-hub">
          ⬅ Quay lại Game Hub
        </button>
        <div class="battle-round-badge princess-round">
          <span>🏰 Tầng ${princessState.currentFloor} / 5: ${floorData.name}</span>
        </div>
        <div class="battle-score-pill">
          <span>Chìa khóa vàng: <strong>${princessState.keysCollected} / 5 🗝️</strong></span>
        </div>
      </div>

      <!-- Bản Đồ Tháp Lâu Đài (Castle Tower Map) -->
      <div class="castle-tower-stage glass-panel">
        <div class="tower-roof">
          <div class="princess-box ${princessState.completed ? 'princess-free-anim' : ''}">
            <span class="princess-avatar">👸</span>
            <span class="princess-label">${princessState.completed ? 'ĐÃ ĐƯỢC CỨU! ❤️' : 'Công Chúa Đang Chờ Cứu!'}</span>
          </div>
        </div>

        <div class="tower-floors-vertical-stack">
          ${PRINCESS_TOWER_FLOORS.slice().reverse().map(fl => {
            const isCurrent = fl.floor === princessState.currentFloor;
            const isCleared = fl.floor < princessState.currentFloor || princessState.completed;
            let floorStateCls = "floor-locked";
            if (isCleared) floorStateCls = "floor-cleared";
            else if (isCurrent) floorStateCls = "floor-active";

            return `
              <div class="tower-floor-row ${floorStateCls}">
                <div class="floor-level-tag">Tầng ${fl.floor}</div>
                <div class="floor-gate-icon">${isCleared ? '🔓' : (isCurrent ? '🗝️' : '🔒')}</div>
                <div class="floor-info-box">
                  <strong>${fl.name}</strong>
                  <small>${fl.challenge}</small>
                </div>
                ${isCurrent ? '<div class="knight-pointer">🤺 Bạn đang ở đây</div>' : ''}
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Khu vực Câu Đố Phá Cổng Tầng Tháp -->
      ${princessState.completed ? `
        <div class="battle-end-modal glass-panel victory-box">
          <div class="end-icon">👸🎉</div>
          <h3>CÔNG CHÚA ĐÃ ĐƯỢC GIẢI CỨU THÀNH CÔNG!</h3>
          <p>
            Bạn đã vượt qua toàn bộ 5 tầng tháp ma thuật bằng kiến thức tiếng Nhật tuyệt vời! 
            Công chúa trao tặng bạn Vương miện Hiệp Sĩ và +300 EXP.
          </p>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="retry-princess-btn">🏰 Khiêu Chiến Lại Lâu Đài</button>
            <button type="button" class="btn btn-secondary btn-back-to-game-hub">Quay lại Game Hub</button>
          </div>
        </div>
      ` : (princessState.doorOpen ? `
        <div class="battle-end-modal glass-panel next-round-box">
          <div class="end-icon">🗝️✨</div>
          <h3>CỔNG TẦNG ${princessState.currentFloor} ĐÃ ĐƯỢC MỞ KHÓA!</h3>
          <p>${princessState.feedbackText}</p>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="next-floor-btn">
              ⬆️ Leo Lên Tầng ${princessState.currentFloor + 1}
            </button>
          </div>
        </div>
      ` : `
        <div class="battle-question-deck glass-panel">
          <div class="question-deck-header">
            <span class="spell-tag">🗝️ Ổ KHÓA MA THUẬT TẦNG ${princessState.currentFloor}</span>
            <div class="gate-hint-badge">${floorData.challenge}</div>
          </div>

          <div class="princess-feedback-banner">${princessState.feedbackText}</div>
          <div class="question-prompt-text">${q.prompt}</div>

          <!-- 4 Lựa chọn chìa khóa giải mã -->
          <div class="monster-answers-grid">
            ${q.options.map((opt, idx) => `
              <button type="button" class="monster-answer-btn tower-answer-btn" data-idx="${idx}">
                <span class="attack-num">（${idx + 1}）</span>
                <span class="attack-label">${opt}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `)}
    </div>
  `;
}

function handlePrincessAnswer(selectedIdx) {
  if (!princessState || princessState.isAnswering) return;
  princessState.isAnswering = true;

  const q = princessState.currentQuestion;
  const isCorrect = selectedIdx === q.correct;

  if (isCorrect) {
    princessState.keysCollected += 1;
    princessState.score += 50;
    princessState.doorOpen = true;
    princessState.feedbackText = `✨ CHÍNH XÁC! Chìa khóa ma thuật phát sáng và mở tung cổng Tầng ${princessState.currentFloor}!`;

    if (princessState.currentFloor >= princessState.maxFloors) {
      princessState.completed = true;
      addGameExp(250);
      recordPrincessRescued();
    }
  } else {
    princessState.feedbackText = `❌ Sai rồi! Ổ khóa chưa chịu mở. Hãy suy nghĩ kỹ và thử lại đáp án khác! (Gợi ý: ${q.hint || 'Hãy xem lại trợ từ hoặc nghĩa từ vựng'})`;
  }

  renderGameCenterView();

  setTimeout(() => {
    if (princessState) {
      princessState.isAnswering = false;
      renderGameCenterView();
    }
  }, 600);
}

function advancePrincessFloor() {
  if (!princessState) return;
  princessState.currentFloor += 1;
  princessState.doorOpen = false;
  princessState.feedbackText = `Bạn đã bước lên Tầng ${princessState.currentFloor}! Bùa chú tại đây mạnh hơn, hãy cẩn thận.`;
  const vocabList = extractVocabForGame(selectedProjectId);
  princessState.currentQuestion = generatePrincessQuestion(vocabList, princessState.currentFloor);
  renderGameCenterView();
}

// ============================================================================
// GAME 3: LẬT THẺ TRÍ NHỚ MA THUẬT (MEMORY MATCH)
// ============================================================================
function startMemoryGame() {
  currentGameMode = "memory";
  const vocabList = extractVocabForGame(selectedProjectId);

  // Chọn ngẫu nhiên 6 từ vựng để tạo thành 12 thẻ (6 cặp)
  const shuffledVocab = [...vocabList].sort(() => 0.5 - Math.random()).slice(0, 6);

  const cards = [];
  shuffledVocab.forEach((v, idx) => {
    // Thẻ mặt chữ Nhật (Kanji hoặc Hiragana)
    cards.push({
      id: `c-jp-${idx}`,
      pairId: `pair-${idx}`,
      type: "jp",
      display: v.kanji || v.hiragana,
      subDisplay: v.hiragana !== v.kanji ? v.hiragana : v.romaji,
      tts: v.hiragana || v.kanji,
      isFlipped: false,
      isMatched: false
    });
    // Thẻ mặt nghĩa tiếng Việt
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

  // Trộn bài ngẫu nhiên
  cards.sort(() => 0.5 - Math.random());

  memoryState = {
    cards,
    flippedIndices: [],
    matchedCount: 0,
    totalPairs: shuffledVocab.length,
    flips: 0,
    isLocked: false,
    startTime: Date.now(),
    elapsedSeconds: 0,
    completed: false
  };

  renderGameCenterView();
}

function renderMemoryGameHtml() {
  if (!memoryState) return "";

  return `
    <div class="memory-game-container">
      <!-- Top Bar -->
      <div class="battle-top-nav glass-panel">
        <button type="button" class="btn btn-secondary btn-sm btn-back-to-game-hub">
          ⬅ Quay lại Game Hub
        </button>
        <div class="battle-round-badge memory-badge">
          <span>🎴 Cặp đã ghép: <strong>${memoryState.matchedCount} / ${memoryState.totalPairs}</strong></span>
        </div>
        <div class="battle-score-pill">
          <span>Số lần lật: <strong>${memoryState.flips}</strong></span>
          <button type="button" class="btn btn-outline btn-sm" id="restart-memory-game-btn" style="margin-left: 8px;">
            🔄 Chia bài mới
          </button>
        </div>
      </div>

      ${memoryState.completed ? `
        <div class="battle-end-modal glass-panel victory-box" style="margin-top: 20px;">
          <div class="end-icon">🎴✨</div>
          <h3>TUYỆT VỜI! BẠN ĐÃ LẬT HẾT TẤT CẢ CÁC CẶP BÀI!</h3>
          <p>
            Trí nhớ của bạn rất xuất sắc! Bạn đã hoàn thành trò chơi chỉ với <strong>${memoryState.flips} lượt lật</strong>. 
            Bạn nhận được +120 EXP.
          </p>
          <div class="end-actions">
            <button type="button" class="btn btn-primary btn-lg" id="restart-memory-game-btn">🔄 Chơi Ván Mới</button>
            <button type="button" class="btn btn-secondary btn-back-to-game-hub">Quay lại Game Hub</button>
          </div>
        </div>
      ` : `
        <!-- Lưới Thẻ Bài 3D -->
        <div class="memory-cards-grid">
          ${memoryState.cards.map((card, idx) => {
            const isRevealed = card.isFlipped || card.isMatched;
            return `
              <div class="memory-card ${isRevealed ? 'is-flipped' : ''} ${card.isMatched ? 'is-matched' : ''}" 
                   data-card-idx="${idx}">
                <div class="memory-card-inner">
                  <!-- Mặt Úp (Lưng bài) -->
                  <div class="memory-card-back">
                    <span class="card-back-pattern">🎴</span>
                    <span class="card-back-text">MIW</span>
                  </div>
                  <!-- Mặt Ngửa (Nội dung từ vựng / Nghĩa) -->
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
      `}
    </div>
  `;
}

function handleMemoryCardFlip(cardIdx) {
  if (!memoryState || memoryState.isLocked) return;
  const card = memoryState.cards[cardIdx];
  if (!card || card.isFlipped || card.isMatched) return;

  // Lật thẻ
  card.isFlipped = true;
  memoryState.flippedIndices.push(cardIdx);

  // Phát âm từ nếu là thẻ tiếng Nhật
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
      // Đúng cặp!
      setTimeout(() => {
        card1.isMatched = true;
        card2.isMatched = true;
        memoryState.flippedIndices = [];
        memoryState.matchedCount += 1;
        memoryState.isLocked = false;

        if (memoryState.matchedCount >= memoryState.totalPairs) {
          memoryState.completed = true;
          addGameExp(120);
          recordMemoryWin();
        }
        renderGameCenterView();
      }, 500);
    } else {
      // Sai cặp, lật úp lại sau 1 giây
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        memoryState.flippedIndices = [];
        memoryState.isLocked = false;
        renderGameCenterView();
      }, 1000);
    }
  }
}

// ============================================================================
// HÀM SINH CÂU HỎI THÔNG MINH CHO CÁC TRÒ CHƠI
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

  // Hợp nhất từ vựng cơ sở để đảm bảo game luôn có đủ từ phong phú
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
      {
        prompt: "Chọn trợ từ đúng để tấn công: わたし（　　）学生です。",
        options: ["は", "も", "か", "の"],
        correct: 0,
        tts: "わたしはがくせいです"
      },
      {
        prompt: "Chọn trợ từ đồng nhất: タインさんはベトナム人です。マイさん（　　）ベトナム人です。",
        options: ["は", "も", "が", "か"],
        correct: 1,
        tts: "マイさんもベトナムじんです"
      },
      {
        prompt: "Chọn thể phủ định đúng: ミラーさんは医者（　　）。会社員です。",
        options: ["です", "じゃありません", "ですか", "もです"],
        correct: 1,
        tts: "ミラーさんはいしゃじゃありません"
      },
      {
        prompt: "Chọn câu hỏi xác nhận: あなたはエンジニア（　　）。",
        options: ["ですか", "じゃありません", "ですね", "でした"],
        correct: 0,
        tts: "あなたはエンジニアですか"
      }
    ];
    return grammarQuestions[Math.floor(Math.random() * grammarQuestions.length)];
  }

  // Dạng Từ vựng
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

function generatePrincessQuestion(vocabList, floor) {
  if (floor === 1) {
    // Tầng 1: Đọc chữ Hán
    const kanjiWords = vocabList.filter(v => v.kanji && v.kanji !== v.hiragana);
    const target = kanjiWords.length > 0 ? kanjiWords[Math.floor(Math.random() * kanjiWords.length)] : vocabList[0];
    const otherReadings = ["せんせい", "がくせい", "いしゃ", "かいしゃいん"].filter(r => r !== target.hiragana);
    const options = [target.hiragana, ...otherReadings.slice(0, 3)].sort(() => 0.5 - Math.random());
    return {
      prompt: `Chữ Hán <strong>【${target.kanji}】</strong> có cách đọc Hiragana là gì?`,
      options,
      correct: options.indexOf(target.hiragana),
      hint: `Nghĩa của từ này là '${target.meaning}'`
    };
  }

  if (floor === 2) {
    // Tầng 2: Trợ từ
    return {
      prompt: "Chọn chìa khóa trợ từ mở cổng: マイさん（　　）さくら大学の学生です。",
      options: ["は", "も", "か", "の"],
      correct: 0,
      hint: "Trợ từ đứng sau chủ ngữ trong câu khẳng định"
    };
  }

  if (floor === 3) {
    // Tầng 3: Phủ định
    return {
      prompt: "Phá giải bùa chú phủ định: あの人は先生（　　）。医者です。",
      options: ["です", "じゃありません", "ですか", "もです"],
      correct: 1,
      hint: "Thể phủ định danh từ: [Danh từ] + じゃありません"
    };
  }

  if (floor === 4) {
    // Tầng 4: Sắp xếp ngôi sao ★
    return {
      prompt: `Mật mã sắp xếp câu: わたしは　＿＿　＿＿　<strong>★</strong>　＿＿。<br>
               <small>(1. です / 2. の / 3. 学生 / 4. ハノイ大学)</small><br>
               Từ nào nằm ở vị trí ngôi sao (★)?`,
      options: ["1. です", "2. の", "3. 学生", "4. ハノイ大学"],
      correct: 2, // 4 -> 2 -> 3 (★) -> 1
      hint: "Thứ tự đúng: 4 (ハノイ大学) -> 2 (の) -> ★ 3 (学生) -> 1 (です)"
    };
  }

  // Tầng 5: Đỉnh tháp
  return {
    prompt: "Câu chào mở lồng giam: 「初めまして。どうぞ（　　）お願いします。」",
    options: ["どうも", "よろしく", "はい", "いいえ"],
    correct: 1,
    hint: "Thành ngữ: どうぞよろしくおねがいします"
  };
}

// ============================================================================
// PROFILE & TIẾN ĐỘ CHƠI GAME (STORAGE)
// ============================================================================
export function getGameProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAME_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    level: 1,
    exp: 0,
    monstersDefeated: 0,
    princessRescued: 0,
    memoryWins: 0
  };
}

export function saveGameProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY_GAME_PROFILE, JSON.stringify(profile));
  } catch (e) {}
}

export function addGameExp(amount) {
  const profile = getGameProfile();
  profile.exp = (profile.exp || 0) + amount;
  // Cứ mỗi 300 EXP thăng 1 cấp
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
